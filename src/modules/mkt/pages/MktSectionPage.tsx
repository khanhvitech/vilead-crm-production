"use client";

import React, { useEffect, useMemo } from 'react';
import {
  BarChart3,
  Clock3,
  Facebook,
  LayoutDashboard,
  Monitor,
  Newspaper,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { User } from '../types';
import DashboardPage from './DashboardPage';
import AccountListPage from './AccountListPage';
import AccountDetailPage from './AccountDetailPage';
import PostHistoryPage from './PostHistoryPage';
import ReportsPage from './ReportsPage';
import MyReportPage from './MyReportPage';
import MachineManagementPage from './MachineManagementPage';

interface MktSectionPageProps {
  currentUser: User;
  currentView: string;
  viewParams?: any;
  onNavigate?: (view: string, params?: any) => void;
}

interface MktNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  roles: User['role'][];
  matchViews?: string[];
}

const MKT_NAV_ITEMS: MktNavItem[] = [
  {
    id: 'mkt-dashboard',
    label: 'Tổng quan',
    icon: LayoutDashboard,
    roles: ['admin', 'pm', 'teamLeader', 'employee'],
  },
  {
    id: 'mkt-account-list',
    label: 'Tài khoản Facebook',
    icon: Facebook,
    roles: ['admin', 'pm', 'teamLeader', 'employee'],
    matchViews: ['mkt-account-list', 'mkt-account-profile', 'mkt-account-page'],
  },
  {
    id: 'mkt-posts',
    label: 'Lịch sử Bài đăng',
    icon: Newspaper,
    roles: ['admin', 'pm', 'teamLeader'],
  },
  {
    id: 'mkt-reports',
    label: 'Báo cáo theo ngày',
    icon: BarChart3,
    roles: ['admin', 'pm', 'teamLeader', 'employee'],
  },
  {
    id: 'mkt-my-report',
    label: 'Báo cáo của tôi',
    icon: Clock3,
    roles: ['employee'],
  },
  {
    id: 'mkt-machine-management',
    label: 'Quản lý máy tính',
    icon: Monitor,
    roles: ['admin', 'pm', 'teamLeader'],
  },
];

export default function MktSectionPage({
  currentUser,
  currentView,
  viewParams,
  onNavigate,
}: MktSectionPageProps) {
  const visibleItems = useMemo(
    () => MKT_NAV_ITEMS.filter((item) => item.roles.includes(currentUser.role)),
    [currentUser.role]
  );

  const activeItemId = useMemo(() => {
    const matchedItem = visibleItems.find((item) =>
      (item.matchViews ?? [item.id]).includes(currentView)
    );

    return matchedItem?.id ?? visibleItems[0]?.id ?? 'mkt-dashboard';
  }, [currentView, visibleItems]);

  useEffect(() => {
    const isCurrentViewVisible = visibleItems.some((item) =>
      (item.matchViews ?? [item.id]).includes(currentView)
    );

    if (!isCurrentViewVisible && visibleItems[0]) {
      onNavigate?.(visibleItems[0].id);
    }
  }, [currentView, onNavigate, visibleItems]);

  const renderMktContent = () => {
    switch (currentView) {
      case 'mkt-dashboard':
      case 'mkt-group':
        return <DashboardPage currentUser={currentUser} onNavigate={onNavigate} />;
      case 'mkt-account-list':
        return <AccountListPage currentUser={currentUser} onNavigate={onNavigate} />;
      case 'mkt-account-profile':
      case 'mkt-account-page':
        return <AccountDetailPage uid={viewParams?.uid} onNavigate={onNavigate} />;
      case 'mkt-posts':
        return <PostHistoryPage currentUser={currentUser} onNavigate={onNavigate} />;
      case 'mkt-reports':
        return <ReportsPage currentUser={currentUser} onNavigate={onNavigate} />;
      case 'mkt-my-report':
        return <MyReportPage currentUser={currentUser} onNavigate={onNavigate} />;
      case 'mkt-machine-management':
        return <MachineManagementPage currentUser={currentUser} onNavigate={onNavigate} />;
      default:
        return <DashboardPage currentUser={currentUser} onNavigate={onNavigate} />;
    }
  };

  return (
    <div className="flex min-h-full">
      <div className="sticky top-0 self-start w-52 shrink-0 border-r border-[#e6ebf1] pr-3">
        <nav className="space-y-0.5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeItemId;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[#f0f7ff] text-[#3e79f7]'
                    : 'text-[#455560] hover:bg-[#f8f9fa] hover:text-[#3e79f7]'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="min-w-0 flex-1 pl-6">{renderMktContent()}</div>
    </div>
  );
}
