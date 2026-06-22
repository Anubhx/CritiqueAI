/**
 * lib/share-store.ts — Minimal persistence for shared reports.
 * Uses Supabase: Postgres for report metadata, Storage for images.
 * Server-only.
 */

import { nanoid } from 'nanoid';
import { supabase } from '@/lib/supabase';
import type { CritiqueReport, StoredReport } from '@/types/critique';

const STORAGE_BUCKET = 'critique-images';
const TABLE = 'shared_reports';

/**
 * Store a report + image in Supabase, return the share ID.
 */
export async function storeReport(
  report: CritiqueReport,
  imageBase64: string,
  imageMimeType: string,
): Promise<string> {
  const id = nanoid(10);

  // 1. Upload the image to Supabase Storage
  const imageBuffer = Buffer.from(imageBase64, 'base64');
  const extension = imageMimeType.split('/')[1] ?? 'png';
  const storagePath = `${id}/screenshot.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, imageBuffer, {
      contentType: imageMimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  // 2. Get the public URL
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  const imageUrl = urlData.publicUrl;

  // 3. Store report JSON + image URL in Postgres
  const { error: insertError } = await supabase.from(TABLE).insert({
    id,
    report,
    image_url: imageUrl,
    created_at: new Date().toISOString(),
  });

  if (insertError) {
    throw new Error(`Failed to store report: ${insertError.message}`);
  }

  return id;
}

/**
 * Fetch a stored report by share ID.
 */
export async function fetchReport(id: string): Promise<StoredReport | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, report, image_url, created_at')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return data as StoredReport;
}
