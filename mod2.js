const fs = require('fs');

const targetPath = 'app/components/automation/sequence/SequenceListPage.tsx';
let content = fs.readFileSync(targetPath, 'utf8');

const sIdx = content.indexOf('<div className="bg-white min-w-[900px]">');
const eIdx = content.indexOf('{/* Create modal */}');
if (sIdx === -1 || eIdx === -1) {
  console.log('Failed to match boundaries');
  process.exit(1);
}

const newTableCode = \
          <div className="bg-white min-w-[1000px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && selectedIds.size === filtered.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tên k?ch b?n</span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Thu m?c</span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Trigger</span>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Bu?c</span>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">KH</span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tr?ng thái</span>
                  </th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center">
                      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">??</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-600">Chua có k?ch b?n nào</p>
                      <p className="text-xs text-gray-400 mt-1">T?o k?ch b?n d?u tiên d? b?t d?u t? d?ng hóa</p>
                      <button
                        type="button"
                        onClick={() => setShowCreate(true)}
                        className="mt-4 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-colors"
                      >
                        T?o k?ch b?n m?i
                      </button>
                    </td>
                  </tr>
                ) : (
                  filtered.map(seq => {
                    const statusStyle   = SEQUENCE_STATUS_STYLES[seq.status];
                    const triggerLabel  = TRIGGER_MAP[seq.trigger.type]?.label ?? seq.trigger.type;
                    const isMenuOpen    = menuOpenId === seq.id;
                    const folderName    = seq.folder?.name ?? 'Chua phân lo?i';

                    return (
                      <tr 
                        key={seq.id} 
                        className={\group transition-colors hover:bg-blue-50/40 cursor-pointer \\}
                        onClick={() => onSelectSequence(seq.id)}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(seq.id)}
                            onChange={() => toggleSelect(seq.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            onClick={e => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-4 py-3 min-w-[200px]">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                              <Zap size={14} className="text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors block truncate">
                                {seq.name}
                              </span>
                              {seq.description && (
                                <p className="text-xs text-gray-400 truncate mt-0.5">{seq.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                            <Folder size={12} /> {folderName}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 bg-orange-50 text-orange-700 text-xs font-semibold rounded-lg border border-orange-100 truncate max-w-[150px]">
                            {triggerLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-semibold text-gray-700">{seq.steps.length}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Users size={13} className="text-gray-400" />
                            <div className="text-xs">
                              <span className="font-semibold text-gray-700">{seq.stats.running}</span>
                              <span className="text-gray-400">/{seq.stats.total_customers}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ background: statusStyle.bg, color: statusStyle.color }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusStyle.dot }} />
                            {statusStyle.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setMenuOpenId(isMenuOpen ? null : seq.id) }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <MoreHorizontal size={15} />
                            </button>

                            {isMenuOpen && (
                              <div
                                className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-48 overflow-hidden"
                                onMouseLeave={() => setMenuOpenId(null)}
                                onClick={e => e.stopPropagation()}
                              >
                                <button
                                  onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); onSelectSequence(seq.id) }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <ChevronRight size={13} className="text-gray-400" /> Xem chi ti?t
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); handleToggle(seq.id) }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  {seq.status === 'active'
                                    ? <><Pause size={13} className="text-gray-400" /> T?m d?ng</>
                                    : <><Play size={13} className="text-gray-400" /> B?t k?ch b?n</>
                                  }
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); handleDuplicate(seq) }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Copy size={13} className="text-gray-400" /> Sao chép
                                </button>
                                <div className="border-t border-gray-100" />
                                <button
                                  onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); handleDelete(seq.id) }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={13} /> Xóa
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      \

content = content.slice(0, sIdx) + newTableCode + content.slice(eIdx);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Update Complete !');
