'use client'

import { useState } from 'react'

import {
  MKT_COMMENTS,
  MKT_DAILY_BY_DAY,
  MKT_DAILY_BY_EMPLOYEE,
  MKT_DAILY_BY_SOFTWARE,
  MKT_EMPLOYEES,
  MKT_FACEBOOK_ACCOUNTS,
  MKT_FANPAGES,
  MKT_MACHINES,
  MKT_POSTS,
  MKT_UID_COLLECTIONS,
} from './mockData'
import type {
  MktAccountDetailTab,
  MktDailyByDayRow,
  MktDailyEmployeeRow,
  MktDailySubTab,
  MktFacebookAccount,
  MktFanpage,
  MktFanpageDetailTab,
  MktMachine,
  MktPeriod,
  MktPostCommentSubTab,
  MktReportMainTab,
  MktSoftwareFilter,
  MktUidCollectionRecord,
  MktUidSource,
} from './types'

type MktBaseTabFilters = {
  period: MktPeriod
  software: MktSoftwareFilter
  employeeId: string
}

type MktAccountTabFilters = MktBaseTabFilters & {
  status: 'all' | 'live' | 'die' | 'inactive'
  search: string
}

type MktFanpageTabFilters = MktBaseTabFilters & {
  status: 'all' | 'active' | 'restricted' | 'deleted'
}

type MktUidTabFilters = {
  period: MktPeriod
  employeeId: string
  source: 'all' | MktUidSource
}

type MktPostsCommentsTabFilters = MktBaseTabFilters & {
  type: string
}

type MktDailyTabFilters = MktBaseTabFilters
type MktMachineTabFilters = MktBaseTabFilters

const softwareLabelMap: Record<MktSoftwareFilter, string> = {
  all: 'Tất cả phần mềm',
  'mkt-care': 'MKT Care',
  'mkt-post': 'MKT Post',
  'mkt-page': 'MKT Page',
  'mkt-uid': 'MKT UID',
}

const employeeNameMap = Object.fromEntries(MKT_EMPLOYEES.map(employee => [employee.id, employee.name]))
const periodDefault: MktPeriod = 'today'
const machineSoftwareOrder: MktSoftwareFilter[] = ['mkt-care', 'mkt-post', 'mkt-page', 'mkt-uid']

