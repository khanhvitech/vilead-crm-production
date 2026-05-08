'use client'

import { Copy } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { MktReportsController } from './useMktReports'

export default function AddMachineDialog({ controller }: { controller: MktReportsController }) {
  const {
    showAddMachineDialog,
    setShowAddMachineDialog,
    connectionCode,
    copyConnectionCode,
  } = controller

  return (
    <Dialog open={showAddMachineDialog} onOpenChange={setShowAddMachineDialog}>
      <DialogContent className="max-w-lg p-0">
        <div className="space-y-5 p-6">
          <div>
            <h2 className="text-[28px] font-semibold text-[#1a3353]">Thêm máy mới</h2>
            <p className="mt-3 text-base leading-7 text-[#455560]">
              Giao mã bên dưới cho nhân viên. Họ nhập mã này khi cài đặt MKT Sync Agent - chỉ cần làm 1 lần.
            </p>
          </div>

          <div className="rounded-[10px] border border-[#e6ebf1] bg-[#fafbfc] p-4">
            <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#72849a]">Mã kết nối</div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-[30px] font-bold tracking-[0.08em] text-[#3e79f7]">{connectionCode}</div>
              <Button variant="outline" onClick={() => void copyConnectionCode()}>
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
          </div>

          <div className="rounded-[10px] border border-[#cfe3ff] bg-[#eef5ff] p-4">
            <div className="mb-2 text-sm font-semibold text-[#1a3353]">Hướng dẫn:</div>
            <ol className="space-y-1 text-sm text-[#455560]">
              <li>1. Nhân viên tải và cài MKT Sync Agent</li>
              <li>2. Mở ứng dụng rồi chọn &quot;Kết nối CRM&quot;</li>
              <li>3. Nhập mã trên rồi xác nhận</li>
              <li>4. Máy sẽ xuất hiện trong danh sách sau khoảng 1 phút</li>
            </ol>
          </div>

          <div className="rounded-[10px] border border-[#ffe394] bg-[#fff8db] p-4">
            <div className="mb-2 text-sm font-semibold text-[#1a3353]">Lưu ý quan trọng</div>
            <ul className="space-y-1 text-sm text-[#455560]">
              <li>Mỗi mã kết nối chỉ dùng 1 lần cho 1 máy. Nếu cần thêm máy mới, tạo mã mới.</li>
              <li>Các phần mềm MKT cần được cài riêng trên máy rồi mới chỉ kết nối vào CRM để đồng bộ đủ dữ liệu.</li>
              <li>Mã có hiệu lực trong 24 giờ.</li>
              <li>Không chia sẻ mã ra ngoài nhóm - máy lạ kết nối vào sẽ đồng bộ dữ liệu MKT của công ty.</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
