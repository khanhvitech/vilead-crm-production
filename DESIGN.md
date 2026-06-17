# Design System: Vilead CRM

> **⚠️ QUAN TRỌNG:** File này là **nguồn chân lý duy nhất** về Design System của hệ thống Vilead CRM.
> Bất kỳ AI nào (Antigravity, Copilot, v.v.) khi tạo mới hoặc chỉnh sửa UI **phải đọc file này** trước.
> Mọi code sinh ra phải tuân thủ đúng các quy tắc trong tài liệu này.

---

## 1. Nguyên tắc chung (Visual Atmosphere)

- **Phong cách:** Clean Corporate SaaS — gọn gàng, chuyên nghiệp, không rối rắm
- **Mật độ:** Medium-density — dữ liệu hiển thị rõ ràng, padding hợp lý
- **Mood:** Trustworthy & Efficient — màu xanh dương làm chủ đạo, nền trắng sáng
- **Font chính:** `Plus Jakarta Sans` — modern, dễ đọc, weight từ 400 đến 700
- **Font size mặc định của body:** `14px`

---

## 2. Bảng màu (Color Palette)

### Primary (Màu hành động chính)
| Tên | Hex | Sử dụng |
|-----|-----|---------|
| Primary Blue | `#3e79f7` | Button chính, link, focus ring, icon active |
| Primary Light | `#699dff` | Hover state của primary |
| Primary Dark | `#2a59d1` | Active/pressed state của primary |
| Primary Lightest | `#f0f7ff` | Background hover sidebar, accent fill nhạt |

### Status Colors
| Tên | Hex | Sử dụng |
|-----|-----|---------|
| Success Green | `#2dc56a` | Trạng thái thành công, badge success |
| Success Light | `#04d182` | Hover success |
| Error Red | `#ff6b72` | Lỗi, hành động xóa, badge danger |
| Error Dark | `#d9505c` | Pressed state của destructive |
| Warning Yellow | `#ffc542` | Cảnh báo, badge warning |
| Info Purple | `#a461d8` | Tag phụ, badge secondary |

### Neutral / Backgrounds
| Tên | Hex | Sử dụng |
|-----|-----|---------|
| White | `#ffffff` | Nền card, nền input, nền dialog |
| BG Secondary | `#f7f7f8` | Nền trang, sidebar, disabled input |
| BG Alt | `#fafafb` | Header của table, stripe row chẵn |
| BG Tertiary | `#fcfcfc` | Nền phụ |

### Border Colors
| Tên | Hex | Sử dụng |
|-----|-----|---------|
| Border Default | `#e6ebf1` | Viền tất cả component (input, card, table, dialog) |
| Border Light | `#d0d4d7` | Scrollbar thumb, phân tách nhẹ |

### Text Colors
| Tên | Hex | Sử dụng |
|-----|-----|---------|
| Text Primary | `#1a3353` | Tiêu đề chính (h1, h2, DialogTitle) |
| Text Default | `#455560` | Nội dung body, label, cell data |
| Text Secondary | `#373d3f` | Text đậm hơn body khi cần nhấn |
| Text Muted | `#72849a` | Placeholder, subtitle, description, icon |
| Text Light | `#90a4ae` | Caption, timestamp, phụ chú nhạt |

---

## 3. Typography

```
Font Family : Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif
Base Size   : 14px (1rem = 14px)
Line Height : 1.5

Scale:
  xs   = 12px  → caption, badge, timestamp
  sm   = 13px  → table header, hint, small button
  base = 14px  → body text, cell data, input, button default
  md   = 15px  → sub-heading nhỏ
  lg   = 16px  → heading card, dialog title
  xl   = 22px  → page heading
  2xl  = 28px  → số liệu metric card lớn

Font Weights:
  400 → text thường
  500 → label, nav item, badge
  600 → heading section, CardTitle, DialogTitle
  700 → page heading quan trọng
  900 → TABLE HEADER (uppercase + tracking-wide)
```

---

## 4. Border Radius (Hình dạng bo góc)

> Quy tắc: **Dùng `rounded-[10px]` hoặc `var(--radius)` (= 0.625rem) cho mọi component chính.**

| Giá trị | Pixel | Sử dụng cho |
|---------|-------|-------------|
| `rounded-sm` / `4px` | 4px | Badge, tag, icon button nhỏ |
| `rounded-md` / `6px` | 6px | Action button icon (32×32), Checkbox |
| `rounded-[10px]` / `var(--radius)` | 10px | **Button, Input, Card, Dialog, Table container, Select, Popover** — ĐÂY LÀ GIÁ TRỊ MẶC ĐỊNH |
| `rounded-xl` / `20px` | 20px | Pill badge đặc biệt |
| `rounded-full` | 9999px | Avatar (hình tròn) |

⚠️ **KHÔNG dùng `rounded-lg` (Tailwind mặc định = 8px) hay `rounded-xl` cho component chính** — luôn dùng `rounded-[10px]`.

---

## 5. Shadows (Độ sâu / Elevation)

