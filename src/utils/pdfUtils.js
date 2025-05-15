
import * as pdfjs from 'pdfjs-dist';

// Set the worker source for PDF.js
const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs');
if (typeof window !== 'undefined' && 'pdfjsWorker' in window === false) {
  pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

/**
 * Extract transaction data from a PDF file
 * @param {File} file - The PDF file to extract data from
 * @param {Array} categories - Available categories to match against
 * @returns {Promise<Array>} - Array of extracted transactions
 */
export async function extractPdfData(file, categories) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    let extractedText = '';
    
    // Extract text from all pages
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      extractedText += pageText + ' ';
    }
    
    // Process the extracted text to identify transactions
    return processExtractedText(extractedText, categories);
  } catch (error) {
    console.error('Error extracting PDF data:', error);
    throw new Error('Failed to read PDF file');
  }
}

/**
 * Process extracted text from PDF to identify transactions
 * This is a simplified implementation that needs to be customized based on
 * the actual format of your PDF bank statements or financial documents
 */
function processExtractedText(text, categories) {
  const transactions = [];
  
  // Common patterns to look for in bank statements
  const datePattern = /(\d{2}[\/.-]\d{2}[\/.-]\d{2,4})/g;
  const amountPattern = /(\$|R\$|€)?\s?(\d+[,.]\d{2})/g;
  
  // Split text into lines for processing
  const lines = text.split(/\r?\n|\r|\. /);
  
  for (const line of lines) {
    // Skip if line is too short
    if (line.length < 10) continue;
    
    // Try to extract date
    const dateMatches = line.match(datePattern);
    if (!dateMatches) continue;
    
    // Try to extract amount
    const amountMatches = line.match(amountPattern);
    if (!amountMatches) continue;
    
    // Determine if it's income or expense (simplified logic)
    // This should be customized based on your PDF format
    const isExpense = line.toLowerCase().includes('debit') || 
                      line.toLowerCase().includes('payment') ||
                      line.toLowerCase().includes('purchase');
    const type = isExpense ? 'expense' : 'income';
    
    // Find a description (everything between date and amount)
    let description = line.replace(dateMatches[0], '')
                          .replace(amountMatches[0], '')
                          .trim();
    
    // Clean up the description
    description = description.replace(/\s+/g, ' ').substring(0, 100);
    
    // Get amount as a number
    let amount = amountMatches[0].replace(/[^\d,.]/g, '')
                                 .replace(',', '.');
    amount = parseFloat(amount);
    
    // Simple category matching
    const category = findMatchingCategory(description, type, categories);
    
    // Format the date (assuming DD/MM/YYYY format)
    let date = dateMatches[0];
    try {
      // Handle various date formats
      const parts = date.split(/[\/.-]/);
      if (parts.length === 3) {
        // Assuming day/month/year format
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
        const year = parseInt(parts[2], 10);
        // Handle 2-digit years
        const fullYear = year < 100 ? 2000 + year : year;
        date = new Date(fullYear, month, day).toISOString().split('T')[0];
      }
    } catch (e) {
      // If date parsing fails, use current date
      date = new Date().toISOString().split('T')[0];
    }
    
    transactions.push({
      description,
      amount,
      category,
      type,
      date
    });
  }
  
  return transactions;
}

/**
 * Find a matching category based on transaction description
 */
function findMatchingCategory(description, type, categories) {
  // Filter categories by type
  const matchingTypeCategories = categories.filter(cat => cat.type === type);
  
  // Default categories if no match is found
  const defaultIncomeCategory = 'Other Income';
  const defaultExpenseCategory = 'Other Expense';
  
  // Look for keyword matches in the description
  const lowerDesc = description.toLowerCase();
  
  for (const category of matchingTypeCategories) {
    const lowerCatName = category.name.toLowerCase();
    
    // Check if category name appears in the description
    if (lowerDesc.includes(lowerCatName)) {
      return category.name;
    }
    
    // Add additional keywords based on common categories
    switch (lowerCatName) {
      case 'salary':
        if (lowerDesc.includes('payroll') || lowerDesc.includes('wage') || 
            lowerDesc.includes('payment') || lowerDesc.includes('direct deposit')) {
          return category.name;
        }
        break;
      case 'food':
        if (lowerDesc.includes('restaurant') || lowerDesc.includes('grocery') || 
            lowerDesc.includes('market') || lowerDesc.includes('meal') || 
            lowerDesc.includes('cafe')) {
          return category.name;
        }
        break;
      case 'transportation':
        if (lowerDesc.includes('gas') || lowerDesc.includes('fuel') || 
            lowerDesc.includes('taxi') || lowerDesc.includes('uber') || 
            lowerDesc.includes('lyft') || lowerDesc.includes('train') || 
            lowerDesc.includes('transit')) {
          return category.name;
        }
        break;
      case 'housing':
        if (lowerDesc.includes('rent') || lowerDesc.includes('mortgage') || 
            lowerDesc.includes('property')) {
          return category.name;
        }
        break;
      // Add more category keywords as needed
    }
  }
  
  // Return default category if no match
  if (type === 'income') {
    // Check if default income category exists, if not return first income category
    const incomeCategory = matchingTypeCategories.find(c => c.name === defaultIncomeCategory) || 
                          matchingTypeCategories[0];
    return incomeCategory ? incomeCategory.name : 'Income';
  } else {
    // Check if default expense category exists, if not return first expense category
    const expenseCategory = matchingTypeCategories.find(c => c.name === defaultExpenseCategory) || 
                           matchingTypeCategories[0];
    return expenseCategory ? expenseCategory.name : 'Expense';
  }
}
