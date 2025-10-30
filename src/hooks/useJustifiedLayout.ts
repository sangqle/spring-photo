import { useCallback, useEffect, useMemo, useState } from 'react';
import { Photo } from '../types/photo';
import {
  computeJustifiedLayout,
  JustifiedLayoutImage,
  JustifiedLayoutResult,
  RowHeightTolerance,
} from '../utils/justifiedLayout';

interface UseJustifiedLayoutOptions {
  photos: Photo[];
  gap: number;
  targetRowHeight: number;
  containerRef: { current: HTMLElement | null };
  rowHeightTolerance?: RowHeightTolerance;
  justifyLastRow?: boolean;
  maxScaleUp?: number;
}

const EMPTY_RESULT: JustifiedLayoutResult = { items: [], rows: [], containerHeight: 0 };

const useJustifiedLayout = ({
  photos,
  gap,
  targetRowHeight,
  containerRef,
  rowHeightTolerance = [0.75, 1.35],
  justifyLastRow = true,
  maxScaleUp = 1.6,
}: UseJustifiedLayoutOptions): JustifiedLayoutResult => {
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const updateWidth = useCallback(() => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      setContainerWidth(Math.floor(width));
    }
  }, [containerRef]);

  useEffect(() => {
    updateWidth();

    if (!containerRef.current) {
      return undefined;
    }

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateWidth);
      return () => {
        window.removeEventListener('resize', updateWidth);
      };
    }

    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef, updateWidth]);

  const memoKey = useMemo(() => JSON.stringify(photos.map((photo) => ({
    id: photo.id,
    width: photo.metadata?.width ?? null,
    height: photo.metadata?.height ?? null,
    aspectRatio: photo.metadata?.aspectRatio ?? null,
  }))), [photos]);

  const layout = useMemo(() => {
    if (!containerWidth || photos.length === 0) {
      return EMPTY_RESULT;
    }

    const images: JustifiedLayoutImage[] = photos.map((photo) => {
      const metaWidth = photo.metadata?.width;
      const metaHeight = photo.metadata?.height;
      const metaAspect = photo.metadata?.aspectRatio;

      const inferredAspect = metaWidth && metaHeight && metaHeight !== 0
        ? metaWidth / metaHeight
        : metaAspect && metaAspect > 0
          ? metaAspect
          : 3 / 2;

      const referenceHeight = metaHeight && metaHeight > 0 ? metaHeight : targetRowHeight;
      const inferredWidth = inferredAspect * referenceHeight;

      return {
        id: photo.id,
        width: metaWidth && metaWidth > 0 ? metaWidth : inferredWidth,
        height: referenceHeight,
      };
    });

    return computeJustifiedLayout(images, {
      containerWidth,
      spacing: gap,
      targetRowHeight,
      rowHeightTolerance,
      justifyLastRow,
      maxScaleUp,
      cropStrategy: 'center',
      outputSpacingIncluded: false,
      verticalSpacing: gap,
    });
  }, [memoKey, containerWidth, gap, justifyLastRow, maxScaleUp, rowHeightTolerance, targetRowHeight]);

  return layout;
};

export default useJustifiedLayout;
