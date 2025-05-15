
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { extractPdfData } from '@/utils/pdfUtils';

export function PdfImporter({ categories, onImport, onCancel }) {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a valid PDF file');
    }
  };
  
  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a PDF file first');
      return;
    }
    
    try {
      setIsLoading(true);
      const extractedData = await extractPdfData(file, categories);
      onImport(extractedData);
      toast.success('PDF processed successfully');
    } catch (error) {
      console.error('PDF import error:', error);
      toast.error('Failed to process PDF: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <label htmlFor="pdf-file" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Upload PDF Bank Statement or Finance Document
        </label>
        <input
          id="pdf-file"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
        />
      </div>
      
      {file && (
        <div className="text-sm">
          Selected file: <span className="font-medium">{file.name}</span>
        </div>
      )}
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleImport} disabled={!file || isLoading}>
          {isLoading ? 'Processing...' : 'Import Transactions'}
        </Button>
      </div>
    </div>
  );
}
