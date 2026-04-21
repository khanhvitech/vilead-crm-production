"use client";

import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  TrendingUp, 
  MessageSquare, 
  ThumbsUp, 
  MessageCircle, 
  UserPlus, 
  FileText, 
  Target, 
  Share2, 
  Users,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { User as MktUser } from '../types';
import { useToast } from '@/hooks/use-toast';
import { MOCK_POSTS } from '../mocks/mock-posts';

interface MyReportPageProps {
  currentUser: MktUser;
  onNavigate?: (view: string, params?: any) => void;
}

const MOCK_MY_UIDS = [
  { uid: '100084729188', name: 'Nguyễn Hữu Trí', type: 'Facebook', status: 'Live', lastAction: '10:30 12/04/2026' },
  { uid: '100098273611', name: 'Trần Văn Sang', type: 'Facebook', status: 'Live', lastAction: '09:15 12/04/2026' },
  { uid: '100078126355', name: 'Lê Hà Ngân', type: 'Facebook', status: 'Checkpoint', lastAction: '08:45 12/04/2026' },
  { uid: '100067218399', name: 'Phạm Quyết', type: 'Facebook', status: 'Live', lastAction: '11:00 12/04/2026' },
  { uid: '100051728362', name: 'Hoàng Mỹ Linh', type: 'Facebook', status: 'Die', lastAction: 'Hôm qua' },
];

