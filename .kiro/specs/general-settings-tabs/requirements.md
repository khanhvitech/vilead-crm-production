# Requirements Document

## Introduction

Tính năng này thiết kế lại trang "Cài đặt chung" (General Settings) trong ViLead CRM, chuyển từ giao diện collapsible hiện tại sang giao diện dạng tab. Trang sẽ có 2 tab chính: "Thuế" (Tax) và "Cài đặt dữ liệu" (Data Settings). Ngoài ra, trang "Báo cáo MKT" sẽ tích hợp form cài đặt kết nối MKT khi chưa có thông tin cấu hình, và dữ liệu cấu hình MKT sẽ được đồng bộ về tab "Cài đặt dữ liệu".

## Glossary

- **General_Settings_Page**: Trang "Cài đặt chung" trong module Cài đặt của ViLead CRM, hiển thị khi người dùng chọn tab "Cài đặt chung" trên sidebar trái
- **Tax_Tab**: Tab "Thuế" trong trang General_Settings_Page, hiển thị giao diện quản lý thuế GTGT
- **Data_Settings_Tab**: Tab "Cài đặt dữ liệu" trong trang General_Settings_Page, hiển thị bảng danh sách thông số cài đặt hệ thống
- **Settings_Table**: Bảng hiển thị danh sách thông số cài đặt với các cột: Cài đặt, Mô tả, Giá trị, Thao tác
- **MKT_Settings_Form**: Form nhập thông tin kết nối MKT hiển thị trên trang Báo cáo MKT khi chưa có cấu hình
- **MKT_Reports_Page**: Trang "Báo cáo MKT" trong ViLead CRM
- **TaxManagement_Component**: Component hiện có quản lý thuế GTGT (thêm, sửa, xóa, bật/tắt mức thuế)
- **Design_System**: Hệ thống thiết kế của ViLead CRM sử dụng Radix UI, Tailwind CSS với các quy tắc: border-radius 10px, màu chủ đạo #3e79f7, border color #e6ebf1, text color #1a3353/#455560

## Requirements

### Requirement 1: Tab Layout cho trang Cài đặt chung

**User Story:** As a quản trị viên, I want trang Cài đặt chung hiển thị dạng tab, so that tôi có thể dễ dàng chuyển đổi giữa các nhóm cài đặt khác nhau.

#### Acceptance Criteria

1. WHEN người dùng truy cập trang General_Settings_Page, THE General_Settings_Page SHALL hiển thị giao diện dạng tab với 2 tab theo thứ tự từ trái sang phải: "Thuế" và "Cài đặt dữ liệu"
2. WHEN trang General_Settings_Page được tải, THE General_Settings_Page SHALL hiển thị tab "Thuế" ở trạng thái active và hiển thị nội dung của tab "Thuế" làm mặc định
3. WHEN người dùng nhấn vào một tab, THE General_Settings_Page SHALL chuyển nội dung hiển thị sang tab tương ứng mà không tải lại trang
4. THE General_Settings_Page SHALL sử dụng component Tabs từ Radix UI (@radix-ui/react-tabs) theo Design_System của dự án
5. WHILE một tab đang được chọn, THE General_Settings_Page SHALL hiển thị tab đó với trạng thái active được phân biệt trực quan so với tab không được chọn theo Design_System

### Requirement 2: Tab Thuế

**User Story:** As a quản trị viên, I want xem và quản lý cài đặt thuế GTGT trong tab Thuế, so that tôi có thể cấu hình các mức thuế áp dụng cho hệ thống.

#### Acceptance Criteria

1. WHEN tab "Thuế" được chọn, THE Tax_Tab SHALL hiển thị toàn bộ giao diện TaxManagement_Component hiện có bao gồm: checkbox "Tính thuế vào doanh số nhân viên", danh sách mức thuế, và nút "Thêm mức thuế"
2. THE Tax_Tab SHALL hiển thị mỗi mức thuế với thông tin: tên thuế (tối đa 100 ký tự), mô tả (tối đa 255 ký tự), phần trăm thuế (giá trị từ 0 đến 100), trạng thái bật/tắt (Switch), nút sửa và nút xóa
3. WHEN người dùng nhấn nút "Thêm mức thuế", THE Tax_Tab SHALL hiển thị dialog nhập thông tin mức thuế mới gồm: tiêu đề (bắt buộc), mức thuế (%) với giá trị từ 0 đến 100, ghi chú (không bắt buộc), nút "Lưu lại" và nút "Hủy"
4. IF người dùng nhấn nút "Lưu lại" trong dialog thêm mức thuế mà chưa nhập tiêu đề, THEN THE Tax_Tab SHALL vô hiệu hóa (disable) nút "Lưu lại" cho đến khi trường tiêu đề có giá trị
5. WHEN người dùng nhấn nút xóa trên một mức thuế, THE Tax_Tab SHALL hiển thị dialog xác nhận xóa với nút "Xóa bỏ" và nút "Hủy" trước khi thực hiện xóa
6. IF danh sách mức thuế trống, THEN THE Tax_Tab SHALL hiển thị thông báo trạng thái trống cho biết chưa có mức thuế nào được cấu hình

