const fs = require('fs');

const content = \`"use client";

import React, { useState } from 'react';
import { CreditCard, CheckCircle2, AlertTriangle, Download, Receipt } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'current_plan' | 'order_history'>('current_plan');

  return (
    <div className="flex-1 bg-white overflow-auto h-full flex flex-col p-8">
      <div className="max-w-[1200px] w-full mx-auto">
        
        {/* Tabs Headers */}
        <div className="flex items-center border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('current_plan')}
            className={\`px-2 py-3 text-[14px] font-semibold border-b-[3px] transition-colors mr-8 \${
              activeTab === 'current_plan'
                ? 'border-[#3e79f7] text-[#3e79f7]'
                : 'border-transparent text-[#455560] hover:text-[#2a3042]'
            }\`}
          >
            Gói dịch vụ hiện tại
          </button>
          <button
            onClick={() => setActiveTab('order_history')}
            className={\`px-2 py-3 text-[14px] font-semibold border-b-[3px] transition-colors \${
              activeTab === 'order_history'
                ? 'border-[#3e79f7] text-[#3e79f7]'
                : 'border-transparent text-[#455560] hover:text-[#2a3042]'
            }\`}
          >
            Lịch sử giao dịch
          </button>
        </div>

        {/* Tab Content */}
        <div className="w-full">
          {activeTab === 'current_plan' && (
            <div className="space-y-12">
              
              {/* Expiry Alert (Hidden if user didn't request it, but it was in first mockup so I left it out, to make it perfectly clean) */}
              
              {/* Current Plan Dashboard Card */}
              <div className="bg-white rounded-[24px] p-10 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col lg:flex-row gap-10 items-start justify-between">
                
                {/* Left Info */}
                <div className="flex flex-col w-full lg:w-[45%]">
                  <div className="flex items-center gap-3 mb-8">
                    <span className="px-4 py-1.5 bg-[#f3e8ff] text-[#7e22ce] font-extrabold text-[11px] rounded-full uppercase tracking-wider">
                      Professional
                    </span>
                    <span className="px-4 py-1.5 bg-[#ffedd5] text-[#c2410c] font-bold text-[11px] rounded-full">
                      Hoạt động
                    </span>
                  </div>
                  
                  <div className="mb-8">
                    <div className="text-[42px] leading-none font-extrabold text-[#111827] mb-2 tracking-tight">
                      5.200.000đ
                    </div>
                    <div className="text-[15px] text-gray-500 font-medium">Thanh toán hàng năm</div>
                  </div>

                  <div className="flex flex-col gap-4 text-[15px]">
                    <div className="flex items-center">
                      <span className="text-gray-500 w-32">Ngày hết hạn</span>
                      <span className="font-bold text-gray-900">01/07/2025</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 w-32">Thời gian còn lại</span>
                      <span className="px-3 py-1 bg-[#ffedd5] text-[#c2410c] font-bold text-[13px] rounded-md border border-[#fed7aa]/50">
                        Còn 45 ngày
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Progress Bars */}
                <div className="w-full lg:w-[50%] grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-8 pt-4">
                  
                  {/* Users */}
                  <div className="flex flex-col col-span-1 md:col-span-2 xl:col-span-1">
                    <div className="flex justify-between items-end mb-3">
                      <span className="font-extrabold text-gray-600 text-[15px] tracking-wide uppercase">Người dùng</span>
                      <span className="font-extrabold text-gray-900 text-lg leading-none">8/10</span>
                    </div>
                    <div className="h-3 w-full bg-gray-200/80 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-[#d97706] w-[80%] rounded-full"></div>
                    </div>
                    <div className="text-[12px] text-gray-400 font-medium italic mt-1">Tăng giới hạn với +150k/user/tháng</div>
                  </div>

                  {/* Storage */}
                  <div className="flex flex-col col-span-1 md:col-span-2 xl:col-span-1">
                    <div className="flex justify-between items-end mb-3">
                      <span className="font-extrabold text-gray-600 text-[15px] tracking-wide uppercase">Dung lượng</span>
                      <div className="flex flex-col items-end leading-none">
                        <span className="font-extrabold text-gray-900 text-[15px]">12.5GB /</span>
                        <span className="font-extrabold text-gray-900 text-lg">50GB</span>
                      </div>
                    </div>
                    <div className="h-3 w-full bg-gray-200/80 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-[#10b981] w-[25%] rounded-full"></div>
                    </div>
                    <div className="text-[12px] text-gray-400 font-medium italic mt-1">Tối ưu hơn với tính năng nén file</div>
                  </div>

                  {/* Channels */}
                  <div className="flex flex-col col-span-1 md:col-span-2 xl:col-span-1">
                    <div className="flex justify-between items-end mb-3">
                      <span className="font-extrabold text-gray-600 text-[15px] tracking-wide uppercase">Kênh kết nối</span>
                      <span className="font-extrabold text-gray-900 text-lg leading-none">2/5</span>
                    </div>
                    <div className="h-3 w-full bg-gray-200/80 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-[#10b981] w-[40%] rounded-full"></div>
                    </div>
                    <div className="text-[12px] text-gray-400 font-medium italic mt-1">Facebook, Zalo, Web Live Chat</div>
                  </div>

                </div>
              </div>

              {/* Pricing Cards */}
              <div className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-6">
                  
                  {/* Starter */}
                  <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm p-8 flex flex-col h-full mt-4">
                    <div className="mb-8">
                      <h3 className="text-gray-400 font-bold text-sm tracking-widest uppercase mb-4">Starter</h3>
                      <div className="flex items-end gap-1 text-[#111827]">
                        <span className="text-[44px] font-extrabold leading-none tracking-tight">49K</span>
                        <span className="text-[15px] font-semibold text-gray-500 mb-1.5">/tháng</span>
                      </div>
                    </div>
                    
                    <ul className="flex-1 space-y-5 mb-10">
                      {['Phân loại lead, nhãn, Kanban', 'Pipeline giai đoạn', 'Phân bổ lead thủ công', 'Hồ sơ khách hàng', 'Tạo đơn hàng, trả góp', 'Báo cáo cơ bản + xuất Excel/CSV', 'Thông báo cơ bản'].map((feat, idx) => (
                        <li key={idx} className="flex items-center">
                          <CheckCircle2 className="w-[18px] h-[18px] text-[#0ea5e9] shrink-0 mr-3" />
                          <span className="text-[15px] text-[#334155] font-medium">{feat}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button className="w-full py-3.5 rounded-xl border border-gray-300 text-[#0f172a] font-bold text-[15px] hover:bg-gray-50 transition-colors mt-auto">
                      Bắt đầu ngay
                    </button>
                  </div>

                  {/* Professional */}
                  <div className="bg-white rounded-[24px] border-[4px] border-[#f97316] shadow-[0_12px_40px_-12px_rgba(249,115,22,0.3)] p-8 flex flex-col relative h-[calc(100%+32px)] -mt-4 z-10">
                    <div className="absolute -top-[16px] left-1/2 -translate-x-1/2 bg-[#f97316] text-white px-6 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase whitespace-nowrap shadow-md">
                      Phổ biến nhất
                    </div>
                    
                    <div className="mb-8 mt-2">
                      <h3 className="text-[#ea580c] font-bold text-sm tracking-widest uppercase mb-4">Professional</h3>
                      <div className="flex items-end gap-1 text-[#111827]">
                        <span className="text-[44px] font-extrabold leading-none tracking-tight">89K</span>
                        <span className="text-[15px] font-semibold text-gray-500 mb-1.5">/tháng</span>
                      </div>
                    </div>
                    
                    <div className="h-px w-full bg-gray-200 mb-6 hidden"></div>
                    
                    <ul className="flex-1 space-y-5 mb-10">
                      {['Tất cả tính năng Starter', 'Phân bổ lead tự động + gắn nhãn tự động', 'Thông báo nâng cao', 'Combo, voucher, khuyến mãi', 'Báo cáo nâng cao', 'Email marketing', 'Quản lý chat (3 tài khoản)'].map((feat, idx) => (
                        <li key={idx} className="flex items-center">
                          <CheckCircle2 className="w-[18px] h-[18px] text-[#f97316] shrink-0 mr-3" />
                          <span className="text-[15px] text-[#334155] font-medium">{feat}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button className="w-full py-3.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-[15px] transition-colors shadow-md mt-auto">
                      Nâng cấp ngay
                    </button>
                  </div>

                  {/* Enterprise */}
                  <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm p-8 flex flex-col h-full mt-4">
                    <div className="mb-8">
                      <h3 className="text-gray-400 font-bold text-sm tracking-widest uppercase mb-4">Enterprise</h3>
                      <div className="flex items-end gap-1 text-[#111827]">
                        <span className="text-[44px] font-extrabold leading-none tracking-tight">159K</span>
                        <span className="text-[15px] font-semibold text-gray-500 mb-1.5">/tháng</span>
                      </div>
                    </div>
                    
                    <ul className="flex-1 space-y-5 mb-10">
                      <li className="flex items-center">
                        <CheckCircle2 className="w-[18px] h-[18px] text-[#0ea5e9] shrink-0 mr-3" />
                        <span className="text-[15px] text-[#334155] font-medium">Tất cả tính năng Professional</span>
                      </li>
                      
                      <div className="pt-6 pb-2">
                        <span className="text-[13px] font-bold text-[#0ea5e9]">+ Thêm trong gói này:</span>
                      </div>
                      
                      {['Gợi ý upsale', 'Lịch sử chăm sóc', 'Quản lý chat (5 tài khoản)'].map((feat, idx) => (
                        <li key={idx} className="flex items-center">
                          <CheckCircle2 className="w-[18px] h-[18px] text-[#0ea5e9] shrink-0 mr-3" />
                          <span className="text-[15px] text-[#334155] font-medium">{feat}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button className="w-full py-3.5 rounded-xl border border-gray-300 text-[#0f172a] font-bold text-[15px] hover:bg-gray-50 transition-colors mt-auto">
                      Nhận tư vấn
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}
          {activeTab === 'order_history' && (
            <div className="bg-white rounded-[24px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100">
              <h3 className="text-xl font-bold text-[#111827] mb-6">Lịch sử giao dịch</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[13px] text-gray-500 border-b border-gray-200 uppercase tracking-wider">
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
                        <td className="px-6 py-5 font-bold text-[#3e79f7] whitespace-nowrap">{order.id}</td>
                        <td className="px-6 py-5 text-gray-600 font-medium whitespace-nowrap">{order.date}</td>
                        <td className="px-6 py-5 text-gray-900 font-bold whitespace-nowrap">{order.plan}</td>
                        <td className="px-6 py-5 text-gray-900 font-extrabold whitespace-nowrap">{order.amount.toLocaleString('vi-VN')}đ</td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="px-3 py-1.5 bg-[#e1eed8] text-[#198754] text-[11px] font-bold rounded-full uppercase tracking-wider">
                            Thành công
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right whitespace-nowrap">
                          <button className="text-[#3e79f7] hover:text-blue-700 inline-flex items-center justify-end gap-2 font-bold">
                            <Receipt className="w-4 h-4" /> HD
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingManagement;
\`;

fs.writeFileSync('app/components/settings/billing/BillingManagement.tsx', content, 'utf8');
console.log('UI written!');
