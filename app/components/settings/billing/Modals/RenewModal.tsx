"use client"

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface RenewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (months: number, note: string) => void;
  currentPlan: string;
  orderId: string;
  expiryDate: string;
}

export const RenewModal: React.FC<RenewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentPlan,
  orderId,
  expiryDate
}) => {
  const [months, setMonths] = useState(1);
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    onConfirm(months, note);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-0 border-0 rounded-xl overflow-hidden bg-white shadow-xl">
        <DialogHeader className="bg-[#1a56db] text-white p-6">
          <DialogTitle className="text-xl font-bold">Gia hạn license</DialogTitle>
          <p className="text-sm font-medium mt-1.5 opacity-90">Gia hạn được mở khi đơn hàng liên kết đã thanh toán.</p>
        </DialogHeader>
        
        <div className="p-6 pb-2">
          <div className="bg-[#f8fafc] border border-gray-100 rounded-xl p-4 text-[13px] leading-relaxed text-gray-700 space-y-2 mb-6">
            <div className="flex"><span className="font-bold w-28 text-gray-500">Khách hàng:</span> <span className="font-bold">CÔNG TY TNHH VILEAD</span></div>
            <div className="flex"><span className="font-bold w-28 text-gray-500">Đơn liên kết:</span> <span className="font-bold text-[#1a56db]">{orderId}</span></div>
            <div className="flex"><span className="font-bold w-28 text-gray-500">Gói hiện tại:</span> <span className="font-bold">{currentPlan}</span></div>
            <div className="flex"><span className="font-bold w-28 text-gray-500">Ngày hết hạn:</span> <span className="font-bold">{expiryDate}</span></div>
          </div>

          <div className="space-y-5">
            <div>
              <Label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-2 block">Số tháng gia hạn</Label>
              <Input 
                type="number" 
                value={months} 
                min={1}
                max={36}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="h-11 border-gray-300 font-semibold focus-visible:ring-[#1a56db]"
              />
            </div>
            
            <div>
              <Label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-2 block">Ghi chú</Label>
              <Textarea 
                value={note} 
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú gia hạn..."
                className="min-h-[100px] border-gray-300 resize-none focus-visible:ring-[#1a56db]"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 flex gap-3 sm:justify-end">
          <Button variant="outline" onClick={onClose} className="font-bold px-6">
            Hủy
          </Button>
          <Button onClick={handleSubmit} className="bg-[#1a56db] hover:bg-[#1e40af] text-white font-bold px-6">
            Xác nhận gia hạn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}