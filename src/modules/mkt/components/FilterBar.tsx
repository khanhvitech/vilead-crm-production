import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserRole } from '../types';

export interface FilterBarProps {
  userRole: UserRole;
  onExport: () => void;
}

export function FilterBar({ userRole, onExport }: FilterBarProps) {
  return (
    <Card className="p-4 bg-white border border-[#e6ebf1] rounded-[10px] mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Giả lập DatePicker 1 ngày */}
        <div className="flex items-center gap-2">
          <input 
            type="date" 
            className="input-field h-10 px-3 py-2 border border-[#e6ebf1] text-[#455560] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#3e79f7]/20 focus:border-[#3e79f7] text-[14px] bg-white transition-all w-[160px]"
            defaultValue={new Date().toISOString().split('T')[0]} 
          />
        </div>

        <Select defaultValue="all">
          <SelectTrigger className="w-[180px] h-10 rounded-[10px]">
            <SelectValue placeholder="Phần mềm" />
          </SelectTrigger>
          <SelectContent className="rounded-[10px]">
            <SelectItem value="all">Tất cả phần mềm</SelectItem>
            <SelectItem value="mkt-care">MKT Care</SelectItem>
            <SelectItem value="mkt-post">MKT Post</SelectItem>
            <SelectItem value="mkt-page">MKT Page</SelectItem>
            <SelectItem value="mkt-uid">MKT UID</SelectItem>
          </SelectContent>
        </Select>

        {userRole !== 'employee' && (
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] h-10 rounded-[10px]">
              <SelectValue placeholder="Nhân viên" />
            </SelectTrigger>
            <SelectContent className="rounded-[10px]">
              <SelectItem value="all">Tất cả nhân viên</SelectItem>
              <SelectItem value="usr-1">Hương Nguyễn</SelectItem>
              <SelectItem value="usr-2">Bình Trần</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <Button
        variant="outline"
        onClick={onExport}
        className="omi-btn omi-btn-outline h-10 rounded-[10px] text-[#455560] hover:text-[#699dff] hover:bg-[#f0f7ff]"
      >
        <Download className="w-4 h-4 mr-2" />
        Xuất Excel
      </Button>
    </Card>
  );
}
