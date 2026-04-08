# MODULE 4.13.2 - KỊCH BẢN CHĂM SÓC (SEQUENCE)
## UI SPECIFICATION FOR COPILOT

---

## 1. TỔNG QUAN

**Module**: Email Marketing - Kịch bản chăm sóc tự động (Sequence)  
**Mục đích**: Cho phép user tạo và quản lý chuỗi email/tin nhắn tự động dựa trên trigger và điều kiện  
**Tech Stack**: React + TypeScript, Node.js Backend, PostgreSQL, Redis (queue), Brevo API

---

## 2. DATABASE SCHEMA

```sql
-- Bảng chính: Sequence
CREATE TABLE sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- 'email', 'zalo', 'multi_channel'
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'
    
    -- Trigger configuration
    trigger_type VARCHAR(100) NOT NULL, -- 'lead_created', 'email_opened', 'link_clicked', 'order_paid', etc.
    trigger_config JSONB NOT NULL DEFAULT '{}', -- Điều kiện filter trigger
    
    -- Metadata
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    activated_at TIMESTAMP, -- Lần đầu kích hoạt
    
    -- Stats (denormalized for quick access)
    total_entered INTEGER DEFAULT 0, -- Tổng người đã vào
    currently_active INTEGER DEFAULT 0, -- Đang trong sequence
    completed INTEGER DEFAULT 0, -- Đã hoàn thành
    dropped_out INTEGER DEFAULT 0, -- Rời bỏ giữa chừng
    
    CONSTRAINT sequences_name_unique UNIQUE (name, created_by)
);

CREATE INDEX idx_sequences_status ON sequences(status);
CREATE INDEX idx_sequences_created_by ON sequences(created_by);
CREATE INDEX idx_sequences_trigger_type ON sequences(trigger_type);

-- Bảng: Các bước trong sequence
CREATE TABLE sequence_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id UUID NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL, -- Thứ tự bước (0, 1, 2,...)
    step_type VARCHAR(50) NOT NULL, -- 'send_email', 'send_zalo', 'wait', 'condition', 'end'
    name VARCHAR(200) NOT NULL,
    
    -- Configuration theo loại bước
    config JSONB NOT NULL DEFAULT '{}',
    -- Ví dụ config cho send_email:
    -- {
    --   "sender_id": "uuid",
    --   "subject": "Email title with {variables}",
    --   "template_id": "uuid",
    --   "attachments": ["file_url_1", "file_url_2"],
    --   "send_at_fixed_time": "09:00",
    --   "skip_if_recent_email_within_days": 7
    -- }
    -- Ví dụ config cho wait:
    -- {
    --   "wait_type": "duration", // 'duration', 'until_datetime', 'until_event'
    --   "duration_value": 3,
    --   "duration_unit": "days" // 'hours', 'days', 'weeks'
    -- }
    -- Ví dụ config cho condition:
    -- {
    --   "condition_type": "email_opened",
    --   "email_step_id": "uuid",
    --   "within_hours": 48,
    --   "true_next_step_id": "uuid",
    --   "false_next_step_id": "uuid"
    -- }
    
    -- Navigation
    next_step_id UUID REFERENCES sequence_steps(id), -- NULL cho end step
    parent_step_id UUID REFERENCES sequence_steps(id), -- Cho branching
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT sequence_steps_order_unique UNIQUE (sequence_id, step_order)
);

CREATE INDEX idx_sequence_steps_sequence ON sequence_steps(sequence_id);
CREATE INDEX idx_sequence_steps_type ON sequence_steps(step_type);

-- Bảng: Người tham gia sequence
CREATE TABLE sequence_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id UUID NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
    
    -- Người tham gia (lead hoặc customer)
    lead_id UUID REFERENCES leads(id),
    customer_id UUID REFERENCES customers(id),
    
    -- Trạng thái
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'completed', 'dropped', 'error'
    current_step_id UUID REFERENCES sequence_steps(id),
    
    -- Timeline
    enrolled_at TIMESTAMP NOT NULL DEFAULT NOW(),
    current_step_started_at TIMESTAMP,
    next_step_scheduled_at TIMESTAMP, -- Khi nào chạy bước tiếp theo
    completed_at TIMESTAMP,
    
    -- Error handling
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    last_error_at TIMESTAMP,
    
    CONSTRAINT enrollment_target_check CHECK (
        (lead_id IS NOT NULL AND customer_id IS NULL) OR
        (lead_id IS NULL AND customer_id IS NOT NULL)
    )
);

CREATE INDEX idx_enrollments_sequence ON sequence_enrollments(sequence_id);
CREATE INDEX idx_enrollments_status ON sequence_enrollments(status);
CREATE INDEX idx_enrollments_lead ON sequence_enrollments(lead_id);
CREATE INDEX idx_enrollments_customer ON sequence_enrollments(customer_id);
CREATE INDEX idx_enrollments_next_scheduled ON sequence_enrollments(next_step_scheduled_at);

-- Bảng: Lịch sử thực thi từng bước
CREATE TABLE sequence_step_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES sequence_enrollments(id) ON DELETE CASCADE,
    step_id UUID NOT NULL REFERENCES sequence_steps(id),
    
    -- Execution details
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    status VARCHAR(50) NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
    
    -- Results (for email/zalo steps)
    sent BOOLEAN DEFAULT FALSE,
    opened BOOLEAN DEFAULT FALSE,
    clicked BOOLEAN DEFAULT FALSE,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    
    -- Condition results (for condition steps)
    condition_result BOOLEAN, -- True/False cho nhánh đi qua
    
    -- Error tracking
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_step_logs_enrollment ON sequence_step_logs(enrollment_id);
CREATE INDEX idx_step_logs_step ON sequence_step_logs(step_id);
CREATE INDEX idx_step_logs_status ON sequence_step_logs(status);

-- Trigger để cập nhật stats
CREATE OR REPLACE FUNCTION update_sequence_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE sequences 
        SET total_entered = total_entered + 1,
            currently_active = currently_active + 1
        WHERE id = NEW.sequence_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
            UPDATE sequences
            SET completed = completed + 1,
                currently_active = currently_active - 1
            WHERE id = NEW.sequence_id;
        ELSIF NEW.status = 'dropped' AND OLD.status != 'dropped' THEN
            UPDATE sequences
            SET dropped_out = dropped_out + 1,
                currently_active = currently_active - 1
            WHERE id = NEW.sequence_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sequence_stats
AFTER INSERT OR UPDATE ON sequence_enrollments
FOR EACH ROW EXECUTE FUNCTION update_sequence_stats();
```

