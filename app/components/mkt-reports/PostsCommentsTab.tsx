'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { MktReportsController } from './useMktReports'
import { SubTabButton, StatusBadge } from './shared'

export default function PostsCommentsTab({ controller }: { controller: MktReportsController }) {
  const {
    postCommentTab,
    setPostCommentTab,
    postCommentEmployeeFilter,
    setPostCommentEmployeeFilter,
    postCommentSoftwareFilter,
    setPostCommentSoftwareFilter,
    postCommentTypeFilter,
    setPostCommentTypeFilter,
    employees,
    filteredPosts,
    filteredComments,
    exportPostsComments,
    getEmployeeName,
  } = controller

  const availableTypes =
    postCommentTab === 'posts'
      ? ['Group', 'Tường cá nhân', 'Page']
      : ['UID Group', 'UID Bài viết', 'UID Page', 'UID Profile']

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SubTabButton active={postCommentTab === 'posts'} label={`Bài đăng (${filteredPosts.length})`} onClick={() => setPostCommentTab('posts')} />
        <SubTabButton active={postCommentTab === 'comments'} label={`Bình luận (${filteredComments.length})`} onClick={() => setPostCommentTab('comments')} />
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-3">
          <Select value={postCommentEmployeeFilter} onValueChange={setPostCommentEmployeeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tất cả NV" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả NV</SelectItem>
              {employees.map(employee => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={postCommentSoftwareFilter} onValueChange={value => setPostCommentSoftwareFilter(value as typeof postCommentSoftwareFilter)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tất cả phần mềm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phần mềm</SelectItem>
              <SelectItem value="mkt-care">MKT Care</SelectItem>
              <SelectItem value="mkt-post">MKT Post</SelectItem>
              <SelectItem value="mkt-page">MKT Page</SelectItem>
            </SelectContent>
          </Select>

          <Select value={postCommentTypeFilter} onValueChange={setPostCommentTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tất cả loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              {availableTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" onClick={exportPostsComments}>
          <Download className="h-4 w-4" />
          Xuất Excel
        </Button>
      </div>

      {postCommentTab === 'posts' ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Tên tài khoản</TableHead>
              <TableHead>UID</TableHead>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Phần mềm</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead>UID nơi đăng</TableHead>
              <TableHead>UID bài đăng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.map((record, index) => (
              <TableRow key={record.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{record.time}</TableCell>
                <TableCell className="font-medium text-[#1a3353]">{record.accountName}</TableCell>
                <TableCell className="text-[#98a5b3]">{record.uid}</TableCell>
                <TableCell>{getEmployeeName(record.employeeId)}</TableCell>
                <TableCell>{record.typeLabel}</TableCell>
                <TableCell><StatusBadge kind="software" value={record.software} /></TableCell>
                <TableCell className="max-w-[240px] truncate">{record.content}</TableCell>
                <TableCell>{record.targetUid}</TableCell>
                <TableCell>{record.postUid}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Tên tài khoản</TableHead>
              <TableHead>UID</TableHead>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Phần mềm</TableHead>
              <TableHead>Nội dung bình luận</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>UID nơi bình luận</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredComments.map((record, index) => (
              <TableRow key={record.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{record.time}</TableCell>
                <TableCell className="font-medium text-[#1a3353]">{record.accountName}</TableCell>
                <TableCell className="text-[#98a5b3]">{record.uid}</TableCell>
                <TableCell>{getEmployeeName(record.employeeId)}</TableCell>
                <TableCell><StatusBadge kind="software" value={record.software} /></TableCell>
                <TableCell className="max-w-[300px] truncate">{record.content}</TableCell>
                <TableCell>{record.typeLabel}</TableCell>
                <TableCell>{record.targetUid}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

