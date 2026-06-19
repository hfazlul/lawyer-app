"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CaseTable } from "./case-table"
import type { Case } from "@prisma/client"
import { Printer } from "lucide-react"

export function CauseListTabs({
  todayCases,
  nextDayCases,
}: {
  todayCases: Case[]
  nextDayCases: Case[]
}) {
  const handlePrint = () => window.print()

  return (
    <div className="cause-list-print space-y-4">
      <div className="no-print flex justify-end">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print Cause List
        </Button>
      </div>
      <Tabs defaultValue="today">
        <TabsList className="no-print">
          <TabsTrigger value="today">Today ({todayCases.length})</TabsTrigger>
          <TabsTrigger value="next">Next Day ({nextDayCases.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="today">
          <CaseTable
            cases={todayCases}
            title="Today's Cause List"
            allowCreate={false}
            allowEdit={false}
            allowDelete={false}
            searchable
            compact
          />
        </TabsContent>
        <TabsContent value="next">
          <CaseTable
            cases={nextDayCases}
            title="Next Day Cause List"
            allowCreate={false}
            allowEdit={false}
            allowDelete={false}
            searchable
            compact
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
