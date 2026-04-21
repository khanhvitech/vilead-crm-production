# MKT-07: Thêm máy mới (Modal) — v5 giữ nguyên

Admin tạo mã kết nối. Modal 2 bước. Trigger từ nút "+ Thêm máy" ở MKT-06.

## Structure

`<Dialog>` shadcn, `max-w-lg` (512px), radius 10px.

```
[DialogHeader - p-6 pb-4 border-b #e6ebf1]
  [Icon tròn 32px bg #f0f7ff + Plus #3e79f7] 
  Title: "Thêm máy mới" (16px w600 #1a3353)
  Description: "Tạo mã kết nối cho một máy tính mới" (13px #72849a)
  [Close X góc phải]

[Stepper - px-6 py-4 border-b]
  [①] Thông tin máy ──── [②] Mã kết nối

[Body - p-6]
  (Nội dung theo bước)

[DialogFooter - p-6 pt-4 border-t]
  [Hủy]                          [Tiếp theo / Xong]
```

## Stepper
- Vòng 28px, label bên cạnh
- Active: bg `#3e79f7` text trắng, label `#1a3353` w600
- Chưa active: bg `#e6ebf1` text `#72849a`
- Đã xong: bg `#2dc56a` + icon Check

## BƯỚC 1 — Thông tin máy

```
[Field] Tên máy *
  <Input placeholder="VD: MAY-NV-HUONG-01" maxLength=50>
  Hint: "Quy ước: MAY-<Viết tắt tên NV>-<số thứ tự>" (12px #72849a)

[Field] Gán cho nhân viên *
  <Select với search (Combobox)>
  Options: Avatar sm + Tên + Phòng ban

[Info box bg #f0f7ff, border-left 3px #3e79f7, p-3, radius 10]
  ℹ️ "Sau khi tạo, bạn sẽ nhận được mã kết nối. Giao mã cho nhân viên để cài Agent và nhập."
```

**Validation Tên máy:** không rỗng, không trùng, max 50.

**Footer Bước 1:**
- `[Hủy]` outline → đóng modal
- `[Tiếp theo]` default → disabled nếu form invalid → sinh mã → Bước 2

## BƯỚC 2 — Mã kết nối

```
[Success - flex gap-2]
  ✓ CheckCircle #2dc56a + "Đã tạo mã kết nối cho máy 'MAY-HUONG-01'"

[Code Card - p-6 border radius]
  Label: "Mã kết nối" (13px #72849a mb-3)
  
  [Code display - bg #fafafb border radius p-4 text-center]
    VL-X7K9-M3P2-Q8N1-B5D4
    (Font mono, 20px w600, #1a3353, letter-spacing 0.1em)
  
  [Row mt-3 flex between]
    Trái: [Copy mã] outline sm + icon Copy
    Phải: "Mã có hiệu lực 24h" (12px #72849a)

[Hướng dẫn - bg #fafafb p-4 radius]
  Title: "Hướng dẫn cho nhân viên:" (14px w600)
  Numbered list (13px #455560):
    1. Tải MKT Sync Agent tại: [link download]
    2. Cài đặt và mở Agent trên máy
    3. Dán mã kết nối ở trên vào Agent
    4. Máy sẽ tự xuất hiện trong danh sách sau 1-2 phút
```

**Click Copy:** copy clipboard + đổi button thành `✓ Đã sao chép` (bg xanh nhạt) 2 giây.

**Footer Bước 2:**
- `[Quay lại]` ghost + ArrowLeft → về Bước 1, giữ data
- `[Xong]` default → đóng modal + toast "Đã thêm máy vào danh sách. Máy sẽ xuất hiện sau khi NV nhập mã."

## Logic sinh mã (mock)
- Prefix `VL-` + 4 block 4 ký tự `[A-Z0-9]` (trừ O,0,I,1,L)
- Format: `VL-XXXX-XXXX-XXXX-XXXX`

## Edge cases
- Tên trùng: error dưới input, nút Tiếp theo disabled
- Field rỗng: viền đỏ, nút disabled
- Đóng modal ở Bước 2 chưa copy: Confirm "Bạn đã tạo mã nhưng chưa copy. Thoát sẽ không lưu lại. Tiếp tục?"
- Enter trong Input tên máy: focus Select NV
- Enter khi form valid: submit luôn

## Design rules
- Dialog `max-w-lg` radius `rounded-[10px]` shadow dropdown
- Overlay: `bg-black/45`
- Code display font mono, letter-spacing `0.1em`, size 20px
- Info box: bg `#f0f7ff` border-left `#3e79f7`
- shadcn: Dialog, DialogHeader, DialogFooter, Input, Select (search), Button
- Icons: Plus, X, ArrowLeft, Copy, CheckCircle, Info, Download
