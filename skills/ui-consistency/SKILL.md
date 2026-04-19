---
name: ui-consistency
description: Audit và chuẩn hóa UI components trong dự án Vilead CRM để đảm bảo nhất quán với Design System
---

# UI Consistency Skill

Bạn là một UI/UX Consistency Engineer. Nhiệm vụ của bạn là **audit và chuẩn hóa** các UI component trong dự án Vilead CRM theo đúng Design System đã định nghĩa trong `DESIGN.md`.

## Bước 1: Đọc Design System

**BẮT BUỘC** đọc file `DESIGN.md` tại root của project trước khi làm bất cứ điều gì:

```
Đọc file: d:\Manage\D\DocumentBA\CRM-VILEAD\Source\vilead-crm-production\DESIGN.md
```

## Bước 2: Xác định phạm vi audit

Hỏi người dùng (hoặc xác định từ context):
- Audit **toàn bộ project** hay **một module/file cụ thể**?
- Có file HTML mẫu nào cần convert sang code chuẩn không?

## Bước 3: Audit — Danh sách kiểm tra

Khi đọc từng file `.tsx`, kiểm tra các vấn đề sau:

### 3.1 Button violations
- [ ] Có dùng `<button>` HTML thô không thay vì `<Button variant="...">`?
- [ ] Có dùng class CSS tùy tiện (vd: `bg-blue-500`, `bg-primary`) thay vì `variant`?
- [ ] Có icon-button dùng `rounded-[10px]` thay vì `size="icon"` (rounded-md 6px)?
- [ ] Hover/active state có khác với spec?

### 3.2 Border radius violations
- [ ] Có dùng `rounded-lg` (8px - Tailwind mặc định) thay vì `rounded-[10px]`?
- [ ] Có dùng `rounded-xl` (20px) cho component thông thường?
- [ ] Có hardcode `border-radius: 8px` trong className?

### 3.3 Color violations
- [ ] Text color có dùng Tailwind mặc định (`text-gray-*`, `text-blue-*`) thay vì omi colors?
- [ ] Border color có đúng `#e6ebf1` không?
- [ ] Nền hover có đúng `#f0f7ff` (primary) hoặc `#fafafb` (ghost)?

### 3.4 Table violations
- [ ] Có dùng `<table>` HTML thô không thay vì `<Table>` component?
- [ ] Table header có `font-black uppercase tracking-wide`?
- [ ] Row height có khoảng 80px?
- [ ] Có border-right giữa các cột không?

### 3.5 Dialog violations
- [ ] Header có border-bottom `#e6ebf1`?
- [ ] Footer có border-top `#e6ebf1`?
- [ ] DialogTitle có màu `#1a3353`?
- [ ] Footer button layout có `justify-end gap-3`?

### 3.6 Input violations
- [ ] Input có `rounded-[10px]`?
- [ ] Focus ring có `0 0 0 2px rgba(62,121,247,0.2)`?
- [ ] Disabled state có `bg #f7f7f8`?

### 3.7 Badge violations
- [ ] Có tự tạo badge không dùng class `.omi-badge`?
- [ ] border-radius của badge có đúng 4px (rounded-sm)?
- [ ] Các màu badge có đúng spec?

## Bước 4: Report violations

Trình bày violations theo format:

```markdown
## Audit Report: [Tên file/module]

### 🔴 Critical (Breaking consistency)
- File: `path/to/file.tsx`, line X
  - Vấn đề: Dùng `rounded-lg` thay vì `rounded-[10px]`
  - Fix: Thay `rounded-lg` → `rounded-[10px]`

### 🟡 Warning (Style drift)
- File: `path/to/file.tsx`, line X
  - Vấn đề: Text color `text-gray-600` thay vì `text-[#455560]`
  - Fix: Thay `text-gray-600` → `text-[#455560]`

### ✅ Passed
- Table component: Đúng chuẩn
- Dialog header: Đúng chuẩn
```

## Bước 5: Fix tự động

Sau khi report, hỏi người dùng có muốn fix tự động không. Nếu có:

1. Ưu tiên fix **Critical** trước
2. Thay thế từng vi phạm cụ thể, không thay toàn bộ file
3. Giữ nguyên logic/structure, chỉ đổi style values
4. Sau khi fix, liệt kê các thay đổi đã thực hiện

## Bước 6: Convert HTML mẫu → Code chuẩn

Nếu người dùng cung cấp HTML mẫu (từ thiết kế ngoài vào):

1. Đọc HTML mẫu
2. Map từng element sang component chuẩn:
   - `<button>` → `<Button variant="...">`
   - `<input>` → `<Input>`
   - `<table>` → `<Table>` + sub-components
   - `<div class="modal">` → `<Dialog>`
3. Thay tất cả màu/radius hardcode bằng design tokens
4. Output code TSX sẵn sàng để dùng

## Quy tắc cốt lõi

```
LUÔN LUÔN:
  ✅ Dùng components/ui/* thay vì HTML thô
  ✅ rounded-[10px] cho Button, Input, Card, Dialog, Table
  ✅ #e6ebf1 cho border
  ✅ #3e79f7 cho primary action
  ✅ font-black uppercase cho table header

KHÔNG BAO GIỜ:
  ❌ rounded-lg (8px) cho component chính
  ❌ bg-blue-500 / text-gray-600 (Tailwind generic)
  ❌ <button> / <input> / <table> thô
  ❌ inline style khác với design system
```
