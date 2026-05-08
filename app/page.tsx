'use client'

import { useState } from 'react'
import VileadSidebar from './components/VileadSidebar'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import AccountantDashboard from './components/AccountantDashboard'
import SalesManagement from './components/SalesManagement'
import CustomersManagement from './components/CustomersManagement'
import OrderManagement from './components/OrderManagement'
import TaskManagement from './components/TaskManagement'
import KPIManagement from './components/KPIManagement'
import ReportsManagement from './components/ReportsManagement'
import MktReportsManagement from './components/mkt-reports/MktReportsManagement'
import SettingsManagement from './components/SettingsManagement'
import ChatManagement from './components/ChatManagement'
import MarketingCampaigns from './components/MarketingCampaigns'
import AutomationManagement from './components/automation/AutomationManagement'

export default function Home() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [userRole, setUserRole] = useState('admin')

  const handleViewChange = (view: string) => {
    setCurrentView(view)
  }

  const handleRoleChange = (role: string) => {
    setUserRole(role)
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        if (userRole === 'accountant') {
          return <AccountantDashboard />
        }
        return <Dashboard onNavigate={handleViewChange} />
      case 'sales':
        return <SalesManagement />
      case 'customers':
        return <CustomersManagement />
      case 'leads':
      case 'deals':
        return <SalesManagement />
      case 'orders':
        return <OrderManagement />
      case 'tasks':
        return <TaskManagement />
      case 'kpi':
        return <KPIManagement />
      case 'products':
      case 'employees':
      case 'company':
        return <SettingsManagement />
      case 'kpis':
        return <ReportsManagement />
      case 'reports':
        return <ReportsManagement onNavigate={handleViewChange} />
      case 'mkt-reports':
        return <MktReportsManagement />
      case 'settings':
        return <SettingsManagement />
      case 'chat':
        return <ChatManagement />
      case 'email-marketing':
        return <MarketingCampaigns />
      case 'automation':
        return <AutomationManagement />
      default:
        return userRole === 'accountant' ? <AccountantDashboard /> : <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <VileadSidebar
        currentView={currentView}
        setCurrentView={handleViewChange}
        userRole={userRole}
        onRoleChange={handleRoleChange}
      />
      <div className="flex flex-1 flex-col overflow-hidden" style={{ marginLeft: '256px' }}>
        <Header />
        <main
          className={
            ['chat', 'automation'].includes(currentView)
              ? 'flex-1 overflow-hidden'
              : 'flex-1 overflow-auto p-6'
          }
        >
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
