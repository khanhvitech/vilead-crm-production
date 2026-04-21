import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, UserX, AlertTriangle, ChevronRight } from 'lucide-react';
import { MOCK_DASHBOARD } from '../mocks/mock-dashboard';
import { User, UserRole } from '../types';
import { MetricCard } from '../components/MetricCard';
import { ActivityHeatmap } from '../components/ActivityHeatmap';
import { FilterBar } from '../components/FilterBar';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { MOCK_USERS } from '../mocks/mock-users';

export interface DashboardPageProps {
  currentUser: User;
  onNavigate?: (view: string, params?: any) => void;
}

// Bảng hiệu suất
const PerformanceTable = ({ data, onRowClick }: { data: any[], onRowClick: (userId: string) => void }) => {
  return (
    <Card className="overflow-hidden bg-white border border-[#e6ebf1] rounded-[10px]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#fafafb] text-[#455560] text-[13px] font-black uppercase tracking-wider">
            <tr>
              <th className="p-4 border-b border-r border-[#e6ebf1] w-[240px]">Nhân viên</th>
              <th className="p-4 border-b border-r border-[#e6ebf1] w-[120px]">Tổng UID</th>
              <th className="p-4 border-b border-r border-[#e6ebf1] w-[100px]">Live</th>
              <th className="p-4 border-b border-r border-[#e6ebf1] w-[100px]">Die</th>
              <th className="p-4 border-b border-r border-[#e6ebf1] w-[100px]">CHKP</th>
              <th className="p-4 border-b border-[#e6ebf1] text-right w-[160px]">Hoạt động</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr 
                key={row.user_id} 
                className="h-[80px] hover:bg-[#f0f7ff] cursor-pointer transition-colors even:bg-[#fafafb] border-b border-[#e6ebf1]"
                onClick={() => onRowClick(row.user_id)}
              >
                <td className="p-4 border-r border-[#e6ebf1] align-middle">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#3e79f7] text-white flex items-center justify-center font-bold text-[14px]">
                      {row.avatar_initial}
                    </div>
                    <div>
                      <div className="text-[14px] font-medium text-[#1a3353]">{row.user_name}</div>
                      <div className="text-[12px] text-[#72849a]">{row.department}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 border-r border-[#e6ebf1] align-middle text-[14px] text-[#455560]">{row.total_uid}</td>
                <td className="p-4 border-r border-[#e6ebf1] align-middle">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] text-[#455560]">{row.live}</span>
                    {row.live > 0 && <div className="w-1.5 h-1.5 rounded-full bg-[#2dc56a]" />}
                  </div>
                </td>
                <td className="p-4 border-r border-[#e6ebf1] align-middle">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] text-[#455560]">{row.die}</span>
                    {row.die > 0 && <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b72]" />}
                  </div>
                </td>
                <td className="p-4 border-r border-[#e6ebf1] align-middle text-[14px] text-[#455560]">{row.checkpoint}</td>
                <td className="p-4 text-right align-middle text-[14px] font-semibold text-[#1a3353]">{row.activity}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#72849a]">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default function DashboardPage({ currentUser, onNavigate }: DashboardPageProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const isEmployee = currentUser.role === 'employee';
  const pageTitle = isEmployee ? 'Dashboard cá nhân' : 'Tổng quan';

  const handleExport = () => {
    // console.log("Exporting Dashboard Excel...");
  };

  const handleRowClick = (userId: string) => {
    if (onNavigate) {
      // Mock navigation to MKT-04 Daily Report scoped to user
      onNavigate('mkt-reports', { prefilterUser: userId });
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-[#f7f7f8] min-h-screen">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
        <div className="grid grid-cols-4 gap-6 mb-6">
          {[1,2,3,4].map(k => <div key={k} className="h-32 bg-gray-200 rounded-[10px] animate-pulse" />)}
        </div>
        <div className="h-[360px] bg-gray-200 rounded-[10px] animate-pulse mb-6" />
        <div className="h-[400px] bg-gray-200 rounded-[10px] animate-pulse" />
      </div>
    );
  }

  // Scoped mock data handling
  // For Employee role, they should only see their own performance if applicable
  const displayTableData = isEmployee 
    ? MOCK_DASHBOARD.breakdown_by_user.filter(x => x.user_id === currentUser.id)
    : MOCK_DASHBOARD.breakdown_by_user;

  return (
    <div className="p-6 bg-[#f7f7f8] min-h-full">

      <h2 className="text-lg font-semibold text-[#1a3353]">Tổng quan</h2>
              <p className="text-[#1a3353] font-medium mb-4"></p>

      <FilterBar userRole={currentUser.role} onExport={handleExport} />

      {/* Row 1: Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard 
          label="Tổng UID" 
          value={MOCK_DASHBOARD.metrics.total_uid} 
          icon={Users} 
          delta={MOCK_DASHBOARD.deltas.total_uid} 
        />
        <MetricCard 
          label="UID Live" 
          value={MOCK_DASHBOARD.metrics.live} 
          icon={UserCheck} 
          delta={MOCK_DASHBOARD.deltas.live} 
        />
        <MetricCard 
          label="UID Die" 
          value={MOCK_DASHBOARD.metrics.die} 
          icon={UserX} 
          delta={MOCK_DASHBOARD.deltas.die} 
        />
        <MetricCard 
          label="Checkpoint" 
          value={MOCK_DASHBOARD.metrics.checkpoint} 
          icon={AlertTriangle} 
          delta={MOCK_DASHBOARD.deltas.checkpoint} 
        />
      </div>

      {/* Row 2: Heatmap */}
      <div className="mb-6">
        <ActivityHeatmap data={MOCK_DASHBOARD.hourly_activity} />
      </div>

      {/* Row 3: 30 days Trend Chart */}
      <Card className="p-6 bg-white border border-[#e6ebf1] rounded-[10px] mb-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-[16px] font-semibold text-[#1a3353]">Xu hướng 30 ngày</h3>
        </div>
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <LineChart
              data={MOCK_DASHBOARD.trend_30days}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6ebf1" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tickFormatter={(dateStr) => {
                  const d = new Date(dateStr);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
                tick={{ fill: '#72849a', fontSize: 13 }}
              />
              <YAxis 
                yAxisId="left" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#72849a', fontSize: 13 }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#72849a', fontSize: 13 }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '10px', border: '1px solid #e6ebf1', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              />
              <Legend verticalAlign="bottom" height={36} />
              <Line yAxisId="left" type="monotone" dataKey="live" name="UID Live" stroke="#2dc56a" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
              <Line yAxisId="left" type="monotone" dataKey="die" name="UID Die" stroke="#ff6b72" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
              <Line yAxisId="right" type="monotone" dataKey="activity" name="Hoạt động" stroke="#3e79f7" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Row 4: Performance Table */}
      {!isEmployee && (
        <div className="mb-6">
          <div className="mb-4">
            <h3 className="text-[16px] font-semibold text-[#1a3353]">Hiệu suất nhân viên</h3>
          </div>
          <PerformanceTable data={displayTableData} onRowClick={handleRowClick} />
        </div>
      )}
    </div>
  );
}
