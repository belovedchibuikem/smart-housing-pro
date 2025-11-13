"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import type { PropertyImage } from "@/lib/api/client"

type PropertyGalleryProps = {
  images?: PropertyImage[]
}

export function PropertyGallery({ images }: PropertyGalleryProps) {
  const imageList = useMemo(() => {
    return Array.isArray(images) && images.length > 0 ? images : []
  }, [images])

  const [activeIndex, setActiveIndex] = useState(0)
  const [viewerOpen, setViewerOpen] = useState(false)

  const currentImage = imageList[activeIndex]

  const hasImages = imageList.length > 0

  const showPrev = () => {
    if (!hasImages) return
    setActiveIndex((prev) => (prev - 1 + imageList.length) % imageList.length)
  }

  const showNext = () => {
    if (!hasImages) return
    setActiveIndex((prev) => (prev + 1) % imageList.length)
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="relative group rounded-t-lg overflow-hidden">
            {currentImage ? (
              <Image
                src={currentImage.url || "/placeholder.svg"}
                alt={currentImage.caption ?? "Property image"}
                width={1280}
                height={720}
                className="h-96 w-full cursor-zoom-in object-cover transition-transform duration-500 group-hover:scale-105"
                onClick={() => setViewerOpen(true)}
              />
            ) : (
              <div className="flex h-96 w-full items-center justify-center bg-muted text-muted-foreground">
                <ImageIcon className="h-10 w-10" />
              </div>
            )}

            {imageList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrev}
                  className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60 group-hover:flex"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60 group-hover:flex"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1">
                  {imageList.map((image, index) => (
                    <button
                      key={image.id ?? image.url}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`h-2 w-2 rounded-full transition ${index === activeIndex ? "bg-white" : "bg-white/40"}`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {imageList.length > 1 && (
            <div className="grid grid-cols-3 gap-2 p-4">
              {imageList.map((image, index) => (
                <button
                  key={image.id ?? image.url}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`overflow-hidden rounded border ${index === activeIndex ? "border-primary" : "border-transparent"}`}
                >
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={image.caption ?? ""}
                    width={400}
                    height={300}
                    className="h-24 w-full object-cover transition hover:opacity-80"
                  />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {viewerOpen && currentImage && (
        <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
          <DialogContent className="max-w-4xl bg-background/95">
            <DialogTitle className="sr-only">Property image preview</DialogTitle>
            <div className="relative flex flex-col items-center gap-4">
              <div className="relative w-full overflow-hidden rounded-lg bg-black">
                <Image
                  src={currentImage.url || "/placeholder.svg"}
                  alt={currentImage.caption ?? "Property image"}
                  width={1600}
                  height={900}
                  className="h-[70vh] w-full object-contain"
                />
                {imageList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={showPrev}
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={showNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>

              {imageList.length > 1 && (
                <div className="grid w-full grid-cols-4 gap-2">
                  {imageList.map((image, index) => (
                    <button
                      key={image.id ?? image.url}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`overflow-hidden rounded border ${index === activeIndex ? "border-primary" : "border-transparent"}`}
                    >
                      <Image
                        src={image.url || "/placeholder.svg"}
                        alt={image.caption ?? ""}
                        width={300}
                        height={200}
                        className="h-20 w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

