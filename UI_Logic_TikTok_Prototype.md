# UI & Logic Requirements — TikTok Business Chat
## Prototype Integration Guide | ViLead OmniChat

> **Mục đích:** Tài liệu này mô tả các thay đổi giao diện và logic cần bổ sung vào prototype OmniChat hiện tại để hỗ trợ kênh TikTok Business Chat.
> **Đọc cùng với:** BRD/FRD v0.3 + User Stories v1.0
> **Nguyên tắc:** Kế thừa tối đa UI hiện có — chỉ bổ sung/điều chỉnh những gì đặc thù của TikTok.

---

## 1. Modal Quản lý kết nối

### 1.1 Dropdown "Thêm kết nối mới"
**Hiện tại:** Zalo cá nhân | Zalo OA

**Bổ sung:**
```
Kết nối Zalo cá nhân
Kết nối Zalo OA
Kết nối Facebook Fanpage
► Kết nối TikTok Business   [NEW]
```

**Logic:**
- Khi chọn "TikTok Business" → hiển thị thông tin điều kiện: *"Yêu cầu tài khoản TikTok Business Account. Không khả dụng tại US, EU, UK."*
- Nút [Tiếp tục] → redirect sang OAuth TikTok

---

### 1.2 Card kênh TikTok trong danh sách kết nối
**Kế thừa:** Cùng layout card với Zalo/Facebook

**Bổ sung cho card TikTok:**

| Thành phần | Mô tả |
|---|---|
| Icon kênh | Logo TikTok (đen/trắng) |
| Badge loại | `TikTok Business` (màu đen) |
| Badge trạng thái | `● Đã kết nối` (xanh) / `● Mất kết nối` (đỏ) / `⚠ Cần xử lý` (cam) / `↻ Token sắp hết` (vàng) |
| Nút hành động | [Ngắt kết nối] + [✕] xóa |
| Sub-actions | [Thiết lập nhân viên] \| [Phân ca] \| [Lịch sử] |

**Logic trạng thái:**
```
connected     → badge xanh, nút [Ngắt kết nối] active
disconnected  → badge đỏ,  nút [Kết nối lại] thay thế [Ngắt kết nối]
action_required → badge cam, banner inline: "Phiên đăng nhập hết hạn. Vui lòng kết nối lại."
token_expiring  → badge vàng, không cần Admin can thiệp (hệ thống tự làm mới)
```

---

## 2. Danh sách hội thoại (Sidebar trái)

### 2.1 Icon kênh trên mỗi hội thoại
**Kế thừa:** Icon Zalo/Facebook đã có ở góc dưới avatar

**Bổ sung:** Icon TikTok tại vị trí tương tự

```
Avatar KH
  └─ [TikTok icon] ← góc dưới phải avatar
```

### 2.2 Badge cửa sổ phản hồi 48h  *(chỉ có ở TikTok)*
Hiển thị bên phải tên hội thoại, cạnh timestamp:

| Trạng thái | Badge | Màu |
|---|---|---|
| Còn > 2 giờ | `⏱ 36h 20m` | Xanh lá `#1A7A3C` |
| Còn 1–2 giờ | `⚠ 1h 45m` | Vàng `#E67E22` |
| Còn < 1 giờ | `🔴 45m` | Đỏ `#C0392B` |
| Hết hạn | `⏰ Hết hạn` | Xám `#888888` |

**Logic:**
- Badge chỉ render cho hội thoại có `source_channel = 'tiktok'`
- Cập nhật realtime — không cần reload
- Khi còn < 2h: hội thoại được pin lên đầu nhóm hiện tại trong danh sách

### 2.3 Bộ lọc kênh (filter bar)
**Kế thừa:** Filter bar hiện có (Tất cả | Facebook | Zalo | Zalo OA)

**Bổ sung:** Tab `TikTok` vào filter bar

---

## 3. Khung chat giữa

### 3.1 Header hội thoại TikTok
**Kế thừa:** Header hiện có (avatar, tên, trạng thái online, icon chuông, tìm kiếm, đóng)

**Bổ sung — Thanh trạng thái cửa sổ 48h** (ngay dưới header, chỉ hiện với TikTok):

