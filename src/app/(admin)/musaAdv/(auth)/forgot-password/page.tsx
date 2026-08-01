"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { resetPassword } from "./actions"
import { adminPath } from "@/lib/constants"

const schema = z.object({
  secretKey: z.string().min(1), newEmail: z.string().email().optional().or(z.literal("")),
  newPassword: z.string().min(8).optional().or(z.literal(""))
}).refine(d=>d.newEmail||d.newPassword,{message:"Provide new email or password"})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [error, setError] = useState<string|null>(null)
  const [success, setSuccess] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setError(null)
    const result = await resetPassword({
      secretKey: data.secretKey,
      newEmail: data.newEmail || undefined,
      newPassword: data.newPassword || undefined,
    })
    if (result.success) {
      setSuccess(true)
      return
    }
    setError(result.error)
  }

  if (success) return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm"><CardHeader><CardTitle className="text-center">Password Reset</CardTitle></CardHeader>
        <CardContent><p>Credentials updated. You can now log in.</p></CardContent>
        <CardFooter><Button onClick={()=>router.push(adminPath("login"))} className="w-full">Go to Login</Button></CardFooter>
      </Card>
    </div>
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle className="text-center">Forgot Password</CardTitle></CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label htmlFor="secretKey">Recovery Code</Label><Input id="secretKey" {...register("secretKey")} placeholder="Enter your recovery code" />{errors.secretKey && <p className="text-sm text-destructive">{errors.secretKey.message}</p>}</div>
            <div className="space-y-2"><Label htmlFor="newEmail">New Email (optional)</Label><Input id="newEmail" type="email" {...register("newEmail")} />{errors.newEmail && <p className="text-sm text-destructive">{errors.newEmail.message}</p>}</div>
            <div className="space-y-2"><Label htmlFor="newPassword">New Password (optional)</Label><Input id="newPassword" type="password" {...register("newPassword")} />{errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword.message}</p>}</div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter><Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting?"Resetting...":"Reset Password"}</Button></CardFooter>
        </form>
      </Card>
    </div>
  )
}
