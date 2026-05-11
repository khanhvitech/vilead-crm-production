'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/app/stores/useSettingsStore'

// ─────────────────────────────────────────────────────────────────────────────
// Validation Schema
// ─────────────────────────────────────────────────────────────────────────────

export const mktSettingsSchema = z.object({
  email: z
    .string()
    .min(1, 'Email là bắt buộc')
    .email('Email không đúng định dạng')
    .max(255, 'Email tối đa 255 ký tự'),
  password: z
    .string()
    .min(1, 'Mật khẩu là bắt buộc')
    .max(128, 'Mật khẩu tối đa 128 ký tự'),
  baseUrl: z
    .string()
    .min(1, 'Base URL là bắt buộc')
    .max(2048, 'URL tối đa 2048 ký tự')
    .refine(
      (val) => val.startsWith('http://') || val.startsWith('https://'),
      'URL phải bắt đầu bằng http:// hoặc https://'
    ),
  syncInterval: z.coerce
    .number({ invalid_type_error: 'Chu kỳ đồng bộ phải là số' })
    .min(5, 'Chu kỳ tối thiểu 5 phút')
    .max(1440, 'Chu kỳ tối đa 1440 phút'),
})

export type MktSettingsFormData = z.infer<typeof mktSettingsSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface MktSettingsFormProps {
  onSaveSuccess: () => void
}

export function MktSettingsForm({ onSaveSuccess }: MktSettingsFormProps) {
  const saveMktSettings = useSettingsStore((state) => state.saveMktSettings)
  const [systemError, setSystemError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MktSettingsFormData>({
    resolver: zodResolver(mktSettingsSchema),
    defaultValues: {
      email: '',
      password: '',
      baseUrl: '',
      syncInterval: 30,
    },
  })

  const onSubmit = async (data: MktSettingsFormData) => {
    try {
      setSystemError(null)
      saveMktSettings(data)
      onSaveSuccess()
    } catch {
      setSystemError('Lưu cài đặt không thành công. Vui lòng thử lại.')
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <h2 className="text-xl font-semibold text-[#1a3353] mb-6">
        Cài đặt kết nối MKT
      </h2>

      {systemError && (
        <div className="mb-4 rounded-[10px] border border-[#ff6b72] bg-[#fff2f2] px-4 py-3 text-sm text-[#ff6b72]">
          {systemError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="mkt-email" className="text-[#1a3353]">
            MKT login email
          </Label>
          <Input
            id="mkt-email"
            type="email"
            placeholder="email@example.com"
            maxLength={255}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <Label htmlFor="mkt-password" className="text-[#1a3353]">
            MKT login password
          </Label>
          <Input
            id="mkt-password"
            type="password"
            placeholder="Nhập mật khẩu"
            maxLength={128}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Base URL field */}
        <div className="space-y-2">
          <Label htmlFor="mkt-base-url" className="text-[#1a3353]">
            MKT Base URL
          </Label>
          <Input
            id="mkt-base-url"
            type="text"
            placeholder="https://example.com"
            maxLength={2048}
            {...register('baseUrl')}
          />
          {errors.baseUrl && (
            <p className="text-sm text-red-500">{errors.baseUrl.message}</p>
          )}
        </div>

        {/* Sync Interval field */}
        <div className="space-y-2">
          <Label htmlFor="mkt-sync-interval" className="text-[#1a3353]">
            MKT Chu kỳ đồng bộ (phút)
          </Label>
          <Input
            id="mkt-sync-interval"
            type="number"
            min={5}
            max={1440}
            placeholder="30"
            {...register('syncInterval')}
          />
          {errors.syncInterval && (
            <p className="text-sm text-red-500">
              {errors.syncInterval.message}
            </p>
          )}
        </div>

        {/* Submit button */}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : 'Lưu cài đặt'}
        </Button>
      </form>
    </div>
  )
}
