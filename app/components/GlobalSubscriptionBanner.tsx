"use client"

import React from 'react';
import { useSubscription } from '@/app/contexts/SubscriptionContext';
import { AlertCircle } from 'lucide-react';
import { PaymentOrderModal } from './settings/billing/Modals/PaymentOrderModal';

export const GlobalSubscriptionBanner: React.FC = () => {
  const { status, setStatus, usersCount, isPaymentModalOpen, setPaymentModalOpen, paymentActionType, setPaymentActionType } = useSubscription();

  const handleOpenUpgrade = () => {
    setPaymentActionType('upgrade');
    setPaymentModalOpen(true);
  };

  return (
    <>
      {status === 'expiring_7d' && (
        <div className="bg-[#ff6b72] text-white px-4 py-2 flex items-center justify-center gap-3 w-full shrink-0 z-50 text-sm">
          <span className="font-medium">
            Thời gian dùng thử <strong>CRM Hệ thống</strong> chỉ còn <strong className="text-white">6 ngày</strong>. Quý khách vui lòng nâng cấp lên bản trả phí để không bị gián đoạn công việc.
          </span>
          <button 
            onClick={handleOpenUpgrade}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded text-sm font-bold shadow-sm transition-colors border border-white/30"
          >
            Nâng cấp ngay
          </button>
          <button className="text-white hover:text-white font-medium ml-4 text-xs font-bold underline">
            Bỏ qua
          </button>
        </div>
      )}

      {status === 'pending_downgrade' && (
        <div className="bg-yellow-500 text-white px-4 py-2 flex items-center justify-center gap-3 w-full shrink-0 z-50 text-sm">
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
      )}

      {/* Render modal directly here so it works anywhere the banner is visible (or layout is wrapped) */}
      <PaymentOrderModal
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        actionType={paymentActionType}
        currentPlan="Professional"
        currentUsers={usersCount}
        onSuccess={() => setStatus('pending_approval')}
      />
    </>
  );
};