const map = new Map<string,{count:number;resetTime:number}>()
export function rateLimiter(key:string, max:number, windowMs:number):boolean {
  const now = Date.now()
  const entry = map.get(key)
  if(!entry || now > entry.resetTime) { map.set(key,{count:1,resetTime:now+windowMs}); return true }
  if(entry.count >= max) return false
  entry.count++
  return true
}
