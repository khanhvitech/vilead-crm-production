# Logic.md — Module "Gói & Thanh toán" (ViLead CRM)

> **Phạm vi:** Tab `Cài đặt → Gói & Thanh toán`  
> **Người dùng:** Admin Tenant  
> **Thanh toán:** Chuyển khoản thủ công (không tích hợp payment gateway)  
> **Prorate:** Tính theo ngày

---

## 1. Data Model

### 1.1 Bảng `subscription_plans` (Master — ViLead định nghĩa)

```sql
CREATE TABLE subscription_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(20) UNIQUE NOT NULL,       -- 'starter' | 'professional' | 'enterprise'
  name          VARCHAR(100) NOT NULL,             -- 'Starter' | 'Professional' | 'Enterprise'
  price_monthly BIGINT NOT NULL,                   -- VND/user/tháng (VD: 49000)
  price_yearly  BIGINT NOT NULL,                   -- VND/user/năm (VD: 490000)
  max_users     INT,                               -- NULL = không giới hạn
  max_storage_gb INT,
  max_domains   INT,
  features      JSONB,                             -- {"zalo_oa": true, "automation": true, ...}
  sort_order    INT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

### 1.2 Bảng `tenant_subscriptions` (Gói đang dùng của từng tenant)

```sql
CREATE TABLE tenant_subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  plan_id         UUID NOT NULL REFERENCES subscription_plans(id),
  billing_cycle   VARCHAR(10) NOT NULL,            -- 'monthly' | 'yearly'
  user_count      INT NOT NULL,                    -- Số user được mua
  started_at      DATE NOT NULL,
  expires_at      DATE NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'active',
  -- 'active' | 'expired' | 'cancelled' | 'pending_downgrade'
  pending_plan_id UUID REFERENCES subscription_plans(id),
  -- Nếu hạ cấp, lưu plan mới áp dụng cuối kỳ
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

### 1.3 Bảng `subscription_orders` (Đơn hàng / lịch sử)

```sql
CREATE TABLE subscription_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  order_code      VARCHAR(30) UNIQUE NOT NULL,     -- Format: VL-YYYYMM-XXXXX
  order_type      VARCHAR(20) NOT NULL,
  -- 'new' | 'renewal' | 'upgrade' | 'downgrade' | 'add_users'
  from_plan_id    UUID REFERENCES subscription_plans(id),
  to_plan_id      UUID NOT NULL REFERENCES subscription_plans(id),
  billing_cycle   VARCHAR(10) NOT NULL,
  user_count      INT NOT NULL,
  amount_before_vat BIGINT NOT NULL,               -- Tiền trước VAT (đã trừ discount)
  discount_amount   BIGINT NOT NULL DEFAULT 0,
  vat_rate          DECIMAL(5,4) NOT NULL DEFAULT 0.1,
  vat_amount        BIGINT NOT NULL,               -- = (amount_before_vat - discount_amount) * vat_rate
  total_amount      BIGINT NOT NULL,               -- = amount_before_vat - discount_amount + vat_amount
  prorate_days      INT,                           -- Số ngày còn lại nếu là upgrade mid-cycle
  period_from       DATE NOT NULL,
  period_to         DATE NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- 'pending' | 'paid' | 'cancelled'
  bank_transfer_note VARCHAR(50),                  -- Nội dung CK (auto-generate)
  confirmed_by    UUID REFERENCES users(id),       -- Admin ViLead xác nhận
  confirmed_at    TIMESTAMPTZ,
  note            TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

### 1.4 Bảng `subscription_notifications` (Lịch nhắc)

```sql
CREATE TABLE subscription_notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  type        VARCHAR(30) NOT NULL,
  -- 'expiry_30d' | 'expiry_7d' | 'expiry_1d' | 'expired' | 'usage_warning'
  sent_at     TIMESTAMPTZ NOT NULL,
  channel     VARCHAR(20),                         -- 'email' | 'zalo_oa'
  status      VARCHAR(20)                          -- 'sent' | 'failed'
);
```

---

## 2. Business Rules

### 2.1 Prorate (Phí tính theo ngày)

```
Công thức:
  daily_rate    = plan_price_monthly / 30
  days_remain   = expires_at - today  (số ngày còn lại trong chu kỳ)
  prorate_cost  = daily_rate * days_remain * user_count

