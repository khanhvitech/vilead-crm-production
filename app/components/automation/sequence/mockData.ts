// ======================================================
// MODULE 4.13.2: MOCK DATA
// ======================================================

import {
  Sequence, CustomerJourney, SequenceReport, FlowOption, SequenceOption,
} from './types';

// ─── Mock Flows (Published only) ──────────────────────────────────────────────
export const MOCK_FLOWS: FlowOption[] = [
  { id: 'f1', name: 'Chào mừng KH mới',       status: 'published', message_count: 3 },
  { id: 'f2', name: 'Xác nhận đơn hàng',       status: 'published', message_count: 2 },
  { id: 'f3', name: 'Hỏi feedback sản phẩm',    status: 'published', message_count: 4 },
  { id: 'f4', name: 'Upsell Premium',           status: 'published', message_count: 5 },
  { id: 'f5', name: 'Nhắc nhở gia hạn',        status: 'published', message_count: 2 },
  { id: 'f6', name: 'Ưu đãi sinh nhật',        status: 'published', message_count: 3 },
  { id: 'f7', name: 'Chăm sóc sau mua',        status: 'published', message_count: 6 },
  { id: 'f8', name: '[DRAFT] Test flow',        status: 'draft',     message_count: 1 },
];

// ─── Sequences ────────────────────────────────────────────────────────────────
export const MOCK_SEQUENCES_FULL: Sequence[] = [
  {
    id: 'seq1',
    name: 'Chăm sóc KH mới',
    description: 'Tự động chăm sóc khách hàng sau lần nhắn tin đầu tiên',
    status: 'active',
    current_version: 2,
    trigger: {
      type: 'first_message',
      config: { channels: ['zalo_oa', 'zalo_personal'] },
    },
    filter: {
      enabled: true,
      logic: 'all',
      rules: [
        { id: 'r1', field: 'orders_count', operator: 'gt', value: 0 },
      ],
    },
    steps: [
      {
        id: 'step1',
        step_order: 1,
        name: 'Gửi tin chào mừng',
        delay: { type: 'immediate' },
        condition: null,
        action: { type: 'send_flow', config: { flow_id: 'f1' } },
      },
      {
        id: 'step2',
        step_order: 2,
        name: 'Gắn tag KH mới',
        delay: { type: 'wait', value: 1, unit: 'days' },
        condition: null,
        action: { type: 'assign_tags', config: { tag_ids: ['t1'] } },
      },
      {
        id: 'step3',
        step_order: 3,
        name: 'Tin ưu đãi VIP',
        delay: { type: 'wait', value: 2, unit: 'days', time_window: { from: '08:00', to: '18:00' } },
        condition: {
          enabled: true,
          logic: 'all',
          rules: [{ id: 'cr1', field: 'tags', operator: 'has', value: 't6' }],
          on_skip: 'continue',
        },
        action: { type: 'send_flow', config: { flow_id: 'f4' } },
      },
      {
        id: 'step4',
        step_order: 4,
        name: 'Tạo nhắc nhở',
        delay: { type: 'wait', value: 3, unit: 'days' },
        condition: null,
        action: { type: 'create_reminder', config: { content: 'Gọi điện tư vấn KH', recipient: 'lead_owner', remind_at_offset_hours: 0 } },
      },
      {
        id: 'step5',
        step_order: 5,
        name: 'Tổng kết',
        delay: { type: 'wait', value: 5, unit: 'days' },
        condition: null,
        action: { type: 'send_flow', config: { flow_id: 'f7' } },
      },
    ],
    stats: { total_customers: 156, running: 45, completed: 100, cancelled: 11 },
    created_by: { id: 'u1', name: 'Admin' },
    created_at: '2026-04-01T10:00:00Z',
    updated_at: '2026-04-05T14:30:00Z',
  },
  {
    id: 'seq2',
    name: 'Chúc mừng sinh nhật',
    description: 'Gửi lời chúc và ưu đãi vào ngày sinh nhật KH',
    status: 'active',
    current_version: 1,
    trigger: {
      type: 'customer_birthday',
      config: { mode: 'before_x_days', days_before: 1 },
    },
    filter: { enabled: false, logic: 'all', rules: [] },
    steps: [
      {
        id: 'bstep1',
        step_order: 1,
        name: 'Gửi lời chúc',
        delay: { type: 'immediate' },
        condition: null,
        action: { type: 'send_flow', config: { flow_id: 'f6' } },
      },
      {
        id: 'bstep2',
        step_order: 2,
        name: 'Gắn tag sinh nhật',
        delay: { type: 'wait', value: 1, unit: 'hours' },
        condition: null,
        action: { type: 'assign_tags', config: { tag_ids: ['t1'] } },
      },
      {
        id: 'bstep3',
        step_order: 3,
        name: 'Tạo task gọi điện',
        delay: { type: 'wait', value: 2, unit: 'hours' },
        condition: null,
        action: { type: 'create_task', config: { title: 'Gọi chúc mừng sinh nhật', assign_to: 'lead_owner', deadline_value: 8, deadline_unit: 'hours' } },
      },
    ],
    stats: { total_customers: 92, running: 12, completed: 80, cancelled: 0 },
    created_by: { id: 'u1', name: 'Admin' },
    created_at: '2026-04-02T09:00:00Z',
    updated_at: '2026-04-02T09:00:00Z',
  },
  {
    id: 'seq3',
    name: 'Sau đơn hàng hoàn thành',
    description: 'Chăm sóc sau khi đơn hàng hoàn thành, tăng khả năng mua lại',
    status: 'paused',
    current_version: 1,
    trigger: {
      type: 'order_completed',
      config: {},
    },
    filter: { enabled: false, logic: 'all', rules: [] },
    steps: [
      {
        id: 'ostep1',
        step_order: 1,
        name: 'Cảm ơn và feedback',
        delay: { type: 'wait', value: 30, unit: 'minutes' },
        condition: null,
        action: { type: 'send_flow', config: { flow_id: 'f3' } },
      },
      {
        id: 'ostep2',
        step_order: 2,
        name: 'Upsell sản phẩm liên quan',
        delay: { type: 'wait', value: 3, unit: 'days', time_window: { from: '09:00', to: '21:00' } },
        condition: {
          enabled: true,
          logic: 'all',
          rules: [{ id: 'ocr1', field: 'orders_count', operator: 'lt', value: 5 }],
          on_skip: 'continue',
        },
        action: { type: 'send_flow', config: { flow_id: 'f4' } },
      },
      {
        id: 'ostep3',
        step_order: 3,
        name: 'Nhắc gia hạn',
        delay: { type: 'wait', value: 7, unit: 'days' },
        condition: null,
        action: { type: 'send_flow', config: { flow_id: 'f5' } },
      },
      {
        id: 'ostep4',
        step_order: 4,
        name: 'Gán tag mua lại',
        delay: { type: 'immediate' },
        condition: null,
        action: { type: 'assign_tags', config: { tag_ids: ['t6'] } },
      },
    ],
    stats: { total_customers: 158, running: 8, completed: 150, cancelled: 0 },
    created_by: { id: 'u1', name: 'Admin' },
    created_at: '2026-03-20T11:00:00Z',
    updated_at: '2026-04-01T10:00:00Z',
  },
  {
    id: 'seq4',
    name: 'Chăm sóc KH VIP',
    description: 'Kịch bản dành riêng cho KH VIP khi được gắn tag',
    status: 'draft',
    current_version: 1,
    trigger: {
      type: 'tag_added',
      config: { tag_id: 't6' },
    },
    filter: { enabled: false, logic: 'all', rules: [] },
    steps: [],
    stats: { total_customers: 28, running: 3, completed: 25, cancelled: 0 },
    created_by: { id: 'u1', name: 'Admin' },
    created_at: '2026-04-06T15:00:00Z',
    updated_at: '2026-04-06T15:00:00Z',
  },
];

