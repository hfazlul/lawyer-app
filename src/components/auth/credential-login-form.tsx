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
import type { AuthPortal } from "@/lib/auth"

const schema = z.object({
  email: z.string().email().transform((v) => v.trim().toLowerCase()),
  password: z.string().min(8),
})
type FormData = z.infer<typeof schema>

function mapSignInError(code: string | undefined): string {
  switch (code) {
    case "CredentialsSignin":
      return "Invalid email or password"
    case "MissingCSRF":
      return "Security token expired. Refresh the page and try again."
    case "Configuration":
      return "Server auth misconfigured (AUTH_URL / AUTH_SECRET). Contact support."
    default:
      return code ? `Login failed (${code})` : "Login failed"
  }
}

interface CredentialLoginFormProps {
  portal: AuthPortal
  title: string
  basePath: string
  defaultDestination: string
  forgotPasswordHref: string
  signupHref?: string
}

export function CredentialLoginForm({
  portal,
  title,
  basePath,
  defaultDestination,
  forgotPasswordHref,
  signupHref,
}: CredentialLoginFormProps) {
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError(null)

    const check = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email, password: data.password, portal }),
    })
    const checkBody = (await check.json().catch(() => ({}))) as { error?: string; reason?: string }
    if (!check.ok) {
      setError(checkBody.error ?? "Invalid email or password")
      return
    }

    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (res?.error) {
      setError(
        `Password is correct but session failed: ${mapSignInError(res.error)}. ` +
          "Try the same URL as AUTH_URL (with or without www)."
      )
      return
    }

    const params = new URLSearchParams(window.location.search)
    const callbackUrl = params.get("callbackUrl")
    const destination =
      callbackUrl?.startsWith(basePath) && !callbackUrl.startsWith("//")
        ? callbackUrl
        : defaultDestination
    window.location.assign(destination)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl">{title}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                placeholder="email@example.com"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
            <Link href={forgotPasswordHref} className="text-sm text-muted-foreground hover:text-primary">
              Forgot password?
            </Link>
            {signupHref && (
              <Link href={signupHref} className="text-sm text-muted-foreground hover:text-primary">
                Create an account
              </Link>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
