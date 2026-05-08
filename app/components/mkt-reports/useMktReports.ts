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
  MktDailySubTab,
  MktFacebookAccount,
  MktFanpage,
  MktFanpageDetailTab,
  MktPeriod,
  MktPostCommentSubTab,
  MktReportMainTab,
  MktSoftwareFilter,
  MktUidCollectionRecord,
  MktUidSource,
} from './types'

const softwareLabelMap: Record<string, string> = {
  all: 'Tất cả phần mềm',
  'mkt-care': 'MKT Care',
  'mkt-post': 'MKT Post',
  'mkt-page': 'MKT Page',
  'mkt-uid': 'MKT UID',
}

const employeeNameMap = Object.fromEntries(MKT_EMPLOYEES.map(employee => [employee.id, employee.name]))

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

const matchesGlobalSoftware = (software: string, selectedSoftware: MktSoftwareFilter) =>
  selectedSoftware === 'all' ? true : software === selectedSoftware

const matchesGlobalEmployee = (employeeId: string, selectedEmployee: string) =>
  selectedEmployee === 'all' ? true : employeeId === selectedEmployee

const getEmployeeName = (employeeId: string) => employeeNameMap[employeeId] ?? employeeId

const getAccountStatusLabel = (status: MktFacebookAccount['status']) => {
  if (status === 'live') return 'Live'
  if (status === 'die') return 'Die'
  if (status === 'inactive') return 'Không hoạt động'
  return 'Checkpoint'
}

