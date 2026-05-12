// ═══════════════════════════════════════════════
// 🤖 CHKEIR ROBOT - v3 (Enhanced Arabic Support)
// Created by Mahdi Chkeir 🇱🇧
// ═══════════════════════════════════════════════

const splashScreen = document.getElementById('splashScreen');
const welcomeScreen = document.getElementById('welcomeScreen');
const userNameInput = document.getElementById('userNameInput');
const enterBtn = document.getElementById('enterBtn');
const mainApp = document.getElementById('mainApp');
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
const installBtn = document.getElementById('installBtn');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const langBadge = document.getElementById('langBadge');
const toast = document.getElementById('toast');

let userName = '';
let userNameArabic = ''; // Arabic version for TTS
let conversationHistory = [];
let isProcessing = false;
let voiceEnabled = true;
let recognition = null;
let isRecording = false;
let synthesis = window.speechSynthesis;
let voices = [];
let currentLang = 'auto';
let pendingImage = null;
let codeFilesCounter = 0;
let allCodeFiles = {};

let requestCooldown = false;


// ═══ Convert name to Arabic for TTS ═══
// Common Arabizi → Arabic mappings
function nameToArabic(name) {
    if (!name) return '';
    
    // If already Arabic, return as is
    if (/[\u0600-\u06FF]/.test(name)) return name;
    
    const lower = name.toLowerCase().trim();
    
    // Common Lebanese/Arabic names
    const nameMap = {
        'mahdi': 'مَهْدي',
        'mehdi': 'مَهْدي',
        'mahdy': 'مَهْدي',
        'ahmad': 'أَحْمَد',
        'ahmed': 'أَحْمَد',
        'mohamad': 'مُحَمَّد',
        'mohammed': 'مُحَمَّد',
        'mohammad': 'مُحَمَّد',
        'mohamed': 'مُحَمَّد',
        'ali': 'عَلي',
        'hussein': 'حُسَين',
        'hassan': 'حَسَن',
        'omar': 'عُمَر',
        'khaled': 'خالِد',
        'karim': 'كَريم',
        'sami': 'سامي',
        'samir': 'سَمير',
        'tarek': 'طارِق',
        'rami': 'رامي',
        'nadia': 'ناديا',
        'sara': 'سارا',
        'sarah': 'سارا',
        'leila': 'لَيْلى',
        'layla': 'لَيْلى',
        'maya': 'مايا',
        'rana': 'رانا',
        'lara': 'لارا',
        'nour': 'نور',
        'noor': 'نور',
        'yasmin': 'ياسمين',
        'fatima': 'فاطِما',
        'fatma': 'فاطِما',
        'zeinab': 'زَيْنَب',
        'zeina': 'زينا',
        'reem': 'ريم',
        'lina': 'لينا',
        'dana': 'دانا',
        'tala': 'تالا'
    };
    
    if (nameMap[lower]) return nameMap[lower];
    
    // Try to phonetically convert
    return phoneticArabic(lower);
}

function phoneticArabic(name) {
    // Basic phonetic mapping for unknown names
    const map = {
        'sh': 'ش', 'ch': 'ش', 'th': 'ث', 'ph': 'ف', 'kh': 'خ', 'gh': 'غ',
        'a': 'ا', 'b': 'ب', 'c': 'ك', 'd': 'د', 'e': 'ي', 'f': 'ف',
        'g': 'ج', 'h': 'ه', 'i': 'ي', 'j': 'ج', 'k': 'ك', 'l': 'ل',
        'm': 'م', 'n': 'ن', 'o': 'و', 'p': 'ب', 'q': 'ق', 'r': 'ر',
        's': 'س', 't': 'ت', 'u': 'و', 'v': 'ف', 'w': 'و', 'x': 'كس',
        'y': 'ي', 'z': 'ز'
    };
    
    let result = '';
    let i = 0;
    while (i < name.length) {
        const two = name.substring(i, i + 2);
        if (map[two]) {
            result += map[two];
            i += 2;
        } else {
            const one = name[i];
            result += map[one] || one;
            i++;
        }
    }
    return result;
}

// ═══ Toast ═══
function showToast(message, type = 'normal', duration = 3000) {
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    setTimeout(() => toast.classList.remove('show'), duration);
}

