# UI SPECIFICATION - MODULE 4.13.2: KỊCH BẢN CHĂM SÓC (SEQUENCE)

> **Module:** 4.13.2 - Kịch bản chăm sóc
> **Version:** 2.0
> **Ngày cập nhật:** 08/04/2026
> **Người soạn:** Dolly (PM/BA) - ViLead CRM
> **Đối tượng:** Copilot / AI Coding Assistant / Developer (FE + BE)
> **Tham chiếu:** `KhoiBC_US_4.13.2.docx`, `KhoiBC_BR_4.13.2.drawio`

---

## MỤC LỤC

1. [Tổng quan](#1-tổng-quan)
2. [Database Schema](#2-database-schema)
3. [API Endpoints](#3-api-endpoints)
4. [TypeScript Types](#4-typescript-types)
5. [Wireframes - 8 màn hình](#5-wireframes)
6. [Component Specs](#6-component-specs)
7. [Business Rules](#7-business-rules)
8. [Testing Checklist](#8-testing-checklist)
9. [Design Tokens](#9-design-tokens)

---

## 1. TỔNG QUAN

### 1.1. Mục tiêu
Module Kịch bản chăm sóc (Sequence) là **Tầng 2** trong kiến trúc Automation của ViLead CRM, cho phép Admin xây dựng quy trình chăm sóc khách hàng tự động dựa trên sự kiện trong hệ thống.

### 1.2. Kiến trúc 2 tầng

```
┌─────────────────────────────────────────────────────────┐
│  TẦNG 1 - 4.13.1: LUỒNG TIN NHẮN (FLOW)                │
│  → NỘI DUNG + LOGIC (gửi gì, rẽ nhánh nào)             │
└─────────────────────────────────────────────────────────┘
                        ▲
                        │ THAM CHIẾU (Action 'Gửi Luồng')
                        │
┌─────────────────────────────────────────────────────────┐
│  TẦNG 2 - 4.13.2: KỊCH BẢN CHĂM SÓC (SEQUENCE) ★       │
│  → KHI NÀO + CHO AI + TRACKING                          │
└─────────────────────────────────────────────────────────┘
                        ▲
                        │ Tag liên kết 1-1, Auto Rules
                        │
┌─────────────────────────────────────────────────────────┐
│  TẦNG NỀN - 4.13.3: CẤU HÌNH AUTOMATION                │
│  → Tags global - Auto Rules - Bot Settings              │
└─────────────────────────────────────────────────────────┘
```

### 1.3. Quyết định scope (đã chốt)

| # | Hạng mục | Quyết định |
|---|---|---|
| 1 | Scope | **Global** - không gắn Pipeline |
| 2 | Phân quyền | **Chỉ Admin** |
| 3 | Re-enroll cùng KB | **Bỏ qua**, không tạo journey mới |
| 4 | Test mode | **Có** - gửi thử cho 1 KH (bỏ qua delay) |
| 5 | Báo cáo hiệu quả | **Có** - dashboard riêng |
| 6 | Frequency cap | **Không** giới hạn |
| 7 | Xóa Flow đang dùng | **Chặn xóa** + thông báo cụ thể |
| 8 | Trigger 'KH quay lại' | Theo **số ngày không tương tác** |

### 1.4. Tech stack đề xuất
- **Frontend:** React + TypeScript + TailwindCSS, drag-drop bằng `dnd-kit`
- **Backend:** Node.js / NestJS + PostgreSQL (JSONB cho snapshot)
- **Queue:** Redis (BullMQ) cho schedule step
- **Worker:** Service riêng xử lý execute step

---

## 2. DATABASE SCHEMA

### 2.1. Bảng `sequences` (Kịch bản)
```sql
CREATE TABLE sequences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'draft',
                    -- draft / active / paused
    current_version INTEGER NOT NULL DEFAULT 1,

    -- Trigger config
    trigger_type    VARCHAR(50) NOT NULL,
    trigger_config  JSONB NOT NULL DEFAULT '{}',

    -- Filter config
    filter_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
    filter_logic    VARCHAR(10),  -- 'all' (AND) / 'any' (OR)
    filter_rules    JSONB,        -- Array of {field, operator, value}

    -- Audit
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_sequences_status ON sequences(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_sequences_trigger ON sequences(trigger_type) WHERE deleted_at IS NULL;
```

### 2.2. Bảng `sequence_steps` (Các bước)
```sql
CREATE TABLE sequence_steps (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id     UUID NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
    step_order      INTEGER NOT NULL,        -- 1..20
    name            VARCHAR(100),

    -- Delay
    delay_type      VARCHAR(20) NOT NULL,    -- 'immediate' / 'wait'
    delay_value     INTEGER,
    delay_unit      VARCHAR(10),             -- 'minutes' / 'hours' / 'days'
    time_window     JSONB,                   -- {from: "08:00", to: "18:00"}

    -- Condition (optional)
    condition_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    condition_logic   VARCHAR(10),
    condition_rules   JSONB,
    on_skip_action    VARCHAR(20) DEFAULT 'continue',  -- 'continue' / 'end_journey'

    -- Action
    action_type     VARCHAR(50) NOT NULL,
    action_config   JSONB NOT NULL,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT max_steps_per_sequence CHECK (step_order BETWEEN 1 AND 20),
    CONSTRAINT unique_step_order UNIQUE (sequence_id, step_order)
);

CREATE INDEX idx_steps_sequence ON sequence_steps(sequence_id, step_order);

-- Index để query nhanh "Flow này đang được KB nào dùng?" (BR-234)
CREATE INDEX idx_steps_flow_ref ON sequence_steps((action_config->>'flow_id'))
    WHERE action_type = 'send_flow';
```

### 2.3. Bảng `sequence_snapshots` (Versioning - BR-212)
```sql
CREATE TABLE sequence_snapshots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id     UUID NOT NULL REFERENCES sequences(id),
    version         INTEGER NOT NULL,
    config_snapshot JSONB NOT NULL,  -- Full snapshot: trigger + filter + steps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_snapshot_version UNIQUE (sequence_id, version)
);

CREATE INDEX idx_snapshots_sequence_version ON sequence_snapshots(sequence_id, version);
```

### 2.4. Bảng `customer_journeys` (Journey của KH)
```sql
CREATE TABLE customer_journeys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id     UUID NOT NULL REFERENCES sequences(id),
    version_used    INTEGER NOT NULL,        -- Snapshot version
    customer_id     UUID NOT NULL REFERENCES customers(id),
    conversation_id UUID REFERENCES conversations(id),

    status          VARCHAR(20) NOT NULL,
                    -- running / completed / cancelled / failed
    current_step    INTEGER,
    total_steps     INTEGER NOT NULL,

    is_test         BOOLEAN NOT NULL DEFAULT FALSE,  -- US-09 Test mode

    enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    cancelled_at    TIMESTAMPTZ,
    cancelled_by    UUID REFERENCES users(id),
    cancel_reason   TEXT,

    triggered_by    JSONB,  -- {trigger_type, event_data}

    CONSTRAINT chk_journey_status CHECK (status IN ('running','completed','cancelled','failed'))
);

CREATE INDEX idx_journeys_customer ON customer_journeys(customer_id);
CREATE INDEX idx_journeys_sequence_status ON customer_journeys(sequence_id, status);

-- Index để check re-enroll nhanh (BR-203)
CREATE INDEX idx_journeys_running ON customer_journeys(sequence_id, customer_id)
    WHERE status = 'running' AND is_test = FALSE;
```

### 2.5. Bảng `journey_step_logs` (Log từng step)
```sql
CREATE TABLE journey_step_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_id      UUID NOT NULL REFERENCES customer_journeys(id) ON DELETE CASCADE,
    step_order      INTEGER NOT NULL,
    step_name       VARCHAR(100),

    status          VARCHAR(20) NOT NULL,
                    -- pending / scheduled / running / completed / skipped / failed
    scheduled_at    TIMESTAMPTZ,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,

    skipped_reason  TEXT,
    error_message   TEXT,
    retry_count     INTEGER NOT NULL DEFAULT 0,

    action_type     VARCHAR(50),
    action_result   JSONB,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_step_logs_journey ON journey_step_logs(journey_id, step_order);
```

### 2.6. Bảng `sequence_reports_daily` (Materialized cho báo cáo - US-14)
```sql
CREATE TABLE sequence_reports_daily (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id     UUID NOT NULL REFERENCES sequences(id),
    report_date     DATE NOT NULL,

    total_enrolled  INTEGER NOT NULL DEFAULT 0,
    completed       INTEGER NOT NULL DEFAULT 0,
    cancelled_auto  INTEGER NOT NULL DEFAULT 0,
    cancelled_manual INTEGER NOT NULL DEFAULT 0,
    failed          INTEGER NOT NULL DEFAULT 0,

    -- Conversion: KH có đơn hàng mới trong 30 ngày sau enroll
    converted_orders   INTEGER NOT NULL DEFAULT 0,
    conversion_revenue NUMERIC(15,2) NOT NULL DEFAULT 0,

    -- Drop-off per step
    step_dropoff    JSONB,  -- [{step_order, entered, completed, skipped, dropped}]

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_seq_date UNIQUE (sequence_id, report_date)
);

CREATE INDEX idx_reports_seq_date ON sequence_reports_daily(sequence_id, report_date DESC);
```

---

## 3. API ENDPOINTS

### 3.1. Sequences CRUD

#### `GET /api/automation/sequences`
**Query params:**
```typescript
{
  search?: string;
  status?: 'all' | 'draft' | 'active' | 'paused';
  trigger_type?: string;
  page?: number;       // default 1
  limit?: number;      // default 20
  sort_by?: 'name' | 'created_at' | 'customers_count';
  sort_order?: 'asc' | 'desc';
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "sequences": [
      {
        "id": "uuid",
        "name": "Chăm sóc KH mới",
        "status": "active",
        "trigger": { "type": "first_message", "label": "KH nhắn tin lần đầu" },
        "steps_count": 5,
        "stats": { "running": 45, "completed": 100, "cancelled": 11 },
        "created_at": "2026-04-01T10:00:00Z",
        "created_by": { "id": "uuid", "name": "Admin" }
      }
    ],
    "pagination": { "total": 12, "page": 1, "limit": 20, "total_pages": 1 }
  }
}
```

#### `POST /api/automation/sequences`
**Body:**
```json
{
  "name": "Chăm sóc KH mới",
  "description": "Tự động chăm sóc sau lần nhắn tin đầu",
  "trigger_type": "first_message"
}
```
**Response:** `201 Created` - Trả về sequence vừa tạo (`status='draft'`, `version=1`)

**Errors:**
- `409 SEQUENCE_NAME_DUPLICATE` - Tên KB đã tồn tại
- `400 INVALID_TRIGGER_TYPE` - Trigger không hợp lệ

#### `GET /api/automation/sequences/:id`
Trả về full detail bao gồm trigger config, filter, steps[], stats.

#### `PUT /api/automation/sequences/:id`
Cập nhật KB. Nếu KB Active và có thay đổi → tăng `current_version` + tạo snapshot mới.

**Errors:**
- `403 CANNOT_CHANGE_TRIGGER_TYPE` - Không đổi loại trigger khi đã có KH chạy

#### `PATCH /api/automation/sequences/:id/status`
**Body:** `{ "status": "active" | "paused" | "draft" }`

**Errors:**
- `400 SEQUENCE_NO_STEPS` - Kịch bản phải có ít nhất 1 step
- `400 SEQUENCE_NO_TRIGGER_CONFIG` - Trigger chưa được cấu hình

#### `DELETE /api/automation/sequences/:id`
**Body:** `{ "running_journeys_action": "cancel_all" | "wait_complete" }`

Soft delete. Nếu có KH đang chạy → xử lý theo lựa chọn.

#### `POST /api/automation/sequences/:id/duplicate`
**Body:** `{ "new_name": "..." }` - Tạo bản sao ở trạng thái Draft.

### 3.2. Steps API

#### `POST /api/automation/sequences/:id/steps`
**Body:**
```json
{
  "name": "Gửi tin chào mừng",
  "delay": { "type": "immediate" },
  "condition": null,
  "action": {
    "type": "send_flow",
    "config": { "flow_id": "uuid" }
  }
}
```

#### `PUT /api/automation/sequences/:id/steps/:step_id`
Cập nhật step.

#### `DELETE /api/automation/sequences/:id/steps/:step_id`
Xóa step. Cảnh báo nếu KB Active có KH đang ở step này.

#### `PATCH /api/automation/sequences/:id/steps/reorder`
**Body:** `{ "step_ids": ["uuid1", "uuid2", "uuid3"] }` - Sắp xếp lại thứ tự.

### 3.3. Test Mode (US-09)

#### `POST /api/automation/sequences/:id/test`
**Body:**
```json
{
  "customer_id": "uuid",
  "confirmed": true
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "test_journey_id": "uuid",
    "message": "Đã gửi thử thành công cho Nguyễn Văn A",
    "view_url": "/automation/sequences/{id}/journeys/{test_journey_id}"
  }
}
```
**Logic:** Tạo journey với `is_test=true`, bỏ qua delay, chạy tuần tự ngay.

### 3.4. Journeys API

#### `GET /api/automation/sequences/:id/journeys`
**Query:** `{ status?, search?, is_test?, page?, limit? }`

#### `GET /api/automation/journeys/:journey_id`
Chi tiết journey + step logs.

#### `POST /api/automation/journeys/:journey_id/cancel`
**Body:** `{ "reason": "..." }` - Hủy journey thủ công.

### 3.5. Reports API (US-14)

#### `GET /api/automation/sequences/:id/report`
**Query:** `{ from: '2026-03-01', to: '2026-04-01' }`

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_enrolled": 320,
      "running": 45,
      "completed": 240,
      "cancelled_auto": 20,
      "cancelled_manual": 15,
      "completion_rate": 75.0,
      "conversion": { "orders_count": 80, "revenue": 24000000, "rate": 25.0 }
    },
    "step_funnel": [
      { "step_order": 1, "name": "Gửi chào mừng", "entered": 320, "completed": 318, "skipped": 0, "dropped": 2 },
      { "step_order": 2, "name": "Gắn tag", "entered": 318, "completed": 318, "skipped": 0, "dropped": 0 },
      { "step_order": 3, "name": "Gửi ưu đãi", "entered": 318, "completed": 280, "skipped": 30, "dropped": 8 }
    ],
    "timeline": [
      { "date": "2026-04-01", "enrolled": 12, "completed": 8, "cancelled": 1 }
    ]
  }
}
```

#### `GET /api/automation/sequences/:id/report/export`
Xuất Excel/PDF.

### 3.6. Cross-module API (US-15)

#### `GET /api/flows/:flow_id/usage`
Check Flow đang được KB nào dùng. Backend dùng khi xóa Flow.

**Response:**
```json
{
  "success": true,
  "data": {
    "is_used": true,
    "usage_count": 3,
    "sequences": [
      {
        "sequence_id": "uuid",
        "sequence_name": "Chăm sóc KH mới",
        "step_order": 1,
        "step_name": "Gửi tin chào mừng",
        "sequence_status": "active"
      }
    ]
  }
}
```

**Error khi xóa Flow đang dùng:** `409 FLOW_IN_USE_BY_SEQUENCES`

---

## 4. TYPESCRIPT TYPES

```typescript
// ============ ENUMS ============
export type SequenceStatus = 'draft' | 'active' | 'paused';
export type JourneyStatus = 'running' | 'completed' | 'cancelled' | 'failed';
export type StepLogStatus = 'pending' | 'scheduled' | 'running' | 'completed' | 'skipped' | 'failed';

export type TriggerType =
  | 'conversation_synced'
  | 'first_message'
  | 'returning_customer'
  | 'new_order'
  | 'order_status_changed'
  | 'order_completed'
  | 'order_cancelled'
  | 'customer_birthday'
  | 'no_interaction'
  | 'lead_assigned'
  | 'tag_added'
  | 'tag_removed'
  | 'scheduled';

export type ActionType =
  | 'send_flow'
  | 'assign_tags'
  | 'remove_tags'
  | 'create_task'
  | 'create_reminder'
  | 'pause_bot'
  | 'resume_bot'
  | 'enroll_sequence'
  | 'cancel_sequence';

// ============ TRIGGER CONFIGS ============
export interface TriggerConfigFirstMessage {
  channels: ('zalo_oa' | 'zalo_personal' | 'facebook')[];
}
export interface TriggerConfigReturningCustomer {
  inactive_days: number;  // 1-365
  channels: string[];
}
export interface TriggerConfigBirthday {
  mode: 'on_day' | 'before_x_days';
  days_before?: number;
}
export interface TriggerConfigScheduled {
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;       // "HH:MM"
  day_of_week?: number;
  day_of_month?: number;
}

// ============ FILTER ============
export interface FilterRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'between' | 'has' | 'not_has';
  value: string | number | string[] | { from: number; to: number };
}
export interface SequenceFilter {
  enabled: boolean;
  logic: 'all' | 'any';
  rules: FilterRule[];
}

// ============ STEP ============
export interface StepDelay {
  type: 'immediate' | 'wait';
  value?: number;
  unit?: 'minutes' | 'hours' | 'days';
  time_window?: { from: string; to: string };
}

export interface StepCondition {
  enabled: boolean;
  logic: 'all' | 'any';
  rules: FilterRule[];
  on_skip: 'continue' | 'end_journey';
}

// Action config (chia theo loại)
export interface ActionConfigSendFlow { flow_id: string; }
export interface ActionConfigAssignTags { tag_ids: string[]; }
export interface ActionConfigCreateTask {
  title: string;
  description?: string;
  assign_to: 'specific_user' | 'lead_owner';
  user_id?: string;
  deadline_value: number;
  deadline_unit: 'hours' | 'days';
}
export interface ActionConfigPauseBot { duration_minutes: number; }
export interface ActionConfigEnrollSequence { sequence_id: string; }

export interface SequenceStep {
  id: string;
  step_order: number;
  name?: string;
  delay: StepDelay;
  condition: StepCondition | null;
  action: { type: ActionType; config: any };
}

// ============ SEQUENCE ============
export interface Sequence {
  id: string;
  name: string;
  description?: string;
  status: SequenceStatus;
  current_version: number;
  trigger: { type: TriggerType; config: any };
  filter: SequenceFilter;
  steps: SequenceStep[];
  stats: {
    total_customers: number;
    running: number;
    completed: number;
    cancelled: number;
  };
  created_by: { id: string; name: string };
  created_at: string;
  updated_at: string;
}

// ============ JOURNEY ============
export interface CustomerJourney {
  id: string;
  sequence_id: string;
  version_used: number;
  customer: { id: string; name: string; phone: string; channel: string };
  status: JourneyStatus;
  current_step: number;
  total_steps: number;
  is_test: boolean;
  enrolled_at: string;
  completed_at?: string;
  cancelled_at?: string;
  cancel_reason?: string;
  step_logs: JourneyStepLog[];
}

export interface JourneyStepLog {
  id: string;
  step_order: number;
  step_name?: string;
  status: StepLogStatus;
  scheduled_at?: string;
  completed_at?: string;
  skipped_reason?: string;
  error_message?: string;
  action_type: ActionType;
  action_result?: any;
}

// ============ REPORT ============
export interface SequenceReport {
  summary: {
    total_enrolled: number;
    running: number;
    completed: number;
    cancelled_auto: number;
    cancelled_manual: number;
    completion_rate: number;
    conversion: {
      orders_count: number;
      revenue: number;
      rate: number;
    };
  };
  step_funnel: Array<{
    step_order: number;
    name: string;
    entered: number;
    completed: number;
    skipped: number;
    dropped: number;
  }>;
  timeline: Array<{
    date: string;
    enrolled: number;
    completed: number;
    cancelled: number;
  }>;
}

// ============ FLOW USAGE (Cross-module) ============
export interface FlowUsage {
  is_used: boolean;
  usage_count: number;
  sequences: Array<{
    sequence_id: string;
    sequence_name: string;
    step_order: number;
    step_name?: string;
    sequence_status: SequenceStatus;
  }>;
}
```

---

## 5. WIREFRAMES

### 5.1. Màn hình 1: Danh sách Kịch bản

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  Cài đặt > Automation > Kịch bản chăm sóc                                       │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Kịch bản chăm sóc                                       [+ Tạo Kịch bản mới]   │
│  Tự động hóa quy trình chăm sóc khách hàng                                      │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │ 🔍 Tìm kiếm tên KB...    [Trạng thái ▼] [Loại Trigger ▼] [Sắp xếp ▼]      │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │ Tên KB              │ Trigger      │ Steps │ Đang  │ Hoàn   │ Trạng │ ⋮  │ │
│  │                     │              │       │ chạy  │ thành  │ thái  │    │ │
│  ├─────────────────────┼──────────────┼───────┼───────┼────────┼───────┼────┤ │
│  │ ⭐ Chăm sóc KH mới  │ KH nhắn lần  │   5   │  45   │  100   │ 🟢 ON │ ⋮  │ │
│  │ Tạo: 01/04/2026     │ đầu          │       │       │        │       │    │ │
│  ├─────────────────────┼──────────────┼───────┼───────┼────────┼───────┼────┤ │
│  │ 🎂 Sinh nhật KH     │ Sinh nhật KH │   3   │  12   │  80    │ 🟢 ON │ ⋮  │ │
│  ├─────────────────────┼──────────────┼───────┼───────┼────────┼───────┼────┤ │
│  │ 📦 Sau đơn hàng     │ Đơn hoàn     │   4   │   8   │  150   │ 🟡 OFF│ ⋮  │ │
│  │                     │ thành        │       │       │        │       │    │ │
│  ├─────────────────────┼──────────────┼───────┼───────┼────────┼───────┼────┤ │
│  │ 💎 Chăm sóc VIP     │ Gắn Tag VIP  │   6   │   3   │  25    │ ⚪DRAFT│ ⋮  │ │
│  └─────────────────────┴──────────────┴───────┴───────┴────────┴───────┴────┘ │
│                                                                                  │
│  Hiển thị 1-4 / 12               < 1  >                                         │
└──────────────────────────────────────────────────────────────────────────────────┘

Menu (⋮):
┌────────────────────┐
│ 👁️  Xem chi tiết   │
│ 📋  Sao chép       │
│ ⏯️  Bật/Tắt        │
│ ─────────────────  │
│ 🗑️  Xóa            │
└────────────────────┘
```

### 5.2. Màn hình 2: Modal Tạo KB mới

```
┌─────────────────────────────────────────────────┐
│  Tạo Kịch bản chăm sóc mới                  ✕  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Tên Kịch bản *                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ VD: Chăm sóc KH mới                     │    │
│  └─────────────────────────────────────────┘    │
│  ⚠️ Tên không được trùng                        │
│                                                 │
│  Mô tả                                          │
│  ┌─────────────────────────────────────────┐    │
│  │                                         │    │
│  │                                         │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  Loại Trigger *                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ -- Chọn trigger --                   ▼  │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ▾ Hội thoại                                    │
│    ◯ Hội thoại mới được đồng bộ                 │
│    ◯ KH nhắn tin lần đầu                        │
│    ◯ KH quay lại                                │
│  ▾ Đơn hàng                                     │
│    ◯ Đơn hàng mới                               │
│    ...                                          │
│                                                 │
│  ─────────────────────────────────────────────  │
│                            [Hủy]  [Tạo Kịch bản]│
└─────────────────────────────────────────────────┘
```

### 5.3. Màn hình 3: Chi tiết KB - Tab Cấu hình

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  ← Quay lại │ Chăm sóc KH mới (v2) 🟢 Đang chạy    [🧪 Gửi thử] [⏯ Tạm dừng]  │
│             │ Tạo bởi Admin · 01/04/2026                                         │
├──────────────────────────────────────────────────────────────────────────────────┤
│  [Cấu hình] [Khách hàng tham gia (156)] [Báo cáo]                              │
│  ════════                                                                        │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─ ① TRIGGER ─────────────────────────────────────────────────────────────┐   │
│  │ Loại: KH nhắn tin lần đầu                                               │   │
│  │ Kênh áp dụng: ☑ Zalo OA  ☑ Zalo cá nhân  ☐ Facebook                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌─ ② ĐIỀU KIỆN LỌC KH ────────────────────────────────────────────────────┐   │
│  │ [🔘] Áp dụng điều kiện lọc                                              │   │
│  │                                                                          │   │
│  │ Logic: Thỏa mãn TẤT CẢ ▼                                                │   │
│  │                                                                          │   │
│  │ ┌──────────────────────────────────────────────────────────────────┐   │   │
│  │ │ [Tags ▼] [có ▼] [VIP, Khách mới ▼]                          [✕]│   │   │
│  │ └──────────────────────────────────────────────────────────────────┘   │   │
│  │ ┌──────────────────────────────────────────────────────────────────┐   │   │
│  │ │ [Số đơn ▼] [lớn hơn ▼] [0]                                  [✕]│   │   │
│  │ └──────────────────────────────────────────────────────────────────┘   │   │
│  │ [+ Thêm điều kiện]                                                      │   │
│  │                                                                          │   │
│  │ Preview: Sẽ enroll KH có Tags VIP/Khách mới VÀ Số đơn > 0               │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌─ ③ CÁC BƯỚC THỰC HIỆN (3/20) ──────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │  ┌────────────────────────────────────────────────────────────────┐    │   │
│  │  │ ⠿ STEP 1: Gửi tin chào mừng                            [⋮]    │    │   │
│  │  │   ⏱  Ngay lập tức                                              │    │   │
│  │  │   📨 Gửi Luồng "Chào mừng KH mới"                             │    │   │
│  │  └────────────────────────────────────────────────────────────────┘    │   │
│  │                              │                                          │   │
│  │  ┌────────────────────────────────────────────────────────────────┐    │   │
│  │  │ ⠿ STEP 2: Gắn tag KH mới                               [⋮]    │    │   │
│  │  │   ⏱  Sau 1 ngày                                                │    │   │
│  │  │   🏷️  Gắn tag "Khách hàng mới"                                │    │   │
│  │  └────────────────────────────────────────────────────────────────┘    │   │
│  │                              │                                          │   │
│  │  ┌────────────────────────────────────────────────────────────────┐    │   │
│  │  │ ⠿ STEP 3: Tin ưu đãi VIP                               [⋮]    │    │   │
│  │  │   ⏱  Sau 2 ngày, khung giờ 08:00-18:00                         │    │   │
│  │  │   🎯 Nếu có tag VIP                                            │    │   │
│  │  │   📨 Gửi Luồng "Ưu đãi đặc biệt"                              │    │   │
│  │  └────────────────────────────────────────────────────────────────┘    │   │
│  │                              │                                          │   │
│  │                       [+ Thêm bước]                                     │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 5.4. Màn hình 4: Modal Cấu hình Step

```
┌─────────────────────────────────────────────────────────┐
│  Cấu hình Step 3                                    ✕  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Tên bước (tùy chọn)                                    │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Gửi tin ưu đãi VIP                              │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ─── ⏱ THỜI GIAN CHỜ ──────────────────────────────    │
│                                                         │
│  ◯ Ngay lập tức                                         │
│  ◉ Chờ sau:  [2    ] [ngày    ▼]                        │
│                                                         │
│  ☑ Chỉ thực hiện trong khung giờ                       │
│     Từ [08:00] đến [18:00]                              │
│                                                         │
│  ─── 🎯 ĐIỀU KIỆN THỰC HIỆN ───────────────────────    │
│                                                         │
│  [🔘] Áp dụng điều kiện                                 │
│                                                         │
│  Logic: Thỏa mãn TẤT CẢ ▼                               │
│  ┌──────────────────────────────────────────────┐       │
│  │ [Tags ▼] [có ▼] [VIP ▼]                  [✕]│       │
│  └──────────────────────────────────────────────┘       │
│  [+ Thêm điều kiện]                                     │
│                                                         │
│  Khi không thỏa điều kiện:                              │
│  ◉ Bỏ qua step, tiếp tục step sau                       │
│  ◯ Bỏ qua step, kết thúc kịch bản                       │
│                                                         │
│  ─── ⚡ HÀNH ĐỘNG ─────────────────────────────────    │
│                                                         │
│  Loại action *                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Gửi Luồng tin nhắn                          ▼   │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  Chọn Luồng *                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Ưu đãi đặc biệt (Published)                ▼    │    │
│  └─────────────────────────────────────────────────┘    │
│  📋 Preview Luồng: 3 messages, 2 nút bấm                │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                              [Hủy]  [Lưu Step]         │
└─────────────────────────────────────────────────────────┘
```

### 5.5. Màn hình 5: Modal Test Mode (US-09)

```
┌─────────────────────────────────────────────────────┐
│  🧪 Gửi thử Kịch bản                            ✕  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  KB: Chăm sóc KH mới (3 steps)                      │
│                                                     │
│  Chọn khách hàng để gửi thử *                       │
│  ┌─────────────────────────────────────────────┐    │
│  │ 🔍 Tên / SĐT / Email...                     │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  KH đã chọn:                                        │
│  ┌─────────────────────────────────────────────┐    │
│  │ 👤 Nguyễn Văn A                             │    │
│  │ 📱 0901234567 · Zalo OA                     │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─ ⚠️ CẢNH BÁO ─────────────────────────────┐     │
│  │ Tin nhắn sẽ được gửi THẬT cho khách hàng. │     │
│  │ Toàn bộ delay sẽ bị BỎ QUA, các steps    │     │
│  │ chạy tuần tự ngay lập tức.                │     │
│  │                                            │     │
│  │ Test journey không tính vào báo cáo.      │     │
│  └────────────────────────────────────────────┘     │
│                                                     │
│  ☑ Tôi đã đọc và xác nhận                          │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                          [Hủy]  [🚀 Gửi thử]       │
└─────────────────────────────────────────────────────┘
```

### 5.6. Màn hình 6: Tab Khách hàng tham gia

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  [Cấu hình] [Khách hàng tham gia (156)] [Báo cáo]                              │
│             ═══════════════════════                                              │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Tổng: 156 KH | 🟢 Đang chạy: 45 | ✓ Hoàn thành: 100 | ✕ Đã hủy: 11           │
│                                                                                  │
│  [Trạng thái: Tất cả ▼]  [🔍 Tìm KH...]                                         │
│                                                                                  │
│  ┌──────────────────┬────────┬───────────┬───────┬──────────────┬───┐          │
│  │ Khách hàng       │ Kênh   │ Vào lúc   │ Step  │ Trạng thái   │ ⋮ │          │
│  ├──────────────────┼────────┼───────────┼───────┼──────────────┼───┤          │
│  │ 👤 Nguyễn Văn A  │ Zalo   │ 01/04     │ 4/5   │ ⏳ Đang chờ  │ ⋮ │          │
│  │    0901234567    │ OA     │ 10:00     │       │              │   │          │
│  ├──────────────────┼────────┼───────────┼───────┼──────────────┼───┤          │
│  │ 👤 Trần Thị B    │ FB     │ 02/04     │ 3/5   │ ▶️ Đang chạy │ ⋮ │          │
│  ├──────────────────┼────────┼───────────┼───────┼──────────────┼───┤          │
│  │ 👤 Lê Văn C      │ Zalo   │ 28/03     │ 5/5   │ ✓ Hoàn thành │ ⋮ │          │
│  ├──────────────────┼────────┼───────────┼───────┼──────────────┼───┤          │
│  │ 👤 Phạm Thị D 🧪 │ Zalo   │ 03/04     │ 5/5   │ ✓ TEST       │ ⋮ │          │
│  ├──────────────────┼────────┼───────────┼───────┼──────────────┼───┤          │
│  │ 👤 Hoàng Văn E   │ Zalo   │ 25/03     │ 2/5   │ ✕ Đã hủy     │ ⋮ │          │
│  └──────────────────┴────────┴───────────┴───────┴──────────────┴───┘          │
│                                                                                  │
│  Hiển thị 1-5 / 156          < 1 2 3 ... 32 >                                  │
└──────────────────────────────────────────────────────────────────────────────────┘

Menu (⋮):
┌────────────────────────┐
│ 👁️  Xem chi tiết       │
│ ────────────────────── │
│ ✕  Hủy KH khỏi KB     │
└────────────────────────┘
```

### 5.7. Màn hình 7: Modal Journey Detail

```
┌─────────────────────────────────────────────────────────────────────┐
│  Chi tiết Journey                                              ✕   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ 👤 Nguyễn Văn A                                               │ │
│  │ 📱 0901234567 · Zalo OA                                       │ │
│  │ ─────────────────────────────────────────────────────────── │ │
│  │ KB: Chăm sóc KH mới (Version 2)                               │ │
│  │ Vào lúc: 01/04/2026 10:00                                     │ │
│  │ Trạng thái: ⏳ Đang chờ Step 4                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  TIMELINE:                                                          │
│  ════════════════════════════════════════════════════════════════  │
│                                                                     │
│  ✓ Step 1: Gửi tin chào mừng                01/04 10:00            │
│    └─ Delay: Ngay lập tức                                          │
│    └─ Action: Gửi Luồng "Chào mừng KH mới" ✓                       │
│                                                                     │
│  ✓ Step 2: Gắn tag                          02/04 10:00            │
│    └─ Delay: 1 ngày                                                │
│    └─ Action: Gắn Tag "Khách hàng mới" ✓                           │
│                                                                     │
│  ⊘ Step 3: Gửi tin VIP                      03/04 09:15            │
│    └─ Delay: 1 ngày                                                │
│    └─ Điều kiện: KH có tag VIP → KHÔNG THỎA                        │
│    └─ Kết quả: Đã bỏ qua                                           │
│                                                                     │
│  ⏳ Step 4: Tạo reminder                    Dự kiến: 05/04 10:00   │
│    └─ Delay: 2 ngày                                                │
│    └─ Action: Tạo Nhắc nhở                                         │
│    └─ Trạng thái: Đang chờ                                         │
│                                                                     │
│  ○ Step 5: Gửi tin tổng kết                                        │
│    └─ Delay: 3 ngày                                                │
│    └─ Action: Gửi Luồng "Tổng kết"                                │
│    └─ Trạng thái: Chưa đến lượt                                    │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                              [✕ Hủy KH khỏi KB]  [Đóng]            │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.8. Màn hình 8: Modal Chặn xóa Flow (US-15)

```
┌──────────────────────────────────────────────────────────┐
│  ⚠️  Không thể xóa Luồng tin nhắn                    ✕  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Luồng "Chào mừng KH mới" đang được sử dụng trong        │
│  3 Kịch bản chăm sóc:                                    │
│                                                          │
│  ┌────────────────────────────────────────────────┐      │
│  │ 🔗 Chăm sóc KH mới                             │      │
│  │    Step 1 · 🟢 Đang chạy                       │      │
│  ├────────────────────────────────────────────────┤      │
│  │ 🔗 Chào mừng VIP                               │      │
│  │    Step 2 · 🟢 Đang chạy                       │      │
│  ├────────────────────────────────────────────────┤      │
│  │ 🔗 Tự động chào lead                           │      │
│  │    Step 1 · 🟡 Tạm dừng                        │      │
│  └────────────────────────────────────────────────┘      │
│                                                          │
│  Vui lòng gỡ Luồng khỏi các Kịch bản trên hoặc          │
│  xóa Kịch bản trước khi xóa Luồng.                       │
│                                                          │
│  ────────────────────────────────────────────────────    │
│                                              [Đã hiểu]   │
└──────────────────────────────────────────────────────────┘
```

---

## 6. COMPONENT SPECS

### 6.1. SequenceListPage
```typescript
interface SequenceListPageProps {}

// State
const [sequences, setSequences] = useState<Sequence[]>([]);
const [filters, setFilters] = useState({ search: '', status: 'all', trigger_type: '' });
const [pagination, setPagination] = useState({ page: 1, limit: 20 });
const [loading, setLoading] = useState(false);

// Actions
- fetchSequences() - debounced 300ms
- handleStatusToggle(seqId, newStatus)
- handleDuplicate(seqId)
- handleDelete(seqId)
- handleCreate() // mở CreateSequenceModal
```

### 6.2. SequenceDetailPage
```typescript
interface SequenceDetailPageProps {
  sequenceId: string;
}

// Tabs
type TabKey = 'config' | 'customers' | 'report';
const [activeTab, setActiveTab] = useState<TabKey>('config');

// Sub-components
- TriggerConfigSection
- FilterBuilderSection
- StepsTimelineSection (drag-drop với @dnd-kit)
- CustomersTab
- ReportTab
```

### 6.3. StepCard
```typescript
interface StepCardProps {
  step: SequenceStep;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

// Hiển thị: STT, Tên, Delay summary, Action summary
// Drag handle ⠿ ở góc trái
// Menu (⋮) ở góc phải: Sửa / Sao chép / Xóa
```

### 6.4. ConditionBuilder (dùng chung cho Filter và Step Condition)
```typescript
interface ConditionBuilderProps {
  enabled: boolean;
  logic: 'all' | 'any';
  rules: FilterRule[];
  onChange: (data: SequenceFilter) => void;
  availableFields: FieldOption[]; // Khác nhau giữa Filter (KH) và Step (current state)
}
```

### 6.5. TestModeModal
```typescript
interface TestModeModalProps {
  sequenceId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (testJourneyId: string) => void;
}

// State
const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
const [confirmed, setConfirmed] = useState(false);

// Disable nút "Gửi thử" cho đến khi chọn KH + tick checkbox
```

### 6.6. ReportTab
```typescript
interface ReportTabProps {
  sequenceId: string;
}

// Sub-components
- DateRangeFilter (7d / 30d / 90d / custom)
- SummaryCards (6 metrics)
- StepFunnelChart (recharts FunnelChart)
- TimelineChart (recharts LineChart + StackedBarChart)
- ExportButton (Excel / PDF)
```

---

## 7. BUSINESS RULES

| BR ID | Nội dung | Áp dụng tại |
|---|---|---|
| BR-201 | KB là dữ liệu global, không gắn Pipeline | DB schema, API |
| BR-202 | Chỉ Admin có quyền truy cập module Automation | Middleware permission |
| BR-203 | KH đang trong KB A → trigger lại KB A: bỏ qua | Enrollment service |
| BR-204 | KB mới luôn ở trạng thái 'Bản nháp' | POST sequences |
| BR-205 | Trigger 'KH quay lại' / 'Không tương tác': 1-365 ngày | Validation trigger config |
| BR-206 | Tag liên kết 1-1 với KB (đồng bộ 4.13.3) | Tag-Sequence binding |
| BR-207 | Không đổi loại Trigger sau khi KB có KH chạy | PUT sequence |
| BR-208 | Điều kiện lọc đánh giá ngay sau trigger | Enrollment service |
| BR-209 | Filter Tắt → enroll tất cả KH thỏa trigger | Enrollment service |
| BR-210 | Tối đa 20 steps trong 1 KB | DB constraint + validation |
| BR-211 | KB phải có ≥1 Step để Active | PATCH status |
| BR-212 | Sửa KB Active → tạo version mới + snapshot | PUT sequence |
| BR-213 | Step delay: Ngay lập tức hoặc 1 phút - 365 ngày | Validation |
| BR-214 | Khung giờ thực hiện áp dụng riêng từng step | Worker scheduling |
| BR-215 | Điều kiện Step đánh giá tại thời điểm step sắp chạy | Worker execution |
| BR-216 | Step không thỏa điều kiện được log status 'skipped' | Step log |
| BR-217 | Action 'Gửi Luồng' chỉ chọn Flow đã Published | Validation action |
| BR-218 | Action 'Đăng ký KB khác' check loop | Validation + warning |
| BR-219 | Flow đang được KB tham chiếu → Chặn xóa | DELETE flow API |
| BR-220 | Test journey đánh dấu is_test=true, không tính báo cáo | Test mode |
| BR-221 | Test bỏ qua delay, các action khác thực hiện thật | Worker test mode |
| BR-222 | Test chạy được trên cả KB Bản nháp và KB Active | Test API |
| BR-223 | KB phải có ≥1 step + trigger configured để Active | Validation |
| BR-224 | Tạm dừng KB chỉ ngừng enroll mới, KH cũ chạy tiếp | PATCH status |
| BR-225 | Sao chép KB tạo bản nháp mới, không kèm KH | POST duplicate |
| BR-226 | Xóa KB là soft delete | DELETE sequence |
| BR-227 | Journey lưu snapshot version tại thời điểm enroll | Enrollment |
| BR-228 | Step log lưu đầy đủ status, lý do, action result | Worker logging |
| BR-229 | Hủy thủ công lưu cancel_reason và cancelled_by | Cancel API |
| BR-230 | KH bị hủy có thể được enroll lại | Enrollment check |
| BR-231 | Báo cáo tính từ snapshot tại thời điểm enroll | Report service |
| BR-232 | Test journey không tính vào báo cáo | Report query |
| BR-233 | Conversion tracking trong 30 ngày sau enroll | Report calculation |
| BR-234 | Chặn xóa Flow nếu có KB tham chiếu | DELETE flow API |
| BR-235 | Cảnh báo (không chặn) khi Unpublish Flow đang dùng | PATCH flow status |
| BR-236 | Cross-module rule: 4.13.1 ↔ 4.13.2 | Service layer |

---

## 8. TESTING CHECKLIST

### 8.1. Functional Tests

| ID | Test Case | Expected | Priority |
|---|---|---|---|
| TC-01 | Tạo KB mới với tên hợp lệ | Tạo thành công, status='draft' | High |
| TC-02 | Tạo KB với tên trùng | Lỗi 409 SEQUENCE_NAME_DUPLICATE | High |
| TC-03 | Active KB không có step | Lỗi 400 SEQUENCE_NO_STEPS | High |
| TC-04 | Active KB có 1 step + trigger | Active thành công | High |
| TC-05 | Trigger KB cho KH lần 1 | Tạo journey mới | High |
| TC-06 | Trigger KB cho KH đang trong journey running | Bỏ qua, không tạo journey mới | High |
| TC-07 | KH trigger KB sau khi journey cũ completed | Tạo journey mới | Medium |
| TC-08 | Sửa KB Active → kiểm tra version | current_version tăng, snapshot mới | High |
| TC-09 | KH cũ trong KB sửa → vẫn chạy snapshot cũ | Không bị áp config mới | Critical |
| TC-10 | Test mode gửi thử cho 1 KH | Bỏ qua delay, gửi tin thật, is_test=true | High |
| TC-11 | Báo cáo không hiện test journey | Test journey không count vào metrics | High |
| TC-12 | Xóa Flow đang được KB dùng | Lỗi 409, hiện danh sách KB | Critical |
| TC-13 | Unpublish Flow đang được KB dùng | Cho phép + cảnh báo | Medium |
| TC-14 | Gắn Tag liên kết KB → enroll tự động | Tự động tạo journey | High |
| TC-15 | Gỡ Tag liên kết KB → cancel tự động | Tự động cancel journey | High |
| TC-16 | Tạm dừng KB → KH cũ vẫn chạy | KH cũ tiếp tục, không enroll mới | High |
| TC-17 | Hủy KH thủ công khỏi journey | Status='cancelled', lưu reason | Medium |
| TC-18 | Step delay với time_window | Reschedule nếu ngoài khung giờ | High |
| TC-19 | Step condition không thỏa | Skip với reason='condition_not_met' | High |
| TC-20 | Action create_task assign cho lead_owner | Task tạo cho NV phụ trách KH | Medium |

### 8.2. Permission Tests

| ID | Role | Action | Expected |
|---|---|---|---|
| TC-P01 | Admin | Truy cập module 4.13.2 | Cho phép |
| TC-P02 | Manager | Truy cập module 4.13.2 | Chặn 403 |
| TC-P03 | Leader | Truy cập module 4.13.2 | Chặn 403 |
| TC-P04 | Nhân viên | Truy cập module 4.13.2 | Chặn 403 |
| TC-P05 | Manager | Gọi API GET sequences | 403 Forbidden |

### 8.3. Edge Cases

| ID | Scenario | Expected |
|---|---|---|
| TC-E01 | KH bị xóa giữa journey | Journey auto cancel, log reason='customer_deleted' |
| TC-E02 | Sales bị nghỉ → task assign cho ai? | Fallback về Admin hoặc skip task |
| TC-E03 | Action enroll_sequence tạo loop A→B→A | Cảnh báo loop khi config, runtime check |
| TC-E04 | KB max 20 steps, thêm step thứ 21 | Lỗi 400 MAX_STEPS_REACHED |
| TC-E05 | Trigger Lịch định kỳ vào lúc 02:00 sáng | Worker xử lý đúng giờ |
| TC-E06 | Filter có 50 conditions | Performance OK, query hiệu quả |
| TC-E07 | Journey đang chạy thì KB bị xóa với option 'cancel_all' | Tất cả journey cancel ngay |
| TC-E08 | Action send_flow nhưng Flow bị Unpublish | Step skip với reason='flow_not_published' |

---

## 9. DESIGN TOKENS

### 9.1. Colors (đồng bộ ViLead Design System)
```css
/* Primary */
--color-primary: #1A2744;        /* Dark navy */
--color-primary-light: #2C3E5C;
--color-primary-dark: #0F1A2E;

/* Accent */
--color-accent: #E8652D;          /* Orange */
--color-accent-light: #F4814E;
--color-accent-dark: #C44E1A;

/* Status */
--color-success: #28A745;
--color-warning: #FFC107;
--color-danger: #DC3545;
--color-info: #17A2B8;

/* Grays */
--color-gray-50: #F8F9FA;
--color-gray-100: #F1F3F5;
--color-gray-200: #E9ECEF;
--color-gray-500: #6C757D;
--color-gray-900: #212529;

/* Background */
--bg-page: #F5F7FA;
--bg-card: #FFFFFF;
--bg-header: #1A2744;
```

### 9.2. Status Badges
```typescript
const STATUS_STYLES = {
  draft:    { bg: '#E9ECEF', color: '#495057', icon: '⚪' },
  active:   { bg: '#D4EDDA', color: '#155724', icon: '🟢' },
  paused:   { bg: '#FFF3CD', color: '#856404', icon: '🟡' },
};

const JOURNEY_STATUS_STYLES = {
  running:    { bg: '#CCE5FF', color: '#004085', icon: '▶️' },
  completed:  { bg: '#D4EDDA', color: '#155724', icon: '✓' },
  cancelled:  { bg: '#F8D7DA', color: '#721C24', icon: '✕' },
  failed:     { bg: '#F8D7DA', color: '#721C24', icon: '⚠️' },
};
```

### 9.3. Typography
```css
--font-family: 'Inter', 'Segoe UI', sans-serif;
--font-vietnamese: 'Inter', 'Be Vietnam Pro', sans-serif;

--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
```

### 9.4. Spacing
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
```

---

## PHỤ LỤC: 13 TRIGGERS

| Nhóm | Trigger Type | Label | Config Required |
|---|---|---|---|
| Hội thoại | `conversation_synced` | Hội thoại mới được đồng bộ | channels[] |
| Hội thoại | `first_message` | KH nhắn tin lần đầu | channels[] |
| Hội thoại | `returning_customer` | KH quay lại | inactive_days, channels[] |
| Đơn hàng | `new_order` | Đơn hàng mới | - |
| Đơn hàng | `order_status_changed` | Chuyển trạng thái đơn | target_status |
| Đơn hàng | `order_completed` | Đơn hàng hoàn thành | - |
| Đơn hàng | `order_cancelled` | Đơn hàng hủy | - |
| Khách hàng | `customer_birthday` | Sinh nhật KH | mode, days_before? |
| Khách hàng | `no_interaction` | Không tương tác X ngày | days |
| Khách hàng | `lead_assigned` | Lead được assign | sources[]? |
| Tag | `tag_added` | Gắn Tag | tag_id |
| Tag | `tag_removed` | Gỡ Tag | tag_id |
| Thời gian | `scheduled` | Lịch định kỳ | frequency, time, day_of_week?, day_of_month? |

## PHỤ LỤC: 9 ACTIONS

| Action Type | Label | Config Required |
|---|---|---|
| `send_flow` | Gửi Luồng tin nhắn | flow_id |
| `assign_tags` | Gắn Tag | tag_ids[] |
| `remove_tags` | Gỡ Tag | tag_ids[] |
| `create_task` | Tạo Công việc | title, assign_to, deadline |
| `create_reminder` | Tạo Nhắc nhở | content, recipient, time |
| `pause_bot` | Tạm dừng Bot | duration_minutes |
| `resume_bot` | Kích hoạt Bot | - |
| `enroll_sequence` | Đăng ký Kịch bản khác | sequence_id |
| `cancel_sequence` | Hủy Kịch bản | mode (current/other), sequence_id? |

---

**HẾT TÀI LIỆU UI SPEC - MODULE 4.13.2**
