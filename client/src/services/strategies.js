import { Zap, Trophy, Shield, ShieldCheck, Target, TrendingUp, Anchor, Compass, Heart, AlertTriangle } from 'lucide-react';

export const getAgeBasedStrategies = (age) => {
  if (age <= 30) {
    return [
      // High Risk (3)
      { id: 'h1', name: 'Ultra Aggressive Wealth Builder', inherentRisk: 'High', icon: Zap, color: 'bg-rose-600', desc: 'Maximum equity exposure for highest possible long-term gains.', plan: { equity_pct: 85, safe_pct: 5, emergency_pct: 10, retirement_pct: 0 }, highlight: ['85% Equity', 'Aggressive Growth'] },
      { id: 'h2', name: 'The Compounding Machine', inherentRisk: 'High', icon: TrendingUp, color: 'bg-rose-500', desc: 'Slightly tempered high-risk growth strategy.', plan: { equity_pct: 80, safe_pct: 5, emergency_pct: 10, retirement_pct: 5 }, highlight: ['80% Equity', 'Long-term Compounding'] },
      { id: 'h3', name: 'Risk Taker Core', inherentRisk: 'High', icon: Target, color: 'bg-rose-400', desc: 'Core high-growth with a tiny safety net.', plan: { equity_pct: 75, safe_pct: 10, emergency_pct: 10, retirement_pct: 5 }, highlight: ['75% Equity', 'Core Growth Base'] },
      // Moderate Risk (4)
      { id: 'm1', name: 'Balanced Growth Focus', inherentRisk: 'Moderate', icon: Trophy, color: 'bg-indigo-500', desc: 'Standard moderate-growth portfolio.', plan: { equity_pct: 70, safe_pct: 10, emergency_pct: 10, retirement_pct: 10 }, highlight: ['70% Equity', 'Balanced Allocation'] },
      { id: 'm2', name: 'Multi-Asset Growth', inherentRisk: 'Moderate', icon: Compass, color: 'bg-indigo-400', desc: 'Diversified strategy avoiding ultra-high equity swings.', plan: { equity_pct: 65, safe_pct: 15, emergency_pct: 10, retirement_pct: 10 }, highlight: ['65% Equity', '15% Safe Assets'] },
      { id: 'm3', name: 'Standard SIP Anchor', inherentRisk: 'Moderate', icon: Anchor, color: 'bg-blue-500', desc: 'Classic SIP-based wealth accumulation.', plan: { equity_pct: 60, safe_pct: 20, emergency_pct: 10, retirement_pct: 10 }, highlight: ['60% Equity', '20% Safe Buffer'] },
      { id: 'm4', name: 'Steady Accumulator', inherentRisk: 'Moderate', icon: Shield, color: 'bg-blue-400', desc: 'Slightly conservative moderate plan.', plan: { equity_pct: 55, safe_pct: 20, emergency_pct: 15, retirement_pct: 10 }, highlight: ['15% Emergency Buffer'] },
      // Low Risk (3)
      { id: 'l1', name: 'Early Discipline Base', inherentRisk: 'Low', icon: ShieldCheck, color: 'bg-emerald-400', desc: 'Safe start for new investors.', plan: { equity_pct: 50, safe_pct: 20, emergency_pct: 15, retirement_pct: 15 }, highlight: ['50% Equity limit'] },
      { id: 'l2', name: 'Capital Protector + Growth', inherentRisk: 'Low', icon: Heart, color: 'bg-emerald-500', desc: 'Focuses heavily on protecting your principal.', plan: { equity_pct: 45, safe_pct: 25, emergency_pct: 15, retirement_pct: 15 }, highlight: ['25% FDs/Debt'] },
      { id: 'l3', name: 'Absolute Safety Anchor', inherentRisk: 'Low', icon: Shield, color: 'bg-emerald-600', desc: 'Minimum allowed equity for your age.', plan: { equity_pct: 40, safe_pct: 30, emergency_pct: 15, retirement_pct: 15 }, highlight: ['30% Complete Safety'] },
    ];
  } else if (age > 30 && age <= 45) {
    return [
      // Moderate (6)
      { id: 'm5', name: 'The Wealth Catalyst', inherentRisk: 'Moderate', icon: Zap, color: 'bg-indigo-500', desc: 'Upper edge of moderate risk for accelerating growth.', plan: { equity_pct: 60, safe_pct: 20, emergency_pct: 10, retirement_pct: 10 }, highlight: ['60% Equity', 'Momentum Growth'] },
      { id: 'm6', name: 'Mid-Career Balanced', inherentRisk: 'Moderate', icon: Trophy, color: 'bg-indigo-400', desc: 'The golden mean for mid-career professionals.', plan: { equity_pct: 55, safe_pct: 25, emergency_pct: 10, retirement_pct: 10 }, highlight: ['55% Equity', 'Solid Foundation'] },
      { id: 'm7', name: 'Dynamic Asset Allocator', inherentRisk: 'Moderate', icon: Compass, color: 'bg-blue-500', desc: 'Balanced evenly between growth and protection.', plan: { equity_pct: 50, safe_pct: 25, emergency_pct: 15, retirement_pct: 10 }, highlight: ['50/50 Growth & Safe'] },
      { id: 'm8', name: 'Smart Beta Standard', inherentRisk: 'Moderate', icon: Target, color: 'bg-blue-400', desc: 'Leaning conservative but holding equity.', plan: { equity_pct: 45, safe_pct: 30, emergency_pct: 15, retirement_pct: 10 }, highlight: ['30% Fixed Income'] },
      { id: 'm9', name: 'Core & Explore', inherentRisk: 'Moderate', icon: TrendingUp, color: 'bg-cyan-500', desc: 'Strong core safety with exploring equity.', plan: { equity_pct: 40, safe_pct: 30, emergency_pct: 15, retirement_pct: 15 }, highlight: ['15% Retirement Focus'] },
      { id: 'm10', name: 'Family Wealth Builder', inherentRisk: 'Moderate', icon: Heart, color: 'bg-cyan-600', desc: 'Optimized for family dependents.', plan: { equity_pct: 35, safe_pct: 35, emergency_pct: 15, retirement_pct: 15 }, highlight: ['Even Equity/Safe Split'] },
      // Low (4)
      { id: 'l4', name: 'Primary Capital Defender', inherentRisk: 'Low', icon: Shield, color: 'bg-emerald-400', desc: 'Focuses strictly on not losing money.', plan: { equity_pct: 30, safe_pct: 40, emergency_pct: 15, retirement_pct: 15 }, highlight: ['40% Capital Guard'] },
      { id: 'l5', name: 'Dependents First Strategy', inherentRisk: 'Low', icon: ShieldCheck, color: 'bg-emerald-500', desc: 'High safety for dependents.', plan: { equity_pct: 25, safe_pct: 45, emergency_pct: 15, retirement_pct: 15 }, highlight: ['45% Protected Assets'] },
      { id: 'l6', name: 'Safe Horizon Lock', inherentRisk: 'Low', icon: Anchor, color: 'bg-emerald-600', desc: 'Locks in wealth away from volatility.', plan: { equity_pct: 20, safe_pct: 45, emergency_pct: 20, retirement_pct: 15 }, highlight: ['20% Emergency Fund'] },
      { id: 'l7', name: 'Ultimate Capital Preservation', inherentRisk: 'Low', icon: AlertTriangle, color: 'bg-teal-700', desc: 'Almost pure safety.', plan: { equity_pct: 15, safe_pct: 50, emergency_pct: 20, retirement_pct: 15 }, highlight: ['50% Absolute Safety'] },
    ];
  } else {
    // Age 45+
    return [
      // Low (5)
      { id: 'l8', name: 'Pre-Retirement Optimizer', inherentRisk: 'Low', icon: Trophy, color: 'bg-emerald-400', desc: 'Final push while preparing for exit.', plan: { equity_pct: 25, safe_pct: 50, emergency_pct: 15, retirement_pct: 10 }, highlight: ['25% Tactical Equity'] },
      { id: 'l9', name: 'Golden Years Base', inherentRisk: 'Low', icon: Heart, color: 'bg-emerald-500', desc: 'Stable, reliable growth base.', plan: { equity_pct: 20, safe_pct: 55, emergency_pct: 15, retirement_pct: 10 }, highlight: ['55% Fixed Income'] },
      { id: 'l10', name: 'Yield Generator Core', inherentRisk: 'Low', icon: Zap, color: 'bg-emerald-600', desc: 'Relies on interest and dividends.', plan: { equity_pct: 15, safe_pct: 60, emergency_pct: 15, retirement_pct: 10 }, highlight: ['60% Yield Generation'] },
      { id: 'l11', name: 'Zero-Risk Foundation', inherentRisk: 'Low', icon: Shield, color: 'bg-teal-600', desc: 'Removes nearly all market risk.', plan: { equity_pct: 10, safe_pct: 60, emergency_pct: 20, retirement_pct: 10 }, highlight: ['20% Liquid Emergency'] },
      { id: 'l12', name: 'Maximum Safety Vault', inherentRisk: 'Low', icon: ShieldCheck, color: 'bg-teal-700', desc: 'Total lockdown of capital.', plan: { equity_pct: 5, safe_pct: 65, emergency_pct: 20, retirement_pct: 10 }, highlight: ['65% Vault Lock', 'Just 5% Equity'] },
    ];
  }
}
