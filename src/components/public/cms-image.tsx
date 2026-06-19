import Image, { type ImageProps } from "next/image"

/**
 * CMS images bypass Next.js image optimization so dashboard uploads
 * appear on the public site immediately after save.
 */
export function CmsImage(props: ImageProps) {
  const srcKey = typeof props.src === "string" ? props.src : "cms-image"
  return <Image {...props} key={srcKey} unoptimized />
}
