# Implementation Plan: General Settings Tabs

## Overview

Refactor the "Cài đặt chung" (General Settings) page from a collapsible layout to a tab-based layout using Radix UI Tabs. Implement a Zustand store for shared MKT settings state, a Data Settings tab with inline-editable table, and an MKT Settings Form on the MKT Reports page. The implementation uses TypeScript, React, Zustand, react-hook-form + zod, and the existing shadcn/ui component library.

## Tasks

- [x] 1. Create Zustand settings store with localStorage persistence
  - [x] 1.1 Create `app/stores/useSettingsStore.ts` with SettingItem interface, MKT_SETTINGS_TEMPLATE, and store actions
    - Define `SettingItem` interface with key, label, description, value, type, category fields
    - Define `MktFormData` interface
    - Define `SettingsState` interface with settings array, mktConfigured flag, and actions (getSettingValue, updateSetting, saveMktSettings, isMktConfigured)
    - Implement Zustand store with `persist` middleware using localStorage key `vilead-settings-store`
    - Handle corrupted/missing localStorage gracefully (default to empty state)
    - _Requirements: 5.1, 5.3, 5.5_

- [x] 2. Create GeneralSettingsContent tab wrapper component
  - [x] 2.1 Create `app/components/settings/GeneralSettingsContent.tsx`
    - Import Tabs, TabsList, TabsTrigger, TabsContent from `@/components/ui/tabs`
    - Render 2 tabs: "Thuế" (value: "thue") and "Cài đặt dữ liệu" (value: "data-settings")
    - Set defaultValue to "thue" so Tax tab is active by default
    - Tab "Thuế" content renders existing `TaxManagement` component
    - Tab "Cài đặt dữ liệu" content renders `DataSettingsTab` component
    - Apply Design System tokens: tab active color #3e79f7, inactive #aeaeb7, border-bottom 2px
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 6.1, 6.5_

- [x] 3. Create DataSettingsTab with inline-editable table
  - [x] 3.1 Create `app/components/settings/DataSettingsTab.tsx` with table structure and display mode
    - Import Table, TableHeader, TableBody, TableRow, TableHead, TableCell from `@/components/ui/table`
    - Read settings from `useSettingsStore`
    - Render 4-column table: "Cài đặt", "Mô tả", "Giá trị", "Thao tác"
    - Display password fields as masked "••••••••"
    - Show "Sửa" (Edit) button in actions column for each row
    - If no settings exist (mktConfigured is false), show empty state or empty table
    - _Requirements: 3.1, 3.2, 5.2, 5.5, 6.2, 6.3_

  - [x] 3.2 Implement inline editing logic in DataSettingsTab
    - Manage local EditingState: key, tempValue, error, saving, successKey
    - Only allow 1 row in edit mode at a time
    - On "Sửa" click: set editing key, copy current value to tempValue
    - Render correct input type based on setting type: text input for STRING, number input for NUMBER, switch for BOOLEAN
    - For `mkt_login_password` key: render password input in edit mode
    - Show "Lưu" (Save) and "Hủy" (Cancel) buttons replacing "Sửa" in edit mode
    - _Requirements: 3.3, 3.4, 5.2_

  - [x] 3.3 Implement save and cancel logic in DataSettingsTab
    - On "Hủy" click: restore original value, clear editing state
    - On "Lưu" click: validate value (non-empty for STRING, valid number for NUMBER), then call `updateSetting`
    - Show validation error inline if value is invalid (empty STRING or non-numeric NUMBER)
    - On successful save: show success message for 3 seconds (successKey state with setTimeout)
    - On save failure: show error message, keep row in edit mode, preserve entered value
    - _Requirements: 3.5, 3.6, 3.7, 3.8, 5.3, 5.4_