---

## 3. API ENDPOINTS

### 3.1. Sequence Management

```typescript
// GET /api/sequences - Lấy danh sách sequences
GET /api/sequences?status=active&trigger_type=lead_created&page=1&limit=20
Response: {
  sequences: Sequence[],
  total: number,
  page: number,
  limit: number
}

// POST /api/sequences - Tạo sequence mới
POST /api/sequences
Body: {
  name: string,
  description?: string,
  type: 'email' | 'zalo' | 'multi_channel'
}
Response: Sequence

// GET /api/sequences/:id - Lấy chi tiết sequence
GET /api/sequences/:sequenceId
Response: {
  sequence: Sequence,
  steps: SequenceStep[],
  stats: {
    total_entered: number,
    currently_active: number,
    completed: number,
    dropped_out: number,
    completion_rate: number,
    avg_completion_time_hours: number
  }
}

// PUT /api/sequences/:id - Cập nhật sequence
PUT /api/sequences/:sequenceId
Body: Partial<Sequence>
Response: Sequence

// DELETE /api/sequences/:id - Xóa sequence (soft delete)
DELETE /api/sequences/:sequenceId
Response: { success: boolean }

// POST /api/sequences/:id/activate - Kích hoạt sequence
POST /api/sequences/:sequenceId/activate
Response: { success: boolean, activated_at: timestamp }

// POST /api/sequences/:id/pause - Tạm dừng sequence
POST /api/sequences/:sequenceId/pause
Body: {
  stop_immediately: boolean // true: dừng ngay, false: cho hoàn thành
}
Response: { success: boolean }

// POST /api/sequences/:id/clone - Clone sequence
POST /api/sequences/:sequenceId/clone
Body: {
  new_name: string
}
Response: Sequence
```

### 3.2. Sequence Steps Management

```typescript
// POST /api/sequences/:id/steps - Thêm bước mới
POST /api/sequences/:sequenceId/steps
Body: {
  step_type: 'send_email' | 'send_zalo' | 'wait' | 'condition' | 'end',
  name: string,
  config: object,
  insert_after_step_id?: string // Insert vào vị trí cụ thể
}
Response: SequenceStep

// PUT /api/sequences/:id/steps/:stepId - Cập nhật bước
PUT /api/sequences/:sequenceId/steps/:stepId
Body: Partial<SequenceStep>
Response: SequenceStep

// DELETE /api/sequences/:id/steps/:stepId - Xóa bước
DELETE /api/sequences/:sequenceId/steps/:stepId
Response: { success: boolean }

// PUT /api/sequences/:id/steps/reorder - Sắp xếp lại thứ tự
PUT /api/sequences/:sequenceId/steps/reorder
Body: {
  step_orders: { step_id: string, new_order: number }[]
}
Response: SequenceStep[]
```

### 3.3. Enrollments & Tracking

```typescript
// GET /api/sequences/:id/enrollments - Lấy danh sách người trong sequence
GET /api/sequences/:sequenceId/enrollments?status=active&page=1
Response: {
  enrollments: EnrollmentWithDetails[],
  total: number
}

// GET /api/sequences/:id/enrollments/:enrollmentId - Chi tiết 1 enrollment
GET /api/sequences/:sequenceId/enrollments/:enrollmentId
Response: {
  enrollment: Enrollment,
  step_logs: StepLog[],
  timeline: TimelineEvent[]
}

// POST /api/sequences/:id/enrollments/:enrollmentId/stop - Dừng 1 người
POST /api/sequences/:sequenceId/enrollments/:enrollmentId/stop
Response: { success: boolean }
```

