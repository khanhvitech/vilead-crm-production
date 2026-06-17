# MKT-03b: Chi tiết UID — Page (v5)

**DÙNG CHUNG TEMPLATE với MKT-03a** (Header + 4 Tab + Timeline pattern). File này mô tả **phần KHÁC**.

## Khác biệt

| Khu vực | 03a Profile | 03b Page |
|---|---|---|
| Badge loại | `Profile` tím nhạt | **`Page`** xanh dương nhạt (`rgba(62,121,247,0.15)`, `#3e79f7`) |
| Header phải | (trống) | **Link Profile cha** nếu có |
| StatusChip | Live/Die/Checkpoint/Hạn chế/Không HĐ | **Hoạt động / Bị hạn chế / Bị xoá** |
| Tab 1 "Sức khoẻ" | 8 icon+số Profile | **8 icon+số Page (khác)** |
| Tab 2 cột | Tin/Like/BL/Bài/UID | **Bài/Reaction/Comment/Share/Tương tác làm/Follower ±** |
| Tab 3 Bài đăng | Filter Nơi đăng (Tường CN/Group) | **Ẩn filter Nơi đăng** (Page chỉ 1 loại) |
| Tab 3 Bình luận | - | Giữ nguyên |
| Tab 4 | - | Giữ nguyên (UnifiedTimeline) |

## Trạng thái Page
Hoạt động (`#2dc56a`) · Bị hạn chế (`#ffc542`) · Bị xoá/Unpublish (`#ff6b72`)

## Block "Profile cha" (Header Card phần phải)
Chỉ hiện nếu Page có parent_profile_uid:
```
┌─ Card bg #f0f7ff, border #3e79f7/20, p-3, radius 10 ─┐
│ Profile quản lý                                       │
│ [Avatar sm] Mai Anh Nguyen                            │
│ UID: 10001234...                                      │
│ [Xem Profile →] (link → MKT-03a)                     │
└───────────────────────────────────────────────────────┘
```

## TAB 1 — "Sức khoẻ hôm nay" (bộ chỉ số Page)

Giữ Row 1 (2 card "Đang làm gì" + "Ai đang giữ") y hệt 03a.

**Row 2 — 8 icon+số cho Page:**

```
[Card p-6]
  [Label] Sức khoẻ hôm nay · 18/04/2026
  
  [Grid 4 cột, 2 hàng]
  📝 8 Bài đăng      👍 842 Reaction nhận  💭 156 BL nhận     ↩️ 32 Share nhận
  💌 18 Inbox trả     🎯 45 Reaction làm    ✏️ 28 BL làm        👥 +73 Follower
  
  [Link] "Xem chi tiết tại Tab Lịch sử Hoạt động →"
```

**Lưu ý:**
- Follower hiển thị **biến động** (+73) không phải tổng (tổng Follower xem ở Tab 2)
- **Bỏ** chỉ số "Reach" và "Bài lên lịch" theo v4

## TAB 2 — Lịch sử Hoạt động (Page)

Chart stacked bar theo ngày, legend: Bài / Reaction nhận / Comment nhận / Tương tác làm / Follower biến động.

Table:
| NGÀY | TRẠNG THÁI | BÀI | REACTION | COMMENT | SHARE | TƯƠNG TÁC LÀM | FOLLOWER ± |

- Follower ±: dương xanh, âm đỏ
- Row TỔNG cuối: bg `#fafafb` w700
- Cột Follower ở row TỔNG = tổng biến động trong kỳ

## TAB 3 — Bài đăng & Bình luận

**Sub-tab BÀI ĐĂNG (Page):**

FilterBar **ẨN filter "Nơi đăng"** vì Page chỉ đăng trên Page của mình:
```
[FilterBar]
  [DateRange]  [Loại nội dung ▾: Tất cả/Text/Ảnh/Video/Reels]  [Phần mềm ▾]
  [🔍 Search]  [Xuất Excel]

[Table 5 cột]
| THỜI GIAN | LOẠI | NỘI DUNG | LINK 🔗 | PHẦN MỀM |
```

Cột **LOẠI** thay cho Nơi đăng: badge Text/Ảnh/Video/Reels (4 màu khác nhau).

**Sub-tab BÌNH LUẬN:** Giống 03a Profile hoàn toàn.

## TAB 4 — Trạng thái

**Giữ nguyên UnifiedTimeline như 03a.** Khác biệt duy nhất:
- StatusChip dùng trạng thái Page (Hoạt động/Bị hạn chế/Bị xoá)
- Lý do: "Bị report", "Vi phạm chính sách QC", "Admin xoá Page"

## Mock data
UID `200098765432101` "Shop Mỹ Phẩm ABC" Hoạt động · Parent: Mai Anh Nguyen · Hôm nay: 8 bài (2 Text, 4 Ảnh, 1 Video, 1 Reels), 842 reaction, 156 comment, 32 share · Follower +73 · Tab 3 Bài: 20 bài có link · Tab 3 BL: 15 comment · Tab 4: 4 mốc.

## Edge cases
- Không có Profile cha: ẩn block
- Page bị xoá: Tab 1 "Page đã bị xoá, không data mới", Tab 2/3 vẫn xem lịch sử cũ

## Design rules
- Giữ spec chung với 03a
- Badge Page: bg `rgba(62,121,247,0.15)` text `#3e79f7`
- Badge loại nội dung Text/Ảnh/Video/Reels: 4 màu phân biệt (xám/xanh/tím/hồng)
- Thuật ngữ FB giữ: Reaction, Reels, Follower
- shadcn tương tự 03a
- Icons: Copy, ExternalLink, FileText, Image, Video, MessageSquare, ThumbsUp, Users
