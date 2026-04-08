// ======================================================
// MODULE 4.13.2: CONSTANTS
// ======================================================

import {
  TriggerOption, ActionOption, FilterFieldOption, FilterOperator,
  SequenceStatus, JourneyStatus, StepLogStatus,
} from './types';

// ─── 13 Triggers grouped ──────────────────────────────────────────────────────
export const TRIGGER_GROUPS: Array<{ group: string; triggers: TriggerOption[] }> = [
  {
    group: 'Hội thoại',
    triggers: [
      { type: 'conversation_synced', label: 'Hội thoại mới được đồng bộ', group: 'Hội thoại', hasConfig: true },
      { type: 'first_message',       label: 'KH nhắn tin lần đầu',         group: 'Hội thoại', hasConfig: true },
      { type: 'returning_customer',  label: 'KH quay lại',                  group: 'Hội thoại', hasConfig: true },
    ],
  },
  {
    group: 'Đơn hàng',
    triggers: [
      { type: 'new_order',             label: 'Đơn hàng mới',                group: 'Đơn hàng', hasConfig: false },
      { type: 'order_status_changed',  label: 'Chuyển trạng thái đơn',       group: 'Đơn hàng', hasConfig: true  },
      { type: 'order_completed',       label: 'Đơn hàng hoàn thành',         group: 'Đơn hàng', hasConfig: false },
      { type: 'order_cancelled',       label: 'Đơn hàng hủy',                group: 'Đơn hàng', hasConfig: false },
    ],
  },
  {
    group: 'Khách hàng',
    triggers: [
      { type: 'customer_birthday', label: 'Sinh nhật KH',               group: 'Khách hàng', hasConfig: true },
      { type: 'no_interaction',    label: 'Không tương tác X ngày',      group: 'Khách hàng', hasConfig: true },
      { type: 'lead_assigned',     label: 'Lead được assign',            group: 'Khách hàng', hasConfig: false },
    ],
  },
  {
    group: 'Tag',
    triggers: [
      { type: 'tag_added',   label: 'Gắn Tag',  group: 'Tag', hasConfig: true },
      { type: 'tag_removed', label: 'Gỡ Tag',   group: 'Tag', hasConfig: true },
    ],
  },
  {
    group: 'Thời gian',
    triggers: [
      { type: 'scheduled', label: 'Lịch định kỳ', group: 'Thời gian', hasConfig: true },
    ],
  },
];

// Flat map for quick lookup
export const TRIGGER_MAP: Record<string, TriggerOption> = TRIGGER_GROUPS
  .flatMap(g => g.triggers)
  .reduce((acc, t) => ({ ...acc, [t.type]: t }), {});

// ─── 9 Actions ────────────────────────────────────────────────────────────────
export const ACTION_OPTIONS: ActionOption[] = [
  { type: 'send_flow',        label: 'Gửi Luồng tin nhắn',   icon: '📨', description: 'Khởi chạy một luồng tin nhắn đã xuất bản' },
  { type: 'assign_tags',      label: 'Gắn Tag',               icon: '🏷️', description: 'Gắn một hoặc nhiều tag cho khách hàng' },
  { type: 'remove_tags',      label: 'Gỡ Tag',                icon: '🗑️', description: 'Gỡ tag khỏi khách hàng' },
  { type: 'create_task',      label: 'Tạo Công việc',         icon: '✅', description: 'Tạo task và giao cho nhân viên' },
  { type: 'create_reminder',  label: 'Tạo Nhắc nhở',          icon: '🔔', description: 'Tạo reminder cho nhân viên' },
  { type: 'pause_bot',        label: 'Tạm dừng Bot',          icon: '⏸️', description: 'Tạm dừng bot trong khoảng thời gian' },
  { type: 'resume_bot',       label: 'Kích hoạt Bot',         icon: '▶️', description: 'Bật lại bot cho khách hàng' },
  { type: 'enroll_sequence',  label: 'Đăng ký Kịch bản khác', icon: '🔗', description: 'Thêm KH vào một kịch bản khác' },
  { type: 'cancel_sequence',  label: 'Hủy Kịch bản',          icon: '🚫', description: 'Hủy kịch bản hiện tại hoặc kịch bản khác' },
];

export const ACTION_MAP: Record<string, ActionOption> = ACTION_OPTIONS
  .reduce((acc, a) => ({ ...acc, [a.type]: a }), {});

