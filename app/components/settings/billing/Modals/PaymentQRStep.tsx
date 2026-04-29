"use client"

import React from 'react'
import { Copy, QrCode } from 'lucide-react'
import { BankAccount } from '../config/bankAccounts'

interface PaymentQRStepProps {
  bankAccount: BankAccount;
  amount: number;
  transferContent: string;
  orderId: string;
}

export const PaymentQRStep: React.FC<PaymentQRStepProps> = ({
  bankAccount,
  amount,
  transferContent,
  orderId,
}) => {
  const vietQRUrl = `https://img.vietqr.io/image/${bankAccount.vietQRBankId}-${bankAccount.accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(bankAccount.accountHolder)}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* QR Code */}
      <div className="flex flex-col items-center justify-center bg-white border border-[#e6ebf1] rounded-[10px] p-6 min-w-[240px]">
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-bold text-gray-900">Quét mã QR để thanh toán</span>
        </div>
        <div className="w-[200px] h-[200px] bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
          <img
            src={vietQRUrl}
            alt="VietQR Payment"
            className="w-full h-full object-contain"
          />
        </div>
        <p className="text-[11px] text-gray-400 mt-3 text-center">
          Mở app ngân hàng &rarr; Quét QR &rarr; Xác nhận thanh toán
        </p>
      </div>

      {/* Transfer Info */}
      <div className="flex-1 bg-[#f0f5ff] border border-blue-100 rounded-[10px] p-5">
        <h4 className="text-sm font-bold text-gray-900 mb-4">Hoặc chuyển khoản thủ công</h4>
        <div className="space-y-3 text-[13px]">
          <InfoRow label="Ngân hàng" value={bankAccount.bankShortName} />
          <InfoRow label="Chủ tài khoản" value={bankAccount.accountHolder} onCopy={() => copyToClipboard(bankAccount.accountHolder)} />
          <InfoRow label="Số tài khoản" value={bankAccount.accountNumber} highlight onCopy={() => copyToClipboard(bankAccount.accountNumber)} />
          <InfoRow label="Số tiền" value={`${amount.toLocaleString('vi-VN')} VND`} highlight onCopy={() => copyToClipboard(String(amount))} />
          <div className="pt-3 mt-2 border-t border-[#c7d9fd]/60">
            <InfoRow label="Nội dung CK" value={transferContent} isTransferContent onCopy={() => copyToClipboard(transferContent)} />
          </div>
        </div>

        <div className="mt-5 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 font-medium">
          Vui lòng nhập đúng nội dung chuyển khoản để hệ thống tự động xác nhận. Mã đơn: <strong>{orderId}</strong>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, highlight, isTransferContent, onCopy }: {
  label: string;
  value: string;
  highlight?: boolean;
  isTransferContent?: boolean;
  onCopy?: () => void;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500 w-28 shrink-0">{label}:</span>
      <div className="flex items-center gap-2">
        <span className={`font-bold text-right ${
          isTransferContent ? 'text-orange-600 tracking-wider' :
          highlight ? 'text-[#1a56db] text-base tracking-wider' : 'text-gray-900'
        } select-all`}>
          {value}
        </span>
        {onCopy && (
          <button
            onClick={onCopy}
            className="p-1 hover:bg-blue-100 rounded transition-colors"
            title="Sao chép"
          >
            <Copy className="w-3.5 h-3.5 text-blue-500" />
          </button>
        )}
      </div>
    </div>
  )
}
