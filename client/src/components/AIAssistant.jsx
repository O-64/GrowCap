import { useState, useRef, useEffect } from 'react';
import { chatAI, uploadDocument, getDocuments, portfolioReview, searchTavily } from '../services/api';
import { MessageCircle, X, Send, Upload, Sparkles, FileText, Search, Loader2, Bot, User, Trash2 } from 'lucide-react';

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m **GrowCap AI** 🚀 — your personal financial assistant.\n\nI can help you with:\n• 📊 Portfolio analysis\n• 💡 Investment advice\n• 🎯 Financial planning\n• 📈 Risk assessment\n• 📄 Analyze your uploaded documents\n\nHow can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}`);
  const [showUpload, setShowUpload] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    setMessages(prev => [...prev, { role: 'user', content: '🔍 Run a full portfolio review' }]);
    try {
      const { data } = await portfolioReview();
      setMessages(prev => [...prev, { role: 'assistant', content: data.review }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Portfolio review failed. Please add some investments first.' }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!input.trim()) return;
    const query = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: `🔍 Search: ${query}` }]);
    setLoading(true);
    try {
      const { data } = await searchTavily(query);
      let response = `**Search Results for "${query}":**\n\n`;
      if (data.results) {
        data.results.forEach((r, i) => {
          response += `${i + 1}. **${r.title}**\n${r.content?.substring(0, 200)}...\n[Source](${r.url})\n\n`;
        });
      }
      if (data.summary) {
        response += `\n---\n**AI Summary:** ${data.summary}`;
      }
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Search failed.' }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await uploadDocument(formData);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `✅ **${file.name}** uploaded successfully!\n\nType: ${data.type}\nStatus: Processing...\n\nI'll be able to answer questions based on this document once processing completes.`
      }]);
      loadDocuments();
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Failed to upload ${file.name}` }]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function loadDocuments() {
    try {
      const { data } = await getDocuments();
      setDocuments(data);
    } catch (err) { console.error(err); }
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
    <>
      {/* Floating Button */}
      <button
        onClick={() => { setOpen(!open); if (!open) loadDocuments(); }}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 ${open ? 'bg-surface-lighter rotate-0' : 'bg-gradient-to-br from-primary to-accent animate-pulse-glow'}`}
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-120px)] rounded-2xl bg-surface border border-border shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border bg-surface-light/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">GrowCap AI</p>
              <p className="text-xs text-text-muted">Powered by Groq LLM</p>
            </div>
            {/* Quick actions */}
            <button onClick={handlePortfolioReview} disabled={loading} className="p-2 rounded-lg hover:bg-surface-lighter text-text-muted hover:text-primary-light transition" title="Portfolio Review">
              <Sparkles className="w-4 h-4" />
            </button>
            <button onClick={() => setShowUpload(!showUpload)} className="p-2 rounded-lg hover:bg-surface-lighter text-text-muted hover:text-primary-light transition" title="Upload Document">
              <Upload className="w-4 h-4" />
            </button>
          </div>

          {/* Upload panel */}
          {showUpload && (
            <div className="px-4 py-3 border-b border-border bg-surface-light/30 space-y-2">
              <div className="flex items-center gap-2">
                <input ref={fileInputRef} type="file" accept=".pdf,.xlsx,.xls,.csv,.zip" onChange={handleFileUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3">
                  {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>
                <span className="text-xs text-text-muted">PDF, Excel, CSV, ZIP</span>
              </div>
              {documents.length > 0 && (
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {documents.map(d => (
                    <div key={d.id} className="flex items-center gap-2 text-xs p-1.5 rounded-lg bg-surface/60">
                      <FileText className="w-3 h-3 text-primary-light" />
                      <span className="truncate flex-1">{d.original_name}</span>
                      <span className={`${d.status === 'ready' ? 'text-success' : d.status === 'error' ? 'text-danger' : 'text-warning'}`}>{d.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-primary/20' : 'bg-accent/20'}`}>
                  {m.role === 'user' ? <User className="w-3.5 h-3.5 text-primary-light" /> : <Bot className="w-3.5 h-3.5 text-accent" />}
                </div>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-primary/15 rounded-tr-md' : 'bg-surface-light rounded-tl-md'}`}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center"><Bot className="w-3.5 h-3.5 text-accent" /></div>
                <div className="bg-surface-light p-3 rounded-2xl rounded-tl-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-border bg-surface-light/30">
            <div className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                className="input-field flex-1 text-sm" placeholder="Ask about investments, planning..." disabled={loading} />
              <button onClick={handleSearch} disabled={loading || !input.trim()} className="p-2.5 rounded-xl bg-surface-lighter hover:bg-surface-lighter/80 text-text-muted hover:text-accent transition" title="Web Search">
                <Search className="w-4 h-4" />
              </button>
              <button onClick={handleSend} disabled={loading || !input.trim()} className="p-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white transition">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
