# BotMe - AI Persona Chatbot Platform

<div align="center">

![BotMe Logo](https://img.shields.io/badge/BotMe-AI%20Persona%20Chatbot-blue?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.8+-green?style=flat-square)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square)
![License](https://img.shields.io/badge/License-FYP-orange?style=flat-square)

**Transform your WhatsApp conversations into AI personas that remember everything**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [API](#-api-endpoints) • [Admin Panel](#-admin-panel)

</div>

---

## 📖 About

**BotMe** is a Final Year Project that creates personalized AI chatbots based on your WhatsApp chat history. Upload your chat exports, and BotMe will analyze the conversation patterns, personality traits, and communication styles to create AI personas that mimic the people you've chatted with.

### Key Highlights

- 🤖 **RAG-Powered Personas**: Uses Retrieval-Augmented Generation with ChromaDB for context-aware responses
- 📊 **Personality Analysis**: Deep insights into Big Five traits, emotional tone, and communication patterns
- 🔒 **Privacy-First**: Secure authentication with Google OAuth support
- 💬 **Natural Conversations**: AI personas remember context and match the person's communication style
- 📱 **Modern UI**: Beautiful React frontend with dark mode support
- 👑 **Admin Panel**: User management, statistics, and system monitoring

---

## ✨ Features

### Core Features

| Feature | Description |
|---------|-------------|
| 📤 **Chat Upload** | Upload WhatsApp chat exports (.txt files) |
| 👥 **Persona Selection** | Choose from multiple people in your chat |
| 💬 **RAG Chatbot** | Context-aware AI using vector embeddings |
| 📈 **Personality Analysis** | Big Five traits, sentiment, vocabulary analysis |

### User Features

- 🔐 **Authentication**: Email/password + Google OAuth
- 🎨 **Modern UI**: React + Tailwind CSS + Framer Motion
- 🌙 **Dark Mode**: System-aware theme toggle
- 📱 **Responsive**: Works on desktop and mobile

### Admin Features

- 📊 **Dashboard Statistics**: Users, chats, messages count
- 👥 **User Management**: View, search, activate/deactivate users
- 👑 **Admin Roles**: Grant/revoke admin privileges
- 🗑️ **User Deletion**: Remove users and their data

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Flask | Web framework |
| Flask-SQLAlchemy | Database ORM |
| Flask-Login | User sessions |
| LangChain | AI/LLM integration |
| ChromaDB | Vector embeddings storage |
| OpenAI GPT-4o-mini | Language model |
| SQLite | Database |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI library |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Axios | HTTP client |
| Lucide React | Icons |

---

## 📦 Installation

### Prerequisites

- Python 3.8+
- Node.js 16+
- OpenAI API key

### Step 1: Clone & Setup Backend

```bash
git clone <repository-url>
cd Final_Year_Project

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Configure Environment

Create `.env` file in project root:

```env
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key

# Email (for verification)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

### Step 3: Setup Frontend

```bash
cd botme-ui-react
npm install
```

### Step 4: Initialize Database

```bash
python -c "from app import app, db; app.app_context().push(); db.create_all()"
```

---

## 🚀 Usage

### Start Development Servers

**Terminal 1 - Backend:**
```bash
python app.py
# Runs on http://127.0.0.1:5000
```

**Terminal 2 - Frontend:**
```bash
cd botme-ui-react
npm run dev
# Runs on http://localhost:5173
```

### Using BotMe

1. **Sign Up**: Create account or use Google OAuth
2. **Upload Chat**: Export WhatsApp chat → Upload `.txt` file
3. **Select Persona**: Choose a person to emulate
4. **Start Chatting**: AI will respond in their style
5. **View Analysis**: Explore personality insights

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/signup` | Create new account |
| POST | `/api/login` | Login with password |
| POST | `/api/logout` | Logout |
| GET | `/api/me` | Get current user |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload chat file |
| POST | `/api/select_person` | Select persona |
| POST | `/api/chat/<id>/rag` | Send message (RAG) |
| GET | `/api/chat/<id>/context` | Get chat context |
| DELETE | `/api/chat/<id>` | Delete chat |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/users` | List users |
| POST | `/api/admin/users/<id>/toggle-admin` | Toggle admin |
| POST | `/api/admin/users/<id>/toggle-active` | Ban/unban |
| DELETE | `/api/admin/users/<id>` | Delete user |

---

## 👑 Admin Panel

Access the admin panel at `/admin` (requires admin role).

### Make Yourself Admin

```python
# In Flask shell or Python script
import sqlite3
conn = sqlite3.connect('instance/botme.db')
cursor = conn.cursor()
cursor.execute('UPDATE user SET is_admin = 1 WHERE email = "your@email.com"')
conn.commit()
conn.close()
```

---

## 📁 Project Structure

```
Final_Year_Project/
├── app.py                      # Flask application
├── config.py                   # Configuration
├── models.py                   # Database models
├── rag_chatbot.py              # RAG chatbot (ChromaDB + LangChain)
├── personality_analysis.py     # Big Five analysis
├── parse_chat.py               # WhatsApp parser
├── oauth_handler.py            # Google OAuth
├── init_db.py                  # Database initialization
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables
│
├── botme-ui-react/             # React frontend
│   ├── src/
│   │   ├── api/                # Axios config
│   │   ├── components/         # UI components
│   │   │   ├── ui/             # Reusable components
│   │   │   └── personality/    # Analysis charts
│   │   ├── hooks/              # Custom hooks
│   │   ├── pages/              # Page components
│   │   └── styles/             # CSS
│   ├── package.json
│   └── vite.config.js
│
├── instance/                   # SQLite database
├── chroma_db/                  # Vector embeddings
└── flask_session/              # Session storage
```

---

## 🔒 Security

- ✅ Password hashing with Werkzeug
- ✅ Session-based authentication
- ✅ Google OAuth 2.0 support
- ✅ Admin role-based access control
- ✅ One-click account deletion

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| OPENAI_API_KEY not set | Add key to `.env` file |
| Database locked | Close other Python processes |
| CORS error | Ensure ports 5000 (backend) and 5173 (frontend) |
| Vector store error | Delete `chroma_db/` folder and retry |

---

## 📝 License

This project is part of a Final Year Project (FYP). All rights reserved.

---

<div align="center">

**Made with ❤️ for Final Year Project**

**BotMe** - AI Persona Chatbot Platform

</div>