const createCsv = (filename: string, rows: Record<string, string | number | null | undefined>[]) => {
  if (typeof window === 'undefined') {
    return
  }

  const headers = rows.length > 0 ? Object.keys(rows[0]) : []
  const content = [
    headers.join(','),
    ...rows.map(row =>
      headers
        .map(header => {
          const rawValue = row[header]
          const stringValue = rawValue === null || rawValue === undefined ? '' : String(rawValue)
          return `"${stringValue.replace(/"/g, '""')}"`
        })
        .join(',')
    ),
  ].join('\n')

  const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const normalizeDate = (value: string) => {
  if (value.includes('/')) {
    const [day, month, year] = value.split(' ')[0].split('/')
    if (year) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }

    return `2026-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  return value
}

const normalizeDayLabel = (value: string) => {
  const [day, month] = value.split('/')
  return `2026-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

const isInSelectedPeriod = (dateValue: string, period: MktPeriod) => {
  const normalized = normalizeDate(dateValue)
  if (period === 'today') {
    return normalized.includes('2026-05-07') || normalized.includes('2026-04-20')
  }

  if (period === 'this_week') {
    return normalized >= '2026-05-01' && normalized <= '2026-05-07'
  }

  if (period === 'this_month') {
    return normalized.startsWith('2026-05')
  }

  return normalized.startsWith('2026-04')
}

const matchesSoftware = (software: string, selectedSoftware: MktSoftwareFilter) =>
  selectedSoftware === 'all' ? true : software === selectedSoftware

const matchesEmployee = (employeeId: string, selectedEmployee: string) =>
  selectedEmployee === 'all' ? true : employeeId === selectedEmployee

const getEmployeeName = (employeeId: string) => employeeNameMap[employeeId] ?? employeeId

const getAccountStatusLabel = (status: MktFacebookAccount['status']) => {
  if (status === 'live') return 'Live'
  if (status === 'die') return 'Die'
  if (status === 'inactive') return 'Không hoạt động'
  return 'Checkpoint'
}

const accountHasPeriodActivity = (account: MktFacebookAccount, period: MktPeriod) =>
  account.metrics.some(metric => isInSelectedPeriod(metric.date, period))

const fanpageHasPeriodActivity = (fanpage: MktFanpage, period: MktPeriod) =>
  fanpage.trend.some(item => isInSelectedPeriod(item.date, period))

const getMetricsForPeriod = (account: MktFacebookAccount, period: MktPeriod) =>
  account.metrics.filter(metric => isInSelectedPeriod(metric.date, period))

const getMetricsForDate = (account: MktFacebookAccount, dateLabel: string) =>
  account.metrics.filter(metric => normalizeDayLabel(metric.date) === dateLabel)

const getMatchingAccounts = (filters: { period: MktPeriod; software: MktSoftwareFilter; employeeId: string }) =>
  MKT_FACEBOOK_ACCOUNTS.filter(
    account =>
      accountHasPeriodActivity(account, filters.period) &&
      matchesSoftware(account.software, filters.software) &&
      matchesEmployee(account.employeeId, filters.employeeId)
  )

const getMatchingFanpages = (filters: { period: MktPeriod; software: MktSoftwareFilter; employeeId: string }) =>
  MKT_FANPAGES.filter(
    fanpage =>
      fanpageHasPeriodActivity(fanpage, filters.period) &&
      (filters.software === 'all' || filters.software === 'mkt-page') &&
      matchesEmployee(fanpage.employeeId, filters.employeeId)
  )

const getMatchingPosts = (filters: { period: MktPeriod; software: MktSoftwareFilter; employeeId: string }) =>
  MKT_POSTS.filter(
    record =>
      isInSelectedPeriod(record.time, filters.period) &&
      matchesSoftware(record.software, filters.software) &&
      matchesEmployee(record.employeeId, filters.employeeId)
  )

const getMatchingComments = (filters: { period: MktPeriod; software: MktSoftwareFilter; employeeId: string }) =>
  MKT_COMMENTS.filter(
    record =>
      isInSelectedPeriod(record.time, filters.period) &&
      matchesSoftware(record.software, filters.software) &&
      matchesEmployee(record.employeeId, filters.employeeId)
  )

const getMatchingUidCollections = (filters: { period: MktPeriod; employeeId: string; source?: 'all' | MktUidSource }) =>
  MKT_UID_COLLECTIONS.filter(
    record =>
      isInSelectedPeriod(record.time, filters.period) &&
      matchesEmployee(record.employeeId, filters.employeeId) &&
      (filters.source === undefined || filters.source === 'all' ? true : record.source === filters.source)
  )

const getDailyEmployeeRow = (
  employeeId: string,
  filters: MktDailyTabFilters
): MktDailyEmployeeRow => {
  const matchingAccounts = getMatchingAccounts({ ...filters, employeeId })
  const matchingPosts = getMatchingPosts({ ...filters, employeeId })
  const matchingComments = getMatchingComments({ ...filters, employeeId })
  const matchingUidCollections = getMatchingUidCollections({ period: filters.period, employeeId })

  const live = matchingAccounts.filter(account => account.status === 'live').length
  const die = matchingAccounts.filter(account => account.status === 'die').length
  const messages = matchingAccounts.reduce(
    (sum, account) => sum + getMetricsForPeriod(account, filters.period).reduce((metricSum, metric) => metricSum + metric.messages, 0),
    0
  )
  const likes = matchingAccounts.reduce(
    (sum, account) => sum + getMetricsForPeriod(account, filters.period).reduce((metricSum, metric) => metricSum + metric.likes, 0),
    0
  )
  const posts = matchingPosts.length
  const comments = matchingComments.length
  const uids =
    filters.software === 'mkt-uid'
      ? matchingUidCollections.reduce((sum, record) => sum + record.uidCount, 0)
      : matchingAccounts.reduce(
          (sum, account) => sum + getMetricsForPeriod(account, filters.period).reduce((metricSum, metric) => metricSum + metric.uids, 0),
          0
        )

  const breakdown = machineSoftwareOrder.map(software => {
    const softwareAccounts = getMatchingAccounts({ period: filters.period, software, employeeId })
    const softwarePosts = getMatchingPosts({ period: filters.period, software, employeeId })
    return {
      software,
      softwareLabel: softwareLabelMap[software],
      messages: softwareAccounts.reduce(
        (sum, account) => sum + getMetricsForPeriod(account, filters.period).reduce((metricSum, metric) => metricSum + metric.messages, 0),
        0
      ),
      posts: softwarePosts.length,
    }
  })

  const latestPostRecord =
    matchingPosts
      .slice()
      .sort((a, b) => normalizeDate(b.time).localeCompare(normalizeDate(a.time)))[0] ?? null

  return {
    employeeId,
    live,
    die,
    messages,
    posts,
    likes,
    comments,
    uids,
    breakdown,
    latestPost: latestPostRecord
      ? {
          time: latestPostRecord.time,
          typeLabel: latestPostRecord.typeLabel,
          content: latestPostRecord.content,
          viewLabel: 'Xem',
        }
      : {
          time: 'Không có',
          typeLabel: 'Group',
          content: 'Chưa có bài đăng phù hợp bộ lọc hiện tại',
          viewLabel: 'Xem',
        },
  }
}

const getDailyByDayRow = (dateLabel: string, filters: MktDailyTabFilters): MktDailyByDayRow => {
  const normalizedDate = normalizeDayLabel(dateLabel)
  const matchingAccounts = MKT_FACEBOOK_ACCOUNTS.filter(
    account =>
      matchesEmployee(account.employeeId, filters.employeeId) &&
      matchesSoftware(account.software, filters.software) &&
      getMetricsForDate(account, normalizedDate).length > 0 &&
      isInSelectedPeriod(normalizedDate, filters.period)
  )
  const matchingPosts = MKT_POSTS.filter(
    record =>
      normalizeDate(record.time) === normalizedDate &&
      matchesEmployee(record.employeeId, filters.employeeId) &&
      matchesSoftware(record.software, filters.software) &&
      isInSelectedPeriod(record.time, filters.period)
  )
  const matchingComments = MKT_COMMENTS.filter(
    record =>
      normalizeDate(record.time) === normalizedDate &&
      matchesEmployee(record.employeeId, filters.employeeId) &&
      matchesSoftware(record.software, filters.software) &&
      isInSelectedPeriod(record.time, filters.period)
  )
  const matchingUidCollections = MKT_UID_COLLECTIONS.filter(
    record =>
      normalizeDate(record.time) === normalizedDate &&
      matchesEmployee(record.employeeId, filters.employeeId) &&
      isInSelectedPeriod(record.time, filters.period)
  )

  return {
    dateLabel,
    live: matchingAccounts.filter(account => account.status === 'live').length,
    die: matchingAccounts.filter(account => account.status === 'die').length,
    messages: matchingAccounts.reduce(
      (sum, account) => sum + getMetricsForDate(account, normalizedDate).reduce((metricSum, metric) => metricSum + metric.messages, 0),
      0
    ),
    posts: matchingPosts.length,
    likes: matchingAccounts.reduce(
      (sum, account) => sum + getMetricsForDate(account, normalizedDate).reduce((metricSum, metric) => metricSum + metric.likes, 0),
      0
    ),
    comments: matchingComments.length,
    uids:
      filters.software === 'mkt-uid'
        ? matchingUidCollections.reduce((sum, record) => sum + record.uidCount, 0)
        : matchingAccounts.reduce(
            (sum, account) => sum + getMetricsForDate(account, normalizedDate).reduce((metricSum, metric) => metricSum + metric.uids, 0),
            0
          ),
  }
}

export function useMktReports() {
  const [activeTab, setActiveTab] = useState<MktReportMainTab>('overview')
  const [overviewFilters, setOverviewFilters] = useState<MktBaseTabFilters>({
    period: periodDefault,
    software: 'all',
    employeeId: 'all',
  })
  const [accountFilters, setAccountFilters] = useState<MktAccountTabFilters>({
    period: periodDefault,
    software: 'all',
    employeeId: 'all',
    status: 'all',
    search: '',
  })
  const [fanpageFilters, setFanpageFilters] = useState<MktFanpageTabFilters>({
    period: periodDefault,
    software: 'all',
    employeeId: 'all',
    status: 'all',
  })
  const [uidFilters, setUidFilters] = useState<MktUidTabFilters>({
    period: periodDefault,
    employeeId: 'all',
    source: 'all',
  })
  const [postsCommentsFilters, setPostsCommentsFilters] = useState<MktPostsCommentsTabFilters>({
    period: periodDefault,
    software: 'all',
    employeeId: 'all',
    type: 'all',
  })
  const [dailyFilters, setDailyFilters] = useState<MktDailyTabFilters>({
    period: periodDefault,
    software: 'all',
    employeeId: 'all',
  })
  const [machineFilters, setMachineFilters] = useState<MktMachineTabFilters>({
    period: periodDefault,
    software: 'all',
    employeeId: 'all',
  })

  const [postCommentTab, setPostCommentTab] = useState<MktPostCommentSubTab>('posts')
  const [dailyTab, setDailyTab] = useState<MktDailySubTab>('by-employee')
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<MktFacebookAccount | null>(null)
  const [accountDetailTab, setAccountDetailTab] = useState<MktAccountDetailTab>('overview')
  const [selectedFanpage, setSelectedFanpage] = useState<MktFanpage | null>(null)
  const [fanpageDetailTab, setFanpageDetailTab] = useState<MktFanpageDetailTab>('metrics')
  const [showAddMachineDialog, setShowAddMachineDialog] = useState(false)
  const [connectionCode] = useState('VL-MKT-7X4K9-2026')

  const employees = MKT_EMPLOYEES

  const filteredAccountsBase = MKT_FACEBOOK_ACCOUNTS.filter(account => {
    const keyword = accountFilters.search.trim().toLowerCase()
    const matchesSearch =
      keyword.length === 0
        ? true
        : account.name.toLowerCase().includes(keyword) || account.uid.toLowerCase().includes(keyword)

    return (
      accountHasPeriodActivity(account, accountFilters.period) &&
      matchesSoftware(account.software, accountFilters.software) &&
      matchesEmployee(account.employeeId, accountFilters.employeeId) &&
      matchesSearch
    )
  })

  const filteredAccounts = filteredAccountsBase.filter(account =>
    accountFilters.status === 'all' ? true : account.status === accountFilters.status
  )

  const accountStatusCounts = {
    live: filteredAccountsBase.filter(account => account.status === 'live').length,
    die: filteredAccountsBase.filter(account => account.status === 'die').length,
    checkpoint: filteredAccountsBase.filter(account => account.status === 'checkpoint').length,
    inactive: filteredAccountsBase.filter(account => account.status === 'inactive').length,
  }

  const filteredFanpages = getMatchingFanpages(fanpageFilters).filter(fanpage =>
    fanpageFilters.status === 'all' ? true : fanpage.status === fanpageFilters.status
  )

  const filteredUidCollections = getMatchingUidCollections(uidFilters)

  const filteredPosts = getMatchingPosts(postsCommentsFilters).filter(record =>
    postsCommentsFilters.type === 'all' ? true : record.typeLabel === postsCommentsFilters.type
  )

  const filteredComments = getMatchingComments(postsCommentsFilters).filter(record =>
    postsCommentsFilters.type === 'all' ? true : record.typeLabel === postsCommentsFilters.type
  )

  const filteredDailyByEmployee = MKT_DAILY_BY_EMPLOYEE
    .map(row => getDailyEmployeeRow(row.employeeId, dailyFilters))
    .filter(row => {
      if (dailyFilters.employeeId !== 'all' && row.employeeId !== dailyFilters.employeeId) {
        return false
      }

      return (
        row.live > 0 ||
        row.die > 0 ||
        row.messages > 0 ||
        row.posts > 0 ||
        row.likes > 0 ||
        row.comments > 0 ||
        row.uids > 0
      )
    })

  const filteredDailyBySoftware = machineSoftwareOrder
    .filter(software => (dailyFilters.software === 'all' ? true : software === dailyFilters.software))
    .map(software => {
      const matchingAccounts = getMatchingAccounts({ period: dailyFilters.period, software, employeeId: dailyFilters.employeeId })
      const matchingPosts = getMatchingPosts({ period: dailyFilters.period, software, employeeId: dailyFilters.employeeId })
      const matchingComments = getMatchingComments({ period: dailyFilters.period, software, employeeId: dailyFilters.employeeId })
      const matchingUidCollections = getMatchingUidCollections({ period: dailyFilters.period, employeeId: dailyFilters.employeeId })

      return {
        software,
        softwareLabel: softwareLabelMap[software],
        accounts: matchingAccounts.length,
        messages:
          software === 'mkt-care'
            ? matchingAccounts.reduce(
                (sum, account) =>
                  sum + getMetricsForPeriod(account, dailyFilters.period).reduce((metricSum, metric) => metricSum + metric.messages, 0),
                0
              )
            : software === 'mkt-page'
              ? matchingAccounts.reduce(
                  (sum, account) =>
                    sum + getMetricsForPeriod(account, dailyFilters.period).reduce((metricSum, metric) => metricSum + metric.messages, 0),
                  0
                )
              : null,
        posts: software === 'mkt-post' || software === 'mkt-page' ? matchingPosts.length : null,
        likes:
          software === 'mkt-uid'
            ? null
            : matchingAccounts.reduce(
                (sum, account) =>
                  sum + getMetricsForPeriod(account, dailyFilters.period).reduce((metricSum, metric) => metricSum + metric.likes, 0),
                0
              ),
        comments: software === 'mkt-uid' ? null : matchingComments.length,
        uids: software === 'mkt-uid' ? matchingUidCollections.reduce((sum, record) => sum + record.uidCount, 0) : null,
      }
    })
    .filter(row => row.accounts > 0 || row.messages || row.posts || row.likes || row.comments || row.uids)

  const filteredDailyByDay = MKT_DAILY_BY_DAY
    .filter(row => isInSelectedPeriod(row.dateLabel, dailyFilters.period))
    .map(row => getDailyByDayRow(row.dateLabel, dailyFilters))
    .filter(row => {
      if (dailyFilters.employeeId === 'all' && dailyFilters.software === 'all') {
        return true
      }

      return (
        row.live > 0 ||
        row.die > 0 ||
        row.messages > 0 ||
        row.posts > 0 ||
        row.likes > 0 ||
        row.comments > 0 ||
        row.uids > 0
      )
    })

  const filteredMachines = MKT_MACHINES.filter(
    machine =>
      isInSelectedPeriod(machine.lastSync, machineFilters.period) &&
      (machineFilters.software === 'all' ? true : machine.installedSoftware.includes(machineFilters.software)) &&
      matchesEmployee(machine.employeeId, machineFilters.employeeId)
  )

  const overviewAccounts = getMatchingAccounts(overviewFilters)
  const overviewFanpages = getMatchingFanpages(overviewFilters)
  const overviewPosts = getMatchingPosts(overviewFilters)
  const overviewComments = getMatchingComments(overviewFilters)
  const overviewUidCollections =
    overviewFilters.software === 'all' || overviewFilters.software === 'mkt-uid'
      ? getMatchingUidCollections({ period: overviewFilters.period, employeeId: overviewFilters.employeeId })
      : []
  const overviewMessages = overviewAccounts.reduce(
    (sum, account) =>
      sum + getMetricsForPeriod(account, overviewFilters.period).reduce((metricSum, metric) => metricSum + metric.messages, 0),
    0
  )
  const overviewLikes =
    overviewFilters.software === 'mkt-uid'
      ? 0
      : overviewAccounts.reduce(
          (sum, account) =>
            sum + getMetricsForPeriod(account, overviewFilters.period).reduce((metricSum, metric) => metricSum + metric.likes, 0),
          0
        )
  const totalUidCount = filteredUidCollections.reduce((sum, record) => sum + record.uidCount, 0)
  const totalScans = filteredUidCollections.length
  const fanpageFollowerNetChange = filteredFanpages.reduce((sum, fanpage) => sum + fanpage.newFollower + fanpage.unfollow, 0)

  const overviewTrend = MKT_DAILY_BY_DAY
    .filter(row => isInSelectedPeriod(row.dateLabel, overviewFilters.period))
    .map(row => getDailyByDayRow(row.dateLabel, overviewFilters))
    .slice()
    .reverse()
    .map(item => ({
      date: item.dateLabel,
      live: item.live,
      die: item.die,
      messages: item.messages,
      posts: item.posts,
    }))

  const uidSourceSummary = [
    {
      label: 'Bạn bè',
      value: filteredUidCollections.filter(item => item.source === 'friends').reduce((sum, item) => sum + item.uidCount, 0),
    },
    {
      label: 'Group',
      value: filteredUidCollections.filter(item => item.source === 'group').reduce((sum, item) => sum + item.uidCount, 0),
    },
    {
      label: 'Page',
      value: filteredUidCollections.filter(item => item.source === 'page').reduce((sum, item) => sum + item.uidCount, 0),
    },
    {
      label: 'Khác',
      value: filteredUidCollections.filter(item => item.source === 'other').reduce((sum, item) => sum + item.uidCount, 0),
    },
  ]

  const uidTableFooterSummary = {
    totalScans,
    totalUidCount,
  }

  const exportAccounts = () => {
    createCsv(
      'mkt-facebook-accounts.csv',
      filteredAccounts.map(account => ({
        'Tên tài khoản': account.name,
        UID: account.uid,
        'Trạng thái': getAccountStatusLabel(account.status),
        'Phần mềm': softwareLabelMap[account.software],
        'Nhân viên': getEmployeeName(account.employeeId),
        'Hành động cuối': account.lastAction,
        'Thời gian': account.lastActiveLabel,
      }))
    )
  }

  const exportFanpages = () => {
    createCsv(
      'mkt-fanpages.csv',
      filteredFanpages.map(fanpage => ({
        'Tên Page': fanpage.name,
        'Page ID': fanpage.pageId,
        'Trạng thái': fanpage.status,
        Follower: fanpage.follower,
        Mới: fanpage.newFollower,
        Unfollow: fanpage.unfollow,
        'Bài đăng': fanpage.posts,
        Reaction: fanpage.reactions,
        'Bình luận': fanpage.comments,
        'Nhân viên': getEmployeeName(fanpage.employeeId),
        'Hoạt động cuối': fanpage.lastActivity,
      }))
    )
  }

  const exportUids = () => {
    createCsv(
      'mkt-collected-uids.csv',
      filteredUidCollections.map(record => ({
        'Loại quét': record.scanTypeLabel,
        'Đối tượng quét': record.targetName,
        'Số UID': record.uidCount,
        'Tài khoản quét': record.scannerAccount,
        'UID tài khoản': record.scannerUid,
        'Nhân viên': getEmployeeName(record.employeeId),
        'Thời gian': record.time,
      }))
    )
  }

  const exportUidRecord = (record: MktUidCollectionRecord) => {
    createCsv(
      `uids-${record.id}.csv`,
      Array.from({ length: record.uidCount }).map((_, index) => ({
        'Đối tượng quét': record.targetName,
        'UID mock': `${record.scannerUid}-${index + 1}`,
        'Nguồn': record.scanTypeLabel,
      }))
    )
  }

  const exportPostsComments = () => {
    if (postCommentTab === 'posts') {
      createCsv(
        'mkt-posts.csv',
        filteredPosts.map(record => ({
          'Thời gian': record.time,
          'Tên tài khoản': record.accountName,
          UID: record.uid,
          'Nhân viên': getEmployeeName(record.employeeId),
          Loại: record.typeLabel,
          'Phần mềm': record.softwareLabel,
          'Nội dung': record.content,
          'UID nơi đăng': record.targetUid,
          'UID bài đăng': record.postUid,
        }))
      )
      return
    }

    createCsv(
      'mkt-comments.csv',
      filteredComments.map(record => ({
        'Thời gian': record.time,
        'Tên tài khoản': record.accountName,
        UID: record.uid,
        'Nhân viên': getEmployeeName(record.employeeId),
        'Phần mềm': record.softwareLabel,
        'Nội dung bình luận': record.content,
        Loại: record.typeLabel,
        'UID nơi bình luận': record.targetUid,
      }))
    )
  }

  const exportDaily = () => {
    if (dailyTab === 'by-employee') {
      createCsv(
        'mkt-daily-by-employee.csv',
        filteredDailyByEmployee.map(row => ({
          'Nhân viên': getEmployeeName(row.employeeId),
          Live: row.live,
          Die: row.die,
          'Tin nhắn': row.messages,
          'Bài đăng': row.posts,
          Like: row.likes,
          'Bình luận': row.comments,
          UID: row.uids,
        }))
      )
      return
    }

    if (dailyTab === 'by-software') {
      createCsv(
        'mkt-daily-by-software.csv',
        filteredDailyBySoftware.map(row => ({
          'Phần mềm': row.softwareLabel,
          'Tài khoản': row.accounts,
          'Tin nhắn': row.messages ?? '-',
          'Bài đăng': row.posts ?? '-',
          Like: row.likes ?? '-',
          'Bình luận': row.comments ?? '-',
          UID: row.uids ?? '-',
        }))
      )
      return
    }

    createCsv(
      'mkt-daily-by-day.csv',
      filteredDailyByDay.map(row => ({
        Ngày: row.dateLabel,
        Live: row.live,
        Die: row.die,
        'Tin nhắn': row.messages,
        'Bài đăng': row.posts,
        Like: row.likes,
        'Bình luận': row.comments,
        UID: row.uids,
      }))
    )
  }

  const toggleEmployeeExpand = (employeeId: string) => {
    setExpandedEmployeeId(current => (current === employeeId ? null : employeeId))
  }

  const openAccountDetail = (account: MktFacebookAccount) => {
    setSelectedAccount(account)
    setAccountDetailTab('overview')
  }

  const openFanpageDetail = (fanpage: MktFanpage) => {
    setSelectedFanpage(fanpage)
    setFanpageDetailTab('metrics')
  }

  const closeAccountDetail = () => setSelectedAccount(null)
  const closeFanpageDetail = () => setSelectedFanpage(null)

  const copyConnectionCode = async () => {
    if (typeof navigator === 'undefined') {
      return false
    }

    await navigator.clipboard.writeText(connectionCode)
    return true
  }

  const removeMachine = (machineId: string) => machineId

  return {
    activeTab,
    setActiveTab,
    employees,
    softwareLabelMap,
    getEmployeeName,
    getAccountStatusLabel,

    overviewFilters,
    setOverviewFilters,
    accountFilters,
    setAccountFilters,
    fanpageFilters,
    setFanpageFilters,
    uidFilters,
    setUidFilters,
    postsCommentsFilters,
    setPostsCommentsFilters,
    dailyFilters,
    setDailyFilters,
    machineFilters,
    setMachineFilters,

    filteredAccounts,
    accountStatusCounts,
    exportAccounts,

    filteredFanpages,
    exportFanpages,

    filteredUidCollections,
    uidSourceSummary,
    uidTableFooterSummary,
    totalUidCount,
    totalScans,
    exportUids,
    exportUidRecord,

    postCommentTab,
    setPostCommentTab,
    filteredPosts,
    filteredComments,
    exportPostsComments,

    dailyTab,
    setDailyTab,
    filteredDailyByEmployee,
    filteredDailyBySoftware,
    filteredDailyByDay,
    expandedEmployeeId,
    toggleEmployeeExpand,
    exportDaily,

    filteredMachines,
    showAddMachineDialog,
    setShowAddMachineDialog,
    connectionCode,
    copyConnectionCode,
    removeMachine,

    selectedAccount,
    openAccountDetail,
    closeAccountDetail,
    accountDetailTab,
    setAccountDetailTab,
    selectedFanpage,
    openFanpageDetail,
    closeFanpageDetail,
    fanpageDetailTab,
    setFanpageDetailTab,

    overviewStats: {
      liveCount: overviewAccounts.filter(account => account.status === 'live').length,
      dieCount: overviewAccounts.filter(account => account.status === 'die').length,
      checkpointCount: overviewAccounts.filter(account => account.status === 'checkpoint').length,
      messageCount: overviewMessages,
      postCount: overviewPosts.length,
      likeCount: overviewLikes,
      commentCount: overviewComments.length,
      activeFanpageCount: overviewFanpages.filter(page => page.status === 'active').length,
      totalFollower: overviewFanpages.reduce((sum, page) => sum + page.follower, 0),
      fanpagePostCount: overviewFanpages.reduce((sum, page) => sum + page.posts, 0),
      inboundReactionCount: overviewFanpages.reduce((sum, page) => sum + page.reactions, 0),
      inboundCommentCount: overviewFanpages.reduce((sum, page) => sum + page.comments, 0),
      totalUidCount:
        overviewFilters.software === 'all' || overviewFilters.software === 'mkt-uid'
          ? overviewUidCollections.reduce((sum, record) => sum + record.uidCount, 0)
          : 0,
    },
    overviewTrend,
    fanpageFollowerNetChange,
  }
}

export type MktReportsController = ReturnType<typeof useMktReports>
