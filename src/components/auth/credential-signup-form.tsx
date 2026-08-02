"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type FormData = z.infer<typeof schema>

interface CredentialSignupFormProps {
  title: string
  description: string
  signupApiPath: string
  recoveryStorageKey: string
  recoveryPageHref: string
  loginHref: string
}

export function CredentialSignupForm({
  title,
  description,
  signupApiPath,
  recoveryStorageKey,
  recoveryPageHref,
  loginHref,
}: CredentialSignupFormProps) {
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setError(null)
    try {
      const { confirmPassword: _, ...payload } = data
      const res = await fetch(signupApiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Signup failed")
      if (!result.secretKey) throw new Error("Signup failed")
      sessionStorage.setItem(recoveryStorageKey, result.secretKey)
      window.location.replace(recoveryPageHref)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Signup failed")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating..." : "Create Account"}
            </Button>
            <Link href={loginHref} className="text-sm text-muted-foreground hover:text-primary">
              Already have an account? Sign in
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