// ═══ Splash ═══
function hideSplash() {
    setTimeout(() => {
        splashScreen.classList.add('hide');
        setTimeout(() => { splashScreen.style.display = 'none'; }, 600);
    }, 2200);
}

// ═══ Particles ═══
function createParticles() {
    const bg = document.getElementById('starsBg');
    setInterval(() => {
        if (document.querySelectorAll('.particle').length > 8) return;
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (15 + Math.random() * 15) + 's';
        bg.appendChild(p);
        setTimeout(() => p.remove(), 30000);
    }, 3000);
}

// ═══ Language Detection ═══
function detectLanguage(text) {
    if (!text) return 'auto';
    const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
    const totalChars = text.replace(/\s/g, '').length;
    if (totalChars === 0) return 'auto';
    
    const arabicRatio = arabicChars / totalChars;
    if (arabicRatio > 0.3) return 'ar';
    
    const arabiziPatterns = [
        /\b(kifak|kifik|kifkon|shu|sho|3am|3al|7akili|7eki|7elo|7abibi|3atik|3afye)\b/i,
        /\b(yalla|khalas|tamem|hala2|hek|heik|2eh|la2|akhbarak|akhbarik)\b/i,
        /\b(habibi|habibti|sade2|albi|3ammi|amto)\b/i,
        /\b(ana|inta|inti|nahna|huwe|hiye|btehki|3ende|fina|fini)\b/i,
        /\d+[a-z]/i
    ];
    
    let arabiziScore = 0;
    for (const pattern of arabiziPatterns) {
        if (pattern.test(text)) arabiziScore++;
    }
    
    if (arabiziScore >= 1 && /[a-z]/i.test(text)) return 'arabizi';
    return 'en';
}

function updateLangBadge(lang) {
    langBadge.classList.remove('arabic', 'english', 'arabizi');
    if (lang === 'ar') {
        langBadge.textContent = '🇱🇧 عربي';
        langBadge.classList.add('arabic');
    } else if (lang === 'en') {
        langBadge.textContent = '🇬🇧 EN';
        langBadge.classList.add('english');
    } else if (lang === 'arabizi') {
        langBadge.textContent = '📝 Arabizi';
        langBadge.classList.add('arabizi');
    } else {
        langBadge.textContent = '🌐 AUTO';
    }
}

function updateStatus(text, type = 'normal') {
    statusText.textContent = text;
    statusDot.className = 'status-dot';
    if (type === 'thinking') statusDot.classList.add('thinking');
    if (type === 'error') statusDot.classList.add('error');
}

// ═══ User Name ═══
function getUserName() { return localStorage.getItem('chkeir_username') || ''; }
function saveUserName(name) { localStorage.setItem('chkeir_username', name); }

function showWelcomeScreen() {
    welcomeScreen.style.display = 'flex';
    mainApp.style.display = 'none';
    setTimeout(() => userNameInput.focus(), 100);
}

function showMainApp() {
    welcomeScreen.style.display = 'none';
    mainApp.style.display = 'flex';
    userGreeting.textContent = userName;
    userNameArabic = nameToArabic(userName);
    
    if (chatArea.children.length === 0) {
        const welcomeMsg = `أهلاً ${userName}! Hi ${userName}!

أنا CHKEIR ROBOT، مساعدك الذكي.

بقدر ساعدك بـ:
• محادثة بالعربي / English / Arabizi
• قراءة الصور والـscreenshots
• بناء مشاريع كاملة (مع تحميل ZIP)
• الدراسة والمسائل
• محادثة صوتية
• ترجمة

سؤال؟ اسألني!`;
        addBotMessage(welcomeMsg);
        if (voiceEnabled) {
            // Use Arabic name for Arabic greeting
            speak(`أهلاً ${userNameArabic || userName}، كيف فيني ساعدك اليوم؟`, 'ar');
        }
    }
}

function handleEnterBtn() {
    const name = userNameInput.value.trim();
    if (!name || name.length < 2) {
        userNameInput.style.borderColor = '#f87171';
        setTimeout(() => userNameInput.style.borderColor = '', 1500);
        return;
    }
    userName = name;
    userNameArabic = nameToArabic(name);
    saveUserName(name);
    showMainApp();
}

