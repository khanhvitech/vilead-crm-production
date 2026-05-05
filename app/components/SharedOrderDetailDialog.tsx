'use client'

import { useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Info,
  Paperclip,
  Receipt,
  X
} from 'lucide-react'

export interface SharedOrderItem {
  id: number
  productName: string
  productPackage: string
  quantity: number
  price: number
  total: number
  paymentStatus: 'paid' | 'unpaid' | 'partial'
}

export interface SharedOrderInvoice {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  uploadedAt: string
  thumbnailUrl?: string
}

export interface SharedOrderNote {
  id: string
  content: string
  createdAt: string
  createdBy: string
}

export interface SharedOrderDetailData {
  id: number
  orderNumber: string
  status: string
  paymentMethod: string
  total: number
  paid: number
  debt: number
  dueDate?: string
  label?: string
  subtotal?: number
  discount?: number
  vat?: number
  items?: SharedOrderItem[]
  invoices?: SharedOrderInvoice[]
  notes?: SharedOrderNote[]
}

export const sortByNewest = <T extends { uploadedAt?: string; createdAt?: string }>(items: T[]) => {
  return [...items].sort((a, b) => {
    const timeA = new Date(a.uploadedAt || a.createdAt || 0).getTime()
    const timeB = new Date(b.uploadedAt || b.createdAt || 0).getTime()
    return timeB - timeA
  })
}

export const getOrderInvoices = (order?: SharedOrderDetailData | null) => sortByNewest(order?.invoices || [])
export const getOrderNotes = (order?: SharedOrderDetailData | null) => sortByNewest(order?.notes || [])
export const isImageInvoice = (invoice: SharedOrderInvoice) => invoice.fileType.startsWith('image/')

export const getInvoicePreview = (order?: SharedOrderDetailData | null) => {
  const invoices = getOrderInvoices(order)
  return invoices.find(isImageInvoice) || invoices[0] || null
}

interface InvoiceViewerDialogProps {
  isOpen: boolean
  onClose: () => void
  invoices: SharedOrderInvoice[]
  initialIndex?: number
}

