# Component Inventory — Vilead CRM

> **Mục đích:** Bản đồ nhanh toàn bộ UI components. AI đọc file này để biết component nào đã tồn tại, dùng ở đâu, và đang đúng chuẩn hay không — thay vì scan toàn bộ codebase.
>
> **Cập nhật:** Mỗi khi thêm component mới hoặc sửa component quan trọng.  
> **Cập nhật tự động:** Chạy lệnh `npm run inventory` hoặc nhờ AI: _"Cập nhật Component Inventory cho module [tên]"_
>
> **Liên kết:** Spec chuẩn → [`DESIGN.md`](./DESIGN.md)

---

## 1. Shared UI Components (`components/ui/`)

> Tất cả đã được tùy chỉnh theo Design System. **Luôn dùng các component này** thay vì HTML thô.

| Component | Import path | Variants / Props chính | Trạng thái |
|-----------|------------|----------------------|-----------|
| **Button** | `@/components/ui/button` | `variant`: default, outline, secondary, ghost, destructive, success, warning, link · `size`: default, sm, lg, icon | ✅ Chuẩn |
| **Input** | `@/components/ui/input` | — | ✅ Chuẩn |
| **Textarea** | `@/components/ui/textarea` | — | ✅ Chuẩn |
| **Select** | `@/components/ui/select` | SelectTrigger + SelectContent + SelectItem | ✅ Chuẩn |
| **Table** | `@/components/ui/table` | Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption | ✅ Chuẩn |
| **Dialog** | `@/components/ui/dialog` | Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose | ✅ Chuẩn |
| **Badge** | `@/components/ui/badge` | `variant`: default, secondary, destructive, outline | ✅ Chuẩn |
| **Checkbox** | `@/components/ui/checkbox` | — | ✅ Chuẩn |
| **Switch** | `@/components/ui/switch` | — | ✅ Chuẩn |
| **Tabs** | `@/components/ui/tabs` | Tabs, TabsList, TabsTrigger, TabsContent | ✅ Chuẩn |
| **Popover** | `@/components/ui/popover` | Popover, PopoverTrigger, PopoverContent | ✅ Chuẩn |
| **Tooltip** | `@/components/ui/tooltip` | TooltipProvider, Tooltip, TooltipTrigger, TooltipContent | ✅ Chuẩn |
| **DropdownMenu** | `@/components/ui/dropdown-menu` | DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator | ✅ Chuẩn |
| **Sheet** | `@/components/ui/sheet` | Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle | ✅ Chuẩn |
| **Card** | `@/components/ui/card` | Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter | ✅ Chuẩn |
| **Avatar** | `@/components/ui/avatar` | Avatar, AvatarImage, AvatarFallback | ✅ Chuẩn |
| **Separator** | `@/components/ui/separator` | `orientation`: horizontal, vertical | ✅ Chuẩn |
| **ScrollArea** | `@/components/ui/scroll-area` | — | ✅ Chuẩn |
| **Progress** | `@/components/ui/progress` | `value` (0-100) | ✅ Chuẩn |
| **Skeleton** | `@/components/ui/skeleton` | — | ✅ Chuẩn |
| **Sonner (Toast)** | `@/components/ui/sonner` | `toast()`, `toast.success()`, `toast.error()` | ✅ Chuẩn |
| **Calendar** | `@/components/ui/calendar` | — | ✅ Chuẩn |
| **Pagination** | `@/components/ui/pagination` | — | ✅ Chuẩn |
| **Form** | `@/components/ui/form` | Form, FormField, FormItem, FormLabel, FormControl, FormMessage | ✅ Chuẩn |
| **AlertDialog** | `@/components/ui/alert-dialog` | AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogAction, AlertDialogCancel | ✅ Chuẩn |

### CSS-only classes (dùng trực tiếp, không import)
| Class | Dùng cho |
|-------|---------|
| `.omi-badge .omi-badge-{variant}` | Badge trạng thái: primary, success, warning, danger, secondary |
| `.omi-btn .omi-btn-primary` | Button thuần CSS (không dùng React) |
| `.omi-table-container > .omi-table` | Table có sticky column |
| `.omi-avatar .omi-avatar-{size}` | Avatar xs, sm, md, lg, xl |
| `.omi-action-btn` | Icon button 32×32 trong table row |
| `.omi-link` | Link có style primary |
| `.metric-card` | Card số liệu trên Dashboard |
| `.card .card-hover` | Card có hiệu ứng hover |

