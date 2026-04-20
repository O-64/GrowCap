# GrowCap Platform - Master Use Cases & Architecture

This document serves as the definitive guide to the user journeys, system logic, and data architecture of the GrowCap AI platform.

---

## 1. Functional Use Case Diagram (UML)

Following the standard UML structure, this diagram identifies the actors (Individual, Business, AI Admin) and their primary interactions with the system boundary.

![GrowCap Use Case Diagram - UML Style](file:///C:/Users/Om%20Kadam/.gemini/antigravity/brain/e9839e33-41ed-45cd-a7e2-659388115a74/growcap_use_case_diagram_premium_1776657443944.png)

```mermaid
graph LR
    subgraph "GrowCap AI System"
        UC1(Register/Login)
        UC2(Financial Discovery)
        UC3(Portfolio Management)
        UC4(Apply Strategy)
        UC5(AI Assistant Chat)
        UC6(Document Analysis)
        UC7(Payroll Tracking)
        UC8(Risk Scoring)
        UC9(Strategic Audit)
    end

    User((Individual User)) --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6

    Bus((Business User)) --> UC1
    Bus --> UC7
    Bus --> UC3
    Bus --> UC9

    Admin((AI System / Admin)) --> UC8
    Admin --> UC9
    Admin --> UC6
```

---

## 2. End-to-End User Journey Flow

This infographic tracks the flow of data from Discovery through AI Strategy to the final Portfolio Audit.

![GrowCap User Journey - Premium Infographic](file:///C:/Users/Om%20Kadam/.gemini/antigravity/brain/e9839e33-41ed-45cd-a7e2-659388115a74/growcap_user_journey_flow_premium_1776657139910.png)

---

## 3. Data Architecture Integration

The integrity of these use cases is maintained by a robust relational database. Below is the blueprint of how DNA data, strategies, and transactions are linked.

![GrowCap Database ER Diagram](file:///C:/Users/Om%20Kadam/.gemini/antigravity/brain/e9839e33-41ed-45cd-a7e2-659388115a74/growcap_er_diagram_premium_1776656997622.png)

---

## 4. Key Use Case Registry

### UC-1: The "Financial DNA" Discovery (B2C)
- **Goal**: Create a profile for AI evaluation.
- **Workflow**: User inputs income vs. essential overheads. 
- **System Action**: Calculates **Available Surplus** for investment.

### UC-2: The "Business Stability" Audit (B2B)
- **Goal**: Ensure business continuity with payroll and tax reserves.
- **Workflow**: User enters payroll and tax data. 
- **System Action**: Tags profile as "High Risk" if debt-to-revenue ratio exceeds 80%.

### UC-3: Automated Strategic Audit
- **Goal**: Maintain actual holdings vs. AI-driven targets.
- **System Action**: Logs `strategy_allocation` for virtual target tracking.

---

> [!NOTE]
> This master document integrates all visual blueprints and logic flows for the GrowCap system as of April 2026.
