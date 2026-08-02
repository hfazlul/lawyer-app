function asPdfBlob(blob: Blob) {
  if (blob.type === "application/pdf") return blob
  return new Blob([blob], { type: "application/pdf" })
}

function isMobileDevice() {
  if (typeof navigator === "undefined") return false
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

export function isCauseListMobileDevice() {
  return isMobileDevice()
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(asPdfBlob(blob))
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.style.display = "none"
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function tryNativePdfShare(blob: Blob, filename: string) {
  if (typeof navigator.share !== "function") return false

  const file = new File([asPdfBlob(blob)], filename, { type: "application/pdf" })

  try {
    await navigator.share({ files: [file] })
    return true
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error
    return false
  }
}

export async function shareCauseListPdf(blob: Blob, filename: string) {
  const sharedNatively = await tryNativePdfShare(blob, filename)
  if (sharedNatively) return "shared" as const

  downloadBlob(blob, filename)
  return "downloaded" as const
}

export async function openCauseListPdf(blob: Blob) {
  const url = URL.createObjectURL(asPdfBlob(blob))
  window.open(url, "_blank", "noopener,noreferrer")
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
