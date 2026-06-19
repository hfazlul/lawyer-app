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
