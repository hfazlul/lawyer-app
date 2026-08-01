"use client"

import { useMemo, useState } from "react"
import { Minus, Plus } from "lucide-react"
import { CmsImage } from "@/components/public/cms-image"
import {
  MAP_ZOOM_DEFAULT,
  MAP_ZOOM_MAX,
  MAP_ZOOM_MIN,
  normalizeGoogleMapInput,
  resolveZoomableMapEmbed,
} from "@/lib/map-embed"
import { cn } from "@/lib/utils"

interface OfficeMapProps {
  mapEmbedUrl?: string | null
  mapQuery?: string | null
  mapImage?: string | null
  mapLabel?: string | null
  className?: string
  placeholder?: string
  fullWidth?: boolean
}

function MapZoneOverlay({ zoom }: { zoom: number }) {
  const zoomOffset = MAP_ZOOM_DEFAULT - zoom
  const innerSize = 96 + zoomOffset * 16
  const outerSize = 168 + zoomOffset * 24

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center">
      <div
        className="office-map-zone-outer absolute rounded-full border-2 border-dashed border-gold/80 bg-gold/10"
        style={{ width: outerSize, height: outerSize }}
      />
      <div
        className="office-map-zone-inner absolute rounded-full border-[3px] border-navy/80 bg-navy/15"
        style={{ width: innerSize, height: innerSize }}
      />
      <div className="office-map-zone-pin absolute h-4 w-4 rounded-full border-[3px] border-white bg-gold shadow-md" />
    </div>
  )
}

export function OfficeMap({
  mapEmbedUrl,
  mapQuery,
  mapImage,
  mapLabel: _mapLabel,
  className,
  placeholder = "Map coming soon",
  fullWidth = false,
}: OfficeMapProps) {
  const [zoom, setZoom] = useState(MAP_ZOOM_DEFAULT)

  const mapConfig = useMemo(() => {
    const savedEmbed = normalizeGoogleMapInput(mapEmbedUrl)
    if (savedEmbed?.includes("/maps/embed") && zoom === MAP_ZOOM_DEFAULT) {
      return { src: savedEmbed, zoomable: true }
    }

    const fromEmbed = resolveZoomableMapEmbed(mapEmbedUrl, zoom)
    if (fromEmbed.src) return fromEmbed
    return resolveZoomableMapEmbed(mapQuery, zoom)
  }, [mapEmbedUrl, mapQuery, zoom])

  const zoomIn = () => setZoom((current) => Math.min(MAP_ZOOM_MAX, current + 1))
  const zoomOut = () => setZoom((current) => Math.max(MAP_ZOOM_MIN, current - 1))

  if (mapConfig.src) {
    return (
      <div
        className={cn(
          "relative overflow-hidden bg-muted",
          fullWidth
            ? "h-[28rem] w-full border-y border-border/60 shadow-inner md:h-[32rem]"
            : "h-72 rounded-lg border border-border/60 shadow-md",
          className
        )}
      >
        <iframe
          key={`${mapConfig.src}-${zoom}`}
          title="Office location map"
          src={mapConfig.src}
          className="h-full w-full border-0"
          loading="lazy"
          allowFullScreen
        />
        <MapZoneOverlay zoom={zoom} />
        <div className="absolute right-4 top-4 z-10 flex flex-col overflow-hidden rounded-lg border border-white/40 bg-navy/90 shadow-lg backdrop-blur-sm">
          <button
            type="button"
            onClick={zoomIn}
            disabled={zoom >= MAP_ZOOM_MAX}
            className="flex h-10 w-10 items-center justify-center text-white transition-colors hover:bg-gold/20 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </button>
          <div className="border-t border-white/20" />
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoom <= MAP_ZOOM_MIN}
            className="flex h-10 w-10 items-center justify-center text-white transition-colors hover:bg-gold/20 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  if (mapImage) {
    return (
      <div
        className={cn(
          "relative overflow-hidden bg-muted",
          fullWidth ? "h-[28rem] w-full md:h-[32rem]" : "h-72 rounded-lg shadow-md",
          className
        )}
      >
        <CmsImage src={mapImage} alt="Map" fill className="object-cover" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center border border-dashed bg-muted/50 text-sm text-muted-foreground",
        fullWidth ? "h-[20rem] w-full" : "h-72 rounded-lg",
        className
      )}
    >
      {placeholder}
    </div>
  )
}