### 3.4. Reports & Analytics

```typescript
// GET /api/sequences/:id/report - Báo cáo tổng quan
GET /api/sequences/:sequenceId/report?from=2026-01-01&to=2026-04-08
Response: {
  overview: {
    total_entered: number,
    currently_active: number,
    completed: number,
    dropped_out: number,
    completion_rate: number,
    avg_completion_time_hours: number
  },
  funnel: {
    step_id: string,
    step_name: string,
    entered: number,
    completed: number,
    dropped: number,
    completion_rate: number,
    avg_time_at_step_hours: number
  }[],
  step_performance: {
    step_id: string,
    step_name: string,
    type: string,
    sent?: number,
    opened?: number,
    clicked?: number,
    open_rate?: number,
    click_rate?: number
  }[],
  timeline: {
    date: string,
    entered: number,
    completed: number,
    dropped: number
  }[]
}

// GET /api/sequences/:id/export - Export báo cáo
GET /api/sequences/:sequenceId/export?format=xlsx
Response: File download
```

---

## 4. TYPESCRIPT TYPES

```typescript
// Core types
type SequenceType = 'email' | 'zalo' | 'multi_channel';
type SequenceStatus = 'draft' | 'active' | 'paused' | 'completed';
type StepType = 'send_email' | 'send_zalo' | 'wait' | 'condition' | 'end';
type EnrollmentStatus = 'active' | 'completed' | 'dropped' | 'error';

interface Sequence {
  id: string;
  name: string;
  description?: string;
  type: SequenceType;
  status: SequenceStatus;
  
  trigger_type: string;
  trigger_config: TriggerConfig;
  
  created_by: string;
  created_at: string;
  updated_at: string;
  activated_at?: string;
  
  total_entered: number;
  currently_active: number;
  completed: number;
  dropped_out: number;
}

interface TriggerConfig {
  // Lead triggers
  lead_sources?: string[]; // ['zalo', 'facebook']
  lead_tags?: string[];
  lead_status?: string[];
  
  // Email triggers
  campaign_id?: string;
  email_action?: 'opened' | 'clicked';
  url_pattern?: string;
  
  // Order triggers
  min_amount?: number;
  max_amount?: number;
  
  // List triggers
  list_id?: string;
}

interface SequenceStep {
  id: string;
  sequence_id: string;
  step_order: number;
  step_type: StepType;
  name: string;
  config: StepConfig;
  next_step_id?: string;
  parent_step_id?: string;
  created_at: string;
  updated_at: string;
}

type StepConfig = 
  | EmailStepConfig 
  | ZaloStepConfig 
  | WaitStepConfig 
  | ConditionStepConfig;

interface EmailStepConfig {
  sender_id: string;
  subject: string;
  template_id: string;
  attachments?: string[];
  send_at_fixed_time?: string; // "09:00"
  skip_if_recent_email_within_days?: number;
}

interface ZaloStepConfig {
  zalo_oa_id: string;
  message_type: 'zns' | 'text';
  template_id?: string; // For ZNS
  message?: string; // For text
  image_url?: string;
  fallback_to_email?: boolean;
}

interface WaitStepConfig {
  wait_type: 'duration' | 'until_datetime' | 'until_event';
  duration_value?: number;
  duration_unit?: 'hours' | 'days' | 'weeks';
  target_datetime?: string;
  event_type?: 'birthday' | 'anniversary';
}

interface ConditionStepConfig {
  condition_type: 'email_opened' | 'email_clicked' | 'has_order' | 'has_tag' | 'in_list';
  email_step_id?: string;
  url_pattern?: string;
  within_hours?: number;
  min_order_amount?: number;
  tag_ids?: string[];
  list_id?: string;
  true_next_step_id: string;
  false_next_step_id: string;
}

interface Enrollment {
  id: string;
  sequence_id: string;
  lead_id?: string;
  customer_id?: string;
  status: EnrollmentStatus;
  current_step_id?: string;
  enrolled_at: string;
  current_step_started_at?: string;
  next_step_scheduled_at?: string;
  completed_at?: string;
  error_count: number;
  last_error?: string;
  last_error_at?: string;
}

interface EnrollmentWithDetails extends Enrollment {
  lead?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  current_step?: {
    id: string;
    name: string;
    step_type: StepType;
  };
}

interface StepLog {
  id: string;
  enrollment_id: string;
  step_id: string;
  started_at: string;
  completed_at?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  sent?: boolean;
  opened?: boolean;
  clicked?: boolean;
  opened_at?: string;
  clicked_at?: string;
  condition_result?: boolean;
  error_message?: string;
  retry_count: number;
  metadata: Record<string, any>;
}
```

---

## 5. UI COMPONENTS & WIREFRAMES

### 5.1. Sequence List View

