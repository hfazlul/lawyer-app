"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/admin/rich-text-editor"

interface BilingualRichInputProps {
  label: string
  enValue: string
  bnValue: string
  onEnChange: (value: string) => void
  onBnChange: (value: string) => void
  enPlaceholder?: string
  bnPlaceholder?: string
}

export function BilingualRichInput({
  label,
  enValue,
  bnValue,
  onEnChange,
  onBnChange,
  enPlaceholder = "English",
  bnPlaceholder = "বাংলা",
}: BilingualRichInputProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Tabs defaultValue="en" className="w-full">
        <TabsList>
          <TabsTrigger value="en">English</TabsTrigger>
          <TabsTrigger value="bn">বাংলা</TabsTrigger>
        </TabsList>
        <TabsContent value="en">
          <RichTextEditor
            value={enValue}
            onChange={onEnChange}
            placeholder={enPlaceholder}
          />
        </TabsContent>
        <TabsContent value="bn">
          <RichTextEditor
            value={bnValue}
            onChange={onBnChange}
            placeholder={bnPlaceholder}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
