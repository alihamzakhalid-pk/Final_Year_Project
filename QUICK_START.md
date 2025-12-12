# Quick Start Guide - After Fix

## Prerequisites
- Python 3.8+
- Node.js 16+
- `.env` file configured with:
  - MAIL_USERNAME
  - MAIL_PASSWORD
  - OPENAI_API_KEY

---

## 1️⃣ Start Backend Server

```bash
cd c:\Users\HP machine\OneDrive\Desktop\FYP\Final_Year_Project
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
```

---

## 2️⃣ Start Frontend Dev Server

In another terminal:

```bash
cd c:\Users\HP machine\OneDrive\Desktop\FYP\Final_Year_Project\botme-ui-react
npm install  # Only needed once
npm run dev
```

You should see:
```
 VITE v7.2.2  ready in 234 ms
 ➜  Local:   http://localhost:5173/
```

---

## 3️⃣ Access the Application

Open your browser and go to: **http://localhost:5173**

---

## 4️⃣ Create Your First Account

1. Click **Sign Up**
2. Enter:
   - Full Name: Your name
   - Email: Your email
   - Password: Strong password
3. Check your email for verification code
4. Enter the 6-digit code

---

## 5️⃣ Login

1. Click **Login**
2. Enter your email and password
3. Check your email for verification code
4. Enter the 6-digit code
5. You're in! 🎉

---

## 6️⃣ Upload a WhatsApp Chat

1. Go to **Dashboard**
2. Export a WhatsApp chat as `.txt` file
3. Click **Upload Chat**
4. Select the file
5. Choose a person from the chat
6. Start chatting with their AI persona!

---

## Troubleshooting

### Backend won't start
```bash
# Reinitialize database
python init_db.py

# Check if port 5000 is in use
netstat -ano | findstr :5000
```

### Frontend won't load
```bash
# Clear cache and reinstall
cd botme-ui-react
rm -r node_modules package-lock.json
npm install
npm run dev
```

### Login gives 500 error
```bash
# Recreate database
python init_db.py

# Check .env file has MAIL_USERNAME and MAIL_PASSWORD
```

### Email not received
- Check spam folder
- Verify MAIL_USERNAME and MAIL_PASSWORD in `.env`
- For Gmail, use an App Password, not your regular password

---

## Development Tips

### Access Database
```bash
# Using Python
python
>>> from models import User
>>> User.query.all()

# Using DB Browser
# Download: https://sqlitebrowser.org/
# Open: instance/botme.db
```

### View API Logs
The Flask terminal will show all API requests and database queries.

### React Component Hot Reload
Changes to React components auto-refresh in the browser.

### Inspect Network Requests
Open browser DevTools (F12) → Network tab → See all API calls

---

## Project Structure

```
FYP/Final_Year_Project/
├── app.py                 # Main Flask app
├── models.py              # Database models
├── config.py              # Configuration
├── chatbot.py             # AI chatbot logic
├── personality_analysis.py # Analysis module
├── parse_chat.py          # WhatsApp parser
├── botme-ui-react/        # Frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   └── hooks/         # React hooks
│   └── package.json
└── instance/
    └── botme.db           # SQLite database
```

---

## Key Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/login` | Send verification code |
| POST | `/api/verify-login` | Verify code & login |
| POST | `/api/signup` | Create account |
| POST | `/api/verify-signup` | Verify signup code |
| POST | `/api/upload` | Upload WhatsApp chat |
| POST | `/api/chat/<id>` | Send message to chatbot |
| GET | `/api/me` | Get current user |
| POST | `/api/logout` | Logout |

---

## Performance Tips

1. **First Load**: App caches dependencies, subsequent loads are faster
2. **Build Optimization**: `npm run build` for production
3. **Database**: SQLite is good for development, consider PostgreSQL for production
4. **Chat Analysis**: Large chats (>5000 messages) may take time to analyze

---

## Next Steps

- [ ] Create account
- [ ] Upload WhatsApp chat
- [ ] Create AI persona
- [ ] Chat with persona
- [ ] View personality analysis
- [ ] Explore personality traits dashboard
- [ ] Invite friends to use BotMe

---

Happy coding! 🚀
