"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface CredentialSignupRecoveryProps {
  storageKey: string
  loginHref: string
}

export function CredentialSignupRecovery({ storageKey, loginHref }: CredentialSignupRecoveryProps) {
  const router = useRouter()
  const [secretKey, setSecretKey] = useState<string | null>(null)

  useEffect(() => {
    const secret = sessionStorage.getItem(storageKey)
    sessionStorage.removeItem(storageKey)
    if (!secret) {
      router.replace(loginHref)
      return
    }
    setSecretKey(secret)
  }, [router, storageKey, loginHref])

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
          <Button onClick={() => router.push(loginHref)} className="w-full">
            Go to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
