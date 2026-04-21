import { HourlyActivity, User } from '../types';
import { MOCK_USERS } from './mock-users';

// Trend for the last 30 days
const generate30DayTrend = () => {
  const trend = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    trend.push({
      date: date.toISOString().split('T')[0],
      live: Math.floor(Math.random() * 50) + 50,
      die: Math.floor(Math.random() * 10) + 2,
      activity: Math.floor(Math.random() * 5000) + 1000,
    });
  }
  return trend;
};

// 24h Hourly Activity (Peak at 9-11h and 14-16h)
const generateHourlyActivity = (): HourlyActivity[] => {
  const hourly = [];
  for (let i = 0; i < 24; i++) {
    let multiplier = 1;
    if ((i >= 9 && i <= 11) || (i >= 14 && i <= 16)) {
      multiplier = Math.max(2, Math.random() * 4);
    } else if (i < 6 || i > 22) {
      multiplier = 0.1;
    }
    
    hourly.push({
      hour: i,
      messages: Math.floor(Math.random() * 50 * multiplier),
      posts: Math.floor(Math.random() * 10 * multiplier),
      likes: Math.floor(Math.random() * 100 * multiplier),
      comments: Math.floor(Math.random() * 30 * multiplier),
      uids: Math.floor(Math.random() * 20 * multiplier),
    });
  }
  return hourly;
};

// Employee performance array for table
const breakdown_by_user = MOCK_USERS.map((user) => ({
  user_id: user.id,
  user_name: user.full_name,
  avatar_initial: user.avatar_initial,
  department: user.department,
  total_uid: Math.floor(Math.random() * 40) + 10,
  live: Math.floor(Math.random() * 35) + 5,
  die: Math.floor(Math.random() * 5),
  checkpoint: Math.floor(Math.random() * 5),
  activity: Math.floor(Math.random() * 2000) + 100,
})).sort((a, b) => b.activity - a.activity);

export const MOCK_DASHBOARD = {
  metrics: {
    total_uid: 128,
    live: 95,
    die: 18,
    checkpoint: 10,
  },
  deltas: {
    total_uid: { value: 3, percent: 2, isGoodWhenIncrease: true },
    live: { value: 5, percent: 5, isGoodWhenIncrease: true },
    die: { value: 2, percent: 12, isGoodWhenIncrease: false },
    checkpoint: { value: -1, percent: -9, isGoodWhenIncrease: false },
  },
  hourly_activity: generateHourlyActivity(),
  trend_30days: generate30DayTrend(),
  breakdown_by_user,
};
