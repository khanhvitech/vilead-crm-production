# MKT-02: Danh sách Tài khoản Facebook (v5)

Tra cứu UID FB, lọc/tìm kiếm, mở chi tiết. Scope theo role.

## Layout

```
[Breadcrumb: Báo cáo MKT > Tài khoản Facebook]
[H1] Tài khoản Facebook
[Subtitle] Tra cứu và quản lý toàn bộ UID Facebook đang vận hành

[FilterBar]
  [Loại ▾] [Trạng thái ▾] [Phần mềm ▾] [Nhân viên ▾]
  [🔍 Tìm UID hoặc tên... (flex-1)] [Xuất Excel]

[Summary counter] Hiển thị 98 / 128 UID (đang lọc)

[Table - có row highlight theo trạng thái] ⭐ V5 CẢI TIẾN
[Pagination]
```

## FilterBar
Card trắng p-4 radius 10px, flex flex-wrap gap-3.

| Control | Options | Width |
|---|---|---|
| Loại | Tất cả / Profile / Page | 140px |
| Trạng thái | Tất cả / Live / Die / Checkpoint / Hạn chế / Không hoạt động | 160px |
| Phần mềm | Tất cả / Care / Post / Page / UID | 160px |
| Nhân viên | Theo role (NV: ẨN) | 180px |
| Search | Placeholder "Tìm UID hoặc tên...", icon Search trái | flex-1 |
| Xuất Excel | outline + Download | auto |

Filter real-time (không cần nút Apply).

## Bảng UID với Row Highlight ⭐ V5

Container radius 10 border `#e6ebf1`. Header bg `#fafafb` font 13px w900 UPPERCASE. Row 80px hover `#f0f7ff`, stripe chẵn `#fafafb`, cursor-pointer.

**V5 Row Highlight — viền trái 3px theo trạng thái:**
- Status **Live**: không có viền (row bình thường)
- Status **Die**: `border-l-[3px] border-l-[#ff6b72]` (đỏ)
- Status **Checkpoint**: `border-l-[3px] border-l-[#ffc542]` (vàng)
- Status **Hạn chế**: `border-l-[3px] border-l-[#a461d8]` (tím)
- Status **Không hoạt động**: `border-l-[3px] border-l-[#90a4ae]` (xám)

→ Quản lý lướt nhanh nhìn thấy ngay UID nào có vấn đề.

**Cột:**

| Cột | Width | Nội dung |
|---|---|---|
| UID | 160px | `1000012345678` font-mono 13px — click copy + toast "Đã copy" |
| TÊN | 200px | Avatar 32 round-full bg `#3e79f7` + Tên 14px w500 |
| LOẠI | 100px | Badge `Profile` (xám nhạt) / `Page` (tím nhạt) |
| TRẠNG THÁI | 140px | StatusChip |
| P.MỀM | 120px | Tên + icon; Die/Hạn chế = `—` |
| NV GIỮ | 160px | Avatar 24 + Tên |
| THAO TÁC CUỐI | 200px | `Gửi tin · 2 phút trước` |

**Click row** (trừ cột UID): mở MKT-03a (nếu profile) hoặc MKT-03b (nếu page).

## Pagination
`flex justify-between p-4 border-t-[#e6ebf1]`.
Trái: "Rows: 20 ▾" (10/20/50/100). Phải: `< 1 2 3 ... >`.

## Mock data đại diện
- 20-30 row mix Profile/Page, đủ các trạng thái
- Vài UID Die có viền đỏ, Checkpoint có viền vàng → thấy rõ sự khác biệt

## Edge cases
- Filter rỗng: EmptyState icon Search mờ + "Không tìm thấy UID" + nút "Xóa bộ lọc"
- Tổng = 0: "Chưa có UID nào được đồng bộ — kiểm tra Agent"
- UID/tên dài: truncate + tooltip
- Loading: 5 skeleton rows height 80px

## Design rules
- Font Plus Jakarta Sans 14px · Radius `rounded-[10px]`
- Row highlight: `border-l-[3px]` color theo trạng thái, các row Live không có border-l
- shadcn: Input (Search icon absolute trái), Select, Table, Badge, Button, Avatar
- Icons: Search, Download, Copy, Check
- StatusChip tái dùng từ file 00
