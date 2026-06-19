"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

interface BilingualInputProps {
  label: string
  enName: string
  bnName: string
  enValue: string
  bnValue: string
  onEnChange: (value: string) => void
  onBnChange: (value: string) => void
  multiline?: boolean
  required?: boolean
}

export function BilingualInput({
  label,
  enName,
  bnName,
  enValue,
  bnValue,
  onEnChange,
  onBnChange,
  multiline = false,
  required,
}: BilingualInputProps) {
  const Field = multiline ? Textarea : Input

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Tabs defaultValue="en" className="w-full">
        <TabsList>
          <TabsTrigger value="en">English</TabsTrigger>
          <TabsTrigger value="bn">বাংলা</TabsTrigger>
        </TabsList>
        <TabsContent value="en">
          <Field
            name={enName}
            value={enValue}
            onChange={(e) => onEnChange(e.target.value)}
            required={required}
            rows={multiline ? 4 : undefined}
            placeholder="English"
          />
        </TabsContent>
        <TabsContent value="bn">
          <Field
            name={bnName}
            value={bnValue}
            onChange={(e) => onBnChange(e.target.value)}
            required={required}
            rows={multiline ? 4 : undefined}
            placeholder="বাংলা"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
