'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Edit2, Save, X, Check } from 'lucide-react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/app/stores/useSettingsStore'

// ─────────────────────────────────────────────────────────────────────────────
// Editing State Interface
// ─────────────────────────────────────────────────────────────────────────────

interface EditingState {
  key: string | null
  tempValue: string | number | boolean
  error: string | null
  saving: boolean
  successKey: string | null
}

const INITIAL_EDITING_STATE: EditingState = {
  key: null,
  tempValue: '',
  error: null,
  saving: false,
  successKey: null,
}

/**
 * DataSettingsTab - Displays system settings in a table with inline editing.
 * Shows MKT settings when configured, allows editing one row at a time.
 */
export function DataSettingsTab() {
  const { settings, mktConfigured, updateSetting } = useSettingsStore()
  const [editingState, setEditingState] = useState<EditingState>(INITIAL_EDITING_STATE)
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Enter edit mode for a specific row.
   * Only one row can be in edit mode at a time.
   */
  const handleEdit = (key: string, currentValue: string | number | boolean) => {
    setEditingState({
      key,
      tempValue: currentValue,
      error: null,
      saving: false,
      successKey: editingState.successKey,
    })
  }

  /**
   * Cancel editing and restore original state.
   * Discards any temporary value and clears errors.
   */
  const handleCancel = () => {
    setEditingState((prev) => ({
      ...prev,
      key: null,
      tempValue: '',
      error: null,
      saving: false,
    }))
  }

  /**
   * Validate the current value based on the setting type.
   * Returns an error message if invalid, or null if valid.
   */
  const validateValue = useCallback((type: string, value: string | number | boolean): string | null => {
    if (type === 'STRING') {
      if (typeof value === 'string' && value.trim() === '') {
        return 'Giá trị không được để trống'
      }
    }

    if (type === 'NUMBER') {
      const numValue = Number(value)
      if (value === '' || isNaN(numValue)) {
        return 'Giá trị phải là một số hợp lệ'
      }
    }

    // BOOLEAN type is always valid (it's a switch)
    return null
  }, [])

  /**
   * Handle save with validation, store update, and success/error feedback.
   */
  const handleSave = () => {
    const editingKey = editingState.key
    if (!editingKey) return

    // Find the setting being edited
    const setting = settings.find((s) => s.key === editingKey)
    if (!setting) return

    // Validate the value
    const validationError = validateValue(setting.type, editingState.tempValue)
    if (validationError) {
      setEditingState((prev) => ({
        ...prev,
        error: validationError,
      }))
      return
    }

    // Determine the final value to save
    let finalValue: string | number | boolean = editingState.tempValue
    if (setting.type === 'NUMBER') {
      finalValue = Number(editingState.tempValue)
    }

    // Set saving state
    setEditingState((prev) => ({ ...prev, saving: true, error: null }))

    try {
      // Call store update (prototype: always succeeds synchronously)
      updateSetting(editingKey, finalValue)

      // Clear any existing success timeout
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current)
      }

      // On success: exit edit mode and show success indicator
      setEditingState({
        key: null,
        tempValue: '',
        error: null,
        saving: false,
        successKey: editingKey,
      })

      // Clear success message after 3 seconds
      successTimeoutRef.current = setTimeout(() => {
        setEditingState((prev) => ({
          ...prev,
          successKey: prev.successKey === editingKey ? null : prev.successKey,
        }))
        successTimeoutRef.current = null
      }, 3000)
    } catch {
      // On failure: show error, keep row in edit mode, preserve entered value
      setEditingState((prev) => ({
        ...prev,
        saving: false,
        error: 'Lưu thất bại. Vui lòng thử lại.',
      }))
    }
  }

  /**
   * Renders the display value for a setting.
   * Password fields are masked with bullet characters.
   */
  const renderDisplayValue = (setting: { key: string; value: string | number | boolean }) => {
    if (setting.key === 'mkt_login_password') {
      return '••••••••'
    }
    return String(setting.value)
  }

  /**
   * Renders the appropriate input control based on setting type.
   * - STRING: text input (or password input for mkt_login_password)
   * - NUMBER: number input
   * - BOOLEAN: switch component
   */
  const renderEditInput = (setting: { key: string; type: string }) => {
    if (setting.type === 'BOOLEAN') {
      return (
        <Switch
          checked={editingState.tempValue as boolean}
          onCheckedChange={(checked) =>
            setEditingState((prev) => ({ ...prev, tempValue: checked, error: null }))
          }
        />
      )
    }

    if (setting.type === 'NUMBER') {
      return (
        <Input
          type="number"
          value={String(editingState.tempValue)}
          onChange={(e) =>
            setEditingState((prev) => ({ ...prev, tempValue: e.target.value, error: null }))
          }
          className="w-full max-w-[200px]"
        />
      )
    }

    // STRING type
    if (setting.key === 'mkt_login_password') {
      return (
        <Input
          type="password"
          value={String(editingState.tempValue)}
          onChange={(e) =>
            setEditingState((prev) => ({ ...prev, tempValue: e.target.value, error: null }))
          }
          maxLength={500}
          className="w-full max-w-[200px]"
        />
      )
    }

    return (
      <Input
        type="text"
        value={String(editingState.tempValue)}
        onChange={(e) =>
          setEditingState((prev) => ({ ...prev, tempValue: e.target.value, error: null }))
        }
        maxLength={500}
        className="w-full max-w-[200px]"
      />
    )
  }

  // Show empty state when no settings are configured
  if (!mktConfigured || settings.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-[#455560]">
          Chưa có thông số cài đặt nào được cấu hình.
        </p>
      </div>
    )
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cài đặt</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead>Giá trị</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {settings.map((setting) => {
            const isEditing = editingState.key === setting.key
            const isSuccess = editingState.successKey === setting.key

            return (
              <TableRow key={setting.key}>
                <TableCell className="font-medium text-[#1a3353]">
                  {setting.label}
                </TableCell>
                <TableCell>{setting.description}</TableCell>
                <TableCell>
                  {isEditing ? (
                    <div className="flex flex-col gap-1">
                      {renderEditInput(setting)}
                      {editingState.error && (
                        <p className="text-xs text-red-500">{editingState.error}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{renderDisplayValue(setting)}</span>
                      {isSuccess && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <Check className="h-3 w-3" />
                          Đã lưu
                        </span>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#3e79f7] hover:text-[#2a59d1] hover:bg-[#f0f7ff]"
                        onClick={handleSave}
                        disabled={editingState.saving}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Lưu
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#455560] hover:text-[#1a3353] hover:bg-gray-100"
                        onClick={handleCancel}
                        disabled={editingState.saving}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Hủy
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#3e79f7] hover:text-[#2a59d1] hover:bg-[#f0f7ff]"
                      onClick={() => handleEdit(setting.key, setting.value)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Sửa
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
