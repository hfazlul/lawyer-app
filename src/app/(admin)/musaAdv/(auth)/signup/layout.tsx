import SignupGate from "./signup-gate"

export const dynamic = "force-dynamic"

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <SignupGate>{children}</SignupGate>
}
