"use client"

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Copy, Check, ChevronRight } from 'lucide-react';
import { MOCK_FB_ACCOUNTS } from '../mocks/mock-accounts';
import { FBAccount, User } from '../types';

interface AccountListPageProps {
  currentUser: User;
  onNavigate?: (view: string, params?: any) => void;
}

// Status badge color mapping
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'live':
    case 'active':
      return 'bg-[#e8f5e9] text-[#2dc56a] border border-[#c8e6c9]';
    case 'die':
      return 'bg-[#ffebee] text-[#ff6b72] border border-[#ffcdd2]';
    case 'checkpoint':
      return 'bg-[#fff3e0] text-[#ffc542] border border-[#ffe0b2]';
    case 'restricted':
      return 'bg-[#f3e5f5] text-[#a461d8] border border-[#e1bee7]';
    case 'inactive':
      return 'bg-[#eceff1] text-[#90a4ae] border border-[#cfd8dc]';
    default:
      return 'bg-[#f5f5f5] text-[#455560]';
  }
};

// Border color mapping for row highlight
const getStatusBorderColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'live':
    case 'active':
      return '';
    case 'die':
      return 'border-l-[3px] border-l-[#ff6b72]';
    case 'checkpoint':
      return 'border-l-[3px] border-l-[#ffc542]';
    case 'restricted':
      return 'border-l-[3px] border-l-[#a461d8]';
    case 'inactive':
      return 'border-l-[3px] border-l-[#90a4ae]';
    default:
      return '';
  }
};

// Type badge color
const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'profile':
      return 'bg-[#f0f0f0] text-[#666666]';
    case 'page':
      return 'bg-[#f0e5f5] text-[#7e57c2]';
    default:
      return 'bg-[#f5f5f5]';
  }
};

