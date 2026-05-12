// CHKEIR ROBOT v6 - Level 2 Upgrades
const API_URL = '/api/chat';
const VISION_URL = '/api/vision';

let userName = localStorage.getItem('chkeir_username') || '';
let conversationHistory = [];
let voiceEnabled = localStorage.getItem('voice_enabled') !== 'false';
let quickActionsVisible = localStorage.getItem('quick_visible') !== 'false';
let currentTheme = localStorage.getItem('theme') || 'dark';
let currentLanguage = 'auto';
let isRecording = false;
let recognition = null;
let selectedImage = null;
let deferredPrompt = null;

// Apply theme
document.documentElement.setAttribute('data-theme', currentTheme);

// English to Arabic name map
const nameToArabicMap = {
    'mahdi': 'مهدي', 'mehdi': 'مهدي', 'mahdy': 'مهدي',
    'ahmad': 'أحمد', 'ahmed': 'أحمد',
    'mohamad': 'محمد', 'mohammed': 'محمد', 'mohammad': 'محمد', 'mohamed': 'محمد',
    'ali': 'علي', 'hussein': 'حسين', 'hassan': 'حسن',
    'omar': 'عمر', 'khaled': 'خالد', 'karim': 'كريم',
    'sami': 'سامي', 'samir': 'سمير', 'tarek': 'طارق', 'rami': 'رامي',
    'youssef': 'يوسف', 'yousef': 'يوسف', 'ibrahim': 'إبراهيم',
    'jamal': 'جمال', 'kamal': 'كمال', 'walid': 'وليد',
    'ziad': 'زياد', 'fadi': 'فادي', 'bilal': 'بلال',
    'abbas': 'عباس', 'jaafar': 'جعفر', 'mostafa': 'مصطفى',
    'kassem': 'قاسم', 'qasem': 'قاسم',
    'nadia': 'نادية', 'sara': 'سارة', 'sarah': 'سارة',
    'leila': 'ليلى', 'layla': 'ليلى', 'maya': 'مايا',
    'rana': 'رنا', 'lara': 'لارا', 'nour': 'نور', 'noor': 'نور',
    'yasmin': 'ياسمين', 'fatima': 'فاطمة', 'fatma': 'فاطمة',
    'zeinab': 'زينب', 'zeina': 'زينة', 'reem': 'ريم',
    'lina': 'لينا', 'dana': 'دانا', 'tala': 'تالا',
    'hala': 'هالة', 'rola': 'رولا', 'rasha': 'رشا',
    'mariam': 'مريم', 'maryam': 'مريم'
};

function nameToArabic(name) {
    if (!name) return 'صديقي';
    if (/[\u0600-\u06FF]/.test(name)) return name;
    return nameToArabicMap[name.toLowerCase().trim()] || name;
}

// DOM Elements
const splashScreen = document.getElementById('splashScreen');
const welcomeScreen = document.getElementById('welcomeScreen');
const mainApp = document.getElementById('mainApp');
const userNameInput = document.getElementById('userNameInput');
const enterBtn = document.getElementById('enterBtn');
const userGreeting = document.getElementById('userGreeting');
const chatArea = document.getElementById('chatArea');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const micBtn = document.getElementById('micBtn');
const imgBtn = document.getElementById('imgBtn');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const removeImg = document.getElementById('removeImg');
const voiceToggle = document.getElementById('voiceToggle');
const voiceIcon = document.getElementById('voiceIcon');
const quickToggle = document.getElementById('quickToggle');
const quickActions = document.getElementById('quickActions');
const clearBtn = document.getElementById('clearBtn');
const changeNameBtn = document.getElementById('changeNameBtn');
const shareBtn = document.getElementById('shareBtn');
const installBtn = document.getElementById('installBtn');
const themeToggle = document.getElementById('themeToggle');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const langBadge = document.getElementById('langBadge');
const toast = document.getElementById('toast');

// Initialize theme button
themeToggle.textContent = currentTheme === 'dark' ? '🌙' : '☀️';

// Splash → Welcome/Main
setTimeout(() => {
    splashScreen.classList.add('hide');
    setTimeout(() => {
        splashScreen.style.display = 'none';
        if (userName) {
            showMainApp();
        } else {
            welcomeScreen.style.display = 'flex';
            setTimeout(() => userNameInput.focus(), 300);
        }
    }, 600);
}, 2500);

