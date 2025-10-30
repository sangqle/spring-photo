export interface JustifiedLayoutImage {
  id: string;
  width: number;
  height: number;
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface JustifiedLayoutItem {
  id: string;
  rowIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  srcWidth: number;
  srcHeight: number;
  scale: number;
  crop: CropRect | null;
}

export interface JustifiedLayoutRowSummary {
  index: number;
  height: number;
  width: number;
  justified: boolean;
  itemCount: number;
}

export interface JustifiedLayoutResult {
  items: JustifiedLayoutItem[];
  rows: JustifiedLayoutRowSummary[];
  containerHeight: number;
}

export type RowHeightTolerance = { min: number; max: number } | [number, number] | number;

export type CropStrategy = 'center' | 'none';

export interface JustifiedLayoutOptions {
  containerWidth: number;
  spacing: number;
  targetRowHeight: number;
  rowHeightTolerance: RowHeightTolerance;
  justifyLastRow: boolean;
  maxScaleUp: number;
  cropStrategy?: CropStrategy;
  outputSpacingIncluded?: boolean;
  verticalSpacing?: number;
}

interface RowEntry {
  image: JustifiedLayoutImage;
  aspectRatio: number;
}

const EPSILON = 1e-3;

const sumAspectRatios = (entries: RowEntry[]): number => entries.reduce((total, entry) => total + entry.aspectRatio, 0);

export const computeJustifiedLayout = (
  images: JustifiedLayoutImage[],
  {
    containerWidth,
    spacing,
    targetRowHeight,
    rowHeightTolerance,
    justifyLastRow,
    maxScaleUp = 1.5,
    cropStrategy = 'center',
    outputSpacingIncluded = false,
    verticalSpacing,
  }: JustifiedLayoutOptions,
): JustifiedLayoutResult => {
  if (!images.length || containerWidth <= 0) {
    return { items: [], rows: [], containerHeight: 0 };
  }

  const { minHeight, maxHeight } = resolveRowHeightBounds(targetRowHeight, rowHeightTolerance);
  const rowVerticalSpacing = verticalSpacing ?? spacing;

  const items: JustifiedLayoutItem[] = [];
  const rows: JustifiedLayoutRowSummary[] = [];

  let workingRow: RowEntry[] = [];
  let yOffset = 0;
  let rowIndex = 0;
  const validEntries: RowEntry[] = images
    .filter((image) => Number.isFinite(image.width)
      && Number.isFinite(image.height)
      && image.width > 0
      && image.height > 0)
    .map((image) => ({ image, aspectRatio: image.width / image.height }));

  if (!validEntries.length) {
    return { items: [], rows: [], containerHeight: 0 };
  }

  const maxScaleMultiplier = Math.max(maxScaleUp, 1);

  const placeRow = (entries: RowEntry[], isLastRow: boolean, tryJustify: boolean, baseY: number, currentRowIndex: number): number => {
    if (!entries.length) {
      return 0;
    }

    const aspectSum = sumAspectRatios(entries);
    const totalSpacing = spacing * Math.max(entries.length - 1, 0);
    const availableWidth = Math.max(containerWidth - totalSpacing, 0);
    const idealHeight = aspectSum > 0 && availableWidth > 0
      ? availableWidth / aspectSum
      : targetRowHeight;

    const maxScaleCap = getMaxScaleCap(entries, maxScaleMultiplier);
    const maxAllowed = Number.isFinite(maxScaleCap)
      ? Math.min(maxHeight, maxScaleCap)
      : maxHeight;
    const effectiveMin = Math.min(minHeight, maxAllowed);

    let justified = tryJustify;
    let rowHeight = idealHeight;

    const canJustify = justified
      && Number.isFinite(idealHeight)
      && idealHeight >= effectiveMin - EPSILON
      && idealHeight <= maxAllowed + EPSILON
      && aspectSum > 0
      && availableWidth > 0;

    if (canJustify) {
      rowHeight = clamp(idealHeight, effectiveMin, maxAllowed);
    } else {
      justified = false;

      let fallback = Number.isFinite(idealHeight) && idealHeight > 0
        ? Math.min(idealHeight, targetRowHeight, maxAllowed)
        : Math.min(targetRowHeight, maxAllowed);

      if (!Number.isFinite(fallback) || fallback <= 0) {
        const scaleFallback = Number.isFinite(maxAllowed) ? maxAllowed : targetRowHeight;
        fallback = Math.max(1, Math.min(targetRowHeight, scaleFallback));
      }

      rowHeight = fallback;
    }

    rowHeight = clamp(rowHeight, 1, maxAllowed);

    const contentWidth = aspectSum > 0 ? rowHeight * aspectSum : 0;
    const occupiedWidth = contentWidth + totalSpacing;
    const leftover = Math.max(containerWidth - occupiedWidth, 0);
    const startX = justified ? 0 : leftover / 2;

    let cursorX = startX;

    entries.forEach((entry, index) => {
      const renderedWidth = entry.aspectRatio * rowHeight;
      const storedWidth = outputSpacingIncluded && index < entries.length - 1
        ? renderedWidth + spacing
        : renderedWidth;

      const scale = rowHeight / entry.image.height;

      const crop: CropRect | null = cropStrategy === 'none' ? null : null;

      items.push({
        id: entry.image.id,
        rowIndex: currentRowIndex,
        x: cursorX,
        y: baseY,
        width: storedWidth,
        height: rowHeight,
        srcWidth: entry.image.width,
        srcHeight: entry.image.height,
        scale,
        crop,
      });

      cursorX += renderedWidth + spacing;
    });

    rows.push({
      index: currentRowIndex,
      height: rowHeight,
      width: contentWidth,
      justified,
      itemCount: entries.length,
    });

    return rowHeight;
  };

  const flushRow = (entries: RowEntry[], isLastRow: boolean, tryJustify: boolean): void => {
    if (!entries.length) {
      return;
    }

    const rowHeight = placeRow(entries, isLastRow, tryJustify, yOffset, rowIndex);
    yOffset += rowHeight;
    if (!isLastRow) {
      yOffset += rowVerticalSpacing;
    }
    rowIndex += 1;
  };

  for (let index = 0; index < validEntries.length; index += 1) {
    const entry = validEntries[index];
    workingRow.push(entry);

    const aspectSum = sumAspectRatios(workingRow);
    const totalSpacing = spacing * Math.max(workingRow.length - 1, 0);
    const availableWidth = Math.max(containerWidth - totalSpacing, 0);
    const idealHeight = aspectSum > 0 && availableWidth > 0
      ? availableWidth / aspectSum
      : targetRowHeight;

    const maxScaleCap = getMaxScaleCap(workingRow, maxScaleMultiplier);
    const maxAllowed = Number.isFinite(maxScaleCap)
      ? Math.min(maxHeight, maxScaleCap)
      : maxHeight;
    const effectiveMin = Math.min(minHeight, maxAllowed);

    if (idealHeight < effectiveMin - EPSILON && workingRow.length > 1) {
      const overflow = workingRow.pop();
      if (workingRow.length) {
        flushRow([...workingRow], false, true);
      }
      workingRow = overflow ? [overflow] : [];
      continue;
    }

    if (idealHeight <= maxAllowed + EPSILON && idealHeight >= effectiveMin - EPSILON) {
      const isLastRow = index === validEntries.length - 1;
      flushRow([...workingRow], isLastRow, true);
      workingRow = [];
    }
  }

  if (workingRow.length) {
    flushRow([...workingRow], true, justifyLastRow);
  }

  return {
    items,
    rows,
    containerHeight: yOffset,
  };
};

const clamp = (value: number, lower: number, upper: number): number => {
  if (!Number.isFinite(value)) {
    return lower;
  }
  if (!Number.isFinite(upper)) {
    return Math.max(value, lower);
  }
  return Math.min(Math.max(value, lower), upper);
};

const resolveRowHeightBounds = (
  targetRowHeight: number,
  tolerance: RowHeightTolerance,
): { minHeight: number; maxHeight: number } => {
  let minRatio: number;
  let maxRatio: number;

  if (Array.isArray(tolerance)) {
    [minRatio, maxRatio] = tolerance;
  } else if (typeof tolerance === 'number') {
    const range = Math.max(tolerance, 0);
    minRatio = 1 - range;
    maxRatio = 1 + range;
  } else {
    minRatio = tolerance.min;
    maxRatio = tolerance.max;
  }

  if (!Number.isFinite(minRatio)) {
    minRatio = 1;
  }
  if (!Number.isFinite(maxRatio)) {
    maxRatio = 1;
  }

  if (minRatio > maxRatio) {
    [minRatio, maxRatio] = [maxRatio, minRatio];
  }

  const minHeight = Math.max(targetRowHeight * minRatio, 1);
  const maxHeight = Math.max(targetRowHeight * maxRatio, minHeight);

  return { minHeight, maxHeight };
};

const getMaxScaleCap = (entries: RowEntry[], maxScaleMultiplier: number): number => {
  if (!entries.length) {
    return Number.POSITIVE_INFINITY;
  }

  let cap = Number.POSITIVE_INFINITY;
  for (const entry of entries) {
    const allowed = entry.image.height * maxScaleMultiplier;
    if (Number.isFinite(allowed) && allowed > 0) {
      cap = Math.min(cap, allowed);
    }
  }

  return cap;
};
