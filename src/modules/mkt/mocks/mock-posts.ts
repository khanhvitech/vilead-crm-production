import { Post } from '../types';

// Random date within the last 7 days
const getRandomDate = (subDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() - subDays);
  return d.toISOString();
};

export const MOCK_POSTS: Post[] = [
  {
    id: 'post-1',
    fb_account_uid: '100001234567890',
    fb_account_name: 'Ng.T.Hương',
    time: getRandomDate(0), // Today
    location: 'group',
    group_name: 'Mẹ và bé HN',
    content: 'Shop mình đang có chương trình khuyến mãi giảm 50% cho tất cả các sản phẩm mẹ và bé. Cả nhà nhanh tay nhé vì số lượng có hạn!',
    link: 'https://facebook.com/100001234567890/posts/1',
    software: 'MKT Post',
    user_id: 'usr-1',
    user_name: 'Hương Nguyễn'
  },
  {
    id: 'post-2',
    fb_account_uid: '100002234567890',
    fb_account_name: 'Tr.V.Bình',
    time: getRandomDate(0), // Today
    location: 'page',
    group_name: '',
    content: 'Khuyến mãi tháng 4 giảm 20% cho đơn hàng đầu tiên. Inbox ngay để nhận mã giảm giá nha mọi người ơi. Đặc biệt freeship toàn bộ nội thành.',
    link: 'https://facebook.com/100002234567890/posts/1',
    software: 'MKT Page',
    user_id: 'usr-2',
    user_name: 'Bình Trần'
  },
  {
    id: 'post-3',
    fb_account_uid: '100003234567890',
    fb_account_name: 'Lê.T.Mai',
    time: getRandomDate(1), // Yesterday
    location: 'personal',
    group_name: '',
    content: 'Hôm nay thời tiết đẹp quá, chia sẻ với mọi người bộ sưu tập mới năm nay nha. Rất nhiều mẫu xuất sắc luôn.',
    link: 'https://facebook.com/100003234567890/posts/2',
    software: 'MKT Post',
    user_id: 'usr-3',
    user_name: 'Mai Lê'
  },
  {
    id: 'post-4',
    fb_account_uid: '100004234567890',
    fb_account_name: 'Phạm.V.Đức',
    time: getRandomDate(1), // Yesterday
    location: 'group',
    group_name: 'Mẹ đơn thân SG',
    content: 'Mọi người cho em hỏi địa chỉ mua đồ úi dời uy tín ở Sài Gòn với ạ? Đang tìm mua mà mù mờ quá đi mất...',
    link: 'https://facebook.com/100004234567890/posts/1',
    software: 'MKT Post',
    user_id: 'usr-4',
    user_name: 'Đức Phạm'
  },
  {
    id: 'post-5',
    fb_account_uid: '100005234567890',
    fb_account_name: 'Vũ.T.Lan',
    time: getRandomDate(2), // 2 days ago
    location: 'page',
    group_name: '',
    content: 'Bài mới của shop đây ạ. Ảnh thật 100% không qua chỉnh sửa, khách cứ tự tin mà đặt hàng nhé. Bao chất!',
    link: 'https://facebook.com/100005234567890/posts/1',
    software: 'MKT Page',
    user_id: 'usr-5',
    user_name: 'Lan Vũ'
  },
  {
    id: 'post-6',
    fb_account_uid: '100001234567890',
    fb_account_name: 'Ng.T.Hương',
    time: getRandomDate(3), 
    location: 'personal',
    group_name: '',
    content: 'Khởi động ngày mới năng lượng nha cả nhà. Đừng quên ghé shop em ủng hộ tháng mới nha!',
    link: 'https://facebook.com/100001234567890/posts/5',
    software: 'MKT Post',
    user_id: 'usr-1',
    user_name: 'Hương Nguyễn'
  },
  {
    id: 'post-7',
    fb_account_uid: '100001234567890',
    fb_account_name: 'Ng.T.Hương',
    time: getRandomDate(4),
    location: 'group',
    group_name: 'Chợ đầu mối HCM',
    content: 'Sỉ quần áo trẻ em giá gốc tận xưởng, không qua trung gian. Mẹ nào quan tâm inb nhe. Đóng sỉ từ 10 ri.',
    link: 'https://facebook.com/100001234567890/posts/6',
    software: 'MKT Post',
    user_id: 'usr-1',
    user_name: 'Hương Nguyễn'
  }
];

// Sinh thêm data để có phân trang (~ 40 bài)
for (let i = 8; i <= 40; i++) {
  const isGroup = i % 3 === 0;
  const isPage = i % 4 === 0;
  MOCK_POSTS.push({
    id: `post-${i}`,
    fb_account_uid: `10000${(i % 5) + 1}234567890`,
    fb_account_name: `User ${i % 5}`,
    time: getRandomDate(i % 7),
    location: isGroup ? 'group' : (isPage ? 'page' : 'personal'),
    group_name: isGroup ? `Group Demo ${i % 10}` : '',
    content: i % 5 === 0 ? '' : `Đây là nội dung mô phỏng cho bài đăng số ${i}. Mọi người quan tâm thì comment hoặc inb nhé! Cảm ơn cả nhà đã ủng hộ ${i} lần.`,
    link: `https://facebook.com/10000${(i % 5) + 1}234567890/posts/${i}`,
    software: isPage ? 'MKT Page' : 'MKT Post',
    user_id: `usr-${(i % 8) + 1}`,
    user_name: `Nhân viên ${(i % 8) + 1}`
  });
}
