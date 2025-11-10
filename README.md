# BotMe - AI Persona Chatbot Platform

<div align="center">

![BotMe Logo](https://img.shields.io/badge/BotMe-AI%20Persona%20Chatbot-blue?style=for-the-badge)

**Transform your WhatsApp conversations into AI personas that remember everything**

[Features](#-features) • [Installation](#-installation) • [Configuration](#-configuration) • [Usage](#-usage) • [API](#-api-endpoints) • [Project Structure](#-project-structure)

</div>

---

## 📖 About

**BotMe** is a Final Year Project that creates personalized AI chatbots based on your WhatsApp chat history. Upload your chat exports, and BotMe will analyze the conversation patterns, personality traits, and communication styles to create AI personas that mimic the people you've chatted with. Each persona remembers your entire conversation history, making interactions feel natural and authentic.

### Key Highlights

- 🤖 **AI-Powered Personas**: Create chatbots that emulate real people from your chats
- 📊 **Personality Analysis**: Deep insights into communication patterns, emotional tone, and behavioral traits
- 🔒 **Privacy-First**: End-to-end encrypted, with one-click data deletion
- 💬 **Natural Conversations**: AI personas remember context, inside jokes, and shared memories
- 📱 **Modern UI**: Beautiful, responsive React frontend with dark mode support

---

## ✨ Features

### Core Features

- **📤 Chat Upload**: Upload WhatsApp chat exports (.txt files) and automatically extract participants
- **👥 Persona Selection**: Choose from multiple people in your chat history to create AI personas
- **💬 Intelligent Chatting**: Chat with AI personas that understand context and conversation history
- **📈 Personality Analysis**: Comprehensive analysis including:
  - Communication patterns and activity timing
  - Emotional tone and sentiment analysis
  - Vocabulary analysis and word frequency
  - Personality traits visualization
  - Communication style charts

### User Features

- **🔐 Secure Authentication**: Email-based 2FA verification system
- **👤 User Dashboard**: Manage multiple personas and chat histories
- **🎨 Modern UI**: Built with React, Tailwind CSS, and Framer Motion
- **🌙 Dark Mode**: Theme toggle for comfortable viewing
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

### Technical Features

- **🧠 LangChain Integration**: Powered by OpenAI GPT-4 for intelligent responses
- **💾 SQLite Database**: Lightweight, file-based database for easy deployment
- **🔌 RESTful API**: Clean API architecture for frontend-backend communication
- **📧 Email Integration**: Flask-Mail for verification code delivery
- **🔄 Real-time Updates**: Dynamic UI updates with React hooks

---

## 🛠️ Tech Stack

### Backend
- **Flask** - Python web framework
- **Flask-SQLAlchemy** - Database ORM
- **Flask-Login** - User session management
- **Flask-Mail** - Email functionality
- **Flask-CORS** - Cross-origin resource sharing
- **LangChain** - AI/LLM integration
- **OpenAI GPT-4** - Language model
- **SQLite** - Database

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Development Tools
- **Python 3.x** - Backend runtime
- **Node.js** - Frontend runtime
- **npm/pip** - Package managers

---

## 📦 Installation

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn
- OpenAI API key
- Email account (for 2FA verification)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Final_Year_Project
```

### Step 2: Backend Setup

1. **Create a virtual environment** (recommended):

```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

2. **Install Python dependencies**:

```bash
pip install -r requirements.txt
```

3. **Create a `.env` file** in the project root:

```env
# Flask Configuration
SECRET_KEY=your-secret-key-here-change-in-production

# OpenAI API Key (Required)
OPENAI_API_KEY=your-openai-api-key-here

# Database (SQLite - default)
# SQLALCHEMY_DATABASE_URI=sqlite:///botme.db

# Email Configuration (Required for 2FA)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com
```

> **Note**: For Gmail, you need to use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password. See [EMAIL_SETUP.md](EMAIL_SETUP.md) for detailed instructions.

### Step 3: Frontend Setup

1. **Navigate to the frontend directory**:

```bash
cd botme-ui-react
```

2. **Install Node.js dependencies**:

```bash
npm install
```

3. **Create environment file** (optional):

```bash
cp env.example .env
```

### Step 4: Initialize Database

The database will be automatically created on first run. To manually initialize:

```bash
python
```

```python
from app import app, db
from models import User, ChatData, VerificationCode

with app.app_context():
    db.create_all()
    print("Database initialized successfully!")
```

---

## ⚙️ Configuration

### Email Setup

BotMe uses email verification for signup and login. Configure your email settings in the `.env` file. See [EMAIL_SETUP.md](EMAIL_SETUP.md) for detailed setup instructions for Gmail, Outlook, and other providers.

### OpenAI API Key

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your `.env` file as `OPENAI_API_KEY`
3. Ensure you have sufficient credits in your OpenAI account

### CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:5173`
- Local network IPs on port 5173

For production, update CORS settings in `app.py`.

---

## 🚀 Usage

### Development Mode

1. **Start the Flask backend** (from project root):

```bash
python app.py
```

The backend will run on `http://127.0.0.1:5000`

2. **Start the React frontend** (from `botme-ui-react` directory):

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

3. **Open your browser** and navigate to `http://localhost:5173`

### Production Build

1. **Build the frontend**:

```bash
cd botme-ui-react
npm run build
```

2. **Serve the built files** with Flask or a web server like Nginx

### Using BotMe

1. **Sign Up**: Create an account with email verification
2. **Upload Chat**: Export a WhatsApp chat and upload the `.txt` file
3. **Select Persona**: Choose a person from your chat history
4. **Start Chatting**: Begin conversations with your AI persona
5. **View Analysis**: Explore personality insights and communication patterns

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/signup` | Send verification code for signup |
| POST | `/api/verify-signup` | Verify code and create account |
| POST | `/api/login` | Send verification code for login |
| POST | `/api/verify-login` | Verify code and login |
| POST | `/api/logout` | Logout current user |
| GET | `/api/me` | Get current user info |

### Chat Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload WhatsApp chat file |
| POST | `/api/select_person` | Select persona for chat |
| GET | `/api/chat/<chat_id>/context` | Get chat context and history |
| POST | `/api/chat/<chat_id>` | Send message to chatbot |
| GET | `/api/chat/<chat_id>/participants` | Get chat participants |
| DELETE | `/api/chat/<chat_id>` | Delete a chat/persona |
| GET | `/api/personas` | Get all user personas |

### Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/personality/<chat_id>` | Get personality analysis |
| POST | `/api/analyze` | Analyze chat data |

### Account

| Method | Endpoint | Description |
|--------|----------|-------------|
| DELETE | `/api/account/delete` | Delete user account |

### Utility

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check endpoint |
| POST | `/api/contact` | Submit contact form |

---

## 📁 Project Structure

```
Final_Year_Project/
│
├── app.py                      # Flask application entry point
├── config.py                   # Configuration settings
├── models.py                   # Database models
├── chatbot.py                  # Chatbot logic and LangChain integration
├── personality_analysis.py     # Personality analysis module
├── parse_chat.py               # WhatsApp chat parser
├── requirements.txt            # Python dependencies
├── README.md                   # This file
├── EMAIL_SETUP.md             # Email configuration guide
│
├── botme-ui-react/            # React frontend
│   ├── src/
│   │   ├── api/               # API client configuration
│   │   ├── components/        # React components
│   │   │   ├── ui/           # Reusable UI components
│   │   │   └── personality/  # Personality analysis components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   └── styles/           # CSS and styling
│   ├── package.json          # Node.js dependencies
│   └── vite.config.js        # Vite configuration
│
├── templates/                 # Flask HTML templates (legacy)
├── static/                    # Static files (legacy)
├── instance/                  # Database instance
└── flask_session/            # Flask session storage
```

---

## 🔒 Security & Privacy

- **Password Hashing**: All passwords are hashed using Werkzeug's secure password hashing
- **Session Management**: Secure session cookies with HttpOnly and SameSite attributes
- **Email Verification**: 2FA verification codes expire after 10 minutes
- **Data Isolation**: Users can only access their own chat data
- **One-Click Deletion**: Users can delete their account and all associated data instantly

---

## 🧪 Testing

### Backend Testing

```bash
# Run Flask app in debug mode
python app.py
```

### Frontend Testing

```bash
cd botme-ui-react
npm run dev
```

### Manual Testing Checklist

- [ ] User registration with email verification
- [ ] User login with email verification
- [ ] Chat file upload and parsing
- [ ] Persona selection
- [ ] Chatbot conversation
- [ ] Personality analysis generation
- [ ] Account deletion

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: "OPENAI_API_KEY is not set"
- **Solution**: Ensure your `.env` file contains a valid OpenAI API key

**Issue**: "Failed to send verification email"
- **Solution**: Check email configuration in `.env`. For Gmail, use an App Password. See [EMAIL_SETUP.md](EMAIL_SETUP.md)

**Issue**: "Chat not found or expired"
- **Solution**: Temporary chats expire after 1 hour. Re-upload your chat file

**Issue**: "CORS error"
- **Solution**: Ensure frontend is running on port 5173 and backend on port 5000

**Issue**: "Database locked"
- **Solution**: Close any other processes accessing the database file

### Debug Mode

Enable Flask debug mode by setting `debug=True` in `app.py`:

```python
app.run(host='127.0.0.1', port=5000, debug=True)
```

---

## 📝 License

This project is part of a Final Year Project (FYP). All rights reserved.

---

## 👥 Contributing

This is a Final Year Project. For questions or suggestions, please contact the project maintainer.

---

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 API
- **LangChain** for LLM integration framework
- **React Community** for excellent libraries and tools
- **Flask** for the lightweight web framework

---

## 📧 Contact

For support or inquiries, please use the contact form in the application or reach out through the project repository.

---

<div align="center">

**Made with ❤️ for Final Year Project**

⭐ Star this repo if you find it helpful!

</div>
