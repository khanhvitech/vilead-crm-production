"use client"

import React, { createContext, useContext, useState } from 'react'

export type SubscriptionStatus = 'active' | 'expiring_7d' | 'exceed_users' | 'pending_approval' | 'pending_downgrade';

interface SubscriptionContextType {
  status: SubscriptionStatus;
  setStatus: (status: SubscriptionStatus) => void;
  usersCount: number;
  setUsersCount: (count: number) => void;
  maxUsers: number;
  setMaxUsers: (count: number) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SubscriptionStatus>('active')
  const [usersCount, setUsersCount] = useState(8)
  const [maxUsers, setMaxUsers] = useState(10)

  return (
    <SubscriptionContext.Provider value={{ status, setStatus, usersCount, setUsersCount, maxUsers, setMaxUsers }}>
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