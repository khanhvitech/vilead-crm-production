# 00 — Spec BA Chung (đọc context, KHÔNG paste Readdy) — v5

## Module
**Quản lý & Báo cáo Tài khoản Facebook** — tập trung data từ phần mềm MKT (Care/Post/Page/UID) qua MKT Sync Agent → CRM ViLead (sync 15p/lần).

Mục tiêu v5: **giao diện đơn giản, dễ dùng** — giảm overload, tập trung đúng mục đích từng màn.

## Actors & Phân quyền data
| Role | Scope |
|---|---|
| NV | Chỉ bản thân (filter NV ẩn) |
| TL | Nhóm (phòng ban) |
| PM/Admin | Tất cả |

## Navigation — Menu 2 cấp
```
Sidebar CRM
├── ... (các module khác)
├── ⚙ Cài đặt
│   └── Quản lý Máy tính (MKT-06) [Admin/PM/TL]
│
└── 📊 Báo cáo MKT                  ← cấp 1 (collapsible)
    ├── Tổng quan                    → MKT-01
    ├── Tài khoản Facebook           → MKT-02 → MKT-03a/b (chi tiết)
    ├── Lịch sử Bài đăng             → MKT-08 (ẩn NV)
    ├── Báo cáo theo ngày            → MKT-04
    └── Báo cáo của tôi              → MKT-05 (chỉ NV thấy)
```

## Trạng thái UID
| Trạng thái Profile | Màu | Class |
|---|---|---|
| Live | `#2dc56a` | omi-badge-success |
| Die | `#ff6b72` | omi-badge-danger |
| Checkpoint | `#ffc542` | omi-badge-warning |
| Hạn chế | `#a461d8` | omi-badge-secondary |
| Không hoạt động | `#90a4ae` | custom xám |

Trạng thái Page: **Hoạt động / Bị hạn chế / Bị xoá**.

## Loại nơi đăng (PostLocation)
- **Tường cá nhân** (personal) — Profile
- **Group** (group) — Profile đăng vào group, kèm tên group
- **Page** (page) — Page đăng bài của chính mình

## Component dùng chung (tái sử dụng xuyên màn)
- **StatusChip** — trạng thái UID/máy
- **DeltaIndicator** — mũi tên + % so ngày trước
- **MetricCard** — card p-6, label UPPERCASE + số 28px + delta
- **PostLocationBadge** — Tường CN (xanh dương) / Group (xanh lá) / Page (tím)
- **FilterBar** — card trắng p-4
- **ExportButton** — outline + icon Download
- **DateRangePicker** — preset 7d/30d/Tháng/Tuỳ chọn
- **ActivityHeatmap** (MKT-01 V5 MỚI) — biểu đồ 24h stacked bar
- **UnifiedTimeline** (MKT-03 Tab 4 V5 MỚI) — timeline gộp 3 loại sự kiện

## Design token (từ DESIGN.md)
- Font: **Plus Jakarta Sans**, base 14px
- Primary: `#3e79f7` | Hover: `#699dff`
- Bg trang: `#f7f7f8` | Card: white | Border: `#e6ebf1`
- Radius mặc định: **`rounded-[10px]`**
- Text: Title `#1a3353` / Body `#455560` / Muted `#72849a`
- Table header: bg `#fafafb`, font 13px **w900 UPPERCASE tracking-wide**
- Table row: 80px, hover `#f0f7ff`, stripe chẵn `#fafafb`

## Quy ước chung
1. Bắt buộc shadcn components `components/ui/`
2. Toàn bộ tiếng Việt hardcode
3. Role NV: ẩn filter NV, data tự scope
4. FilterBar có nút Xuất Excel theo filter hiện tại
5. Link bài/comment: text `#3e79f7` + icon ExternalLink, `target="_blank"`
6. Loading: skeleton radius 10px

## Thay đổi v5 so với v4
- ✅ Navigation menu 2 cấp với 5 sub-menu
- ✅ MKT-05 "Báo cáo của tôi" quay lại (chỉ NV)
- ✅ MKT-06 Quản lý Máy chuyển sang nhóm **Cài đặt**
- ✅ Dashboard: thay 5 activity card → ActivityHeatmap 24h
- ✅ MKT-02: thêm row highlight viền trái theo trạng thái
- ✅ MKT-03 Tab 1: gom chỉ số thành 1 khối inline icon+số
- ✅ MKT-03 Tab 4: UnifiedTimeline (3 loại sự kiện + filter)
- ✅ MKT-04: Master-Detail 2 panel
- ✅ MKT-08: đơn giản — 1 FilterBar + 1 Bảng 6 cột + Pagination
