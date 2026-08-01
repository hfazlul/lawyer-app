"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2 } from "lucide-react"
import { format, parseISO, startOfToday } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { appointmentFormSchema } from "@/lib/validations/messages"
import { submitAppointment } from "@/actions/public/submit-appointment"
import { toast } from "sonner"
import { z } from "zod"
import type { Language } from "@/types"

type FormData = z.infer<typeof appointmentFormSchema>

function parsePreferredDate(value?: string) {
  if (!value) return undefined
  const parsed = parseISO(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

export function AppointmentForm({ lang }: { lang: Language }) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(appointmentFormSchema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setSubmitted(false)
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => fd.append(k, v ?? ""))
    const result = await submitAppointment(fd)
    setLoading(false)
    if (result.success) {
      toast.success(lang === "bn" ? "অ্যাপয়েন্টমেন্ট জমা হয়েছে" : "Appointment submitted successfully")
      setSubmitted(true)
      reset()
    } else {
      toast.error(lang === "bn" ? "জমা দিতে ব্যর্থ" : "Submission failed")
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center rounded-lg border border-gold/30 bg-gold/5 px-6 py-10 text-center">
        <CheckCircle2 className="mb-4 h-12 w-12 text-gold" />
        <h3 className="text-lg font-semibold text-navy">
          {lang === "bn" ? "ধন্যবাদ!" : "Thank you!"}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {lang === "bn"
            ? "আপনার অ্যাপয়েন্টমেন্ট অনুরোধ পেয়েছি। শীঘ্রই যোগাযোগ করব।"
            : "We received your appointment request and will contact you shortly."}
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
          {lang === "bn" ? "আরেকটি জমা দিন" : "Submit another"}
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <Label htmlFor="name">{lang === "bn" ? "নাম" : "Name"}</Label>
        <Input id="name" {...register("name")} className="mt-1.5" />
        {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="phone">{lang === "bn" ? "ফোন" : "Phone"}</Label>
        <Input id="phone" {...register("phone")} className="mt-1.5" />
        {errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="serviceType">{lang === "bn" ? "সেবার ধরন" : "Service Type"}</Label>
        <Input id="serviceType" {...register("serviceType")} className="mt-1.5" />
      </div>
      <div>
        <Label>{lang === "bn" ? "পছন্দের তারিখ" : "Preferred Date"}</Label>
        <Controller
          name="preferredDate"
          control={control}
          render={({ field }) => (
            <div className="mt-1.5 rounded-lg border border-border/70 bg-card p-3 shadow-sm">
              <Calendar
                mode="single"
                selected={parsePreferredDate(field.value)}
                onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                disabled={(date) => date < startOfToday()}
                initialFocus
                className="mx-auto w-full max-w-none"
              />
              {field.value ? (
                <p className="mt-3 border-t border-border/60 pt-3 text-center text-sm text-muted-foreground">
                  {lang === "bn" ? "নির্বাচিত তারিখ:" : "Selected date:"}{" "}
                  <span className="font-medium text-navy">{field.value}</span>
                </p>
              ) : null}
            </div>
          )}
        />
      </div>
      <div>
        <Label htmlFor="message">{lang === "bn" ? "বার্তা" : "Message"}</Label>
        <Textarea
          id="message"
          rows={4}
          placeholder={lang === "bn" ? "আপনার আইনি বিষয় সংক্ষেপে লিখুন..." : "Briefly describe your legal matter..."}
          {...register("message")}
          className="mt-1.5"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-navy hover:bg-navy/90">
        {loading ? (lang === "bn" ? "জমা হচ্ছে..." : "Submitting...") : (lang === "bn" ? "জমা দিন" : "Submit Appointment")}
      </Button>
    </form>
  )
}