// Show toast
function showToast(message, type = '') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// Theme toggle
themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    themeToggle.textContent = currentTheme === 'dark' ? '🌙' : '☀️';
    showToast(currentTheme === 'dark' ? '🌙 Dark mode' : '☀️ Light mode');
});

// Enter name
function handleEnter() {
    const name = userNameInput.value.trim();
    if (name.length < 2) {
        userNameInput.style.borderColor = '#f87171';
        userNameInput.focus();
        showToast('اكتب اسمك / Enter your name', 'error');
        setTimeout(() => userNameInput.style.borderColor = '', 1000);
        return;
    }
    userName = name;
    localStorage.setItem('chkeir_username', name);
    welcomeScreen.style.display = 'none';
    showMainApp();
}

enterBtn.addEventListener('click', handleEnter);
userNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleEnter();
});

function showMainApp() {
    mainApp.style.display = 'flex';
    const displayName = nameToArabic(userName);
    userGreeting.textContent = displayName;
    
    if (!quickActionsVisible) quickActions.classList.add('hidden');
    
    if (chatArea.children.length === 0) {
        const greeting = `أهلاً وسهلاً ${displayName}! تفضل، كيف يمكنني خدمتك؟\n\nHello ${userName}! How can I help you today?`;
        addMessage('bot', greeting);
    }
    
    setupRecognition();
}