---

## 2. Layout & Navigation (`app/components/`)

| Component | File | Mô tả | Trạng thái |
|-----------|------|-------|-----------|
| **VileadSidebar** | `VileadSidebar.tsx` | Sidebar điều hướng chính, dùng `.sidebar-item` + `.active` | ✅ Chuẩn |
| **Header** | `Header.tsx` | Thanh header toàn hệ thống (search, avatar, notification) | ✅ Chuẩn |
| **GlobalSubscriptionBanner** | `GlobalSubscriptionBanner.tsx` | Banner subscription (hiển thị toàn cục) | ✅ Chuẩn |

---

## 3. Dashboard (`app/components/`)

| Component | File | Mô tả | Trạng thái |
|-----------|------|-------|-----------|
| **Dashboard** | `Dashboard.tsx` | Trang dashboard chính với metric cards + charts | ✅ Chuẩn |
| **AccountantDashboard** | `AccountantDashboard.tsx` | Dashboard kế toán | ✅ Chuẩn |
| **EnhancedDashboardFilters** | `EnhancedDashboardFilters.tsx` | Bộ lọc nâng cao cho dashboard | ✅ Chuẩn |

---

## 4. Khách hàng — Customer (`app/components/`)

| Component | File | Mô tả | Trạng thái |
|-----------|------|-------|-----------|
| **CustomersManagement** | `CustomersManagement.tsx` | Module quản lý khách hàng chính (~413KB) | ✅ Chuẩn |
| **CustomerDetailModal** | `CustomerDetailModal.tsx` | Modal chi tiết khách hàng (~113KB) | ✅ Chuẩn |
| **CustomerFilters** | `CustomerFilters.tsx` | Bộ lọc danh sách khách hàng | ✅ Chuẩn |
| **CustomerAnalytics** | `CustomerAnalytics.tsx` | Phân tích dữ liệu khách hàng | ✅ Chuẩn |
| **CustomerAIInsights** | `CustomerAIInsights.tsx` | AI phân tích insight khách hàng | ✅ Chuẩn |
| **CustomerEventsManager** | `CustomerEventsManager.tsx` | Quản lý sự kiện khách hàng | ✅ Chuẩn |

---

## 5. Leads (`app/components/`)

| Component | File | Mô tả | Trạng thái |
|-----------|------|-------|-----------|
| **LeadsManagementFixed** | `LeadsManagementFixed.tsx` | Module quản lý leads | ✅ Chuẩn |

---

## 6. Sales (`app/components/`, `app/components/sales/`)

| Component | File | Mô tả | Trạng thái |
|-----------|------|-------|-----------|
| **SalesManagement** | `SalesManagement.tsx` | Module bán hàng chính (~452KB) | ✅ Chuẩn |
| **OrderManagement** | `OrderManagement.tsx` | Quản lý đơn hàng | ✅ Chuẩn |
| **OrderDetailModal** | `OrderDetailModal.tsx` | Modal chi tiết đơn hàng | ✅ Chuẩn |
| **CreateOrderModal** | `CreateOrderModal.tsx` | Modal tạo đơn hàng mới | ✅ Chuẩn |
| **SalesTable** | `sales/components/SalesTable/` | Bảng dữ liệu bán hàng (container) | ✅ Chuẩn |
| **SalesTableHeader** | `sales/components/SalesTable/SalesTableHeader.tsx` | Header row của bảng sales | ✅ Chuẩn |
| **SalesTableRow** | `sales/components/SalesTable/SalesTableRow.tsx` | Data row của bảng sales | ✅ Chuẩn |

---

## 7. Tasks & Events (`app/components/`)

| Component | File | Mô tả | Trạng thái |
|-----------|------|-------|-----------|
| **TaskManagement** | `TaskManagement.tsx` | Module quản lý công việc | ✅ Chuẩn |
| **TaskDetailModal** | `TaskDetailModal.tsx` | Modal chi tiết công việc | ✅ Chuẩn |
| **CreateTaskModal** | `CreateTaskModal.tsx` | Modal tạo task (đầy đủ) | ✅ Chuẩn |
| **CreateTaskModalSimple** | `CreateTaskModalSimple.tsx` | Modal tạo task (đơn giản hóa) | ✅ Chuẩn |
| **CreateEventModal** | `CreateEventModal.tsx` | Modal tạo sự kiện (đầy đủ) | ✅ Chuẩn |
| **CreateEventModalSimple** | `CreateEventModalSimple.tsx` | Modal tạo sự kiện (đơn giản) | ✅ Chuẩn |

