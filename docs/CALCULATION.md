# CALCULATION.md

## 핵심 공식
- usable_cash = cash - emergency_fund - acquisition_cost
- monthly_debt_limit = allowed_monthly_payment - existing_monthly_debt_service
- dsr_loan_cap = inverse_amortization(monthly_debt_limit, stress_rate, term)
- ltv_price_cap = usable_cash_base / (1 - LTV + acquisition_cost_rate)
- dsr_price_cap = usable_cash_base + dsr_loan_cap
- product_price_cap = usable_cash_base + product_max_loan
- final_max_purchase_price = min(ltv_price_cap, dsr_price_cap, product_price_cap, policy_price_cap)

## 주의
- 실제 은행 심사와 다를 수 있음
- 현재 MVP는 규칙 기반 추정기
- DTI는 구조를 열어두었고, 기본 MVP에서는 설명용 필드로 유지
