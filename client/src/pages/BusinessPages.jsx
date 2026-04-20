import { Wallet, FileText, Users, Building } from 'lucide-react';

export function CashFlowPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Corporate Cash Flow</h1>
        <p className="text-text-muted mt-1">Track Business A/R and A/P</p>
      </div>
      <div className="glass-card text-center py-16">
        <Wallet className="w-16 h-16 mx-auto text-primary/30 mb-4" />
        <p className="text-text-muted">Cash Flow ledger tracking features coming soon.</p>
      </div>
    </div>
  );
}

export function InvoicesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">B2B Invoicing</h1>
        <p className="text-text-muted mt-1">Manage client billing and receipts</p>
      </div>
      <div className="glass-card text-center py-16">
        <FileText className="w-16 h-16 mx-auto text-accent/30 mb-4" />
        <p className="text-text-muted">Invoice creation and sent-status coming soon.</p>
      </div>
    </div>
  );
}

export function PayrollPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Payroll & Expenses</h1>
        <p className="text-text-muted mt-1">Employee compensation tracking</p>
      </div>
      <div className="glass-card text-center py-16">
        <Users className="w-16 h-16 mx-auto text-warning/30 mb-4" />
        <p className="text-text-muted">Payroll management dashboard coming soon.</p>
      </div>
    </div>
  );
}

export function CorpDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Corporate Command Center</h1>
        <p className="text-text-muted mt-1">Holistic view of your business financials</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <p className="text-sm text-text-muted">Monthly Revenue</p>
          <p className="text-2xl font-bold mt-1 text-success">₹0.00</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-text-muted">Pending Invoices</p>
          <p className="text-2xl font-bold mt-1 text-warning">0</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-text-muted">Payroll Liability</p>
          <p className="text-2xl font-bold mt-1 text-danger">₹0.00</p>
        </div>
      </div>
      <div className="glass-card text-center py-12">
        <Building className="w-16 h-16 mx-auto text-primary/30 mb-4" />
        <h3 className="text-lg font-bold">Welcome to GrowCap Business</h3>
        <p className="text-text-muted mt-2">More extensive features are actively being unlocked.</p>
      </div>
    </div>
  );
}