// ─── Filter Fields (used in ConditionBuilder) ─────────────────────────────────
export const FILTER_FIELDS: FilterFieldOption[] = [
  {
    field: 'tags',
    label: 'Tags',
    type: 'tag',
    operators: ['has', 'not_has'],
  },
  {
    field: 'orders_count',
    label: 'Số đơn hàng',
    type: 'number',
    operators: ['equals', 'not_equals', 'gt', 'lt', 'between'],
  },
  {
    field: 'total_revenue',
    label: 'Tổng doanh thu (đ)',
    type: 'number',
    operators: ['gt', 'lt', 'between'],
  },
  {
    field: 'channel',
    label: 'Kênh',
    type: 'select',
    operators: ['equals', 'not_equals'],
    options: [
      { value: 'zalo_oa',       label: 'Zalo OA' },
      { value: 'zalo_personal', label: 'Zalo cá nhân' },
      { value: 'facebook',      label: 'Facebook' },
    ],
  },
  {
    field: 'gender',
    label: 'Giới tính',
    type: 'select',
    operators: ['equals'],
    options: [
      { value: 'male',   label: 'Nam' },
      { value: 'female', label: 'Nữ' },
    ],
  },
  {
    field: 'province',
    label: 'Tỉnh/Thành phố',
    type: 'text',
    operators: ['equals', 'not_equals', 'contains'],
  },
  {
    field: 'last_order_days',
    label: 'Ngày từ đơn cuối',
    type: 'number',
    operators: ['gt', 'lt'],
  },
];

export const STEP_CONDITION_FIELDS: FilterFieldOption[] = [
  {
    field: 'tags',
    label: 'Tags KH',
    type: 'tag',
    operators: ['has', 'not_has'],
  },
  {
    field: 'replied',
    label: 'Đã trả lời tin nhắn',
    type: 'select',
    operators: ['equals'],
    options: [
      { value: 'true',  label: 'Có' },
      { value: 'false', label: 'Không' },
    ],
  },
  {
    field: 'orders_count',
    label: 'Số đơn hàng',
    type: 'number',
    operators: ['gt', 'lt', 'equals'],
  },
  {
    field: 'channel',
    label: 'Kênh',
    type: 'select',
    operators: ['equals', 'not_equals'],
    options: [
      { value: 'zalo_oa',       label: 'Zalo OA' },
      { value: 'zalo_personal', label: 'Zalo cá nhân' },
      { value: 'facebook',      label: 'Facebook' },
    ],
  },
];

export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals:       'bằng',
  not_equals:   'không bằng',
  contains:     'chứa',
  gt:           'lớn hơn',
  lt:           'nhỏ hơn',
  between:      'trong khoảng',
  has:          'có',
  not_has:      'không có',
  is_empty:     'trống',
  is_not_empty: 'không trống',
};

// ─── Status Styles ────────────────────────────────────────────────────────────
export const SEQUENCE_STATUS_STYLES: Record<SequenceStatus, {
  label: string; bg: string; color: string; dot: string;
}> = {
  draft:  { label: 'Bản nháp',    bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8' },
  active: { label: 'Đang chạy',   bg: '#DCFCE7', color: '#15803D', dot: '#22C55E' },
  paused: { label: 'Tạm dừng',    bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
};

export const JOURNEY_STATUS_STYLES: Record<JourneyStatus, {
  label: string; bg: string; color: string; icon: string;
}> = {
  running:   { label: 'Đang chạy',   bg: '#DBEAFE', color: '#1D4ED8', icon: '▶' },
  completed: { label: 'Hoàn thành',  bg: '#DCFCE7', color: '#15803D', icon: '✓' },
  cancelled: { label: 'Đã hủy',      bg: '#FEE2E2', color: '#991B1B', icon: '✕' },
  failed:    { label: 'Thất bại',    bg: '#FEE2E2', color: '#991B1B', icon: '!' },
};

export const STEP_LOG_STYLES: Record<StepLogStatus, {
  label: string; color: string; icon: string;
}> = {
  pending:   { label: 'Chờ',        color: '#94A3B8', icon: '○' },
  scheduled: { label: 'Đã lên lịch', color: '#3B82F6', icon: '⏰' },
  running:   { label: 'Đang chạy',  color: '#3B82F6', icon: '▶' },
  completed: { label: 'Hoàn thành', color: '#22C55E', icon: '✓' },
  skipped:   { label: 'Bỏ qua',     color: '#F59E0B', icon: '⊘' },
  failed:    { label: 'Thất bại',   color: '#EF4444', icon: '✕' },
};

// ─── Channels ─────────────────────────────────────────────────────────────────
export const CHANNEL_OPTIONS = [
  { value: 'zalo_oa',       label: 'Zalo OA' },
  { value: 'zalo_personal', label: 'Zalo cá nhân' },
  { value: 'facebook',      label: 'Facebook' },
] as const;

// ─── Delay Unit Options ───────────────────────────────────────────────────────
export const DELAY_UNIT_OPTIONS = [
  { value: 'minutes', label: 'phút'  },
  { value: 'hours',   label: 'giờ'   },
  { value: 'days',    label: 'ngày'  },
] as const;
