"use client";

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Download, MousePointer, ExternalLink, ChevronRight, User, Monitor, Calendar } from 'lucide-react';
import { User as MktUser } from '../types';
import { MOCK_REPORT_USERS, MOCK_REPORT_SOFTWARE, MOCK_REPORT_DATES, ReportData } from '../mocks/mock-reports';
import { MOCK_POSTS } from '../mocks/mock-posts';
import { MOCK_USERS } from '../mocks/mock-users';

interface ReportsPageProps {
  currentUser: MktUser;
  onNavigate?: (view: string, params?: any) => void;
}

export default function ReportsPage({ currentUser, onNavigate }: ReportsPageProps) {
  // Mode: user | software | date
  const defaultMode = currentUser.role === 'employee' ? 'software' : 'user';
  const [currentMode, setCurrentMode] = useState<'user'|'software'|'date'>(defaultMode);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<ReportData | null>(null);

  // Filter Data
  const listData = useMemo(() => {
    let data: ReportData[] = [];
    if (currentMode === 'user') {
      if (currentUser.role === 'employee') return [];
      data = MOCK_REPORT_USERS;
      if (currentUser.role === 'teamLeader') {
        data = data.filter(d => MOCK_USERS.find(u => u.id === d.userId)?.department === currentUser.department);
      }
    } else if (currentMode === 'software') {
      data = MOCK_REPORT_SOFTWARE;
    } else if (currentMode === 'date') {
      data = MOCK_REPORT_DATES;
    }

    if (searchTerm) {
      data = data.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return data;
  }, [currentMode, searchTerm, currentUser]);

  const handleModeChange = (mode: string) => {
    setCurrentMode(mode as any);
    setSelectedItem(null);
    setSearchTerm('');
  };

  // Total Summary Panel logic
  const totals = listData.reduce((acc, curr) => {
    acc.uids += curr.totalUids;
    acc.messages += curr.totalMessages;
    acc.posts += curr.totalPosts;
    acc.interactions += curr.totalInteractions;
    acc.collected += curr.totalCollected;
    return acc;
  }, { uids: 0, messages: 0, posts: 0, interactions: 0, collected: 0 });

  return (
    <div className="p-6 space-y-6">
      {/* 1. Header */}
      <div>
        <h2 className="text-lg font-semibold text-[#1a3353]">Báo cáo theo ngày</h2>
              <p className="text-[#1a3353] font-medium mb-4">
        Báo cáo theo ngày toàn đội
      </p>
      </div>

      {/* 2. Filter Bar */}
      <Card className="p-4 rounded-[10px] border-[#e6ebf1] shadow-none flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          <div className="w-[220px]">
            <Select defaultValue="7d">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Khoảng thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Ngày gần nhất</SelectItem>
                <SelectItem value="14d">14 Ngày gần nhất</SelectItem>
                <SelectItem value="30d">30 Ngày gần nhất</SelectItem>
                <SelectItem value="month">Tháng này</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-[160px]">
            <Select defaultValue="ALL">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Phần mềm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả phần mềm</SelectItem>
                <SelectItem value="MKT Care">MKT Care</SelectItem>
                <SelectItem value="MKT Post">MKT Post</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {currentUser.role !== 'employee' && (
            <div className="w-[180px]">
              <Select defaultValue="ALL">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả nhân viên</SelectItem>
                  {MOCK_USERS.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Xuất Excel
        </Button>
      </Card>

      {/* 3. Summary Strip */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Tổng UID', val: totals.uids.toLocaleString() },
          { label: 'Tổng tin nhắn', val: totals.messages.toLocaleString() },
          { label: 'Tổng bài đăng', val: totals.posts.toLocaleString() },
          { label: 'Like & Bình luận', val: totals.interactions.toLocaleString() },
          { label: 'UID thu thập', val: totals.collected.toLocaleString() }
        ].map((item, i) => (
          <Card key={i} className="p-6 rounded-[10px] border-[#e6ebf1] shadow-none hover:shadow-md transition-shadow">
            <h3 className="text-[14px] text-[#72849a] mb-1">{item.label}</h3>
            <p className="text-[24px] font-bold text-[#1a3353]">{item.val}</p>
          </Card>
        ))}
      </div>

      {/* 4. Main 2-Panel Layout */}
      <div className="grid grid-cols-[40%_1fr] gap-6 h-[600px]">
        
        {/* PANEL TRÁI */}
        <Card className="rounded-[10px] border-[#e6ebf1] shadow-none flex flex-col h-full bg-white overflow-hidden">
          <div className="p-4 border-b border-[#e6ebf1] space-y-4 shrink-0">
            {/* Switcher */}
            <Tabs value={currentMode} onValueChange={handleModeChange} className="w-full">
              <TabsList className="grid grid-cols-3 w-full bg-[#f7f7f8] p-1 rounded-md">
                <TabsTrigger value="user" disabled={currentUser.role === 'employee'} className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded text-[13px]">Nhân viên</TabsTrigger>
                <TabsTrigger value="software" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded text-[13px]">Phần mềm</TabsTrigger>
                <TabsTrigger value="date" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded text-[13px]">Ngày</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-[10px] h-4 w-4 text-[#72849a]" />
              <Input 
                placeholder={`Tìm ${currentMode === 'user' ? 'nhân viên' : currentMode === 'software' ? 'phần mềm' : 'ngày'}...`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 bg-[#fcfcfc]"
              />
            </div>
          </div>

          {/* List scrollable */}
          <div className="flex-1 overflow-y-auto">
            {listData.length === 0 ? (
              <div className="p-8 text-center text-[#72849a] text-[14px]">
                Không có dữ liệu
              </div>
            ) : (
              <div className="flex flex-col">
                {listData.map(item => {
                  const isSelected = selectedItem?.id === item.id;
                  const hd = item.totalInteractions + item.totalMessages + item.totalPosts;
                  
                  return (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`p-4 border-b border-[#e6ebf1] cursor-pointer flex items-center justify-between transition-colors
                        ${isSelected ? 'bg-[#f0f7ff] border-l-[3px] border-l-[#3e79f7] pl-[13px]' : 'bg-white hover:bg-[#fafafb] border-l-[3px] border-l-transparent'}
                      `}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {currentMode === 'user' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-[#3e79f7] text-white text-[12px]">{item.title[0]}</AvatarFallback>
                          </Avatar>
                        )}
                        {currentMode === 'software' && <div className="h-8 w-8 rounded bg-[#f5f0fa] flex items-center justify-center text-[#a461d8]"><Monitor className="h-4 w-4" /></div>}
                        {currentMode === 'date' && <div className="h-8 w-8 rounded bg-[#e8f5e9] flex items-center justify-center text-[#2dc56a]"><Calendar className="h-4 w-4" /></div>}
                        
                        <div className="flex flex-col min-w-0">
                          <span className="text-[14px] font-medium text-[#1a3353] truncate">{item.title}</span>
                          <span className="text-[12px] text-[#72849a] truncate mt-0.5">{item.subtitle}</span>
                        </div>
                      </div>
                      <div className="shrink-0 bg-[#f7f7f8] px-2 py-1 rounded text-[12px] font-medium text-[#455560]">
                        {hd.toLocaleString()} HĐ
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* PANEL PHẢI */}
        <Card className="rounded-[10px] border-[#e6ebf1] shadow-none h-full bg-white overflow-hidden flex flex-col relative">
          {!selectedItem ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#72849a]">
              <div className="h-16 w-16 bg-[#fafafb] rounded-full flex items-center justify-center mb-4">
                <MousePointer className="h-8 w-8 text-[#d0d4d7]" />
              </div>
              <p className="text-[15px] font-medium text-[#455560]">Chọn một mục bên trái để xem chi tiết</p>
              <p className="text-[14px] mt-1">Báo cáo sẽ hiển thị ở đây</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Header Right Panel */}
              <div className="p-6 border-b border-[#e6ebf1] shrink-0 flex justify-between items-start bg-[#fafafb]">
                <div className="flex items-center gap-4">
                  {currentMode === 'user' && (
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-[#3e79f7] text-white text-[16px]">{selectedItem.title[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  {currentMode === 'software' && <div className="h-12 w-12 rounded bg-[#f5f0fa] flex items-center justify-center text-[#a461d8]"><Monitor className="h-6 w-6" /></div>}
                  {currentMode === 'date' && <div className="h-12 w-12 rounded bg-[#e8f5e9] flex items-center justify-center text-[#2dc56a]"><Calendar className="h-6 w-6" /></div>}
                  
                  <div>
                    <h2 className="text-[18px] font-bold text-[#1a3353]">{selectedItem.title}</h2>
                    <p className="text-[14px] text-[#72849a] mt-1">{selectedItem.subtitle} · Kỳ 12/04 - 18/04/2026</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2 h-8 text-[13px]">
                  <Download className="h-3.5 w-3.5" />
                  Xuất Excel
                </Button>
              </div>

              {/* Tabs Right Panel */}
              <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 pt-4 shrink-0">
                  <TabsList className="w-full justify-start border-b border-[#e6ebf1] rounded-none bg-transparent p-0 h-auto gap-6">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#3e79f7] data-[state=active]:text-[#3e79f7] rounded-none px-0 pb-3 text-[14px] font-medium text-[#72849a]">
                      Tổng quan hoạt động
                    </TabsTrigger>
                    <TabsTrigger value="posts" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#3e79f7] data-[state=active]:text-[#3e79f7] rounded-none px-0 pb-3 text-[14px] font-medium text-[#72849a]">
                      Bài đăng đã thực hiện
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-[#fcfcfc]">
                  <TabsContent value="overview" className="m-0 space-y-6">
                    {/* 3 Metric Cards */}
                    <div className="grid grid-cols-3 gap-4">
                      {selectedItem.metrics.map((m, i) => (
                        <div key={i} className="bg-white border border-[#e6ebf1] rounded-[10px] p-4 flex flex-col justify-center shadow-sm">
                          <span className="text-[13px] font-medium text-[#72849a]">{m.label}</span>
                          <span className="text-[20px] font-bold text-[#1a3353] mt-1">{m.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Bảng breakdown chi tiết */}
                    <div className="bg-white border border-[#e6ebf1] rounded-[10px] overflow-hidden shadow-sm">
                      <div className="bg-[#fafafb] px-4 py-3 border-b border-[#e6ebf1] font-bold text-[13px] text-[#455560] uppercase tracking-wide">
                        {currentMode === 'user' ? 'Theo Phần mềm' : 'Theo Nhân viên'}
                      </div>
                      <div className="divide-y divide-[#e6ebf1]">
                        {selectedItem.breakdown.map((row, i) => (
                          <div key={i} className="flex justify-between items-center p-4 hover:bg-[#f0f7ff] transition-colors">
                            <span className="font-medium text-[#1a3353] text-[14px]">{row.name}</span>
                            <div className="flex gap-6 text-[14px] text-[#455560]">
                              <span className="w-24 text-right"><b>{row.uids}</b> UID</span>
                              <span className="w-24 text-right text-[#3e79f7] font-medium">{row.actions.toLocaleString()} HĐ</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="posts" className="m-0 h-full">
                    <div className="bg-white border border-[#e6ebf1] rounded-[10px] overflow-hidden shadow-sm flex flex-col h-full">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#fafafb] h-[40px] border-b border-[#e6ebf1]">
                            <th className="px-4 text-[12px] font-bold text-[#455560] uppercase w-[120px]">Thời gian</th>
                            <th className="px-4 text-[12px] font-bold text-[#455560] uppercase w-[140px]">Nơi đăng</th>
                            <th className="px-4 text-[12px] font-bold text-[#455560] uppercase">Nội dung</th>
                            <th className="px-4 text-[12px] font-bold text-[#455560] uppercase w-[60px] text-center">Link</th>
                          </tr>
                        </thead>
                        <tbody>
                          {MOCK_POSTS.slice(0, 8).map((p, i) => (
                            <tr key={i} className="border-b border-[#e6ebf1] last:border-0 hover:bg-[#f0f7ff]">
                              <td className="px-4 py-3 text-[13px] text-[#455560] font-medium">{new Date(p.time).toLocaleDateString('vi-VN')}</td>
                              <td className="px-4 py-3">
                                <span className="inline-flex px-2 py-1 rounded bg-[#f0f7ff] text-[#3e79f7] text-[12px] font-medium">{p.location}</span>
                              </td>
                              <td className="px-4 py-3 text-[13px] text-[#455560] truncate max-w-[200px]">{p.content || '[Hình ảnh]'}</td>
                              <td className="px-4 py-3 text-center">
                                <ExternalLink className="h-4 w-4 text-[#3e79f7] inline-block cursor-pointer hover:text-[#699dff]" onClick={() => window.open(p.link, '_blank')} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}