const AccountTable = ({
  data,
  onRowClick,
  copiedUid,
  onCopyUid,
}: {
  data: FBAccount[];
  onRowClick: (account: FBAccount) => void;
  copiedUid: string | null;
  onCopyUid: (uid: string) => void;
}) => {
  if (data.length === 0) {
    return (
      <Card className="bg-white border border-[#e6ebf1] rounded-[10px] p-8 text-center">
        <Search className="w-12 h-12 mx-auto mb-4 text-[#ccc]" />
        <div className="text-[#72849a] text-[14px]">Không tìm thấy UID</div>
        <Button variant="outline" className="mt-4">
          Xóa bộ lọc
        </Button>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-white border border-[#e6ebf1] rounded-[10px]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#fafafb] text-[#455560] text-[13px] font-black uppercase tracking-wider">
            <tr>
              <th className="p-4 border-b border-r border-[#e6ebf1] w-[160px]">UID</th>
              <th className="p-4 border-b border-r border-[#e6ebf1] w-[200px]">Tên</th>
              <th className="p-4 border-b border-r border-[#e6ebf1] w-[100px]">Loại</th>
              <th className="p-4 border-b border-r border-[#e6ebf1] w-[140px]">Trạng thái</th>
              <th className="p-4 border-b border-r border-[#e6ebf1] w-[120px]">P. Mềm</th>
              <th className="p-4 border-b border-r border-[#e6ebf1] w-[160px]">NV Giữ</th>
              <th className="p-4 border-b border-[#e6ebf1] w-[200px]">Thao tác cuối</th>
            </tr>
          </thead>
          <tbody>
            {data.map((account) => (
              <tr
                key={account.uid}
                className={`h-[80px] hover:bg-[#f0f7ff] cursor-pointer transition-colors even:bg-[#fafafb] border-b border-[#e6ebf1] ${getStatusBorderColor(account.status)}`}
              >
                <td className="p-4 border-r border-[#e6ebf1] align-middle">
                  <div className="flex items-center gap-2 group">
                    <code className="font-mono text-[13px] text-[#1a3353]">
                      {account.uid}
                    </code>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopyUid(account.uid);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedUid === account.uid ? (
                        <Check className="w-4 h-4 text-[#2dc56a]" />
                      ) : (
                        <Copy className="w-4 h-4 text-[#455560] hover:text-[#3e79f7]" />
                      )}
                    </button>
                  </div>
                </td>
                <td
                  className="p-4 border-r border-[#e6ebf1] align-middle cursor-pointer"
                  onClick={() => onRowClick(account)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 bg-[#3e79f7] text-white flex items-center justify-center text-[13px] font-bold">
                      <AvatarFallback className="bg-[#3e79f7] text-white text-[13px]">
                        {account.avatar_initial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-[14px] font-medium text-[#1a3353] truncate">
                      {account.name}
                    </div>
                  </div>
                </td>
                <td
                  className="p-4 border-r border-[#e6ebf1] align-middle cursor-pointer"
                  onClick={() => onRowClick(account)}
                >
                  <Badge className={`text-[12px] font-semibold capitalize ${getTypeBadgeColor(account.type)}`}>
                    {account.type}
                  </Badge>
                </td>
                <td
                  className="p-4 border-r border-[#e6ebf1] align-middle cursor-pointer"
                  onClick={() => onRowClick(account)}
                >
                  <div className={`inline-flex px-3 py-1 rounded-full text-[12px] font-semibold ${getStatusColor(account.status)} capitalize`}>
                    {account.status}
                  </div>
                </td>
                <td
                  className="p-4 border-r border-[#e6ebf1] align-middle text-[13px] text-[#455560] cursor-pointer"
                  onClick={() => onRowClick(account)}
                >
                  {account.current_software || '—'}
                </td>
                <td
                  className="p-4 border-r border-[#e6ebf1] align-middle cursor-pointer"
                  onClick={() => onRowClick(account)}
                >
                  {account.current_holder_id ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6 bg-[#3e79f7] text-white flex items-center justify-center text-[10px]">
                        <AvatarFallback className="bg-[#3e79f7] text-white text-[10px]">
                          NV
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[13px] text-[#1a3353]">
                        {account.current_holder_id.slice(0, 15)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[#72849a]">—</span>
                  )}
                </td>
                <td className="p-4 align-middle text-[13px] text-[#72849a]">
                  {account.last_action_at ? (
                    <span>
                      {account.last_action_type} · {new Date(account.last_action_at).toLocaleDateString('vi-VN')}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const Pagination = ({
  total,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const pages = [];

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (!pages.includes(i)) pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between p-4 border-t border-[#e6ebf1]">
      <div className="flex items-center gap-3">
        <span className="text-[13px] text-[#72849a]">Rows:</span>
        <Select value={pageSize.toString()} onValueChange={(v) => onPageSizeChange(parseInt(v))}>
          <SelectTrigger className="w-[80px] h-10 rounded-[10px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-[10px]">
            {[10, 20, 50, 100].map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-[10px] h-10 px-3"
        >
          &lt;
        </Button>

        {pages.map((page, idx) => (
          <React.Fragment key={idx}>
            {page === '...' ? (
              <span className="text-[#72849a] px-2">...</span>
            ) : (
              <Button
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={`rounded-[10px] h-10 w-10 ${page === currentPage ? 'bg-[#3e79f7] text-white' : ''}`}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-[10px] h-10 px-3"
        >
          &gt;
        </Button>
      </div>
    </div>
  );
};

export default function AccountListPage({
  currentUser,
  onNavigate,
}: AccountListPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSoftware, setFilterSoftware] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  // Filter and search logic
  const filteredAccounts = useMemo(() => {
    return MOCK_FB_ACCOUNTS.filter((account) => {
      const matchesSearch =
        account.uid.includes(searchQuery) ||
        account.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        filterType === 'all' || account.type === filterType;
      const matchesStatus =
        filterStatus === 'all' || account.status === filterStatus;
      const matchesSoftware =
        filterSoftware === 'all' ||
        (account.current_software && account.current_software.includes(filterSoftware));

      return matchesSearch && matchesType && matchesStatus && matchesSoftware;
    });
  }, [searchQuery, filterType, filterStatus, filterSoftware]);

  // Pagination
  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAccounts.slice(start, start + pageSize);
  }, [filteredAccounts, currentPage, pageSize]);

  const handleExport = () => {
    console.log('Exporting to Excel...');
    // TODO: Implement Excel export
  };

  const handleCopyUid = (uid: string) => {
    navigator.clipboard.writeText(uid);
    setCopiedUid(uid);
    setTimeout(() => setCopiedUid(null), 2000);
  };

  const handleRowClick = (account: FBAccount) => {
    if (onNavigate) {
      if (account.type === 'profile') {
        onNavigate('mkt-account-profile', { uid: account.uid });
      } else {
        onNavigate('mkt-account-page', { uid: account.uid });
      }
    }
  };

  return (
    <div className="p-6 bg-[#f7f7f8] min-h-full">

      {/* Title */}
      <h2 className="text-lg font-semibold text-[#1a3353]">Tài khoản Facebook</h2>
      <p className="text-[#1a3353] font-medium mb-4">
        Tra cứu và quản lý toàn bộ UID Facebook đang vận hành
      </p>

      {/* Filter Bar */}
      <Card className="p-4 bg-white border border-[#e6ebf1] rounded-[10px] mb-6 flex flex-wrap items-center gap-4">
        {/* Type Filter */}
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[140px] h-10 rounded-[10px]">
            <SelectValue placeholder="Loại" />
          </SelectTrigger>
          <SelectContent className="rounded-[10px]">
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="profile">Profile</SelectItem>
            <SelectItem value="page">Page</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px] h-10 rounded-[10px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent className="rounded-[10px]">
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="die">Die</SelectItem>
            <SelectItem value="checkpoint">Checkpoint</SelectItem>
            <SelectItem value="restricted">Hạn chế</SelectItem>
            <SelectItem value="inactive">Không hoạt động</SelectItem>
          </SelectContent>
        </Select>

        {/* Software Filter */}
        <Select value={filterSoftware} onValueChange={setFilterSoftware}>
          <SelectTrigger className="w-[160px] h-10 rounded-[10px]">
            <SelectValue placeholder="Phần mềm" />
          </SelectTrigger>
          <SelectContent className="rounded-[10px]">
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="Care">MKT Care</SelectItem>
            <SelectItem value="Post">MKT Post</SelectItem>
            <SelectItem value="Page">MKT Page</SelectItem>
            <SelectItem value="UID">MKT UID</SelectItem>
          </SelectContent>
        </Select>

        {/* Search Input */}
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#72849a]" />
          <Input
            type="text"
            placeholder="Tìm UID hoặc tên..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 h-10 rounded-[10px] border border-[#e6ebf1]"
          />
        </div>

        {/* Export Button */}
        <Button
          variant="outline"
          onClick={handleExport}
          className="h-10 rounded-[10px] text-[#455560] hover:text-[#699dff] hover:bg-[#f0f7ff]"
        >
          Xuất Excel
        </Button>
      </Card>

      {/* Summary Counter */}
      <div className="mb-4 text-[14px] text-[#72849a]">
        Hiển thị <span className="font-semibold text-[#1a3353]">{paginatedAccounts.length}</span> / <span className="font-semibold text-[#1a3353]">{filteredAccounts.length}</span> UID
        {filteredAccounts.length < MOCK_FB_ACCOUNTS.length && ' (đang lọc)'}
      </div>

      {/* Table */}
      <div className="mb-0">
        <AccountTable
          data={paginatedAccounts}
          onRowClick={handleRowClick}
          copiedUid={copiedUid}
          onCopyUid={handleCopyUid}
        />
      </div>

      {/* Pagination */}
      {filteredAccounts.length > 0 && (
        <Pagination
          total={filteredAccounts.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  );
}