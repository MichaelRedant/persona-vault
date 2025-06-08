# Persona Vault 🗂️✨

**Persona Vault** is a lightweight personal vault to manage **Personas** and **Prompts**.  
The project combines a modern **React + Vite** frontend with a simple **PHP + MySQL** backend API.

Ideal as a base for personal use, prototype tools, or future commercial SaaS extensions.

---

## 🚀 Features

✅ Manage **Personas** and **Prompts**  
✅ Add / Edit / Delete / Favorite items  
✅ Tag-based filtering  
✅ Favorites filtering  
✅ Search with instant feedback  
✅ Dynamic UI → works fully without page reloads  
✅ Simple API → future-proof for multi-user support  
✅ Responsive & Dark mode supported  
✅ Modern component-based code structure  

---

## 🛠️ Stack

### Frontend

- **React** (via [Vite](https://vitejs.dev/))
- TailwindCSS
- React Hooks / Functional components
- No complex state manager (easy to maintain)

### Backend

- **PHP** REST API (modern PSR compliant style)
- MySQL database
- PDO for secure DB access
- Fully CORS ready

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