export default function MyReportPage({ currentUser, onNavigate }: MyReportPageProps) {
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser.role !== 'employee') {
      toast({
        title: "Từ chối truy cập",
        description: "Trang này chỉ dành cho Nhân viên.",
        variant: "destructive"
      });
      if (onNavigate) {
        onNavigate('mkt-dashboard');
      }
    }
  }, [currentUser, onNavigate, toast]);

  if (currentUser.role !== 'employee') {
    return null; // Tránh render nháy trước khi bị redirect
  }

  return (
    <div className="p-6 space-y-6 bg-[#f7f7f8] min-h-full">
      {/* Breadcrumb & Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[22px] font-bold text-[#1a3353]">Báo cáo của tôi</h1>
          <p className="text-[14px] text-[#72849a] mt-1">Xem hoạt động cá nhân theo ngày</p>
        </div>

        <div className="flex gap-4 items-center">
          <div className="bg-white border border-[#e6ebf1] rounded-[10px] px-3 py-2 text-[14px] text-[#455560] min-w-[150px] shadow-sm">
            📅 Hôm nay, 12/04/2026
          </div>
          <Button variant="outline" className="gap-2 bg-white">
            <Download className="h-4 w-4" />
            Xuất Excel cá nhân
          </Button>
        </div>
      </div>

      {/* Row 1 - 3 MetricCard trạng thái UID cá nhân */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="p-4 rounded-[10px] border-[#e6ebf1] shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col justify-center">
          <span className="text-[14px] text-[#72849a] font-medium">UID của tôi</span>
          <span className="text-[24px] font-bold text-[#1a3353] mt-1">24</span>
        </Card>
        <Card className="p-4 rounded-[10px] border-[#e6ebf1] shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col justify-center">
          <span className="text-[14px] text-[#72849a] font-medium">UID Live</span>
          <span className="text-[24px] font-bold text-[#2dc56a] mt-1">20</span>
        </Card>
        <Card className="p-4 rounded-[10px] border-[#e6ebf1] shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col justify-center">
          <span className="text-[14px] text-[#72849a] font-medium">UID Die / Checkpoint</span>
          <span className="text-[24px] font-bold text-[#ff6b72] mt-1">4</span>
        </Card>
      </div>

      {/* Row 2 - So sánh kỳ */}
      <Card className="p-6 rounded-[10px] border-[#e6ebf1] shadow-sm bg-white">
        <h3 className="text-[15px] font-semibold text-[#1a3353] mb-4">So sánh hiệu suất</h3>
        <div className="grid grid-cols-3 gap-8">
          <div className="pl-4 border-l-[3px] border-[#3e79f7]">
            <div className="text-[13px] text-[#72849a] mb-1 uppercase font-bold tracking-wide">Hôm nay</div>
            <div className="text-[28px] font-bold text-[#1a3353]">847 <span className="text-[16px] text-[#455560] font-normal">HĐ</span></div>
            <div className="flex items-center text-[13px] text-[#2dc56a] font-medium mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              +18% so với hôm qua
            </div>
          </div>
          <div className="pl-4 border-l-[3px] border-[#e6ebf1]">
            <div className="text-[13px] text-[#72849a] mb-1 uppercase font-bold tracking-wide">Hôm qua</div>
            <div className="text-[28px] font-bold text-[#455560] opacity-80">720 <span className="text-[16px] font-normal">HĐ</span></div>
            <div className="text-[13px] text-[#72849a] mt-1">—</div>
          </div>
          <div className="pl-4 border-l-[3px] border-[#e6ebf1]">
            <div className="text-[13px] text-[#72849a] mb-1 uppercase font-bold tracking-wide">TB 7 Ngày Gần Nhất</div>
            <div className="text-[28px] font-bold text-[#455560] opacity-80">680 <span className="text-[16px] font-normal">HĐ</span></div>
            <div className="flex items-center text-[13px] text-[#2dc56a] font-medium mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              +25% so với TB tuần
            </div>
          </div>
        </div>
      </Card>

      {/* Row 3 - Hoạt động hôm nay của tôi */}
      <h3 className="text-[16px] font-semibold text-[#1a3353] pt-2">Tổng quan hoạt động hôm nay</h3>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Tin nhắn', val: 120, icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Lượt Like', val: 56, icon: ThumbsUp, color: 'text-pink-500', bg: 'bg-pink-50' },
          { label: 'Bình luận', val: 23, icon: MessageCircle, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: 'Kết bạn', val: 12, icon: UserPlus, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Bài đăng', val: 5, icon: FileText, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'UID quét được', val: 48, icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-50' },
          { label: 'Lượt Share', val: 3, icon: Share2, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Tham gia Group', val: 3, icon: Users, color: 'text-teal-500', bg: 'bg-teal-50' },
        ].map((item, i) => (
          <Card key={i} className="p-4 rounded-[10px] border-[#e6ebf1] shadow-none flex items-center gap-4 bg-white hover:border-[#699dff] transition-colors">
            <div className={`h-11 w-11 rounded flex items-center justify-center ${item.bg} ${item.color}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[18px] font-bold text-[#1a3353]">{item.val}</div>
              <div className="text-[13px] text-[#72849a]">{item.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Row 4 - Danh sách bài đăng hôm nay của tôi */}
      <Card className="rounded-[10px] border-[#e6ebf1] shadow-sm bg-white overflow-hidden">
        <div className="p-5 border-b border-[#e6ebf1] bg-[#fafafb]">
          <h3 className="text-[16px] font-semibold text-[#1a3353]">Bài đăng của tôi hôm nay (5)</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#fafafb] h-[50px] border-b border-[#e6ebf1]">
              <th className="px-4 text-[13px] font-black text-[#455560] uppercase tracking-wide w-[140px]">Thời gian</th>
              <th className="px-4 text-[13px] font-black text-[#455560] uppercase tracking-wide w-[180px]">Nơi đăng</th>
              <th className="px-4 text-[13px] font-black text-[#455560] uppercase tracking-wide">Nội dung</th>
              <th className="px-4 text-[13px] font-black text-[#455560] uppercase tracking-wide w-[120px]">Phần mềm</th>
              <th className="px-4 text-[13px] font-black text-[#455560] uppercase tracking-wide w-[80px] text-center">Link</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_POSTS.slice(0, 5).map((p, i) => (
              <tr key={i} className="h-[60px] border-b border-[#e6ebf1] last:border-0 hover:bg-[#f0f7ff] transition-colors even:bg-[#fafafb]">
                <td className="px-4 text-[14px] text-[#455560]">{new Date(p.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} hôm nay</td>
                <td className="px-4">
                  <span className="inline-flex px-2 py-1 rounded-sm bg-[#f5f0fa] text-[#a461d8] text-[12px] font-medium">{p.location}</span>
                </td>
                <td className="px-4 text-[14px] text-[#455560] truncate max-w-[300px]">{p.content || '[Hình ảnh/Video]'}</td>
                <td className="px-4 text-[14px] text-[#72849a]">MKT Care</td>
                <td className="px-4 text-center">
                  <a href={p.link} target="_blank" rel="noreferrer" className="text-[#3e79f7] hover:text-[#699dff] inline-flex items-center">
                    <ExternalLink className="h-[18px] w-[18px]" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Row 5 - Bảng UID của tôi */}
      <Card className="rounded-[10px] border-[#e6ebf1] shadow-sm bg-white overflow-hidden">
        <div className="p-5 border-b border-[#e6ebf1] bg-[#fafafb]">
          <h3 className="text-[16px] font-semibold text-[#1a3353]">Tất cả UID tôi đang vận hành</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#fafafb] h-[50px] border-b border-[#e6ebf1]">
              <th className="px-4 text-[13px] font-black text-[#455560] uppercase tracking-wide w-[180px]">UID</th>
              <th className="px-4 text-[13px] font-black text-[#455560] uppercase tracking-wide">Tên</th>
              <th className="px-4 text-[13px] font-black text-[#455560] uppercase tracking-wide w-[140px]">Loại</th>
              <th className="px-4 text-[13px] font-black text-[#455560] uppercase tracking-wide w-[150px]">Trạng thái</th>
              <th className="px-4 text-[13px] font-black text-[#455560] uppercase tracking-wide w-[200px]">Thao tác cuối</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_MY_UIDS.map((u, i) => {
              let badgeColor = 'bg-[#f7f7f8] text-[#455560]';
              if (u.status === 'Live') badgeColor = 'bg-[rgba(45,197,106,0.15)] text-[#2dc56a]';
              else if (u.status === 'Die') badgeColor = 'bg-[rgba(255,107,114,0.15)] text-[#ff6b72]';
              else if (u.status === 'Checkpoint') badgeColor = 'bg-[rgba(255,197,66,0.15)] text-[#ffc542]';

              return (
                <tr key={i} className="h-[60px] border-b border-[#e6ebf1] last:border-0 hover:bg-[#f0f7ff] transition-colors even:bg-[#fafafb] cursor-pointer"
                    onClick={() => onNavigate && onNavigate('mkt-account-page', { uid: u.uid })}>
                  <td className="px-4 text-[14px] text-[#3e79f7] font-medium">{u.uid}</td>
                  <td className="px-4 text-[14px] text-[#1a3353] font-medium">{u.name}</td>
                  <td className="px-4 text-[14px] text-[#455560]">{u.type}</td>
                  <td className="px-4">
                    <span className={`inline-flex items-center px-2 py-[2px] rounded-sm text-[12px] font-medium whitespace-nowrap ${badgeColor}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 text-[14px] text-[#72849a]">{u.lastAction}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

    </div>
  );
}