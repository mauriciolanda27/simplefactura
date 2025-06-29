import { createCompressedExport, estimateCompressionRatio, shouldCompress, CompressedFile } from '../compression';

// Mock JSZip
jest.mock('jszip', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    file: jest.fn().mockReturnThis(),
    generateAsync: jest.fn().mockResolvedValue(new Blob(['compressed data'], { type: 'application/zip' }))
  }))
}));

describe('Compression Utilities', () => {
  let mockJSZip: jest.Mocked<any>;

  beforeEach(() => {
    // Get the mocked JSZip
    mockJSZip = require('jszip').default;
    mockJSZip.mockClear();
    mockJSZip.mockImplementation(() => ({
      file: jest.fn().mockReturnThis(),
      generateAsync: jest.fn().mockResolvedValue(new Blob(['compressed data'], { type: 'application/zip' }))
    }));
  });

  describe('createCompressedExport', () => {
    it('should create compressed export with CSV files', async () => {
      const files: CompressedFile[] = [
        {
          name: 'invoices',
          content: 'invoice_id,amount,date\n1,100,2024-01-01\n2,200,2024-01-02',
          type: 'csv'
        }
      ];

      const result = await createCompressedExport(files, 'test-export.zip');
      
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/zip');
    });

    it('should create compressed export with PDF files', async () => {
      const files: CompressedFile[] = [
        {
          name: 'report',
          content: Buffer.from('PDF content'),
          type: 'pdf'
        }
      ];

      const result = await createCompressedExport(files);
      
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/zip');
    });

    it('should create compressed export with multiple files', async () => {
      const files: CompressedFile[] = [
        {
          name: 'invoices',
          content: 'invoice data',
          type: 'csv'
        },
        {
          name: 'report',
          content: Buffer.from('PDF data'),
          type: 'pdf'
        }
      ];

      const result = await createCompressedExport(files, 'multi-export.zip');
      
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/zip');
    });

    it('should use default zip name when not provided', async () => {
      const files: CompressedFile[] = [
        {
          name: 'test',
          content: 'test content',
          type: 'csv'
        }
      ];

      const result = await createCompressedExport(files);
      
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('estimateCompressionRatio', () => {
    it('should return correct ratio for CSV files', () => {
      const ratio = estimateCompressionRatio('csv');
      expect(ratio).toBe(0.3);
    });

    it('should return correct ratio for PDF files', () => {
      const ratio = estimateCompressionRatio('pdf');
      expect(ratio).toBe(0.9);
    });
  });

  describe('shouldCompress', () => {
    it('should compress large CSV files', () => {
      const largeCSV = 2 * 1024 * 1024; // 2MB
      const should = shouldCompress(largeCSV, 'csv');
      expect(should).toBe(true);
    });

    it('should not compress small CSV files', () => {
      const smallCSV = 500 * 1024; // 500KB
      const should = shouldCompress(smallCSV, 'csv');
      expect(should).toBe(false);
    });

    it('should compress large PDF files', () => {
      const largePDF = 10 * 1024 * 1024; // 10MB
      const should = shouldCompress(largePDF, 'pdf');
      expect(should).toBe(true);
    });

    it('should not compress small PDF files', () => {
      const smallPDF = 2 * 1024 * 1024; // 2MB
      const should = shouldCompress(smallPDF, 'pdf');
      expect(should).toBe(false);
    });

    it('should handle exact threshold sizes', () => {
      const csvThreshold = 1024 * 1024; // 1MB
      const pdfThreshold = 5 * 1024 * 1024; // 5MB
      
      expect(shouldCompress(csvThreshold, 'csv')).toBe(false);
      expect(shouldCompress(csvThreshold + 1, 'csv')).toBe(true);
      expect(shouldCompress(pdfThreshold, 'pdf')).toBe(false);
      expect(shouldCompress(pdfThreshold + 1, 'pdf')).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty files array', async () => {
      const files: CompressedFile[] = [];
      const result = await createCompressedExport(files);
      
      expect(result).toBeInstanceOf(Blob);
    });
  });
}); 