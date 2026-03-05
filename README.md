# Persona Vault 🗂️✨

**Persona Vault** is een krachtige en minimalistische vault voor het beheren van **Personas** en **Prompts**.  
Het combineert een moderne **React + Vite** frontend met een eenvoudige en veilige **PHP + MySQL** backend API.

Ideaal voor **persoonlijk gebruik**, **AI prompt engineering**, **content creatie workflows**, of als basis voor toekomstige **SaaS-uitbreidingen**.

---

## 🚀 Features

✅ Beheer van **Personas** en **Prompts**  
✅ **Add / Edit / Delete / Favorite** functionaliteit  
✅ **Tag-based filtering** + **Tag counter**  
✅ **Quick Titles** overzicht + **1-click copy**  
✅ **Favorites filter**  
✅ **Dynamic Search** met instant feedback  
✅ **Independent scrolling per tab** (Personas / Prompts → UX polished)  
✅ **Infinite lazy loading** per tab  
✅ **Dynamic Page Title** → `"Username's Vault"` + live count  
✅ **Try in Platform** buttons (AI / ChatGPT integration ready)  
✅ **Import / Export** met **Merge / Replace** ondersteuning  
✅ **Persistent draft save** (Persona / Prompt draft autosave via LocalStorage)  
✅ **Responsive Design** + Full **Dark mode**  
✅ **Sticky Scroll-to-Top button** (Premium UX)  
✅ **Modern UI / UX** (Industry standard level)

---

## 🛠️ Stack

### Frontend

- **React** (via [Vite](https://vitejs.dev/))
- TailwindCSS
- React Hooks / Functional Components
- No Redux / No Complex State Manager (easy to maintain)
- LocalStorage for UX enhancements

### Backend

- **PHP** REST API (modern PSR-style endpoints)
- MySQL database
- PDO for secure DB access
- Full CORS ready
- Simple Token-based Auth (JWT-ready)

---

## 📦 Local Development

### Prerequisites

- Node.js (v18+ recommended)
- PHP (>= 8.0 recommended)
- MySQL (local or remote)
- Git

### Setup

```bash
# Clone the repo
git clone https://github.com/MichaelRedant/persona-vault.git
cd persona-vault

# Install frontend dependencies
npm install

# Configure your .env (VITE_API_BASE_URL etc.)
cp .env.example .env

# Start development server
npm run dev

## Maintenance Migration (Workspace Share Expiry)

For databases that still have `workspace_shares` without `expires_at`:

1. Set `ALLOW_MAINTENANCE=1` in `.env`.
2. Call `POST /api/migrate_workspace_shares_expiry.php` as a global admin user.
3. Set `ALLOW_MAINTENANCE=0` again after success.
