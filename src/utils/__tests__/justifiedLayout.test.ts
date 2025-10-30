import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  computeJustifiedLayout,
  JustifiedLayoutImage,
} from '../justifiedLayout';

test('creates balanced rows for mixed orientations', () => {
  const images: JustifiedLayoutImage[] = [
    { id: 'a', width: 4000, height: 3000 }, // landscape
    { id: 'b', width: 2000, height: 3200 }, // portrait
    { id: 'c', width: 3500, height: 2400 }, // landscape
    { id: 'd', width: 1800, height: 2700 }, // portrait
    { id: 'e', width: 4200, height: 3200 }, // landscape
  ];

  const result = computeJustifiedLayout(images, {
    containerWidth: 1200,
    spacing: 16,
    targetRowHeight: 320,
    rowHeightTolerance: [0.75, 1.3],
    justifyLastRow: true,
    maxScaleUp: 1.6,
  });

  assert.equal(result.rows.length, 2, 'expected two rows for mixed layout');
  assert.equal(result.rows[0].itemCount, 3, 'first row should contain three images');
  assert.equal(result.rows[1].itemCount, 2, 'second row should contain two images');

  const firstRow = result.rows[0];
  assert.ok(firstRow.justified, 'first row should be justified');

  const occupiedWidth = firstRow.width + 16 * (firstRow.itemCount - 1);
  assert.ok(Math.abs(occupiedWidth - 1200) < 1, 'first row should fill container width');
});

test('handles ultra-wide panorama as single justified row', () => {
  const images: JustifiedLayoutImage[] = [
    { id: 'panorama', width: 10000, height: 2000 },
    { id: 'filler-1', width: 3200, height: 4800 },
    { id: 'filler-2', width: 2800, height: 4300 },
  ];

  const result = computeJustifiedLayout(images, {
    containerWidth: 1400,
    spacing: 12,
    targetRowHeight: 300,
    rowHeightTolerance: [0.7, 1.35],
    justifyLastRow: false,
    maxScaleUp: 1.5,
  });

  assert.equal(result.rows.length, 2, 'expected panorama row plus trailing row');
  assert.equal(result.rows[0].itemCount, 1, 'panorama should occupy its own row');
  assert.ok(result.rows[0].height <= 300 * 1.35, 'panorama row height within tolerance');
  assert.equal(result.rows[1].itemCount, 2, 'remaining images should share last row');
  assert.ok(!result.rows[1].justified, 'last row left-aligned when not justified');
});

test('stacks tall portraits allowing up to four per row', () => {
  const images: JustifiedLayoutImage[] = [
    { id: 'p1', width: 2000, height: 3200 },
    { id: 'p2', width: 2100, height: 3300 },
    { id: 'p3', width: 1900, height: 3000 },
    { id: 'p4', width: 2050, height: 3300 },
    { id: 'landscape', width: 4000, height: 2500 },
  ];

  const result = computeJustifiedLayout(images, {
    containerWidth: 1100,
    spacing: 12,
    targetRowHeight: 340,
    rowHeightTolerance: { min: 0.8, max: 1.3 },
    justifyLastRow: true,
    maxScaleUp: 1.5,
  });

  assert.ok(result.rows.length >= 2, 'should create at least two rows');
  const portraitHeavyRow = result.rows.find((row) => row.itemCount >= 4);
  assert.ok(portraitHeavyRow, 'should allow up to four portraits in a single row');
  assert.ok(portraitHeavyRow?.height <= 340 * 1.3, 'portrait row stays within tolerance');

  const totalHeight = result.containerHeight;
  assert.ok(totalHeight > 0, 'non-zero container height expected');
});
