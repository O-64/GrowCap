const axios = require('axios');
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const { processDocument, processZipFile } = require('../services/ragService');

async function downloadFile(url, tempDir) {
  const ext = path.extname(new URL(url).pathname) || '.xlsx';
  const filename = `cloudinary_global_${Date.now()}${Math.round(Math.random() * 1000)}${ext}`;
  const filePath = path.join(tempDir, filename);

  const writer = fs.createWriteStream(filePath);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(filePath));
    writer.on('error', reject);
  });
}

async function ingestFromUrl(url) {
  const systemUserId = 1;

  try {
    // 1. Ensure the System User exists
    const [existing] = await pool.execute('SELECT id FROM users WHERE id = ?', [systemUserId]);
    if (existing.length === 0) {
      console.log('Creating Admin/System User (ID 1) to own global knowledge...');
      await pool.execute(
        'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
        [systemUserId, 'System Admin', 'admin@growcap.loc', 'unusable_password_hash']
      );
    }

    // 2. Setup temporary uploads dir
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    // 3. Download the file from Cloudinary (or any other public URL)
    console.log(`Downloading file from: ${url}`);
    const filePath = await downloadFile(url, uploadDir);
    const filename = path.basename(filePath);
    const originalName = `Global_System_File_From_Url${path.extname(filename)}`;

    console.log(`Download complete: ${filename}`);

    const ext = path.extname(filename).toLowerCase();
    let fileType = 'pdf';
    if (['.xlsx', '.xls'].includes(ext)) fileType = 'excel';
    else if (ext === '.csv') fileType = 'csv';
    else if (ext === '.zip') fileType = 'zip';

    // 4. Save document metadata to DB assigned to System User (ID 1)
    const [result] = await pool.execute(
      'INSERT INTO documents (user_id, filename, original_name, file_type, file_size, status) VALUES (?, ?, ?, ?, ?, ?)',
      [systemUserId, filename, originalName, fileType, fs.statSync(filePath).size, 'processing']
    );
    const docId = result.insertId;

    // 5. Process and generate embeddings/chunks
    console.log(`Processing file into RAG chunks...`);
    if (fileType === 'zip') {
      await processZipFile(filePath, docId, systemUserId, pool);
    } else {
      await processDocument(filePath, fileType, docId, systemUserId, pool);
    }

    console.log(`\n🎉 SUCCESS! File ingested globally.`);
    console.log(`All users will now have access to this data via the AI Assistant.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to ingest file:', err.message);
    process.exit(1);
  }
}

// Ensure a URL is provided
const targetUrl = process.argv[2];
if (!targetUrl) {
  console.log('Usage: node ingestCloudinary.js <CLOUDINARY_URL>');
  process.exit(1);
}

ingestFromUrl(targetUrl);
