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
import { Label } from '@/components/ui/label'
import { Upload, X, FileText, CheckCircle2, ChevronRight } from 'lucide-react'
import { BANK_ACCOUNTS, BankAccount } from '../config/bankAccounts'
import { PaymentQRStep } from './PaymentQRStep'

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

const BILLING_CYCLES = [
  { label: '1 tháng', months: 1, discount: 0 },
  { label: '3 tháng', months: 3, discount: 0 },
  { label: '6 tháng', months: 6, discount: 5 },
  { label: '12 tháng', months: 12, discount: 10 },
];

const STEPS = ['Thông tin đơn', 'Thanh toán', 'Xác nhận'];

export const PaymentOrderModal: React.FC<PaymentOrderModalProps> = ({
  isOpen,
  onClose,
  actionType,
  currentPlan,
  currentUsers,
  onSuccess,
}) => {
  const [step, setStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [users, setUsers] = useState(currentUsers);
  const [selectedCycle, setSelectedCycle] = useState(BILLING_CYCLES[3]);
  const [selectedBank, setSelectedBank] = useState<BankAccount>(BANK_ACCOUNTS[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setUsers(currentUsers);
      setSelectedCycle(BILLING_CYCLES[3]);
      setSelectedFile(null);
      setSelectedBank(BANK_ACCOUNTS[0]);
      if (actionType === 'upgrade') setSelectedPlan('Enterprise');
      else if (actionType === 'downgrade') setSelectedPlan('Starter');
      else setSelectedPlan(currentPlan);
    }
  }, [isOpen, actionType, currentPlan, currentUsers]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = () => {
    onSuccess();
    onClose();
  };

  const selectedPlanData = PLANS.find(p => p.id === selectedPlan) || PLANS[1];
  const months = selectedCycle.months;
  const baseAmount = selectedPlanData.price * users * months;
  const discountAmount = baseAmount * (selectedCycle.discount / 100);
  const afterDiscount = baseAmount - discountAmount;
  const vat = afterDiscount * 0.1;
  const totalAmount = afterDiscount + vat;
  const currentPlanIdx = PLANS.findIndex(p => p.id === currentPlan);

  const orderId = `VILEAD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  const transferContent = `VILEAD ${orderId.replace('VILEAD-', 'OR')}`;

  const actionLabel = actionType === 'upgrade' ? 'Nâng cấp' : actionType === 'downgrade' ? 'Hạ cấp' : 'Gia hạn';
  const headerColor = 'bg-[#1a56db]';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[860px] bg-white p-0 overflow-hidden border-0 rounded-[10px]">
        {/* Header */}
        <DialogHeader className={`px-6 py-4 ${headerColor} text-white`}>
          <DialogTitle className="text-xl text-white font-bold">{actionLabel} gói dịch vụ</DialogTitle>
          <p className="text-sm text-white/80 mt-1 font-medium">Hoàn tất thanh toán để kích hoạt gói mới.</p>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center px-8 py-4 bg-white border-b border-[#e6ebf1]">
          {STEPS.map((label, idx) => (
            <React.Fragment key={idx}>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-colors ${
                  idx < step ? 'bg-green-500 border-green-500 text-white' :
                  idx === step ? 'bg-[#1a56db] border-[#1a56db] text-white' :
                  'bg-white border-gray-300 text-gray-400'
                }`}>
                  {idx < step ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-sm font-bold ${idx === step ? 'text-[#1a56db]' : idx < step ? 'text-green-600' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-300 mx-3" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="p-6 bg-gray-50/50 min-h-[380px]">

          {/* Step 0: Order Info */}
          {step === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Left: Billing cycle + Bank selection (3 cols) */}
              <div className="md:col-span-3 space-y-5">
                {/* Billing Cycle */}
                <div className="bg-white rounded-[10px] p-5 border border-[#e6ebf1]">
                  <div className="flex items-center gap-2 text-gray-900 font-bold mb-4">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-base">Thông tin đơn hàng</span>
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 block">Kỳ hạn thanh toán</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {BILLING_CYCLES.map((cycle) => (
                        <button
                          key={cycle.months}
                          onClick={() => setSelectedCycle(cycle)}
                          className={`relative px-2 py-3 border-2 rounded-[10px] text-center transition-colors ${
                            selectedCycle.months === cycle.months
                              ? 'border-[#3e79f7] bg-blue-50 text-[#3e79f7]'
                              : 'border-[#e6ebf1] bg-white text-gray-700 hover:border-blue-200'
                          }`}
                        >
                          <span className="text-[13px] font-bold block">{cycle.label}</span>
                          {cycle.discount > 0 && (
                            <span className="text-[10px] font-bold text-green-600 mt-0.5 block">Giảm {cycle.discount}%</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bank Selection */}
                <div className="bg-white rounded-[10px] p-5 border border-[#e6ebf1]">
                  <Label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 block">Chọn tài khoản thanh toán</Label>
                  <div className="space-y-2">
                    {BANK_ACCOUNTS.map((bank) => (
                      <button
                        key={bank.id}
                        onClick={() => setSelectedBank(bank)}
                        className={`w-full flex items-center gap-3 p-3 rounded-[10px] border-2 text-left transition-colors ${
                          selectedBank.id === bank.id
                            ? 'border-[#3e79f7] bg-blue-50'
                            : 'border-[#e6ebf1] bg-white hover:border-blue-200'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${selectedBank.id === bank.id ? 'bg-[#3e79f7] text-white' : 'bg-gray-100 text-gray-500'}`}>
                          {bank.bankShortName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{bank.bankShortName}</div>
                          <div className="text-xs text-gray-500">{bank.accountNumber} — {bank.accountHolder}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Summary (2 cols) */}
              <div className="md:col-span-2">
                <div className="bg-white rounded-[10px] p-5 border border-[#e6ebf1] sticky top-0">
                  <h4 className="text-sm font-bold text-gray-900 mb-4">Chi tiết thanh toán</h4>
                  <div className="space-y-3 text-[13px]">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Gói dịch vụ</span>
                      <span className="font-bold text-gray-900">{selectedPlan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Số người dùng</span>
                      <span className="font-bold text-gray-900">{users}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Kỳ hạn</span>
                      <span className="font-bold text-gray-900">{selectedCycle.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Đơn giá</span>
                      <span className="font-bold text-gray-900">{selectedPlanData.price.toLocaleString('vi-VN')}đ/user/tháng</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Thành tiền</span>
                      <span className="font-bold text-gray-900">{baseAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                    {selectedCycle.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá ({selectedCycle.discount}%)</span>
                        <span className="font-bold">-{discountAmount.toLocaleString('vi-VN')}đ</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">VAT (10%)</span>
                      <span className="font-bold text-gray-900">{vat.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="border-t border-dashed border-[#e6ebf1] pt-3 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-extrabold text-gray-900 uppercase">Tổng cộng</span>
                        <span className="text-xl font-extrabold text-[#1a56db]">{totalAmount.toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: QR Payment */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-[10px] p-3 text-sm text-green-800 font-medium">
                Đơn hàng <strong>{orderId}</strong> đã được tạo. Vui lòng chuyển khoản theo thông tin bên dưới.
              </div>
              <PaymentQRStep
                bankAccount={selectedBank}
                amount={totalAmount}
                transferContent={transferContent}
                orderId={orderId}
              />
            </div>
          )}

          {/* Step 2: Upload bill */}
          {step === 2 && (
            <div className="max-w-[500px] mx-auto">
              <div className="bg-white rounded-[10px] p-5 border border-[#e6ebf1]">
                <div className="flex items-center gap-2 text-gray-900 font-bold mb-4">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <span className="text-base">Upload chứng từ thanh toán</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">Tải lên ảnh chụp màn hình hoặc biên lai chuyển khoản để admin xác nhận.</p>

                <div className="border-2 border-dashed border-[#e6ebf1] rounded-[10px] p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-gray-700 mb-1">Tải lên hoặc kéo thả tệp</div>
                  <div className="text-xs text-gray-400 mb-4">PDF, PNG, JPG (Tối đa 5MB)</div>
                  <Label htmlFor="upload-receipt" className="cursor-pointer">
                    <span className="bg-white border border-[#e6ebf1] hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-[10px] text-sm font-semibold shadow-sm transition-colors">
                      CHỌN TỆP
                    </span>
                    <input id="upload-receipt" type="file" className="hidden" accept="image/png,image/jpeg,application/pdf" onChange={handleFileChange} />
                  </Label>
                </div>

                {selectedFile && (
                  <div className="mt-4 bg-[#f8fafc] border border-[#e6ebf1] rounded-[10px] p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 bg-white rounded border flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="truncate">
                        <div className="text-sm font-bold text-gray-800 truncate">{selectedFile.name}</div>
                        <div className="text-[11px] text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                    </div>
                    <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-red-50 text-red-500 rounded-[10px] transition-colors ml-2">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-[#e6ebf1] flex justify-between sm:justify-between gap-3">
          <Button variant="outline" onClick={step === 0 ? onClose : () => setStep(s => s - 1)} className="font-semibold px-6 border-[#e6ebf1]">
            {step === 0 ? 'Hủy' : 'Quay lại'}
          </Button>
          <div className="flex gap-3">
            {step === 0 && (
              <Button onClick={() => setStep(1)} className="bg-[#1a56db] hover:bg-[#1e40af] text-white font-bold px-8 shadow-sm">
                Tiếp tục &rarr;
              </Button>
            )}
            {step === 1 && (
              <Button onClick={() => setStep(2)} className="bg-[#1a56db] hover:bg-[#1e40af] text-white font-bold px-8 shadow-sm">
                Tôi đã chuyển khoản &rarr;
              </Button>
            )}
            {step === 2 && (
              <Button onClick={handleSubmit} disabled={!selectedFile} className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 shadow-sm disabled:opacity-50">
                Gửi xác nhận
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
