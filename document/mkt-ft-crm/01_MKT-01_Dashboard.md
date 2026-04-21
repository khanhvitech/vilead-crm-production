# MKT-01: Dashboard Tổng quan theo ngày (v5)

Trang mặc định module. Scope data theo role.

## Layout

```
[Breadcrumb: Báo cáo MKT > Tổng quan]
[H1] Tổng quan

[FilterBar]
  [DatePicker (1 ngày)] [Phần mềm ▾] [Nhân viên ▾] [spacer] [Xuất Excel]

[Row 1 - 4 MetricCard trạng thái UID - grid-cols-4]
  TỔNG UID | UID LIVE | UID DIE | CHECKPOINT
  Mỗi card: label uppercase + số 28px bold + DeltaIndicator "so với hôm qua"

[Row 2 - ActivityHeatmap 24h] ⭐ V5 MỚI
  Card bọc, title "Hoạt động đội hôm nay"

[Row 3 - Chart xu hướng 30 ngày]
  Card bọc, LineChart 2 trục Y

[Row 4 - Bảng Hiệu suất Nhân viên]
  Card bọc, 1 bảng duy nhất (không còn tab)
```

## ActivityHeatmap 24h (V5 mới)

**Layout trong card `.card` p-6:**
```
[Title] Hoạt động đội hôm nay
[Subtitle] Biểu đồ phân bố hoạt động theo giờ

[Stacked Bar Chart]
  - Trục X: 24 giờ (0h - 23h)
  - Trục Y: Tổng số hành động
  - Stack 5 màu: 
    ● Tin nhắn (xanh #3e79f7)
    ● Bài đăng (xanh lá #2dc56a)  
    ● Like (vàng #ffc542)
    ● Bình luận (tím #a461d8)
    ● UID (cam #ff9966)
  - Height: 280px
  - Tooltip hover cột: hiển thị 5 giá trị của giờ đó

[Legend inline phía dưới chart - interactive]
  ● Tin nhắn 1240  ● Bài đăng 95  ● Like 2180  ● Bình luận 640  ● UID 520
  (click legend → toggle show/hide đường tương ứng)
```

**Quan trọng:** Mỗi legend item hiển thị luôn **tổng số** → người dùng thấy cả xu hướng theo giờ VÀ tổng ngày trong cùng 1 khối.

## Row 4 - Bảng Hiệu suất Nhân viên

Card bọc, không còn tabs (bỏ "Theo Phần mềm").

Header bg `#fafafb` font 13px w900 UPPERCASE. Row 70px hover `#f0f7ff`.

| Cột | Width | Nội dung |
|---|---|---|
| NHÂN VIÊN | 240px | Avatar 32 + Tên 14px w500 + Phòng ban subtext 12px |
| TỔNG UID | 120px | Số |
| LIVE | 100px | Số + chip xanh nhỏ nếu > 0 |
| DIE | 100px | Số + chip đỏ nếu > 0 |
| CHKP | 100px | Số |
| HOẠT ĐỘNG | 160px | Số, align right, **w600**, sort desc mặc định |

**Click row** → MKT-04 (Báo cáo theo ngày) prefilter NV đó.

## MetricCard delta logic
- UID LIVE / Hoạt động: tăng = xanh, giảm = đỏ
- UID DIE / CHECKPOINT: tăng = đỏ, giảm = xanh
- TỔNG UID: neutral (tăng xanh, giảm đỏ)

## Mock data đại diện
- Row 1: `128 ↑+3(2%)` | `95 ↑+5(5%)` | `18 ↑+2(12%)đỏ` | `10 ↓-1(9%)xanh`
- Heatmap: data 24 giờ có peak 9-11h và 14-16h
- Chart 30 ngày: 3 line (Live, Die, Hoạt động)
- Table: 8 NV sắp xếp theo Hoạt động desc

## Edge cases
- Ngày không data: metrics = 0, heatmap + chart empty với message "Không có dữ liệu"
- Role NV: ẩn filter NV, title đổi "Dashboard cá nhân"

## Design rules
- Font Plus Jakarta Sans 14px · Radius `rounded-[10px]`
- Card: border `#e6ebf1`, nền trắng, padding `p-6`
- Page bg `#f7f7f8` padding `p-6`
- Chart: Recharts `<BarChart stacked>` cho Heatmap, `<LineChart>` 2 trục cho 30 ngày
- shadcn: Card, Button, Select, DatePicker, Table, Avatar
- Icons lucide: Download, TrendingUp, TrendingDown, MessageSquare, FileText, ThumbsUp, MessageCircle, UserPlus
