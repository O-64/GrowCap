# GrowCap - Detailed ER Diagram & Data Lifecycle

This document provides an exhaustive mapping of every database component within the GrowCap platform, structured by their logical operational flow.

---

## 1. Technical Architectural Blueprint

![GrowCap Detailed ER Blueprint](file:///C:/Users/Om%20Kadam/.gemini/antigravity/brain/e9839e33-41ed-45cd-a7e2-659388115a74/growcap_detailed_er_blueprint_1776657775522.png)

---

## 2. Logical Component Flow (Mermaid)

This diagram shows the sequence in which data is initialized and linked across the ecosystem.

```mermaid
graph TD
    subgraph "Phase 1: Identity & Profile"
        U[Users] --> FP[Financial Profiles]
        U --> BP[Business Profiles]
    end

    subgraph "Phase 2: Strategic Planning"
        FP --> FPLAN[Financial Plans]
        FPLAN --> T_STRAT[Transactions: strategy_allocation]
    end

    subgraph "Phase 3: Asset Management"
        U --> P[Portfolios]
        P --> H[Holdings]
        H --> T_BUY[Transactions: buy/sell]
        H --> SD[Stock Data Cache]
    end

    subgraph "Phase 4: Business Operations"
        BP --> CF[Cash Flows]
        BP --> INV[Invoices]
        BP --> PAY[Payroll]
    end

    subgraph "Phase 5: Intelligence & Audit"
        P --> RM[Risk Metrics]
        U --> DOCS[Documents]
        DOCS --> CHUNKS[Document Chunks]
        U --> CHAT[Chat History]
    end

    %% Key Relationships
    FPLAN -.->|Audits| H
    RM -.->|Analyzes| P
```

---

## 3. Data Component Dictionary

### Core Identity Layer
- **`users`**: The root entity. Controls `user_type` (Individual vs Business).
- **`chat_history`**: Persistent store for AI assistant sessions.

### Strategy & DNA Layer
- **`financial_profiles`**: Stores "Financial DNA" (Income, Needs, Wants, Revenue, Payroll).
- **`financial_plans`**: Stores the AI Strategy (Equity%, Safe%, etc.).

### Execution & Asset Layer
- **`portfolios`**: Container for multiple asset buckets.
- **`holdings`**: The actual assets (Stocks, MFs, FDs). Linked to `portfolios`.
- **`transactions`**: High-fidelity ledger for every buy/sell and strategy sync.

### Intelligence & Cache Layer
- **`risk_metrics`**: Cached volatility and audit scores for each portfolio.
- **`stock_data`**: External price data cache for performance tracking.
- **`documents` & `document_chunks`**: RAG (Retrieval Augmented Generation) data store.

### Business Operation Layer (B2B)
- **`business_profiles`**: Deep business metadata (Industry, Employee count).
- **`cash_flows` / `invoices` / `payroll`**: Specialized ledgers for business financial health.

---

## 4. Key Relationships & Constraints

1.  **Strict 1:1 DNA**: Each `user` has exactly one `financial_profile` and one `financial_plan`. This ensures the AI has a singular, consistent strategy to audit against.
2.  **Cascade Policy**: Deleting a `user` cascades and purges all associated financial data, holdings, and documents to ensure GDRP-compliant data handling.
3.  **Audit Integrity**: `transactions` are never deleted; they are appended to ensure a permanent record of all strategic shifts.

> [!IMPORTANT]
> The **'strategy_allocation'** type in the `transactions` table is the bridge between the **Strategy Layer** and the **Asset Layer**, enabling the "Auto-Synced" audit UI.
