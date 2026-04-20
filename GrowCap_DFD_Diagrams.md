# GrowCap - Data Flow Diagrams (DFD)

This document visualizes the movement of data through the GrowCap platform across three levels of abstraction, following the structure of the system's core functional modules.

---

## 1. Unified DFD Blueprint (Levels 0, 1, 2)

![GrowCap DFD Blueprint](file:///C:/Users/Om%20Kadam/.gemini/antigravity/brain/e9839e33-41ed-45cd-a7e2-659388115a74/growcap_dfd_blueprint_1776658246374.png)

---

## 2. DFD Level 0: Context Diagram

The Context Diagram shows the high-level data exchange between the system and external entities.

```mermaid
graph LR
    User((User: Indiv/Bus)) -- Credentials & Input --> System[GrowCap AI Platform]
    System -- Dashboard & Reports --> User
    Admin((AI Admin / System)) -- Risk Recalibration --> System
    System -- Audit Requests --> Admin
```

---

## 3. DFD Level 1: Functional Diagram

Level 1 decomposes the system into main functional processes and their associated data stores.

```mermaid
graph TD
    User((User)) -- Auth Input --> P1[1.0 User Authentication]
    P1 <--> D1[(User DB)]
    
    User -- Discovery Data --> P2[2.0 Financial Discovery]
    P2 <--> D2[(Profile/DNA DB)]
    
    P2 -- Verified DNA --> P3[3.0 Strategy Selection]
    P3 <--> D3[(Strategy DB)]
    
    User -- Assets/Holdings --> P4[4.0 Portfolio Tracking]
    P4 <--> D4[(Portfolio DB)]
    
    User -- PDFs/Excels --> P5[5.0 Document RAG]
    P5 <--> D5[(Vector DB/Cache)]
    
    P3 -- Strategy Ledger --> P4
    P4 -- Asset Status --> P3
```

---

## 4. DFD Level 2: Detailed Discovery Process

Level 2 examines the "Financial Discovery" process in high detail, showing how income and expenses are transformed into a verified risk score.

```mermaid
graph TD
    User((User)) -- Raw Details --> P2.1[2.1 Categorize Cash Flows]
    P2.1 -- Verified Surplus --> P2.2[2.2 Run AI Risk Model]
    P2.2 -- AI Analysis --> P2.3[2.3 Assign Risk Category]
    P2.3 -- Final Profile --> D2[(Profile DB)]
    
    AI_Admin((AI System)) -- Rule Matrix --> P2.2
```

---

## 5. Salient Data Flows

- **Surplus Flow**: Monthly Income - Expenses = Investible Surplus (Calculated in P2.1).
- **Strategy Sync**: Strategy Targets are pushed as `strategy_allocation` transactions into the Portfolio Audit ledger (P3 $\rightarrow$ P4).
- **RAG Analysis**: Document text is vectorized and cached for real-time querying (P5).

> [!NOTE]
> All data flows are secured via JWT authentication at the 1.0 (Auth) gate, ensuring that data stores (D1-D5) are only accessible to authorized users.