---

## 8. KPI & Reports (`app/components/`)

| Component | File | Mô tả | Trạng thái |
|-----------|------|-------|-----------|
| **KPIManagement** | `KPIManagement.tsx` | Quản lý KPI (~244KB) | ✅ Chuẩn |
| **ReportsManagement** | `ReportsManagement.tsx` | Quản lý báo cáo (~201KB) | ✅ Chuẩn |
| **FormulaBuilder** | `FormulaBuilder.tsx` | Builder công thức KPI | ✅ Chuẩn |
| **AISuggestionsTab** | `AISuggestionsTab.tsx` | Tab gợi ý AI | ✅ Chuẩn |
| **EmployeeReportTab** | `reports/EmployeeReportTab.tsx` | Tab báo cáo nhân viên | ✅ Chuẩn |
| **ReportEmployeeFilter** | `reports/ReportEmployeeFilter.tsx` | Bộ lọc nhân viên trong báo cáo | ✅ Chuẩn |

---

## 9. Chat & Communication (`app/components/chat/`, `app/components/`)

| Component | File | Mô tả | Trạng thái |
|-----------|------|-------|-----------|
| **ChatManagement** | `ChatManagement.tsx` | Module chat chính (~367KB) | ✅ Chuẩn |
| **ChatbotAssistantNew** | `ChatbotAssistantNew.tsx` | Chatbot AI assistant | ✅ Chuẩn |
| **ChatShiftPermissionModal** | `chat/ChatShiftPermissionModal.tsx` | Modal phân ca & quyền chat | ✅ Chuẩn |
| **ShiftTab** | `chat/ShiftTab.tsx` | Tab quản lý ca | ✅ Chuẩn |
| **PermissionTab** | `chat/PermissionTab.tsx` | Tab quyền hạn | ✅ Chuẩn |
| **TagManagementModal** | `chat/TagManagementModal.tsx` | Modal quản lý tag | ✅ Chuẩn |
| **DaySelector** | `chat/DaySelector.tsx` | Chọn ngày trong tuần | ✅ Chuẩn |

---

## 10. Email Marketing (`app/components/email-marketing/`)

| Component | File | Mô tả | Trạng thái |
|-----------|------|-------|-----------|
| **EmailMarketing** | `EmailMarketing.tsx` | Entry point module email | ✅ Chuẩn |
| **TemplateLibrary** | `email-marketing/TemplateLibrary.tsx` | Thư viện email template | ✅ Chuẩn |
| **TemplateEditorModal** | `email-marketing/TemplateEditorModal.tsx` | Modal chỉnh sửa template | ✅ Chuẩn |
| **TemplateCard** | `email-marketing/TemplateCard.tsx` | Card hiển thị template | ✅ Chuẩn |
| **AddEmailModal** | `email-marketing/AddEmailModal.tsx` | Modal thêm email | ✅ Chuẩn |
| **AddSenderModal** | `email-marketing/AddSenderModal.tsx` | Modal thêm sender | ✅ Chuẩn |
| **EditEmailModal** | `email-marketing/EditEmailModal.tsx` | Modal sửa email | ✅ Chuẩn |
| **DeleteConfirmModal** | `email-marketing/DeleteConfirmModal.tsx` | Modal xác nhận xóa | ✅ Chuẩn |
| **DeleteTemplateModal** | `email-marketing/DeleteTemplateModal.tsx` | Modal xóa template | ✅ Chuẩn |
| **PreviewModal** | `email-marketing/PreviewModal.tsx` | Modal xem trước email | ✅ Chuẩn |
| **PermissionModal** | `email-marketing/PermissionModal.tsx` | Modal phân quyền | ✅ Chuẩn |
| **SenderEmailConfig** | `email-marketing/SenderEmailConfig.tsx` | Cấu hình sender | ✅ Chuẩn |
| **BrevoConnectionSection** | `email-marketing/BrevoConnectionSection.tsx` | Kết nối Brevo | ✅ Chuẩn |
| **EmailLimitsConfig** | `email-marketing/EmailLimitsConfig.tsx` | Cấu hình giới hạn email | ✅ Chuẩn |
| **LimitCard** | `email-marketing/LimitCard.tsx` | Card hiện giới hạn | ✅ Chuẩn |
| **StatusBadge** | `email-marketing/StatusBadge.tsx` | Badge trạng thái (custom) | ⚠️ Cần kiểm tra dùng omi-badge chưa |
| **CampaignTable** | `email-marketing/campaigns/CampaignTable.tsx` | Bảng danh sách chiến dịch | ✅ Chuẩn |
| **NormalCampaignEditor** | `email-marketing/campaigns/NormalCampaignEditor.tsx` | Editor chiến dịch thường | ✅ Chuẩn |
| **ABCampaignEditor** | `email-marketing/campaigns/ABCampaignEditor.tsx` | Editor chiến dịch A/B test | ✅ Chuẩn |
| **ContentModal** | `email-marketing/campaigns/ContentModal.tsx` | Modal chỉnh nội dung | ✅ Chuẩn |
| **SubjectModal** | `email-marketing/campaigns/SubjectModal.tsx` | Modal chỉnh tiêu đề | ✅ Chuẩn |
| **AttachmentsModal** | `email-marketing/campaigns/AttachmentsModal.tsx` | Modal đính kèm file | ✅ Chuẩn |
| **CampaignStatusBadge** | `email-marketing/campaigns/CampaignStatusBadge.tsx` | Badge trạng thái chiến dịch | ⚠️ Cần kiểm tra dùng omi-badge chưa |
| **EmailReportsDashboard** | `email-marketing/reports/EmailReportsDashboard.tsx` | Dashboard báo cáo email | ✅ Chuẩn |
| **CampaignComparisonTable** | `email-marketing/reports/CampaignComparisonTable.tsx` | Bảng so sánh chiến dịch | ✅ Chuẩn |
| **EmailFunnelChart** | `email-marketing/reports/EmailFunnelChart.tsx` | Biểu đồ funnel email | ✅ Chuẩn |
| **StatusDistributionChart** | `email-marketing/reports/StatusDistributionChart.tsx` | Biểu đồ phân phối trạng thái | ✅ Chuẩn |
| **UnsubscribeSection** | `email-marketing/reports/UnsubscribeSection.tsx` | Phần thống kê hủy đăng ký | ✅ Chuẩn |

