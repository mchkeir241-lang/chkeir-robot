# 🤖 CHKEIR ROBOT

**Smart AI Assistant** — Created by **Mahdi Chkeir** 🇱🇧

---

## ✨ Features

### 🆓 Everything is FREE!

- 💬 **Chat in 3 languages** — Arabic, English, Arabizi (auto-detect)
- 🎙️ **Voice input & output** — Talk and listen
- 📷 **Image analysis** — Read screenshots, code, homework, charts
- 💻 **Code generation** — Build complete projects with multiple files
- 📦 **ZIP download** — Get all files in one ZIP (browser-based)
- 📋 **Copy/Download** — Copy any code or download single files
- 🎓 **Study help** — Math, physics, chemistry, languages
- 🧮 **Problem solving** — Step-by-step solutions
- 🌍 **Translation** — Between any languages
- ⚡ **Quick Actions** — One-tap prompts
- 🎨 **Beautiful UI** — Splash screen, animated background
- 📱 **Install as App** — Works on Android/iPhone (PWA)
- 💾 **Saves history** — Remembers your conversations
- 🤖 **Powered by** Llama 3.3 70B + Llama Vision

---

## 🚀 Deploy in 15 Minutes (FREE)

### Step 1: Get Groq API Key (5 min)

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free)
3. Create API Key
4. Copy it (starts with `gsk_...`)

### Step 2: GitHub Account (5 min)

1. Go to [github.com](https://github.com)
2. Sign up
3. Verify email

### Step 3: Upload Code

1. On GitHub: Click **"+"** → **"New repository"**
2. Name: `chkeir-robot`
3. Click **"Create repository"**
4. Click **"uploading an existing file"**
5. Drag ALL files from `chkeir_chatbot` folder
6. Click **"Commit changes"**

### Step 4: Deploy on Vercel (5 min)

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up with GitHub"**
3. Click **"Add New Project"**
4. Select `chkeir-robot`
5. Click **"Deploy"** (don't change anything)

### Step 5: Add API Key

1. On Vercel: Click your project
2. Click **"Settings"** → **"Environment Variables"**
3. Add:
   - **Name:** `GROQ_API_KEY`
   - **Value:** your `gsk_...` key
4. Click **"Save"**
5. Go to **"Deployments"** → Click **"..."** → **"Redeploy"**

### Step 6: Use It!

Visit: `https://chkeir-robot-XXX.vercel.app`

---

## 📱 Install on Mobile

### Android
1. Open URL in **Chrome**
2. Tap **⋮** menu
3. Tap **"Install app"** or **"Add to Home Screen"**
4. Done! Icon on home screen

### iPhone
1. Open URL in **Safari**
2. Tap **Share** button (📤)
3. Tap **"Add to Home Screen"**
4. Done!

---

## 💡 How to Use

### Build Complete Projects

Just ask:
- "Build me a tic tac toe game"
- "Create a calculator with HTML/CSS/JS"
- "Make a todo list app"
- "Build a landing page for a restaurant"

The AI will:
1. Generate all files needed
2. Show each file with **Copy** and **Download** buttons
3. Provide a **"Download All as ZIP"** button
4. Give you working code ready to use

### Get Help

- "Solve this math problem: ..."
- "Explain photosynthesis"
- "Translate this to French"
- "Write a professional email"
- "Help me with my homework"

### Use Images

- Upload screenshot of error code → AI debugs it
- Upload homework → AI helps solve it
- Upload chart → AI explains it
- Upload Arabic/English text → AI reads it

### Voice

- Tap microphone
- Speak your question (Arabic or English)
- AI responds with voice

---

## 🆓 Free Limits (Plenty!)

- **14,400 questions/day** (Groq Free)
- **30 questions/minute**
- **100 GB bandwidth/month** (Vercel Free)
- Supports **500-1000 daily users**

---

## 🎨 Tech Stack

- **Frontend:** Pure HTML/CSS/JavaScript (no frameworks needed)
- **Backend:** Vercel Serverless Functions
- **AI Models:**
  - Llama 3.3 70B Versatile (chat)
  - Llama 3.2 90B Vision (images)
- **ZIP Generation:** JSZip (browser-based, free)
- **Voice:** Web Speech API + TTS (built-in browser)
- **Hosting:** Vercel Free Tier
- **Icon:** Emoji-based SVG

---

## 🐛 Troubleshooting

**API not working?**
- Check `GROQ_API_KEY` is set in Vercel
- Redeploy after adding the key
- Check key is valid at console.groq.com

**Voice not working?**
- Use **Chrome browser** (best support)
- Allow microphone permission
- Check browser supports Web Speech API

**Image upload fails?**
- Max 5 MB per image
- Use JPG/PNG/WebP

---

## 📜 Project Structure

```
chkeir-robot/
├── index.html        # Main interface
├── style.css         # Styling + animations
├── script.js         # All client logic
├── api/
│   ├── chat.js      # Groq Llama 3.3 endpoint
│   └── vision.js    # Groq Vision endpoint
├── manifest.json     # PWA configuration
├── vercel.json       # Vercel settings
├── package.json      # Project info
└── README.md         # This file
```

---

## 💚 Made with Love

**Mahdi Chkeir** 🇱🇧 (مهدي شقير)

For students, developers, and curious minds everywhere.

**100% Free Forever.**
