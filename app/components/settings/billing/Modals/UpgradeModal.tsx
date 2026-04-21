"use client"

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fromPlan: string;
  toPlan: string;
  users: number;
  duration: number; // days remaining
  priceDiff: number;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  fromPlan,
  toPlan,
  users,
  duration,
  priceDiff
}) => {
  const vatAmount = priceDiff * 0.1;
  const totalAmount = priceDiff + vatAmount;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 border-0 rounded-[10px] overflow-hidden bg-white shadow-xl">
        <DialogHeader className="bg-[#f97316] text-white p-6">
          <DialogTitle className="text-xl font-bold">Xác nhận nâng cấp gói</DialogTitle>
          <p className="text-sm font-medium mt-1.5 opacity-90">Nâng cấp từ gói {fromPlan} lên {toPlan}.</p>
        </DialogHeader>
        
        <div className="p-6">
          <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-[10px] p-5 mb-6 text-sm text-gray-800 font-medium">
            Phí nâng cấp được tính dựa trên mức chênh lệch giữa hai gói cho <strong>{duration} ngày</strong> sử dụng còn lại của chu kỳ hiện tại, áp dụng cho <strong>{users} người dùng</strong>.
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-gray-500 font-bold">Gói mới</span>
              <span className="font-extrabold text-[#ea580c]">{toPlan}</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-gray-500 font-bold">Chi phí chênh lệch (trước VAT)</span>
              <span className="font-bold text-gray-900">{priceDiff.toLocaleString('vi-VN')} VND</span>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-gray-500 font-bold">VAT (10%)</span>
              <span className="font-bold text-gray-900">{vatAmount.toLocaleString('vi-VN')} VND</span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-900 font-extrabold uppercase tracking-wide text-xs">Tổng thanh toán</span>
              <span className="text-2xl font-extrabold text-[#ea580c]">{totalAmount.toLocaleString('vi-VN')} VND</span>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 flex gap-3 sm:justify-end bg-gray-50 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} className="font-bold px-6 border-[#e6ebf1]">
            Hủy
          </Button>
          <Button onClick={onConfirm} className="bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold px-6 shadow-md">
            Xác nhận thanh toán
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}