```
┌─────────────────────────────────────────────────────────────────────────┐
│ KỊCH BẢN CHĂM SÓC                                    [+ Tạo kịch bản mới]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ [Tất cả] [Nháp] [Đang chạy] [Tạm dừng] [Đã hoàn thành]                 │
│                                                                          │
│ Bộ lọc:                                                                  │
│ Loại trigger: [All ▼]          Tìm kiếm: [_________________] 🔍        │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│ Tên                  │Trạng thái│Trigger     │Bước│Người│Hoàn│Ngày tạo  │
├─────────────────────────────────────────────────────────────────────────┤
│ 🔁 Chào mừng lead   │🟢 Đang   │Lead mới    │ 5  │ 234 │65% │01/04/2026│
│    mới Zalo         │   chạy   │            │    │     │    │          │
│                     │          │            │    │     │    │[⋮ Actions]│
├─────────────────────────────────────────────────────────────────────────┤
│ 🔁 Nhắc thanh toán  │⏸ Tạm    │Đơn chưa    │ 3  │  45 │80% │28/03/2026│
│                     │   dừng   │thanh toán  │    │     │    │          │
│                     │          │            │    │     │    │[⋮ Actions]│
├─────────────────────────────────────────────────────────────────────────┤
│ 🔁 Nurture leads    │📝 Nháp   │Email mở    │ 7  │   0 │ -  │05/04/2026│
│    quan tâm         │          │            │    │     │    │          │
│                     │          │            │    │     │    │[⋮ Actions]│
└─────────────────────────────────────────────────────────────────────────┘
                                               Trang 1 / 3  [< 1 2 3 >]
```

**Component**: `SequenceListView.tsx`

```typescript
interface SequenceListViewProps {
  onCreateNew: () => void;
}

const SequenceListView: React.FC<SequenceListViewProps> = ({ onCreateNew }) => {
  const [activeTab, setActiveTab] = useState<SequenceStatus | 'all'>('all');
  const [filterTrigger, setFilterTrigger] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  
  const { data, isLoading } = useQuery({
    queryKey: ['sequences', activeTab, filterTrigger, searchQuery, page],
    queryFn: () => fetchSequences({ status: activeTab, trigger_type: filterTrigger, search: searchQuery, page })
  });
  
  return (
    <div className="sequence-list-container">
      <div className="header">
        <h1>Kịch bản chăm sóc</h1>
        <button onClick={onCreateNew}>+ Tạo kịch bản mới</button>
      </div>
      
      <div className="tabs">
        {['all', 'draft', 'active', 'paused', 'completed'].map(tab => (
          <button 
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab as any)}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>
      
      <div className="filters">
        <select value={filterTrigger} onChange={e => setFilterTrigger(e.target.value)}>
          <option value="all">Tất cả trigger</option>
          <option value="lead_created">Lead mới</option>
          <option value="email_opened">Mở email</option>
          <option value="link_clicked">Click link</option>
          <option value="order_paid">Thanh toán</option>
        </select>
        
        <input 
          type="search"
          placeholder="Tìm theo tên..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
      
      <SequenceTable 
        sequences={data?.sequences || []}
        isLoading={isLoading}
      />
      
      <Pagination 
        currentPage={page}
        totalPages={Math.ceil((data?.total || 0) / 20)}
        onPageChange={setPage}
      />
    </div>
  );
};
```

---

### 5.2. Visual Builder (Canvas)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ← Quay lại   Kịch bản: Chào mừng lead mới Zalo      [Lưu nháp][Kích hoạt]│
├──────────────┬──────────────────────────────────────────────────────────┤
│ SIDEBAR      │ CANVAS                                                    │
│              │                                                            │
│ Thêm bước:   │    ╔═══════════════════╗                                 │
│              │    ║   🎯 TRIGGER      ║                                 │
│ 📧 Email     │    ║  Lead mới được tạo║                                 │
│ 💬 Zalo      │    ║  Nguồn: Zalo      ║                                 │
│ ⏱ Chờ       │    ╚═══════════════════╝                                 │
│ 🔀 Điều kiện │            │                                              │
│ 🏁 Kết thúc │            ▼                                              │
│              │    ┌───────────────────┐                                 │
│              │    │ 📧 Bước 1         │                                 │
│              │    │ Email chào mừng   │                                 │
│              │    │ ✓ Đã cấu hình     │                                 │
│              │    └───────────────────┘                                 │
│              │            │                                              │
│              │            ▼                                              │
│              │    ┌───────────────────┐                                 │
│              │    │ ⏱ Bước 2         │                                 │
│              │    │ Chờ 3 ngày        │                                 │
│              │    │ ✓ Đã cấu hình     │                                 │
│              │    └───────────────────┘                                 │
│              │            │                                              │
│              │            ▼                                              │
│              │    ┌───────────────────┐                                 │
│              │    │ 🔀 Bước 3         │                                 │
│              │    │ Đã mở email?      │                                 │
│              │    │ ⚠ Chưa cấu hình  │ ← ĐANG CHỌN                    │
│              │    └───────────────────┘                                 │
│              │       /            \                                      │
│              │     ✓              ✗                                     │
│              │                                                            │
└──────────────┴──────────────────────────────────────────────────────────┘
```

**Component**: `SequenceBuilder.tsx`

```typescript
interface SequenceBuilderProps {
  sequenceId: string;
  onSave: () => void;
  onActivate: () => void;
}

