#!/bin/bash
set -e
cd /var/www/lawyer-app

mkdir -p src/app/api/admin/signup
mkdir -p "src/app/(admin)/musaAdv/(auth)/signup-recovery"

cat > src/lib/admin-signup.ts << 'EOF'
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { randomBytes } from "crypto"
import { z } from "zod"

export const adminSignupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(8),
})

export type AdminSignupInput = z.infer<typeof adminSignupSchema>

export async function createAdminAccount(data: AdminSignupInput) {
  const existing = await prisma.admin.findFirst()
  if (existing) throw new Error("Admin already exists")

  const hashedPw = await hash(data.password, 12)
  const rawSecret = randomBytes(32).toString("hex")
  const hashedSecret = await hash(rawSecret, 12)

  await prisma.admin.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: hashedPw,
      secretKey: hashedSecret,
    },
  })

  return { secretKey: rawSecret }
}
EOF

cat > src/app/api/admin/signup/route.ts << 'EOF'
import { NextResponse } from "next/server"
import { createAdminAccount, adminSignupSchema } from "@/lib/admin-signup"
import { rateLimiter } from "@/lib/rate-limiter"

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "anonymous"

  if (!rateLimiter(`signup-api:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many attempts." }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = adminSignupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }

  try {
    const result = await createAdminAccount(parsed.data)
    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Signup failed"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
EOF

cat > "src/app/(admin)/musaAdv/(auth)/signup/signup-gate.tsx" << 'EOF'
import Link from "next/link"
import { getLiveAdminCount } from "@/lib/admin-auth-redirect"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function SignupGate({ children }: { children: React.ReactNode }) {
  const adminCount = await getLiveAdminCount()
  if (adminCount > 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Already Exists</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              An admin account is already set up. Use the login page to continue.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/musaAdv/login">Go to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }
  return <>{children}</>
}
EOF

cat > "src/app/(admin)/musaAdv/(auth)/signup/page.tsx" << 'EOF'
"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(2), email: z.string().email(), phone: z.string().min(10),
  password: z.string().min(8), confirmPassword: z.string()
}).refine(d=>d.password===d.confirmPassword,{message:"Passwords don't match",path:["confirmPassword"]})

type FormData = z.infer<typeof schema>

export default function SignupPage() {
  const [error, setError] = useState<string|null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setError(null)
    try {
      const { confirmPassword: _, ...payload } = data
      const res = await fetch("/api/admin/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Signup failed")
      if (!result.secretKey) throw new Error("Signup failed")
      sessionStorage.setItem("admin_recovery_flash", result.secretKey)
      window.location.replace("/musaAdv/signup-recovery")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Signup failed")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Create Admin Account</CardTitle><CardDescription>One-time setup. You will get a recovery code.</CardDescription></CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" {...register("name")} />{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" {...register("email")} />{errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}</div>
            <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" {...register("phone")} />{errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}</div>
            <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" {...register("password")} />{errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}</div>
            <div className="space-y-2"><Label htmlFor="confirmPassword">Confirm Password</Label><Input id="confirmPassword" type="password" {...register("confirmPassword")} />{errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}</div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter><Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting?"Creating...":"Create Account"}</Button></CardFooter>
        </form>
      </Card>
    </div>
  )
}
EOF

cat > "src/app/(admin)/musaAdv/(auth)/signup-recovery/page.tsx" << 'EOF'
"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const STORAGE_KEY = "admin_recovery_flash"

export default function SignupRecoveryPage() {
  const router = useRouter()
  const [secretKey, setSecretKey] = useState<string | null>(null)

  useEffect(() => {
    const secret = sessionStorage.getItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    if (!secret) {
      router.replace("/musaAdv/login")
      return
    }
    setSecretKey(secret)
  }, [router])

  if (!secretKey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <p className="text-sm text-muted-foreground">Loading recovery code...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Recovery Code</CardTitle>
          <CardDescription>
            Copy this code and store it securely. It will be required to reset your password or email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="break-all rounded bg-muted p-3 font-mono text-sm">{secretKey}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push("/musaAdv/login")} className="w-full">
            Go to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
EOF

echo "Files updated. Verifying..."
grep -q "api/admin/signup" "src/app/(admin)/musaAdv/(auth)/signup/page.tsx" && echo "OK: signup page uses API"
test -f src/lib/admin-signup.ts && echo "OK: admin-signup.ts"
test -f src/app/api/admin/signup/route.ts && echo "OK: API route"

sudo -u postgres psql -d lawyer_db -c 'DELETE FROM "Admin";'

rm -rf .next
npm run build
pm2 restart lawyer-app

echo ""
echo "Test API:"
curl -s -o /dev/null -w "signup-recovery page: %{http_code}\n" http://localhost:3000/musaAdv/signup-recovery
echo "Done. Open http://advmusa.com/musaAdv/signup in Incognito"
