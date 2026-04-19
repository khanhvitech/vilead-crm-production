---
description: Cập nhật COMPONENT_INVENTORY.md khi thêm component mới hoặc sửa module
---

# Workflow: Cập nhật Component Inventory

Dùng workflow này mỗi khi:
- Thêm component mới vào codebase
- Sửa đổi quan trọng một component hiện có
- Muốn kiểm tra inventory có còn chính xác không

---

## Cách 1: AI tự cập nhật (Khuyến nghị)

Nói với Antigravity:

```
Cập nhật COMPONENT_INVENTORY.md cho module [tên module].
Tôi vừa thêm [tên component] tại [đường dẫn file].
```

Hoặc để AI scan lại toàn bộ:

```
Scan lại app/components/ và cập nhật COMPONENT_INVENTORY.md.
Đọc DESIGN.md để kiểm tra trạng thái compliance.
```

---

## Cách 2: Script tự động (chạy thủ công)

// turbo
### Bước 1: Chạy script scan components

```powershell
node scripts/scan-components.js
```

Script sẽ:
1. Scan toàn bộ `app/components/` và `components/ui/`
2. Liệt kê tất cả file `.tsx`
3. Phát hiện file mới chưa có trong `COMPONENT_INVENTORY.md`
4. In ra danh sách "Chưa được đăng ký" để bạn thêm vào

---

## Khi nào cần cập nhật?

| Sự kiện | Cần cập nhật? |
|---------|--------------|
| Thêm file `.tsx` mới vào `app/components/` | ✅ Có |
| Thêm Modal/Dialog mới | ✅ Có |
| Đổi tên file component | ✅ Có |
| Xóa component | ✅ Có |
| Sửa logic bên trong component | ❌ Không |
| Sửa style nhỏ | ❌ Không |
| Thêm file mới trong `components/ui/` (shadcn) | ✅ Có |

---

## Format thêm dòng mới

Khi thêm component mới, chỉ cần thêm 1 dòng vào bảng đúng module:

```markdown
| **TênComponent** | `path/to/Component.tsx` | Mô tả ngắn | ✅ Chuẩn |
```

Trạng thái:
- `✅ Chuẩn` → Đã dùng đúng components/ui/ và design tokens
- `⚠️ Cần kiểm tra` → Chưa audit
- `❌ Cần sửa` → Đã phát hiện vi phạm design system