---

## 11. ZBS Marketing (`app/components/zbs-marketing/`)

| Component | File | Mô tả | Trạng thái |
|-----------|------|-------|-----------|
| **ZbsMarketing** | `ZbsMarketing.tsx` | Entry point ZBS | ✅ Chuẩn |
| **ZbsCampaignCreator** | `ZbsCampaignCreator.tsx` | Tạo chiến dịch ZBS | ✅ Chuẩn |
| **ZbsCampaignList** | `ZbsCampaignList.tsx` | Danh sách chiến dịch | ✅ Chuẩn |
| **ZbsCampaignWizardModal** | `ZbsCampaignWizardModal.tsx` | Wizard tạo chiến dịch (~43KB) | ✅ Chuẩn |
| **ZbsCampaignDetailModal** | `ZbsCampaignDetailModal.tsx` | Chi tiết chiến dịch | ✅ Chuẩn |
| **ZbsCampaignQuickCreateModal** | `ZbsCampaignQuickCreateModal.tsx` | Tạo nhanh chiến dịch | ✅ Chuẩn |
| **ZbsConnectionModal** | `ZbsConnectionModal.tsx` | Kết nối ZBS | ✅ Chuẩn |
| **ZbsRecipientsModal** | `ZbsRecipientsModal.tsx` | Danh sách người nhận | ✅ Chuẩn |
| **ZbsRecipientsConfigModal** | `ZbsRecipientsConfigModal.tsx` | Cấu hình người nhận | ✅ Chuẩn |
| **ZbsTemplateLibrary** | `ZbsTemplateLibrary.tsx` | Thư viện template ZBS | ✅ Chuẩn |
| **ZbsTemplateEditorModal** | `ZbsTemplateEditorModal.tsx` | Chỉnh sửa template ZBS | ✅ Chuẩn |
| **ZbsTemplateModals** | `ZbsTemplateModals.tsx` | Các modal template ZBS | ✅ Chuẩn |
| **ZbsConfirmStartModal** | `ZbsConfirmStartModal.tsx` | Xác nhận bắt đầu chiến dịch | ✅ Chuẩn |
| **ZbsExportReportModal** | `ZbsExportReportModal.tsx` | Export báo cáo | ✅ Chuẩn |
| **ZbsCampaignStatsCards** | `ZbsCampaignStatsCards.tsx` | Cards thống kê | ✅ Chuẩn |
| **ZbsOverviewStatsCards** | `ZbsOverviewStatsCards.tsx` | Cards tổng quan | ✅ Chuẩn |
| **ZbsReportsDashboard** | `ZbsReportsDashboard.tsx` | Dashboard báo cáo ZBS | ✅ Chuẩn |
| **ZbsReportFilters** | `ZbsReportFilters.tsx` | Bộ lọc báo cáo | ✅ Chuẩn |
| **ZbsDistributionCharts** | `ZbsDistributionCharts.tsx` | Biểu đồ phân phối | ✅ Chuẩn |
| **ZbsSendResultChart** | `ZbsSendResultChart.tsx` | Biểu đồ kết quả gửi | ✅ Chuẩn |
| **ZbsSpendingTrendChart** | `ZbsSpendingTrendChart.tsx` | Biểu đồ chi phí | ✅ Chuẩn |

