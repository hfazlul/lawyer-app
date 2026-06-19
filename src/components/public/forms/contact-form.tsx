"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { contactFormSchema } from "@/lib/validations/messages"
import { submitContact } from "@/actions/public/submit-contact"
import { toast } from "sonner"
import { z } from "zod"
import type { Language } from "@/types"

type FormData = z.infer<typeof contactFormSchema>

export function ContactForm({ lang }: { lang: Language }) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(contactFormSchema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setSubmitted(false)
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => fd.append(k, v ?? ""))
    const result = await submitContact(fd)
    setLoading(false)
    if (result.success) {
      toast.success(lang === "bn" ? "বার্তা পাঠানো হয়েছে" : "Message sent successfully")
      setSubmitted(true)
      reset()
    } else {
      toast.error(lang === "bn" ? "পাঠাতে ব্যর্থ" : "Failed to send")
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
            ? "আপনার বার্তা পেয়েছি। শীঘ্রই উত্তর দেব।"
            : "We received your message and will respond soon."}
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
          {lang === "bn" ? "আরেকটি বার্তা পাঠান" : "Send another message"}
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
        <Label htmlFor="message">{lang === "bn" ? "বার্তা" : "Message"}</Label>
        <Textarea
          id="message"
          rows={5}
          placeholder={lang === "bn" ? "আপনার বার্তা লিখুন..." : "Write your message here..."}
          {...register("message")}
          className="mt-1.5"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-navy hover:bg-navy/90">
        {loading ? (lang === "bn" ? "পাঠানো হচ্ছে..." : "Sending...") : (lang === "bn" ? "পাঠান" : "Send Message")}
      </Button>
    </form>
  )
}
