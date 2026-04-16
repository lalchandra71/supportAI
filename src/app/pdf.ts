'use server';

import PdfJson from 'pdf2json';

export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const pdf = new PdfJson(buffer);
    await new Promise<void>((resolve, reject) => {
      pdf.on('pdfjson', resolve);
      pdf.on('error', reject);
    });
    
    const pages = pdf.getPages();
    let text = '';
    
    for (const page of pages) {
      for (const item of page.Items) {
        if ('str' in item) {
          text += item.str + ' ';
        }
      }
      text += '\n';
    }
    
    return text.trim();
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw error;
  }
}