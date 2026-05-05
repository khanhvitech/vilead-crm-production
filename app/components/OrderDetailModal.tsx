'use client'

import {
  OrderDetailDialog,
  type SharedOrderDetailData,
  type SharedOrderInvoice,
  type SharedOrderItem,
  type SharedOrderNote
} from './SharedOrderDetailDialog'

interface Order {
  id: number
  orderNumber: string
  items: any[]
  subtotal: number
  discount: number
  tax: number
  total: number
  status: string
  paymentStatus: string
  paymentMethod: string
  totalPaid?: number
  remainingDebt?: number
  notes: any[]
  invoices: any[]
  tags?: string[]
  deadline?: string
}

interface OrderDetailModalProps {
  isOpen: boolean
  onClose: () => void
  order: Order | null
}

const mapPaymentMethod = (paymentMethod: string) => {
  switch (paymentMethod) {
    case 'cash': return 'Ti\u1ec1n m\u1eb7t'
    case 'transfer': return 'Chuy\u1ec3n kho\u1ea3n'
    case 'card': return 'Th\u1ebb'
    case 'installment': return 'Tr\u1ea3 g\u00f3p'
    case 'momo': return 'MoMo'
    default: return paymentMethod || '-'
  }
}

const mapOrderStatus = (status: string) => {
  switch (status) {
    case 'completed': return 'completed'
    case 'cancelled':
    case 'refunded':
      return 'cancelled'
    case 'confirmed':
    case 'processing':
      return 'confirmed'
    case 'draft':
    case 'pending':
    default:
      return 'pending'
  }
}

const mapOrderItemPaymentStatus = (paymentStatus: string): SharedOrderItem['paymentStatus'] => {
  switch (paymentStatus) {
    case 'paid': return 'paid'
    case 'partial': return 'partial'
    default: return 'unpaid'
  }
}

const normalizeOrder = (order: Order): SharedOrderDetailData => {
  const items: SharedOrderItem[] = Array.isArray(order.items)
    ? order.items.map((item: any, index: number) => ({
        id: Number(item.id) || index + 1,
        productName: item.product?.name || item.productName || `S\u1ea3n ph\u1ea9m ${index + 1}`,
        productPackage: item.variant?.name || item.productPackage || '1',
        quantity: item.quantity || 1,
        price: item.unitPrice || item.price || 0,
        total: item.totalPrice || item.total || 0,
        paymentStatus: mapOrderItemPaymentStatus(order.paymentStatus)
      }))
    : []

  const invoices: SharedOrderInvoice[] = Array.isArray(order.invoices)
    ? order.invoices.map((invoice: any, index: number) => ({
        id: invoice.id?.toString() || `invoice-${order.id}-${index + 1}`,
        fileName: invoice.fileName || invoice.name || invoice.number || `invoice-${index + 1}`,
        fileSize: invoice.fileSize || invoice.size || 0,
        fileType: invoice.fileType || invoice.type || 'application/octet-stream',
        uploadedAt: invoice.uploadedAt || invoice.createdAt || invoice.date || new Date().toISOString(),
        thumbnailUrl: invoice.thumbnailUrl || ''
      }))
    : []

  const notes: SharedOrderNote[] = Array.isArray(order.notes)
    ? order.notes.map((note: any, index: number) => ({
        id: note.id?.toString() || `note-${order.id}-${index + 1}`,
        content: note.content || '',
        createdAt: note.createdAt || new Date().toISOString(),
        createdBy: note.createdBy || 'System'
      }))
    : []

  const subtotal = order.subtotal || items.reduce((sum, item) => sum + item.total, 0)
  const discount = order.discount || 0
  const vat = order.tax || Math.round(subtotal * 0.1)
  const paid = typeof order.totalPaid === 'number'
    ? order.totalPaid
    : order.paymentStatus === 'paid'
      ? order.total
      : 0
  const debt = typeof order.remainingDebt === 'number'
    ? order.remainingDebt
    : Math.max(order.total - paid, 0)

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: mapOrderStatus(order.status),
    paymentMethod: mapPaymentMethod(order.paymentMethod),
    total: order.total || subtotal - discount + vat,
    paid,
    debt,
    dueDate: order.deadline,
    label: order.tags?.[0],
    subtotal,
    discount,
    vat,
    items,
    invoices,
    notes
  }
}

export default function OrderDetailModal({ isOpen, onClose, order }: OrderDetailModalProps) {
  return (
    <OrderDetailDialog
      isOpen={isOpen}
      onClose={onClose}
      order={order ? normalizeOrder(order) : null}
    />
  )
}