const SequenceBuilder: React.FC<SequenceBuilderProps> = ({ sequenceId, onSave, onActivate }) => {
  const [steps, setSteps] = useState<SequenceStep[]>([]);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  
  const { data: sequence } = useQuery({
    queryKey: ['sequence', sequenceId],
    queryFn: () => fetchSequence(sequenceId)
  });
  
  const handleDrop = (stepType: StepType, afterStepId?: string) => {
    // Create new step
    const newStep = createStepMutation.mutate({
      sequence_id: sequenceId,
      step_type: stepType,
      insert_after_step_id: afterStepId
    });
  };
  
  const handleStepClick = (stepId: string) => {
    setSelectedStepId(stepId);
  };
  
  return (
    <div className="sequence-builder">
      <div className="builder-header">
        <button onClick={() => navigate('/sequences')}>← Quay lại</button>
        <h2>{sequence?.name}</h2>
        <div className="actions">
          <button onClick={onSave}>Lưu nháp</button>
          <button onClick={onActivate} className="primary">Kích hoạt</button>
        </div>
      </div>
      
      <div className="builder-content">
        <Sidebar onDragStart={handleDragStart} />
        
        <Canvas 
          steps={steps}
          selectedStepId={selectedStepId}
          onStepClick={handleStepClick}
          onDrop={handleDrop}
        />
        
        {selectedStepId && (
          <StepConfigPanel 
            stepId={selectedStepId}
            onClose={() => setSelectedStepId(null)}
          />
        )}
      </div>
    </div>
  );
};
```

---

### 5.3. Step Configuration Panels

#### 5.3.1. Email Step Config

```
┌─────────────────────────────────────────┐
│ CÁU HÌNH BƯỚC: GỬI EMAIL        [✕ Đóng]│
├─────────────────────────────────────────┤
│                                          │
│ Tên bước *                               │
│ [Email chào mừng              ]          │
│                                          │
│ Người gửi *                              │
│ [sales@vilead.vn ▼            ]          │
│                                          │
│ Tiêu đề email *                          │
│ [Chào mừng {ten_khach} đến Vi]          │
│  💡 Biến: {ten_khach}, {ma_don}         │
│                                          │
│ Nội dung email *                         │
│ [Chọn mẫu từ thư viện ▼]                │
│  hoặc                                    │
│ [+ Tạo mẫu mới]                         │
│                                          │
│ File đính kèm                            │
│ [Tải lên file...]                        │
│                                          │
│ ⚙ Cài đặt nâng cao                      │
│ ☐ Gửi vào thời gian cố định: [09:00]   │
│ ☑ Bỏ qua nếu đã nhận email trong: [7] ng│
│                                          │
│            [Hủy]        [Lưu cấu hình]   │
└─────────────────────────────────────────┘
```

#### 5.3.2. Wait Step Config

```
┌─────────────────────────────────────────┐
│ CẤU HÌNH BƯỚC: CHỜ             [✕ Đóng] │
├─────────────────────────────────────────┤
│                                          │
│ Loại chờ:                                │
│                                          │
│ ⚫ Chờ theo thời gian                    │
│    [3    ] [ngày ▼]                     │
│                                          │
│ ○ Chờ đến thời điểm cụ thể              │
│    Ngày: [     ] Giờ: [     ]           │
│                                          │
│ ○ Chờ đến ngày đặc biệt                 │
│    [Sinh nhật khách hàng ▼]             │
│                                          │
│ Preview:                                 │
│ Bước tiếp theo sẽ chạy sau 3 ngày       │
│ từ khi bước hiện tại hoàn thành         │
│                                          │
│            [Hủy]        [Lưu]            │
└─────────────────────────────────────────┘
```

#### 5.3.3. Condition Step Config

```
┌─────────────────────────────────────────┐
│ CẤU HÌNH ĐIỀU KIỆN IF/ELSE    [✕ Đóng] │
├─────────────────────────────────────────┤
│                                          │
│ Điều kiện kiểm tra:                      │
│                                          │
│ [Đã mở email trước đó ▼]                │
│                                          │
│ Chi tiết:                                │
│ Email từ bước: [Bước 1 - Email chào...▼]│
│ Trong vòng: [48] giờ                     │
│                                          │
│ Kết quả:                                 │
│                                          │
│ ✓ Nếu ĐÃ MỞ EMAIL:                      │
│   Chuyển sang: [Bước 4 - Email offer ▼] │
│                                          │
│ ✗ Nếu CHƯA MỞ EMAIL:                    │
│   Chuyển sang: [Bước 5 - Email nhắc ▼]  │
│                                          │
│ Preview:                                 │
│ Khách đã mở email trong 48h → Bước 4    │
│ Khách chưa mở email → Bước 5             │
│                                          │
│            [Hủy]        [Lưu]            │
└─────────────────────────────────────────┘
```

---

### 5.4. Enrollment List View

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Kịch bản: Chào mừng lead mới Zalo                    [← Quay lại danh sách]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ [Đang trong kịch bản] [Đã hoàn thành]                                  │
│                                                                          │
│ Bộ lọc:                                                                  │
│ Bước hiện tại: [All ▼]    Tìm kiếm: [________________] 🔍  [Export ▼] │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│ Tên           │Email/SĐT       │Bước hiện tại│Bắt đầu   │Bước tiếp│[⋮]│
├─────────────────────────────────────────────────────────────────────────┤
│ Nguyễn Văn A  │0901234567      │⏱ Bước 2    │01/04     │03/04    │   │
│               │nguyenvana@...  │  Chờ 3 ngày │9:30 AM   │9:30 AM  │   │
├─────────────────────────────────────────────────────────────────────────┤
│ Trần Thị B    │0912345678      │📧 Bước 3    │02/04     │05/04    │   │
│               │tranthib@...    │  Email nhắc │2:15 PM   │2:15 PM  │   │
├─────────────────────────────────────────────────────────────────────────┤
│ Lê Văn C      │0923456789      │🔀 Bước 4    │03/04     │Đang chờ │   │
│               │levanc@...      │  Điều kiện  │10:00 AM  │kết quả  │   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 5.5. Sequence Report View

```
┌─────────────────────────────────────────────────────────────────────────┐
│ BÁO CÁO: Chào mừng lead mới Zalo                     [← Quay lại]       │
├─────────────────────────────────────────────────────────────────────────┤
│ Kỳ báo cáo: [30 ngày qua ▼]                                [Export PDF] │
│                                                                          │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│ │ Tổng tham gia│ │ Đang trong   │ │ Đã hoàn thành│ │ Rời bỏ       │  │
│ │    1,234     │ │     234      │ │     856      │ │    144       │  │
│ │              │ │              │ │   (69.4%)    │ │   (11.7%)    │  │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │
│                                                                          │
│ PHỄU CHUYỂN ĐỔI                                                         │
│ ╔══════════════════════════════════════════════════════════════╗       │
│ ║ Bước 1 - Email chào mừng                           1,234 (100%)║      │
│ ║   ├─ Đã gửi: 1,210 (98%)                                       ║      │
│ ║   ├─ Đã mở: 850 (69%)                                          ║      │
│ ║   └─ Đã click: 350 (28%)                                       ║      │
│ ╟──────────────────────────────────────────────────────────────╢       │
│ ║ Bước 2 - Chờ 3 ngày                               1,210 (98%) ║       │
│ ╟──────────────────────────────────────────────────────────────╢       │
│ ║ Bước 3 - Điều kiện: Đã mở email?                  1,210 (98%) ║       │
│ ║   ├─ ✓ Đã mở: 850 (70%) → Bước 4                              ║       │
│ ║   └─ ✗ Chưa mở: 360 (30%) → Bước 5                            ║       │
│ ╟──────────────────────────────────────────────────────────────╢       │
│ ║ Bước 4 - Email ưu đãi                               850 (69%) ║       │
│ ║   ├─ Đã gửi: 840 (99%)                                         ║       │
│ ║   ├─ Đã mở: 520 (62%)                                          ║       │
│ ║   └─ Đã click: 180 (21%)                                       ║       │
│ ╚══════════════════════════════════════════════════════════════╝       │
│                                                                          │
│ BIỂU ĐỒ THEO THỜI GIAN                                                  │
│  120│                                                                    │
│     │     ●●●                                                            │
│   80│  ●●●   ●●                                                         │
│     │●●        ●●●                                                      │
│   40│              ●●●●                                                 │
│     │                  ●●●●●                                            │
│    0└─────────────────────────────────────────                         │
│      1/4  5/4  9/4  13/4 17/4 21/4 25/4 29/4                           │
│                                                                          │
│      ─●─ Tham gia mới   ─■─ Hoàn thành   ─▲─ Rời bỏ                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. BUSINESS RULES