Ví dụ:
  Tenant đang dùng Starter (49,000đ/user/tháng), 5 users
  Còn 15 ngày → Muốn nâng lên Professional (89,000đ/user/tháng)
  
  Chi phí nâng cấp = (89,000 - 49,000) / 30 * 15 * 5
                   = 40,000 / 30 * 15 * 5
                   = 1,333 * 15 * 5
                   = 100,000đ (trước VAT)
  
  VAT = 100,000 * 10% = 10,000đ
  Tổng = 110,000đ
```

### 2.2 Nâng cấp gói (Upgrade)

```
BR-01: Nâng cấp có hiệu lực NGAY sau khi Admin ViLead xác nhận thanh toán.
BR-02: Chu kỳ hiện tại được extend: expires_at giữ nguyên (không reset).
BR-03: Chỉ tính phí chênh lệch prorate cho số ngày còn lại.
BR-04: Không hoàn tiền phần đã dùng.
BR-05: Tenant chỉ được nâng lên gói cao hơn (không skip gói).
       Ngoại lệ: Starter → Enterprise được phép.
```

### 2.3 Hạ cấp gói (Downgrade)

```
BR-06: Hạ cấp KHÔNG có hiệu lực ngay — áp dụng vào đầu chu kỳ tiếp theo.
BR-07: Khi tenant submit yêu cầu hạ cấp:
       - tenant_subscriptions.pending_plan_id = new_plan_id
       - tenant_subscriptions.status = 'pending_downgrade'
       - KHÔNG tạo subscription_orders ngay
BR-08: Hiển thị banner cảnh báo trên Section 1:
       "Gói của bạn sẽ hạ xuống [Tên gói] vào [ngày hết hạn]. Hủy yêu cầu?"
BR-09: Nếu dùng vượt giới hạn gói mới (VD: đang có 10 users, gói mới max 5):
       - Chặn hạ cấp, hiển thị cảnh báo cụ thể.
BR-10: KHÔNG hoàn tiền khi hạ cấp.
BR-11: Tenant được hủy yêu cầu hạ cấp bất cứ lúc nào trước khi hết kỳ.
```

### 2.4 Sinh mã đơn hàng

```
Format: VL-YYYYMM-XXXXX
Ví dụ:  VL-202506-00001

Logic:
  prefix = 'VL'
  month  = YYYYMM của created_at
  seq    = auto-increment trong tháng đó (reset mỗi tháng, padding 5 chữ số)
```

### 2.5 Nội dung chuyển khoản

```
Format: VILEAD [ORDER_CODE] [TENANT_CODE]
Ví dụ:  VILEAD VL202506-00001 TEN001

Lưu vào: subscription_orders.bank_transfer_note
Mục đích: Admin ViLead đối soát tự động hoặc thủ công
```

### 2.6 Cảnh báo sắp hết hạn

```
Rule:
  - 30 ngày trước expires_at → badge vàng + gửi email/Zalo
  - 7 ngày trước expires_at  → badge đỏ + gửi email/Zalo
  - 1 ngày trước expires_at  → gửi email/Zalo
  - Ngày hết hạn             → status = 'expired', hạn chế tính năng

Deduplication: Mỗi loại (expiry_30d, expiry_7d, expiry_1d) chỉ gửi 1 lần/subscription.
```

### 2.7 Cảnh báo Usage (dùng vượt giới hạn)

```
Trigger khi:
  - Users đang dùng / max_users >= 80%  → badge vàng
  - Users đang dùng / max_users >= 100% → badge đỏ + chặn thêm user mới
  - Storage >= 80%                       → badge vàng
  - Storage >= 100%                      → badge đỏ + chặn upload
```

### 2.8 VAT

```
Theo Thông tư 219/2013/TT-BTC:
  VAT = (Subtotal − Discount) × rate
  Trong module này: discount_amount luôn = 0 (chưa có mã giảm giá cho gói subscription)
  → VAT = amount_before_vat * 0.10
```

---

## 3. API Endpoints

### 3.1 Section 1 — Lấy thông tin gói hiện tại

```
GET /api/v1/settings/subscription/current

