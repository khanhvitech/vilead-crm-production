"use client"

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Clock, Zap, User, MoreVertical, Edit } from 'lucide-react';
import { MOCK_FB_ACCOUNTS } from '../mocks/mock-accounts';
import { FBAccount } from '../types';

interface AccountDetailPageProps {
  uid?: string;
  onNavigate?: (view: string, params?: any) => void;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'live':
    case 'active':
      return 'bg-[#e8f5e9] text-[#2dc56a] border-[#c8e6c9]';
    case 'die':
      return 'bg-[#ffebee] text-[#ff6b72] border-[#ffcdd2]';
    case 'checkpoint':
      return 'bg-[#fff3e0] text-[#ffc542] border-[#ffe0b2]';
    case 'restricted':
      return 'bg-[#f3e5f5] text-[#a461d8] border-[#e1bee7]';
    case 'inactive':
      return 'bg-[#eceff1] text-[#90a4ae] border-[#cfd8dc]';
    default:
      return 'bg-[#f5f5f5] text-[#455560] border-transparent';
  }
};

export default function AccountDetailPage({ uid, onNavigate }: AccountDetailPageProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  
  const account = uid ? MOCK_FB_ACCOUNTS.find(a => a.uid === uid) : null;

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-full">
        <p className="text-[#72849a] mb-4">Không tìm thấy tài khoản</p>
        <Button variant="outline" onClick={() => onNavigate?.('mkt-account-list')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Button>
      </div>
    );
  }

  const isProfile = account.type === 'profile';
  const colors = getStatusColor(account.status);

  return (
    <div className="p-6 bg-[#f7f7f8] min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="text-[#455560] hover:bg-white"
            onClick={() => onNavigate?.('mkt-account-list')}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Về danh sách
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 bg-[#3e79f7] text-white">
              <AvatarFallback className="text-xl font-bold bg-[#3e79f7] text-white">
                {account.avatar_initial}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-[22px] font-bold text-[#1a3353]">{account.name}</h1>
              <p className="text-[13px] text-[#72849a] font-mono">{account.uid}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`capitalize px-3 py-1 ${colors}`}>
            {account.status}
          </Badge>
          <Badge variant="outline" className="capitalize px-3 py-1 bg-white">
            {isProfile ? 'Tài khoản' : 'Trang'}
          </Badge>
          <Button variant="outline" size="sm" className="bg-white">
            <Edit className="w-4 h-4 mr-2" /> Chỉnh sửa
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-5 h-5 text-[#455560]" />
          </Button>
        </div>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white p-6 rounded-[10px] border border-[#e6ebf1]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#f0f7ff] flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#3e79f7]" />
            </div>
            <div>
              <p className="text-[13px] text-[#72849a]">Trạng thái từ</p>
              <p className="text-[15px] font-bold text-[#1a3353]">
                {new Date(account.status_since || '').toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-white p-6 rounded-[10px] border border-[#e6ebf1]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#f0e5f5] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#a461d8]" />
            </div>
            <div>
              <p className="text-[13px] text-[#72849a]">Phần mềm</p>
              <p className="text-[15px] font-bold text-[#1a3353]">
                {account.current_software || 'Chưa gắn'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-white p-6 rounded-[10px] border border-[#e6ebf1]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#fff3e0] flex items-center justify-center">
              <User className="w-5 h-5 text-[#ffc542]" />
            </div>
            <div>
              <p className="text-[13px] text-[#72849a]">Nhân viên giữ</p>
              <p className="text-[15px] font-bold text-[#1a3353]">
                {account.current_holder_id || 'Không có'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="bg-white rounded-[10px] border border-[#e6ebf1] overflow-hidden">
        <div className="border-b border-[#e6ebf1] px-6 pt-4">
          <TabsList className="bg-transparent h-auto p-0 gap-6">
            <TabsTrigger 
              value="overview"
              className="px-0 pb-4 pt-2 text-[14px] data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#3e79f7] data-[state=active]:text-[#3e79f7] rounded-none font-medium text-[#72849a]"
            >
              Tổng quan
            </TabsTrigger>
            <TabsTrigger 
              value="activity"
              className="px-0 pb-4 pt-2 text-[14px] data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#3e79f7] data-[state=active]:text-[#3e79f7] rounded-none font-medium text-[#72849a]"
            >
              Lịch sử hoạt động
            </TabsTrigger>
            <TabsTrigger 
              value="logs"
              className="px-0 pb-4 pt-2 text-[14px] data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#3e79f7] data-[state=active]:text-[#3e79f7] rounded-none font-medium text-[#72849a]"
            >
              Logs trạng thái
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="p-6 m-0 border-none outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-[16px] font-bold text-[#1a3353] mb-4">Thông tin cơ bản</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3">
                  <div className="text-[13px] text-[#72849a]">Tên Account:</div>
                  <div className="col-span-2 text-[14px] font-medium text-[#1a3353]">{account.name}</div>
                </div>
                <div className="grid grid-cols-3">
                  <div className="text-[13px] text-[#72849a]">UID:</div>
                  <div className="col-span-2 text-[14px] font-mono text-[#1a3353]">{account.uid}</div>
                </div>
                <div className="grid grid-cols-3">
                  <div className="text-[13px] text-[#72849a]">Loại:</div>
                  <div className="col-span-2 text-[14px] text-[#1a3353] capitalize">{account.type}</div>
                </div>
                <div className="grid grid-cols-3">
                  <div className="text-[13px] text-[#72849a]">Máy gắn liền:</div>
                  <div className="col-span-2 text-[14px] text-[#1a3353] font-mono bg-gray-50 px-2 py-1 rounded inline-flex">{account.current_machine_id || '—'}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[16px] font-bold text-[#1a3353] mb-4">Các lần thao tác gần nhất</h3>
              <Card className="p-4 rounded-[8px] bg-[#fafafb] border border-[#e6ebf1]">
                {account.last_action_at ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-[#3e79f7]" />
                      <p className="text-[14px] font-semibold text-[#1a3353]">{account.last_action_type}</p>
                    </div>
                    <p className="text-[13px] text-[#72849a] ml-4">
                      Vào lúc {new Date(account.last_action_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                ) : (
                  <p className="text-[13px] text-[#72849a]">Chưa có thao tác nào</p>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="p-6 m-0 border-none outline-none min-h-[200px]">
          <div className="text-center text-[#72849a] text-[14px] py-12">
            Tính năng Lịch sử hoạt động đang được phát triển...
          </div>
        </TabsContent>

        <TabsContent value="logs" className="p-6 m-0 border-none outline-none min-h-[200px]">
          <div className="text-center text-[#72849a] text-[14px] py-12">
            Tính năng Logs trạng thái đang được phát triển...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
