// ======================================================
// MODULE 4.13.2: KỊCH BẢN CHĂM SÓC – TYPE DEFINITIONS
// ======================================================

// ─── Status Enums ─────────────────────────────────────────────────────────────
export type SequenceStatus = 'draft' | 'active' | 'paused';
export type JourneyStatus  = 'running' | 'completed' | 'cancelled' | 'failed';
export type StepLogStatus  = 'pending' | 'scheduled' | 'running' | 'completed' | 'skipped' | 'failed';

// ─── Trigger Types (13) ────────────────────────────────────────────────────────
export type TriggerType =
  | 'conversation_synced'
  | 'first_message'
  | 'returning_customer'
  | 'new_order'
  | 'order_status_changed'
  | 'order_completed'
  | 'order_cancelled'
  | 'customer_birthday'
  | 'no_interaction'
  | 'lead_assigned'
  | 'tag_added'
  | 'tag_removed'
  | 'scheduled';

// ─── Action Types (9) ─────────────────────────────────────────────────────────
export type ActionType =
  | 'send_flow'
  | 'assign_tags'
  | 'remove_tags'
  | 'create_task'
  | 'create_reminder'
  | 'pause_bot'
  | 'resume_bot'
  | 'enroll_sequence'
  | 'cancel_sequence';

// ─── Trigger Configs ──────────────────────────────────────────────────────────
export type ChannelType = 'zalo_oa' | 'zalo_personal' | 'facebook';

export interface TriggerConfigChannels {
  channels: ChannelType[];
}
export interface TriggerConfigReturning extends TriggerConfigChannels {
  inactive_days: number;
}
export interface TriggerConfigBirthday {
  mode: 'on_day' | 'before_x_days';
  days_before?: number;
}
export interface TriggerConfigNoInteraction {
  days: number;
}
export interface TriggerConfigOrderStatus {
  target_status: string;
}
export interface TriggerConfigTag {
  tag_id: string;
}
export interface TriggerConfigScheduled {
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;           // "HH:MM"
  day_of_week?: number;   // 0-6
  day_of_month?: number;  // 1-31
}

export type TriggerConfig =
  | TriggerConfigChannels
  | TriggerConfigReturning
  | TriggerConfigBirthday
  | TriggerConfigNoInteraction
  | TriggerConfigOrderStatus
  | TriggerConfigTag
  | TriggerConfigScheduled
  | Record<string, unknown>;

// ─── Filter / Condition Builder ───────────────────────────────────────────────
export type FilterOperator =
  | 'equals' | 'not_equals' | 'contains'
  | 'gt' | 'lt' | 'between'
  | 'has' | 'not_has' | 'is_empty' | 'is_not_empty';

export interface FilterRule {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string | number | string[] | { from: number; to: number };
}

export interface SequenceFilter {
  enabled: boolean;
  logic: 'all' | 'any';
  rules: FilterRule[];
}

// ─── Step ─────────────────────────────────────────────────────────────────────
export interface StepDelay {
  type: 'immediate' | 'wait';
  value?: number;
  unit?: 'minutes' | 'hours' | 'days';
  time_window?: { from: string; to: string };
}

export interface StepCondition {
  enabled: boolean;
  logic: 'all' | 'any';
  rules: FilterRule[];
  on_skip: 'continue' | 'end_journey';
}

// Action configs
export interface ActionConfigSendFlow    { flow_id: string }
export interface ActionConfigAssignTags  { tag_ids: string[] }
export interface ActionConfigRemoveTags  { tag_ids: string[] }
export interface ActionConfigCreateTask  {
  title: string;
  description?: string;
  assign_to: 'specific_user' | 'lead_owner';
  user_id?: string;
  deadline_value: number;
  deadline_unit: 'hours' | 'days';
}
export interface ActionConfigCreateReminder {
  content: string;
  recipient: 'self' | 'lead_owner';
  remind_at_offset_hours: number;
}
export interface ActionConfigPauseBot { duration_minutes: number }
export interface ActionConfigEnrollSequence { sequence_id: string }
export interface ActionConfigCancelSequence {
  mode: 'current' | 'other';
  sequence_id?: string;
}

export type ActionConfig =
  | ActionConfigSendFlow
  | ActionConfigAssignTags
  | ActionConfigRemoveTags
  | ActionConfigCreateTask
  | ActionConfigCreateReminder
  | ActionConfigPauseBot
  | ActionConfigEnrollSequence
  | ActionConfigCancelSequence
  | Record<string, unknown>;

export interface SequenceStep {
  id: string;
  step_order: number;
  name?: string;
  delay: StepDelay;
  condition: StepCondition | null;
  action: {
    type: ActionType;
    config: ActionConfig;
  };
}

// ─── Folder ───────────────────────────────────────────────────────────────────
export interface Folder {
  id: string;
  name: string;
  sequenceCount: number;
  position: number;
  isDefault?: boolean;
}

// ─── Sequence ─────────────────────────────────────────────────────────────────
export interface SequenceStats {
  total_customers: number;
  running: number;
  completed: number;
  cancelled: number;
}

export interface Sequence {
  id: string;
  name: string;
  description?: string;
  folder?: { id: string; name: string };
  status: SequenceStatus;
  current_version: number;
  trigger: {
    type: TriggerType;
    config: TriggerConfig;
  };
  filter: SequenceFilter;
  steps: SequenceStep[];
  stats: SequenceStats;
  created_by: { id: string; name: string };
  created_at: string;
  updated_at: string;
}

// ─── Journey ──────────────────────────────────────────────────────────────────
export interface JourneyStepLog {
  id: string;
  step_order: number;
  step_name?: string;
  status: StepLogStatus;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  skipped_reason?: string;
  error_message?: string;
  retry_count: number;
  action_type: ActionType;
  action_result?: Record<string, unknown>;
}

export interface CustomerJourney {
  id: string;
  sequence_id: string;
  version_used: number;
  customer: {
    id: string;
    name: string;
    phone: string;
    channel: ChannelType;
  };
  status: JourneyStatus;
  current_step: number;
  total_steps: number;
  is_test: boolean;
  enrolled_at: string;
  completed_at?: string;
  cancelled_at?: string;
  cancel_reason?: string;
  step_logs: JourneyStepLog[];
}

// ─── Report ───────────────────────────────────────────────────────────────────
export interface StepFunnel {
  step_order: number;
  name: string;
  entered: number;
  completed: number;
  skipped: number;
  dropped: number;
}

export interface SequenceReport {
  summary: {
    total_enrolled: number;
    running: number;
    completed: number;
    cancelled_auto: number;
    cancelled_manual: number;
    completion_rate: number;
    conversion: {
      orders_count: number;
      revenue: number;
      rate: number;
    };
  };
  step_funnel: StepFunnel[];
  timeline: Array<{
    date: string;
    enrolled: number;
    completed: number;
    cancelled: number;
  }>;
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────
export interface TriggerOption {
  type: TriggerType;
  label: string;
  group: string;
  hasConfig: boolean;
}

export interface ActionOption {
  type: ActionType;
  label: string;
  icon: string;
  description: string;
  group?: string;
}

export interface FilterFieldOption {
  field: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'tag' | 'date';
  operators: FilterOperator[];
  options?: Array<{ value: string; label: string }>;
}

export interface FlowOption {
  id: string;
  name: string;
  status: 'published' | 'draft';
  message_count?: number;
}

export interface SequenceOption {
  id: string;
  name: string;
  status: SequenceStatus;
}