Response 200:
{
  "subscription": {
    "id": "uuid",
    "plan": {
      "code": "professional",
      "name": "Professional",
      "price_monthly": 89000,
      "max_users": 20,
      "max_storage_gb": 50,
      "max_domains": 5,
      "features": { "zalo_oa": true, "automation": true, "kpi": true }
    },
    "billing_cycle": "monthly",
    "user_count": 10,
    "started_at": "2025-01-01",
    "expires_at": "2025-07-01",
    "days_remaining": 45,
    "status": "active",
    "pending_downgrade": null
  },
  "usage": {
    "users_active": 8,
    "storage_used_gb": 12.5,
    "domains_connected": 2
  },
  "warnings": [
    { "type": "expiry_30d", "message": "Gói hết hạn trong 45 ngày" }
  ]
}
```

### 3.2 Section 2 — Lấy danh sách gói để so sánh

```
GET /api/v1/settings/subscription/plans

Response 200:
{
  "plans": [
    {
      "id": "uuid",
      "code": "starter",
      "name": "Starter",
      "price_monthly": 49000,
      "price_yearly": 490000,
      "max_users": 5,
      "max_storage_gb": 10,
      "max_domains": 1,
      "features": { ... },
      "is_current": false,
      "is_recommended": false
    },
    ...
  ]
}
```

### 3.3 Tính phí prorate trước khi submit

```
POST /api/v1/settings/subscription/calculate-prorate

Body:
{
  "to_plan_id": "uuid",
  "billing_cycle": "monthly",
  "user_count": 10
}

Response 200:
{
  "order_type": "upgrade",           // hoặc "downgrade"
  "effective_date": "2025-06-16",    // upgrade: ngay hôm nay | downgrade: ngày hết kỳ
  "days_remaining": 15,
  "prorate_days": 15,
  "amount_before_vat": 100000,
  "discount_amount": 0,
  "vat_amount": 10000,
  "total_amount": 110000,
  "period_from": "2025-06-16",
  "period_to": "2025-07-01",
  "note": "Tính phí 15 ngày còn lại trong chu kỳ hiện tại",
  "downgrade_warning": null          // null hoặc "Bạn đang có 10 users, gói mới chỉ cho 5. Vui lòng giảm users trước."
}
```

### 3.4 Submit yêu cầu đổi gói

```
POST /api/v1/settings/subscription/change-plan

Body:
{
  "to_plan_id": "uuid",
  "billing_cycle": "monthly",
  "user_count": 10,
  "change_type": "upgrade"           // "upgrade" | "downgrade"
}

Response 201:
{
  "order": {
    "id": "uuid",
    "order_code": "VL-202506-00001",
    "status": "pending",
    "total_amount": 110000,
    "bank_transfer_note": "VILEAD VL202506-00001 TEN001",
    "bank_info": {
      "bank_name": "Vietcombank",
      "account_number": "1234567890",
      "account_name": "CONG TY TNHH VILEAD"
    }
  }
}

Errors:
  400: { "code": "DOWNGRADE_USER_EXCEED", "message": "..." }
  400: { "code": "SAME_PLAN", "message": "Bạn đang dùng gói này" }
  409: { "code": "PENDING_ORDER_EXISTS", "message": "Bạn đã có đơn đang chờ xử lý" }
```

### 3.5 Hủy yêu cầu hạ cấp

```
DELETE /api/v1/settings/subscription/pending-downgrade

Response 200:
{
  "message": "Đã hủy yêu cầu hạ cấp. Gói hiện tại vẫn được giữ nguyên."
}
```

### 3.6 Lấy lịch sử đơn hàng

```
GET /api/v1/settings/subscription/orders?status=all&page=1&limit=10

Query params:
  status: 'all' | 'pending' | 'paid' | 'cancelled'
  page, limit

Response 200:
{
  "orders": [
    {
      "id": "uuid",
      "order_code": "VL-202506-00001",
      "order_type": "upgrade",
      "from_plan": "Starter",
      "to_plan": "Professional",
      "billing_cycle": "monthly",
      "user_count": 10,
      "total_amount": 110000,
      "status": "pending",
      "bank_transfer_note": "VILEAD VL202506-00001 TEN001",
      "period_from": "2025-06-16",
      "period_to": "2025-07-01",
      "created_at": "2025-06-16T10:00:00Z",
      "confirmed_at": null
    }
  ],
  "pagination": { "total": 5, "page": 1, "limit": 10 }
}
```

### 3.7 Tải hóa đơn PDF

```
GET /api/v1/settings/subscription/orders/:order_id/invoice

