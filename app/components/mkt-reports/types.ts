'use client'

export type MktReportMainTab =
  | 'overview'
  | 'accounts'
  | 'fanpages'
  | 'uids'
  | 'posts-comments'
  | 'daily'
  | 'machines'

export type MktPeriod = 'today' | 'this_week' | 'this_month' | 'last_month'
export type MktSoftwareFilter = 'all' | 'mkt-care' | 'mkt-post' | 'mkt-page' | 'mkt-uid'
export type MktEmployeeFilter = 'all' | string
export type MktFacebookStatus = 'live' | 'die' | 'inactive' | 'checkpoint'
export type MktFanpageStatus = 'active' | 'restricted' | 'deleted'
export type MktUidSource = 'friends' | 'group' | 'page' | 'other'
export type MktPostCommentSubTab = 'posts' | 'comments'
export type MktDailySubTab = 'by-employee' | 'by-software' | 'by-day'
export type MktAccountDetailTab = 'overview' | 'history' | 'posts-comments' | 'status-history'
export type MktFanpageDetailTab = 'metrics' | 'content-types' | 'follower-trend' | 'posts'

export interface MktEmployee {
  id: string
  name: string
}

export interface MktAccountMetric {
  date: string
  messages: number
  posts: number
  likes: number
  comments: number
  uids: number
}

export interface MktStatusHistoryRecord {
  id: string
  status: MktFacebookStatus
  recordedAt: string
  operator: string
  note?: string
}

export interface MktPostHistoryRecord {
  id: string
  time: string
  typeLabel: string
  content: string
  targetUid: string
  postUid: string
}

export interface MktCommentHistoryRecord {
  id: string
  time: string
  software: MktSoftwareFilter
  content: string
  typeLabel: string
  targetUid: string
}

export interface MktFacebookAccount {
  id: string
  name: string
  uid: string
  status: MktFacebookStatus
  software: 'mkt-care' | 'mkt-post'
  employeeId: string
  lastAction: string
  lastActiveLabel: string
  metrics: MktAccountMetric[]
  overview: {
    currentStatus: string
    keeperName: string
    softwareLabel: string
    lastActionLabel: string
  }
  postHistory: MktPostHistoryRecord[]
  commentHistory: MktCommentHistoryRecord[]
  statusHistory: MktStatusHistoryRecord[]
}

export interface MktFanpageMetricPoint {
  date: string
  totalFollower: number
  newFollower: number
  unfollow: number
}

export interface MktFanpagePostRecord {
  id: string
  time: string
  content: string
  targetUid: string
  postUid: string
}

export interface MktFanpage {
  id: string
  pageId: string
  name: string
  status: MktFanpageStatus
  employeeId: string
  follower: number
  newFollower: number
  unfollow: number
  posts: number
  reactions: number
  comments: number
  lastActivity: string
  contentTypes: {
    text: number
    image: number
    video: number
    reels: number
  }
  shares: number
  outboundLikes: number
  outboundComments: number
  trend: MktFanpageMetricPoint[]
  postHistory: MktFanpagePostRecord[]
}

export interface MktUidCollectionRecord {
  id: string
  source: MktUidSource
  scanTypeLabel: string
  targetName: string
  uidCount: number
  scannerAccount: string
  scannerUid: string
  employeeId: string
  time: string
}

export interface MktPostRecord {
  id: string
  time: string
  accountName: string
  uid: string
  employeeId: string
  typeLabel: string
  softwareLabel: string
  software: 'mkt-post' | 'mkt-page'
  content: string
  targetUid: string
  postUid: string
}

export interface MktCommentRecord {
  id: string
  time: string
  accountName: string
  uid: string
  employeeId: string
  softwareLabel: string
  software: 'mkt-care' | 'mkt-post' | 'mkt-page'
  content: string
  typeLabel: string
  targetUid: string
}

export interface MktDailyEmployeeSoftwareBreakdown {
  software: MktSoftwareFilter
  softwareLabel: string
  messages: number
  posts: number
}

export interface MktDailyEmployeeRow {
  employeeId: string
  live: number
  die: number
  messages: number
  posts: number
  likes: number
  comments: number
  uids: number
  breakdown: MktDailyEmployeeSoftwareBreakdown[]
  latestPost: {
    time: string
    typeLabel: string
    content: string
    viewLabel: string
  }
}

export interface MktDailySoftwareRow {
  software: MktSoftwareFilter
  softwareLabel: string
  accounts: number
  messages: number | null
  posts: number | null
  likes: number | null
  comments: number | null
  uids: number | null
}

export interface MktDailyByDayRow {
  dateLabel: string
  live: number
  die: number
  messages: number
  posts: number
  likes: number
  comments: number
  uids: number
}

export interface MktMachine {
  id: string
  machineName: string
  employeeId: string
  installedSoftware: MktSoftwareFilter[]
  lastSync: string
  status: 'online' | 'offline'
}

