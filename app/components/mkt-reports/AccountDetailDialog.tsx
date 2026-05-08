'use client'

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { MktReportsController } from './useMktReports'
import { InfoCard, StatusBadge, SubTabButton } from './shared'

export default function AccountDetailDialog({ controller }: { controller: MktReportsController }) {
  const {
    selectedAccount,
    closeAccountDetail,
    accountDetailTab,
    setAccountDetailTab,
    getEmployeeName,
  } = controller

  if (!selectedAccount) {
    return null
  }

  return (
    <Dialog open={!!selectedAccount} onOpenChange={open => (!open ? closeAccountDetail() : null)}>
      <DialogContent className="max-w-5xl overflow-hidden p-0">
        <div className="border-b border-[#e6ebf1] px-6 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f7ff] text-lg font-semibold text-[#3e79f7]">
              f
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-[28px] font-semibold text-[#1a3353]">{selectedAccount.name}</h2>
                <span className="text-[#98a5b3]">{selectedAccount.uid}</span>
                <StatusBadge kind="facebook" value={selectedAccount.status} />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <SubTabButton active={accountDetailTab === 'overview'} label="Tổng quan" onClick={() => setAccountDetailTab('overview')} />
            <SubTabButton active={accountDetailTab === 'history'} label="Lịch sử hoạt động" onClick={() => setAccountDetailTab('history')} />
            <SubTabButton active={accountDetailTab === 'posts-comments'} label="Bài đăng & Bình luận" onClick={() => setAccountDetailTab('posts-comments')} />
            <SubTabButton active={accountDetailTab === 'status-history'} label="Lịch sử trạng thái" onClick={() => setAccountDetailTab('status-history')} />
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          {accountDetailTab === 'overview' ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InfoCard title="Trạng thái" value={<StatusBadge kind="facebook" value={selectedAccount.status} />} />
              <InfoCard title="Nhân viên giữ" value={getEmployeeName(selectedAccount.employeeId)} />
              <InfoCard title="Phần mềm" value={<StatusBadge kind="software" value={selectedAccount.software} />} />
              <InfoCard title="Hành động cuối" value={selectedAccount.lastAction} />
            </div>
          ) : null}

          {accountDetailTab === 'history' ? (
            <div className="space-y-6">
              <div className="h-[260px] rounded-[10px] border border-[#eef2f6] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={selectedAccount.metrics}>
                    <CartesianGrid stroke="#eef2f6" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#72849a', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#72849a', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="likes" fill="#3e79f7" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="posts" fill="#a461d8" radius={[4, 4, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-hidden rounded-[10px] border border-[#e6ebf1]">
                <table className="w-full text-sm">
                  <thead className="bg-[#fafafb]">
                    <tr>
                      {['STT', 'Ngày', 'Tin nhắn', 'Bài đăng', 'Like', 'Bình luận', 'UID'].map(header => (
                        <th key={header} className="px-4 py-3 text-left text-[13px] font-black uppercase tracking-wide text-[#455560]">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAccount.metrics.slice().reverse().map((item, index) => (
                      <tr key={`${item.date}-${index}`} className="border-t border-[#e6ebf1]">
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3">{item.date}</td>
                        <td className="px-4 py-3">{item.messages}</td>
                        <td className="px-4 py-3">{item.posts}</td>
                        <td className="px-4 py-3">{item.likes}</td>
                        <td className="px-4 py-3">{item.comments}</td>
                        <td className="px-4 py-3">{item.uids}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {accountDetailTab === 'posts-comments' ? (
            <div className="overflow-hidden rounded-[10px] border border-[#e6ebf1]">
              <table className="w-full text-sm">
                <thead className="bg-[#fafafb]">
                  <tr>
                    {['STT', 'Thời gian', 'Loại', 'Nội dung', 'UID nơi đăng', 'UID bài đăng'].map(header => (
                      <th key={header} className="px-4 py-3 text-left text-[13px] font-black uppercase tracking-wide text-[#455560]">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedAccount.postHistory.map((item, index) => (
                    <tr key={item.id} className="border-t border-[#e6ebf1]">
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3">{item.time}</td>
                      <td className="px-4 py-3">{item.typeLabel}</td>
                      <td className="px-4 py-3">{item.content}</td>
                      <td className="px-4 py-3">{item.targetUid}</td>
                      <td className="px-4 py-3">{item.postUid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {accountDetailTab === 'status-history' ? (
            <div className="space-y-4">
              {selectedAccount.statusHistory.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="mt-1 h-3 w-3 rounded-full bg-[#2dc56a]" />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge kind="facebook" value={item.status} />
                      <span className="text-[#455560]">{item.recordedAt}</span>
                    </div>
                    <div className="text-sm text-[#455560]">Người vận hành: {item.operator}</div>
                    {item.note ? <div className="text-sm text-[#72849a]">{item.note}</div> : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
