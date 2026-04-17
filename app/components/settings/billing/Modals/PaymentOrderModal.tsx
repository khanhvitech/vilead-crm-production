"use client"

import React, { useState, useEffect } from 'react'
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
import { Upload, X, FileText, CheckCircle2 } from 'lucide-react'

interface PaymentOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: 'upgrade' | 'downgrade' | 'renew' | null;
  currentPlan: string;
  currentUsers: number;
  onSuccess: () => void;
}

const PLANS = [
  { id: 'Starter', price: 49000 },
  { id: 'Professional', price: 89000 },
  { id: 'Enterprise', price: 159000 },
];

export const PaymentOrderModal: React.FC<PaymentOrderModalProps> = ({
  isOpen,
  onClose,
  actionType,
  currentPlan,
  currentUsers,
  onSuccess
}) => {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [users, setUsers] = useState(currentUsers);
  
  const calculateEndDateFromMonths = (m: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + m);
    return d.toISOString().split('T')[0];
  };

  const [months, setMonths] = useState(12);
  const [endDate, setEndDate] = useState<string>(calculateEndDateFromMonths(12));

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUsers(currentUsers);
      
      setMonths(12);
      setEndDate(calculateEndDateFromMonths(12));

      setSelectedFile(null);
      if (actionType === 'upgrade') {
         setSelectedPlan('Enterprise');
      } else if (actionType === 'downgrade') {
         setSelectedPlan('Starter');
      } else {
         setSelectedPlan(currentPlan);
      }
    }
  }, [isOpen, actionType, currentPlan, currentUsers]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const clearFile = () => setSelectedFile(null);

  const handleMonthsChange = (val: number) => {
    const m = Math.max(1, val);
    setMonths(m);
    setEndDate(calculateEndDateFromMonths(m));
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    const start = new Date();
    const end = new Date(val);
    const diffTime = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const calculatedMonths = Math.max(1, Math.round(diffTime));
    setMonths(calculatedMonths);
  };

  const handleSubmit = () => {
    onSuccess();
    onClose();
  };

  const selectedPlanData = PLANS.find(p => p.id === selectedPlan) || PLANS[1];
  const baseAmount = selectedPlanData.price * users * months;
  const vat = baseAmount * 0.1;
  const totalAmount = baseAmount + vat;

  const currentPlanIdx = PLANS.findIndex(p => p.id === currentPlan);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] bg-white p-0 overflow-hidden border-0 rounded-xl">
        <DialogHeader className="px-6 py-4 bg-[#1a56db] text-white">
          <DialogTitle className="text-xl text-white font-bold">Thêm đơn hàng mới</DialogTitle>
          <p className="text-sm text-white mt-1 font-medium">Quản lý thông tin thanh toán và chứng từ đơn hàng.</p>
        </DialogHeader>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50">
          {/* Left Column: Order Details */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-900 font-bold mb-6">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-base">Thông tin đơn hàng</span>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 block">Chọn khách hàng</Label>
                <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm font-semibold text-gray-700">
                  CÔNG TY TNHH VILEAD (Mặc định)
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 block">Gói đăng ký</Label>
                <div className="grid grid-cols-3 gap-2">
                  {PLANS.map((plan, idx) => {
                    let disabled = false;
                    if (actionType === 'upgrade' && idx <= currentPlanIdx) disabled = true;
                    if (actionType === 'downgrade' && idx >= currentPlanIdx) disabled = true;
                    if (actionType === 'renew' && idx !== currentPlanIdx) disabled = true;
                    
                    return (
                      <button
                        key={plan.id}
                        disabled={disabled}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`px-1 py-2 border-2 rounded-lg text-[13px] font-bold flex flex-col items-center justify-center transition-colors ${
                          selectedPlan === plan.id 
                            ? 'border-blue-600 bg-blue-50 text-blue-700' 
                            : disabled 
                              ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                        }`}
                      >
                        <span className="truncate w-full text-center">{plan.id}</span>
                        <span className="text-[11px] mt-1 font-medium">{plan.price.toLocaleString('vi-VN')}đ</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 block">Số lượng User</Label>
                  <Input 
                    type="number" 
                    min={1} 
                    value={users} 
                    onChange={(e) => setUsers(parseInt(e.target.value) || 1)}
                    className="font-bold border-gray-300 text-xs px-2.5 h-10"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 block">Số tháng</Label>
                  <Input 
                    type="number" 
                    min={1} 
                    value={months} 
                    onChange={(e) => handleMonthsChange(parseInt(e.target.value) || 1)}
                    className="font-bold border-gray-300 text-xs px-2.5 h-10"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 block w-[120px]">Hạn thanh toán</Label>
                  <Input 
                    type="date" 
                    value={endDate}
                    min={new Date().toISOString().split('T')[0]} 
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    className="font-bold border-gray-300 text-xs px-2.5 h-10"
                  />
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                <Label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 block">Thông tin chuyển khoản</Label>
                <div className="bg-[#f0f5ff] border border-blue-100 rounded-lg p-4 text-[13px] text-gray-700 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 w-28">Ngân hàng:</span>
                    <span className="font-bold text-gray-900 text-right">MB Bank (Ngân hàng Quân Đội)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 w-28">Chủ tài khoản:</span>
                    <span className="font-bold text-gray-900 text-right uppercase">Công ty TNHH Vilead</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 w-28">Số tài khoản:</span>
                    <span className="font-extrabold text-[#1a56db] text-base text-right tracking-wider select-all">0969 0909 0909</span>
                  </div>
                  <div className="flex justify-between items-center pt-2.5 mt-1 border-t border-blue-200/60">
                    <span className="text-gray-500 w-28">Nội dung CK:</span>
                    <span className="font-extrabold text-orange-600 tracking-wider text-right select-all">VILEAD OR2026 0001</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Upload */}
          <div className="space-y-6">
            
            {/* Total Block */}
            <div className="bg-[#f0f5ff] rounded-xl p-5 border border-blue-100 flex flex-col justify-center items-center text-center">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">Tổng thanh toán (Đã gồm VAT)</span>
              <div className="text-3xl font-extrabold text-[#1a56db]">
                {totalAmount.toLocaleString('vi-VN')} VND
              </div>
              <div className="text-xs text-blue-400 font-medium mt-1">
                Gói {selectedPlan} x {users} users x {months} tháng
              </div>
            </div>

            {/* Upload Area */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 flex-1 flex flex-col">
              <div className="flex items-center gap-2 text-gray-900 font-bold mb-4">
                <Upload className="w-5 h-5 text-blue-600" />
                <span className="text-base">Hóa đơn / Chứng từ</span>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors flex-1">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-gray-700 mb-1">Tải lên hoặc kéo thả tệp</div>
                <div className="text-xs text-gray-400 mb-4 whitespace-nowrap truncate max-w-full px-2">PDF, PNG, JPG (Tối đa 5MB)</div>
                
                <Label htmlFor="upload-receipt" className="cursor-pointer">
                  <span className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors">
                    CHỌN TỆP
                  </span>
                  <input
                    id="upload-receipt"
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg, application/pdf"
                    onChange={handleFileChange}
                  />
                </Label>
              </div>

              {selectedFile && (
                <div className="mt-4 bg-[#f8fafc] border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 bg-white rounded flex border items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-bold text-gray-800 truncate">{selectedFile.name}</div>
                      <div className="text-[11px] text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Hoàn thành</div>
                    </div>
                  </div>
                  <button onClick={clearFile} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors ml-2">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 sm:justify-end">
          <Button variant="outline" onClick={onClose} className="font-semibold px-6 border-gray-300">
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-[#1a56db] hover:bg-[#1e40af] text-white font-bold px-8 shadow-sm"
            disabled={!selectedFile}
          >
            Lưu lại
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
