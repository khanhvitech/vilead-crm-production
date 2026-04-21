"use client";

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Search, Download, ExternalLink, ChevronRight } from 'lucide-react';
import { MOCK_POSTS } from '../mocks/mock-posts';
import { MOCK_USERS } from '../mocks/mock-users';
import { Post, PostLocation, User } from '../types';

interface PostHistoryPageProps {
  currentUser: User;
  onNavigate?: (view: string, params?: any) => void;
}

const getPostLocationBadgeInfo = (location: PostLocation, locName?: string) => {
  switch (location) {
    case 'personal':
      return { 
        label: 'Tường CN', 
        classes: 'bg-[rgba(62,121,247,0.15)] text-[#3e79f7]' 
      };
    case 'group':
      return { 
        label: `Group: ${locName || 'Unknown'}`, 
        classes: 'bg-[rgba(45,197,106,0.15)] text-[#2dc56a]' 
      };
    case 'page':
      return { 
        label: 'Page', 
        classes: 'bg-[#f5f0fa] text-[#a461d8]' 
      };
    default:
      return { label: 'Khác', classes: 'bg-gray-100 text-gray-500' };
  }
};

const formatDate = (isoString: string) => {
  const d = new Date(isoString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month} ${hours}:${minutes}`;
};

export default function PostHistoryPage({ currentUser, onNavigate }: PostHistoryPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [employeeFilter, setEmployeeFilter] = useState('ALL');
  const [softwareFilter, setSoftwareFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Permission Check
  currentUser.role = 'admin'; // TESTING - XÓA DÒNG NÀY KHI RA PROD
//   if (currentUser.role === 'employee') {
//     // NV KHÔNG có quyền (menu ẨN, nhưng nếu url direct tới đây -> Ẩn tiếp)
//     return (
//       <div className="p-6">
//         <Card className="p-6 text-center text-[#ff6b72]">
//           Bạn không có quyền truy cập tính năng Lịch sử Bài đăng.
//         </Card>
//       </div>
//     );
//   }

  // Lọc list user cho dropdown nhân viên (Tuỳ role, Admin cover all)
  const employeeOptions = useMemo(() => {
    if (currentUser.role === 'pm' || currentUser.role === 'admin') {
      return MOCK_USERS;
    }
    if (currentUser.role === 'teamLeader') {
      return MOCK_USERS.filter(u => u.department === currentUser.department);
    }
    return [currentUser];
  }, [currentUser]);

  // Lọc Posts
  const filteredPosts = useMemo(() => {
    let result = MOCK_POSTS;

    // Filter theo nhân viên (TL xem nhóm, PM/Admin xem tất cả)
    if (currentUser.role === 'pm' || currentUser.role === 'admin') {
      // Ok all
    } else if (currentUser.role === 'teamLeader') {
      // Only same department
      const deptUserIds = employeeOptions.map(u => u.id);
      result = result.filter(p => deptUserIds.includes(p.user_id));
    }

    if (employeeFilter !== 'ALL') {
      result = result.filter(p => p.user_id === employeeFilter);
    }
    if (locationFilter !== 'ALL') {
      result = result.filter(p => p.location === locationFilter);
    }
    if (softwareFilter !== 'ALL') {
      result = result.filter(p => p.software === softwareFilter);
    }
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.content.toLowerCase().includes(q) || 
        p.fb_account_name.toLowerCase().includes(q) ||
        (p.group_name && p.group_name.toLowerCase().includes(q))
      );
    }

    // Sort by _time descending
    result.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return result;
  }, [searchTerm, locationFilter, employeeFilter, softwareFilter, currentUser, employeeOptions]);

  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredPosts.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredPosts, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredPosts.length / rowsPerPage);

  const handleRowClick = (post: Post) => {
    // Mở Account Detail
    if (onNavigate) {
      if (post.location === 'page' || post.software === 'MKT Page') {
        onNavigate('mkt-account-page', { uid: post.fb_account_uid, tab: 'posts' });
      } else {
        onNavigate('mkt-account-profile', { uid: post.fb_account_uid, tab: 'posts' });
      }
    }
  };

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getEmpAvatar = (uid: string) => {
    const usr = MOCK_USERS.find(u => u.id === uid);
    return usr ? usr.avatar_initial : '?';
  };

  return (
    <div className="p-6 space-y-6">
      {/* 1. Tiêu đề và Subtitle */}
      <div>
      {/* Title */}
      <h2 className="text-lg font-semibold text-[#1a3353]">Lịch sử Bài đăng</h2>
      <p className="text-[#1a3353] font-medium mb-4">
        Danh sách bài đăng toàn đội
      </p>
      </div>

      {/* 2. Filter Bar */}
      <Card className="p-4 rounded-[10px] border-[#e6ebf1] shadow-none flex flex-wrap gap-4">
        {/* DateRange giả lập */}
        <div className="w-[220px]">
          <Select defaultValue="7d">
            <SelectTrigger className="w-full">
               <SelectValue placeholder="Chọn khoảng thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Ngày gần nhất</SelectItem>
              <SelectItem value="30d">30 Ngày gần nhất</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Nhân viên */}
        <div className="w-[180px]">
          <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
            <SelectTrigger className="w-full">
               <SelectValue placeholder="Nhân viên" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả nhân viên</SelectItem>
              {employeeOptions.map(emp => (
                <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Phần mềm */}
        <div className="w-[160px]">
          <Select value={softwareFilter} onValueChange={setSoftwareFilter}>
            <SelectTrigger className="w-full">
               <SelectValue placeholder="Phần mềm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả phần mềm</SelectItem>
              <SelectItem value="MKT Post">MKT Post</SelectItem>
              <SelectItem value="MKT Page">MKT Page</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Nơi đăng */}
        <div className="w-[160px]">
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full">
               <SelectValue placeholder="Nơi đăng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả nơi đăng</SelectItem>
              <SelectItem value="personal">Tường cá nhân</SelectItem>
              <SelectItem value="group">Group</SelectItem>
              <SelectItem value="page">Page</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 relative min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-[10px] h-4 w-4 text-[#72849a]" />
            <Input 
              placeholder="Tìm nội dung..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
        </div>

        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Xuất Excel
        </Button>
      </Card>

      {/* 3. Bảng dữ liệu */}
      <Card className="rounded-[10px] border-[#e6ebf1] shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#fafafb] h-[50px] border-b border-[#e6ebf1] hover:bg-[#fafafb]">
                <TableHead className="font-black text-[13px] text-[#455560] uppercase tracking-wide border-r border-[#e6ebf1] w-[140px]">
                  THỜI GIAN
                </TableHead>
                <TableHead className="font-black text-[13px] text-[#455560] uppercase tracking-wide border-r border-[#e6ebf1] w-[160px]">
                  NHÂN VIÊN
                </TableHead>
                <TableHead className="font-black text-[13px] text-[#455560] uppercase tracking-wide border-r border-[#e6ebf1] w-[180px]">
                  NƠI ĐĂNG
                </TableHead>
                <TableHead className="font-black text-[13px] text-[#455560] uppercase tracking-wide border-r border-[#e6ebf1] w-[320px]">
                  NỘI DUNG
                </TableHead>
                <TableHead className="font-black text-[13px] text-[#455560] uppercase tracking-wide border-r border-[#e6ebf1] w-[120px]">
                  PHẦN MỀM
                </TableHead>
                <TableHead className="font-black text-[13px] text-[#455560] uppercase tracking-wide text-center w-[80px]">
                  LINK
                </TableHead>
              </TableRow>
            </TableHeader>
            <TooltipProvider delayDuration={300}>
              <TableBody>
                {filteredPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-[#72849a]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Search className="h-8 w-8 text-[#d0d4d7]" />
                        <p>Không tìm thấy bài đăng phù hợp</p>
                        <Button 
                          variant="link" 
                          onClick={() => {
                            setSearchTerm('');
                            setLocationFilter('ALL');
                            setSoftwareFilter('ALL');
                            setEmployeeFilter('ALL');
                          }}
                        >
                          Xóa bộ lọc
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPosts.map((post, idx) => {
                    const locInfo = getPostLocationBadgeInfo(post.location, post.group_name);
                    const isEven = idx % 2 === 0;
                    
                    return (
                      <TableRow 
                        key={post.id}
                        onClick={() => handleRowClick(post)}
                        className={`h-[70px] cursor-pointer transition-colors border-b border-[#e6ebf1] last:border-b-0 hover:bg-[#f0f7ff] ${
                          isEven ? 'bg-[#fafafb]' : 'bg-white'
                        }`}
                      >
                        <TableCell className="text-[14px] text-[#455560] border-r border-[#e6ebf1]">
                          {formatDate(post.time)}
                        </TableCell>
                        <TableCell className="border-r border-[#e6ebf1]">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px] bg-[#3e79f7] text-white">
                                {getEmpAvatar(post.user_id)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[14px] text-[#455560] truncate max-w-[100px]">
                              {post.user_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="border-r border-[#e6ebf1]">
                          <span className={`inline-flex items-center px-2 py-1 text-[12px] font-medium rounded-sm whitespace-nowrap truncate max-w-[160px] ${locInfo.classes}`}>
                            {locInfo.label}
                          </span>
                        </TableCell>
                        <TableCell className="border-r border-[#e6ebf1]">
                          {post.content ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-[14px] text-[#455560] truncate max-w-[300px]">
                                  {post.content.length > 100 ? `${post.content.substring(0, 100)}...` : post.content}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-[400px] text-sm">{post.content}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-[14px] text-[#90a4ae] italic">[Bài chỉ có hình ảnh]</span>
                          )}
                        </TableCell>
                        <TableCell className="text-[14px] text-[#455560] border-r border-[#e6ebf1]">
                          {post.software}
                        </TableCell>
                        <TableCell className="text-center">
                          <button 
                            className="inline-flex items-center justify-center hover:bg-[#e6ebf1] rounded-md p-1 transition-colors group"
                            onClick={(e) => handleLinkClick(e, post.link)}
                          >
                            <ExternalLink className="h-4 w-4 text-[#3e79f7] group-hover:text-[#699dff]" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </TooltipProvider>
          </Table>
        </div>

        {/* Pagination Info */}
        {filteredPosts.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-[#e6ebf1] bg-white">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#455560]">Rows per page:</span>
              <Select 
                value={String(rowsPerPage)} 
                onValueChange={(val) => {
                  setRowsPerPage(Number(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[70px] h-8 text-sm">
                  <SelectValue placeholder="20" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-[#72849a] ml-4">
                Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredPosts.length)} of {filteredPosts.length} entries
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                &lt;
              </Button>
              <div className="text-sm text-[#455560] px-2 flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-8 w-8 rounded flex items-center justify-center text-sm font-medium ${
                      currentPage === pageNum 
                        ? 'bg-[#3e79f7] text-white' 
                        : 'text-[#455560] hover:bg-[#f7f7f8]'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                &gt;
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}