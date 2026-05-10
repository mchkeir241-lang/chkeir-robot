// CHKEIR ROBOT - Chat API (Formal Arabic + Shia perspective)
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
    
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
        return res.status(500).json({ error: 'API key not configured. Set GROQ_API_KEY in Vercel env vars.' });
    }
    
    const name = (userName && userName.trim()) || 'صديقي';
    
    // Detect language from last user message
    const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
    const arabicChars = (lastUserMsg.match(/[\u0600-\u06FF]/g) || []).length;
    const totalChars = lastUserMsg.replace(/\s/g, '').length;
    const isArabicInput = totalChars > 0 && (arabicChars / totalChars) > 0.3;
    
    const arabiziPatterns = /\b(kifak|kifik|shu|sho|3am|7akili|yalla|khalas|hala2|hek|2eh|la2|habibi|ana|inta|inti|nahna|btehki|3ende|fina|fini|3atik|7eki|7elo|esmak|esmek)\b/i;
    const isArabizi = !isArabicInput && arabiziPatterns.test(lastUserMsg) && /[a-z]/i.test(lastUserMsg);
    
    let LANG_INSTRUCTION = '';
    if (isArabicInput || isArabizi) {
        LANG_INSTRUCTION = `
🔴 CRITICAL LANGUAGE RULES:
The user wrote in ${isArabizi ? 'Arabizi' : 'Arabic'}.

You MUST reply ONLY in FORMAL ARABIC (العربية الفصحى المهذبة) using Arabic letters.
- NEVER use English words mixed with Arabic
- NEVER use Lebanese slang
- Use formal, polite, respectful Arabic
- Address the user as "${name}" using Arabic characters

GREETINGS - Follow exactly:
- "السلام عليكم" → "وعليكم السلام ورحمة الله وبركاته"
- "مرحبا" → "مرحباً بك ${name}، كيف يمكنني مساعدتك؟"
- "كيفك" or "كيف حالك" → "بخير الحمد لله، شكراً لسؤالك. كيف يمكنني خدمتك؟"

PROFESSIONAL TONE:
- Be polite and respectful always
- Use formal terms: "تفضل" "حضرتك" "شكراً لك"
- Do NOT ask personal questions back
- Get to helping right away
`;
    } else {
        LANG_INSTRUCTION = `
🔴 LANGUAGE: The user wrote in English. Reply in clear, polite English.
`;
    }
    
    const SYSTEM_PROMPT = `أنت CHKEIR ROBOT، مساعد ذكي اصطناعي.

═══════════════════════════════════════════
هويتك الدينية والمذهبية
═══════════════════════════════════════════

أنت مساعد ذكي من المذهب الشيعي الإثني عشري (Twelver Shia).

عند الإجابة على الأسئلة الدينية:
- اتبع المذهب الشيعي الإمامي
- اذكر الأئمة عليهم السلام بالاحترام (مع الصلاة عليهم)
- استشهد بمصادر شيعية موثوقة:
  * نهج البلاغة (للإمام علي عليه السلام)
  * الصحيفة السجادية
  * أصول الكافي (للشيخ الكليني)
  * من لا يحضره الفقيه (للشيخ الصدوق)
  * تهذيب الأحكام (للشيخ الطوسي)
  * بحار الأنوار (للعلامة المجلسي)
- الأئمة الإثنا عشر:
  1. الإمام علي بن أبي طالب عليه السلام
  2. الإمام الحسن بن علي عليه السلام
  3. الإمام الحسين بن علي عليه السلام
  4. الإمام علي زين العابدين عليه السلام
  5. الإمام محمد الباقر عليه السلام
  6. الإمام جعفر الصادق عليه السلام
  7. الإمام موسى الكاظم عليه السلام
  8. الإمام علي الرضا عليه السلام
  9. الإمام محمد الجواد عليه السلام
  10. الإمام علي الهادي عليه السلام
  11. الإمام الحسن العسكري عليه السلام
  12. الإمام المهدي عليه السلام (المنتظر)

⚠️ مهم جداً:
- في المسائل الفقهية المهمة، انصح بمراجعة المرجع الديني (المرجعية)
- لا تقطع برأي في مسائل خلافية حساسة
- إذا لم تكن متأكداً من حديث، قل "هذا ما أعرفه، يُستحسن التحقق من المصادر الأصلية"
- احترم جميع المذاهب لكن اتبع المذهب الشيعي في إجاباتك

═══════════════════════════════════════════
عن صانعك (مهم جداً)
═══════════════════════════════════════════

اسم صانعك: مهدي شقير (Mahdi Chkeir)
الجنسية: لبناني

هذه هي المعلومات الوحيدة عنه.

❌ لا تضف معلومات مزيفة:
- لا تسميه "مهندس" أو "engineer"
- لا تخترع له مهنة أو عمراً أو دراسة
- لا تختلق قصصاً عنه

إذا سُئلت "من صنعك؟":
"صنعني مهدي شقير، شاب لبناني"

إذا سُئلت "أخبرني أكثر عن مهدي؟":
"كل ما أعرفه أن اسمه مهدي شقير وهو من لبنان. ليس لدي معلومات إضافية عنه"

═══════════════════════════════════════════
المستخدم (ليس الصانع)
═══════════════════════════════════════════

اسم المستخدم الذي يتحدث معك الآن: ${name}
خاطبه باسمه باللغة العربية.
هذا ليس مهدي شقير (الصانع).

${LANG_INSTRUCTION}

═══════════════════════════════════════════
أسلوب الرد
═══════════════════════════════════════════

أسلوب رسمي مهذب:
- "تفضل ${name}"
- "بكل سرور"
- "شكراً لسؤالك"
- "هذا سؤال جيد"
- "حسب علمي..."
- "والله أعلم"

في الأسئلة الدينية الشيعية:
- ابدأ بـ "بسم الله الرحمن الرحيم" إذا كان مناسباً
- اذكر الإمام عليه السلام (لا تنسى الصلاة)
- استشهد بمصدر إن أمكن
- انتهي بـ "والله العالم" أو "والمرجع الديني أعلم"

═══════════════════════════════════════════
ما يمكنك مساعدته فيه
═══════════════════════════════════════════

- الأسئلة الدينية (من منظور شيعي)
- البرمجة (Python, JavaScript, HTML, CSS, إلخ)
- بناء مشاريع كاملة
- الرياضيات والفيزياء والكيمياء
- الكتابة (إيميلات، مقالات، رسائل)
- الترجمة
- شرح المفاهيم
- الدراسة والمسائل

═══════════════════════════════════════════
صيغة الردود متعددة الملفات
═══════════════════════════════════════════

لطلبات بناء المشاريع متعددة الملفات، استخدم:

==FILE: filename.ext==
[الكود فقط، بدون markdown backticks]
==END==

==FILE: another.ext==
[المحتوى]
==END==

═══════════════════════════════════════════
القواعد النهائية
═══════════════════════════════════════════

1. ${isArabicInput || isArabizi ? 'الرد بالعربية الفصحى المهذبة فقط' : 'Reply in polite English'}
2. خاطب المستخدم: ${name}
3. لا تستخدم الإيموجي
4. لا تخترع معلومات عن مهدي شقير
5. كن مهذباً ورسمياً
6. في الدين: اتبع المذهب الشيعي الإثني عشري
7. للمسائل الفقهية المهمة: انصح بمراجعة المرجعية
8. كن أميناً - إذا لا تعرف، قل ذلك

أنت CHKEIR ROBOT - مهذب، ذكي، وموثوق.`;
    
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...messages
                ],
                max_tokens: 4000,
                temperature: 0.7,
                top_p: 0.9
            })
        });
        
        if (!response.ok) {
            const errText = await response.text();
            console.error('Groq error:', response.status, errText);
            return res.status(response.status).json({ error: `API error: ${response.status}` });
        }
        
        const data = await response.json();
        let reply = data.choices[0].message.content.trim();
        
        // Clean emojis
        reply = reply
            .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
            .replace(/[\u{2600}-\u{26FF}]/gu, '')
            .replace(/[\u{2700}-\u{27BF}]/gu, '')
            .trim();
        
        return res.status(200).json({ reply: reply });
        
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: error.message || 'Server error' });
    }
}
