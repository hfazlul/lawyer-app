import { Scale } from "lucide-react"
import { CmsImage } from "@/components/public/cms-image"
import { cn } from "@/lib/utils"

interface ServiceCardHeaderProps {
  src?: string | null
  alt: string
  className?: string
}

export function ServiceCardHeader({ src, alt, className }: ServiceCardHeaderProps) {
  return (
    <div
      className={cn(
        "relative aspect-[3/2] overflow-hidden rounded-xl bg-gradient-to-br from-navy/5 via-muted/40 to-gold/15",
        className
      )}
    >
      {src ? (
        <CmsImage
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <Scale className="h-10 w-10 text-gold/35" strokeWidth={1.25} />
        </div>
      )}
    </div>
  )
}