// ─── Sequence List Options (for dropdowns) ────────────────────────────────────
export const MOCK_SEQUENCE_OPTIONS: SequenceOption[] = MOCK_SEQUENCES_FULL.map(s => ({
  id: s.id,
  name: s.name,
  status: s.status,
}));

// ─── Mock Journeys (for seq1) ─────────────────────────────────────────────────
export const MOCK_JOURNEYS: CustomerJourney[] = [
  {
    id: 'j1',
    sequence_id: 'seq1',
    version_used: 2,
    customer: { id: 'c1', name: 'Nguyễn Văn A', phone: '0901234567', channel: 'zalo_oa' },
    status: 'running',
    current_step: 4,
    total_steps: 5,
    is_test: false,
    enrolled_at: '2026-04-01T10:00:00Z',
    step_logs: [
      { id: 'sl1', step_order: 1, step_name: 'Gửi tin chào mừng', status: 'completed', completed_at: '2026-04-01T10:01:00Z', action_type: 'send_flow', retry_count: 0 },
      { id: 'sl2', step_order: 2, step_name: 'Gắn tag KH mới',    status: 'completed', completed_at: '2026-04-02T10:00:00Z', action_type: 'assign_tags', retry_count: 0 },
      { id: 'sl3', step_order: 3, step_name: 'Tin ưu đãi VIP',    status: 'skipped',   completed_at: '2026-04-03T09:15:00Z', skipped_reason: 'Điều kiện không thỏa: KH không có tag VIP', action_type: 'send_flow', retry_count: 0 },
      { id: 'sl4', step_order: 4, step_name: 'Tạo nhắc nhở',      status: 'scheduled', scheduled_at: '2026-04-05T10:00:00Z', action_type: 'create_reminder', retry_count: 0 },
      { id: 'sl5', step_order: 5, step_name: 'Tổng kết',          status: 'pending',   action_type: 'send_flow', retry_count: 0 },
    ],
  },
  {
    id: 'j2',
    sequence_id: 'seq1',
    version_used: 2,
    customer: { id: 'c2', name: 'Trần Thị B', phone: '0912345678', channel: 'facebook' },
    status: 'running',
    current_step: 3,
    total_steps: 5,
    is_test: false,
    enrolled_at: '2026-04-02T14:00:00Z',
    step_logs: [
      { id: 'sl6', step_order: 1, step_name: 'Gửi tin chào mừng', status: 'completed', completed_at: '2026-04-02T14:01:00Z', action_type: 'send_flow', retry_count: 0 },
      { id: 'sl7', step_order: 2, step_name: 'Gắn tag KH mới',    status: 'completed', completed_at: '2026-04-03T14:00:00Z', action_type: 'assign_tags', retry_count: 0 },
      { id: 'sl8', step_order: 3, step_name: 'Tin ưu đãi VIP',    status: 'running',   started_at: '2026-04-04T14:00:00Z', action_type: 'send_flow', retry_count: 0 },
    ],
  },
  {
    id: 'j3',
    sequence_id: 'seq1',
    version_used: 2,
    customer: { id: 'c3', name: 'Lê Văn C', phone: '0923456789', channel: 'zalo_oa' },
    status: 'completed',
    current_step: 5,
    total_steps: 5,
    is_test: false,
    enrolled_at: '2026-03-28T09:00:00Z',
    completed_at: '2026-04-02T09:00:00Z',
    step_logs: [
      { id: 'sl9',  step_order: 1, step_name: 'Gửi tin chào mừng', status: 'completed', completed_at: '2026-03-28T09:01:00Z', action_type: 'send_flow', retry_count: 0 },
      { id: 'sl10', step_order: 2, step_name: 'Gắn tag KH mới',    status: 'completed', completed_at: '2026-03-29T09:00:00Z', action_type: 'assign_tags', retry_count: 0 },
      { id: 'sl11', step_order: 3, step_name: 'Tin ưu đãi VIP',    status: 'completed', completed_at: '2026-03-30T09:00:00Z', action_type: 'send_flow', retry_count: 0 },
      { id: 'sl12', step_order: 4, step_name: 'Tạo nhắc nhở',      status: 'completed', completed_at: '2026-03-31T09:00:00Z', action_type: 'create_reminder', retry_count: 0 },
      { id: 'sl13', step_order: 5, step_name: 'Tổng kết',          status: 'completed', completed_at: '2026-04-02T09:00:00Z', action_type: 'send_flow', retry_count: 0 },
    ],
  },
  {
    id: 'j4',
    sequence_id: 'seq1',
    version_used: 2,
    customer: { id: 'c4', name: 'Phạm Thị D (Test)', phone: '0934567890', channel: 'zalo_oa' },
    status: 'completed',
    current_step: 5,
    total_steps: 5,
    is_test: true,
    enrolled_at: '2026-04-03T16:00:00Z',
    completed_at: '2026-04-03T16:01:00Z',
    step_logs: [],
  },
  {
    id: 'j5',
    sequence_id: 'seq1',
    version_used: 1,
    customer: { id: 'c5', name: 'Hoàng Văn E', phone: '0945678901', channel: 'zalo_personal' },
    status: 'cancelled',
    current_step: 2,
    total_steps: 5,
    is_test: false,
    enrolled_at: '2026-03-25T08:00:00Z',
    cancelled_at: '2026-03-26T12:00:00Z',
    cancel_reason: 'Khách hàng yêu cầu dừng nhận tin',
    step_logs: [],
  },
];

