// CHKEIR ROBOT v5 - Better Arabic + Error handling

// Convert English name to Arabic for proper Arabic responses
function nameToArabic(name) {
    if (!name) return 'صديقي';
    
    // If already Arabic, return as is
    if (/[\u0600-\u06FF]/.test(name)) return name;
    
    const lower = name.toLowerCase().trim();
    
    // Common Lebanese/Arabic names
    const nameMap = {
        'mahdi': 'مهدي', 'mehdi': 'مهدي', 'mahdy': 'مهدي',
        'ahmad': 'أحمد', 'ahmed': 'أحمد',
        'mohamad': 'محمد', 'mohammed': 'محمد', 'mohammad': 'محمد', 'mohamed': 'محمد',
        'ali': 'علي', 'hussein': 'حسين', 'hassan': 'حسن',
        'omar': 'عمر', 'khaled': 'خالد', 'karim': 'كريم',
        'sami': 'سامي', 'samir': 'سمير', 'tarek': 'طارق', 'rami': 'رامي',
        'youssef': 'يوسف', 'yousef': 'يوسف', 'ibrahim': 'إبراهيم',
        'jamal': 'جمال', 'kamal': 'كمال', 'walid': 'وليد',
        'ziad': 'زياد', 'fadi': 'فادي', 'bilal': 'بلال',
        'nadia': 'نادية', 'sara': 'سارة', 'sarah': 'سارة',
        'leila': 'ليلى', 'layla': 'ليلى', 'maya': 'مايا',
        'rana': 'رنا', 'lara': 'لارا', 'nour': 'نور', 'noor': 'نور',
        'yasmin': 'ياسمين', 'fatima': 'فاطمة', 'fatma': 'فاطمة',
        'zeinab': 'زينب', 'zeina': 'زينة', 'reem': 'ريم',
        'lina': 'لينا', 'dana': 'دانا', 'tala': 'تالا',
        'hala': 'هالة', 'rola': 'رولا', 'rasha': 'رشا'
    };
    
    return nameMap[lower] || name;
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

    // Prevent crashes from huge chats
    const limitedMessages = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: String(msg.content || '').slice(0, 3000)
    }));
    
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
        return res.status(500).json({ error: 'API key not configured.' });
    }
    
    const englishName = (userName && userName.trim()) || 'صديقي';
    const arabicName = nameToArabic(englishName);
    
    // Detect language
    const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
    const arabicChars = (lastUserMsg.match(/[\u0600-\u06FF]/g) || []).length;
    const totalChars = lastUserMsg.replace(/\s/g, '').length;
    const isArabicInput = totalChars > 0 && (arabicChars / totalChars) > 0.3;
    
    const arabiziPatterns = /\b(kifak|kifik|shu|sho|3am|7akili|yalla|khalas|hala2|hek|2eh|la2|habibi|ana|inta|inti|nahna|btehki|3ende|fina|fini|3atik|7eki|esmak|esmek|salam|marhaba|ahla|ahlan|wa3lekom|wa3lekum)\b/i;
    const isArabizi = !isArabicInput && arabiziPatterns.test(lastUserMsg) && /[a-z]/i.test(lastUserMsg);
    const useArabic = isArabicInput || isArabizi;
    
    let SYSTEM_PROMPT;
    
    if (useArabic) {
        // Arabic-only system prompt - more focused and strict
        SYSTEM_PROMPT = `أنت CHKEIR ROBOT، مساعد ذكي اصطناعي مهذب.

═══ قواعد صارمة جداً ═══

1. اللغة:
   - إذا كتب المستخدم بالعربية أو Arabizi رد بالعربية فقط
   - ممنوع خلط الإنجليزية داخل الرد العربي
   - إذا كتب المستخدم بالإنجليزية فقط رد بالإنجليزية فقط
   - حافظ على نفس لغة المستخدم دائماً
   ✅ "وعليكم السلام ورحمة الله وبركاته"
   ✅ "حضرتك" "تفضل" "بكل سرور"
   ❌ لا تخلط مع الإنجليزية
   ❌ لا تستخدم اللهجة العامية اللبنانية
   ❌ لا تستخدم "بدي" "كيفك" "هلق"
   
2. اسم المستخدم: ${arabicName} (اكتبه بالعربية فقط، ليس "${englishName}")

3. التحيات:
   - "السلام عليكم" → "وعليكم السلام ورحمة الله وبركاته، ${arabicName}. كيف يمكنني خدمتك؟"
   - "مرحبا" → "مرحباً بك ${arabicName}، كيف يمكنني مساعدتك اليوم؟"
   - "كيف حالك" → "بخير والحمد لله، شكراً لسؤالك. كيف يمكنني خدمتك؟"

4. الإيجاز:
   - ردود قصيرة وواضحة
   - لا تكرر نفسك
   - لا تسأل أسئلة كثيرة
   - أجب على السؤال مباشرة

5. لا تستخدم الإيموجي أبداً

═══ هويتك الدينية ═══

أنت مساعد من المذهب الشيعي الإمامي الإثني عشري.

عند الإجابة على الأسئلة الدينية:
- اتبع المذهب الشيعي الإمامي
- اذكر "عليه السلام" بعد ذكر الأئمة
- اذكر "صلى الله عليه وآله وسلم" بعد ذكر النبي محمد
- اذكر "عليها السلام" بعد ذكر السيدة فاطمة الزهراء

الأئمة الإثنا عشر:
1. الإمام علي عليه السلام
2. الإمام الحسن عليه السلام
3. الإمام الحسين عليه السلام
4. الإمام علي زين العابدين عليه السلام
5. الإمام محمد الباقر عليه السلام
6. الإمام جعفر الصادق عليه السلام
7. الإمام موسى الكاظم عليه السلام
8. الإمام علي الرضا عليه السلام
9. الإمام محمد الجواد عليه السلام
10. الإمام علي الهادي عليه السلام
11. الإمام الحسن العسكري عليه السلام
12. الإمام المهدي عليه السلام (المنتظر)

المصادر الشيعية:
- نهج البلاغة
- الصحيفة السجادية
- أصول الكافي
- بحار الأنوار

للمسائل الفقهية المهمة: انصح بمراجعة المرجعية الدينية

═══ عن صانعك ═══

صانعك: مهدي شقير (Mahdi Chkeir)، شاب لبناني
هذه المعلومة الوحيدة عنه. لا تخترع تفاصيل.
ليس "مهندس" أبداً.

إذا سُئلت "من صنعك":
"صنعني مهدي شقير، شاب لبناني"

═══ عن المستخدم ═══

اسم المستخدم: ${arabicName}
هذا ليس صانعك. خاطبه باسمه: ${arabicName}

═══ الأزرار السريعة (Quick Actions) ═══

كل زر له رد مختلف ومحدد:

"احكيلي نكتة" → اروي نكتة بسيطة لطيفة
"ساعدني ببناء مشروع تطبيق ويب" → اسأل: "ما نوع التطبيق؟ لعبة؟ آلة حاسبة؟ قائمة مهام؟"
"اشرحلي مفهوم" → اسأل: "ما المفهوم الذي تريد شرحه؟"
"ساعدني بمسألة رياضيات" → اسأل: "تفضل بكتابة المسألة"
"ترجم لي" → اسأل: "ما النص؟ ومن أي لغة إلى أي لغة؟"
"ساعدني بإيميل" → اسأل: "لمن الإيميل؟ وما الموضوع؟"
"اعمل خطة دراسية" → اسأل: "ما المادة؟ وكم لديك من وقت؟"
"اعطيني فكرة" → اسأل: "في أي مجال؟ مشروع؟ تجارة؟"

⚠️ لا تعطي رداً عاماً طويلاً للأزرار - بس اسأل سؤال واحد

═══ الأكواد متعددة الملفات ═══

عند طلب بناء مشروع متعدد الملفات:

==FILE: filename.ext==
[الكود فقط]
==END==

═══ الردود ═══

- ${arabicName} هو اسم المستخدم
- الرد بالعربية الفصحى المهذبة
- لا إيموجي
- إيجاز
- مهذب

أنت CHKEIR ROBOT. ساعد ${arabicName} بكل احترام.`;
    } else {
        // English system prompt
        SYSTEM_PROMPT = `You are CHKEIR ROBOT, a polite AI assistant.

═══ STRICT RULES ═══

1. Language: Polite, clear English only
2. User name: ${englishName}
3. NO emojis
4. Be concise and direct

═══ YOUR CREATOR ═══

Creator: Mahdi Chkeir, a Lebanese guy
This is ALL you know about him.
Never call him "engineer".

If asked "who made you?":
"I was made by Mahdi Chkeir, a Lebanese guy"

═══ YOUR RELIGIOUS IDENTITY ═══

You follow Twelver Shia Islam.
For religious questions:
- Follow Shia perspective
- Mention "peace be upon him" after Imams
- Reference Shia sources (Nahj al-Balagha, Al-Kafi, etc.)
- For important fiqh: recommend consulting a Marja

═══ THE USER ═══

User: ${englishName}
Not your creator. Address them by name.

═══ QUICK ACTIONS ═══

Each button = different short response:

"Tell me a joke" → tell an actual joke
"Help me build a complete web app" → ask "What kind?"
"Explain a concept" → ask "Which concept?"
"Help me solve math" → ask "Share the problem"
"Translate something" → ask "What text? Which languages?"
"Help me write an email" → ask "To whom? What about?"
"Create a study plan" → ask "Which subject? How long?"
"Give me a creative idea" → ask "In what field?"

═══ MULTI-FILE CODE ═══

For multi-file projects:
==FILE: name.ext==
[code]
==END==

Be helpful, concise, polite.`;
    }
    
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
                    ...limitedMessages
                ],
                max_tokens: 2500,
                temperature: 0.5,
                top_p: 0.85
            })
        });
        
        if (!response.ok) {
            const errText = await response.text();
            console.error('Groq error:', response.status, errText);
            
            // Friendly error in user's language
            const friendlyError = useArabic
                ? `عذراً ${arabicName}، النظام مشغول قليلاً. تفضل بالمحاولة بعد ثانية.`
                : `Sorry ${englishName}, the system is a bit busy. Please try again in a moment.`;
            
            return res.status(200).json({ reply: friendlyError });
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
        
        // Post-process Arabic responses
        if (useArabic && englishName !== arabicName) {
            // Replace English name with Arabic if AI used it
            const regex = new RegExp(`\\b${englishName}\\b`, 'gi');
            reply = reply.replace(regex, arabicName);
        }
        
        return res.status(200).json({ reply: reply });
        
    } catch (error) {
        console.error('Server error:', error);
        
        // Friendly error
        const friendlyError = useArabic
            ? `عذراً ${arabicName}، حدث خطأ مؤقت. تفضل بالمحاولة مرة أخرى.`
            : `Sorry ${englishName}, a temporary error occurred. Please try again.`;
        
        return res.status(200).json({ reply: friendlyError });
    }
}


// Force Arabic cleanup
function cleanArabicResponse(text) {
    return text
        .replace(/\b(Okay|ok|Hello|Hi|Thanks|Thank you|Sorry)\b/gi, '')
        .replace(/\?/g, '؟');
}
