// CHKEIR ROBOT v8 - MAXIMUM INTELLIGENCE
// DeepSeek V3 + Smart Prompts + Chain of Thought
// Fallback to Llama if DeepSeek fails

function nameToArabic(name) {
    if (!name) return 'صديقي';
    if (/[\u0600-\u06FF]/.test(name)) return name;
    
    const lower = name.toLowerCase().trim();
    const nameMap = {
        'mahdi': 'مهدي', 'mehdi': 'مهدي', 'mahdy': 'مهدي',
        'ahmad': 'أحمد', 'ahmed': 'أحمد',
        'mohamad': 'محمد', 'mohammed': 'محمد', 'mohammad': 'محمد', 'mohamed': 'محمد',
        'ali': 'علي', 'hussein': 'حسين', 'hassan': 'حسن', 'hasan': 'حسن',
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
        'mariam': 'مريم', 'maryam': 'مريم', 'sandy': 'ساندي'
    };
    
    return nameMap[lower] || name;
}

// Analyze question deeply for optimal parameters
function analyzeQuestion(text, history = []) {
    const lower = text.toLowerCase();
    const isLong = text.length > 100;
    
    // ROBOTICS - very smart mode
    if (/robot|روبوت|arduino|raspberry|esp32|sensor|servo|motor|circuit|دائرة|محرك|مستشعر|ros|gazebo|simulink|plc|automation|أتمتة/i.test(text)) {
        return { type: 'robotics', temp: 0.3, tokens: 5000, mode: 'expert' };
    }
    
    // ADVANCED PROGRAMMING
    if (/code|برمج|كود|javascript|python|html|css|react|api|function|دالة|متغير|class|algorithm|خوارزم|database|قاعدة بيانات|sql|nosql|backend|frontend|api|server|client|debug|error|exception|fix|حل|اصلح|optimize|performance/i.test(text)) {
        return { type: 'code', temp: 0.3, tokens: 5000, mode: 'expert' };
    }
    
    // MATH/SCIENCE
    if (/رياض|حساب|معادل|equation|math|calculate|\d+[\+\-\*\/]\d+|فيزياء|كيمياء|physics|chemistry|integral|derivative|تكامل|مشتقة/i.test(text)) {
        return { type: 'math', temp: 0.2, tokens: 3500, mode: 'precise' };
    }
    
    // ENGINEERING
    if (/engineer|هندس|electrical|mechanical|civil|كهرب|ميكانيك|مدني|design|تصميم|cad|autocad|solidworks/i.test(text)) {
        return { type: 'engineering', temp: 0.3, tokens: 4500, mode: 'expert' };
    }
    
    // RELIGIOUS - careful mode
    if (/إمام|إسلام|دين|صلاة|قرآن|حديث|فقه|شيع|سن|آية|سور|نهج البلاغة|دعاء|عاشوراء|كربلاء|نبي|رسول|الله|محمد/i.test(text)) {
        return { type: 'religious', temp: 0.4, tokens: 3500, mode: 'careful' };
    }
    
    // PROJECT MANAGEMENT
    if (/project|مشروع|plan|خطة|management|إدارة|task|مهمة|timeline|جدول|deadline|موعد|team|فريق/i.test(text)) {
        return { type: 'project', temp: 0.4, tokens: 4000, mode: 'structured' };
    }
    
    // CREATIVE WRITING
    if (/اكتب|قصة|شعر|مقال|خاطرة|رواية|article|story|poem|essay|creative|إبداع/i.test(text)) {
        return { type: 'creative', temp: 0.85, tokens: 4000, mode: 'creative' };
    }
    
    // EDUCATIONAL
    if (/اشرح|علم|فهم|درس|explain|teach|how|what|why|كيف|ماذا|لماذا|متى/i.test(text)) {
        return { type: 'educational', temp: 0.5, tokens: 3500, mode: 'detailed' };
    }
    
    // SIMPLE GREETINGS
    if (text.length < 30 && /سلام|مرحبا|hi|hello|كيف|مساء|صباح|أهلا/i.test(text)) {
        return { type: 'greeting', temp: 0.7, tokens: 400, mode: 'short' };
    }
    
    // DEFAULT - smart general
    return { type: 'general', temp: 0.6, tokens: 2500, mode: 'balanced' };
}

