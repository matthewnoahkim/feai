/**
 * Client-side image compression for user-uploaded material photos.
 *
 * There's no object storage in this app — an uploaded photo lands directly in the
 * `Material.image` Postgres column as a data URL, so it has to be downscaled and
 * re-encoded here first rather than uploaded raw. Always re-encodes to JPEG (flattening
 * any transparency onto white first) regardless of the source format, so both this
 * utility and the server-side Zod schema only ever have to deal with one mime type.
 */

import { IMAGE_MAX_BASE64_LENGTH } from '@/schemas/materials';

export interface CompressImageOptions {
  /** Longest edge, in px, to downscale to. Default 640. */
  maxDimension?: number;
  /** Initial JPEG quality (0-1) before shrinking further if still over the size cap. Default 0.75. */
  quality?: number;
}

export async function compressImageToDataUrl(
  file: File,
  opts: CompressImageOptions = {}
): Promise<string> {
  const maxDimension = opts.maxDimension ?? 640;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create a canvas context to process the image.');

  // Flatten any transparency (a PNG/WebP source) onto white before JPEG encoding, since
  // JPEG has no alpha channel and an unflattened transparent area would otherwise
  // silently render black.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);

  let quality = opts.quality ?? 0.75;
  for (let attempt = 0; attempt < 4; attempt++) {
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    if (dataUrl.length <= IMAGE_MAX_BASE64_LENGTH) return dataUrl;
    quality -= 0.15;
  }

  throw new Error('Could not compress this image below the size limit — try a smaller photo.');
}