- [x] 4. Checkpoint - Verify store and settings components
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create MktSettingsForm component
  - [x] 5.1 Create `app/components/mkt-reports/MktSettingsForm.tsx` with react-hook-form + zod validation
    - Define zod schema: email (required, email format, max 255), password (required, max 128), baseUrl (required, max 2048, starts with http:// or https://), syncInterval (number, min 5, max 1440)
    - Use `useForm` with `zodResolver` for form management
    - Render 4 form fields: email input, password input, URL text input, number input for sync interval
    - Use Label, Input, Button from `@/components/ui/`
    - Apply Design System: border-radius 10px, border color #e6ebf1, focus color #3e79f7, label color #1a3353
    - Display field-level validation errors in red below each invalid field
    - On valid submit: call `useSettingsStore.saveMktSettings(data)`, then call `onSaveSuccess` prop
    - On system error: show general error banner, preserve form data
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 6.4_

- [x] 6. Integrate components into existing pages
  - [x] 6.1 Modify `app/components/SettingsManagement.tsx` to use GeneralSettingsContent
    - Replace the existing collapsible VAT/TaxManagement section in the "general" tab case with `<GeneralSettingsContent />`
    - Import GeneralSettingsContent from `@/app/components/settings/GeneralSettingsContent`
    - Remove old collapsible-related imports if no longer needed
    - _Requirements: 1.1, 1.4, 2.1_

  - [x] 6.2 Modify `app/components/mkt-reports/MktReportsManagement.tsx` to conditionally show MktSettingsForm
    - Import `useSettingsStore` and `MktSettingsForm`
    - Check `isMktConfigured()` from store
    - If not configured: render `MktSettingsForm` with `onSaveSuccess` callback that triggers re-render
    - If configured: render existing report tabs content
    - _Requirements: 4.1, 4.4_

- [x] 7. Checkpoint - Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Set up testing infrastructure and write property-based tests
  - [x] 8.1 Install fast-check and set up vitest configuration
    - Install `fast-check` as devDependency
    - Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` as devDependencies
    - Create `vitest.config.ts` with jsdom environment and path aliases matching tsconfig
    - Add `"test": "vitest --run"` script to package.json
    - _Requirements: Design Testing Strategy_

  - [ ]* 8.2 Write property test: Correct input type renders based on setting type
    - **Property 1: Correct input type renders based on setting type**
    - Generate random SettingItems with random types (STRING, NUMBER, BOOLEAN), verify correct input control renders in edit mode
    - **Validates: Requirements 3.3**

  - [ ]* 8.3 Write property test: Action buttons reflect editing state
    - **Property 2: Action buttons reflect editing state**
    - Generate random settings, toggle edit mode on/off, verify Edit button in display mode and Save/Cancel in edit mode
    - **Validates: Requirements 3.2, 3.4**

  - [ ]* 8.4 Write property test: Valid save updates store and returns to display mode
    - **Property 3: Valid save updates store and returns to display mode**
    - Generate random valid values per type (non-empty strings, valid numbers, booleans), save, verify store updated and row returns to display
    - **Validates: Requirements 3.5, 5.3**

  - [ ]* 8.5 Write property test: Cancel restores original value
    - **Property 4: Cancel restores original value**
    - Generate random settings + random temp values, cancel edit, verify original value restored unchanged
    - **Validates: Requirements 3.6**

  - [ ]* 8.6 Write property test: Invalid inline values are rejected
    - **Property 5: Invalid inline values are rejected with validation errors**
    - Generate random invalid values (empty/whitespace strings for STRING, non-numeric for NUMBER), attempt save, verify rejection with error and store unchanged
    - **Validates: Requirements 3.8**

  - [ ]* 8.7 Write property test: MKT form save creates correct store entries
    - **Property 6: MKT form save creates correct store entries**
    - Generate random valid MKT configs (valid emails, non-empty passwords, valid URLs, intervals 5-1440), save, verify exactly 4 store entries with correct keys and values
    - **Validates: Requirements 4.4, 5.1**

  - [ ]* 8.8 Write property test: Invalid MKT configuration is rejected
    - **Property 7: Invalid MKT configuration is rejected with specific errors**
    - Generate random invalid MKT configs (bad emails, empty passwords, invalid URLs, out-of-range intervals), verify form does not save and shows field-level errors
    - **Validates: Requirements 4.5**

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The Zustand store with persist middleware handles cross-component state sharing between MKT Reports page and Data Settings tab
- The existing TaxManagement component is reused as-is without modification
- All UI components use the existing shadcn/ui library at `@/components/ui/`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "8.1"] },
    { "id": 1, "tasks": ["2.1", "5.1"] },
    { "id": 2, "tasks": ["3.1"] },
    { "id": 3, "tasks": ["3.2"] },
    { "id": 4, "tasks": ["3.3"] },
    { "id": 5, "tasks": ["6.1", "6.2"] },
    { "id": 6, "tasks": ["8.2", "8.3", "8.4", "8.5", "8.6", "8.7", "8.8"] }
  ]
}
```
