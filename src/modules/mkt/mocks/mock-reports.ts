import { MOCK_USERS } from './mock-users';

export interface ReportData {
  id: string;
  type: 'user' | 'software' | 'date';
  userId?: string;
  softwareName?: string;
  dateStr?: string;
  totalUids: number;
  totalMessages: number;
  totalPosts: number;
  totalInteractions: number; // Like + Comment
  totalCollected: number;
  // Metadata cho panel trái
  title: string;
  subtitle: string;
  metrics: { label: string; value: number }[];
  // Dữ liệu hiển thị trong bảng chi tiết
  breakdown: any[];
}

export const MOCK_REPORT_USERS: ReportData[] = MOCK_USERS.map((user, idx) => {
  const mult = (8 - idx);
  return {
    id: `rep-usr-${user.id}`,
    type: 'user',
    userId: user.id,
    totalUids: 20 * mult + 12,
    totalMessages: 154 * mult,
    totalPosts: 12 * mult,
    totalInteractions: 340 * mult,
    totalCollected: 1200 * mult,
    title: user.full_name,
    subtitle: `${user.department} · ${20 * mult + 12} UID vận hành`,
    metrics: [
      { label: 'UID Live/Die', value: 18 * mult },
      { label: 'Hoạt động', value: 340 * mult + 154 * mult },
      { label: 'UID lấy', value: 1200 * mult }
    ],
    breakdown: [
      { id: 'sw1', name: 'MKT Care', uids: 15 * mult, actions: 340 * mult },
      { id: 'sw2', name: 'MKT Post', uids: 5 * mult, actions: 154 * mult }
    ]
  };
});

export const MOCK_REPORT_SOFTWARE: ReportData[] = [
  {
    id: 'rep-sw-1',
    type: 'software',
    softwareName: 'MKT Care',
    totalUids: 480,
    totalMessages: 1200,
    totalPosts: 0,
    totalInteractions: 4500,
    totalCollected: 8900,
    title: 'MKT Care',
    subtitle: '8 NV · 480 UID',
    metrics: [
      { label: 'Tổng NV', value: 8 },
      { label: 'Tổng UID', value: 480 },
      { label: 'Tổng HĐ', value: 5700 }
    ],
    breakdown: MOCK_USERS.slice(0, 5).map(u => ({
      id: u.id, name: u.full_name, uids: 96, actions: 1140
    }))
  },
  {
    id: 'rep-sw-2',
    type: 'software',
    softwareName: 'MKT Post',
    totalUids: 240,
    totalMessages: 0,
    totalPosts: 450,
    totalInteractions: 0,
    totalCollected: 0,
    title: 'MKT Post',
    subtitle: '5 NV · 240 UID',
    metrics: [
      { label: 'Tổng NV', value: 5 },
      { label: 'Tổng UID', value: 240 },
      { label: 'Tổng HĐ', value: 450 }
    ],
    breakdown: MOCK_USERS.slice(0, 3).map(u => ({
      id: u.id, name: u.full_name, uids: 80, actions: 150
    }))
  },
  {
    id: 'rep-sw-3',
    type: 'software',
    softwareName: 'MKT Page',
    totalUids: 120,
    totalMessages: 500,
    totalPosts: 300,
    totalInteractions: 1200,
    totalCollected: 0,
    title: 'MKT Page',
    subtitle: '3 NV · 120 UID',
    metrics: [
      { label: 'Tổng NV', value: 3 },
      { label: 'Tổng UID', value: 120 },
      { label: 'Tổng HĐ', value: 2000 }
    ],
    breakdown: MOCK_USERS.slice(0, 3).map(u => ({
      id: u.id, name: u.full_name, uids: 40, actions: 666
    }))
  }
];

// Tạo 7 ngày gần nhất
const today = new Date('2026-04-18');
export const MOCK_REPORT_DATES: ReportData[] = Array.from({ length: 7 }).map((_, i) => {
  const d = new Date(today);
  d.setDate(d.getDate() - i);
  const dateStr = d.toISOString().split('T')[0];
  const dayName = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][d.getDay()];
  
  const mult = 7 - i;
  return {
    id: `rep-date-${dateStr}`,
    type: 'date',
    dateStr: dateStr,
    totalUids: 800,
    totalMessages: 200 * mult,
    totalPosts: 50 * mult,
    totalInteractions: 400 * mult,
    totalCollected: 1000 * mult,
    title: `${dayName} · ${dateStr.split('-').reverse().join('/')}`,
    subtitle: `8 NV · ${800 - i * 10} UID hoạt động`,
    metrics: [
      { label: 'NV HĐ', value: 8 },
      { label: 'UID HĐ', value: 800 - i * 10 },
      { label: 'Tổng HĐ', value: 650 * mult }
    ],
    breakdown: MOCK_USERS.map(u => ({
      id: u.id, name: u.full_name, uids: 100, actions: 80 * mult
    }))
  };
});
