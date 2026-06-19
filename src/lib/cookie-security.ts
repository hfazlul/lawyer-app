/** Secure cookies only when the public site URL uses HTTPS. */
export function useSecureCookies(): boolean {
  return process.env.AUTH_URL?.startsWith("https://") ?? false
}
