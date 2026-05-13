// CHKEIR ROBOT v10 PRO MAX - Vision API

function nameToArabic(name) {
    if (!name) return 'صديقي';
    if (/[\u0600-\u06FF]/.test(name)) return name;
    const lower = name.toLowerCase().trim();
    const map = {
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
        'sandy': 'ساندي', 'nadia': 'نادية', 'sara': 'سارة', 'sarah': 'سارة',
        'leila': 'ليلى', 'layla': 'ليلى', 'maya': 'مايا',
        'rana': 'رنا', 'lara': 'لارا', 'nour': 'نور', 'noor': 'نور',
        'yasmin': 'ياسمين', 'fatima': 'فاطمة', 'fatma': 'فاطمة',
        'zeinab': 'زينب', 'zeina': 'زينة', 'reem': 'ريم',
        'lina': 'لينا', 'dana': 'دانا', 'tala': 'تالا',
        'hala': 'هالة', 'mariam': 'مريم', 'maryam': 'مريم'
    };
    return map[lower] || name;
}

async function callAPI(apiKey, endpoint, model, messages, maxTokens) {
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
            max_tokens: maxTokens,
            temperature: 0.5
        })
    });
    
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`${model}: ${response.status}`);
    }
    return await response.json();
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { image, text, userName, userLang } = req.body;
    if (!image) return res.status(400).json({ error: 'Image required' });
    
    const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
    const GROQ_KEY = process.env.GROQ_API_KEY || process.env.AI_API_KEY;
    
    if (!OPENROUTER_KEY && !GROQ_KEY) {
        return res.status(500).json({ error: 'No API key configured' });
    }
    
    const englishName = (userName && userName.trim()) || 'صديقي';
    const arabicName = nameToArabic(englishName);
    const userQuestion = text || 'حلّل هذه الصورة بدقة عالية واشرح كل تفاصيلها';
    
    const arabicChars = (userQuestion.match(/[\u0600-\u06FF]/g) || []).length;
    const totalChars = userQuestion.replace(/\s/g, '').length;
    const isArabic = totalChars === 0 || (arabicChars / totalChars) > 0.2;
    
    const promptText = isArabic
        ? `أنت CHKEIR ROBOT، خبير ذكي اصطناعي متقدم صنعك مهدي شقير من لبنان.

🎯 منهجية التحليل العميق:
1. تأمل في الصورة بدقة
2. حدد كل العناصر الرئيسية والثانوية
3. حلل المحتوى بعمق
4. قدم معلومات شاملة ومفيدة

📋 القواعد:
- الرد بالعربية الفصحى المهذبة فقط
- خاطب: ${arabicName}
- كن مفصّلاً جداً ودقيقاً
- لا إيموجي في النصوص العادية
- لا تخترع معلومات

السؤال: ${userQuestion}

أنواع التحليل:
🖥️ كود/Screenshot: حدد اللغة، اكتب الكود، حدد المشاكل، اقترح حلول كاملة
📝 سؤال/واجب: حلّ خطوة بخطوة بالتفصيل مع شرح كل خطوة
📊 رسم بياني: اشرح المحاور والاتجاهات والمعلومات
📄 نص: اقرأ، ترجم، لخّص، استخرج النقاط المهمة
🖼️ صورة عامة: صف بدقة كل ما تراه
🔧 مشكلة: حلّل واقترح حلولاً عملية

ابدأ التحليل المفصّل الآن.`
        : `You are CHKEIR ROBOT, advanced AI expert by Mahdi Chkeir.
User: ${englishName}
Reply in polite English. No emojis in regular text.

Question: ${userQuestion}

Analyze deeply:
- Code/Screenshot: identify language, write code, find issues, suggest fixes
- Question/Homework: solve step by step with detailed explanation
- Chart: explain axes, trends, data points
- Text: read, translate, summarize, extract key points
- General image: describe in detail
- Problem: analyze and suggest solutions

Provide comprehensive, detailed analysis.`;
    
    const messages = [{
        role: 'user',
        content: [
            { type: 'text', text: promptText },
            { type: 'image_url', image_url: { url: image } }
        ]
    }];
    
    let reply = null;
    let lastError = null;
    
    // Try OpenRouter models first (best quality)
    if (OPENROUTER_KEY) {
        const openrouterModels = [
            'google/gemini-2.0-flash-exp:free',
            'meta-llama/llama-3.2-90b-vision-instruct:free',
            'qwen/qwen-2-vl-72b-instruct',
            'google/gemini-flash-1.5'
        ];
        
        for (const model of openrouterModels) {
            try {
                const data = await callAPI(
                    OPENROUTER_KEY,
                    'https://openrouter.ai/api/v1/chat/completions',
                    model,
                    messages,
                    2500
                );
                if (data && data.choices && data.choices[0]) {
                    reply = data.choices[0].message.content.trim();
                    break;
                }
            } catch (err) {
                lastError = err.message;
                console.error(`Vision ${model} failed:`, err.message);
                continue;
            }
        }
    }
    
    // Fallback to Groq Llama Vision
    if (!reply && GROQ_KEY) {
        const groqVisionModels = [
            'llama-3.2-11b-vision-preview',
            'llama-3.2-90b-vision-preview',
            'llava-v1.5-7b-4096-preview'
        ];
        
        for (const model of groqVisionModels) {
            try {
                const data = await callAPI(
                    GROQ_KEY,
                    'https://api.groq.com/openai/v1/chat/completions',
                    model,
                    messages,
                    2000
                );
                if (data && data.choices && data.choices[0]) {
                    reply = data.choices[0].message.content.trim();
                    break;
                }
            } catch (err) {
                lastError = err.message;
                console.error(`Groq vision ${model} failed:`, err.message);
                continue;
            }
        }
    }
    
    if (!reply) {
        const errorMsg = isArabic
            ? `عذراً ${arabicName}، خدمة تحليل الصور غير متاحة حالياً. تفضل بإعادة المحاولة بعد لحظات، أو اكتب سؤالك نصياً وسأساعدك بكل سرور.`
            : `Sorry ${englishName}, image analysis is temporarily unavailable. Please try again, or describe your question in text.`;
        return res.status(200).json({ reply: errorMsg });
    }
    
    // Clean
    reply = reply
        .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
        .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
        .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
        .replace(/[\u{2600}-\u{26FF}]/gu, '')
        .trim();
    
    if (isArabic && englishName !== arabicName) {
        const regex = new RegExp(`\\b${englishName}\\b`, 'gi');
        reply = reply.replace(regex, arabicName);
    }
    
    return res.status(200).json({ reply });
}