### 6.1. Validation Rules

**Trigger Configuration**:
- Mỗi sequence chỉ có 1 trigger
- Trigger phải được cấu hình đầy đủ trước khi activate
- Không thể thay đổi trigger khi sequence đang active (phải pause trước)

**Steps**:
- Sequence phải có ít nhất 1 action step (Email hoặc Zalo)
- Tối đa 20 bước trong 1 sequence
- Phải có bước Wait giữa 2 email steps (không gửi liên tiếp)
- Wait tối thiểu 1 giờ giữa các email
- Condition step phải có cả 2 nhánh được kết nối

**Email Steps**:
- Email sender phải đã verify
- Tiêu đề max 200 ký tự
- File đính kèm max 10MB
- Chỉ cho phép: .pdf, .doc, .docx, .xls, .xlsx, .jpg, .png

**Activation**:
- Checklist trước khi activate:
  1. ✓ Trigger đã cấu hình
  2. ✓ Có ít nhất 1 action step
  3. ✓ Tất cả steps đã cấu hình đầy đủ
  4. ✓ Email senders đã verify
  5. ⚠ Cảnh báo nếu không có ai đủ điều kiện trigger

### 6.2. Runtime Rules

**Enrollment**:
- Kiểm tra trigger event realtime
- Validate điều kiện filter trước khi enroll
- Ghi log thời gian bắt đầu
- Bắt đầu từ bước đầu tiên sau trigger

