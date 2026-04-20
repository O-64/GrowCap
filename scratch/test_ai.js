const { chatWithGroq, chatWithRAG } = require('../server/services/groqService');
const pool = require('../server/config/db');

async function testChat() {
  try {
    const user_id = 1;
    const message = "Hello";
    const sessionId = "session_test";

    console.log('--- Testing chatWithGroq ---');
    const response = await chatWithGroq(message, "Test User");
    console.log('Response:', response);

    console.log('--- Testing DB Insert ---');
    await pool.execute(
      'INSERT INTO chat_history (user_id, role, message, session_id) VALUES (?, ?, ?, ?)',
      [user_id, 'assistant', response, sessionId]
    );
    console.log('Insert successful');

    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

testChat();