---

## 12. Automation (`app/components/automation/`)

| Component | File | Mô tả | Trạng thái |
|-----------|------|-------|-----------|
| **AutomationManagement** | `automation/AutomationManagement.tsx` | Entry point automation | ✅ Chuẩn |
| **CreateFlowModal** | `automation/flows/CreateFlowModal.tsx` | Modal tạo flow mới | ✅ Chuẩn |
| **FlowListPage** | `automation/flows/FlowListPage.tsx` | Trang danh sách flows | ✅ Chuẩn |
| **FlowTable** | `automation/flows/FlowTable.tsx` | Bảng danh sách flows | ✅ Chuẩn |
| **FolderSidebar** (flows) | `automation/flows/FolderSidebar.tsx` | Sidebar thư mục flows | ✅ Chuẩn |
| **FlowEditorPage** | `automation/flows/editor/FlowEditorPage.tsx` | Trang editor flow (canvas) | ✅ Chuẩn |
| **FlowCanvas** | `automation/flows/editor/FlowCanvas.tsx` | Canvas kéo-thả nodes | ✅ Chuẩn |
| **NodeCard** | `automation/flows/editor/NodeCard.tsx` | Card đại diện node trong flow | ✅ Chuẩn |
| **NodePalette** | `automation/flows/editor/NodePalette.tsx` | Bảng chọn node để thêm | ✅ Chuẩn |
| **ConfigPanel** | `automation/flows/editor/ConfigPanel.tsx` | Panel cấu hình node được chọn | ✅ Chuẩn |
| **PreviewPanel** | `automation/flows/editor/PreviewPanel.tsx` | Panel xem trước flow | ✅ Chuẩn |
| **Toolbar** | `automation/flows/editor/Toolbar.tsx` | Thanh công cụ editor | ✅ Chuẩn |
| **SequenceListPage** | `automation/sequence/SequenceListPage.tsx` | Trang danh sách sequences | ✅ Chuẩn |
| **SequenceDetailPage** | `automation/sequence/SequenceDetailPage.tsx` | Trang chi tiết sequence | ✅ Chuẩn |
| **StepConfigModal** | `automation/sequence/StepConfigModal.tsx` | Modal cấu hình step | ✅ Chuẩn |
| **TestModeModal** | `automation/sequence/TestModeModal.tsx` | Modal chạy test sequence | ✅ Chuẩn |
| **FolderSidebar** (sequence) | `automation/sequence/FolderSidebar.tsx` | Sidebar thư mục sequences | ✅ Chuẩn |
| **StepCard** | `automation/sequence/components/StepCard.tsx` | Card hiển thị step | ✅ Chuẩn |
| **ActionPickerModal** | `automation/sequence/components/ActionPickerModal.tsx` | Modal chọn action | ✅ Chuẩn |
| **ActionConfigForm** | `automation/sequence/components/ActionConfigForm.tsx` | Form cấu hình action | ✅ Chuẩn |
| **TriggerConfigForm** | `automation/sequence/components/TriggerConfigForm.tsx` | Form cấu hình trigger | ✅ Chuẩn |
| **ConditionBuilder** | `automation/sequence/components/ConditionBuilder.tsx` | Builder điều kiện rẽ nhánh | ✅ Chuẩn |
| **FlowPickerModal** | `automation/sequence/components/FlowPickerModal.tsx` | Modal chọn flow liên kết | ✅ Chuẩn |
| **TimelineStepRow** | `automation/sequence/components/TimelineStepRow.tsx` | Row timeline của step | ✅ Chuẩn |
| **TimingPopup** | `automation/sequence/components/TimingPopup.tsx` | Popup cài đặt thời gian | ✅ Chuẩn |
| **StepStatsModal** | `automation/sequence/components/StepStatsModal.tsx` | Modal thống kê từng step | ✅ Chuẩn |
| **ConfigTab** | `automation/sequence/tabs/ConfigTab.tsx` | Tab cấu hình sequence | ✅ Chuẩn |
| **CustomersTab** | `automation/sequence/tabs/CustomersTab.tsx` | Tab danh sách khách hàng | ✅ Chuẩn |
| **ReportTab** | `automation/sequence/tabs/ReportTab.tsx` | Tab báo cáo sequence | ✅ Chuẩn |
| **AutoRulesPage** | `automation/settings/AutoRulesPage.tsx` | Trang quản lý auto rules | ✅ Chuẩn |
| **BotSettingsPage** | `automation/settings/BotSettingsPage.tsx` | Cấu hình chatbot | ✅ Chuẩn |
| **TagsPage** | `automation/settings/TagsPage.tsx` | Quản lý tags automation | ✅ Chuẩn |

