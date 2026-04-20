const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const XLSX = require('xlsx');
const unzipper = require('unzipper');

// Split text into chunks for RAG
function chunkText(text, maxChunkSize = 1000) {
  const sentences = text.split(/[.!?\n]+/).filter(s => s.trim().length > 20);
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    currentChunk += sentence + '. ';
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// Extract text from PDF
async function extractPDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text || '';
}

// Extract text from Excel/CSV
function extractExcel(filePath) {
  const workbook = XLSX.readFile(filePath);
  let allText = '';

  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    allText += `\n--- Sheet: ${sheetName} ---\n`;
    data.forEach(row => {
      allText += row.join(' | ') + '\n';
    });
  });

  return allText;
}

// Process a single document
async function processDocument(filePath, fileType, docId, userId, pool) {
  try {
    let text = '';

    if (fileType === 'pdf') {
      text = await extractPDF(filePath);
    } else if (fileType === 'excel' || fileType === 'csv') {
      text = extractExcel(filePath);
    }

    if (!text || text.trim().length === 0) {
      await pool.execute('UPDATE documents SET status = ?, content_text = ? WHERE id = ?', ['error', 'No text extracted', docId]);
      return;
    }

    // Chunk the text
    const chunks = chunkText(text);

    // Save full text
    await pool.execute(
      'UPDATE documents SET content_text = ?, chunk_count = ?, status = ? WHERE id = ?',
      [text.substring(0, 65000), chunks.length, 'ready', docId]
    );

    // Save chunks
    for (let i = 0; i < chunks.length; i++) {
      await pool.execute(
        'INSERT INTO document_chunks (document_id, user_id, chunk_index, content, tokens) VALUES (?, ?, ?, ?, ?)',
        [docId, userId, i, chunks[i], Math.ceil(chunks[i].length / 4)]
      );
    }

    console.log(`✅ Document ${docId} processed: ${chunks.length} chunks`);
  } catch (err) {
    console.error(`❌ Document ${docId} processing failed:`, err);
    await pool.execute('UPDATE documents SET status = ? WHERE id = ?', ['error', docId]);
  }
}

// Process ZIP file - extract and process each file inside
async function processZipFile(zipPath, parentDocId, userId, pool) {
  try {
    const extractDir = path.join(path.dirname(zipPath), `zip_${parentDocId}`);
    if (!fs.existsSync(extractDir)) fs.mkdirSync(extractDir, { recursive: true });

    // Extract ZIP
    await new Promise((resolve, reject) => {
      fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: extractDir }))
        .on('close', resolve)
        .on('error', reject);
    });

    // Find all supported files in extracted directory
    const supportedFiles = [];
    function walkDir(dir) {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else {
          const ext = path.extname(entry).toLowerCase();
          if (['.pdf', '.xlsx', '.xls', '.csv'].includes(ext)) {
            supportedFiles.push({ path: fullPath, name: entry, ext });
          }
        }
      }
    }
    walkDir(extractDir);

    let processedCount = 0;
    for (const file of supportedFiles) {
      let fileType = 'pdf';
      if (['.xlsx', '.xls'].includes(file.ext)) fileType = 'excel';
      else if (file.ext === '.csv') fileType = 'csv';

      // Create sub-document record
      const [result] = await pool.execute(
        'INSERT INTO documents (user_id, filename, original_name, file_type, file_size, parent_doc_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, path.basename(file.path), file.name, fileType, fs.statSync(file.path).size, parentDocId, 'processing']
      );

      await processDocument(file.path, fileType, result.insertId, userId, pool);
      processedCount++;
    }

    // Update parent doc
    await pool.execute(
      'UPDATE documents SET status = ?, chunk_count = ? WHERE id = ?',
      ['ready', processedCount, parentDocId]
    );

    // Cleanup extracted directory
    fs.rmSync(extractDir, { recursive: true, force: true });

    console.log(`✅ ZIP ${parentDocId} processed: ${processedCount} files extracted`);
  } catch (err) {
    console.error(`❌ ZIP ${parentDocId} processing failed:`, err);
    await pool.execute('UPDATE documents SET status = ? WHERE id = ?', ['error', parentDocId]);
  }
}

module.exports = { processDocument, processZipFile, chunkText };
