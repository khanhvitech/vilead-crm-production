'use client'

import React, { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import TaxManagement from '@/app/components/settings/TaxManagement'
import { DataSettingsTab } from '@/app/components/settings/DataSettingsTab'

export function GeneralSettingsContent() {
  const [includeTaxInRevenue, setIncludeTaxInRevenue] = useState(false)

  return (
    <Tabs defaultValue="thue" className="w-full">
      <TabsList>
        <TabsTrigger value="thue">Thuế</TabsTrigger>
        <TabsTrigger value="data-settings">Cài đặt dữ liệu</TabsTrigger>
      </TabsList>

      <TabsContent value="thue">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="tax-in-revenue"
              checked={includeTaxInRevenue}
              onChange={(e) => setIncludeTaxInRevenue(e.target.checked)}
              className="w-4 h-4 rounded border-[#e6ebf1] text-[#3e79f7] focus:ring-[#3e79f7]"
            />
            <label htmlFor="tax-in-revenue" className="text-sm text-[#455560] cursor-pointer select-none">
              Tính thuế vào doanh số nhân viên
            </label>
          </div>
          <TaxManagement />
        </div>
      </TabsContent>

      <TabsContent value="data-settings">
        <DataSettingsTab />
      </TabsContent>
    </Tabs>
  )
}
