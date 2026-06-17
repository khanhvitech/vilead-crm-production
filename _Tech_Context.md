# _Tech_Context.md — Context kỹ thuật cho AI code

> **Đọc file này TRƯỚC KHI viết code** bất kỳ màn hình nào trong module MKT.
> Áp dụng cho: Claude Code, Antigravity, Copilot, bất kỳ AI sinh code nào.
> Prototype only: mock data, local state, không gọi API thật, hardcode tiếng Việt.

---

## 1. Stack & Quy ước

- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components đã tuỳ chỉnh tại `components/ui/`
- **State management:** Local state (useState/useReducer), **KHÔNG dùng Redux/Zustand** ở prototype
- **Data:** Mock hardcoded, **KHÔNG gọi API thật**
- **Routing:** React Router v6 (giả định đã có sẵn)
- **Charts:** Recharts
- **Icons:** lucide-react
- **Ngôn ngữ:** Hardcode tiếng Việt trong JSX, không dùng i18n library
- **Date:** `date-fns` hoặc `dayjs` cho format tương đối ("2 phút trước")

---

## 2. Folder structure (tuân thủ ViLead CRM)

```
/src/modules/mkt/
  /pages/
    DashboardPage.tsx              → MKT-01
    AccountListPage.tsx            → MKT-02
    AccountDetailPage.tsx          → MKT-03a + 03b (1 page nhận type)
    PostHistoryPage.tsx            → MKT-08
    DailyReportPage.tsx            → MKT-04
    MyReportPage.tsx               → MKT-05
    MachineManagementPage.tsx      → MKT-06
  /components/
    StatusChip.tsx
    DeltaIndicator.tsx
    MetricCard.tsx
    PostLocationBadge.tsx
    FilterBar.tsx                  (nếu cần chung)
    AddMachineModal.tsx            → MKT-07
    ActivityHeatmap.tsx            → dùng ở MKT-01
    UnifiedTimeline.tsx            → dùng ở MKT-03 Tab 4
  /hooks/
    useLocalFilter.ts              (hook xử lý filter local)
    usePermission.ts               (check role)
  /mocks/
    mock-users.ts                  (danh sách NV chung)
    mock-accounts.ts               (UID FB)
    mock-dashboard.ts              (data MKT-01)
    mock-posts.ts                  (bài đăng)
    mock-comments.ts               (bình luận)
    mock-machines.ts               (máy tính)
    mock-daily-report.ts           (MKT-04)
  /types/
    index.ts                       (toàn bộ TS types)
  /utils/
    formatDate.ts                  (format dd/MM, relative time)
    getStatusColor.ts
    scopeByRole.ts                 (scope data theo role)
  /constants/
    routes.ts
    permissions.ts
```

---

## 3. Routing convention

```typescript
// /src/modules/mkt/constants/routes.ts
export const MKT_ROUTES = {
  dashboard: '/mkt/dashboard',
  accountList: '/mkt/accounts',
  accountDetail: '/mkt/accounts/:uid',       // tab qua useState local
  postHistory: '/mkt/posts',
  dailyReport: '/mkt/reports',
  myReport: '/mkt/my-report',
  machineManagement: '/settings/machines',   // ở nhóm Cài đặt, không trong Báo cáo MKT
};
```

**Tab state:** Dùng `useState` local trong page, KHÔNG đưa vào URL (yêu cầu của bạn: local state).

---

## 4. TypeScript types cốt lõi