**Execution**:
- Queue-based processing (Redis/Bull)
- Mỗi step chạy tuần tự theo thứ tự
- Wait step: schedule bước tiếp theo vào thời điểm tương lai
- Condition step: evaluate điều kiện → chọn nhánh
- Retry 3 lần nếu gửi email/zalo fail
- Nếu fail sau 3 lần → mark enrollment as 'error'

**Email Tracking**:
- Embed tracking pixel cho open tracking
- Replace links với tracking redirect URL
- Ghi log opened_at, clicked_at vào step_logs
- Update condition evaluation dựa trên tracking events

**Stop Conditions**:
- User manually stop enrollment
- Sequence bị pause
- Enrollment gặp error quá nhiều
- User unsubscribe
- Email bounce hard

### 6.3. Reporting Rules

**Metrics Calculation**:
- Completion rate = (completed / total_entered) × 100
- Drop rate = (dropped_out / total_entered) × 100
- Open rate (per step) = (opened / sent) × 100
- Click rate (per step) = (clicked / sent) × 100
- Avg completion time = average(completed_at - enrolled_at)

**Funnel**:
- Hiển thị tỷ lệ chuyển đổi giữa các bước
- Highlight bước có drop rate cao nhất
- Drill-down vào từng bước để xem chi tiết

---

## 7. WORKER PROCESSES

### 7.1. Trigger Listener Workers

```typescript
// Worker 1: Lắng nghe Lead Created Events
import { Worker } from 'bullmq';

const leadCreatedWorker = new Worker('lead-created-events', async (job) => {
  const { lead_id, source, tags } = job.data;
  
  // Find active sequences với trigger = 'lead_created'
  const sequences = await db.query(`
    SELECT * FROM sequences 
    WHERE status = 'active' 
    AND trigger_type = 'lead_created'
  `);
  
  for (const sequence of sequences) {
    // Check if lead matches trigger config
    const matches = evaluateTriggerConfig(sequence.trigger_config, {
      source,
      tags
    });
    
    if (matches) {
      // Enroll lead vào sequence
      await enrollInSequence(sequence.id, lead_id);
    }
  }
});

// Worker 2: Lắng nghe Email Opened Events  
const emailOpenedWorker = new Worker('email-opened-events', async (job) => {
  const { email_id, recipient_email, opened_at } = job.data;
  
  // Update step log
  await db.query(`
    UPDATE sequence_step_logs 
    SET opened = true, opened_at = $1
    WHERE email_id = $2
  `, [opened_at, email_id]);
  
  // Check sequences với trigger = 'email_opened'
  const sequences = await db.query(`
    SELECT * FROM sequences 
    WHERE status = 'active' 
    AND trigger_type = 'email_opened'
  `);
  
  // ... enroll logic
});

// Tương tự cho: email_clicked, order_paid, list_added...
```

### 7.2. Step Execution Worker

