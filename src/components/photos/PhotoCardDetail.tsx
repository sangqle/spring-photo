import Image from 'next/image';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { Photo } from '../../types/photo';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

interface PhotoCardDetailProps {
  photo: Photo;
  isOpen: boolean;
  onClose: () => void;
}

const formatDate = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : format(date, 'PPpp');
};

const PhotoCardDetail: React.FC<PhotoCardDetailProps> = ({ photo, isOpen, onClose }) => {
  const imageSrc = photo.url?.trim();
  const title = photo.title?.trim() || 'Untitled photo';
  const description = photo.description?.trim();
  const photographer = photo.username?.trim() || photo.userId?.trim();
  const metadata = photo.metadata ?? {};
  const [zoomMode, setZoomMode] = useState<'default' | 'fit' | 'original'>('default');
  const [isDragging, setIsDragging] = useState(false);
  const [imageNaturalSize, setImageNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const zoomContainerRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
  });
  const containerSizeRef = useRef({ width: 0, height: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const isZoomed = zoomMode !== 'default';
  const isPanEnabled = zoomMode === 'original';

  const createdAt = photo.createdAt ?? photo.uploadedAt ?? metadata.dateTaken ?? undefined;
  const createdAtDisplay = formatDate(createdAt);
  const dateTakenDisplay = metadata.dateTaken ? formatDate(metadata.dateTaken) : undefined;

  const dimensions = useMemo(() => {
    if (metadata.width && metadata.height) {
      return `${metadata.width} × ${metadata.height}px`;
    }
    return undefined;
  }, [metadata.height, metadata.width]);

  const resolvedImageSize = useMemo(() => {
    if (imageNaturalSize) {
      return imageNaturalSize;
    }

    if (metadata.width && metadata.height) {
      return { width: metadata.width, height: metadata.height };
    }

    return null;
  }, [imageNaturalSize, metadata.height, metadata.width]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const stopDragging = useCallback(() => {
    const container = zoomContainerRef.current;
    if (container && dragState.current.pointerId !== -1) {
      try {
        container.releasePointerCapture(dragState.current.pointerId);
      } catch (error) {
        // Ignore release errors if pointer capture was not set.
      }
    }
    dragState.current = {
      active: false,
      pointerId: -1,
      startX: 0,
      startY: 0,
      startOffsetX: 0,
      startOffsetY: 0,
    };
    setIsDragging(false);
  }, []);

  const toggleZoom = useCallback(() => {
    if (!imageSrc) {
      return;
    }
    setZoomMode((mode) => {
      const nextMode = mode === 'default' ? 'fit' : mode === 'fit' ? 'original' : 'default';

      if (mode === 'original') {
        stopDragging();
      }

      setIsDragging(false);
      setPanOffset({ x: 0, y: 0 });

      return nextMode;
    });
  }, [imageSrc, stopDragging]);

  useEffect(() => {
    if (!isOpen && zoomMode !== 'default') {
      setZoomMode('default');
      stopDragging();
    }
  }, [isOpen, zoomMode, stopDragging]);

  useEffect(() => {
    setImageNaturalSize(null);
    setPanOffset({ x: 0, y: 0 });
    setZoomMode('default');
    dragState.current = {
      active: false,
      pointerId: -1,
      startX: 0,
      startY: 0,
      startOffsetX: 0,
      startOffsetY: 0,
    };
  }, [imageSrc]);

  useEffect(() => {
    const container = zoomContainerRef.current;
    if (!container) {
      return;
    }

    const updateSize = () => {
      const nextWidth = container.clientWidth;
      const nextHeight = container.clientHeight;

      containerSizeRef.current = { width: nextWidth, height: nextHeight };
      setContainerSize((current) => {
        if (current.width === nextWidth && current.height === nextHeight) {
          return current;
        }
        return { width: nextWidth, height: nextHeight };
      });
    };

    updateSize();

    const handleResize = () => updateSize();

    window.addEventListener('resize', handleResize);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(updateSize);
      observer.observe(container);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [isOpen, isZoomed]);

  const startDragging = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isZoomed || event.button !== 0) {
        return;
      }

      const container = zoomContainerRef.current;
      if (!container) {
        return;
      }

      dragState.current = {
        active: true,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startOffsetX: panOffset.x,
        startOffsetY: panOffset.y,
      };

      try {
        container.setPointerCapture(event.pointerId);
      } catch (error) {
        // Ignore capture errors when unsupported.
      }

      setIsDragging(true);
      event.preventDefault();
    },
    [isZoomed, panOffset.x, panOffset.y],
  );

  const getPanBounds = useCallback(() => {
    const imageWidth = resolvedImageSize?.width ?? 0;
    const imageHeight = resolvedImageSize?.height ?? 0;
    const { width: containerWidth, height: containerHeight } = containerSizeRef.current;

    const spaceX = containerWidth - imageWidth;
    const spaceY = containerHeight - imageHeight;

    const minX = spaceX < 0 ? spaceX : spaceX / 2;
    const maxX = spaceX < 0 ? 0 : spaceX / 2;
    const minY = spaceY < 0 ? spaceY : spaceY / 2;
    const maxY = spaceY < 0 ? 0 : spaceY / 2;
    const centerX = spaceX / 2;
    const centerY = spaceY / 2;

    return { minX, maxX, minY, maxY, centerX, centerY };
  }, [resolvedImageSize, containerSize.width, containerSize.height]);

  const handleDragging = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragState.current.active) {
        return;
      }

      event.preventDefault();

      const { minX, maxX, minY, maxY } = getPanBounds();
      const deltaX = event.clientX - dragState.current.startX;
      const deltaY = event.clientY - dragState.current.startY;

      const nextX = clamp(dragState.current.startOffsetX + deltaX, minX, maxX);
      const nextY = clamp(dragState.current.startOffsetY + deltaY, minY, maxY);

      setPanOffset((current) => {
        if (current.x === nextX && current.y === nextY) {
          return current;
        }
        return { x: nextX, y: nextY };
      });
    },
    [getPanBounds],
  );

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (!isZoomed) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const { minX, maxX, minY, maxY } = getPanBounds();
      const deltaX = event.deltaX;
      const deltaY = event.deltaY;

      setPanOffset((current) => {
        const nextX = clamp(current.x - deltaX, minX, maxX);
        const nextY = clamp(current.y - deltaY, minY, maxY);
        if (nextX === current.x && nextY === current.y) {
          return current;
        }
        return { x: nextX, y: nextY };
      });
    },
    [getPanBounds, isZoomed],
  );

  const endDragging = useCallback(() => {
    if (!dragState.current.active) {
      return;
    }

    stopDragging();
  }, [stopDragging]);

  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.currentTarget;
    if (target.naturalWidth && target.naturalHeight) {
      setImageNaturalSize({ width: target.naturalWidth, height: target.naturalHeight });
    }
  }, []);

  useLayoutEffect(() => {
    if (!isZoomed) {
      return;
    }

    const { minX, maxX, minY, maxY, centerX, centerY } = getPanBounds();

    setPanOffset((current) => {
      if (current.x === 0 && current.y === 0) {
        return { x: centerX, y: centerY };
      }

      const clampedX = clamp(current.x, minX, maxX);
      const clampedY = clamp(current.y, minY, maxY);

      if (clampedX === current.x && clampedY === current.y) {
        return current;
      }

      return { x: clampedX, y: clampedY };
    });
  }, [getPanBounds, isZoomed]);

  if (!isOpen) {
    return null;
  }

  const infoItems = [
    { label: 'Photographer', value: photographer },
    { label: 'Uploaded', value: createdAtDisplay },
    { label: 'Captured', value: dateTakenDisplay },
    { label: 'Camera', value: metadata.cameraModel ?? metadata.cameraMake },
    { label: 'Lens', value: metadata.lens },
    { label: 'Dimensions', value: dimensions },
    { label: 'Aperture', value: metadata.aperture },
    { label: 'Shutter Speed', value: metadata.shutterSpeed },
    { label: 'ISO', value: metadata.iso ? metadata.iso.toString() : undefined },
    { label: 'Focal Length', value: metadata.focalLength },
    { label: 'Location', value: metadata.location },
  ].filter((item) => Boolean(item.value));

  const modalContainerClasses = isZoomed
    ? 'max-h-[100vh] max-w-[100vw]'
    : 'max-h-[calc(100vh-3rem)] max-w-[min(1200px,96vw)] md:flex-row';

  const infoPanelDisplayClass = isZoomed ? 'hidden md:hidden' : 'flex';
  const zoomHint = isZoomed ? 'Double-click to exit zoom' : 'Double-click to view original size';
  const zoomMessage = isZoomed ? `Drag to explore - ${zoomHint}` : zoomHint;

  const zoomWrapperStyle: CSSProperties = resolvedImageSize
    ? {
      position: 'absolute',
      top: 0,
      left: 0,
      width: `${resolvedImageSize.width}px`,
      height: `${resolvedImageSize.height}px`,
      transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0)`,
      willChange: 'transform',
    }
    : {
      position: 'absolute',
      top: 0,
      left: 0,
      transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0)`,
      willChange: 'transform',
    };

  const zoomedImageStyle: CSSProperties = resolvedImageSize
    ? { display: 'block', width: '100%', height: '100%' }
    : { display: 'block', minWidth: '100%', minHeight: '100%' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6">
      <button
        type="button"
        className="absolute inset-0 h-full w-full bg-black/70"
        aria-label="Close photo detail"
        onClick={onClose}
      />
      <div
        className={`relative z-10 flex h-full w-full flex-col overflow-hidden rounded-3xl bg-card-darker shadow-2xl ${modalContainerClasses}`}
      >
        <div
          className={`relative flex-1 bg-black ${imageSrc
              ? isZoomed
                ? isDragging
                  ? 'cursor-grabbing'
                  : 'cursor-grab'
                : 'cursor-zoom-in'
              : ''
            }`}
          onDoubleClick={toggleZoom}
        >
          {imageSrc ? (
            isZoomed ? (
              <div
                ref={zoomContainerRef}
                className="relative h-full w-full select-none overflow-hidden bg-black"
                onPointerDown={startDragging}
                onPointerMove={handleDragging}
                onPointerUp={endDragging}
                onPointerLeave={endDragging}
                onPointerCancel={endDragging}
                onWheel={handleWheel}
                style={{ touchAction: 'none', overscrollBehavior: 'none' }}
              >
                <div className="absolute top-0 left-0 will-change-transform" style={zoomWrapperStyle}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageSrc}
                    alt={title}
                    className="block h-auto w-auto max-w-none"
                    loading="lazy"
                    draggable={false}
                    onLoad={handleImageLoad}
                    style={zoomedImageStyle}
                  />
                </div>
              </div>
            ) : (
              <Image
                src={imageSrc}
                alt={title}
                fill
                priority
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 720px"
              />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-card text-gray-300">
              <span className="rounded-full border border-gray-700 px-3 py-1 text-xs uppercase tracking-wide">
                No Image
              </span>
            </div>
          )}
          {imageSrc ? (
            <span className="pointer-events-none absolute bottom-4 right-4 hidden rounded-full bg-black/60 px-3 py-1 text-xs text-gray-200 md:block">
              {zoomMessage}
            </span>
          ) : null}
        </div>

        <div className={`${infoPanelDisplayClass} w-full flex-col gap-5 overflow-y-auto p-6 md:w-[360px] md:p-8`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white sm:text-xl">{title}</h2>
              {photographer ? <p className="mt-1 text-sm text-gray-300">by {photographer}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-gray-200 transition hover:bg-white/10 hover:text-white"
              aria-label="Close photo detail"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {description ? <p className="text-sm leading-relaxed text-gray-200">{description}</p> : null}

          {infoItems.length > 0 ? (
            <dl className="grid grid-cols-1 gap-3 text-sm text-gray-300">
              {infoItems.map((item) => (
                <div key={item.label} className="border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
                  <dt className="text-xs uppercase tracking-wide text-gray-400">{item.label}</dt>
                  <dd className="mt-1 text-sm text-gray-100">{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PhotoCardDetail;