// Add message
function addMessage(role, text, imageUrl = null) {
    const msg = document.createElement('div');
    msg.className = `message ${role}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    if (role === 'bot') avatar.textContent = '🤖';
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    
    const name = document.createElement('div');
    name.className = 'bubble-name';
    name.textContent = role === 'bot' ? 'CHKEIR ROBOT' : (nameToArabic(userName) || userName).toUpperCase();
    bubble.appendChild(name);
    
    if (imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.className = 'bubble-image';
        bubble.appendChild(img);
    }
    
    if (role === 'bot') {
        const parts = parseCodeFiles(text);
        if (parts.length > 1) {
            renderMessageWithFiles(bubble, parts);
        } else {
            const textDiv = document.createElement('div');
            textDiv.className = 'bubble-text';
            textDiv.innerHTML = formatText(text);
            bubble.appendChild(textDiv);
        }
        
        // Bubble actions for bot messages
        const actions = document.createElement('div');
        actions.className = 'bubble-actions';
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'bubble-action';
        copyBtn.innerHTML = '<span>📋</span><span>نسخ</span>';
        copyBtn.onclick = () => copyText(text);
        actions.appendChild(copyBtn);
        
        if (voiceEnabled) {
            const speakBtn = document.createElement('button');
            speakBtn.className = 'bubble-action';
            speakBtn.innerHTML = '<span>🔊</span><span>صوت</span>';
            speakBtn.onclick = () => speak(text);
            actions.appendChild(speakBtn);
        }
        
        bubble.appendChild(actions);
    } else {
        const textDiv = document.createElement('div');
        textDiv.className = 'bubble-text';
        textDiv.textContent = text;
        bubble.appendChild(textDiv);
    }
    
    msg.appendChild(avatar);
    msg.appendChild(bubble);
    chatArea.appendChild(msg);
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Copy text
function copyText(text) {
    const cleanText = text.replace(/==FILE: .+==[\s\S]*?==END==/g, '').trim();
    navigator.clipboard.writeText(cleanText).then(() => {
        showToast('✓ نُسخ', 'success');
    }).catch(() => {
        showToast('✗ فشل', 'error');
    });
}

// Parse code files
function parseCodeFiles(text) {
    const regex = /==FILE:\s*(.+?)==\n([\s\S]*?)==END==/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            const preText = text.substring(lastIndex, match.index).trim();
            if (preText) parts.push({ type: 'text', content: preText });
        }
        parts.push({ type: 'file', name: match[1].trim(), content: match[2].trim() });
        lastIndex = regex.lastIndex;
    }
    
    if (lastIndex < text.length) {
        const remaining = text.substring(lastIndex).trim();
        if (remaining) parts.push({ type: 'text', content: remaining });
    }
    
    if (parts.length === 0) parts.push({ type: 'text', content: text });
    return parts;
}

function renderMessageWithFiles(bubble, parts) {
    const files = [];
    
    parts.forEach(part => {
        if (part.type === 'text') {
            const textDiv = document.createElement('div');
            textDiv.className = 'bubble-text';
            textDiv.innerHTML = formatText(part.content);
            bubble.appendChild(textDiv);
        } else if (part.type === 'file') {
            files.push({ name: part.name, content: part.content });
            
            const fileDiv = document.createElement('div');
            fileDiv.className = 'code-file';
            
            const header = document.createElement('div');
            header.className = 'code-file-header';
            
            const name = document.createElement('span');
            name.className = 'code-file-name';
            name.textContent = '📄 ' + part.name;
            
            const actions = document.createElement('div');
            actions.className = 'code-file-actions';
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'code-action-btn';
            copyBtn.textContent = '📋 نسخ';
            copyBtn.onclick = () => copyCode(copyBtn, part.content);
            
            const dlBtn = document.createElement('button');
            dlBtn.className = 'code-action-btn';
            dlBtn.textContent = '💾 تحميل';
            dlBtn.onclick = () => downloadFile(part.name, part.content);
            
            actions.appendChild(copyBtn);
            actions.appendChild(dlBtn);
            header.appendChild(name);
            header.appendChild(actions);
            
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.textContent = part.content;
            pre.appendChild(code);
            
            fileDiv.appendChild(header);
            fileDiv.appendChild(pre);
            bubble.appendChild(fileDiv);
        }
    });
    
    if (files.length > 1) {
        const zipBtn = document.createElement('button');
        zipBtn.className = 'zip-download';
        zipBtn.innerHTML = `<span>📦</span><span>تحميل المشروع كاملاً (${files.length} ملف)</span>`;
        zipBtn.onclick = () => downloadZip(zipBtn, files);
        bubble.appendChild(zipBtn);
        
        const info = document.createElement('div');
        info.className = 'zip-info';
        info.textContent = `💎 ${files.length} ملفات جاهزة للتحميل`;
        bubble.appendChild(info);
    }
}

function copyCode(btn, content) {
    navigator.clipboard.writeText(content).then(() => {
        const orig = btn.textContent;
        btn.textContent = '✓ نُسخ';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = orig;
            btn.classList.remove('copied');
        }, 1500);
    });
}

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`💾 ${filename}`, 'success');
}

async function downloadZip(btn, files) {
    const orig = btn.innerHTML;
    btn.innerHTML = '<span>⏳</span><span>جاري الإنشاء...</span>';
    btn.classList.add('downloading');
    btn.disabled = true;
    
    try {
        const zip = new JSZip();
        files.forEach(f => zip.file(f.name, f.content));
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'CHKEIR_ROBOT_Project.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        btn.innerHTML = '<span>✓</span><span>تم التحميل!</span>';
        showToast('📦 تم تحميل ZIP', 'success');
        
        setTimeout(() => {
            btn.innerHTML = orig;
            btn.classList.remove('downloading');
            btn.disabled = false;
        }, 2500);
    } catch (err) {
        btn.innerHTML = '<span>✗</span><span>فشل</span>';
        showToast('فشل التحميل', 'error');
        setTimeout(() => {
            btn.innerHTML = orig;
            btn.classList.remove('downloading');
            btn.disabled = false;
        }, 2000);
    }
}

function formatText(text) {
    if (!text) return '';
    let result = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
    return result;
}

// Typing indicator
function showTyping() {
    const msg = document.createElement('div');
    msg.className = 'message bot';
    msg.id = 'typing';
    msg.innerHTML = `
        <div class="avatar">🤖</div>
        <div class="bubble">
            <div class="bubble-name">CHKEIR ROBOT</div>
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        </div>`;
    chatArea.appendChild(msg);
    chatArea.scrollTop = chatArea.scrollHeight;
}

function hideTyping() {
    const t = document.getElementById('typing');
    if (t) t.remove();
}

function setStatus(state, text) {
    statusDot.className = `status-dot ${state}`;
    statusText.textContent = text;
}

// Detect language
function detectLanguage(text) {
    const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
    const totalChars = text.replace(/\s/g, '').length;
    if (totalChars === 0) return 'auto';
    
    const arabicRatio = arabicChars / totalChars;
    if (arabicRatio > 0.3) return 'arabic';
    
    const arabiziPatterns = /\b(kifak|kifik|shu|sho|3am|7akili|yalla|khalas|hala2|hek|2eh|la2|habibi|ana|inta|inti|nahna|btehki|3ende|fina|fini|3atik|7eki|esmak|esmek|salam|marhaba|ahla|ahlan)\b/i;
    if (arabiziPatterns.test(text) && /[a-z]/i.test(text)) return 'arabizi';
    if (/[a-z]/i.test(text)) return 'english';
    return 'auto';
}

function updateLangBadge(lang) {
    currentLanguage = lang;
    langBadge.className = 'lang-badge';
    if (lang === 'arabic') {
        langBadge.textContent = '🇱🇧 عربي';
        langBadge.classList.add('arabic');
    } else if (lang === 'arabizi') {
        langBadge.textContent = '⚡ Arabizi';
        langBadge.classList.add('arabizi');
    } else if (lang === 'english') {
        langBadge.textContent = '🇬🇧 English';
        langBadge.classList.add('english');
    } else {
        langBadge.textContent = '🌐 AUTO';
    }
}

// Send message
async function sendMessage(text, imageData = null) {
    if (!text.trim() && !imageData) return;
    
    const userMsg = text;
    messageInput.value = '';
    
    const lang = detectLanguage(text);
    updateLangBadge(lang);
    
    addMessage('user', userMsg, imageData);
    
    if (!imageData) {
        conversationHistory.push({ role: 'user', content: userMsg });
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }
    }
    
    setStatus('thinking', 'يفكر...');
    showTyping();
    
    try {
        let response, data;
        
        if (imageData) {
            response = await fetch(VISION_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: imageData,
                    text: userMsg || 'حلّل هذه الصورة',
                    userName: userName,
                    userLang: lang
                })
            });
        } else {
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: conversationHistory,
                    userName: userName,
                    userLang: lang
                })
            });
        }
        
        data = await response.json();
        hideTyping();
        
        if (data.reply) {
            addMessage('bot', data.reply);
            
            if (!imageData) {
                conversationHistory.push({ role: 'assistant', content: data.reply });
            }
            
            if (voiceEnabled) speak(data.reply);
            setStatus('', 'جاهز');
        } else {
            const errorMsg = lang === 'english'
                ? `Sorry ${userName}, please try again.`
                : `عذراً ${nameToArabic(userName)}، تفضل بالمحاولة مرة أخرى.`;
            addMessage('bot', errorMsg);
            setStatus('', 'جاهز');
        }
    } catch (error) {
        hideTyping();
        const errorMsg = lang === 'english'
            ? `Sorry ${userName}, connection issue. Please try again.`
            : `عذراً ${nameToArabic(userName)}، مشكلة في الاتصال. تفضل بالمحاولة.`;
        addMessage('bot', errorMsg);
        setStatus('', 'جاهز');
    }
}

// Speak (TTS)
function speak(text) {
    if (!voiceEnabled || !window.speechSynthesis) return;
    
    let cleanText = text
        .replace(/==FILE: .+==[\s\S]*?==END==/g, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*/g, '')
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .trim();
    
    if (!cleanText) return;
    if (cleanText.length > 250) cleanText = cleanText.substring(0, 250) + '...';
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const isArabic = /[\u0600-\u06FF]/.test(cleanText);
    
    utterance.lang = isArabic ? 'ar-SA' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    
    if (isArabic && arabicVoice) utterance.voice = arabicVoice;
    else if (!isArabic && englishVoice) utterance.voice = englishVoice;
    
    window.speechSynthesis.speak(utterance);
}

// Voice recognition
function setupRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        micBtn.style.display = 'none';
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'ar-SA';
    
    recognition.onstart = () => {
        isRecording = true;
        micBtn.classList.add('recording');
        setStatus('thinking', 'استمع...');
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        messageInput.value = transcript;
        setTimeout(() => sendMessage(transcript), 300);
    };
    
    recognition.onerror = () => {
        isRecording = false;
        micBtn.classList.remove('recording');
        setStatus('', 'جاهز');
    };
    
    recognition.onend = () => {
        isRecording = false;
        micBtn.classList.remove('recording');
        setStatus('', 'جاهز');
    };
}

micBtn.addEventListener('click', () => {
    if (!recognition) {
        showToast('المتصفح ما يدعم الصوت', 'error');
        return;
    }
    if (isRecording) {
        recognition.stop();
    } else {
        try {
            const text = messageInput.value.trim();
            recognition.lang = /[\u0600-\u06FF]/.test(text) ? 'ar-SA' : 'en-US';
            recognition.start();
        } catch (e) {}
    }
});

// Image upload
imgBtn.addEventListener('click', () => imageInput.click());

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 4 * 1024 * 1024) {
        showToast('الصورة كبيرة جداً (max 4MB)', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
        selectedImage = event.target.result;
        previewImg.src = selectedImage;
        imagePreview.style.display = 'flex';
    };
    reader.readAsDataURL(file);
});

removeImg.addEventListener('click', () => {
    selectedImage = null;
    imagePreview.style.display = 'none';
    imageInput.value = '';
});

// Send button
sendBtn.addEventListener('click', () => {
    const text = messageInput.value.trim();
    if (text || selectedImage) {
        const img = selectedImage;
        sendMessage(text, img);
        if (selectedImage) {
            selectedImage = null;
            imagePreview.style.display = 'none';
            imageInput.value = '';
        }
    }
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
    }
});

// Quick actions
document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const prompt = btn.dataset.prompt;
        sendMessage(prompt);
    });
});

// Voice toggle
voiceToggle.addEventListener('click', () => {
    voiceEnabled = !voiceEnabled;
    localStorage.setItem('voice_enabled', voiceEnabled);
    voiceToggle.classList.toggle('active', voiceEnabled);
    voiceIcon.textContent = voiceEnabled ? '🔊' : '🔇';
    if (!voiceEnabled) window.speechSynthesis.cancel();
    showToast(voiceEnabled ? '🔊 الصوت مفعّل' : '🔇 الصوت مغلق');
});

// Quick toggle
quickToggle.addEventListener('click', () => {
    quickActionsVisible = !quickActionsVisible;
    localStorage.setItem('quick_visible', quickActionsVisible);
    quickActions.classList.toggle('hidden', !quickActionsVisible);
    quickToggle.classList.toggle('active', quickActionsVisible);
});

// Clear
clearBtn.addEventListener('click', () => {
    if (confirm('مسح المحادثة؟ / Clear chat?')) {
        chatArea.innerHTML = '';
        conversationHistory = [];
        const displayName = nameToArabic(userName);
        addMessage('bot', `أهلاً وسهلاً ${displayName}! كيف يمكنني خدمتك؟`);
        showToast('🗑️ تم المسح');
    }
});

// Change name
changeNameBtn.addEventListener('click', () => {
    const newName = prompt('اسم جديد / New name:', userName);
    if (newName && newName.trim().length >= 2) {
        userName = newName.trim();
        localStorage.setItem('chkeir_username', userName);
        userGreeting.textContent = nameToArabic(userName);
        showToast('✓ تم تغيير الاسم', 'success');
    }
});

// Share
shareBtn.addEventListener('click', async () => {
    const shareData = {
        title: 'CHKEIR ROBOT 🤖',
        text: 'جرّب CHKEIR ROBOT - مساعد ذكي صنعه مهدي شقير',
        url: window.location.href
    };
    
    try {
        if (navigator.share) {
            await navigator.share(shareData);
            showToast('✓ تم المشاركة', 'success');
        } else {
            await navigator.clipboard.writeText(window.location.href);
            showToast('📋 الرابط منسوخ', 'success');
        }
    } catch (err) {
        if (err.name !== 'AbortError') {
            navigator.clipboard.writeText(window.location.href).then(() => {
                showToast('📋 الرابط منسوخ', 'success');
            });
        }
    }
});

// PWA Install
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'flex';
});

installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
        installBtn.style.display = 'none';
        showToast('✓ تم التثبيت', 'success');
    }
    deferredPrompt = null;
});

// Load voices
if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
}

// Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
}

// ═══════════════════════════════════
// Menu Modal (About, How to Use, Feedback, Contact)
// ═══════════════════════════════════

const menuBtn = document.getElementById('menuBtn');
const menuModal = document.getElementById('menuModal');
const modalClose = document.getElementById('modalClose');
const modalTabs = document.querySelectorAll('.modal-tab');
const modalContents = document.querySelectorAll('.modal-content');

if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        menuModal.style.display = 'flex';
    });
}

if (modalClose) {
    modalClose.addEventListener('click', () => {
        menuModal.style.display = 'none';
    });
}

if (menuModal) {
    menuModal.addEventListener('click', (e) => {
        if (e.target === menuModal) {
            menuModal.style.display = 'none';
        }
    });
}

// Tab switching
modalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        modalTabs.forEach(t => t.classList.remove('active'));
        modalContents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.querySelector(`[data-content="${target}"]`).classList.add('active');
    });
});

// Rating stars
const stars = document.querySelectorAll('.star');
const ratingText = document.getElementById('ratingText');
let currentRating = 0;

const ratingTexts = {
    1: 'سيء جداً 😞',
    2: 'سيء 😐',
    3: 'متوسط 🙂',
    4: 'جيد 😊',
    5: 'ممتاز! 🤩'
};

stars.forEach(star => {
    star.addEventListener('click', () => {
        currentRating = parseInt(star.dataset.rating);
        stars.forEach((s, i) => {
            s.classList.toggle('active', i < currentRating);
        });
        if (ratingText) ratingText.textContent = ratingTexts[currentRating];
    });
    
    star.addEventListener('mouseenter', () => {
        const hover = parseInt(star.dataset.rating);
        stars.forEach((s, i) => {
            s.classList.toggle('active', i < hover);
        });
    });
});

const starsContainer = document.querySelector('.stars');
if (starsContainer) {
    starsContainer.addEventListener('mouseleave', () => {
        stars.forEach((s, i) => {
            s.classList.toggle('active', i < currentRating);
        });
    });
}

// Send feedback
const sendFeedbackBtn = document.getElementById('sendFeedbackBtn');
const feedbackText = document.getElementById('feedbackText');

if (sendFeedbackBtn) {
    sendFeedbackBtn.addEventListener('click', () => {
        if (currentRating === 0) {
            showToast('اختر تقييماً أولاً ⭐', 'error');
            return;
        }
        
        const feedback = feedbackText.value.trim();
        const userN = nameToArabic(userName);
        
        const message = `📝 اقتراح من ${userN}:\n\n⭐ التقييم: ${currentRating}/5\n💬 الرسالة: ${feedback || '(لا توجد ملاحظة)'}\n\nمن CHKEIR ROBOT 🤖`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(message).then(() => {
            showToast('✓ تم نسخ الرسالة - أرسلها للصانع', 'success');
            
            setTimeout(() => {
                // Reset
                currentRating = 0;
                stars.forEach(s => s.classList.remove('active'));
                if (ratingText) ratingText.textContent = 'اضغط على نجمة';
                feedbackText.value = '';
                menuModal.style.display = 'none';
            }, 2000);
        }).catch(() => {
            showToast('فشل النسخ', 'error');
        });
    });
}

// Contact actions
document.querySelectorAll('.contact-card').forEach(card => {
    card.addEventListener('click', () => {
        const action = card.dataset.action;
        const url = window.location.href;
        const text = 'جرّب CHKEIR ROBOT - مساعد ذكي صنعه مهدي شقير 🤖';
        
        switch (action) {
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}`, '_blank');
                break;
            case 'share':
                if (navigator.share) {
                    navigator.share({ title: 'CHKEIR ROBOT', text, url });
                } else {
                    navigator.clipboard.writeText(url);
                    showToast('📋 الرابط منسوخ', 'success');
                }
                break;
            case 'copy':
                navigator.clipboard.writeText(url);
                showToast('📋 الرابط منسوخ', 'success');
                break;
            case 'install':
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                } else {
                    showToast('💡 من المتصفح: ⋮ → "تثبيت التطبيق"', 'success');
                }
                break;
        }
    });
});

// Share buttons
document.querySelectorAll('.share-btn-modal').forEach(btn => {
    btn.addEventListener('click', () => {
        const platform = btn.dataset.platform;
        const url = window.location.href;
        const text = 'جرّب CHKEIR ROBOT - مساعد ذكي مجاني صنعه مهدي شقير 🤖';
        
        let shareUrl = '';
        switch (platform) {
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                break;
        }
        
        if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400');
    });
});

console.log('🤖 CHKEIR ROBOT v6 ready');
