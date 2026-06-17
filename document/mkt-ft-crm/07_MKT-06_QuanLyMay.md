# MKT-06: Quản lý Máy tính (v5 — giữ nguyên)

Nằm trong nhóm **Cài đặt** (không phải Báo cáo MKT). Admin full; PM/TL xem; NV không truy cập.

## Layout

```
[Breadcrumb: Cài đặt > Quản lý Máy tính]
[Header flex justify-between]
  Trái: [H1] Quản lý Máy tính + subtitle
  Phải: [+ Thêm máy] (chỉ Admin) → mở MKT-07 modal

[Summary mini - grid-cols-4, p-4]
  Tổng máy (Monitor) | Online (Wifi xanh) | Offline (WifiOff xám) | NV có máy (Users)

[FilterBar]
  [Trạng thái ▾] [NV/Nhóm ▾] [🔍 Tìm tên máy...]

[Table]
```

## Summary mini (4 card)
Padding p-4 (gọn). Icon 20px trái, value 22px w700.

| Card | Icon | Ý nghĩa |
|---|---|---|
| Tổng máy | Monitor | 15 |
| Online | Wifi xanh | 12 |
| Offline | WifiOff xám | 3 |
| NV có máy | Users | 8 |

## FilterBar
| Control | Options |
|---|---|
| Trạng thái | Tất cả / Online / Offline |
| NV/Nhóm | Theo role |
| Search | "Tìm theo tên máy...", flex-1 |

## Table
Container radius 10 border `#e6ebf1`. Header bg `#fafafb` font 13px w900 UPPERCASE. Row 70px hover `#f0f7ff`.

| Cột | Width | Nội dung |
|---|---|---|
| TÊN MÁY | 200px | Tên font-mono 14px w500 |
| NV ĐƯỢC GÁN | 240px | Avatar 32 + Tên + Phòng ban (subtext 12px mờ) |
| ĐỒNG BỘ CUỐI | 160px | Relative time + tooltip timestamp đầy đủ |
| TRẠNG THÁI | 140px | StatusChip Online (`#2dc56a`) / Offline (xám) |
| ACTIONS | 80px | Dropdown `⋯` (chỉ Admin) |

**Logic Online/Offline:**
- Online: last_sync < 30 phút
- Offline: last_sync >= 30 phút

**Màu thời gian đồng bộ:**
- < 30 phút: text `#455560`
- 30p-24h: text vàng `#ffc542`
- > 24h: text đỏ `#ff6b72`

## Actions Dropdown (Admin only)
- `Sửa tên máy` → Modal nhỏ
- `Đổi NV gán` → Modal chọn NV
- `Xem mã kết nối` → Modal hiện lại mã
- `Vô hiệu hoá` → AlertDialog confirm (text đỏ `#ff6b72`)

## Mock data
15 máy, 8 NV:
- `MAY-HUONG-01` · Ng.T.Hương · 2 phút trước · Online
- `MAY-HUONG-02` · Ng.T.Hương · 15 phút trước · Online
- `MAY-BINH-01` · Tr.V.Bình · 8 giờ trước · Offline (vàng)
- `MAY-MAI-01` · Lê.T.Mai · 3 ngày trước · Offline (đỏ)
- Summary: 15 · 12 · 3 · 8

## Edge cases
- Máy gán NV đã nghỉ: avatar + tên + badge "Đã nghỉ" xám
- Máy chưa gán NV: "Chưa gán" mờ + icon AlertCircle
- 0 máy: EmptyState "Chưa có máy tính nào kết nối. Nhấn Thêm máy để bắt đầu" + CTA (Admin)
- Filter rỗng: "Không tìm thấy máy phù hợp" + Xóa bộ lọc
- Role PM/TL: ẩn nút "+ Thêm máy" + cột Actions
- Role NV: redirect + toast "Bạn không có quyền"

## Design rules
- Font Plus Jakarta Sans 14px · Radius `rounded-[10px]`
- Summary card p-4 (gọn hơn MetricCard chuẩn)
- Dropdown "Vô hiệu hoá" text `#ff6b72`
- AlertDialog confirm "Vô hiệu hoá máy <tên>?" + description
- Hover thời gian: tooltip `18/04/2026 14:35`
- shadcn: Table, DropdownMenu, AlertDialog, Tooltip, Badge, Avatar
- Icons: Monitor, Wifi, WifiOff, Users, Plus, MoreHorizontal, Edit, UserCog, KeyRound, Trash2, AlertCircle
