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

interface DowngradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fromPlan: string;
  toPlan: string;
  currentUsers: number;
  maxUsersAllowed: number;
  expiryDate: string;
}

export const DowngradeModal: React.FC<DowngradeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  fromPlan,
  toPlan,
  currentUsers,
  maxUsersAllowed,
  expiryDate
}) => {
  const isInvalid = currentUsers > maxUsersAllowed;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] p-0 border-0 rounded-[10px] overflow-hidden bg-white shadow-2xl">
        <DialogHeader className={isInvalid ? "bg-[#ff6b72] text-white p-6" : "bg-[#3e79f7] text-white p-6"}>
          <DialogTitle className="text-xl font-bold">
            {isInvalid ? "Không thể hạ cấp gói" : "Xác nhận Lịch Hạ Cấp"}
          </DialogTitle>
          <p className="text-sm font-medium mt-1.5 opacity-90">
            {isInvalid ? "Giới hạn người dùng bị vượt quá" : `Đề nghị chuyển từ ${fromPlan} xuống ${toPlan}`}
          </p>
        </DialogHeader>
        
        <div className="p-6">
          {isInvalid ? (
            <div className="text-gray-800 space-y-4">
              <p className="font-semibold text-[15px]">Hệ thống không thể xử lý yêu cầu hạ cấp.</p>
              <div className="bg-red-50 border border-red-200 rounded-[10px] p-4 text-sm text-red-800 leading-relaxed font-medium">
                Bạn hiện đang có <strong className="text-red-700"> {currentUsers} thành viên</strong> hoạt động, nhưng gói {toPlan} chỉ cho phép tối đa <strong className="text-red-700">{maxUsersAllowed} thành viên</strong>.
                <br /><br />
                Vui lòng vào mục Quản lý nhân sự vô hiệu hóa bớt thành viên dư thừa trước khi thực hiện thao tác này.
              </div>
            </div>
          ) : (
            <div className="text-gray-800 space-y-4">
              <p className="font-semibold text-sm">Quý khách đang yêu cầu hạ cấp dịch vụ xuống gói <strong className="text-[#3e79f7]">{toPlan}</strong>.</p>
              <div className="bg-blue-50 border border-[#c7d9fd] rounded-[10px] p-4 text-sm text-blue-900 leading-relaxed">
                Yêu cầu này sẽ KHÔNG có hiệu lực ngay. Tất cả tính năng của gói {fromPlan} vẫn được giữ nguyên đến hết ngày <strong>{expiryDate}</strong>.<br/><br/>
                Vào chu kỳ thanh toán tiếp theo, hệ thống sẽ thay đổi giới hạn và lập hóa đơn dựa trên gói {toPlan}. Bạn sẽ không nhận được hoàn tiền nào cho thời gian còn lại của gói hiện tại.
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-4 flex gap-3 sm:justify-end bg-gray-50 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} className="font-bold px-6 border-[#e6ebf1]">
            {isInvalid ? "Đóng" : "Hủy yêu cầu"}
          </Button>
          {!isInvalid && (
            <Button onClick={onConfirm} className="bg-[#3e79f7] hover:bg-[#699dff] text-white font-bold px-6 shadow-md transition-colors">
              Xác nhận lịch hạ cấp
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}