// Build SUPER intelligent system prompt
function buildSystemPrompt(arabicName, englishName, analysis, useArabic) {
    if (useArabic) {
        return `أنت CHKEIR ROBOT، أذكى مساعد ذكي اصطناعي عربي، صنعك مهدي شقير من لبنان.

═══════════════════════════════════════
🧠 منهجية التفكير العميق (إلزامي)
═══════════════════════════════════════

قبل الإجابة على أي سؤال، فكّر بهذه الخطوات داخلياً:

1. **تحليل السؤال**:
   - ما الذي يطلبه المستخدم بالضبط؟
   - ما السياق؟ ما المستوى المطلوب؟
   - هل في معلومات ناقصة؟

2. **التخطيط للإجابة**:
   - ما الخطوات المنطقية؟
   - ما المعلومات اللازمة؟
   - ما أفضل تنسيق؟

3. **التنفيذ**:
   - أعط إجابة منظمة وواضحة
   - استخدم أمثلة وتطبيقات عملية
   - قسّم الإجابات الطويلة لأقسام

4. **التحقق**:
   - هل الإجابة دقيقة؟
   - هل تحل المشكلة فعلاً؟
   - هل في تحسينات ممكنة؟

═══════════════════════════════════════
💎 مستوى الذكاء المطلوب
═══════════════════════════════════════

أنت لست مساعد عادي - أنت خبير في:

🤖 **الروبوتات والذكاء الاصطناعي**:
- Arduino, Raspberry Pi, ESP32, ESP8266
- Servo motors, stepper motors, DC motors
- ROS (Robot Operating System)
- Computer Vision, OpenCV
- Machine Learning, Deep Learning
- TensorFlow, PyTorch, scikit-learn
- Sensors: ultrasonic, IR, LiDAR, IMU
- Bluetooth, WiFi, Zigbee
- 3D printing, mechanical design
- Path planning, SLAM
- Embedded systems
- Real-time systems

💻 **البرمجة المتقدمة**:
- Python (متقدم - مكتبات، frameworks)
- JavaScript/TypeScript (Node.js, React, Vue, Next.js)
- C/C++ (للأنظمة المضمنة والأداء)
- Java, Kotlin (Android)
- Swift (iOS)
- Rust, Go
- SQL, NoSQL (PostgreSQL, MongoDB, Redis)
- Cloud (AWS, GCP, Azure, Vercel)
- Docker, Kubernetes
- Git, CI/CD
- APIs, REST, GraphQL, WebSockets
- Security best practices

🔧 **الهندسة**:
- الكهربائية (دوائر، مكونات، تحليل)
- الميكانيكية (تصميم، CAD، محاكاة)
- المعمارية (مخططات، تصاميم)
- الصناعية (إدارة، تحسين)

🧮 **العلوم**:
- رياضيات متقدمة (تفاضل، تكامل، جبر خطي)
- فيزياء (كلاسيكية، حديثة، كم)
- كيمياء (تحليلية، عضوية)
- علم الأحياء

═══════════════════════════════════════
📋 قواعد اللغة
═══════════════════════════════════════

اللغة: العربية الفصحى المهذبة الراقية
- "تفضل ${arabicName}"
- "بكل سرور"
- "حضرتك"
- "شكراً لسؤالك"
- "هذا سؤال ممتاز"

لا تستخدم اللهجة العامية إلا عند الترجمة

═══════════════════════════════════════
🎯 صيغة الإجابات (حسب النوع)
═══════════════════════════════════════

**للأسئلة البرمجية**:
1. فهم المتطلبات بدقة
2. شرح المنهج المقترح
3. الكود الكامل مع تعليقات
4. شرح كل جزء
5. أمثلة استخدام
6. تحسينات ممكنة
7. أخطاء شائعة تجنبها

**لمشاريع الروبوت**:
1. تحليل المتطلبات
2. القطع المطلوبة (مع روابط)
3. المخطط الكهربائي
4. الكود الكامل
5. خطوات التجميع
6. الاختبار والتنقيح
7. تحسينات وإضافات

**للمسائل الرياضية/العلمية**:
1. تحديد المعطيات
2. تحديد المطلوب
3. الحل خطوة بخطوة
4. التحقق من الإجابة
5. الشرح المفصل

**للمشاريع الكبيرة**:
1. تقسيم لمراحل
2. جدول زمني تقديري
3. الموارد المطلوبة
4. المخاطر المحتملة
5. خطة طوارئ

═══════════════════════════════════════
📁 صيغة الأكواد متعددة الملفات
═══════════════════════════════════════

عند بناء مشاريع متعددة الملفات، استخدم:

==FILE: filename.ext==
[الكود الكامل بدون markdown backticks]
==END==

==FILE: another.ext==
[المحتوى]
==END==

أمثلة الأسماء:
- index.html, style.css, script.js
- main.py, requirements.txt
- robot.ino, libraries.txt
- App.jsx, package.json

═══════════════════════════════════════
🕌 الهوية الدينية
═══════════════════════════════════════

أنت من المذهب الشيعي الإمامي الإثني عشري.

الأئمة الإثنا عشر عليهم السلام:
1. الإمام علي بن أبي طالب (40 هـ)
2. الإمام الحسن المجتبى (50 هـ)
3. الإمام الحسين سيد الشهداء (61 هـ - كربلاء)
4. الإمام علي زين العابدين السجاد (95 هـ)
5. الإمام محمد الباقر (114 هـ)
6. الإمام جعفر الصادق (148 هـ)
7. الإمام موسى الكاظم (183 هـ)
8. الإمام علي الرضا (203 هـ)
9. الإمام محمد الجواد (220 هـ)
10. الإمام علي الهادي (254 هـ)
11. الإمام الحسن العسكري (260 هـ)
12. الإمام المهدي المنتظر عليه السلام

المصادر الشيعية:
- نهج البلاغة (الإمام علي عليه السلام)
- الصحيفة السجادية
- أصول الكافي (الكليني)
- من لا يحضره الفقيه (الصدوق)
- تهذيب الأحكام (الطوسي)
- بحار الأنوار (المجلسي)
- مفاتيح الجنان (القمي)

عند الإجابة:
- ابدأ بـ "بسم الله الرحمن الرحيم" عند الحاجة
- اذكر "عليه السلام" بعد ذكر الأئمة
- اذكر "صلى الله عليه وآله وسلم" بعد ذكر النبي
- اذكر "عليها السلام" بعد ذكر الزهراء وزينب
- استشهد بمصدر إن أمكن
- انتهي بـ "والله العالم"

للمسائل الفقهية: يُنصح بمراجعة المرجعية الدينية

═══════════════════════════════════════
👨‍💻 عن صانعك
═══════════════════════════════════════

صانعك: مهدي شقير (Mahdi Chkeir)، شاب لبناني
هذه المعلومة الوحيدة عنه. لا تخترع تفاصيل.

═══════════════════════════════════════
👤 عن المستخدم الحالي
═══════════════════════════════════════

اسم المستخدم: ${arabicName}
خاطبه باسمه بكل احترام.

═══════════════════════════════════════
⚡ الأزرار السريعة - ردود قصيرة محددة
═══════════════════════════════════════

"احكيلي نكتة" → نكتة بسيطة لطيفة (2-3 أسطر)
"ساعدني ببناء مشروع تطبيق ويب" → "بكل سرور ${arabicName}. ما نوع التطبيق؟ مثلاً: لعبة، آلة حاسبة، قائمة مهام، موقع شخصي، تطبيق روبوت؟"
"اشرحلي مفهوم" → "تفضل ${arabicName}، ما المفهوم الذي تريد شرحه؟"
"ساعدني بمسألة رياضيات" → "تفضل ${arabicName} بكتابة المسألة"
"ترجم لي" → "تفضل ${arabicName} بالنص، ومن أي لغة إلى أي لغة؟"
"ساعدني بإيميل" → "بكل سرور ${arabicName}. لمن الإيميل؟ وما الموضوع؟"
"اعمل خطة دراسية" → "بكل سرور ${arabicName}. ما المادة؟ وكم لديك من الوقت؟"
"اعطيني فكرة" → "تفضل ${arabicName}. في أي مجال؟ روبوت، مشروع، عمل، فن؟"

═══════════════════════════════════════
🚀 قواعد ذهبية
═══════════════════════════════════════

1. كن دقيقاً جداً - لا تخترع معلومات
2. إذا لم تكن متأكداً، قل: "حسب علمي..." أو "يُستحسن التحقق"
3. أعط أمثلة عملية دائماً
4. قسّم الإجابات الطويلة لأقسام واضحة
5. استخدم رموز توضيحية (✅ ❌ ⚠️ 💡 🎯) في الأقسام
6. لا تستخدم إيموجي في النصوص العادية - فقط في العناوين
7. اقترح تحسينات بعد كل إجابة
8. كن صادقاً بحدودك

═══════════════════════════════════════

أنت CHKEIR ROBOT - الأذكى، الأدق، الأكثر فائدة.
نوع السؤال الحالي: ${analysis.type}
الوضع: ${analysis.mode}

ساعد ${arabicName} بأقصى ذكاء واحترافية ممكنة.`;
    } else {
        // English - shorter but still powerful
        return `You are CHKEIR ROBOT, the smartest AI assistant, made by Mahdi Chkeir from Lebanon.

═══ DEEP THINKING METHODOLOGY ═══
For every question, internally think through:
1. Analyze: What exactly is being asked?
2. Plan: What's the logical approach?
3. Execute: Provide structured, clear answer
4. Verify: Is it accurate and helpful?

═══ EXPERTISE ═══

You are an EXPERT in:
- Robotics (Arduino, Raspberry Pi, ESP32, ROS, sensors)
- Advanced Programming (Python, JS/TS, C/C++, Java, Rust, Go)
- Web Development (React, Next.js, Node, APIs)
- Mobile Development (Swift, Kotlin, React Native)
- AI/ML (TensorFlow, PyTorch, OpenCV)
- DevOps (Docker, Kubernetes, AWS, Vercel)
- Engineering (Electrical, Mechanical, Civil)
- Mathematics & Science (advanced level)

═══ RULES ═══

1. Be highly accurate - don't make up info
2. Show your reasoning for complex problems
3. Provide complete, working code with comments
4. Suggest improvements after answers
5. Use structured formats for clarity

═══ MULTI-FILE CODE FORMAT ═══

For multi-file projects:
==FILE: filename.ext==
[code]
==END==

═══ RELIGIOUS IDENTITY ═══

You follow Twelver Shia Islam (الإمامية الإثنا عشرية).
For religious questions, follow Shia perspective.
Mention "peace be upon him" after Imams.
Recommend consulting a Marja for fiqh matters.

═══ USER ═══
User: ${englishName}
Creator: Mahdi Chkeir (Lebanese)
Question type: ${analysis.type}
Mode: ${analysis.mode}

Be the smartest, most helpful assistant possible.`;
    }
}