function changeUserName() {
    if (confirm('Change your name? / بدك تغيّر اسمك؟')) {
        clearAll();
        showWelcomeScreen();
    }
}

// ═══ Speech Recognition ═══
function setupSpeechRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { micBtn.style.display = 'none'; return null; }
    
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'ar-LB';
    
    rec.onstart = () => {
        isRecording = true;
        micBtn.classList.add('recording');
        updateStatus('Listening...', 'thinking');
    };
    
    rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        messageInput.value = text;
        sendMessage();
    };
    
    rec.onerror = (event) => {
        if (event.error === 'not-allowed') {
            showToast('Mic permission needed', 'error');
        }
        stopRecording();
    };
    
    rec.onend = () => stopRecording();
    return rec;
}

function stopRecording() {
    isRecording = false;
    micBtn.classList.remove('recording');
    updateStatus('Ready');
}

// ═══ TTS ═══
function loadVoices() {
    return new Promise((resolve) => {
        let v = synthesis.getVoices();
        if (v.length > 0) { resolve(v); return; }
        synthesis.onvoiceschanged = () => resolve(synthesis.getVoices());
        setTimeout(() => resolve(synthesis.getVoices()), 1000);
    });
}

async function initVoices() {
    voices = await loadVoices();
    console.log('Available voices:', voices.length);
    const arabicVoices = voices.filter(v => v.lang.startsWith('ar'));
    console.log('Arabic voices:', arabicVoices.map(v => v.lang + ' - ' + v.name));
}

function getBestArabicVoice() {
    if (!voices || voices.length === 0) return null;
    
    // Try Lebanese first
    let voice = voices.find(v => v.lang === 'ar-LB');
    if (voice) return voice;
    
    // Then Saudi
    voice = voices.find(v => v.lang === 'ar-SA');
    if (voice) return voice;
    
    // Then Egyptian
    voice = voices.find(v => v.lang === 'ar-EG');
    if (voice) return voice;
    
    // Any Arabic
    voice = voices.find(v => v.lang.startsWith('ar'));
    if (voice) return voice;
    
    // Try Google Arabic
    voice = voices.find(v => v.name.toLowerCase().includes('arabic'));
    return voice || null;
}

function getBestEnglishVoice() {
    if (!voices || voices.length === 0) return null;
    return voices.find(v => v.lang === 'en-US') ||
           voices.find(v => v.lang.startsWith('en')) ||
           null;
}

// Replace English name with Arabic version in text for better TTS
function prepareArabicTTS(text) {
    if (!text || !userName) return text;
    
    // Replace English name with Arabic version
    if (userNameArabic && userName !== userNameArabic) {
        const regex = new RegExp(`\\b${userName}\\b`, 'gi');
        text = text.replace(regex, userNameArabic);
    }
    
    return text;
}

