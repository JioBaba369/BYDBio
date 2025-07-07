
'use client'

import React, { useState, useCallback } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import getCroppedImg from '@/lib/crop-image';

interface ImageCropperProps {
  imageSrc: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCropComplete: (croppedImageUrl: string) => void;
  aspectRatio?: number;
  isRound?: boolean;
}

export default function ImageCropper({ 
  imageSrc, 
  open, 
  onOpenChange, 
  onCropComplete, 
  aspectRatio = 1,
  isRound = true,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  
  const handleCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleShowCroppedImage = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) {
      return
    }
    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        'image/png' // Always use PNG to support transparency
      )
      if (croppedImage) {
        onCropComplete(croppedImage)
      }
      onOpenChange(false)
    } catch (e) {
      console.error(e)
    }
  }, [imageSrc, croppedAreaPixels, onCropComplete, onOpenChange])
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        // Reset state when closing the dialog
        setZoom(1);
        setCrop({ x: 0, y: 0 });
    }
    onOpenChange(isOpen);
  }


  if (!imageSrc) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crop Your Image</DialogTitle>
          <DialogDescription>
            Adjust the image to get the perfect fit.
          </DialogDescription>
        </DialogHeader>
        <div className="relative h-80 w-full bg-muted rounded-md overflow-hidden">
           <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
            cropShape={isRound ? "round" : "rect"}
            showGrid={false}
          />
        </div>
        <div className="space-y-2 py-4">
            <label htmlFor="zoom" className="text-sm font-medium text-muted-foreground">Zoom</label>
            <Slider
                id="zoom"
                min={1}
                max={3}
                step={0.1}
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
            />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button onClick={handleShowCroppedImage}>Save Image</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