// ─── Mock Report ──────────────────────────────────────────────────────────────
export const MOCK_REPORT: SequenceReport = {
  summary: {
    total_enrolled: 320,
    running: 45,
    completed: 240,
    cancelled_auto: 20,
    cancelled_manual: 15,
    completion_rate: 75.0,
    conversion: {
      orders_count: 80,
      revenue: 24000000,
      rate: 25.0,
    },
  },
  step_funnel: [
    { step_order: 1, name: 'Gửi tin chào mừng', entered: 320, completed: 318, skipped: 0, dropped: 2 },
    { step_order: 2, name: 'Gắn tag KH mới',    entered: 318, completed: 316, skipped: 0, dropped: 2 },
    { step_order: 3, name: 'Tin ưu đãi VIP',   entered: 316, completed: 180, skipped: 120, dropped: 16 },
    { step_order: 4, name: 'Tạo nhắc nhở',     entered: 300, completed: 290, skipped: 0, dropped: 10 },
    { step_order: 5, name: 'Tổng kết',          entered: 290, completed: 240, skipped: 0, dropped: 50 },
  ],
  timeline: [
    { date: '2026-04-01', enrolled: 45, completed: 0,  cancelled: 2 },
    { date: '2026-04-02', enrolled: 38, completed: 12, cancelled: 1 },
    { date: '2026-04-03', enrolled: 52, completed: 28, cancelled: 3 },
    { date: '2026-04-04', enrolled: 41, completed: 35, cancelled: 0 },
    { date: '2026-04-05', enrolled: 29, completed: 42, cancelled: 2 },
    { date: '2026-04-06', enrolled: 37, completed: 55, cancelled: 1 },
    { date: '2026-04-07', enrolled: 44, completed: 68, cancelled: 5 },
  ],
};

// Mock tags for cross-reference
export const MOCK_TAGS_REF = [
  { id: 't1', name: 'Khách hàng',     color: '#EF4444' },
  { id: 't2', name: 'Gia đình',       color: '#22C55E' },
  { id: 't3', name: 'Công việc',      color: '#F97316' },
  { id: 't4', name: 'Bạn bè',         color: '#3B82F6' },
  { id: 't5', name: 'Trả lời sau',    color: '#EAB308' },
  { id: 't6', name: 'VIP',            color: '#8B5CF6' },
  { id: 't7', name: 'Khách tiềm năng',color: '#EC4899' },
];
