import JSZip from 'jszip';

export interface CompressedFile {
  name: string;
  content: string | Buffer;
  type: 'csv' | 'pdf';
}

export async function createCompressedExport(
  files: CompressedFile[],
  zipName: string = 'export.zip'
): Promise<Blob> {
  const zip = new JSZip();
  
  // Add each file to the zip
  files.forEach(file => {
    const extension = file.type === 'csv' ? '.csv' : '.pdf';
    const fileName = `${file.name}${extension}`;
    
    if (typeof file.content === 'string') {
      zip.file(fileName, file.content);
    } else {
      zip.file(fileName, file.content);
    }
  });
  
  // Generate the zip file
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6 // Good balance between compression and speed
    }
  });
  
  return zipBlob;
}

export function estimateCompressionRatio(fileType: 'csv' | 'pdf'): number {
  // Rough estimation of compression ratios
  switch (fileType) {
    case 'csv':
      return 0.3; // CSV files typically compress to ~30% of original size
    case 'pdf':
      return 0.9; // PDFs are usually already compressed, minimal reduction
    default:
      return 0.5;
  }
}

export function shouldCompress(fileSize: number, fileType: 'csv' | 'pdf'): boolean {
  // Compress if file is larger than 1MB for CSV, 5MB for PDF
  const threshold = fileType === 'csv' ? 1024 * 1024 : 5 * 1024 * 1024;
  return fileSize > threshold;
} 