```
Shadow SM     : 0 2px 0 rgba(0,0,0,0.015)          → Rất mờ, card phẳng
Shadow MD     : 0 0.125rem 0.25rem rgba(0,0,0,0.075) → Card mặc định
Shadow LG     : 0 1px 2px -2px rgba(0,0,0,0.16),   → Card hover, Dropdown
                0 3px 6px 0 rgba(0,0,0,0.12),
                0 5px 12px 4px rgba(0,0,0,0.09)
Shadow Focus  : 0 0 0 2px rgba(62,121,247,0.2)     → Focus ring của input/button
Shadow Dropdown: 0 3px 6px -4px rgba(0,0,0,0.12), → Select, Popover, Menu
                 0 6px 16px 0 rgba(0,0,0,0.08),
                 0 9px 28px 8px rgba(0,0,0,0.05)
```

---

## 6. Components — Spec chuẩn từng loại

### 6.1 Button

```
Component : <Button> từ components/ui/button.tsx
CSS class : .omi-btn (với modifier .omi-btn-primary, .omi-btn-outline, v.v.)

Variants:
  default     → bg #3e79f7, text white, border #3e79f7, rounded-[10px]
                hover: bg #699dff | active: bg #2a59d1
  outline     → bg white, text #455560, border #e6ebf1, rounded-[10px]
                hover: bg #f0f7ff, border+text #699dff
  secondary   → bg #f7f7f8, text #455560, border transparent, rounded-[10px]
                hover: bg #e6ebf1
  ghost       → bg transparent, text #455560, no border
                hover: bg #fafafb
  destructive → bg #ff6b72, text white, border #ff6b72, rounded-[10px]
  success     → bg #2dc56a, text white
  link        → text #3e79f7, underline on hover

Sizes:
  default : h-10 (40px), px-4, py-[8.5px], font 14px
  sm      : h-9 (36px), px-3, font 13px
  lg      : h-10 (40px), px-5
  icon    : h-8 w-8 (32×32), p-0, rounded-md (6px)

Transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)
Focus ring: box-shadow 0 0 0 2px rgba(62,121,247,0.2)
Disabled  : opacity-50, pointer-events-none
```

### 6.2 Input / Textarea

```
Component : <Input> từ components/ui/input.tsx
CSS class : .input-field

Spec:
  Height          : h-10 (40px)
  Border          : 1px solid #e6ebf1
  Border radius   : rounded-[10px]
  Background      : white
  Text color      : #455560
  Placeholder     : rgba(114,132,154,0.4)
  Padding         : px-3 py-2
  Font size       : 14px

States:
  hover  : border-color → #699dff
  focus  : border-color → #3e79f7, box-shadow → 0 0 0 2px rgba(62,121,247,0.2)
  disabled: bg #f7f7f8, opacity-50, cursor not-allowed
```

### 6.3 Table

```
Component : <Table> từ components/ui/table.tsx
CSS class : .omi-table-container > .omi-table

Container:
  border          : 1px solid #e6ebf1
  border-radius   : rounded-[10px]
  overflow        : hidden

Header (thead/th):
  background      : #fafafb
  height          : 50px
  font-size       : 13px
  font-weight     : 900 (font-black)
  text-transform  : UPPERCASE
  letter-spacing  : 0.025em
  color           : #455560
  border-bottom   : 1px solid #e6ebf1
  border-right    : 1px solid #e6ebf1 (last: none)
  padding         : px-4

Row (tbody tr):
  height          : 80px (--omi-table-row-height)
  hover           : bg #f0f7ff
  stripe (even)   : bg #fafafb
  border-bottom   : 1px solid #e6ebf1
  selected        : bg rgba(62,121,247,0.1)

Cell (td):
  padding         : p-4
  font-size       : 14px
  color           : #455560
  border-right    : 1px solid #e6ebf1 (last: none)
  vertical-align  : middle
```

### 6.4 Dialog / Modal

```
Component : <Dialog> từ components/ui/dialog.tsx

Overlay   : bg-black/45, fade animation
Content   :
  border          : 1px solid #e6ebf1
  border-radius   : rounded-[10px]
  background      : white
  shadow          : dropdown shadow
  max-width       : max-w-lg (512px) mặc định

Header (DialogHeader):
  padding         : p-6 pb-4
  border-bottom   : 1px solid #e6ebf1
  title color     : #1a3353, font-semibold, text-base

Footer (DialogFooter):
  padding         : p-6 pt-4
  border-top      : 1px solid #e6ebf1
  layout          : flex-row justify-end, gap-3

Body (DialogContent > children):
  padding         : p-6

Close button:
  size            : 32×32
  border-radius   : rounded (6px)
  icon color      : #72849a
  hover           : text #455560, bg #f7f7f8
```

### 6.5 Badge / Tag

```
CSS class : .omi-badge + modifier

Base:
  display         : inline-flex, align-items center
  padding         : 2px 8px
  font-size       : 12px
  font-weight     : 500
  border-radius   : 4px (rounded-sm)
  white-space     : nowrap

Variants:
  primary   → bg rgba(62,121,247,0.15), text #3e79f7
  success   → bg rgba(45,197,106,0.15), text #2dc56a
  warning   → bg rgba(255,197,66,0.15), text #ffc542
  danger    → bg rgba(255,107,114,0.15), text #ff6b72
  secondary → bg #f5f0fa, text #a461d8
```