```
┌─────────────────────────────────────────────────────────────┐
│  ⏱  Cửa sổ phản hồi: Còn 36 giờ 20 phút          [?]     │  ← xanh
└─────────────────────────────────────────────────────────────┘
```

Màu thanh thay đổi theo ngưỡng:
- `> 2h` → nền xanh nhạt `#E9F7EF`, text xanh
- `1–2h` → nền vàng nhạt `#FEF9E7`, text vàng cam
- `< 1h` → nền đỏ nhạt `#FDECEA`, text đỏ
- `= 0` → nền đỏ đậm, text trắng: **"Cửa sổ phản hồi đã hết hạn. Chờ khách hàng nhắn lại."**

**Logic:**
- Icon `[?]` mở tooltip giải thích: *"TikTok chỉ cho phép phản hồi trong 48h kể từ tin nhắn cuối của khách. Tự động reset khi khách nhắn lại."*

### 3.2 Bộ đếm tin nhắn *(chỉ TikTok)*
Hiển thị góc trên phải khung chat, bên cạnh thanh cửa sổ:

```
Đã gửi: 3/10 tin  ← xanh khi ≤ 7, vàng khi 8–9, đỏ khi = 10
```

**Logic:**
- Khi đạt 10/10: hiển thị tooltip "Đã đạt giới hạn tin nhắn. Chờ khách hàng phản hồi để tiếp tục."
- Reset về 0/10 khi khách gửi tin mới

### 3.3 Context menu tin nhắn (right-click)
**Kế thừa cấu trúc hiện có**, nhưng điều chỉnh cho TikTok:

| Action | Zalo/Facebook | TikTok |
|---|---|---|
| Sao chép tin nhắn | ✅ | ✅ |
| Chọn nhiều tin nhắn | ✅ | ✅ |
| Xóa tin nhắn phía tôi | ✅ | ❌ *(ẩn — TikTok không hỗ trợ)* |

---

## 4. Toolbar gửi tin

### 4.1 Trạng thái bình thường (cửa sổ còn hạn)
**Kế thừa:** Toolbar hiện có

**Điều chỉnh cho TikTok** — ẩn các icon không được hỗ trợ:

| Icon | Zalo/Facebook | TikTok | Ghi chú |
|---|---|---|---|
| 📷 Gửi ảnh | ✅ | ✅ *(tùy thị trường)* | Chỉ JPG/PNG, max 5MB |
| 📁 Gửi file | ✅ | ❌ ẩn | TikTok không hỗ trợ |
| ✂️ Expand | ✅ | ✅ | Giữ nguyên |
| 😊 Emoji | ✅ | ✅ | Giữ nguyên |
| 🔔 Nhắc hẹn | ✅ | ✅ | CRM action — giữ nguyên |
| → Gửi | ✅ | ✅ | Giữ nguyên |

**Logic icon ảnh trên TikTok:**
- Nếu thị trường không hỗ trợ → icon ảnh bị disable (màu xám) kèm tooltip: *"Gửi ảnh không khả dụng tại khu vực này."*

### 4.2 Trạng thái cửa sổ hết hạn
Toàn bộ toolbar bị vô hiệu hóa:

```
┌──────────────────────────────────────────────────────────────┐
│  Chờ khách hàng nhắn lại để tiếp tục hội thoại...           │
│  [📷 xám]  [✂️ xám]  [😊 xám]  [🔔 xám]        [Gửi xám]  │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Panel phải — Tab Đồng bộ

### 5.1 Trạng thái chưa liên kết
**Kế thừa:** Layout panel phải hiện có

**Nội dung khi chưa liên kết:**
```
┌─────────────────────────────────────────────────────┐
│  ○  Chưa liên kết với CRM                           │
│     Hội thoại này chưa được gắn với Lead/KH nào     │
│                                                      │
│  [+ Tạo Lead mới]    [🔍 Tìm kiếm Lead/KH]          │
└─────────────────────────────────────────────────────┘
```

**Form tạo Lead nhanh** (popup/slide-in):
```
Tên *          [________________]
SĐT            [________________]
Email          [________________]
Pipeline *     [Dropdown________]
Nguồn          TikTok  ← readonly, tự động điền
               [Hủy]  [Tạo Lead]
