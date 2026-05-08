'use client'

import { Bar, BarChart, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { MktReportsController } from './useMktReports'
import { MetricCard, StatusBadge, SubTabButton } from './shared'

export default function FanpageDetailDialog({ controller }: { controller: MktReportsController }) {
  const {
    selectedFanpage,
    closeFanpageDetail,
    fanpageDetailTab,
    setFanpageDetailTab,
  } = controller

  if (!selectedFanpage) {
    return null
  }

  const contentData = [
    { label: 'Text', value: selectedFanpage.contentTypes.text, fill: '#3e79f7' },
    { label: 'Ảnh', value: selectedFanpage.contentTypes.image, fill: '#2dc56a' },
    { label: 'Video', value: selectedFanpage.contentTypes.video, fill: '#a461d8' },
    { label: 'Reels', value: selectedFanpage.contentTypes.reels, fill: '#f97316' },
  ]

  return (
    <Dialog open={!!selectedFanpage} onOpenChange={open => (!open ? closeFanpageDetail() : null)}>
      <DialogContent className="max-w-5xl overflow-hidden p-0">
        <div className="border-b border-[#e6ebf1] px-6 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff4e5] text-lg font-semibold text-[#f59e0b]">
              P
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-[28px] font-semibold text-[#1a3353]">{selectedFanpage.name}</h2>
              <StatusBadge kind="fanpage" value={selectedFanpage.status} />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <SubTabButton active={fanpageDetailTab === 'metrics'} label="Chỉ số" onClick={() => setFanpageDetailTab('metrics')} />
            <SubTabButton active={fanpageDetailTab === 'content-types'} label="Loại nội dung" onClick={() => setFanpageDetailTab('content-types')} />
            <SubTabButton active={fanpageDetailTab === 'follower-trend'} label="Xu hướng follower" onClick={() => setFanpageDetailTab('follower-trend')} />
            <SubTabButton active={fanpageDetailTab === 'posts'} label="Bài đã đăng" onClick={() => setFanpageDetailTab('posts')} />
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          {fanpageDetailTab === 'metrics' ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wide text-[#98a5b3]">Follower</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <MetricCard title="Tổng hiện tại" value={selectedFanpage.follower.toLocaleString('vi-VN')} />
                  <MetricCard title="Mới hôm nay" value={`+${selectedFanpage.newFollower}`} tone="success" />
                  <MetricCard title="Unfollow hôm nay" value={selectedFanpage.unfollow} tone="danger" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wide text-[#98a5b3]">Tương tác nhận về (Inbound)</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <MetricCard title="Like / Reaction" value={selectedFanpage.reactions} />
                  <MetricCard title="Bình luận nhận" value={selectedFanpage.comments} />
                  <MetricCard title="Lượt chia sẻ" value={selectedFanpage.shares} />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wide text-[#98a5b3]">Tương tác thực hiện (Outbound)</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <MetricCard title="Like từ Page" value={selectedFanpage.outboundLikes} />
                  <MetricCard title="Bình luận từ Page" value={selectedFanpage.outboundComments} />
                </div>
              </div>
            </div>
          ) : null}

          {fanpageDetailTab === 'content-types' ? (
            <div className="space-y-4">
              <div className="text-base font-medium text-[#1a3353]">Loại nội dung bài đã đăng hôm nay</div>
              <div className="grid gap-4 md:grid-cols-4">
                {contentData.map(item => (
                  <div key={item.label} className="rounded-[10px] border border-[#eef2f6] p-4 text-center">
                    <div className="mx-auto mb-3 h-8 w-8 rounded-[10px]" style={{ backgroundColor: item.fill }} />
                    <div className="text-3xl font-bold text-[#1a3353]">{item.value}</div>
                    <div className="mt-1 text-sm text-[#72849a]">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {fanpageDetailTab === 'follower-trend' ? (
            <div className="space-y-4">
              <div className="text-base font-medium text-[#1a3353]">Biến động follower 14 ngày gần nhất</div>
              <div className="h-[280px] rounded-[10px] border border-[#eef2f6] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={selectedFanpage.trend}>
                    <CartesianGrid stroke="#eef2f6" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#72849a', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis
                      yAxisId="left"
                      tick={{ fill: '#72849a', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      domain={['dataMin - 5000', 'dataMax + 5000']}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: '#72849a', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Bar
                      yAxisId="right"
                      dataKey="newFollower"
                      fill="#22c55e"
                      radius={[4, 4, 0, 0]}
                      barSize={14}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="unfollow"
                      fill="#ff6b72"
                      radius={[4, 4, 0, 0]}
                      barSize={10}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="totalFollower"
                      stroke="#3e79f7"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#3e79f7', strokeWidth: 0 }}
                      activeDot={{ r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : null}

          {fanpageDetailTab === 'posts' ? (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[10px] border border-[#e6ebf1]">
                <table className="w-full text-sm">
                  <thead className="bg-[#fafafb]">
                    <tr>
                      {['STT', 'Thời gian', 'Nội dung', 'UID nơi đăng', 'UID bài đăng'].map(header => (
                        <th key={header} className="px-4 py-3 text-left text-[13px] font-black uppercase tracking-wide text-[#455560]">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedFanpage.postHistory.map((item, index) => (
                      <tr key={item.id} className="border-t border-[#e6ebf1]">
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3">{item.time}</td>
                        <td className="px-4 py-3">{item.content}</td>
                        <td className="px-4 py-3">{item.targetUid}</td>
                        <td className="px-4 py-3">{item.postUid}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
