const axios = require('axios');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

async function searchTavily(query) {
  try {
    if (!TAVILY_API_KEY || TAVILY_API_KEY === 'your_tavily_api_key_here') {
      return [{ title: 'Tavily API not configured', content: 'Please add your TAVILY_API_KEY to the .env file.', url: '' }];
    }

    const response = await axios.post('https://api.tavily.com/search', {
      api_key: TAVILY_API_KEY,
      query: `financial markets ${query}`,
      search_depth: 'basic',
      max_results: 5,
      include_domains: ['moneycontrol.com', 'economictimes.com', 'reuters.com', 'bloomberg.com', 'livemint.com']
    });

    if (response.data && response.data.results) {
      return response.data.results.map(r => ({
        title: r.title,
        content: r.content,
        url: r.url,
        score: r.score
      }));
    }

    return [];
  } catch (err) {
    console.error('Tavily search error:', err.message);
    return [{ title: 'Search Error', content: 'Failed to fetch search results. Please try again later.', url: '' }];
  }
}

module.exports = { searchTavily };
