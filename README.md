# NAVICA Unified Portal

An academic prototype for victim support, criminal case tracking, statutory rights education, and crisis helplines.

Consolidates:
- **Navica Pathway Support**
- **Navica Pathfinder**
- **7 Statutory Crisis & Emergency Directories** (112, 102, 101, 15100, 14433, 14416, 080-46110007, 181, 1098, 14456, 8929667579, 14567, 1930)

---

## 📁 Project Structure

- `index.html` — Core single-page application structure with all views (Home, Verify/Login, Dashboard, Rights, Authority Desk, Helplines Directory).
- `styles.css` — Trauma-informed design system with Google Fonts (`Sora`, `Manrope`, `JetBrains Mono`), dark/light mode, and high-contrast emergency cards.
- `data.js` — Data models for cases, emergency helplines, rights directory, and reactive `NavicaStore` state management.
- `app.js` — Client-side router, OTP generation & verification, authority case editor, and real-time synchronization.
- `server.ps1` — Lightweight PowerShell HTTP server running on port 8080.

---

## 🚀 How to Run

### Option 1: Using the PowerShell Local Server
Run in PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```
Then visit: [http://localhost:8080](http://localhost:8080)

### Option 2: Direct Browser Launch
Double click or open `index.html` directly in any web browser.

---

## 🔑 Demo Credentials

### Victim Case Password Access:
- `+91 9000000001` / `NAV-001` — **Ananya Sharma** (Password: `ananya123`, Investigation stage)
- `+91 9000000002` / `NAV-002` — **Rahul Verma** (Password: `rahul123`, Court proceedings stage)
- `+91 9000000003` / `NAV-003` — **Priya Nair** (Password: `priya123`, Compensation sanction stage)

*(Victims can change and keep their own confidential password anytime in their dashboard; fallback demo password `victim123` also accepted)*

### Authority & Caseworker Desk:
- **Email**: `authority@navica.demo`
- **Passcode**: `NAVICA2026` (or click "Auto-Fill Demo Credentials")