### Requirement 3: Tab Cài đặt dữ liệu

**User Story:** As a quản trị viên, I want xem danh sách thông số cài đặt hệ thống dưới dạng bảng, so that tôi có thể quản lý và cập nhật các giá trị cấu hình một cách trực quan.

#### Acceptance Criteria

1. WHEN tab "Cài đặt dữ liệu" được chọn, THE Data_Settings_Tab SHALL hiển thị Settings_Table với 4 cột theo thứ tự: "Cài đặt" (tên thông số), "Mô tả" (mô tả thông số), "Giá trị" (giá trị hiện tại), và cột "Thao tác" (chứa nút hành động)
2. THE Settings_Table SHALL hiển thị nút "Sửa" (Edit) trong cột "Thao tác" trên mỗi hàng để cho phép chỉnh sửa giá trị của thông số đó
3. WHEN người dùng nhấn nút "Sửa" trên một hàng, THE Data_Settings_Tab SHALL chuyển ô "Giá trị" của hàng đó sang chế độ chỉnh sửa inline với input phù hợp theo kiểu dữ liệu (text input với tối đa 500 ký tự cho STRING, number input cho NUMBER, switch cho BOOLEAN), và chỉ cho phép tối đa 1 hàng ở chế độ chỉnh sửa tại một thời điểm
4. WHILE một hàng đang ở chế độ chỉnh sửa, THE Data_Settings_Tab SHALL hiển thị nút "Lưu" (Save) và nút "Hủy" (Cancel) trong cột "Thao tác" thay thế nút "Sửa"
5. WHEN người dùng nhấn nút "Lưu" và giá trị hợp lệ, THE Data_Settings_Tab SHALL lưu giá trị mới, chuyển hàng về chế độ hiển thị, và hiển thị thông báo xác nhận lưu thành công trong tối đa 3 giây
6. WHEN người dùng nhấn nút "Hủy", THE Data_Settings_Tab SHALL khôi phục giá trị ban đầu và chuyển hàng về chế độ hiển thị
7. IF thao tác lưu thất bại (lỗi mạng hoặc lỗi server), THEN THE Data_Settings_Tab SHALL hiển thị thông báo lỗi cho người dùng, giữ hàng ở chế độ chỉnh sửa và giữ nguyên giá trị người dùng đã nhập
8. IF người dùng nhấn nút "Lưu" mà trường giá trị STRING đang trống hoặc trường NUMBER chứa giá trị không phải số, THEN THE Data_Settings_Tab SHALL hiển thị thông báo lỗi validation tại ô giá trị và không thực hiện lưu

### Requirement 4: Form cài đặt MKT trên trang Báo cáo MKT

**User Story:** As a quản trị viên, I want nhập thông tin kết nối MKT khi truy cập trang Báo cáo MKT lần đầu, so that hệ thống có thể kết nối và đồng bộ dữ liệu từ MKT.

#### Acceptance Criteria