```typescript
// /src/modules/mkt/types/index.ts

export type UserRole = 'employee' | 'teamLeader' | 'pm' | 'admin';

export interface User {
  id: string;
  full_name: string;
  avatar_initial: string;        // chữ cái đầu (không dùng ảnh thật ở prototype)
  department: 'Team A' | 'Team B';
  role: UserRole;
}

export type FBAccountType = 'profile' | 'page';
export type ProfileStatus = 'live' | 'die' | 'checkpoint' | 'restricted' | 'inactive';
export type PageStatus = 'active' | 'restricted' | 'unpublished';

export interface FBAccount {
  uid: string;
  name: string;
  avatar_initial: string;
  type: FBAccountType;
  status: ProfileStatus | PageStatus;
  status_since: string;          // ISO date
  current_software: 'MKT Care' | 'MKT Post' | 'MKT Page' | 'MKT UID' | null;
  current_holder_id: string | null;
  current_machine_id: string | null;
  last_action_type: string | null;
  last_action_at: string | null;
  parent_profile_uid?: string;   // chỉ Page
}

export type PostLocation = 'personal' | 'group' | 'page';

export interface Post {
  id: string;
  fb_account_uid: string;
  fb_account_name: string;
  time: string;                  // ISO
  location: PostLocation;
  group_name?: string;           // nếu location = group
  content: string;               // full content
  link: string;                  // FB URL
  software: 'MKT Post' | 'MKT Page';
  user_id: string;
  user_name: string;
}

export interface Comment {
  id: string;
  fb_account_uid: string;
  time: string;
  content: string;
  parent_post_link: string;      // link bài được comment
  software: 'MKT Care' | 'MKT Post' | 'MKT Page';
  user_id: string;
}

export type StatusEventType = 'status_change' | 'user_change' | 'software_change';

export interface TimelineEvent {
  id: string;
  fb_account_uid: string;
  at: string;                    // ISO
  event_type: StatusEventType;
  // Cho status_change:
  from_status?: string;
  to_status?: string;
  reason?: 'checkpoint' | 'disabled' | 'unknown' | string;
  // Cho user_change:
  from_user_id?: string;
  to_user_id?: string;
  // Cho software_change:
  from_software?: string;
  to_software?: string;
  // Common:
  holder_user_id: string;
  software: string;
}

export interface Machine {
  id: string;
  name: string;
  assigned_user_id: string | null;
  last_sync_at: string;          // ISO
  status: 'online' | 'offline';
  connection_code?: string;
}

export interface DailyStats {
  date: string;                  // YYYY-MM-DD
  messages: number;
  posts: number;
  likes: number;
  comments: number;
  uids_collected: number;
  friends_requests_sent?: number;  // Profile only
  friends_accepted?: number;
  reactions_received?: number;     // Page only
  follower_delta?: number;         // Page only
}

export interface HourlyActivity {
  hour: number;                  // 0-23
  messages: number;
  posts: number;
  likes: number;
  comments: number;
  uids: number;
}
```

---

## 5. Component API chung (props chuẩn)

```typescript
// StatusChip
interface StatusChipProps {
  status: ProfileStatus | PageStatus | 'online' | 'offline';
  size?: 'sm' | 'md';           // default sm (px-2 py-0.5), md cho header detail
}

// DeltaIndicator
interface DeltaIndicatorProps {
  value: number;                 // số thay đổi tuyệt đối
  percent: number;
  // Quy ước màu: tăng là "tốt" (xanh) hay "xấu" (đỏ)
  isGoodWhenIncrease: boolean;   // Live=true, Die=false
  compareLabel?: string;         // default "so với hôm qua"
}

// MetricCard
interface MetricCardProps {
  label: string;                 // UPPERCASE hiển thị
  value: number | string;
  icon?: LucideIcon;
  delta?: { value: number; percent: number; isGoodWhenIncrease: boolean };
  onClick?: () => void;          // optional clickable
}

// PostLocationBadge
interface PostLocationBadgeProps {
  location: PostLocation;
  groupName?: string;            // required nếu location = 'group'
}

// UnifiedTimeline (MKT-03 Tab 4)
interface UnifiedTimelineProps {
  events: TimelineEvent[];
  filter?: StatusEventType | 'all';
}

// ActivityHeatmap (MKT-01)
interface ActivityHeatmapProps {
  data: HourlyActivity[];        // 24 items
  legendToggles?: string[];      // loại hoạt động đang bật
}
```

---

## 6. Permission pattern

```typescript
// /src/modules/mkt/hooks/usePermission.ts
export function usePermission() {
  const { currentUser } = useAuth();   // giả định auth đã có
  
  const canAccess = (screen: string): boolean => {
    const role = currentUser.role;
    const PERMISSIONS = {
      'MKT-01': ['employee', 'teamLeader', 'pm', 'admin'],
      'MKT-02': ['employee', 'teamLeader', 'pm', 'admin'],
      'MKT-03': ['employee', 'teamLeader', 'pm', 'admin'],
      'MKT-04': ['employee', 'teamLeader', 'pm', 'admin'],
      'MKT-05': ['employee'],                            // chỉ NV
      'MKT-06': ['teamLeader', 'pm', 'admin'],           // xem; Admin full
      'MKT-08': ['teamLeader', 'pm', 'admin'],           // ẩn với NV
    };
    return PERMISSIONS[screen]?.includes(role) ?? false;
  };
  
  const canEdit = (screen: string): boolean => {
    if (screen === 'MKT-06') return currentUser.role === 'admin';
    return false;
  };
  
  return { canAccess, canEdit, role: currentUser.role };
}
```