### 6.6 Card

```
CSS class : .card (thêm .card-hover để có hover effect)

Base:
  background      : white
  border          : 1px solid #e6ebf1
  border-radius   : var(--radius) = 10px
  padding khi dùng metric-card: p-6

Hover (.card-hover:hover):
  border-color    : transparent
  box-shadow      : shadow-lg
  transition      : all 0.3s
```

### 6.7 Avatar

```
CSS class : .omi-avatar + size modifier

Sizes:
  xs  : 24×24, font 12px
  sm  : 32×32, font 14px
  md  : 40×40, font 16px (mặc định)
  lg  : 48×48, font 18px
  xl  : 64×64, font 24px

Shape     : border-radius 50% (hình tròn)
Background: #3e79f7
Color     : white
```

### 6.8 Sidebar Item

```
CSS class : .sidebar-item (thêm .active)

Base:
  padding : px-4 py-3
  font-size: 14px
  border-radius: 10px
  color: #455560
  transition: all 0.3s

Hover:
  background : #f0f7ff
  color      : #3e79f7

Active:
  background : #3e79f7
  color      : white
```

---

## 7. Spacing & Layout

```
Padding chuẩn cho:
  Page container  : p-6 (24px)
  Card body       : p-6 (24px)
  Dialog body     : p-6 (24px)
  Table cell      : p-4 (16px) hoặc px-4 py-3
  Button default  : px-4 py-[8.5px]
  Input           : px-3 py-2

Gap chuẩn:
  Button group    : gap-2 (8px)
  Form section    : gap-4 (16px)
  Card grid       : gap-4 hoặc gap-6
  Dialog footer   : gap-3 (12px)
```

---

## 8. Animation & Transition

```
Transition mặc định : all 0.3s ease (hoặc cubic-bezier(0.645, 0.045, 0.355, 1))
Dialog open/close   : fade-in + zoom-in-95 + slide-in-from-top
Accordion           : accordion-down / accordion-up 0.2s ease-out
Hover duration      : 300ms
```

---

## 9. Scrollbar

```css
width/height : 6px
track        : background #f7f7f8
thumb        : background #d0d4d7, border-radius 3px
thumb:hover  : background #b0b4b7
```

---

## 10. Quy tắc khi tạo UI mới

### ✅ BẮT BUỘC
1. Dùng `components/ui/` (shadcn components đã được tùy chỉnh) thay vì tự viết HTML
2. Màu sắc: chỉ dùng các giá trị trong bảng trên hoặc CSS variables `var(--omi-*)`
3. Border radius: luôn `rounded-[10px]` cho component chính, KHÔNG dùng `rounded-lg` hay `rounded-xl`  
4. Font: đã có sẵn qua `body` style, không cần import thêm
5. Button: luôn dùng `<Button variant="...">` — xem spec mục 6.1
6. Table: bọc trong `<Table>` component, không tự tạo `<table>` thô
7. Dialog: dùng `<Dialog>` + `<DialogHeader>` + `<DialogFooter>` — cấu trúc rõ ràng
8. Input: dùng `<Input>` component, không dùng thẻ `<input>` thô

### ❌ TRÁNH
- Hardcode màu khác hệ thống (ví dụ: `bg-blue-500`, `text-gray-600`, v.v.)
- Dùng `border-radius` khác (4px, 6px, 8px, 12px) cho component chính
- Tự viết CSS inline riêng lẻ khi đã có class `.omi-*` tương ứng
- Dùng `Tailwind rounded-lg` (8px) — phải là `rounded-[10px]`
- Tạo button bằng `<div>` hoặc `<a>` thay vì `<Button>`

---

## 11. Ví dụ code chuẩn

### Button group (Hủy + Lưu)
```tsx
<div className="flex gap-3 justify-end">
  <Button variant="outline">Hủy</Button>
  <Button variant="default">Lưu</Button>
</div>
```

### Input với Label
```tsx
<div className="flex flex-col gap-1.5">
  <label className="text-sm font-medium text-[#1a3353]">Tên khách hàng</label>
  <Input placeholder="Nhập tên..." />
</div>
```

### Badge trạng thái
```tsx
<span className="omi-badge omi-badge-success">Hoạt động</span>
<span className="omi-badge omi-badge-danger">Đã hủy</span>
<span className="omi-badge omi-badge-warning">Chờ duyệt</span>
```

### Dialog chuẩn
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Mở dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Tiêu đề</DialogTitle>
      <DialogDescription>Mô tả ngắn...</DialogDescription>
    </DialogHeader>
    <div className="p-6">
      {/* Nội dung */}
    </div>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Hủy</Button>
      </DialogClose>
      <Button variant="default">Xác nhận</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Table chuẩn
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Tên</TableHead>
      <TableHead>Trạng thái</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Nguyễn Văn A</TableCell>
      <TableCell><span className="omi-badge omi-badge-success">Hoạt động</span></TableCell>
    </TableRow>
  </TableBody>
</Table>
```
