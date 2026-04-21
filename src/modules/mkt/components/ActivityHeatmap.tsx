import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { HourlyActivity } from '../types';

export interface ActivityHeatmapProps {
  data: HourlyActivity[];
}

const colorMap: Record<keyof Omit<HourlyActivity, 'hour'>, string> = {
  messages: '#3e79f7',
  posts: '#2dc56a',
  likes: '#ffc542',
  comments: '#a461d8',
  uids: '#ff9966',
};

const labelMap: Record<keyof Omit<HourlyActivity, 'hour'>, string> = {
  messages: 'Tin nhắn',
  posts: 'Bài đăng',
  likes: 'Like',
  comments: 'Bình luận',
  uids: 'UID',
};

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});

  const toggleSeries = (dataKey: string) => {
    setHiddenSeries((prev) => ({
      ...prev,
      [dataKey]: !prev[dataKey],
    }));
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    
    // Calculate totals over 24h
    const totals = data.reduce((acc, curr) => {
      acc.messages += curr.messages;
      acc.posts += curr.posts;
      acc.likes += curr.likes;
      acc.comments += curr.comments;
      acc.uids += curr.uids;
      return acc;
    }, { messages: 0, posts: 0, likes: 0, comments: 0, uids: 0 });

    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any) => {
          const key = entry.dataKey as keyof typeof totals;
          const isHidden = hiddenSeries[key];
          return (
            <div
              key={key}
              className={`flex items-center gap-2 cursor-pointer transition-opacity ${
                isHidden ? 'opacity-50 line-through' : 'opacity-100 hover:opacity-80'
              }`}
              onClick={() => toggleSeries(key)}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colorMap[key] }}
              />
              <span className="text-[14px] text-[#455560] font-medium">
                {labelMap[key]}
              </span>
              <span className="text-[14px] text-[#1a3353] font-bold">
                {totals[key]}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="p-6 bg-white border border-[#e6ebf1] rounded-[10px] shadow-sm">
      <div className="mb-4">
        <h3 className="text-[16px] font-semibold text-[#1a3353]">Hoạt động đội hôm nay</h3>
        <p className="text-[14px] text-[#72849a]">Biểu đồ phân bố hoạt động theo giờ</p>
      </div>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <RechartsBarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6ebf1" />
            <XAxis
              dataKey="hour"
              tickFormatter={(hour) => `${hour}h`}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#72849a', fontSize: 13 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#72849a', fontSize: 13 }}
            />
            <Tooltip
              cursor={{ fill: '#f0f7ff' }}
              contentStyle={{ borderRadius: '10px', border: '1px solid #e6ebf1', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            />
            <Legend content={renderLegend} verticalAlign="bottom" />
            {!hiddenSeries['messages'] && <Bar dataKey="messages" name="Tin nhắn" stackId="a" fill={colorMap.messages} />}
            {!hiddenSeries['posts'] && <Bar dataKey="posts" name="Bài đăng" stackId="a" fill={colorMap.posts} />}
            {!hiddenSeries['likes'] && <Bar dataKey="likes" name="Like" stackId="a" fill={colorMap.likes} />}
            {!hiddenSeries['comments'] && <Bar dataKey="comments" name="Bình luận" stackId="a" fill={colorMap.comments} />}
            {!hiddenSeries['uids'] && <Bar dataKey="uids" name="UID" stackId="a" fill={colorMap.uids} radius={[4, 4, 0, 0]} />}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