**Pattern scope data theo role:** Mọi hook fetch data gọi `scopeByRole(data, currentUser)` để lọc trước khi render.

```typescript
// /src/modules/mkt/utils/scopeByRole.ts
export function scopeByRole<T extends { user_id?: string }>(
  data: T[],
  currentUser: User,
  departmentUsers: User[]
): T[] {
  if (currentUser.role === 'employee') {
    return data.filter(d => d.user_id === currentUser.id);
  }
  if (currentUser.role === 'teamLeader') {
    const teamIds = departmentUsers.filter(u => u.department === currentUser.department).map(u => u.id);
    return data.filter(d => !d.user_id || teamIds.includes(d.user_id));
  }
  return data; // pm, admin: full
}
```

---

## 7. Loading / Error / Empty states

Mọi page có **3 states bắt buộc**:

```tsx
if (loading) return <PageSkeleton type="dashboard|list|detail" />;
if (error) return <ErrorState onRetry={refetch} />;
if (isEmpty) return <EmptyState icon={...} title="..." cta={...} />;
return <NormalContent />;
```

**Skeleton pattern:**
- Table: 5-10 row skeleton, height đúng row thật
- Card: skeleton cùng kích thước card, bg `#f7f7f8`, radius 10px
- Chart: skeleton block height 320px

---

## 8. Mock data quy ước

**Mỗi màn có 1 file mock riêng,** export default là 1 object lớn:

```typescript
// /src/modules/mkt/mocks/mock-dashboard.ts
export const MOCK_DASHBOARD = {
  metrics: { total_uid: 128, live: 95, die: 18, checkpoint: 10, ... },
  deltas: { total_uid: { value: 3, percent: 2 }, ... },
  hourly_activity: [ /* 24 items */ ],
  trend_30days: [ /* 30 items */ ],
  breakdown_by_user: [ /* 8 users */ ],
};
```

**Users chung:** file `mock-users.ts` export `MOCK_USERS` gồm 8 NV (Hương, Bình, Mai, Đức, Lan, Nam-TL, Huệ-TL, Sơn-PM) + current user giả lập.

**UIDs chung:** file `mock-accounts.ts` export `MOCK_FB_ACCOUNTS` gồm ~100 UID (70 profile + 30 page).

→ Các mock khác reference 2 file trên để đồng bộ data.

---

## 9. Naming & Coding convention

- **File component:** PascalCase `StatusChip.tsx`
- **File hook/util:** camelCase `useLocalFilter.ts`, `formatDate.ts`
- **File mock:** kebab-case prefix `mock-` → `mock-dashboard.ts`
- **Interface/Type:** PascalCase `FBAccount`, `Post`
- **Const:** UPPER_SNAKE_CASE cho mock data `MOCK_USERS`
- **Component props:** interface `<Name>Props`
- **Event handler:** `handle<Action>` → `handleFilterChange`, `handleRowClick`
- **No inline style:** luôn dùng Tailwind class hoặc `.omi-*` class

---

## 10. Quy tắc quan trọng khi AI sinh code

1. **TUYỆT ĐỐI KHÔNG** tự tạo component mới nếu đã có trong `components/ui/` hoặc trong list component chung của module
2. **TUYỆT ĐỐI KHÔNG** hard-code màu — luôn dùng token từ DESIGN.md (`#3e79f7`, `#e6ebf1`, ...)
3. **TUYỆT ĐỐI KHÔNG** dùng `rounded-lg` (8px) — luôn `rounded-[10px]`
4. **TUYỆT ĐỐI KHÔNG** gọi API thật — tất cả data đến từ `/mocks/`
5. **Tab state:** luôn `useState` local, không đưa vào URL
6. **Filter state:** `useState` local trong page, không lưu global
7. **Loading/Error/Empty:** luôn có 3 states, không bỏ qua
8. **Permission:** luôn check `usePermission().canAccess('MKT-XX')` đầu page, redirect nếu không có quyền
9. **Ngôn ngữ:** Tiếng Việt toàn bộ, hardcode trong JSX
10. **Link bài FB:** luôn `target="_blank" rel="noopener noreferrer"`