```typescript
const stepExecutionWorker = new Worker('sequence-steps', async (job) => {
  const { enrollment_id } = job.data;
  
  // Load enrollment
  const enrollment = await getEnrollment(enrollment_id);
  if (!enrollment || enrollment.status !== 'active') {
    return; // Already completed/stopped
  }
  
  // Load current step
  const step = await getStep(enrollment.current_step_id);
  
  // Create step log
  const log = await createStepLog({
    enrollment_id,
    step_id: step.id,
    status: 'processing'
  });
  
  try {
    // Execute based on step type
    switch (step.step_type) {
      case 'send_email':
        await executeSendEmail(enrollment, step, log);
        break;
      case 'send_zalo':
        await executeSendZalo(enrollment, step, log);
        break;
      case 'wait':
        await executeWait(enrollment, step, log);
        break;
      case 'condition':
        await executeCondition(enrollment, step, log);
        break;
      case 'end':
        await executeEnd(enrollment, log);
        return; // Stop here
    }
    
    // Mark step completed
    await updateStepLog(log.id, { status: 'completed', completed_at: new Date() });
    
    // Move to next step
    if (step.next_step_id) {
      await updateEnrollment(enrollment_id, {
        current_step_id: step.next_step_id,
        current_step_started_at: new Date()
      });
      
      // Schedule next step execution
      await scheduleStepExecution(enrollment_id, step.next_step_id);
    }
    
  } catch (error) {
    // Handle error
    await updateStepLog(log.id, {
      status: 'failed',
      error_message: error.message,
      retry_count: log.retry_count + 1
    });
    
    if (log.retry_count < 3) {
      // Retry
      await scheduleStepExecution(enrollment_id, step.id, { delay: 5 * 60 * 1000 }); // 5 min
    } else {
      // Mark enrollment as error
      await updateEnrollment(enrollment_id, {
        status: 'error',
        last_error: error.message,
        error_count: enrollment.error_count + 1
      });
    }
  }
}, {
  connection: redisConnection,
  concurrency: 10
});

// Helper functions
async function executeSendEmail(enrollment, step, log) {
  const config = step.config as EmailStepConfig;
  
  // Get recipient
  const recipient = enrollment.lead_id 
    ? await getLead(enrollment.lead_id)
    : await getCustomer(enrollment.customer_id);
  
  // Check skip conditions
  if (config.skip_if_recent_email_within_days) {
    const hasRecentEmail = await checkRecentEmail(
      recipient.email,
      config.skip_if_recent_email_within_days
    );
    if (hasRecentEmail) {
      return; // Skip
    }
  }
  
  // Replace variables
  const subject = replaceVariables(config.subject, recipient);
  const htmlContent = await renderTemplate(config.template_id, recipient);
  
  // Send via Brevo
  const result = await brevoClient.send({
    sender: await getSender(config.sender_id),
    to: [{ email: recipient.email, name: recipient.name }],
    subject,
    htmlContent,
    attachments: config.attachments
  });
  
  // Update log
  await updateStepLog(log.id, {
    sent: true,
    metadata: { brevo_message_id: result.messageId }
  });
}

async function executeWait(enrollment, step, log) {
  const config = step.config as WaitStepConfig;
  
  let nextExecutionTime: Date;
  
  switch (config.wait_type) {
    case 'duration':
      const ms = convertToMs(config.duration_value!, config.duration_unit!);
      nextExecutionTime = new Date(Date.now() + ms);
      break;
    case 'until_datetime':
      nextExecutionTime = new Date(config.target_datetime!);
      break;
    case 'until_event':
      // Calculate based on event (e.g., birthday)
      nextExecutionTime = calculateEventDate(enrollment, config.event_type!);
      break;
  }
  
  // Schedule next step at calculated time
  await updateEnrollment(enrollment.id, {
    next_step_scheduled_at: nextExecutionTime
  });
  
  // Add job to queue with delay
  await sequenceQueue.add('execute-step', {
    enrollment_id: enrollment.id
  }, {
    delay: nextExecutionTime.getTime() - Date.now()
  });
}

async function executeCondition(enrollment, step, log) {
  const config = step.config as ConditionStepConfig;
  
  // Evaluate condition
  let result: boolean;
  
  switch (config.condition_type) {
    case 'email_opened':
      result = await checkEmailOpened(
        enrollment.id,
        config.email_step_id!,
        config.within_hours
      );
      break;
    case 'email_clicked':
      result = await checkEmailClicked(
        enrollment.id,
        config.email_step_id!,
        config.url_pattern,
        config.within_hours
      );
      break;
    case 'has_order':
      result = await checkHasOrder(
        enrollment.customer_id!,
        config.min_order_amount
      );
      break;
    // ... other conditions
  }
  
  // Log result
  await updateStepLog(log.id, { condition_result: result });
  
  // Choose next step based on result
  const nextStepId = result 
    ? config.true_next_step_id 
    : config.false_next_step_id;
  
  await updateEnrollment(enrollment.id, {
    current_step_id: nextStepId
  });
}
```

---

## 8. TESTING CHECKLIST

### Unit Tests
- [ ] Trigger config validation
- [ ] Step config validation  
- [ ] Variable replacement logic
- [ ] Condition evaluation logic
- [ ] Time calculation for wait steps

### Integration Tests
- [ ] Enrollment flow: trigger → enroll → execute
- [ ] Email sending via Brevo API
- [ ] Tracking pixel and link redirect
- [ ] Condition branching
- [ ] Error handling and retry logic

### E2E Tests
- [ ] Create sequence → configure → activate → enrollments run
- [ ] Pause sequence → enrollments stop
- [ ] Clone sequence
- [ ] Export reports

---

## 9. PERFORMANCE CONSIDERATIONS

**Database**:
- Index on `sequence_enrollments.next_step_scheduled_at` cho scheduled jobs
- Index on `sequence_step_logs.enrollment_id` cho timeline queries
- Denormalize stats trên `sequences` table để avoid heavy aggregations

**Queue**:
- Use Redis/Bull với concurrency = 10-20
- Separate queues cho email vs zalo để scale independently
- Use delayed jobs cho wait steps

**Caching**:
- Cache sequence + steps definition (invalidate on update)
- Cache email templates
- Cache trigger configs

**Rate Limiting**:
- Respect Brevo API rate limits
- Implement exponential backoff cho retries
- Queue overflow protection

---

## 10. DEPLOYMENT NOTES

**Environment Variables**:
```bash
BREVO_API_KEY=xkeysib-xxx
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:pass@host/db
WORKER_CONCURRENCY=10
```

**Worker Scaling**:
- Horizontal scaling: multiple worker instances
- Vertical scaling: increase concurrency per instance
- Monitor queue length và adjust accordingly

**Monitoring**:
- Track enrollment success rate
- Monitor email delivery rate
- Alert on high error rates
- Dashboard for queue metrics

---

**END OF SPECIFICATION**