```

### 5.2 Trạng thái đã liên kết
**Kế thừa:** Layout hiện có của tab Đồng bộ Zalo/Facebook

**Bổ sung badge kênh TikTok:**
```
●  Đã kết nối với CRM
   [TikTok icon] 1 TikTok   ← badge màu đen
```

**Logic nút Thao tác nhanh:** Giữ nguyên 5 action hiện có:
1. Xem chi tiết
2. Chuyển trạng thái
3. Tạo đơn hàng
4. Tạo task nhanh
5. Thêm ghi chú

---

## 6. Panel phải — Tab File chia sẻ

### 6.1 Điều chỉnh bộ lọc cho TikTok
**Kế thừa:** Layout tab File chia sẻ hiện có

**Điều chỉnh bộ lọc "Loại file"** khi đang xem hội thoại TikTok:

| Filter | Zalo/Facebook | TikTok |
|---|---|---|
| Tất cả | ✅ | ✅ |
| File | ✅ | ❌ ẩn |
| Image | ✅ | ✅ |
| Video | ✅ | ❌ ẩn |

**Logic:** Các nút "File" và "Video" bị ẩn (không chỉ disable) khi `source_channel = 'tiktok'`.

---

## 7. Thông báo (Notifications)

### 7.1 Thông báo cảnh báo cửa sổ 48h
**Bổ sung loại thông báo mới** vào hệ thống notification hiện có:

| Loại | Trigger | Nội dung | Destination |
|---|---|---|---|
| `tiktok_window_warning` | Còn 2 giờ | *"Hội thoại [Tên KH] sắp hết cửa sổ phản hồi (còn ~2h)"* | Agent được gán |
| `tiktok_channel_error` | Kênh mất kết nối | *"Kênh TikTok mất kết nối. Vui lòng kiểm tra và kết nối lại."* | Admin |
| `tiktok_token_expired` | Refresh token hết hạn | *"Phiên TikTok đã hết hạn. Cần kết nối lại để tiếp tục nhận tin nhắn."* | Admin |

**Logic:**
- `tiktok_window_warning`: chỉ gửi **1 lần** khi vượt ngưỡng 2h — không lặp lại
- Các thông báo Admin hiển thị kèm nút [Xử lý ngay] dẫn thẳng vào modal Quản lý kết nối

---

## 8. Các màn hình không thay đổi

Các thành phần sau **không cần chỉnh sửa** — kế thừa nguyên vẹn từ OmniChat hiện có:

- Modal Thiết lập nhân viên (phân quyền) → dùng lại hoàn toàn
- Modal Phân ca trực → dùng lại hoàn toàn
- Tab Lịch sử thay đổi → dùng lại hoàn toàn
- Cơ chế Queue và Round-Robin routing → không thay đổi
- Tìm kiếm và lọc hội thoại → chỉ bổ sung filter kênh TikTok

---

## 9. Tóm tắt thay đổi theo component

| Component | Loại thay đổi | Mức độ |
|---|---|---|
| Dropdown "Thêm kết nối mới" | Thêm option TikTok | Nhỏ |
| Card kênh trong modal kết nối | Thêm card TikTok + 4 trạng thái | Trung bình |
| Filter bar danh sách hội thoại | Thêm tab TikTok | Nhỏ |
| Card hội thoại trong sidebar | Thêm badge cửa sổ 48h | Trung bình |
| Header khung chat | Thêm thanh trạng thái 48h + bộ đếm 10 tin | Trung bình |
| Context menu tin nhắn | Ẩn "Xóa tin nhắn" với TikTok | Nhỏ |
| Toolbar gửi tin | Ẩn icon file/video với TikTok; disable khi hết cửa sổ | Trung bình |
| Panel phải — Tab Đồng bộ | Thêm trạng thái chưa liên kết + form tạo Lead nhanh | Lớn |
| Panel phải — Tab File chia sẻ | Ẩn filter File/Video với TikTok | Nhỏ |
| Hệ thống thông báo | Thêm 3 loại notification mới | Trung bình |

---

*Tài liệu nội bộ — ViLead Product Team — 07/05/2026*
