"use client"

import React, { createContext, useContext, useState } from 'react'

export type SubscriptionStatus = 'active' | 'expiring_7d' | 'exceed_users' | 'pending_payment' | 'pending_approval' | 'pending_downgrade';

export type PaymentActionType = 'upgrade' | 'downgrade' | 'renew' | null;

interface SubscriptionContextType {
  status: SubscriptionStatus;
  setStatus: (status: SubscriptionStatus) => void;
  usersCount: number;
  setUsersCount: (count: number) => void;
  maxUsers: number;
  setMaxUsers: (count: number) => void;
  
  // Global modal state
  isPaymentModalOpen: boolean;
  setPaymentModalOpen: (open: boolean) => void;
  paymentActionType: PaymentActionType;
  setPaymentActionType: (action: PaymentActionType) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SubscriptionStatus>('active')
  const [usersCount, setUsersCount] = useState(8)
  const [maxUsers, setMaxUsers] = useState(10)

  // Global modal state
  const [isPaymentModalOpen, setPaymentModalOpen] = useState<boolean>(false)
  const [paymentActionType, setPaymentActionType] = useState<PaymentActionType>(null)

  return (
    <SubscriptionContext.Provider value={{ 
      status, setStatus, 
      usersCount, setUsersCount, 
      maxUsers, setMaxUsers,
      isPaymentModalOpen, setPaymentModalOpen,
      paymentActionType, setPaymentActionType
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}