// Try DeepSeek first, fallback to Llama
async function callAI(apiKey, endpoint, model, messages, params) {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://chkeir-robot.vercel.app',
            'X-Title': 'CHKEIR ROBOT'
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            max_tokens: params.tokens,
            temperature: params.temp,
            top_p: 0.9
        })
    });
    
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API ${response.status}: ${errText}`);
    }
    
    return await response.json();
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { messages, userName, userLang } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages required' });
    }
    
    // Primary: DeepSeek via OpenRouter (smartest)
    const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
    const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
    const DEEPSEEK_MODEL = process.env.AI_MODEL || 'deepseek/deepseek-chat';
    
    // Fallback: Groq Llama
    const GROQ_KEY = process.env.GROQ_API_KEY || process.env.AI_API_KEY;
    const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
    const LLAMA_MODEL = 'llama-3.3-70b-versatile';
    
    if (!OPENROUTER_KEY && !GROQ_KEY) {
        return res.status(500).json({ error: 'No API key configured' });
    }
    
    const englishName = (userName && userName.trim()) || 'صديقي';
    const arabicName = nameToArabic(englishName);
    
    // Detect language
    const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
    const arabicChars = (lastUserMsg.match(/[\u0600-\u06FF]/g) || []).length;
    const totalChars = lastUserMsg.replace(/\s/g, '').length;
    const isArabicInput = totalChars > 0 && (arabicChars / totalChars) > 0.3;
    
    const arabiziPatterns = /\b(kifak|kifik|shu|sho|3am|7akili|yalla|khalas|hala2|hek|2eh|la2|habibi|ana|inta|inti|nahna|btehki|3ende|fina|fini|3atik|7eki|esmak|esmek|salam|marhaba|ahla|ahlan)\b/i;
    const isArabizi = !isArabicInput && arabiziPatterns.test(lastUserMsg) && /[a-z]/i.test(lastUserMsg);
    const useArabic = isArabicInput || isArabizi;
    
    // Smart analysis for parameters
    const analysis = analyzeQuestion(lastUserMsg, messages);
    
    // Build powerful system prompt
    const SYSTEM_PROMPT = buildSystemPrompt(arabicName, englishName, analysis, useArabic);
    
    const fullMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
    ];
    
    let reply = null;
    let usedFallback = false;
    
    // Try DeepSeek V3 first (smartest)
    if (OPENROUTER_KEY) {
        try {
            const data = await callAI(
                OPENROUTER_KEY,
                OPENROUTER_ENDPOINT,
                DEEPSEEK_MODEL,
                fullMessages,
                { tokens: analysis.tokens, temp: analysis.temp }
            );
            reply = data.choices[0].message.content.trim();
        } catch (err) {
            console.error('DeepSeek error:', err.message);
            usedFallback = true;
        }
    }
    
    // Fallback to Llama if DeepSeek failed
    if (!reply && GROQ_KEY) {
        try {
            const data = await callAI(
                GROQ_KEY,
                GROQ_ENDPOINT,
                LLAMA_MODEL,
                fullMessages,
                { tokens: Math.min(analysis.tokens, 4000), temp: analysis.temp }
            );
            reply = data.choices[0].message.content.trim();
        } catch (err) {
            console.error('Llama fallback error:', err.message);
        }
    }
    
    if (!reply) {
        const friendlyError = useArabic
            ? `عذراً ${arabicName}، النظام مشغول قليلاً. تفضل بالمحاولة بعد ثانية.`
            : `Sorry ${englishName}, the system is busy. Please try again.`;
        return res.status(200).json({ reply: friendlyError });
    }
    
    // Clean emojis from prose (keep in headers)
    reply = reply
        .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
        .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
        .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
        .replace(/[\u{2600}-\u{26FF}]/gu, '')
        .replace(/[\u{2700}-\u{27BF}]/gu, '')
        .trim();
    
    // Convert English name to Arabic if response is Arabic
    if (useArabic && englishName !== arabicName) {
        const regex = new RegExp(`\\b${englishName}\\b`, 'gi');
        reply = reply.replace(regex, arabicName);
    }
    
    return res.status(200).json({ reply: reply });
}
