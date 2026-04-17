"use client"

import React from 'react';
import { useSubscription } from '@/app/contexts/SubscriptionContext';
import { AlertCircle } from 'lucide-react';

export const GlobalSubscriptionBanner: React.FC = () => {
  const { status } = useSubscription();

  if (status !== 'expiring_7d' && status !== 'pending_downgrade') {
    return null;
  }

  if (status === 'expiring_7d') {
    return (
      <div className="bg-[#f50b0b] text-white px-4 py-2 flex items-center justify-center gap-3 w-full shrink-0 z-50 text-sm">
        <span className="font-medium">
          Thời gian dùng thử <strong>CRM Hệ thống</strong> chỉ còn <strong className="text-white">6 ngày</strong>. Quý khách vui lòng nâng cấp lên bản trả phí để không bị gián đoạn công việc.
        </span>
        <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded text-sm font-bold shadow-sm transition-colors border border-white/30">
          Nâng cấp ngay
        </button>
        <button className="text-white hover:text-white font-medium ml-4 text-xs font-bold underline">
          Bỏ qua
        </button>
      </div>
    );
  }

  if (status === 'pending_downgrade') {
    return (
      <div className="bg-[#f59e0b] text-white px-4 py-2 flex items-center justify-center gap-3 w-full shrink-0 z-50 text-sm">
        <span className="font-medium">
          Gói của bạn sẽ tự động hạ tải vào cuối chu kỳ.
        </span>
        <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded text-sm font-bold shadow-sm transition-colors border border-white/30">
          Huỷ yêu cầu hạ cấp
        </button>
    <button className="text-white hover:text-white font-medium ml-4 text-xs font-bold underline">
          Bỏ qua
        </button>
      </div>
    );
  }

  return null;
};