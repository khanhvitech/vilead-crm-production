'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, File, Trash2, AlertCircle, CheckCircle, Paperclip } from 'lucide-react';
import { Attachment } from '../types';
import { ATTACHMENT_CONSTRAINTS } from '../mockData';

interface AttachmentsModalProps {
  attachments: Attachment[];
  onAdd: (file: File) => { success: boolean; message: string };
  onRemove: (id: string) => void;
  onClose: () => void;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/gif'
];

const FILE_TYPE_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'image/gif': 'GIF'
};

export function AttachmentsModal({ attachments, onAdd, onRemove, onClose }: AttachmentsModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSize = attachments.reduce((sum, a) => sum + a.file_size, 0);
  const canAddMore = attachments.length < ATTACHMENT_CONSTRAINTS.maxFiles;
  const remainingSize = ATTACHMENT_CONSTRAINTS.maxTotalSize - totalSize;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Loại file không được hỗ trợ';
    }
    if (file.size > ATTACHMENT_CONSTRAINTS.maxFileSize) {
      return `File không được vượt quá ${formatFileSize(ATTACHMENT_CONSTRAINTS.maxFileSize)}`;
    }
    if (totalSize + file.size > ATTACHMENT_CONSTRAINTS.maxTotalSize) {
      return `Tổng dung lượng không được vượt quá ${formatFileSize(ATTACHMENT_CONSTRAINTS.maxTotalSize)}`;
    }
    if (attachments.length >= ATTACHMENT_CONSTRAINTS.maxFiles) {
      return `Tối đa ${ATTACHMENT_CONSTRAINTS.maxFiles} file đính kèm`;
    }
    return null;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    setError(null);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validationError = validateFile(file);
      
      if (validationError) {
        setError(validationError);
        return;
      }

      const result = onAdd(file);
      if (!result.success) {
        setError(result.message);
        return;
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    return '📎';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-[10px] shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="border-b border-[#e6ebf1] px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">File đính kèm</h3>
            <p className="text-sm text-gray-500">
              {attachments.length}/{ATTACHMENT_CONSTRAINTS.maxFiles} file • {formatFileSize(totalSize)}/{formatFileSize(ATTACHMENT_CONSTRAINTS.maxTotalSize)}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-[10px] hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Upload zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => canAddMore && fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-[10px] p-8 text-center transition-colors cursor-pointer
              ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-[#e6ebf1] hover:border-gray-400'}
              ${!canAddMore ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_TYPES.join(',')}
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
              disabled={!canAddMore}
            />
            <Upload className={`w-10 h-10 mx-auto mb-3 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
            <p className="text-gray-600 font-medium">
              {canAddMore ? 'Kéo thả file vào đây hoặc click để chọn' : 'Đã đạt số lượng file tối đa'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF • Tối đa 5MB/file
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-[10px]">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* File list */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">File đã đính kèm:</p>
              {attachments.map(attachment => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-[10px]"
                >
                  <span className="text-2xl">{getFileIcon(attachment.file_type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{attachment.file_name}</p>
                    <p className="text-sm text-gray-500">
                      {FILE_TYPE_LABELS[attachment.file_type] || 'File'} • {formatFileSize(attachment.file_size)}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemove(attachment.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-[10px] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 rounded-[10px] p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Lưu ý:</h4>
            <ul className="text-sm text-[#3e79f7] space-y-1">
              <li>• File đính kèm sẽ tăng dung lượng email và có thể ảnh hưởng đến tỷ lệ gửi</li>
              <li>• Một số mail server có thể chặn email có file đính kèm lớn</li>
              <li>• Nên sử dụng link Google Drive/Dropbox cho file lớn</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-[#e6ebf1] px-6 py-4 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#3e79f7] text-white rounded-[10px] hover:bg-[#699dff] transition-colors"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
}