Response: application/pdf
  File: HoaDon_VL-202506-00001.pdf
  Nội dung: Thông tin tenant + gói + số tiền + VAT + trạng thái
```

---

## 4. Frontend State Machine

### 4.1 Trạng thái hiển thị Section 1

```
subscription.status:
  'active'             → Hiển thị bình thường
  'active' + days <= 7 → Badge đỏ "Sắp hết hạn" + nút Gia hạn nổi bật
  'active' + pending_downgrade != null → Banner vàng cảnh báo hạ cấp
  'expired'            → Banner đỏ toàn section + disable hầu hết tính năng CRM
  'pending_downgrade'  → Hiển thị gói hiện tại + note "Sẽ hạ xuống [plan] vào [date]"
```

### 4.2 Trạng thái nút CTA Section 2

```
Với mỗi plan card trong bảng so sánh:

  plan == current_plan  → Nút "Đang dùng" (disabled, outline)
  plan > current_plan   → Nút "Nâng cấp" (primary)
  plan < current_plan   → Nút "Hạ cấp" (outline warning)
  
  Nếu có pending_order (status='pending'):
    → Tất cả nút đổi gói disabled + tooltip "Bạn đang có đơn chờ xử lý"
```

### 4.3 Flow submit đổi gói (frontend)

```
1. User click "Nâng cấp" / "Hạ cấp"
2. Gọi POST /calculate-prorate → hiển thị modal xác nhận
   Modal gồm:
   - Tóm tắt: Từ [gói cũ] → [gói mới]
   - Số tiền cần thanh toán (hoặc "Miễn phí, áp dụng cuối kỳ" với downgrade)
   - Với upgrade: hiện thông tin CK
   - Checkbox xác nhận "Tôi đã đọc và đồng ý"
3. User click "Xác nhận"
4. Gọi POST /change-plan
5. Nếu success:
   - Upgrade → chuyển sang màn "Chờ xác nhận" với thông tin CK
   - Downgrade → đóng modal, hiện banner cảnh báo trên Section 1
6. Nếu lỗi DOWNGRADE_USER_EXCEED → hiện dialog với hướng dẫn giảm số user
```

---

## 5. Background Jobs (Cron)

```
Job 1: check_subscription_expiry
  Schedule: Chạy mỗi ngày lúc 08:00 (Asia/Ho_Chi_Minh)
  Logic:
    - Query tenant_subscriptions WHERE status = 'active'
    - Với mỗi subscription:
        days_left = expires_at - today
        IF days_left == 30 AND chưa gửi expiry_30d → gửi + log
        IF days_left == 7  AND chưa gửi expiry_7d  → gửi + log
        IF days_left == 1  AND chưa gửi expiry_1d  → gửi + log
        IF days_left <= 0  → UPDATE status = 'expired'

Job 2: apply_pending_downgrade
  Schedule: Chạy mỗi ngày lúc 00:05
  Logic:
    - Query WHERE status = 'pending_downgrade' AND expires_at <= today
    - Với mỗi subscription:
        UPDATE plan_id = pending_plan_id
        UPDATE status = 'active'
        UPDATE pending_plan_id = NULL
        UPDATE started_at = today
        UPDATE expires_at = today + 30 days (hoặc 365 ngày nếu yearly)
        Tạo subscription_orders với order_type = 'downgrade', status = 'paid', amount = 0
        Gửi thông báo "Gói của bạn đã được cập nhật xuống [plan]"
```

---

## 6. Permissions

```
Chỉ Admin Tenant mới truy cập được tab này.
Sales, Leader: KHÔNG có quyền xem tab Gói & Thanh toán.

Middleware check:
  req.user.role === 'admin' AND req.user.tenant_id === subscription.tenant_id
```

---

## 7. Assumptions (Giả định)

| # | Giả định | Lý do |
|---|---|---|
| A1 | 1 tháng = 30 ngày cho mọi tính toán prorate | Đơn giản hóa, nhất quán |
| A2 | Không có mã giảm giá cho gói subscription | Chưa có yêu cầu |
| A3 | Admin ViLead xác nhận thủ công trong Admin Panel riêng | Ngoài scope module này |
| A4 | Hóa đơn VAT được sinh sau khi Admin ViLead xác nhận | Đảm bảo thông tin đúng |
| A5 | Không cho phép có 2 đơn pending cùng lúc cho 1 tenant | Tránh conflict |
