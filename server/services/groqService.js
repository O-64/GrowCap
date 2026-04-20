const Groq = require('groq-sdk');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are GrowCap AI — a professional, friendly financial advisor assistant. You help users with:
- Investment analysis and advice
- Portfolio management and diversification
- Risk assessment
- Financial planning and goal setting
- Expense optimization
- Understanding market trends

Guidelines:
- Always be clear, concise, and practical
- Use ₹ (INR) for Indian users unless told otherwise
- Never claim to predict stock prices — focus on analysis and education
- When uncertain, recommend consulting a certified financial advisor
- Format responses with clear headers and bullet points when appropriate
- Be encouraging but realistic about financial goals`;

// Basic chat with Groq
async function chatWithGroq(message, userName) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `User: ${userName || 'User'}\n\n${message}` }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2048
    });

    return completion.choices[0]?.message?.content || 'I could not generate a response. Please try again.';
  } catch (err) {
    console.error('Groq API error:', err.message);
    throw new Error('Failed to get AI response');
  }
}

// Chat with RAG context
async function chatWithRAG(message, context, userName) {
  try {
    let contextText = '';

    // Add document chunks
    if (context.documentChunks && context.documentChunks.length > 0) {
      contextText += '\n--- UPLOADED DOCUMENTS ---\n';
      contextText += context.documentChunks.slice(0, 10).join('\n\n');
    }

    // Add portfolio data
    if (context.portfolio && context.portfolio.length > 0) {
      contextText += '\n\n--- USER PORTFOLIO ---\n';
      context.portfolio.forEach(h => {
        contextText += `• ${h.name} (${h.type}${h.symbol ? ', ' + h.symbol : ''}): Qty ${h.quantity}, Buy ₹${h.buy_price}, Current ₹${h.current_price}, Invested ₹${h.invested_amount}, Value ₹${h.current_value}\n`;
      });
    }

    // Add goals
    if (context.goals && context.goals.length > 0) {
      contextText += '\n\n--- FINANCIAL GOALS ---\n';
      context.goals.forEach(g => {
        contextText += `• ${g.name} (${g.category}): Target ₹${g.target_amount}, Current ₹${g.current_amount}, Status: ${g.status}\n`;
      });
    }

    // Add expenses
    if (context.expenses && context.expenses.length > 0) {
      contextText += '\n\n--- RECENT EXPENSES (3 months) ---\n';
      context.expenses.forEach(e => {
        contextText += `• ${e.category}: ₹${e.total}\n`;
      });
    }

    const augmentedPrompt = contextText
      ? `${SYSTEM_PROMPT}\n\nHere is the user's financial context to help answer their question:\n${contextText}\n\nIf the context doesn't contain relevant information for the query, use your general financial knowledge to answer.`
      : SYSTEM_PROMPT;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: augmentedPrompt },
        { role: 'user', content: `User: ${userName || 'User'}\n\n${message}` }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2048
    });

    return completion.choices[0]?.message?.content || 'I could not generate a response. Please try again.';
  } catch (err) {
    console.error('Groq RAG error:', err.message);
    // Fallback to basic chat
    return chatWithGroq(message, userName);
  }
}

module.exports = { chatWithGroq, chatWithRAG };
