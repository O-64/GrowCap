# Strategic Allocation Audit - Test Cases

This document outlines the test cases for verifying the Strategic Allocation Audit feature in the GrowCap platform.

## Test Case 1: Initial State Audit (No Portfolio)
- **Pre-condition**: User has completed discovery but has not created any portfolios or holdings.
- **Steps**:
    1. Log in as a user.
    2. Navigate to the Portfolio page.
- **Expected Results**:
    - "Strategic Allocation Audit" section is visible.
    - Equity and Safe items show "Action Required" with a "Pending Assignment" alert.
    - Emergency Fund and Retirement show "Target Met via Strategy" (if `onboarding_completed` and strategy applied).
    - Investible Surplus is calculated correctly based on income - fixed expenses.

## Test Case 2: AI Allocation Analysis (Equity)
- **Pre-condition**: User has an "Action Required" item for Equity.
- **Steps**:
    1. Click "AI Analyse" next to the Equity item.
    2. select "Stock" as Asset Type and "Lumpsum" as Investment Mode.
    3. Click "Generate Strategy".
- **Expected Results**:
    - AI provides a specific stock recommendation (e.g., RELIANCE.NS) with quantity and price.
    - Clicking "Accept & Add to Portfolio" pre-fills the "Add Investment" form.

## Test Case 3: Manual Fulfillment (Safe Assets)
- **Pre-condition**: User has an "Action Required" item for Safe Assets (target ₹10,000).
- **Steps**:
    1. Click the "Action Required" alert for Safe Assets.
    2. The "Add Investment" form opens with "FD" selected and the target amount (₹10,000) pre-filled and locked (if applicable).
    3. Enter a name (e.g., "HDFC FD") and click "Add to Portfolio".
- **Expected Results**:
    - The Safe Assets item in the audit now shows the actual value (₹10,000 / ₹10,000) and the progress bar is filled.
    - The "Action Required" alert disappears.

## Test Case 4: Strategy Verification (Investment Blocked)
- **Pre-condition**: User has a Surplus of ₹5,000. Equity Target is ₹2,000 (40%).
- **Steps**:
    1. Try to add a Stock investment of ₹3,000.
- **Expected Results**:
    - Alert pops up: "Strategy Verification Failed: This investment pushes your Equity total... which exceeds your strict AI Strategy limit...".
    - Investment is not added.

## Test Case 5: Surplus Limit Verification
- **Pre-condition**: User has a Surplus of ₹1,000.
- **Steps**:
    1. Try to add an investment of ₹1,500.
- **Expected Results**:
    - Alert pops up: "Investment Blocked: You cannot invest ₹1,500 because your Total Savings Left is only ₹1,000...".
    - Investment is not added.
