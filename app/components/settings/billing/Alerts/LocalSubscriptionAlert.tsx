"use client"

import React from 'react'
import { AlertTriangle, Clock } from 'lucide-react'

interface LocalSubscriptionAlertProps {
  status: 'active' | 'expiring_7d' | 'exceed_users' | 'pending_approval' | 'pending_downgrade';
  daysLeft: number;
  onRenew: () => void;
}

export const LocalSubscriptionAlert: React.FC<LocalSubscriptionAlertProps> = ({ status, daysLeft, onRenew }) => {
  if (status === 'expiring_7d') {
    return (
      <div className="bg-[#fef2f2] border-l-4 border-[#b91c1c] rounded-r-lg p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm relative overflow-hidden group hover:bg-[#ffe4e6] transition-colors">
        <div className="absolute top-0 right-0 -mr-6 -mt-6">
          <Clock className="w-24 h-24 text-[#fca5a5] opacity-20 transform -rotate-12 group-hover:scale-110 group-hover:rotate-0 transition-transform duration-500" />
        </div>
        <div className="flex items-start md:items-center gap-4 relative z-10">
          <div className="bg-[#fee2e2] text-[#b91c1c] p-2.5 rounded-full shrink-0 shadow-sm border border-[#fca5a5]">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-[#991b1b] font-extrabold text-base mb-1 tracking-tight">Gói dịch vụ sắp hết hạn</h4>
            <p className="text-[#b91c1c] text-sm font-medium">Vui lòng gia hạn trước ngày <strong className="font-extrabold text-[#7f1d1d]">01/07/2026</strong> để tránh gián đoạn dịch vụ.</p>
          </div>
        </div>
        <button 
          onClick={onRenew}
          className="bg-[#b91c1c] hover:bg-[#991b1b] text-white px-6 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap shadow-md hover:shadow-lg transition-all active:scale-95 z-10"
        >
          Gia hạn ngay
        </button>
      </div>
    )
  }

  if (status === 'pending_approval') {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-lg p-5 mb-6 shadow-sm relative overflow-hidden group hover:bg-blue-100 transition-colors">
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-blue-100 text-blue-600 p-2.5 rounded-full shrink-0 shadow-sm border border-blue-200">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-blue-900 font-extrabold text-base mb-1 tracking-tight">Đơn hàng đang chờ xử lý</h4>
            <p className="text-blue-800 text-sm font-medium">Hệ thống đang chờ Admin xác nhận thanh toán. Gói dịch vụ của bạn sẽ được cập nhật sớm nhất.</p>
          </div>
        </div>
      </div>
    )
  }

  return null;
}