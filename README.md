# 🚀 AcquiPredict
**Predict • Explain • Simulate • Prioritize • Act**

*Predictive Analytics System for Early Detection of Land Acquisition Delays*

![Smart India Hackathon](https://img.shields.io/badge/Smart%20India%20Hackathon-2026-FF6B35?style=for-the-badge)
![SIH](https://img.shields.io/badge/Problem%20Statement-SIH26017-2563EB?style=for-the-badge)
![Theme](https://img.shields.io/badge/Theme-Smart%20Automation-7C3AED?style=for-the-badge)
![Category](https://img.shields.io/badge/Category-Software-16A34A?style=for-the-badge)

**Team Ctrl Freaks • Team ID: SIHDS003**

---

## 🏛️ Smart India Hackathon 2026

| | Details |
|---|---|
| Hackathon | Smart India Hackathon 2026 |
| Problem Statement ID | SIH26017 |
| Problem Statement | Predictive Analytics for Early Detection of Land Acquisition Delays |
| Theme | Smart Automation |
| PS Category | Software |
| Organization | Ministry of Rural Development, Dept. of Land Resources (DoLR) |
| Team Name | Ctrl Freaks |
| Team ID | SIHDS003 |

---

## 🎯 The Problem

Land acquisition is one of the most time-sensitive phases of infrastructure development. Delays are multifaceted — administrative approvals, legal disputes, compensation delays, incomplete documentation, and R&R challenges — and today they are usually detected **reactively**, after a project is already affected.

## 💡 Our Solution

AcquiPredict is an early-warning decision-support platform that helps land acquisition officers identify at-risk cases **before** they become critical, combining a trained risk-scoring engine, explainable drivers, legal-text risk detection, live what-if simulation, and GIS visualization into one workflow.

> "How risky is this case? Why? What can an officer change? What should be prioritized?"

---

## ⭐ Key Features

- **Explainable Risk Score** — risk %, Low/Medium/High classification, predicted delay in days, and ranked top risk drivers per case
- **Legal-Text Risk Scorer** — transparent keyword-severity analysis of dispute/legal text, surfaced as a separate legal-risk signal
- **Live What-If Simulator** — adjust compensation %, approval delay, legal disputes, R&R % and instantly see the recalculated risk and delay
- **GIS Risk Map** — district-level visualization of every case, color-coded by risk
- **Analytics Dashboard** — risk distribution, acquisition-stage and infrastructure-type breakdowns
- **Audit Trail** — every simulation and key action logged with timestamp, role and detail
- **Role-Based Access** — Administrator / Field Officer / Viewer, gating case creation, simulation and export
- **CSV Export**

## 📌 Explicitly Proposed (Not Built in Prototype)

To be transparent with reviewers: the following are described as **future/proposed** capabilities, not implemented in this prototype —
- Automated SMS/email alert delivery
- Continuous model retraining pipeline
- Replacement of synthetic training data with authorized historical records (the architecture supports this with no code changes to the scoring formula)

---

## 🧠 Risk Scoring Approach

The risk-scoring logic is a **domain-calibrated weighted formula** covering: approval delay days, compensation completion %, legal disputes, land ownership disputes, R&R completion %, average departmental response time, affected families, missing/incomplete documents, and acquisition stage.

```
Risk % = min(100, Predicted Delay Days ÷ 180 × 100)
```

| Risk Level | Range | Officer Action |
|---|---|---|
| 🟢 LOW | < 33% | Monitor |
| 🟡 MEDIUM | 33–65.9% | Watch & Review |
| 🔴 HIGH | ≥ 66% | Officer Review + Priority Action |

The weighting was calibrated against the delay relationships described in the problem statement. The architecture is intentionally built so this formula can be replaced with a trained model on authorized historical case data without changing any surrounding application code.

**Data transparency:** the prototype currently has no authorized historical land-acquisition dataset to train against — predictions should be read as a demonstration of the full workflow, not as validated production accuracy.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| ⚛️ React (Vite) | Frontend UI |
| 🗄️ Supabase (PostgreSQL) | Case data, audit log storage |
| 🔐 Supabase Auth | Login and role-based access |
| 🗺️ Leaflet | GIS risk map |
| 📊 Recharts | Analytics dashboard charts |
| 🧠 JavaScript risk-scoring engine | Client-side explainable risk calculation (`riskEngine.js`) |

---

## 📂 Project Structure

```
acquipredict-frontend/
├── src/
│   ├── App.jsx           — dashboard + what-if simulator
│   ├── App.css            — styling
│   ├── riskEngine.js       — risk scoring + legal-risk NLP signal
│   ├── supabaseClient.js   — Supabase connection
│   └── main.jsx
├── supabase/
│   └── supabase_schema.sql — database schema + seed data
├── package.json
└── README.md
```

---

## 🚀 Running the Project

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd acquipredict-frontend
npm install
```

Create a `.env` file (see `.env.example`) with your Supabase project URL and publishable key, then run the schema in `supabase/supabase_schema.sql` via the Supabase SQL Editor.

```bash
npm run dev
```

---

## 🌐 Project Links

- **Live Website:** (https://acquipredict.netlify.app/)
- **GitHub Repository:** (https://github.com/FatoomMohammed/-FatoomMohammed-acquipredict-.git)
- **Demo Video:** (https://drive.google.com/file/d/10Mq1-txeL20xdfC5VRZyi-UUe32QvOir/view?usp=sharing)

---

## 📚 Research & References

1. **RFCTLARR Act, 2013** — legal framework for land acquisition, compensation and R&R. Source: India Code, Government of India — https://www.indiacode.nic.in/
2. **MoSPI Project Monitoring** — project monitoring data used for problem-impact context. Source: Ministry of Statistics & Programme Implementation — https://www.mospi.gov.in/
3. **BhoomiRashi** — government platform for online NH land-acquisition processing. Source: MoRTH — https://bhoomirashi.gov.in/
4. **MoRTH Land Acquisition Guidelines** — https://morth.nic.in/land-acquisition

---

## 🏆 Smart India Hackathon 2026

**Problem Statement:** SIH26017 — Predictive Analytics for Early Detection of Land Acquisition Delays
**Team:** Ctrl Freaks
• **Team ID:** SIHDS003

**AcquiPredict — Predict → Explain → Simulate → Prioritize → Act**
