'use server';

export async function extractPdfText(buffer: Buffer): Promise<string> {
  throw new Error('PDF parsing not supported on server. Use client-side extraction.');
}