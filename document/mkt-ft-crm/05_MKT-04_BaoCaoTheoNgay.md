# MKT-04: Báo cáo theo ngày — Toàn đội (v5)

Báo cáo phân tích theo kỳ với layout **Master-Detail 2 panel**. Scope theo role.

## Layout

```
[Breadcrumb: Báo cáo MKT > Báo cáo theo ngày]
[H1] Báo cáo theo ngày

[FilterBar]
  [DateRange preset 7d/14d/30d/Tháng, default 7d] [Phần mềm ▾] [NV/Nhóm ▾] [spacer] [Xuất Excel]

[Summary Strip - 5 MetricCard không delta - grid-cols-5]
  Tổng UID | Tin nhắn | Bài đăng | Like+BL | UID thu thập

[Main layout - Master-Detail 2 panel, height 600px] ⭐ V5 MỚI
  ┌─ Panel trái (40%) ─┐ ┌─ Panel phải (60%) ──────────┐
  │ [Switcher]         │ │ [Header: tên item đang chọn] │
  │ ○ Nhân viên        │ │                              │
  │ ○ Phần mềm         │ │ [Tabs: Tổng quan | Bài đăng] │
  │ ○ Ngày             │ │                              │
  │                    │ │ [Tab content tuỳ chọn]       │
  │ [🔍 Search...]     │ │                              │
  │                    │ │                              │
  │ [Scrollable list]  │ │                              │
  │ ▸ Item 1 (xxx)     │ │                              │
  │   Item 2 (xxx)     │ │                              │
  │   Item 3 (xxx)     │ │                              │
  └────────────────────┘ └──────────────────────────────┘
```

## Panel trái (40% width)

### 1. Switcher — Chế độ xem
Component: `<RadioGroup>` shadcn hoặc `<Tabs variant="pills">`. 3 options:
- **Nhân viên** (mặc định, ẩn với role NV)
- **Phần mềm**
- **Ngày**

### 2. Search bar
Input text, placeholder theo mode: "Tìm nhân viên..." / "Tìm phần mềm..." / "Tìm ngày..."

### 3. List (scrollable, max-height 480px, overflow-y-auto)

**Mode "Theo Nhân viên":**
```
[Avatar 32] Nguyễn Thị Hương               [Chip] 4,035 HĐ
            Team A · 24 UID vận hành
─────────────────────────────────────────────
[Avatar 32] Trần Văn Bình                   [Chip] 3,820
            Team A · 18 UID
─────────────────────────────────────────────
...
```
- Mỗi item: padding `p-3`, border-bottom `#e6ebf1`, cursor-pointer
- Item **đang chọn**: bg `#f0f7ff`, border-left 3px `#3e79f7`
- Item hover: bg `#fafafb`
- Sắp xếp giảm dần theo HĐ

**Mode "Theo Phần mềm":**
```
[Icon] MKT Care                              [Chip] 4,200 HĐ
       5 NV · 48 UID
```

**Mode "Theo Ngày":**
```
Thứ 6 · 18/04/2026                          [Chip] 5,800 HĐ
8 NV · 95 UID hoạt động
```

## Panel phải (60% width)

Khi **chưa chọn item nào:** hiển thị EmptyState giữa panel: icon MousePointer + "Chọn một mục bên trái để xem chi tiết"

Khi **đã chọn item:**

### Header panel phải
```
[Avatar lớn nếu NV] Nguyễn Thị Hương              [Xuất Excel]
Team A · Nhân viên
Kỳ 12/04/2026 - 18/04/2026
```

### 2 tabs trong panel phải

**Tab 1 — Tổng quan** (nội dung tuỳ mode):
- Mode **Theo NV:** 3 mini-card metric (UID Live/Die · Hoạt động · UID lấy) + Bảng theo phần mềm (3-4 row) + Bảng theo máy (2-3 row)
- Mode **Theo Phần mềm:** 3 mini-card (Tổng NV · Tổng UID · Tổng HĐ) + Bảng NV dùng phần mềm
- Mode **Theo Ngày:** 3 mini-card (NV HĐ · UID HĐ · Tổng HĐ) + Bảng chi tiết theo NV trong ngày

**Tab 2 — Bài đăng:** Danh sách link bài đăng liên quan tới item đang chọn.
```
[Table 4 cột]
| THỜI GIAN | NƠI ĐĂNG | NỘI DUNG | LINK 🔗 |
[Pagination 10/trang]
```

## Mock data
8 NV · 4 phần mềm · 7 ngày (12-18/04). Mỗi NV có data đầy đủ fill panel phải.

## Edge cases
- Role NV: ẨN mode "Theo NV", mặc định "Theo Phần mềm"
- Kỳ > 90 ngày: cảnh báo
- List rỗng: EmptyState
- Switch mode: reset selection, panel phải về EmptyState
- Loading: skeleton list + skeleton card

## Design rules
- Font Plus Jakarta Sans 14px, radius `rounded-[10px]`
- Layout: `grid grid-cols-[40%_60%] gap-4`
- Cả 2 panel: bg white, border `#e6ebf1`, radius 10
- Item selected: bg `#f0f7ff`, border-left 3px `#3e79f7`
- Switcher: `<Tabs>` hoặc `<RadioGroup>` pill style
- shadcn: Tabs, RadioGroup, Card, Input, Table, Avatar, Badge, Pagination
- Icons: User, Monitor, Calendar, Download, ExternalLink, MousePointer