export function useMktReports() {
  const [activeTab, setActiveTab] = useState<MktReportMainTab>('overview')
  const [period, setPeriod] = useState<MktPeriod>('today')
  const [globalSoftware, setGlobalSoftware] = useState<MktSoftwareFilter>('all')
  const [globalEmployee, setGlobalEmployee] = useState<string>('all')

  const [accountSearch, setAccountSearch] = useState('')
  const [accountStatusFilter, setAccountStatusFilter] = useState<'all' | 'live' | 'die' | 'inactive'>('all')
  const [accountSoftwareFilter, setAccountSoftwareFilter] = useState<'all' | 'mkt-care' | 'mkt-post'>('all')

  const [fanpageStatusFilter, setFanpageStatusFilter] = useState<'all' | 'active' | 'restricted' | 'deleted'>('all')
  const [fanpageEmployeeFilter, setFanpageEmployeeFilter] = useState<string>('all')

  const [uidSourceFilter, setUidSourceFilter] = useState<'all' | MktUidSource>('all')

  const [postCommentTab, setPostCommentTab] = useState<MktPostCommentSubTab>('posts')
  const [postCommentEmployeeFilter, setPostCommentEmployeeFilter] = useState<string>('all')
  const [postCommentSoftwareFilter, setPostCommentSoftwareFilter] = useState<'all' | 'mkt-post' | 'mkt-page' | 'mkt-care'>('all')
  const [postCommentTypeFilter, setPostCommentTypeFilter] = useState('all')

  const [dailyTab, setDailyTab] = useState<MktDailySubTab>('by-employee')
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null)

  const [selectedAccount, setSelectedAccount] = useState<MktFacebookAccount | null>(null)
  const [accountDetailTab, setAccountDetailTab] = useState<MktAccountDetailTab>('overview')
  const [selectedFanpage, setSelectedFanpage] = useState<MktFanpage | null>(null)
  const [fanpageDetailTab, setFanpageDetailTab] = useState<MktFanpageDetailTab>('metrics')
  const [showAddMachineDialog, setShowAddMachineDialog] = useState(false)
  const [connectionCode] = useState('VL-MKT-7X4K9-2026')

  const employees = MKT_EMPLOYEES

  const filteredAccounts = MKT_FACEBOOK_ACCOUNTS.filter(account => {
    const matchesGlobal =
      matchesGlobalSoftware(account.software, globalSoftware) &&
      matchesGlobalEmployee(account.employeeId, globalEmployee)

    const matchesStatus = accountStatusFilter === 'all' ? true : account.status === accountStatusFilter
    const matchesSoftware = accountSoftwareFilter === 'all' ? true : account.software === accountSoftwareFilter
    const keyword = accountSearch.trim().toLowerCase()
    const matchesSearch =
      keyword.length === 0
        ? true
        : account.name.toLowerCase().includes(keyword) || account.uid.toLowerCase().includes(keyword)

    return matchesGlobal && matchesStatus && matchesSoftware && matchesSearch
  })

  const accountBaseForCounts = MKT_FACEBOOK_ACCOUNTS.filter(account => {
    const matchesGlobal =
      matchesGlobalSoftware(account.software, globalSoftware) &&
      matchesGlobalEmployee(account.employeeId, globalEmployee)
    const matchesSoftware = accountSoftwareFilter === 'all' ? true : account.software === accountSoftwareFilter
    const keyword = accountSearch.trim().toLowerCase()
    const matchesSearch =
      keyword.length === 0
        ? true
        : account.name.toLowerCase().includes(keyword) || account.uid.toLowerCase().includes(keyword)

    return matchesGlobal && matchesSoftware && matchesSearch
  })

  const filteredFanpages = MKT_FANPAGES.filter(fanpage => {
    const matchesGlobal =
      matchesGlobalSoftware('mkt-page', globalSoftware) &&
      matchesGlobalEmployee(fanpage.employeeId, globalEmployee)
    const matchesStatus = fanpageStatusFilter === 'all' ? true : fanpage.status === fanpageStatusFilter
    const matchesEmployee = fanpageEmployeeFilter === 'all' ? true : fanpage.employeeId === fanpageEmployeeFilter

    return matchesGlobal && matchesStatus && matchesEmployee
  })

  const filteredUidCollections = MKT_UID_COLLECTIONS.filter(record => {
    const matchesGlobal =
      matchesGlobalSoftware('mkt-uid', globalSoftware) &&
      matchesGlobalEmployee(record.employeeId, globalEmployee)
    const matchesSource = uidSourceFilter === 'all' ? true : record.source === uidSourceFilter
    return matchesGlobal && matchesSource && isInSelectedPeriod(record.time, period)
  })

  const filteredPosts = MKT_POSTS.filter(record => {
    const matchesGlobal =
      matchesGlobalSoftware(record.software, globalSoftware) &&
      matchesGlobalEmployee(record.employeeId, globalEmployee)
    const matchesEmployee = postCommentEmployeeFilter === 'all' ? true : record.employeeId === postCommentEmployeeFilter
    const matchesSoftware = postCommentSoftwareFilter === 'all' ? true : record.software === postCommentSoftwareFilter
    const matchesType = postCommentTypeFilter === 'all' ? true : record.typeLabel === postCommentTypeFilter
    return matchesGlobal && matchesEmployee && matchesSoftware && matchesType && isInSelectedPeriod(record.time, period)
  })

  const filteredComments = MKT_COMMENTS.filter(record => {
    const matchesGlobal =
      matchesGlobalSoftware(record.software, globalSoftware) &&
      matchesGlobalEmployee(record.employeeId, globalEmployee)
    const matchesEmployee = postCommentEmployeeFilter === 'all' ? true : record.employeeId === postCommentEmployeeFilter
    const matchesSoftware = postCommentSoftwareFilter === 'all' ? true : record.software === postCommentSoftwareFilter
    const matchesType = postCommentTypeFilter === 'all' ? true : record.typeLabel === postCommentTypeFilter
    return matchesGlobal && matchesEmployee && matchesSoftware && matchesType && isInSelectedPeriod(record.time, period)
  })

  const filteredDailyByEmployee = MKT_DAILY_BY_EMPLOYEE.filter(row => {
    const matchesEmployee = matchesGlobalEmployee(row.employeeId, globalEmployee)
    return matchesEmployee
  })

  const filteredDailyBySoftware = MKT_DAILY_BY_SOFTWARE.filter(row =>
    globalSoftware === 'all' ? true : row.software === globalSoftware
  )

  const filteredDailyByDay = MKT_DAILY_BY_DAY

  const filteredMachines = MKT_MACHINES.filter(machine => {
    const matchesSoftware =
      globalSoftware === 'all' ? true : machine.installedSoftware.includes(globalSoftware)
    const matchesEmployee = matchesGlobalEmployee(machine.employeeId, globalEmployee)
    return matchesSoftware && matchesEmployee
  })

  const overviewAccounts = MKT_FACEBOOK_ACCOUNTS.filter(account => {
    return (
      matchesGlobalSoftware(account.software, globalSoftware) &&
      matchesGlobalEmployee(account.employeeId, globalEmployee)
    )
  })

  const overviewFanpages = MKT_FANPAGES.filter(fanpage => matchesGlobalEmployee(fanpage.employeeId, globalEmployee))

  const totalUidCount = filteredUidCollections.reduce((sum, record) => sum + record.uidCount, 0)
  const totalScans = filteredUidCollections.length
  const fanpageFollowerNetChange = filteredFanpages.reduce((sum, fanpage) => sum + fanpage.newFollower + fanpage.unfollow, 0)
  const liveCount = overviewAccounts.filter(account => account.status === 'live').length
  const dieCount = overviewAccounts.filter(account => account.status === 'die').length
  const checkpointCount = overviewAccounts.filter(account => account.status === 'checkpoint').length
  const messageCount = filteredDailyByEmployee.reduce((sum, row) => sum + row.messages, 0)
  const postCount = filteredDailyByEmployee.reduce((sum, row) => sum + row.posts, 0)
  const likeCount = filteredDailyByEmployee.reduce((sum, row) => sum + row.likes, 0)
  const commentCount = filteredDailyByEmployee.reduce((sum, row) => sum + row.comments, 0)
  const activeFanpageCount = overviewFanpages.filter(page => page.status === 'active').length
  const totalFollower = overviewFanpages.reduce((sum, page) => sum + page.follower, 0)
  const fanpagePostCount = overviewFanpages.reduce((sum, page) => sum + page.posts, 0)
  const inboundReactionCount = overviewFanpages.reduce((sum, page) => sum + page.reactions, 0)
  const inboundCommentCount = overviewFanpages.reduce((sum, page) => sum + page.comments, 0)

  const overviewTrend = filteredDailyByDay
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

  const accountStatusCounts = {
    live: accountBaseForCounts.filter(account => account.status === 'live').length,
    die: accountBaseForCounts.filter(account => account.status === 'die').length,
    checkpoint: accountBaseForCounts.filter(account => account.status === 'checkpoint').length,
    inactive: accountBaseForCounts.filter(account => account.status === 'inactive').length,
  }

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
    period,
    setPeriod,
    globalSoftware,
    setGlobalSoftware,
    globalEmployee,
    setGlobalEmployee,
    employees,
    softwareLabelMap,
    getEmployeeName,
    getAccountStatusLabel,

    accountSearch,
    setAccountSearch,
    accountStatusFilter,
    setAccountStatusFilter,
    accountSoftwareFilter,
    setAccountSoftwareFilter,
    filteredAccounts,
    accountStatusCounts,
    exportAccounts,

    fanpageStatusFilter,
    setFanpageStatusFilter,
    fanpageEmployeeFilter,
    setFanpageEmployeeFilter,
    filteredFanpages,
    exportFanpages,

    uidSourceFilter,
    setUidSourceFilter,
    filteredUidCollections,
    uidSourceSummary,
    uidTableFooterSummary,
    totalUidCount,
    totalScans,
    exportUids,
    exportUidRecord,

    postCommentTab,
    setPostCommentTab,
    postCommentEmployeeFilter,
    setPostCommentEmployeeFilter,
    postCommentSoftwareFilter,
    setPostCommentSoftwareFilter,
    postCommentTypeFilter,
    setPostCommentTypeFilter,
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
      liveCount,
      dieCount,
      checkpointCount,
      messageCount,
      postCount,
      likeCount,
      commentCount,
      activeFanpageCount,
      totalFollower,
      fanpagePostCount,
      inboundReactionCount,
      inboundCommentCount,
      totalUidCount,
    },
    overviewTrend,
    fanpageFollowerNetChange,
  }
}

export type MktReportsController = ReturnType<typeof useMktReports>