function speak(text, lang = 'auto') {
    if (!voiceEnabled || !text) return;
    synthesis.cancel();
    
    if (lang === 'auto') lang = detectLanguage(text);
    
    // Remove code blocks and file markers
    let cleanText = text
        .replace(/==FILE:[\s\S]*?==END==/g, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]*`/g, '')
        .trim();
    
    if (!cleanText) return;
    
    // For Arabic: replace English name with Arabic version
    if (lang === 'ar') {
        cleanText = prepareArabicTTS(cleanText);
    }
    
    const utterance = new SpeechSynthesisUtterance(cleanText.substring(0, 500));
    
    if (lang === 'ar' || lang === 'arabizi') {
        utterance.lang = 'ar-LB';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        const voice = getBestArabicVoice();
        if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang;
        }
    } else {
        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        const voice = getBestEnglishVoice();
        if (voice) utterance.voice = voice;
    }
    
    utterance.volume = 1.0;
    
    utterance.onstart = () => updateStatus('Speaking...', 'thinking');
    utterance.onend = () => updateStatus('Ready');
    utterance.onerror = (e) => {
        console.log('TTS error:', e);
        updateStatus('Ready');
    };
    
    synthesis.speak(utterance);
}

// ═══ Helpers ═══
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function parseCodeFiles(text) {
    const files = [];
    const regex = /==FILE:\s*([^=]+?)==\s*([\s\S]*?)\s*==END==/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
        const fileName = match[1].trim();
        let content = match[2].trim();
        content = content.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
        files.push({ name: fileName, content: content });
    }
    
    return files;
}

function formatBotMessage(text) {
    const files = parseCodeFiles(text);
    
    if (files.length === 0) {
        let formatted = escapeHtml(text);
        formatted = formatted.replace(/```(\w+)?\n?([\s\S]*?)```/g, (m, lang, code) => {
            return `<pre><code>${code.trim()}</code></pre>`;
        });
        formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
        return { html: formatted, files: [] };
    }
    
    const parts = text.split(/(==FILE:\s*[^=]+?==\s*[\s\S]*?\s*==END==)/g);
    let resultHtml = '';
    let fileIndex = 0;
    
    for (const part of parts) {
        if (part.match(/==FILE:/)) {
            resultHtml += `<!--FILE_${fileIndex}-->`;
            fileIndex++;
        } else if (part.trim()) {
            let formatted = escapeHtml(part.trim());
            formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
            resultHtml += `<div>${formatted}</div>`;
        }
    }
    
    return { html: resultHtml, files };
}

// ═══ Add Messages ═══
function addUserMessage(text, imageUrl = null) {
    const lang = detectLanguage(text);
    const isArabic = lang === 'ar';
    
    const div = document.createElement('div');
    div.className = 'message user';
    
    let imgHtml = imageUrl ? `<img src="${imageUrl}" class="bubble-image" alt="Uploaded">` : '';
    
    div.innerHTML = `
        <div class="avatar"></div>
        <div class="bubble" dir="${isArabic ? 'rtl' : 'ltr'}">
            <div class="bubble-name">${escapeHtml(userName)}</div>
            ${imgHtml}
            <div class="bubble-text">${escapeHtml(text)}</div>
        </div>
    `;
    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight;
}

function addBotMessage(text, isError = false) {
    const lang = detectLanguage(text);
    const isArabic = lang === 'ar';
    const messageId = 'msg_' + Date.now() + '_' + (++codeFilesCounter);
    
    const { html, files } = formatBotMessage(text);
    
    const div = document.createElement('div');
    div.className = 'message bot' + (isError ? ' error' : '');
    div.id = messageId;
    
    div.innerHTML = `
        <div class="avatar">🤖</div>
        <div class="bubble" dir="${isArabic ? 'rtl' : 'ltr'}">
            <div class="bubble-name">CHKEIR ROBOT</div>
            <div class="bubble-text">${html}</div>
        </div>
    `;
    
    chatArea.appendChild(div);
    
    if (files.length > 0) {
        allCodeFiles[messageId] = {};
        files.forEach((file, idx) => {
            allCodeFiles[messageId][file.name] = file.content;
        });
        
        const bubbleText = div.querySelector('.bubble-text');
        let newHtml = bubbleText.innerHTML;
        
        files.forEach((file, idx) => {
            const fileBlockHtml = createFileBlockHtml(file.name, file.content, messageId, idx);
            newHtml = newHtml.replace(`<!--FILE_${idx}-->`, fileBlockHtml);
        });
        
        bubbleText.innerHTML = newHtml;
        
        if (files.length > 1) {
            const zipBtnHtml = `
                <button class="zip-download" onclick="downloadAllAsZip('${messageId}')">
                    📦 Download All as ZIP (${files.length} files)
                </button>
                <div class="zip-info">${isArabic ? 'حمّل كل الملفات بـZIP واحد' : 'Download all files in one ZIP'}</div>
            `;
            bubbleText.innerHTML += zipBtnHtml;
        }
        
        attachCodeButtonListeners(div);
    }
    
    chatArea.scrollTop = chatArea.scrollHeight;
}

function createFileBlockHtml(fileName, content, messageId, idx) {
    const safeContent = escapeHtml(content);
    return `
        <div class="code-file">
            <div class="code-file-header">
                <div class="code-file-name">📄 ${escapeHtml(fileName)}</div>
                <div class="code-file-actions">
                    <button class="code-action-btn copy-btn" data-msgid="${messageId}" data-fname="${escapeHtml(fileName)}">
                        📋 Copy
                    </button>
                    <button class="code-action-btn download-btn" data-msgid="${messageId}" data-fname="${escapeHtml(fileName)}">
                        💾 Download
                    </button>
                </div>
            </div>
            <pre><code>${safeContent}</code></pre>
        </div>
    `;
}

function attachCodeButtonListeners(messageDiv) {
    messageDiv.querySelectorAll('.copy-btn').forEach(btn => {
        btn.onclick = () => {
            const msgId = btn.dataset.msgid;
            const fname = btn.dataset.fname;
            const content = allCodeFiles[msgId]?.[fname];
            if (content) {
                navigator.clipboard.writeText(content).then(() => {
                    btn.classList.add('copied');
                    btn.innerHTML = '✅ Copied!';
                    setTimeout(() => {
                        btn.classList.remove('copied');
                        btn.innerHTML = '📋 Copy';
                    }, 2000);
                    showToast('Code copied!', 'success');
                });
            }
        };
    });
    
    messageDiv.querySelectorAll('.download-btn').forEach(btn => {
        btn.onclick = () => {
            const msgId = btn.dataset.msgid;
            const fname = btn.dataset.fname;
            const content = allCodeFiles[msgId]?.[fname];
            if (content) {
                downloadFile(fname, content);
                showToast(`Downloaded ${fname}`, 'success');
            }
        };
    });
}

function downloadFile(fileName, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

window.downloadAllAsZip = async function(messageId) {
    const files = allCodeFiles[messageId];
    if (!files || Object.keys(files).length === 0) return;
    
    const button = event.target;
    button.classList.add('downloading');
    button.textContent = '⏳ Creating ZIP...';
    
    try {
        const zip = new JSZip();
        for (const [fname, content] of Object.entries(files)) {
            zip.file(fname, content);
        }
        
        const blob = await zip.generateAsync({ 
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });
        
        const projectName = 'chkeir-project-' + Date.now();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        button.classList.remove('downloading');
        button.textContent = `📦 Download All as ZIP (${Object.keys(files).length} files)`;
        showToast('ZIP downloaded!', 'success');
    } catch (e) {
        console.error('ZIP error:', e);
        button.classList.remove('downloading');
        button.textContent = '❌ Failed - try again';
        showToast('ZIP failed', 'error');
    }
};

function showTyping() {
    const div = document.createElement('div');
    div.className = 'message bot';
    div.id = 'typingMessage';
    div.innerHTML = `
        <div class="avatar">🤖</div>
        <div class="bubble">
            <div class="bubble-name">CHKEIR ROBOT</div>
            <div class="typing-indicator"><span></span><span></span><span></span></div>
        </div>
    `;
    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight;
}

function hideTyping() {
    const t = document.getElementById('typingMessage');
    if (t) t.remove();
}

// ═══ Image Handling ═══
imgBtn.addEventListener('click', () => imageInput.click());

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image too large (max 5MB)', 'error');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        pendingImage = e.target.result;
        previewImg.src = pendingImage;
        imagePreview.style.display = 'flex';
    };
    reader.readAsDataURL(file);
});

removeImg.addEventListener('click', () => {
    pendingImage = null;
    imagePreview.style.display = 'none';
    imageInput.value = '';
});

// ═══ Send Message ═══
async function sendMessage() {
    const text = messageInput.value.trim();
    if ((!text && !pendingImage) || isProcessing) return;
    
    isProcessing = true;
    
    const detectedLang = detectLanguage(text || 'image');
    currentLang = detectedLang;
    updateLangBadge(detectedLang);
    
    addUserMessage(text || '📷 [Image]', pendingImage);
    messageInput.value = '';
    
    showTyping();
    updateStatus('Thinking...', 'thinking');
    
    try {
        const endpoint = pendingImage ? '/api/vision' : '/api/chat';
        const body = pendingImage ? {
            image: pendingImage,
            text: text || 'What do you see in this image? Please analyze it.',
            userName: userName,
            userLang: detectedLang
        } : {
            messages: [...conversationHistory.slice(-10), { role: 'user', content: text }],
            userName: userName,
            userLang: detectedLang
        };
        
        if (text && !pendingImage) {
            conversationHistory.push({ role: 'user', content: text });
        }
        
        let response;

        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (response.ok) break;
            } catch (e) {
                console.log('Retry:', attempt + 1);
            }

            await new Promise(r => setTimeout(r, 1500));
        }
        
        hideTyping();
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        
        const reply = data.reply;
        const replyLang = detectLanguage(reply);
        
        addBotMessage(reply);
        
        if (!pendingImage) {
            conversationHistory.push({ role: 'assistant', content: reply });
            saveConversation();
        }
        
        // For Arabizi input, speak in Arabic
        let speakLang = replyLang;
        if (detectedLang === 'arabizi' && replyLang !== 'en') speakLang = 'ar';
        speak(reply, speakLang);
        updateStatus('Ready');
        
        if (pendingImage) {
            pendingImage = null;
            imagePreview.style.display = 'none';
            imageInput.value = '';
        }
        
    } catch (error) {
        hideTyping();
        console.error('Error:', error);
        const errorMsg = currentLang === 'ar' 
            ? 'آسف، صار في مشكلة. جرّب مرة ثانية.'
            : 'Sorry, something went wrong. Try again.';
        addBotMessage(errorMsg, true);
        updateStatus('Error', 'error');
    } finally {
        isProcessing = false;
    }
}

// ═══ Save/Load ═══
function saveConversation() {
    try {
        localStorage.setItem('chkeir_history_' + userName, JSON.stringify(conversationHistory.slice(-20)));
    } catch (e) {}
}

function loadConversation() {
    try {
        const saved = localStorage.getItem('chkeir_history_' + userName);
        if (saved) {
            const history = JSON.parse(saved);
            const recent = history.slice(-6);
            chatArea.innerHTML = '';
            recent.forEach(msg => {
                if (msg.role === 'user') addUserMessage(msg.content);
                else addBotMessage(msg.content);
            });
            conversationHistory = history;
        }
    } catch (e) {}
}

function clearAll() {
    conversationHistory = [];
    chatArea.innerHTML = '';
    allCodeFiles = {};
    if (userName) localStorage.removeItem('chkeir_history_' + userName);
}

function clearConversation() {
    if (confirm('Clear all messages? / تمسح كل المحادثة؟')) {
        clearAll();
        const greeting = currentLang === 'en' 
            ? `Cleared! Start fresh, ${userName}.`
            : `تمام ${userName}، بدأنا من جديد!`;
        addBotMessage(greeting);
    }
}

function toggleVoice() {
    voiceEnabled = !voiceEnabled;
    voiceIcon.textContent = voiceEnabled ? '🔊' : '🔇';
    voiceToggle.classList.toggle('active', voiceEnabled);
    if (!voiceEnabled) synthesis.cancel();
}

function toggleQuick() {
    quickActions.classList.toggle('hidden');
    quickToggle.classList.toggle('active');
}

// ═══ Quick Actions - Send directly ═══
function setupQuickActions() {
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const prompt = btn.dataset.prompt;
            messageInput.value = prompt;
            sendMessage(); // Send directly instead of just filling input
        });
    });
}

// ═══ Events ═══
enterBtn.addEventListener('click', handleEnterBtn);
userNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleEnterBtn();
});

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

micBtn.addEventListener('click', () => {
    if (!recognition) {
        showToast('Voice not supported. Use Chrome.', 'error');
        return;
    }
    if (isRecording) recognition.stop();
    else { try { recognition.start(); } catch (e) {} }
});

voiceToggle.addEventListener('click', toggleVoice);
quickToggle.addEventListener('click', toggleQuick);
clearBtn.addEventListener('click', clearConversation);
changeNameBtn.addEventListener('click', changeUserName);

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'flex';
});

installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        installBtn.style.display = 'none';
        deferredPrompt = null;
    }
});

// ═══ Init ═══
async function init() {
    hideSplash();
    createParticles();
    setupQuickActions();
    
    setTimeout(async () => {
        recognition = setupSpeechRecognition();
        await initVoices();
        voiceToggle.classList.add('active');
        
        userName = getUserName();
        if (userName) {
            userNameArabic = nameToArabic(userName);
            showMainApp();
            loadConversation();
        } else {
            showWelcomeScreen();
        }
    }, 2200);
    
    console.log('✅ CHKEIR ROBOT v3 Ready');
}

init();
