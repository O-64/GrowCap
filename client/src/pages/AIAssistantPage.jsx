import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatAI, getChatHistory, uploadDocument, getDocuments, portfolioReview } from '../services/api';
import { Sparkles, Send, Bot, User, Search, Loader2, Upload, FileText, Activity } from 'lucide-react';

export default function AIAssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello ${user?.name}! I'm **GrowCap AI** 🚀.\n\nI can help you with:\n• 📊 Portfolio & Treasury analysis\n• 💡 Investment & Tax advice\n• 🎯 System Global Market Data Queries\n\nHow can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}`);
  const chatEndRef = useRef(null);

  // Business File Upload State
  const [uploading, setUploading] = useState(false);
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (user?.user_type === 'business') {
      fetchDocs();
    }
    loadHistory();
  }, [user]);

  async function loadHistory() {
    try {
      const { data } = await getChatHistory();
      if (data && data.length > 0) {
        // Merge history with default welcome if history doesn't already have one
        setMessages([
          { role: 'assistant', content: `Hello ${user?.name}! I'm **GrowCap AI** 🚀.\n\nI can help you with:\n• 📊 Portfolio & Treasury analysis\n• 💡 Investment & Tax advice\n• 🎯 System Global Market Data Queries\n\nHow can I help you today?` },
          ...data
        ]);
      }
    } catch (err) {
      console.error('Failed to load chat history', err);
    }
  }

  async function fetchDocs() {
    try {
      const { data } = await getDocuments();
      setDocs(data);
    } catch(err) { console.error(err); }
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadDocument(file);
      await fetchDocs();
      setMessages(prev => [...prev, { role: 'assistant', content: `✅ Successfully uploaded & processed **${file.name}**. I can now reference this in our chat.` }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Failed to upload document. ${err.response?.data?.error || ''}` }]);
    } finally {
      setUploading(false);
    }
  }

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const { data } = await chatAI({ message: userMsg, session_id: sessionId });
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  async function handlePortfolioReview() {
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: '🔍 Run a full portfolio / business review' }]);
    try {
      const { data } = await portfolioReview();
      setMessages(prev => [...prev, { role: 'assistant', content: data.review }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Review failed. Ensure you have added data.' }]);
    } finally {
      setLoading(false);
    }
  }

  function renderMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>')
      .replace(/• /g, '&bull; ')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-primary-light underline">$1</a>');
  }

  return (
    <div className="page-ai h-full min-h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-6 animate-fade-in -m-6 p-6">
      
      {/* Sidebar for Business Uploads */}
      {user?.user_type === 'business' && (
        <div className="w-full lg:w-64 flex flex-col gap-4">
          <div className="glass-card flex-1 overflow-y-auto">
            <h3 className="font-bold text-sm mb-4 border-b border-border pb-2">Business Data Vault</h3>
            <label className="btn w-full py-2 bg-primary/10 text-primary-light hover:bg-primary/20 border border-primary/20 cursor-pointer flex items-center justify-center gap-2 text-sm mb-4">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Processing...' : 'Upload Data'}
              <input type="file" accept=".pdf,.csv,.xlsx,.zip" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
            <div className="space-y-2">
              {docs.map(d => (
                <div key={d.id} className="flex items-center gap-2 p-2 rounded-lg bg-surface-light border border-border text-xs text-text-muted">
                  <FileText className="w-3 h-3 text-primary-light shrink-0" />
                  <span className="truncate flex-1">{d.original_name}</span>
                </div>
              ))}
              {docs.length === 0 && <p className="text-xs text-center text-text-muted mt-8">No business files uploaded.</p>}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col rounded-3xl border border-border/50 bg-slate-950 p-0 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-white/5 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
               <div className="absolute inset-0 bg-primary/50 blur-lg rounded-full" />
               <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg relative z-10 border border-white/20">
                 <Sparkles className="w-6 h-6 text-white" />
               </div>
            </div>
            <div>
              <h2 className="font-black text-xl text-white flex items-center gap-2">GrowCap AI <span className="bg-primary/20 text-indigo-300 text-[9px] px-2 py-0.5 rounded-full border border-primary/30 uppercase tracking-widest">Active</span></h2>
              <p className="text-xs text-indigo-200 mt-1 font-medium">Powered by Groq Llama3 & {user?.user_type === 'business' ? 'Business Document Context' : 'Personal Strategic Plan'}</p>
            </div>
          </div>
          <button onClick={handlePortfolioReview} disabled={loading} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all flex items-center gap-2 shadow-sm">
            <Activity className="w-4 h-4" /> Run Portfolio AI Scan
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 relative z-10 scrollbar-thin scrollbar-thumb-white/10">
          {messages.length === 0 && (
             <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto opacity-60">
                <Bot className="w-16 h-16 text-indigo-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">How can I assist your financial journey?</h3>
                <p className="text-sm text-indigo-200">Ask about your current strategy, run a portfolio scan, or upload documents to analyze complex scenarios.</p>
             </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-4 max-w-4xl mx-auto ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${m.role === 'user' ? 'bg-primary border border-primary-light' : 'bg-slate-800 border border-slate-700'}`}>
                {m.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-accent" />}
              </div>
              <div className={`flex-1 p-5 rounded-3xl text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'}`}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
            </div>
          ))}
          {loading && (
            <div className="flex gap-4 max-w-4xl mx-auto">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg"><Bot className="w-5 h-5 text-accent" /></div>
              <div className="bg-slate-800 p-4 rounded-3xl rounded-tl-sm border border-slate-700 flex items-center h-12 w-24">
                <div className="flex gap-1.5 mx-auto">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent/80 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-accent/80 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-accent/80 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-slate-900/50 backdrop-blur-xl relative z-10">
          <div className="max-w-4xl mx-auto flex gap-3 relative">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-2xl p-4 pr-16 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner placeholder:text-slate-500" placeholder="Ask about global markets, your finances, or business rules..." disabled={loading} />
            <button onClick={handleSend} disabled={loading || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:bg-slate-700 shadow-lg">
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-[10px] uppercase tracking-widest text-slate-500 mt-4 pb-2">AI responses are driven by top-tier algorithms and your exact portfolio state.</p>
        </div>
      </div>
    </div>
  );
}