---

## 13. Cài đặt — Settings (`app/components/settings/`)

| Component | File | Mô tả | Trạng thái |
|-----------|------|-------|-----------|
| **SettingsManagement** | `SettingsManagement.tsx` | Module settings chính (~492KB) | ✅ Chuẩn |
| **InterfacePermissionContent** | `settings/InterfacePermissionContent.tsx` | Quản lý quyền giao diện | ✅ Chuẩn |
| **TaxManagement** | `settings/TaxManagement.tsx` | Quản lý thuế | ✅ Chuẩn |
| **DepartmentTeamModals** | `DepartmentTeamModals.tsx` | Modal phòng ban & nhóm | ✅ Chuẩn |
| **BillingManagement** | `settings/billing/BillingManagement.tsx` | Trang quản lý thanh toán & gói | ✅ Chuẩn |
| **LocalSubscriptionAlert** | `settings/billing/Alerts/LocalSubscriptionAlert.tsx` | Alert hết hạn subscription | ✅Chuẩn |
| **UpgradeModal** | `settings/billing/Modals/UpgradeModal.tsx` | Modal nâng cấp gói | ✅ Chuẩn |
| **DowngradeModal** | `settings/billing/Modals/DowngradeModal.tsx` | Modal hạ cấp gói | ✅ Chuẩn |
| **RenewModal** | `settings/billing/Modals/RenewModal.tsx` | Modal gia hạn gói | ✅ Chuẩn |
| **PaymentOrderModal** | `settings/billing/Modals/PaymentOrderModal.tsx` | Modal thanh toán đơn hàng | ✅ Chuẩn |
| **CompanyManagement** | `CompanyManagement.tsx` | Quản lý công ty (~199KB) | ✅ Chuẩn |
| **MarketingCampaigns** | `MarketingCampaigns.tsx` | Chiến dịch marketing (entry) | ✅ Chuẩn |

---

## 14. Quy ước đặt tên

| Loại | Pattern | Ví dụ |
|------|---------|-------|
| Modal/Dialog | `[Object][Action]Modal.tsx` | `CreateTaskModal.tsx`, `EditEmailModal.tsx` |
| Management page | `[Module]Management.tsx` | `TaskManagement.tsx`, `OrderManagement.tsx` |
| Detail modal | `[Object]DetailModal.tsx` | `CustomerDetailModal.tsx`, `OrderDetailModal.tsx` |
| Confirm modal | `[Action]ConfirmModal.tsx` hoặc `Delete[Object]Modal.tsx` | `DeleteConfirmModal.tsx` |
| Card component | `[Object]Card.tsx` | `TemplateCard.tsx`, `LimitCard.tsx` |
| Filter component | `[Module]Filters.tsx` | `CustomerFilters.tsx`, `ZbsReportFilters.tsx` |
| ZBS prefix | `Zbs[ComponentName].tsx` | `ZbsCampaignList.tsx` |

---

## 15. Cách tạo component mới đúng chuẩn

```
1. Dùng shadcn component từ components/ui/ làm nền tảng
2. Đặt tên theo quy ước mục 14
3. Đặt file đúng thư mục module
4. Cập nhật file này (thêm dòng vào bảng tương ứng)
5. Kiểm tra với DESIGN.md trước khi merge
```

---

*Cập nhật lần cuối: 2026-04-19 · Tổng: ~164 custom components + 25 shared UI components*
