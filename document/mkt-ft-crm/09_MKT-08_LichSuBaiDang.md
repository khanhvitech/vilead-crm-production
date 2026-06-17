# MKT-08: Lịch sử Bài đăng toàn đội (v5 — đơn giản)

Danh sách bài đăng từ MKT Post và MKT Page — quản lý kiểm tra nhanh: ai đăng gì, ở đâu, còn sống không.

**Phân quyền:** NV **KHÔNG** có quyền (menu ẨN). TL xem nhóm. PM/Admin xem tất cả.

## Layout (3 thành phần chính)

```
[Breadcrumb: Báo cáo MKT > Lịch sử Bài đăng]
[H1] Lịch sử Bài đăng toàn đội
[Subtitle] Danh sách bài đăng từ MKT Post và MKT Page — click link để kiểm tra trên Facebook

[FilterBar - card p-4]
  [DateRange] [Nhân viên ▾] [Phần mềm ▾] [Nơi đăng ▾] [🔍 Tìm nội dung] [Xuất Excel]

[Bảng - 6 cột gọn]

[Pagination]
```

## FilterBar

| Control | Options | Width |
|---|---|---|
| DateRange | Preset 7d/30d/Tháng/Tuỳ chọn, default 7d | 220px |
| Nhân viên | Theo role (TL: nhóm, PM/Admin: tất cả) | 180px |
| Phần mềm | Tất cả / MKT Post / MKT Page | 160px |
| Nơi đăng | Tất cả / Tường cá nhân / Group / Page | 160px |
| Search | "Tìm nội dung..." + icon Search | flex-1 |
| Xuất Excel | outline + Download | auto |

Filter real-time.

## Bảng (6 cột)

Container radius 10 border `#e6ebf1`. Header bg `#fafafb` font 13px w900 UPPERCASE. Row 70px hover `#f0f7ff`, stripe chẵn `#fafafb`.

| Cột | Width | Nội dung |
|---|---|---|
| **THỜI GIAN** | 140px | `dd/MM HH:mm` |
| **NHÂN VIÊN** | 160px | Avatar 24 + Tên NV |
| **NƠI ĐĂNG** | 180px | PostLocationBadge: `Tường CN` (xanh dương) / `Group: <tên>` (xanh lá) / `Page` (tím) |
| **NỘI DUNG** | 320px | 100 ký tự đầu + truncate + tooltip full nội dung khi hover |
| **PHẦN MỀM** | 120px | Tên phần mềm + icon nhỏ |
| **LINK** | 80px | Icon `ExternalLink` 16px màu `#3e79f7`, click mở FB tab mới |

## Interaction

- **Click LINK icon:** `stopPropagation`, mở FB tab mới (`target="_blank" rel="noopener noreferrer"`)
- **Click ROW** (trừ cột LINK): mở chi tiết UID tương ứng (MKT-03a nếu Profile / MKT-03b nếu Page) → vào **Tab 3 Bài đăng**, auto scroll tới bài đó
- **Hover NỘI DUNG:** tooltip hiện nội dung đầy đủ (nếu bài > 100 ký tự)

## Pagination

`flex justify-between p-4 border-t-[#e6ebf1]`:
- Trái: "Rows per page: 20 ▾" (10/20/50/100)
- Phải: `< 1 2 3 ... >`

## Mock data

Kỳ 7 ngày ~180 bài.

Ví dụ 5 dòng đại diện:
- 18/04 14:20 · Ng.T.Hương · `Group: "Mẹ và bé HN"` · "Shop mình đang có chương trình khuyến mãi..." · MKT Post · 🔗
- 18/04 13:50 · Tr.V.Bình · `Page` · "Khuyến mãi tháng 4 giảm 20%..." · MKT Page · 🔗
- 18/04 11:30 · Lê.T.Mai · `Tường CN` · "Hôm nay thời tiết đẹp quá..." · MKT Post · 🔗
- 17/04 16:45 · Phạm.V.Đức · `Group: "Mẹ đơn thân SG"` · "Mọi người cho em hỏi..." · MKT Post · 🔗
- 17/04 10:12 · Vũ.T.Lan · `Page` · "Bài mới của shop đây ạ..." · MKT Page · 🔗

## Edge cases

- **Role NV truy cập direct URL:** redirect MKT-01 + toast "Bạn không có quyền"
- **Filter rỗng:** EmptyState icon Search mờ + "Không tìm thấy bài đăng phù hợp" + nút "Xóa bộ lọc"
- **Không có bài trong kỳ:** EmptyState "Đội chưa đăng bài nào trong khoảng đã chọn"
- **Link bài bị xoá trên FB:** vẫn hiển thị link (FB tự trả về trang không tồn tại khi click)
- **Nội dung rỗng (bài chỉ có ảnh):** hiển thị `[Bài chỉ có hình ảnh]` text mờ
- **Loading:** 10 skeleton rows height 70px

## Design rules

- Font Plus Jakarta Sans 14px · Radius `rounded-[10px]`
- **PostLocationBadge** 3 màu:
  - Tường CN: bg `rgba(62,121,247,0.15)` text `#3e79f7`
  - Group: bg `rgba(45,197,106,0.15)` text `#2dc56a`
  - Page: bg `#f5f0fa` text `#a461d8`
- Link icon: 16px `#3e79f7`, hover `#699dff`, cursor-pointer
- Row hover `#f0f7ff`, stripe chẵn `#fafafb`
- Avatar size sm (24px)
- shadcn: Table, Select, Input, DatePickerWithRange, Badge, Avatar, Pagination, Tooltip
- Icons: FileText, User, Users, Building2, Search, Download, ExternalLink
