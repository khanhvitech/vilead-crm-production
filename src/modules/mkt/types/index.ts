"use client"

export type UserRole = 'employee' | 'teamLeader' | 'pm' | 'admin';

export interface User {
  id: string;
  full_name: string;
  avatar_initial: string;
  department: 'Team A' | 'Team B';
  role: UserRole;
}

export type FBAccountType = 'profile' | 'page';
export type ProfileStatus = 'live' | 'die' | 'checkpoint' | 'restricted' | 'inactive';
export type PageStatus = 'active' | 'restricted' | 'unpublished';

export interface FBAccount {
  uid: string;
  name: string;
  avatar_initial: string;
  type: FBAccountType;
  status: ProfileStatus | PageStatus;
  status_since: string;
  current_software: 'MKT Care' | 'MKT Post' | 'MKT Page' | 'MKT UID' | null;
  current_holder_id: string | null;
  current_machine_id: string | null;
  last_action_type: string | null;
  last_action_at: string | null;
  parent_profile_uid?: string;
}

export type PostLocation = 'personal' | 'group' | 'page';

export interface Post {
  id: string;
  fb_account_uid: string;
  fb_account_name: string;
  time: string;
  location: PostLocation;
  group_name?: string;
  content: string;
  link: string;
  software: 'MKT Post' | 'MKT Page';
  user_id: string;
  user_name: string;
}

export interface Comment {
  id: string;
  fb_account_uid: string;
  time: string;
  content: string;
  parent_post_link: string;
  software: 'MKT Care' | 'MKT Post' | 'MKT Page';
  user_id: string;
}

export type StatusEventType = 'status_change' | 'user_change' | 'software_change';

export interface TimelineEvent {
  id: string;
  fb_account_uid: string;
  at: string;
  event_type: StatusEventType;
  from_status?: string;
  to_status?: string;
  reason?: 'checkpoint' | 'disabled' | 'unknown' | string;
  from_user_id?: string;
  to_user_id?: string;
  from_software?: string;
  to_software?: string;
  holder_user_id: string;
  software: string;
}

export interface Machine {
  id: string;
  name: string;
  assigned_user_id: string | null;
  last_sync_at: string;
  status: 'online' | 'offline';
  connection_code?: string;
}

export interface DailyStats {
  date: string;
  messages: number;
  posts: number;
  likes: number;
  comments: number;
  uids_collected: number;
  friends_requests_sent?: number;
  friends_accepted?: number;
  reactions_received?: number;
  follower_delta?: number;
}

export interface HourlyActivity {
  hour: number;
  messages: number;
  posts: number;
  likes: number;
  comments: number;
  uids: number;
}
