"use client"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({ email: z.string().email(), password: z.string().min(6) })
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const [error, setError] = useState<string|null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setError(null)
    const res = await signIn("credentials", { email: data.email, password: data.password, redirect: false })
    if (res?.error) {
      setError("Invalid email or password")
      return
    }
    // Full page navigation so the session cookie is sent on the first dashboard
    // request. Client-side router.push can race ahead of cookie persistence on
    // mobile Safari, causing middleware to bounce back to login.
    const params = new URLSearchParams(window.location.search)
    const callbackUrl = params.get("callbackUrl")
    const destination =
      callbackUrl?.startsWith("/musaAdv") && !callbackUrl.startsWith("//")
        ? callbackUrl
        : "/musaAdv/dashboard"
    window.location.assign(destination)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle className="text-center text-2xl">Admin Login</CardTitle></CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" {...register("email")} placeholder="admin@example.com" />{errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}</div>
            <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" {...register("password")} />{errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}</div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting?"Signing in...":"Sign In"}</Button>
            <Link href="/musaAdv/forgot-password" className="text-sm text-muted-foreground hover:text-primary">Forgot password?</Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
