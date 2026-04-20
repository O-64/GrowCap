import { useState, useEffect, useRef } from 'react';
import { searchStocks, getQuote, getDailyData, getChartData, addHolding } from '../services/api';
import { createChart } from 'lightweight-charts';
import { Search, TrendingUp, BarChart3, Loader2, IndianRupee } from 'lucide-react';

export default function MarketPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ Equity: [], ETF: [], MutualFund: [] });
  const [quote, setQuote] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [searching, setSearching] = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [activeTab, setActiveTab] = useState('Equity');

  // Investment Modal
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investType, setInvestType] = useState('lumpsum'); // or 'sip'
  const [investForm, setInvestForm] = useState({ amount: '', quantity: '', sip_day: '1' });
  const [investLoading, setInvestLoading] = useState(false);

  useEffect(() => {
    // Pre-load default top assets
    const defaultAssets = [
      { symbol: 'RELIANCE.BSE', name: 'Reliance Industries Ltd', type: 'Equity', region: 'India', currency: 'INR' },
      { symbol: 'TCS.BSE', name: 'Tata Consultancy Services', type: 'Equity', region: 'India', currency: 'INR' },
      { symbol: 'INFY.BSE', name: 'Infosys Ltd', type: 'Equity', region: 'India', currency: 'INR' },
      { symbol: 'AAPL', name: 'Apple Inc', type: 'Equity', region: 'United States', currency: 'USD' },
      { symbol: 'HDFCBANK.BSE', name: 'HDFC Bank', type: 'Equity', region: 'India', currency: 'INR' },
      { symbol: 'NIFTYBEES.BSE', name: 'Nippon India Nifty 50 BeES', type: 'ETF', region: 'India', currency: 'INR' },
      { symbol: 'PARAGPPFAS.MF', name: 'Parag Parikh Flexi Cap Fund', type: 'Mutual Fund', region: 'India', currency: 'INR' },
    ];
    setResults({
      Equity: defaultAssets.filter(a => a.type === 'Equity'),
      ETF: defaultAssets.filter(a => a.type === 'ETF'),
      MutualFund: defaultAssets.filter(a => a.type === 'Mutual Fund')
    });
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const { data } = await searchStocks(query);
      
      const sorted = { Equity: [], ETF: [], MutualFund: [] };
      data.forEach(r => {
        if (r.type.includes('ETF')) sorted.ETF.push(r);
        else if (r.type.includes('Mutual Fund')) sorted.MutualFund.push(r);
        else sorted.Equity.push(r);
      });
      setResults(sorted);

      // Default switch to whichever tab has results
      if (sorted.Equity.length > 0) setActiveTab('Equity');
      else if (sorted.ETF.length > 0) setActiveTab('ETF');
      else if (sorted.MutualFund.length > 0) setActiveTab('MutualFund');

    } catch (err) { console.error(err); }
    finally { setSearching(false); }
  }

  async function selectAsset(asset) {
    setSelectedSymbol(asset);
    setLoadingChart(true);
    try {
      // 1. Try to fetch Alpha Vantage Live Price (if available)
      const { data: q } = await getQuote(asset.symbol);
      let livePrice = parseFloat(q.price);

      // Check if price is missing or API failed (Cloudinary fallback could be triggered here via backend)
      if (!livePrice || isNaN(livePrice)) {
        livePrice = 100; // Mock fallback if unlisted nav
      }

      setQuote({ ...q, price: livePrice, name: asset.name, type: asset.type });

      // 2. Fetch Chart Data
      await getDailyData(asset.symbol);
      const { data: chartData } = await getChartData(asset.symbol);
      renderChart(chartData.chartData);

    } catch (err) {
      console.error(err);
      // Even if quote fails, still allow selection
      setQuote({ symbol: asset.symbol, name: asset.name, type: asset.type, price: 100, change: 0, changePercent: "0%" });
    } finally {
      setLoadingChart(false);
    }
  }

  function renderChart(data) {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
    }
    if (!chartRef.current || !data || data.length === 0) return;

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 400,
      layout: { background: { color: 'transparent' }, textColor: '#94a3b8' },
      grid: { vertLines: { color: 'rgba(51,65,85,0.3)' }, horzLines: { color: 'rgba(51,65,85,0.3)' } },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: '#334155' },
      timeScale: { borderColor: '#334155' },
    });

    const lineSeries = chart.addLineSeries({
      color: '#4f46e5',
      lineWidth: 2,
    });

    const formattedData = data.map(d => ({
      time: d.time, 
      value: parseFloat(d.close)
    })).sort((a, b) => a.time > b.time ? 1 : -1);

    lineSeries.setData(formattedData);
    chart.timeScale().fitContent();
    chartInstanceRef.current = chart;

    const handleResize = () => { if (chartRef.current) chart.applyOptions({ width: chartRef.current.clientWidth }); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }

  function openInvestModal(type) {
    setInvestType(type);
    setInvestForm({ amount: '', quantity: '', sip_day: '1' });
    setShowInvestModal(true);
  }

  async function handleInvestSubmit(e) {
    e.preventDefault();
    setInvestLoading(true);
    
    // Auto-calculate remaining missing parameter based on price
    const currentPrice = quote?.price || 1;
    let qty = parseFloat(investForm.quantity);
    let amt = parseFloat(investForm.amount);

    if (qty && !amt) amt = qty * currentPrice;
    if (amt && !qty) qty = amt / currentPrice;

    // Backend portfolio routing expects portfolio_id 1 (since we stripped out getting portfolios just for this mock)
    try {
      await addHolding(1, {
        type: activeTab === 'MutualFund' ? 'mutual_fund' : (investType === 'sip' ? 'sip' : 'stock'),
        symbol: quote.symbol,
        name: quote.name,
        quantity: qty,
        buy_price: currentPrice,
        invested_amount: amt,
        sip_day: investType === 'sip' ? investForm.sip_day : null
      });
      alert(`Successfully invested ₹${amt} in ${quote.symbol}`);
      setShowInvestModal(false);
    } catch (err) {
      console.error(err);
      alert('Investment failed: Ensure you have a portfolio ID 1');
    } finally {
      setInvestLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in relative z-0">
      <div>
        <h1 className="text-2xl font-bold">Market Treasury & Execution</h1>
        <p className="text-text-muted mt-1">Research assets, view TradingView charts, and execute Lumpsum or SIP orders instantly.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input value={query} onChange={e => setQuery(e.target.value)} className="input-field pl-10" placeholder="Search instruments (AAPL, SENSEX, Vanguard...)" />
        </div>
        <button type="submit" className="btn-primary" disabled={searching}>
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </button>
      </form>

      {/* Asset Classification Tabs */}
      {(results.Equity.length > 0 || results.ETF.length > 0 || results.MutualFund.length > 0) && (
        <div className="flex border-b border-border mb-4">
          {['Equity', 'ETF', 'MutualFund'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary-light' : 'border-transparent text-text-muted hover:border-text-muted'}`}>
              {tab === 'MutualFund' ? 'Mutual Funds' : (tab === 'Equity' ? 'Stocks' : 'ETFs')} ({results[tab].length})
            </button>
          ))}
        </div>
      )}

      {/* Results view */}
      {results[activeTab]?.length > 0 && (
        <div className="glass-card max-h-64 overflow-y-auto">
          <div className="space-y-1">
            {results[activeTab].map((r, i) => (
              <button key={i} onClick={() => selectAsset(r)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition text-left ${selectedSymbol?.symbol === r.symbol ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/30'}`}>
                <div>
                  <p className="font-medium text-sm">{r.symbol}</p>
                  <p className="text-xs text-text-muted">{r.name}</p>
                </div>
                <div className="text-right text-xs text-text-muted">
                  <p>{r.region}</p>
                  <p>{r.currency}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Asset Trading View & Quote */}
      {quote && (
        <div className="glass-card mt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold">{quote.symbol} <span className="text-sm font-normal text-text-muted">{quote.name}</span></h2>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-3xl font-black tracking-tight">₹{quote.price?.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                <p className={`text-sm font-bold ${quote.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {quote.change >= 0 ? '+' : ''}{quote.change?.toFixed(2)} ({quote.changePercent})
                </p>
              </div>
            </div>
            
            {/* Quick Invest Actions */}
            <div className="flex gap-3">
              <button onClick={() => openInvestModal('sip')} className="btn py-2.5 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-wider shadow-sm">
                <TrendingUp className="w-4 h-4" /> Start SIP
              </button>
              <button onClick={() => openInvestModal('lumpsum')} className="btn py-2.5 px-6 rounded-xl bg-indigo-900 text-white hover:bg-indigo-800 transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-100">
                <IndianRupee className="w-4 h-4" /> Exec Order
              </button>
            </div>
          </div>

          {/* AI Fundamental Snapshot */}
          <div className="mb-8 p-6 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">P/E Ratio</span>
              <span className="text-sm font-bold text-slate-800">{quote.fundamentals?.pe_ratio || 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Market Cap</span>
              <span className="text-sm font-bold text-slate-800">{quote.fundamentals?.market_cap || 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">EPS</span>
              <span className="text-sm font-bold text-slate-800">{quote.fundamentals?.eps || 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Div Yield</span>
              <span className="text-sm font-bold text-slate-800">{quote.fundamentals?.dividend_yield || 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">52W High</span>
              <span className="text-sm font-bold text-slate-800">₹{quote.fundamentals?.['52w_high'] || 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">52W Low</span>
              <span className="text-sm font-bold text-slate-800">₹{quote.fundamentals?.['52w_low'] || 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Beta</span>
              <span className="text-sm font-bold text-slate-800">{quote.fundamentals?.beta || 'N/A'}</span>
            </div>
          </div>

          {/* Chart Area */}
          <h3 className="text-xs font-bold mb-4 flex items-center gap-2 text-slate-500 uppercase tracking-widest">
            <BarChart3 className="w-4 h-4" /> Live Market Execution Chart
          </h3>
          {loadingChart ? (
            <div className="h-96 bg-slate-50 rounded-2xl flex items-center justify-center border border-dashed border-slate-200">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <div ref={chartRef} className="h-96 w-full relative z-0" />
          )}
        </div>
      )}

      {/* Investment Modal Component */}
      {showInvestModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowInvestModal(false)}>
          <div className="glass-card w-full max-w-md shadow-2xl border border-primary/20" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-1">
              {investType === 'sip' ? 'Setup SIP' : 'Lumpsum Order'}
            </h3>
            <p className="text-sm text-text-muted mb-6">Invest in {quote?.symbol} at executing price ₹{quote?.price}</p>
            
            <form onSubmit={handleInvestSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Investment Amount (₹)</label>
                <input type="number" required value={investForm.amount} onChange={e => setInvestForm({...investForm, amount: e.target.value})} className="input-field text-lg font-medium tracking-wide" placeholder={`₹10,000`} step="0.01" />
              </div>

              {investType === 'sip' && (
                <div>
                  <label className="block text-sm text-text-muted mb-1">Auto-deduction DOM (1-28)</label>
                  <input type="number" required min="1" max="28" value={investForm.sip_day} onChange={e => setInvestForm({...investForm, sip_day: e.target.value})} className="input-field" />
                </div>
              )}

              <div className="pt-2">
                <button type="submit" disabled={investLoading} className="btn-primary w-full py-3.5 text-base shadow-lg shadow-primary/20">
                  {investLoading ? 'Processing Execution...' : (investType === 'sip' ? 'Confirm SIP Mandate' : 'Place Execution Order')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
