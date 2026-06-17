'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Filter,
  Inbox,
  UploadCloud,
  Users,
  X
} from 'lucide-react';
import { EmailRecipientRow, RecipientFilter, RecipientSourceType, RecipientsPreview } from '../types';
import {
  MOCK_CUSTOMER_LABELS,
  MOCK_CUSTOMER_PRODUCTS,
  MOCK_CUSTOMER_SOURCES,
  MOCK_CUSTOMER_TYPES,
  MOCK_EMAIL_RECIPIENTS
} from '../mockData';

interface RecipientsModalProps {
  filter: RecipientFilter;
  preview: RecipientsPreview | null;
  onSave: (filter: RecipientFilter) => void;
  onPreview: (filter?: RecipientFilter) => Promise<RecipientsPreview>;
  onClose: () => void;
}

interface StatSummary {
  total: number;
  valid: number;
  invalid: number;
  duplicate: number;
  selected: number;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOCK_EXCEL_ROWS: EmailRecipientRow[] = [
  {
    id: 'file-xlsx-001',
    email: 'nguyen.a@gmail.com',
    name: 'Nguyễn Văn A',
    labels: [],
    products: [],
    source: 'file',
    customerType: 'file',
    status: 'valid'
  },
  {
    id: 'file-xlsx-002',
    email: 'tran.b@company.vn',
    name: 'Trần Thị B',
    labels: [],
    products: [],
    source: 'file',
    customerType: 'file',
    status: 'valid'
  }
];

const normalizeFilter = (filter: RecipientFilter): RecipientFilter => ({
  ...filter,
  source_type: filter.source_type || 'crm',
  products: filter.products || [],
  customerTypes: filter.customerTypes || [],
  selected_recipient_ids: filter.selected_recipient_ids || [],
  uploaded_file: filter.uploaded_file || null
});

const getSelectableIds = (rows: EmailRecipientRow[]) =>
  rows.filter(row => row.status === 'valid').map(row => row.id);

const buildStats = (rows: EmailRecipientRow[], selectedIds: string[]): StatSummary => ({
  total: rows.length,
  valid: rows.filter(row => row.status === 'valid').length,
  invalid: rows.filter(row => row.status === 'invalid').length,
  duplicate: rows.filter(row => row.status === 'duplicate').length,
  selected: rows.filter(row => row.status === 'valid' && selectedIds.includes(row.id)).length
});

const filterCrmRecipients = (filter: RecipientFilter) => {
  const productFilters = filter.products || [];
  const customerTypeFilters = filter.customerTypes || [];

  return MOCK_EMAIL_RECIPIENTS.filter(row => {
    const matchLabels = filter.labels.length === 0 || filter.labels.some(label => row.labels.includes(label));
    const matchSources = filter.sources.length === 0 || filter.sources.includes(row.source);
    const matchProducts = productFilters.length === 0 || productFilters.some(product => row.products.includes(product));
    const matchCustomerTypes = customerTypeFilters.length === 0 || customerTypeFilters.includes(row.customerType);
    return matchLabels && matchSources && matchProducts && matchCustomerTypes;
  });
};

const parseCsvRecipients = (content: string): EmailRecipientRow[] => {
  const rows = content
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  const dataRows = rows[0]?.toLowerCase().includes('email') ? rows.slice(1) : rows;
  const seen = new Set<string>();

  return dataRows.slice(0, 5000).map((line, index) => {
    const [rawEmail = '', rawName = ''] = line.split(',').map(value => value.trim().replace(/^"|"$/g, ''));
    const email = rawEmail.toLowerCase();
    const duplicate = !!email && seen.has(email);
    if (email) seen.add(email);

    const status: EmailRecipientRow['status'] = !email || !EMAIL_REGEX.test(email)
      ? 'invalid'
      : duplicate ? 'duplicate' : 'valid';

    return {
      id: `file-csv-${index + 1}`,
      email: rawEmail,
      name: rawName || '-',
      labels: [],
      products: [],
      source: 'file',
      customerType: 'file',
      status,
      error: status === 'invalid' ? 'Email không hợp lệ' : status === 'duplicate' ? 'Trùng email' : undefined
    };
  });
};

export function RecipientsModal({
  filter: initialFilter,
  preview: _initialPreview,
  onSave,
  onPreview,
  onClose
}: RecipientsModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [filter, setFilter] = useState<RecipientFilter>(() => {
    const normalized = normalizeFilter(initialFilter);
    if ((normalized.source_type || 'crm') === 'crm' && (normalized.selected_recipient_ids || []).length === 0) {
      return {
        ...normalized,
        selected_recipient_ids: getSelectableIds(filterCrmRecipients(normalized))
      };
    }
    return normalized;
  });
  const [fileRows, setFileRows] = useState<EmailRecipientRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [fileMessage, setFileMessage] = useState<string | null>(null);

  const sourceType = filter.source_type || 'crm';
  const selectedIds = filter.selected_recipient_ids || [];

  const filteredCrmRows = useMemo(() => {
    return filterCrmRecipients(filter);
  }, [filter.customerTypes, filter.labels, filter.products, filter.sources]);

  const activeRows = sourceType === 'crm' ? filteredCrmRows : fileRows;
  const selectableIds = useMemo(() => getSelectableIds(activeRows), [activeRows]);
  const stats = useMemo(() => buildStats(activeRows, selectedIds), [activeRows, selectedIds]);
  const allSelected = selectableIds.length > 0 && selectableIds.every(id => selectedIds.includes(id));

  const updateFilter = (updates: Partial<RecipientFilter>) => {
    setFilter(prev => ({ ...prev, ...updates }));
  };

  const setSourceType = (type: RecipientSourceType) => {
    const rows = type === 'crm' ? filteredCrmRows : fileRows;
    setFilter(prev => ({
      ...prev,
      source_type: type,
      selected_recipient_ids: getSelectableIds(rows)
    }));
  };

  const toggleFilterValue = (key: 'labels' | 'sources' | 'products' | 'customerTypes', id: string) => {
    const values = (filter[key] || []) as string[];
    const nextValues = values.includes(id)
      ? values.filter(value => value !== id)
      : [...values, id];
    const nextFilter = { ...filter, [key]: nextValues };

    updateFilter({
      [key]: nextValues,
      selected_recipient_ids: getSelectableIds(filterCrmRecipients(nextFilter))
    });
  };

  const clearCrmFilters = () => {
    updateFilter({
      labels: [],
      sources: [],
      products: [],
      customerTypes: [],
      selected_recipient_ids: getSelectableIds(MOCK_EMAIL_RECIPIENTS)
    });
  };

  const toggleRecipient = (id: string) => {
    updateFilter({
      selected_recipient_ids: selectedIds.includes(id)
        ? selectedIds.filter(selectedId => selectedId !== id)
        : [...selectedIds, id]
    });
  };

  const toggleAll = () => {
    updateFilter({
      selected_recipient_ids: allSelected ? [] : selectableIds
    });
  };

  const handleDownloadTemplate = () => {
    const csv = ['Email,Họ tên', 'nguyen.a@gmail.com,Nguyễn Văn A', 'tran.b@company.vn,Trần Thị B'].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mau_danh_sach_email.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const applyFileRows = (rows: EmailRecipientRow[], file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const nextStats = buildStats(rows, getSelectableIds(rows));

    setFileRows(rows);
    setFileName(file.name);
    setFileMessage(`Đã nạp file dữ liệu thành công. Tìm thấy ${nextStats.valid} dòng dữ liệu hợp lệ.`);
    setFilter(prev => ({
      ...prev,
      source_type: 'file',
      selected_recipient_ids: getSelectableIds(rows),
      uploaded_file: {
        name: file.name,
        type: extension === 'xls' ? 'xls' : extension === 'xlsx' ? 'xlsx' : 'csv',
        size: file.size,
        total_rows: nextStats.total,
        valid_rows: nextStats.valid,
        invalid_rows: nextStats.invalid,
        duplicate_rows: nextStats.duplicate
      }
    }));
  };

  const handleFileChange = async (file?: File | null) => {
    if (!file) return;

    if (!/\.(csv|xlsx|xls)$/i.test(file.name)) {
      setFileMessage('Chỉ hỗ trợ file .csv, .xlsx hoặc .xls');
      return;
    }

    setIsParsingFile(true);
    setFileMessage(null);

    if (/\.csv$/i.test(file.name)) {
      const reader = new FileReader();
      reader.onload = () => {
        applyFileRows(parseCsvRecipients(String(reader.result || '')), file);
        setIsParsingFile(false);
      };
      reader.onerror = () => {
        setFileMessage('Không đọc được file. Vui lòng thử lại.');
        setIsParsingFile(false);
      };
      reader.readAsText(file, 'UTF-8');
      return;
    }

    window.setTimeout(() => {
      applyFileRows(MOCK_EXCEL_ROWS, file);
      setIsParsingFile(false);
    }, 400);
  };

  const handleConfirm = async () => {
    const nextFilter = normalizeFilter({
      ...filter,
      selected_recipient_ids: selectedIds.filter(id => selectableIds.includes(id))
    });
    await onPreview(nextFilter);
    onSave(nextFilter);
  };

  const hasCrmFilters =
    filter.labels.length > 0 ||
    filter.sources.length > 0 ||
    (filter.products?.length || 0) > 0 ||
    (filter.customerTypes?.length || 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-[10px] shadow-xl w-full max-w-5xl mx-4 max-h-[92vh] flex flex-col">
        <div className="flex-shrink-0 border-b border-[#e6ebf1] px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Chọn người nhận</h3>
            <p className="text-sm text-gray-500">Chỉ chọn một nguồn gửi: danh sách CRM hoặc file tải lên.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-[10px] hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SourceCard
              active={sourceType === 'crm'}
              icon={<Users className="w-5 h-5" />}
              title="Danh sách CRM"
              description="Lọc khách hàng theo nhãn, sản phẩm mua, nguồn và phân loại."
              onClick={() => setSourceType('crm')}
            />
            <SourceCard
              active={sourceType === 'file'}
              icon={<FileSpreadsheet className="w-5 h-5" />}
              title="Tải file"
              description="Tải danh sách riêng với 2 cột Email và Họ tên."
              onClick={() => setSourceType('file')}
            />
          </div>

          {sourceType === 'crm' ? (
            <section className="border border-[#e6ebf1] rounded-[10px] p-4">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Bộ lọc khách hàng CRM
                  </h4>
                  <p className="text-sm text-gray-500">Bỏ trống bộ lọc để lấy tất cả khách hàng có email hợp lệ.</p>
                </div>
                {hasCrmFilters && (
                  <button onClick={clearCrmFilters} className="text-sm text-[#3e79f7] hover:text-[#2563eb]">
                    Xóa bộ lọc
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                <MultiSelectFilter
                  label="Nhãn gán khách hàng"
                  options={MOCK_CUSTOMER_LABELS}
                  selected={filter.labels}
                  onToggle={id => toggleFilterValue('labels', id)}
                />
                <MultiSelectFilter
                  label="Sản phẩm mua"
                  options={MOCK_CUSTOMER_PRODUCTS}
                  selected={filter.products || []}
                  onToggle={id => toggleFilterValue('products', id)}
                />
                <MultiSelectFilter
                  label="Nguồn khách hàng"
                  options={MOCK_CUSTOMER_SOURCES}
                  selected={filter.sources}
                  onToggle={id => toggleFilterValue('sources', id)}
                />
                <MultiSelectFilter
                  label="Phân loại khách hàng"
                  options={MOCK_CUSTOMER_TYPES}
                  selected={filter.customerTypes || []}
                  onToggle={id => toggleFilterValue('customerTypes', id)}
                />
              </div>

              <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-[10px]">
                <div>
                  <p className="text-sm font-medium text-gray-900">Loại trừ người đã hủy đăng ký</p>
                  <p className="text-xs text-gray-500">Không gửi email đến người đã unsubscribe.</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateFilter({ exclude_unsubscribed: !filter.exclude_unsubscribed })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    filter.exclude_unsubscribed ? 'bg-[#3e79f7]' : 'bg-gray-300'
                  }`}
                  aria-label="Loại trừ người đã hủy đăng ký"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      filter.exclude_unsubscribed ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </section>
          ) : (
            <section className="space-y-4">
              <div className="border border-[#e6ebf1] rounded-[10px] overflow-hidden">
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-gray-900">Nội dung tệp mẫu</h4>
                  <p className="text-sm italic text-gray-500 mt-1">
                    Dữ liệu trong tệp danh sách tải lên cần đúng thứ tự cột và quy định bên dưới.
                  </p>
                </div>
                <div className="overflow-hidden border-t border-[#e6ebf1]">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">Tên tham số</th>
                        <th className="px-4 py-3 text-left font-medium">Chiều dài kí tự</th>
                        <th className="px-4 py-3 text-left font-medium">Loại dữ liệu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs">email</td>
                        <td className="px-4 py-3">255</td>
                        <td className="px-4 py-3">string</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs">full_name</td>
                        <td className="px-4 py-3">200</td>
                        <td className="px-4 py-3">string</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-[#2dc56a] text-[#16a34a] rounded-[10px] hover:bg-green-50"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Tải file mẫu
                  <Download className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-500">Hỗ trợ .csv, .xlsx, .xls. Tối đa 5.000 dòng.</span>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={event => event.preventDefault()}
                onDrop={event => {
                  event.preventDefault();
                  handleFileChange(event.dataTransfer.files?.[0]);
                }}
                className="w-full min-h-[170px] border-2 border-dashed border-[#66e596] rounded-[10px] bg-[#fbfffd] flex flex-col items-center justify-center gap-3 text-center hover:bg-green-50/40 transition-colors"
              >
                <UploadCloud className="w-9 h-9 text-[#2dc56a]" />
                <div>
                  <p className="text-sm font-semibold text-[#16a34a]">
                    Kéo thả hoặc tải danh sách lên
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    File mẫu gồm Email và Họ tên. Dữ liệu Excel đang được mô phỏng trong bản UI này.
                  </p>
                </div>
                {isParsingFile && <p className="text-sm text-[#3e79f7]">Đang đọc file...</p>}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={event => handleFileChange(event.target.files?.[0])}
              />

              {fileMessage && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-[10px]">
                  <CheckCircle2 className="w-5 h-5 text-[#3e79f7] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">{fileMessage}</p>
                    {fileName && <p className="text-xs text-[#3e79f7] mt-1">File: {fileName}</p>}
                  </div>
                </div>
              )}
            </section>
          )}

          <StatsBar stats={stats} sourceType={sourceType} />

          {(stats.invalid > 0 || stats.duplicate > 0) && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-100 rounded-[10px]">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Có {stats.invalid} email lỗi và {stats.duplicate} email trùng. Các dòng này sẽ không được gửi.
              </p>
            </div>
          )}

          <section className="border border-[#e6ebf1] rounded-[10px] overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-[#e6ebf1] flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Danh sách email sẽ gửi</h4>
                <p className="text-xs text-gray-500">Tick/bỏ tick từng email trước khi xác nhận.</p>
              </div>
              <button
                type="button"
                onClick={toggleAll}
                disabled={selectableIds.length === 0}
                className="text-sm text-[#3e79f7] hover:text-[#2563eb] disabled:text-gray-400"
              >
                {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả hợp lệ'}
              </button>
            </div>

            {activeRows.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                <Inbox className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>{sourceType === 'file' ? 'Tải file để xem danh sách email.' : 'Không có khách hàng phù hợp bộ lọc.'}</p>
              </div>
            ) : (
              <div className="max-h-[290px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white sticky top-0 z-10 text-gray-600 border-b border-[#e6ebf1]">
                    <tr>
                      <th className="w-12 px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleAll}
                          disabled={selectableIds.length === 0}
                          className="rounded border-gray-300 text-[#3e79f7] focus:ring-[#3e79f7]"
                        />
                      </th>
                      <th className="w-16 px-4 py-3 text-left font-medium">STT</th>
                      <th className="px-4 py-3 text-left font-medium">Email</th>
                      <th className="px-4 py-3 text-left font-medium">Họ tên</th>
                      <th className="w-36 px-4 py-3 text-left font-medium">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activeRows.map((row, index) => {
                      const disabled = row.status !== 'valid';
                      return (
                        <tr key={row.id} className={disabled ? 'bg-gray-50 text-gray-400' : 'hover:bg-blue-50/40'}>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(row.id)}
                              onChange={() => toggleRecipient(row.id)}
                              disabled={disabled}
                              className="rounded border-gray-300 text-[#3e79f7] focus:ring-[#3e79f7] disabled:cursor-not-allowed"
                            />
                          </td>
                          <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">{row.email || '-'}</td>
                          <td className="px-4 py-3 text-gray-700">{row.name || '-'}</td>
                          <td className="px-4 py-3">
                            <StatusPill row={row} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <div className="flex-shrink-0 bg-gray-50 border-t border-[#e6ebf1] px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Sẽ gửi đến <strong className="text-gray-900">{stats.selected}</strong> email hợp lệ
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-[10px] transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              disabled={stats.selected === 0}
              className="px-5 py-2 bg-[#3e79f7] text-white rounded-[10px] hover:bg-[#699dff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SourceCard({
  active,
  icon,
  title,
  description,
  onClick
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 p-4 rounded-[10px] border-2 text-left transition-all ${
        active ? 'border-[#3e79f7] bg-blue-50' : 'border-[#e6ebf1] hover:bg-gray-50'
      }`}
    >
      <span className={`w-10 h-10 rounded-full flex items-center justify-center ${active ? 'bg-[#3e79f7] text-white' : 'bg-gray-100 text-gray-500'}`}>
        {icon}
      </span>
      <span className="flex-1">
        <span className="flex items-center gap-2 font-semibold text-gray-900">
          {title}
          {active && <Check className="w-4 h-4 text-[#3e79f7]" />}
        </span>
        <span className="block text-sm text-gray-500 mt-1">{description}</span>
      </span>
    </button>
  );
}

function MultiSelectFilter({
  label,
  options,
  selected,
  onToggle
}: {
  label: string;
  options: Array<{ id: string; name: string; color?: string }>;
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="border border-[#e6ebf1] rounded-[10px] p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {selected.length > 0 && (
          <span className="px-2 py-0.5 bg-blue-100 text-[#3e79f7] text-xs rounded-full">
            {selected.length}
          </span>
        )}
      </div>
      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
        {options.map(option => (
          <label
            key={option.id}
            className="flex items-center gap-2 px-2 py-1.5 rounded-[8px] hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.includes(option.id)}
              onChange={() => onToggle(option.id)}
              className="rounded border-gray-300 text-[#3e79f7] focus:ring-[#3e79f7]"
            />
            {option.color && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: option.color }} />}
            <span className="text-sm text-gray-700 truncate">{option.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function StatsBar({ stats, sourceType }: { stats: StatSummary; sourceType: RecipientSourceType }) {
  const items = [
    { label: sourceType === 'crm' ? 'Khách hàng khớp lọc' : 'Tổng dòng', value: stats.total, className: 'bg-blue-50 text-[#2563eb]' },
    { label: 'Email hợp lệ', value: stats.valid, className: 'bg-green-50 text-green-700' },
    { label: 'Lỗi', value: stats.invalid, className: 'bg-red-50 text-red-700' },
    { label: 'Trùng', value: stats.duplicate, className: 'bg-yellow-50 text-yellow-700' },
    { label: 'Đang chọn', value: stats.selected, className: 'bg-gray-900 text-white' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {items.map(item => (
        <div key={item.label} className={`rounded-[10px] p-3 ${item.className}`}>
          <p className="text-2xl font-semibold">{item.value.toLocaleString('vi-VN')}</p>
          <p className="text-xs mt-1 opacity-80">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

function StatusPill({ row }: { row: EmailRecipientRow }) {
  if (row.status === 'valid') {
    return <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">Hợp lệ</span>;
  }

  if (row.status === 'duplicate') {
    return <span className="px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-medium">{row.error || 'Trùng'}</span>;
  }

  return <span className="px-2 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium">{row.error || 'Lỗi'}</span>;
}
