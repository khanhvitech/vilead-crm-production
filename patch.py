import re

with open('app/components/automation/sequence/SequenceListPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

header_old = '''        {/* Table */}
        <div className="flex-1 overflow-auto">
          <div className="bg-white min-w-[900px]">
            {/* Table head */}
            <div className="grid grid-cols-12 gap-0 px-5 py-2.5 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trigger</div>
            <div className="col-span-1 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Bước</div>
            <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">KH</div>
            <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</div>
            <div className="col-span-1" />
          </div>'''

header_new = '''        {/* Bulk Action Bar */}
        {selectedCount > 0 && (
          <div className="flex items-center justify-between px-5 py-2.5 bg-blue-50 border-b border-blue-100 shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-800">
                Đã chọn <strong>{selectedCount}</strong> kịch bản
              </span>
              <button
                onClick={clearSelection}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Bỏ chọn tất cả
              </button>
            </div>
            <div className="flex items-center gap-2">
              {selectedCount < filtered.length && (
                <button
                  onClick={selectAllVisible}
                  className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 text-sm rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Chọn tất cả ({filtered.length})
                </button>
              )}
              <div className="relative" ref={moveFolderRef}>
                <button
                  onClick={() => setMoveFolderOpen(v => !v)}
                  className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 text-sm rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                >
                  <FolderInput className="w-3.5 h-3.5" />
                  Chuyển thư mục
                </button>
                {moveFolderOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50 max-h-60 overflow-auto">
                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Chọn thư mục
                    </div>
                    {folders.map(f => (
                      <button
                        key={f.id}
                        onClick={() => {
                          handleBulkMoveToFolder(Array.from(selectedIds), f.id)
                          setMoveFolderOpen(false)
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                      >
                        <span className="text-gray-400">📁</span>
                        <span className="truncate">{f.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  handleBulkDuplicate(Array.from(selectedIds))
                  clearSelection()
                }}
                className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 text-sm rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Nhân bản
              </button>
              <button
                onClick={() => {
                  handleBulkDelete(Array.from(selectedIds))
                  clearSelection()
                }}
                className="px-3 py-1.5 bg-red-600 border border-transparent text-white text-sm rounded-md hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <div className="bg-white min-w-[900px]">
            {/* Table head */}
            <div className="grid grid-cols-12 gap-0 px-5 py-2.5 bg-gray-50 border-b border-gray-200 sticky top-0 z-10 items-center">
            <div className="col-span-1 flex items-center">
              <input
                type="checkbox"
                checked={filtered.length > 0 && selectedIds.size === filtered.length}
                onChange={toggleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
            </div>
            <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên Kịch bản</div>
            <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Thư mục</div>
            <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trigger</div>
            <div className="col-span-1 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Bước</div>
            <div className="col-span-1 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">KH</div>
            <div className="col-span-1 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Trạng thái</div>
            <div className="col-span-1 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Thao tác</div>
          </div>'''

body_old = '''                  <div key={seq.id} className="group grid grid-cols-12 gap-0 px-5 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center cursor-pointer" onClick={() => onSelectSequence(seq.id)}>
                  {/* Name + description */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0">'''

body_new = '''                  <div key={seq.id} className={group grid grid-cols-12 gap-0 px-5 py-3 border-b border-gray-100 hover:bg-blue-50/40 transition-colors items-center cursor-pointer } onClick={() => onSelectSequence(seq.id)}>
                  {/* Checkbox */}
                  <div className="col-span-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(seq.id)}
                      onChange={(e) => { e.stopPropagation(); toggleSelect(seq.id) }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      onClick={e => e.stopPropagation()}
                    />
                  </div>

                  {/* Name + description */}
                  <div className="col-span-3 flex items-center gap-3 min-w-0 pr-4">'''

folder_col_old = '''                  </div>

                  {/* Trigger */}'''

folder_col_new = '''                  </div>

                  {/* Folder */}
                  <div className="col-span-2 flex items-center pr-2">
                    {seq.folder ? (
                      <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200/60 truncate max-w-[140px]">
                        <FolderInput className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate">{seq.folder.name}</span>
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Chưa phân loại</span>
                    )}
                  </div>

                  {/* Trigger */}'''

steps_kh_status_old = '''                  {/* Steps */}
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-700">{seq.steps.length}</span>
                  </div>

                  {/* Stats */}
                  <div className="col-span-2 flex items-center justify-center gap-2">
                    <Users size={13} className="text-gray-400" />
                    <div className="text-xs">
                      <span className="font-semibold text-gray-700">{seq.stats.running}</span>
                      <span className="text-gray-400">/{seq.stats.total_customers}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 flex items-center">'''

steps_kh_status_new = '''                  {/* Steps */}
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-700">{seq.steps.length}</span>
                  </div>

                  {/* Stats */}
                  <div className="col-span-1 flex items-center justify-center gap-1">
                    <Users size={13} className="text-gray-400 hidden sm:block" />
                    <div className="text-xs">
                      <span className="font-semibold text-gray-700">{seq.stats.running}</span>
                      <span className="text-gray-400">/{seq.stats.total_customers}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 flex items-center justify-center">'''

text = text.replace(header_old, header_new)
text = text.replace(body_old, body_new)
text = text.replace(folder_col_old, folder_col_new)
text = text.replace(steps_kh_status_old, steps_kh_status_new)

with open('app/components/automation/sequence/SequenceListPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Patched successfully")