export function InvoiceViewerDialog({ isOpen, onClose, invoices, initialIndex = 0 }: InvoiceViewerDialogProps) {
  const imageInvoices = invoices.filter(isImageInvoice)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
    }
  }, [initialIndex, isOpen])

  if (!isOpen || imageInvoices.length === 0) return null

  const activeInvoice = imageInvoices[currentIndex]

  const goPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? imageInvoices.length - 1 : prev - 1))
  }

  const goNext = () => {
    setCurrentIndex((prev) => (prev === imageInvoices.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-[14px] w-full max-w-5xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e6ebf1]">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Hóa đơn đơn hàng</h3>
            <p className="text-sm text-gray-500">
              {currentIndex + 1}/{imageInvoices.length} • {activeInvoice.fileName}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 bg-[#f8fafc] p-4 md:p-6">
          <div className="relative h-full min-h-[320px] rounded-[14px] border border-[#e6ebf1] bg-white overflow-hidden flex items-center justify-center">
            {activeInvoice.thumbnailUrl ? (
              <img
                src={activeInvoice.thumbnailUrl}
                alt={activeInvoice.fileName}
                className="w-full h-full object-contain bg-[#f8fafc]"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                <ImageIcon className="w-14 h-14" />
                <div className="text-center">
                  <p className="font-medium text-gray-700">{activeInvoice.fileName}</p>
                  <p className="text-sm">Không có ảnh preview, dùng file gốc khi tích hợp backend</p>
                </div>
              </div>
            )}

            {imageInvoices.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border border-[#e6ebf1] shadow hover:bg-white flex items-center justify-center"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border border-[#e6ebf1] shadow hover:bg-white flex items-center justify-center"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </>
            )}
          </div>
        </div>

        {imageInvoices.length > 1 && (
          <div className="px-5 py-4 border-t border-[#e6ebf1] bg-white">
            <div className="flex gap-3 overflow-x-auto">
              {imageInvoices.map((invoice, index) => (
                <button
                  key={invoice.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative w-20 h-20 shrink-0 rounded-[12px] border overflow-hidden ${
                    currentIndex === index ? 'border-[#3e79f7] ring-2 ring-blue-100' : 'border-[#e6ebf1]'
                  }`}
                >
                  {invoice.thumbnailUrl ? (
                    <img src={invoice.thumbnailUrl} alt={invoice.fileName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#eef4ff] flex items-center justify-center">
                      <ImageIcon className="w-7 h-7 text-[#3e79f7]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface OrderDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  order: SharedOrderDetailData | null
}

export function OrderDetailDialog({ isOpen, onClose, order }: OrderDetailDialogProps) {
  const [showInvoiceViewer, setShowInvoiceViewer] = useState(false)
  const [invoiceViewerIndex, setInvoiceViewerIndex] = useState(0)

  if (!isOpen || !order) return null

  const formatCurrency = (amount: number) => amount.toLocaleString('vi-VN') + ' đ'
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'unpaid': return 'bg-red-100 text-red-800'
      case 'partial': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Đã thanh toán'
      case 'unpaid': return 'Chưa thanh toán'
      case 'partial': return 'Thanh toán 1 phần'
      default: return status
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý'
      case 'confirmed': return 'Đã xác nhận'
      case 'completed': return 'Hoàn thành'
      case 'cancelled': return 'Đã hủy'
      default: return status
    }
  }

  const orderItems = order.items || []
  const orderInvoices = getOrderInvoices(order)
  const imageInvoices = orderInvoices.filter(isImageInvoice)
  const fileInvoices = orderInvoices.filter((invoice) => !isImageInvoice(invoice))
  const orderNotes = getOrderNotes(order)
  const subtotal = order.subtotal ?? orderItems.reduce((sum, item) => sum + item.total, 0)
  const discount = order.discount ?? 0
  const vat = order.vat ?? Math.round(subtotal * 0.1)
  const grandTotal = order.total || (subtotal - discount + vat)

  const openInvoiceViewer = (index: number) => {
    setInvoiceViewerIndex(index)
    setShowInvoiceViewer(true)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
        <div className="bg-white rounded-[10px] w-full max-w-5xl mx-4 shadow-2xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-[#e6ebf1]">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Chi tiết đơn hàng - {order.orderNumber}</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 md:p-5 overflow-y-auto flex-1 space-y-5 bg-[#fafcff]">
            <div className={`grid grid-cols-2 md:grid-cols-4 ${order.label ? 'xl:grid-cols-7' : 'xl:grid-cols-6'} gap-3`}>
              <div className="rounded-[12px] border border-[#e6ebf1] bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Mã đơn</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{order.orderNumber}</p>
              </div>
              <div className="rounded-[12px] border border-[#e6ebf1] bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Trạng thái</p>
                <div className="mt-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusColor(order.status)}`}>
                    {getOrderStatusText(order.status)}
                  </span>
                </div>
              </div>
              {order.label && (
                <div className="rounded-[12px] border border-[#e6ebf1] bg-white p-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Nhãn</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{order.label}</p>
                </div>
              )}
              <div className="rounded-[12px] border border-[#e6ebf1] bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Thanh toán</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{order.paymentMethod}</p>
              </div>
              <div className="rounded-[12px] border border-[#e6ebf1] bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Thời hạn</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {order.dueDate ? new Date(order.dueDate).toLocaleDateString('vi-VN') : '-'}
                </p>
              </div>
              <div className="rounded-[12px] border border-[#e6ebf1] bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Tổng tiền</p>
                <p className="mt-1 text-sm font-semibold text-blue-600">{formatCurrency(order.total)}</p>
              </div>
              <div className="rounded-[12px] border border-[#e6ebf1] bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Đã TT / Dư nợ</p>
                <p className="mt-1 text-sm font-medium text-green-600">{formatCurrency(order.paid)}</p>
                <p className="text-sm font-medium text-red-600">{formatCurrency(order.debt)}</p>
              </div>
            </div>

            <div className="rounded-[14px] border border-[#e6ebf1] bg-white p-4 space-y-4">
              <div>
                <h4 className="text-base font-semibold text-gray-900">Chi tiết sản phẩm</h4>
                <p className="text-sm text-gray-500">Thông tin đơn và tổng tiền được gom về cùng một màn</p>
              </div>

              <div className="overflow-x-auto border border-[#e6ebf1] rounded-[10px]">
                <table className="w-full">
                  <thead className="bg-[#fafafb]">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase border-r border-[#e6ebf1]">Tên SP</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase border-r border-[#e6ebf1]">Gói SP</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase border-r border-[#e6ebf1]">Số lượng</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase border-r border-[#e6ebf1]">Giá</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase border-r border-[#e6ebf1]">Tổng tiền</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase">Trạng thái TT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orderItems.map((item) => (
                      <tr key={item.id} className="hover:bg-[#f0f7ff]">
                        <td className="px-3 py-2 border-r border-[#e6ebf1] text-sm text-gray-900">{item.productName}</td>
                        <td className="px-3 py-2 border-r border-[#e6ebf1] text-sm text-gray-700">{item.productPackage}</td>
                        <td className="px-3 py-2 border-r border-[#e6ebf1] text-sm text-gray-700 text-center">{item.quantity}</td>
                        <td className="px-3 py-2 border-r border-[#e6ebf1] text-sm text-gray-900 text-right">{formatCurrency(item.price)}</td>
                        <td className="px-3 py-2 border-r border-[#e6ebf1] text-sm text-blue-600 text-right font-medium">{formatCurrency(item.total)}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(item.paymentStatus)}`}>
                            {getPaymentStatusText(item.paymentStatus)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-[12px] bg-[#f8fbff] border border-[#d9e7ff] p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tạm tính</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-600">Giảm giá</span>
                    <span className="text-sm font-medium text-green-600">-{formatCurrency(discount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Thuế VAT</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(vat)}</span>
                  </div>
                </div>
                <div className="rounded-[12px] bg-[#eff6ff] border border-[#dbeafe] p-4 flex flex-col justify-center">
                  <span className="text-sm text-gray-600">Tổng cộng</span>
                  <span className="mt-1 text-2xl font-bold text-blue-600">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>

            <div className="grid xl:grid-cols-2 gap-5">
              <div className="rounded-[14px] border border-[#e6ebf1] bg-white p-4 space-y-4">
                <div>
                  <h4 className="text-base font-semibold text-gray-900">Hóa đơn</h4>
                  <p className="text-sm text-gray-500">{orderInvoices.length} tệp đính kèm</p>
                </div>

                {imageInvoices.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {imageInvoices.map((invoice, index) => (
                      <button
                        key={invoice.id}
                        onClick={() => openInvoiceViewer(index)}
                        className="group border border-[#e6ebf1] rounded-[12px] overflow-hidden bg-[#f8fafc] hover:border-[#3e79f7] transition-colors text-left"
                      >
                        <div className="aspect-[4/3] bg-[#eef4ff] flex items-center justify-center overflow-hidden">
                          {invoice.thumbnailUrl ? (
                            <img src={invoice.thumbnailUrl} alt={invoice.fileName} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-[#3e79f7]" />
                          )}
                        </div>
                        <div className="p-2.5">
                          <p className="text-sm font-medium text-gray-900 truncate">{invoice.fileName}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(invoice.uploadedAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[12px] border border-dashed border-[#d7dfeb] bg-[#f8fafc] p-6 text-center text-sm text-gray-500">
                    Chưa có ảnh hóa đơn
                  </div>
                )}

                {fileInvoices.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Tài liệu khác</p>
                    {fileInvoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between gap-3 rounded-[12px] border border-[#e6ebf1] px-3 py-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-[10px] bg-gray-100 flex items-center justify-center shrink-0">
                            <Paperclip className="w-4 h-4 text-gray-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{invoice.fileName}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(invoice.uploadedAt).toLocaleDateString('vi-VN')} • {formatFileSize(invoice.fileSize)}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 uppercase">{invoice.fileType.split('/').pop()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-[14px] border border-[#e6ebf1] bg-white p-4 space-y-4">
                <div>
                  <h4 className="text-base font-semibold text-gray-900">Ghi chú</h4>
                  <p className="text-sm text-gray-500">{orderNotes.length} ghi chú</p>
                </div>

                {orderNotes.length > 0 ? (
                  <div className="space-y-3">
                    {orderNotes.map((note) => (
                      <div key={note.id} className="rounded-[12px] border border-[#e6ebf1] bg-[#fafcff] p-3">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{note.content}</p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <span>{note.createdBy}</span>
                          <span>•</span>
                          <span>{new Date(note.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[12px] border border-dashed border-[#d7dfeb] bg-[#f8fafc] p-6 text-center text-sm text-gray-500">
                    Chưa có ghi chú nào
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 p-4 border-t border-[#e6ebf1] bg-gray-50 rounded-b-xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-[10px]"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      <InvoiceViewerDialog
        isOpen={showInvoiceViewer}
        onClose={() => setShowInvoiceViewer(false)}
        invoices={imageInvoices}
        initialIndex={invoiceViewerIndex}
      />
    </>
  )
}