1. WHEN người dùng truy cập MKT_Reports_Page, IF các thông số MKT (MKT login email, MKT login password, MKT Base URL, MKT Chu kỳ đồng bộ) chưa được cấu hình, THEN THE MKT_Reports_Page SHALL hiển thị MKT_Settings_Form thay vì nội dung báo cáo
2. THE MKT_Settings_Form SHALL hiển thị 4 trường nhập liệu: "MKT login email" (email input, tối đa 255 ký tự), "MKT login password" (password input, tối đa 128 ký tự), "MKT Base URL" (text input, tối đa 2048 ký tự), "MKT Chu kỳ đồng bộ" (number input hoặc select tính bằng phút, giá trị từ 5 đến 1440)
3. THE MKT_Settings_Form SHALL hiển thị nút "Lưu cài đặt" để xác nhận lưu thông tin
4. WHEN người dùng nhấn nút "Lưu cài đặt" với đầy đủ thông tin hợp lệ (email đúng định dạng email, password không rỗng, Base URL đúng định dạng URL bắt đầu bằng http:// hoặc https://, Chu kỳ đồng bộ nằm trong khoảng 5-1440 phút), THE MKT_Settings_Form SHALL lưu các thông số vào hệ thống và hiển thị nội dung báo cáo MKT
5. IF người dùng nhấn nút "Lưu cài đặt" mà chưa điền đầy đủ các trường bắt buộc hoặc giá trị không đúng định dạng, THEN THE MKT_Settings_Form SHALL hiển thị thông báo lỗi validation tại trường tương ứng chỉ rõ lỗi cụ thể (trường bắt buộc bị bỏ trống, email sai định dạng, URL sai định dạng, hoặc chu kỳ ngoài khoảng cho phép)
6. IF việc lưu thông số MKT thất bại do lỗi hệ thống, THEN THE MKT_Settings_Form SHALL hiển thị thông báo lỗi cho người dùng biết lưu không thành công và giữ nguyên dữ liệu đã nhập trên form

### Requirement 5: Đồng bộ dữ liệu MKT về Cài đặt dữ liệu

**User Story:** As a quản trị viên, I want dữ liệu cấu hình MKT được đồng bộ về tab Cài đặt dữ liệu, so that tôi có thể xem và quản lý tập trung tất cả thông số cài đặt hệ thống.

#### Acceptance Criteria

1. WHEN thông số MKT được lưu thành công từ MKT_Settings_Form, THE Data_Settings_Tab SHALL hiển thị các thông số MKT (MKT login email, MKT login password, MKT Base URL, MKT Chu kỳ đồng bộ) dưới dạng 4 hàng riêng biệt trong Settings_Table, mỗi hàng hiển thị tên thông số trong cột "Cài đặt", mô tả chức năng trong cột "Mô tả", và giá trị hiện tại trong cột "Giá trị"
2. THE Data_Settings_Tab SHALL hiển thị giá trị MKT login password dưới dạng ẩn (masked) với ký tự "••••••••" trong cột "Giá trị" ở chế độ hiển thị, và WHILE hàng MKT login password đang ở chế độ chỉnh sửa, THE Data_Settings_Tab SHALL hiển thị input type password để người dùng nhập giá trị mới
3. WHEN người dùng nhấn nút "Lưu" sau khi chỉnh sửa thông số MKT trong Data_Settings_Tab, THE Data_Settings_Tab SHALL lưu giá trị mới vào hệ thống ngay lập tức để MKT_Reports_Page sử dụng giá trị cập nhật khi được truy cập lần tiếp theo
4. IF việc lưu thông số MKT từ Data_Settings_Tab thất bại, THEN THE Data_Settings_Tab SHALL hiển thị thông báo lỗi cho người dùng, giữ nguyên hàng ở chế độ chỉnh sửa, và không thay đổi giá trị hiện tại của thông số
5. IF các thông số MKT chưa được cấu hình từ MKT_Settings_Form, THEN THE Data_Settings_Tab SHALL không hiển thị các hàng thông số MKT trong Settings_Table

### Requirement 6: Tuân thủ Design System

**User Story:** As a quản trị viên, I want giao diện mới tuân thủ design system hiện có, so that trải nghiệm người dùng nhất quán trên toàn hệ thống.

#### Acceptance Criteria

1. THE General_Settings_Page SHALL sử dụng component Tabs, TabsList, TabsTrigger, TabsContent từ thư viện UI của dự án (@radix-ui/react-tabs) với import path @/components/ui/tabs
2. THE Settings_Table SHALL sử dụng component Table, TableHeader, TableBody, TableRow, TableHead, TableCell từ thư viện UI của dự án với import path @/components/ui/table
3. THE General_Settings_Page SHALL áp dụng các token Design_System sau: border-radius 10px cho container và card, màu viền #e6ebf1 cho border của bảng và các phần tử phân cách, màu chữ tiêu đề #1a3353 cho heading chính của trang, màu chữ phụ #455560 cho nội dung bảng và label, và màu chủ đạo #3e79f7 cho tab đang active và các nút hành động chính
4. THE MKT_Settings_Form SHALL sử dụng các component Input, Label, Button từ thư viện UI của dự án với import path @/components/ui/, trong đó Input áp dụng border-radius 10px, border color #e6ebf1, focus border color #3e79f7, và Label sử dụng màu chữ #1a3353
5. THE General_Settings_Page SHALL hiển thị tab đang active với màu chữ #3e79f7 và border-bottom 2px màu #3e79f7, và tab không active với màu chữ #aeaeb7 không có border-bottom
