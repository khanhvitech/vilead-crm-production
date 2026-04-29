"use client";

import React, { useState } from 'react';
import { CreditCard, CheckCircle2, AlertTriangle, Download, Receipt, Settings2, Globe, Loader2 } from 'lucide-react';
import { useSubscription, SubscriptionStatus } from '@/app/contexts/SubscriptionContext';

import { LocalSubscriptionAlert } from './Alerts/LocalSubscriptionAlert';
import { RenewModal } from './Modals/RenewModal';

const mockOrders = [
  {
    id: 'ORD-202401',
    date: '2024-04-01',
    plan: 'Pro - 12 tháng',
    amount: 10680000,
    status: 'completed',
    invoiceUrl: '#'
  },
  {
    id: 'ORD-202302',
    date: '2023-04-01',
    plan: 'Starter - 12 tháng',
    amount: 4680000,
    status: 'completed',
    invoiceUrl: '#'
  }
];

export const BillingManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'current_plan' | 'order_history' | 'domain_config'>('current_plan');

  const {
    status, setStatus,
    usersCount, setUsersCount,
    maxUsers, setMaxUsers,
    isPaymentModalOpen, setPaymentModalOpen,
    paymentActionType, setPaymentActionType
  } = useSubscription();

  // Modals state
  const [isRenewModalOpen, setRenewModalOpen] = useState(false);

  // Domain config state
  const [domainInput, setDomainInput] = useState('');
  const [domainStatus, setDomainStatus] = useState<'idle' | 'invalid' | 'duplicate' | 'subdomain_only' | 'dns_not_found' | 'dns_propagating' | 'ssl_error' | 'success'>('idle');
  const [domainLoading, setDomainLoading] = useState(false);
  const [activeDomain, setActiveDomain] = useState('');

  const handleDomainSubmit = () => {
    const val = domainInput.trim().toLowerCase();
    if (!val) return;

    const parts = val.split('.');
    if (parts.length < 2 || parts.some(p => !p) || !/^[a-z0-9.-]+$/.test(val)) {
      setDomainStatus('invalid');
      return;
    }
    if (parts.length === 2) {
      setDomainStatus('subdomain_only');
      return;
    }
    if (val === 'used.example.com') {
      setDomainStatus('duplicate');
      return;
    }

    setDomainLoading(true);
    setDomainStatus('dns_propagating');
    setTimeout(() => {
      setDomainLoading(false);
      setDomainStatus('success');
      setActiveDomain(val);
    }, 2000);
  };

  const getPricingBase = (plan: string) => {
    switch (plan) {
      case 'Starter': return 49000;
      case 'Professional': return 89000;
      case 'Enterprise': return 159000;
      default: return 89000;
    }
  }

  // Luồng thay mới
  const handleOpenUpgrade = () => {
    if (status === 'pending_approval') return;
    setPaymentActionType('upgrade');
    setPaymentModalOpen(true);
  }

  const handleOpenDowngrade = () => {
    if (status === 'pending_approval') return;
    setPaymentActionType('downgrade');
    setPaymentModalOpen(true);
  }

  const handleOpenRenew = () => {
    if (status === 'pending_approval') return;
    setPaymentActionType('renew');
    setPaymentModalOpen(true);
  }

  const handleConfirmRenew = (months: number, note: string) => {
    setRenewModalOpen(false);
    // Có thể chuyển luôn qua PaymentModal nếu muốn, tạm thời RenewModal cũ vẫn giữ lại tuỳ ý
  }

  return (
    <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden h-full w-full">
      <div className="w-full flex flex-col h-full">
        {/* Header Tabs with White Background and left flush alignment */}
        <div className="flex items-center bg-gray-50 border-b border-[#e6ebf1]">
          <button
            onClick={() => setActiveTab('current_plan')}
            className={`px-8 py-4 text-[14px] font-bold border-b-[2px] transition-colors ${
              activeTab === 'current_plan'
                ? 'border-[#3e79f7] text-[#3e79f7]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            GÓI DỊCH VỤ HIỆN TẠI
          </button>
                    <button
            onClick={() => setActiveTab('domain_config')}
            className={`px-8 py-4 text-[14px] font-bold border-b-[2px] transition-colors ${
              activeTab === 'domain_config'
                ? 'border-[#3e79f7] text-[#3e79f7]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            CẤU HÌNH DOMAIN
          </button>
          <button
            onClick={() => setActiveTab('order_history')}
            className={`px-8 py-4 text-[14px] font-bold border-b-[2px] transition-colors ${
              activeTab === 'order_history'
                ? 'border-[#3e79f7] text-[#3e79f7]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            LỊCH SỬ GIAO DỊCH
          </button>
        </div>

        {/* Tab Content Area (Gray Background) */}
        <div className="w-full flex-1 overflow-auto flex flex-col">
          {activeTab === 'current_plan' && (
            <div className="flex flex-col p-6 space-y-6">

              {/* Control Panel cho Dev (Prototype test) */}
              <div className="bg-gray-800 text-white rounded-[10px] p-4 shadow-md border border-gray-700 relative overflow-hidden shrink-0">
                <div className="flex items-center gap-2 mb-3 z-10 relative">
                  <Settings2 className="w-5 h-5 text-gray-400" />
                  <h4 className="font-extrabold text-sm tracking-wider text-gray-300 uppercase">Mock State Controller (Dev Only)</h4>
                </div>
                <div className="flex flex-wrap gap-2 relative z-10">
                  <button 
                    onClick={() => { setStatus('active'); setUsersCount(8); }}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${status === 'active' && usersCount === 8 ? 'bg-[#2dc56a] text-white shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                  >
                    Bình thường
                  </button>
                  <button 
                    onClick={() => { setStatus('expiring_7d'); setUsersCount(8); }}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${status === 'expiring_7d' ? 'bg-red-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                  >
                    Sắp hết hạn
                  </button>
                  <button 
                    onClick={() => setStatus('pending_downgrade')}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${status === 'pending_downgrade' ? 'bg-yellow-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                  >
                    Đang chờ hạ cấp
                  </button>
                </div>
              </div>
              
              <LocalSubscriptionAlert status={status} daysLeft={45} onRenew={handleOpenRenew} />

              {/* Current Plan Dashboard Card */}
              <div className="bg-white rounded-[10px] p-6 lg:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col lg:flex-row gap-8 items-start justify-between relative overflow-hidden">
                
                {/* Left Info */}
                <div className="flex flex-col w-full lg:w-[45%]">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="px-3 py-1 bg-[#f3e8ff] text-[#9333ea] font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                      Professional
                    </span>
                    <span className="px-3 py-1 bg-[#ffedd5] text-[#ea580c] font-bold text-[10px] rounded-full">
                      Hoạt động
                    </span>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-[32px] leading-none font-extrabold text-[#111827] mb-2 tracking-tight">
                      5.200.000đ
                    </div>
                    <div className="text-sm text-gray-500 font-medium">Thanh toán hàng năm</div>
                  </div>

                  <div className="flex flex-col gap-3 text-sm">
                    <div className="flex items-center">
                      <span className="text-gray-500 w-28">Ngày hết hạn</span>
                      <span className="font-bold text-gray-900">01/07/2025</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 w-28">Thời gian còn lại</span>
                      <span className="px-2.5 py-0.5 bg-[#ffedd5] text-[#ea580c] font-bold text-xs rounded-md">
                        Còn 45 ngày
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Progress Bars */}
                <div className="w-full lg:w-[55%] flex flex-col justify-center h-full pt-2 gap-y-6 border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-10">
                  
                  {/* Users */}
                  <div className="flex flex-col">
                    <div className="flex justify-between items-end mb-2.5">
                      <span className="font-extrabold text-gray-600 text-xs tracking-widest uppercase">Người dùng</span>
                      <span className="font-extrabold text-gray-900 text-sm leading-none">{usersCount}/{maxUsers}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-1.5">
                      <div className="h-full bg-[#c41414] rounded-full shadow-sm" style={{ width: `${(usersCount / maxUsers) * 100}%` }}></div>
                    </div>
                    <div className="text-[11px] text-gray-400 font-medium">Tăng giới hạn với +150k/user/tháng</div>
                  </div>

                  {/* Storage */}
                  <div className="flex flex-col">
                    <div className="flex justify-between items-end mb-2.5">
                      <span className="font-extrabold text-gray-600 text-xs tracking-widest uppercase">Dung lượng</span>
                      <div className="flex flex-col items-end leading-none">
                        <span className="font-extrabold text-gray-900 text-sm">12.5GB / 50GB</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-1.5">
                      <div className="h-full bg-[#10b981] w-[25%] rounded-full shadow-sm"></div>
                    </div>
                    <div className="text-[11px] text-gray-400 font-medium">Tối ưu hơn với tính năng nén file</div>
                  </div>

                  {/* Channels */}
                  <div className="flex flex-col">
                    <div className="flex justify-between items-end mb-2.5">
                      <span className="font-extrabold text-gray-600 text-xs tracking-widest uppercase">Kênh kết nối</span>
                      <span className="font-extrabold text-gray-900 text-sm leading-none">2/5</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-1.5">
                      <div className="h-full bg-[#f97316] w-[40%] rounded-full shadow-sm"></div>
                    </div>
                    <div className="text-[11px] text-gray-400 font-medium">Facebook, Zalo, Web Live Chat</div>
                  </div>

                </div>
              </div>

              {/* Pricing Cards */}
              <div className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
                  
                  {/* Starter */}
                  <div className="bg-white rounded-[10px] border border-[#e6ebf1] shadow-sm p-6 flex flex-col">
                    <div className="mb-5">
                      <h3 className="text-gray-400 font-bold text-xs tracking-wider uppercase mb-2">Starter</h3>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-extrabold text-gray-900 leading-none">49K</span>
                        <span className="text-[13px] font-medium text-gray-500 ml-1">/tháng</span>
                      </div>
                    </div>
                    <ul className="flex-1 space-y-3 mb-6">
                      {['Phân loại lead, nhãn, Kanban', 'Pipeline giai đoạn', 'Phân bổ lead thủ công', 'Hồ sơ khách hàng', 'Tạo đơn hàng, trả góp', 'Báo cáo cơ bản + xuất Excel/CSV', 'Thông báo cơ bản'].map((feat, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle2 className="w-4 h-4 text-[#0ea5e9] shrink-0 mr-2.5" />
                          <span className="text-[13px] text-gray-700 font-medium leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <button 
                      onClick={() => handleOpenDowngrade()}
                      className="w-full py-2.5 rounded-[10px] border-2 border-[#e6ebf1] text-gray-900 font-bold text-[13px] hover:bg-gray-50 transition-colors mt-auto"
                    >
                      Hạ cấp
                    </button>
                  </div>

                  {/* Professional */}
                  <div className="bg-white rounded-[10px] border-[3px] border-[#3e79f7] shadow-lg p-6 flex flex-col relative transform md:-translate-y-3">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#3e79f7] text-white px-3 py-1 rounded-full text-[10px] font-extrabold shadow-sm whitespace-nowrap">
                      PHỔ BIẾN NHẤT
                    </div>
                    <div className="mb-5 mt-1">
                      <h3 className="text-[#3e79f7] font-bold text-xs tracking-wider uppercase mb-2">Professional</h3>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-extrabold text-gray-900 leading-none">89K</span>
                        <span className="text-[13px] font-medium text-gray-500 ml-1">/tháng</span>
                      </div>
                    </div>
                    <ul className="flex-1 space-y-3 mb-6">
                      {['Tất cả tính năng Starter', 'Phân bổ lead tự động + gắn nhãn tự động', 'Thông báo nâng cao', 'Combo, voucher, khuyến mãi', 'Báo cáo nâng cao', 'Email marketing', 'Quản lý chat (3 tài khoản)'].map((feat, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle2 className="w-4 h-4 text-[#3e79f7] shrink-0 mr-2.5" />
                          <span className="text-[13px] text-gray-800 font-bold leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <button disabled className="w-full py-2.5 rounded-[10px] bg-gray-100 text-gray-400 font-bold text-[13px] cursor-not-allowed mt-auto">
                      Đang dùng
                    </button>
                  </div>

                  {/* Enterprise */}
                  <div className="bg-white rounded-[10px] border border-[#e6ebf1] shadow-sm p-6 flex flex-col">
                    <div className="mb-5">
                      <h3 className="text-gray-400 font-bold text-xs tracking-wider uppercase mb-2">Enterprise</h3>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-extrabold text-gray-900 leading-none">159K</span>
                        <span className="text-[13px] font-medium text-gray-500 ml-1">/tháng</span>
                      </div>
                    </div>
                    <ul className="flex-1 space-y-3 mb-6">
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-[#0ea5e9] shrink-0 mr-2.5" />
                        <span className="text-[13px] text-gray-700 font-medium leading-tight">Tất cả tính năng Professional</span>
                      </li>
                      <div className="pt-2 pb-1">
                        <span className="text-[11px] font-bold text-[#0ea5e9]">+ Thêm trong gói này:</span>
                      </div>
                      {['Gợi ý upsale', 'Lịch sử chăm sóc', 'Quản lý chat (5 tài khoản)'].map((feat, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle2 className="w-4 h-4 text-[#0ea5e9] shrink-0 mr-2.5" />
                          <span className="text-[13px] text-gray-700 font-medium leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <button 
                      onClick={() => handleOpenUpgrade()}
                      className="w-full py-2.5 rounded-[10px] bg-[#3e79f7] hover:bg-[#3264d0] text-white font-bold text-[13px] transition-colors shadow-md mt-auto"
                    >
                      Nâng cấp
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}
          {activeTab === 'order_history' && (
            <div className="p-6">
              <div className="bg-white rounded-[10px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100">
                <h3 className="text-lg font-bold text-[#111827] mb-6">Lịch sử giao dịch</h3>
                <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 border-b border-[#e6ebf1] uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-bold">Mã đơn hàng</th>
                      <th className="px-6 py-4 font-bold">Ngày thanh toán</th>
                      <th className="px-6 py-4 font-bold">Gói dịch vụ</th>
                      <th className="px-6 py-4 font-bold">Số tiền</th>
                      <th className="px-6 py-4 font-bold">Trạng thái</th>
                      <th className="px-6 py-4 font-bold text-right">Chứng từ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockOrders.map((order, i) => (
                      <tr key={i} className="bg-white border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-[#3e79f7] whitespace-nowrap">{order.id}</td>
                        <td className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">{order.date}</td>
                        <td className="px-6 py-4 text-gray-900 font-bold whitespace-nowrap">{order.plan}</td>
                        <td className="px-6 py-4 text-gray-900 font-extrabold whitespace-nowrap">{order.amount.toLocaleString('vi-VN')}đ</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 bg-[#e1eed8] text-[#198754] text-[10px] font-bold rounded-full uppercase tracking-wider">
                            Thành công
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button className="text-[#3e79f7] hover:text-[#3e79f7] inline-flex items-center justify-end gap-2 font-bold">
                            <Receipt className="w-4 h-4" /> HD
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            </div>
          )}
          {activeTab === 'domain_config' && (
            <div className="p-6">
              <div className="bg-white rounded-[10px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 max-w-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-5 h-5 text-[#3e79f7]" />
                  <h3 className="text-lg font-bold text-[#111827]">Tên miền tùy chỉnh</h3>
                </div>
                <p className="text-sm text-gray-500 mb-6">Kết nối tên miền riêng để truy cập hệ thống CRM qua địa chỉ của bạn.</p>

                {activeDomain && domainStatus === 'success' && (
                  <div className="mb-6 bg-green-50 border border-green-200 rounded-[10px] p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-green-800">Domain đang hoạt động</p>
                      <p className="text-sm text-green-700 font-medium mt-0.5">{activeDomain}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Active</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={domainInput}
                    onChange={(e) => { setDomainInput(e.target.value); setDomainStatus('idle'); }}
                    placeholder="app.tencongty.com"
                    className="flex-1 px-4 py-2.5 border border-[#e6ebf1] rounded-[10px] text-sm font-medium text-gray-900 focus:outline-none focus:border-[#3e79f7] focus:ring-1 focus:ring-[#3e79f7] placeholder:text-gray-400"
                  />
                  <button
                    onClick={handleDomainSubmit}
                    disabled={domainLoading || !domainInput.trim()}
                    className="px-6 py-2.5 bg-[#3e79f7] hover:bg-[#3264d0] text-white font-bold text-sm rounded-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                  >
                    {domainLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {domainLoading ? 'Đang kiểm tra...' : 'Cập nhật'}
                  </button>
                </div>

                {/* Status Messages */}
                {domainStatus !== 'idle' && (
                  <div className={`mt-4 rounded-[10px] p-4 text-sm font-medium flex items-start gap-2.5 ${
                    domainStatus === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
                    domainStatus === 'dns_propagating' ? 'bg-blue-50 border border-blue-200 text-blue-800' :
                    domainStatus === 'subdomain_only' || domainStatus === 'dns_not_found' ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' :
                    'bg-red-50 border border-red-200 text-red-800'
                  }`}>
                    {domainStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />}
                    {domainStatus === 'dns_propagating' && <Loader2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 animate-spin" />}
                    {(domainStatus === 'subdomain_only' || domainStatus === 'dns_not_found') && <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />}
                    {(domainStatus === 'invalid' || domainStatus === 'duplicate' || domainStatus === 'ssl_error') && <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
                    <span>
                      {domainStatus === 'invalid' && 'Tên miền không hợp lệ. Vui lòng nhập dạng subdomain, ví dụ: app.tencongty.com'}
                      {domainStatus === 'duplicate' && 'Tên miền này đã được kết nối với một website khác.'}
                      {domainStatus === 'subdomain_only' && 'Hiện tại hệ thống chỉ hỗ trợ subdomain, ví dụ: app.tencongty.com'}
                      {domainStatus === 'dns_not_found' && 'Tên miền chưa trỏ về hệ thống. Vui lòng kiểm tra lại bản ghi CNAME.'}
                      {domainStatus === 'dns_propagating' && 'DNS có thể mất vài phút để cập nhật. Hệ thống sẽ tự kiểm tra lại.'}
                      {domainStatus === 'ssl_error' && 'Không thể cấp SSL cho tên miền này. Vui lòng kiểm tra DNS hoặc thử lại sau.'}
                      {domainStatus === 'success' && 'Tên miền đã được kích hoạt thành công.'}
                    </span>
                  </div>
                )}

                {/* CNAME Instructions */}
                <div className="mt-6 bg-gray-50 rounded-[10px] p-4 border border-[#e6ebf1]">
                  <h4 className="text-sm font-bold text-gray-700 mb-2">Hướng dẫn cấu hình DNS</h4>
                  <p className="text-xs text-gray-500 mb-3">Thêm bản ghi CNAME tại nhà cung cấp tên miền của bạn:</p>
                  <div className="bg-white rounded-lg border border-[#e6ebf1] overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 border-b border-[#e6ebf1]">
                        <tr>
                          <th className="px-4 py-2 text-left font-bold text-gray-500 uppercase">Loại</th>
                          <th className="px-4 py-2 text-left font-bold text-gray-500 uppercase">Host</th>
                          <th className="px-4 py-2 text-left font-bold text-gray-500 uppercase">Trỏ đến</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-4 py-2.5 font-bold text-gray-800">CNAME</td>
                          <td className="px-4 py-2.5 text-gray-600 font-medium">app (hoặc subdomain bạn chọn)</td>
                          <td className="px-4 py-2.5 text-[#3e79f7] font-bold select-all">proxy.vilead.vn</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <RenewModal
        isOpen={isRenewModalOpen}
        onClose={() => setRenewModalOpen(false)}
        onConfirm={handleConfirmRenew}
        currentPlan="Professional"
        orderId="HD-00018-RENEW"
        expiryDate="01/07/2026"
      />

    </div>
  );
};

export default BillingManagement;
