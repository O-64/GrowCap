const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

/**
 * Scans the uploads directory for any Excel file and searches for a specific symbol/keyword.
 * Returns formatted fundamental data if found.
 */
const lookupSymbolInExcel = async (symbol) => {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) return null;

    const files = fs.readdirSync(UPLOADS_DIR).filter(f => f.endsWith('.xlsx'));
    
    for (const file of files) {
      const filePath = path.join(UPLOADS_DIR, file);
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      // Look for symbol match (case insensitive)
      const match = data.find(row => 
        (row.Symbol && row.Symbol.toString().toUpperCase() === symbol.toUpperCase()) ||
        (row.Ticker && row.Ticker.toString().toUpperCase() === symbol.toUpperCase()) ||
        (row.Name && row.Name.toString().toUpperCase().includes(symbol.toUpperCase()))
      );

      if (match) {
        return {
          symbol: match.Symbol || match.Ticker || symbol,
          name: match.Name || match.AssetName || symbol,
          price: match.Price || match.CurrentPrice || null,
          market_cap: match.MarketCap || match.Cap || "N/A",
          pe_ratio: match.PE || match.PERatio || null,
          eps: match.EPS || null,
          dividend_yield: match.Yield || match.DividendYield || "N/A",
          beta: match.Beta || null,
          source: 'Excel: ' + file
        };
      }
    }
  } catch (err) {
    console.error('Excel Lookup Error:', err.message);
  }
  return null;
};

module.exports = { lookupSymbolInExcel };
