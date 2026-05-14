import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─────────────────────────────────────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface SettingItem {
  key: string
  label: string
  description: string
  value: string | number | boolean
  type: 'STRING' | 'NUMBER' | 'BOOLEAN'
  category: 'system' | 'mkt'
}

export interface MktFormData {
  email: string
  password: string
  baseUrl: string
  syncInterval: number
}

export interface SettingsState {
  settings: SettingItem[]
  mktConfigured: boolean

  // Actions
  getSettingValue: (key: string) => string | number | boolean | undefined
  updateSetting: (key: string, value: string | number | boolean) => void
  saveMktSettings: (data: MktFormData) => void
  isMktConfigured: () => boolean
  resetStore: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// MKT Settings Template
// ─────────────────────────────────────────────────────────────────────────────

export const MKT_SETTINGS_TEMPLATE: Omit<SettingItem, 'value'>[] = [
  {
    key: 'mkt_login_email',
    label: 'MKT login email',
    description: 'Email đăng nhập hệ thống MKT',
    type: 'STRING',
    category: 'mkt',
  },
  {
    key: 'mkt_login_password',
    label: 'MKT login password',
    description: 'Mật khẩu đăng nhập hệ thống MKT',
    type: 'STRING',
    category: 'mkt',
  },
  {
    key: 'mkt_base_url',
    label: 'MKT Base URL',
    description: 'Địa chỉ URL gốc của hệ thống MKT',
    type: 'STRING',
    category: 'mkt',
  },
  {
    key: 'mkt_sync_interval',
    label: 'MKT Chu kỳ đồng bộ',
    description: 'Chu kỳ đồng bộ dữ liệu từ MKT (phút)',
    type: 'NUMBER',
    category: 'mkt',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: [],
      mktConfigured: false,

      getSettingValue: (key: string) => {
        const setting = get().settings.find((s) => s.key === key)
        return setting?.value
      },

      updateSetting: (key: string, value: string | number | boolean) => {
        set((state) => ({
          settings: state.settings.map((s) =>
            s.key === key ? { ...s, value } : s
          ),
        }))
      },

      saveMktSettings: (data: MktFormData) => {
        const mktSettings: SettingItem[] = MKT_SETTINGS_TEMPLATE.map((template) => {
          let value: string | number | boolean
          switch (template.key) {
            case 'mkt_login_email':
              value = data.email
              break
            case 'mkt_login_password':
              value = data.password
              break
            case 'mkt_base_url':
              value = data.baseUrl
              break
            case 'mkt_sync_interval':
              value = data.syncInterval
              break
            default:
              value = ''
          }
          return { ...template, value }
        })

        set((state) => {
          // Remove any existing MKT settings and add new ones
          const nonMktSettings = state.settings.filter((s) => s.category !== 'mkt')
          return {
            settings: [...nonMktSettings, ...mktSettings],
            mktConfigured: true,
          }
        })
      },

      isMktConfigured: () => {
        return get().mktConfigured
      },

      resetStore: () => {
        set({ settings: [], mktConfigured: false })
      },
    }),
    {
      name: 'vilead-settings-store',
      // Handle corrupted/missing localStorage gracefully by merging with defaults
      merge: (persistedState, currentState) => {
        // If persisted state is invalid or corrupted, fall back to current (default) state
        if (
          !persistedState ||
          typeof persistedState !== 'object'
        ) {
          return currentState
        }

        const persisted = persistedState as Partial<Pick<SettingsState, 'settings' | 'mktConfigured'>>

        return {
          ...currentState,
          settings: Array.isArray(persisted.settings) ? persisted.settings : [],
          mktConfigured: typeof persisted.mktConfigured === 'boolean' ? persisted.mktConfigured : false,
        }
      },
    }
  )
)
