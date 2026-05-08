'use client'

import { Fragment } from 'react'
import { ChevronDown, ChevronRight, Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { MktReportsController } from './useMktReports'
import { CompactStatCard, SubTabButton, StatusBadge } from './shared'

export default function DailyReportsTab({ controller }: { controller: MktReportsController }) {
  const {
    dailyTab,
    setDailyTab,
    filteredDailyByEmployee,
    filteredDailyBySoftware,
    filteredDailyByDay,
    expandedEmployeeId,
    toggleEmployeeExpand,
    exportDaily,
    getEmployeeName,
  } = controller

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <SubTabButton active={dailyTab === 'by-employee'} label="Theo Nhân viên" onClick={() => setDailyTab('by-employee')} />
          <SubTabButton active={dailyTab === 'by-software'} label="Theo Phần mềm" onClick={() => setDailyTab('by-software')} />
          <SubTabButton active={dailyTab === 'by-day'} label="Theo Ngày" onClick={() => setDailyTab('by-day')} />
        </div>

        <Button variant="outline" onClick={exportDaily}>
          <Download className="h-4 w-4" />
          Xuất Excel
        </Button>
      </div>

      {dailyTab === 'by-employee' ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Live</TableHead>
              <TableHead>Die</TableHead>
              <TableHead>Tin nhắn</TableHead>
              <TableHead>Bài đăng</TableHead>
              <TableHead>Like</TableHead>
              <TableHead>Bình luận</TableHead>
              <TableHead>UID</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDailyByEmployee.map((row, index) => {
              const isExpanded = expandedEmployeeId === row.employeeId
              return (
                <Fragment key={row.employeeId}>
                  <TableRow>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium text-[#1a3353]">{getEmployeeName(row.employeeId)}</TableCell>
                    <TableCell className="text-[#2dc56a]">{row.live}</TableCell>
                    <TableCell className="text-[#ff6b72]">{row.die}</TableCell>
                    <TableCell>{row.messages}</TableCell>
                    <TableCell>{row.posts}</TableCell>
                    <TableCell>{row.likes}</TableCell>
                    <TableCell>{row.comments}</TableCell>
                    <TableCell>{row.uids}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleEmployeeExpand(row.employeeId)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] text-[#72849a] transition-colors hover:bg-[#f0f7ff] hover:text-[#3e79f7]"
                      >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    </TableCell>
                  </TableRow>

                  {isExpanded ? (
                    <tr className="border-b border-[#e6ebf1] bg-[#eef5ff]">
                      <td colSpan={10} className="px-4 py-4">
                        <div className="space-y-4">
                          <div className="text-xs font-bold uppercase tracking-wide text-[#72849a]">
                            Breakdown - {getEmployeeName(row.employeeId)}
                          </div>
                          <div className="grid gap-3 lg:grid-cols-4">
                            {row.breakdown.map(item => (
                              <CompactStatCard
                                key={item.software}
                                title={item.softwareLabel}
                                lines={[`Tin nhắn: ${item.messages}`, `Bài đăng: ${item.posts}`]}
                              />
                            ))}
                          </div>

                          <div className="space-y-2">
                            <div className="text-xs font-bold uppercase tracking-wide text-[#72849a]">Bài đã đăng</div>
                            <div className="flex flex-col gap-3 rounded-[10px] border border-white bg-white/90 p-3 text-sm text-[#455560] lg:flex-row lg:items-center lg:justify-between">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[#98a5b3]">{row.latestPost.time}</span>
                                <StatusBadge kind="uid-source" value={row.latestPost.typeLabel === 'Page' ? 'page' : 'group'} />
                                <span className="max-w-[720px] truncate">{row.latestPost.content}</span>
                              </div>
                              <button className="inline-flex items-center gap-1 text-sm font-medium text-[#3e79f7] hover:text-[#2a59d1]">
                                {row.latestPost.viewLabel}
                                <ExternalLink className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      ) : null}

      {dailyTab === 'by-software' ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Phần mềm</TableHead>
              <TableHead>Tài khoản</TableHead>
              <TableHead>Tin nhắn</TableHead>
              <TableHead>Bài đăng</TableHead>
              <TableHead>Like</TableHead>
              <TableHead>Bình luận</TableHead>
              <TableHead>UID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDailyBySoftware.map((row, index) => (
              <TableRow key={row.software}>
                <TableCell>{index + 1}</TableCell>
                <TableCell><StatusBadge kind="software" value={row.software} /></TableCell>
                <TableCell>{row.accounts}</TableCell>
                <TableCell>{row.messages ?? '—'}</TableCell>
                <TableCell>{row.posts ?? '—'}</TableCell>
                <TableCell>{row.likes ?? '—'}</TableCell>
                <TableCell>{row.comments ?? '—'}</TableCell>
                <TableCell>{row.uids ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}

      {dailyTab === 'by-day' ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Ngày</TableHead>
              <TableHead>Live</TableHead>
              <TableHead>Die</TableHead>
              <TableHead>Tin nhắn</TableHead>
              <TableHead>Bài đăng</TableHead>
              <TableHead>Like</TableHead>
              <TableHead>Bình luận</TableHead>
              <TableHead>UID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDailyByDay.map((row, index) => (
              <TableRow key={row.dateLabel}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium text-[#1a3353]">{row.dateLabel}</TableCell>
                <TableCell className="text-[#2dc56a]">{row.live}</TableCell>
                <TableCell className="text-[#ff6b72]">{row.die}</TableCell>
                <TableCell>{row.messages}</TableCell>
                <TableCell>{row.posts}</TableCell>
                <TableCell>{row.likes}</TableCell>
                <TableCell>{row.comments}</TableCell>
                <TableCell>{row.uids}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </div>
  )
}
