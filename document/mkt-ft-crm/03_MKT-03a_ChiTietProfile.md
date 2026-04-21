# MKT-03a: Chi tiết UID — Profile (v5)

Header cố định + 4 tab. Scope theo role.

## Layout tổng

```
[Breadcrumb: Báo cáo MKT > Tài khoản Facebook > Mai Anh Nguyen]

[Header Card - p-6]
  [Avatar 64px] Tên 22px bold + [StatusChip lớn] + (Từ dd/MM/yyyy)
                UID: 100012... [📋 copy] · [Badge Profile tím nhạt]
  ─── border-top ───
  Quick info: Phần mềm · NV giữ · Máy · Cập nhật

[Tabs] Tổng quan | Lịch sử Hoạt động | Bài đăng & Bình luận | Trạng thái
[Tab Content]
```

## TAB 1 — Tổng quan (V5 gọn lại) ⭐

**Row 1 — 2 card info (grid-cols-2):** Giữ nguyên
- **Card "Đang làm gì":** Phần mềm · Hành động · Lúc
- **Card "Ai đang giữ":** Avatar 48 + Tên + Dept + Máy

**Row 2 — "Sức khoẻ hôm nay" — 1 KHỐI INLINE (V5):**

```
[Card p-6]
  [Label] Sức khoẻ hôm nay · 18/04/2026
  
  [Grid 4 cột × 2 hàng - icon + số + nhãn]
  💬 120 Tin nhắn    👍 56 Like          💭 23 Bình luận    ➕ 12 Kết bạn
  📝 5 Bài đăng      🎯 48 UID lấy       ↩️ 3 Chia sẻ       🔗 3 Group
  
  [Link nhỏ] "Xem chi tiết tại Tab Lịch sử Hoạt động →"
```

**Spec item:** flex items-center gap-3. Icon 20px `#3e79f7`. Số 20px w700 `#1a3353`. Nhãn 13px `#455560`. Link `#3e79f7` hover underline.

→ 8 chỉ số gọn trong 1 card, không còn 5 section × 20 mini-card.

## TAB 2 — Lịch sử Hoạt động (V5 thêm DateRange)

```
[Filter row - card p-4]
  [DateRangePicker preset 7d/30d/Tháng/Tuỳ chọn, default 30d]

[Chart Card] "Hoạt động theo ngày" + legend toggle
  Stacked BarChart - cột = ngày, stack = Tin/Like/BL/Bài/UID, height 320px

[Table]
NGÀY | TRẠNG THÁI | TIN | LIKE | BL | BÀI | UID | TỔNG
Row cuối "TỔNG" bg `#fafafb` w700 border-top đậm
Số 0 = `—` mờ
```

## TAB 3 — Bài đăng & Bình luận (V5 — 2 sub-tab + full filter) ⭐

```
[Sub-tabs: Bài đăng | Bình luận]

─── Sub-tab BÀI ĐĂNG ───
[FilterBar]
  [DateRange] [Nơi đăng ▾: Tất cả/Tường CN/Group] [Phần mềm ▾] [🔍 Search] [Xuất Excel]
[Table 5 cột]
| THỜI GIAN | NƠI ĐĂNG | NỘI DUNG (100 ký tự) | LINK 🔗 | PHẦN MỀM |
[Pagination 20/trang]

─── Sub-tab BÌNH LUẬN ───
[FilterBar]
  [DateRange] [Phần mềm ▾] [🔍 Search] [Xuất Excel]
[Table 4 cột]
| THỜI GIAN | NỘI DUNG BL | LINK BÀI GỐC 🔗 | PHẦN MỀM |
[Pagination 20/trang]
```

**Filter:**
- Bài đăng: DateRange + **Nơi đăng** (Tường CN/Group) + Phần mềm (MKT Post/Page) + Search
- Bình luận: DateRange + Phần mềm (MKT Care/Post/Page) + Search (KHÔNG có Nơi đăng)

**Cột LINK:** Icon ExternalLink 16px `#3e79f7`, `target="_blank"`.
**Cột NỘI DUNG:** Truncate 100 ký tự + tooltip full.

## TAB 4 — Trạng thái (V5 — UnifiedTimeline) ⭐

```
[Filter row - card p-4]
  [DateRange]  [Loại sự kiện ▾: Tất cả/Trạng thái/Chuyển NV/Chuyển phần mềm]

[UnifiedTimeline - 1 timeline dọc gộp 3 loại sự kiện, mới nhất lên đầu]

●─── 18/04/2026 14:23  [Chip: Trạng thái đỏ]
│    Live → Checkpoint
│    Lý do: Yêu cầu xác minh
│    NV: Ng.T.Hương · MKT Care
│
●─── 15/04/2026 09:00  [Chip: Chuyển NV xanh dương]
│    Tr.V.Bình → Ng.T.Hương · MKT Care
│
●─── 10/04/2026 08:30  [Chip: Chuyển phần mềm tím]
│    MKT Post → MKT Care · NV: Tr.V.Bình
```

**Spec Timeline:**
- Dot 12px trái (màu theo chip), line `#e6ebf1` nối
- Sắp xếp mới nhất lên đầu, scroll nội bộ nếu > 20 mốc (`max-h-[70vh] overflow-y-auto`)
- Mỗi mốc card p-3 với:
  - Timestamp 13px `#72849a`
  - Chip loại sự kiện: Trạng thái (màu status) / Chuyển NV (`#3e79f7`) / Chuyển phần mềm (`#a461d8`)
  - Nội dung chính format `<từ> → <đến>`
  - Sub-info: NV · Phần mềm

**Filter "Loại sự kiện":** chỉ hiện mốc tương ứng, các mốc khác ẩn.

## Mock data
UID `100012345678901` "Mai Anh Nguyen" Live · Tab 1: 120 tin, 56 like, 3 bài · Tab 3 Bài: 15 bài (Tường CN + Group) · Tab 3 BL: 40 comment · Tab 4: 5-7 mốc lẫn 3 loại sự kiện.

## Edge cases
- UID Die: Tab 1 "Tài khoản đã die", số liệu = 0
- Tab 3 sub-tab rỗng: EmptyState
- Tab 4 filter không data: "Không có sự kiện loại này trong kỳ"
- Role NV sai quyền: redirect + toast

## Design rules
- Font Plus Jakarta Sans 14px, radius `rounded-[10px]`
- Sub-tabs Tab 3: `<Tabs>` shadcn nhỏ hơn tabs chính
- Tab 1 icon: mỗi icon 1 màu theo ý nghĩa hoặc `#3e79f7`
- Timeline chip: 3 màu phân biệt loại sự kiện
- Link cell: text `#3e79f7` + ExternalLink 14px
- shadcn: Card, Tabs, Table, DatePickerWithRange, Avatar, Badge, Pagination, Tooltip
- Icons: Copy, ExternalLink, MessageSquare, ThumbsUp, MessageCircle, FileText, UserPlus, Share2, Users
