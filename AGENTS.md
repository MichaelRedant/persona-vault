# 👥 AGENTS.md — Persona Vault Developer Guide

Welkom bij de ontwikkelaarsrichtlijnen voor het **Persona Vault** project. Dit document bevat technische standaarden, conventies en werkinstructies die gevolgd moeten worden bij het ontwikkelen, onderhouden en uitbreiden van deze repository.

---

## 📁 Projectstructuur

```txt
persona-vault/
│
├── api/                # PHP API (backend)
├── src/                # React frontend (Vite + Tailwind CSS)
├── public/             # Static assets
├── .env.example        # Environment configuratie voorbeeld
├── package.json        # NPM projectconfiguratie
├── composer.json       # PHP dependencybeheer
├── README.md
└── AGENTS.md           # 👉 Dit bestand
````

---

## ⚙️ Development Setup

### React Frontend

* Zorg voor Node.js v18 of hoger.
* Installeer dependencies:

  ```bash
  npm install
  ```

### PHP Backend

* Zorg voor PHP 8.x en Composer.
* Ga naar de `api` map:

  ```bash
  cd api
  composer install
  ```

### Database

* MySQL 5.7+ of MariaDB.
* Tabellen worden beheerd via `phpMyAdmin` of CLI.
* `.env` bestand instellen op basis van `.env.example`.

---

## 💻 Coding Guidelines

### JavaScript / React

| Regel                                         | Uitleg                                               |
| --------------------------------------------- | ---------------------------------------------------- |
| ✅ Gebruik `function components` + React Hooks | `useState`, `useEffect`, `useContext`, ...           |
| ✅ Tailwind CSS                                | Vermijd inline styles of externe CSS-bestanden       |
| ✅ Component files in `PascalCase`             | Bijvoorbeeld `PromptEditor.jsx`, `WorkspaceList.jsx` |
| ✅ Scheid views, components en hooks           | Gebruik `/views`, `/components`, `/hooks`            |
| ❌ Geen class components of jQuery             |                                                      |

### PHP (API)

| Regel                                                 | Uitleg                               |
| ----------------------------------------------------- | ------------------------------------ |
| ✅ PSR-12 standaard                                    | Indentatie, whitespace, naming       |
| ✅ Prepared statements                                 | Bescherm tegen SQL injection         |
| ✅ Kort & leesbaar                                     | Vermijd `god functions` (>50 regels) |
| ✅ `try/catch` voor foutafhandeling                    | + consistente JSON-errorstructuur    |
| ❌ Geen inline HTML of echo statements (behalve debug) |                                      |

---

## 🔐 Security & Auth

* JWT authenticatie (`jwt_utils.php`) wordt gebruikt.
* Elke request moet `Authorization: Bearer <token>` header bevatten.
* JWT bevat: `user_id`, `username`, `workspace_id`, optioneel `is_admin`.

---

## 🧪 Testing & Validatie

### Frontend

```bash
npm run lint     # Check op ESLint fouten
npm run dev      # Start dev server
```

### Backend

```bash
php -l api/<bestand>.php     # Syntax check
```

### Manual Testing Checklist

* ✅ Nieuwe registratie creëert user + workspace
* ✅ JWT bevat correcte gegevens
* ✅ User ziet enkel data binnen zijn workspace
* ✅ Adminrechten correct gedetecteerd
* ✅ Unauthorized access geeft 401

---

## 🔀 Git & Commit Conventies

Gebruik [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

| Type        | Voorbeeld                                 |
| ----------- | ----------------------------------------- |
| `feat:`     | `feat: add search to workspace list`      |
| `fix:`      | `fix: correct workspace filter logic`     |
| `refactor:` | `refactor: extract hook for JWT decoding` |
| `docs:`     | `docs: update AGENTS.md`                  |

### Pull Requests

* Referentie naar relevante issues (`closes #12`)
* Beschrijf:

  * Wat is aangepast
  * Waarom
  * Hoe getest
* Screenshots of screencasts zijn aanbevolen

---

## 📦 API Structuur (Overzicht)

| Endpoint                   | Methode | Beschrijving                              |
| -------------------------- | ------- | ----------------------------------------- |
| `/api/auth_register.php`   | POST    | Registreert nieuwe user + workspace       |
| `/api/auth_login.php`      | POST    | Authenticeert user en geeft JWT           |
| `/api/workspaces_get.php`  | GET     | Haalt workspaces op waar user lid van is  |
| `/api/personas_create.php` | POST    | Creëert persona (scoped per workspace)    |
| `/api/prompts_get.php`     | GET     | Haalt prompts binnen huidige workspace op |

---

## 🧠 Rollen & Machtigingen

| Rol      | Rechten                          |
| -------- | -------------------------------- |
| `admin`  | CRUD op alles in de workspace    |
| `editor` | Aanmaken & aanpassen van content |
| `viewer` | Enkel lezen (geen mutaties)      |

Alle `API endpoints` moeten machtiging valideren via `auth_check.php`.

---

## 📚 Aanbevolen Tools

| Tool                                            | Functie              |
| ----------------------------------------------- | -------------------- |
| [Postman](https://www.postman.com/)             | API testen           |
| [Insomnia](https://insomnia.rest/)              | JWT test automation  |
| [PHPStorm](https://www.jetbrains.com/phpstorm/) | Backend development  |
| [VS Code](https://code.visualstudio.com/)       | Frontend development |
| [Tailwind Play](https://play.tailwindcss.com/)  | Styling previews     |

---

## 🧩 Toekomstige Verbeteringen

* ✅ Gedeelde workspaces (in progress)
* ⏳ Diff-view voor revisies
* ⏳ Dark mode toggle
* ⏳ Export functionaliteit als ZIP of JSON
* ⏳ Unit tests voor API (`PHPUnit`)

---

## 🤝 Credits

Ontwikkeld door [Michaël Redant](https://www.linkedin.com/in/michaelredant) via **Xinudesign**
Persona Vault is een project dat AI, personalisatie en efficiëntie combineert voor AI-gedreven workflows.

---

## 📄 Licentie

Dit project is **closed source** tenzij anders vermeld. Alle rechten voorbehouden aan de maker.
