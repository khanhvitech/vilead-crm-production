# MKT-05: Báo cáo của tôi (Cá nhân) — v5

Màn chỉ dành cho **Nhân viên** — xem báo cáo cá nhân nhanh chóng. Khác với Dashboard: có thêm **danh sách bài đăng hôm nay kèm link**.

## Phân quyền
- **NV:** Thấy menu + truy cập được
- **TL/PM/Admin:** Menu ẨN (không thấy link). Nếu truy cập direct URL: redirect MKT-01.

## Layout

```
[Breadcrumb: Báo cáo MKT > Báo cáo của tôi]
[H1] Báo cáo của tôi
[Subtitle] Xem hoạt động cá nhân theo ngày

[FilterBar - gọn hơn Dashboard]
  [DatePicker (1 ngày)]  [spacer]  [Xuất Excel cá nhân]

[Row 1 - 3 MetricCard trạng thái UID cá nhân]
  UID của tôi | Live | Die (có thì mới hiển thị)

[Row 2 - So sánh kỳ]
  Card so sánh: Hôm nay vs Hôm qua · Trung bình 7 ngày gần nhất

[Row 3 - Hoạt động hôm nay của tôi]
  Card với 6-8 icon+số (tương tự Tab 1 của MKT-03)

[Row 4 - Danh sách bài đăng hôm nay của tôi] ⭐ ĐẶC TRƯNG MKT-05
  Bảng: THỜI GIAN | NƠI ĐĂNG | NỘI DUNG | LINK 🔗 | PHẦN MỀM

[Row 5 - Bảng UID của tôi]
  Bảng: UID | TÊN | LOẠI | TRẠNG THÁI | THAO TÁC CUỐI
```

## Chi tiết các khối

### Row 1 — MetricCard cá nhân
3 card nhỏ hơn MetricCard Dashboard (padding `p-4`):

| Card | Giá trị mẫu |
|---|---|
| UID của tôi | 24 |
| UID Live | 20 |
| UID Die / Checkpoint (gộp) | 4 (chỉ hiển thị nếu > 0) |

### Row 2 — So sánh kỳ (V5 đặc trưng)
```
[Card p-6]
  [Label] So sánh hiệu suất
  
  [Grid 3 cột]
  ┌─ Hôm nay ──┐  ┌─ Hôm qua ─┐  ┌─ TB 7 ngày ─┐
  │ 847 HĐ     │  │ 720 HĐ     │  │ 680 HĐ       │
  │ ↑ +18%     │  │ —          │  │ ↑ +25%       │
  └────────────┘  └────────────┘  └──────────────┘
```

So sánh % được tính so với con số "Hôm nay". → NV thấy nhanh mình làm tốt hơn hôm qua và trung bình tuần.

### Row 3 — Hoạt động hôm nay (giống Tab 1 MKT-03)

Grid 4 cột icon+số:
```
💬 120 Tin       👍 56 Like       💭 23 BL       ➕ 12 Kết bạn
📝 5 Bài         🎯 48 UID        ↩️ 3 Share      🔗 3 Group
```

### Row 4 — Danh sách bài đăng hôm nay ⭐

Card bọc, tiêu đề "Bài đăng của tôi hôm nay (5)".

Bảng gọn 5 cột:
| THỜI GIAN | NƠI ĐĂNG | NỘI DUNG (80 ký tự) | LINK 🔗 | PHẦN MỀM |

- Không có filter (data chỉ ngày được chọn, của chính mình)
- Không pagination (thường < 20 bài/ngày)
- Click LINK → mở FB tab mới

### Row 5 — UID của tôi

Card bọc, tiêu đề "Tất cả UID tôi đang vận hành".

Bảng gọn:
| UID | TÊN | LOẠI | TRẠNG THÁI | THAO TÁC CUỐI |

- Row height 60px (thấp hơn MKT-02 80px)
- Click row → mở MKT-03a hoặc 03b chi tiết

## Mock data (NV Nguyễn Thị Hương)
- 24 UID cá nhân, 20 Live, 3 Die, 1 Checkpoint
- Hôm nay: 120 tin, 56 like, 5 bài...
- Hôm qua: 100 tin, 45 like... (tổng 720)
- TB 7 ngày: 680
- 5 bài đăng hôm nay với link
- UID list: 24 UID hiển thị

## Edge cases
- Ngày không có data: Row 1 metrics = 0, Row 3 cards = 0, Row 4 EmptyState "Chưa đăng bài nào hôm nay"
- TL/PM/Admin truy cập: redirect MKT-01 + toast "Trang này chỉ dành cho nhân viên"
- NV mới chưa có UID: Row 5 EmptyState "Chưa có UID nào được gán cho bạn"
- Loading: skeleton 5 row

## Design rules
- Font Plus Jakarta Sans 14px, radius `rounded-[10px]`
- Page padding `p-6`, bg `#f7f7f8`
- Card spacing `gap-6` giữa các row
- MetricCard nhỏ: p-4 thay vì p-6 (giảm visual weight vì chỉ 3 card)
- Card so sánh: nền trắng, highlight "Hôm nay" với viền trái `#3e79f7`
- Link cell: text `#3e79f7` + ExternalLink 14px, `target="_blank"`
- shadcn: Card, DatePicker, Table, Button
- Icons: Download, TrendingUp, TrendingDown, MessageSquare, ThumbsUp, MessageCircle, UserPlus, FileText, Target, Share2, Users, ExternalLink
