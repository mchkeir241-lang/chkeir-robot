// CHKEIR ROBOT - Vision API
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { image, text, userName, userLang } = req.body;
    
    if (!image) return res.status(400).json({ error: 'Image required' });
    
    const AI_API_KEY = process.env.AI_API_KEY || process.env.GROQ_API_KEY;
    const AI_VISION_MODEL = process.env.AI_VISION_MODEL || 'llama-3.2-90b-vision-preview';
    const AI_ENDPOINT = process.env.AI_ENDPOINT || 'https://api.groq.com/openai/v1/chat/completions';
    
    if (!AI_API_KEY) return res.status(500).json({ error: 'API key not configured' });
    
    const name = (userName && userName.trim()) || 'صديقي';
    const userQuestion = text || 'ما الذي تراه في هذه الصورة؟ حلّلها بدقة.';
    
    const isArabic = /[\u0600-\u06FF]/.test(userQuestion);
    
    const promptText = isArabic
        ? `أنت CHKEIR ROBOT، مساعد ذكي مهذب صنعه مهدي شقير.
المستخدم: ${name}

الرد بالعربية الفصحى المهذبة فقط.
لا إيموجي.

السؤال: ${userQuestion}

حلّل الصورة بدقة:
- إذا كانت كود/screenshot: حدد المشاكل، اقترح حلول
- إذا كانت سؤال/واجب: حلّ خطوة بخطوة
- إذا كانت رسم بياني: اشرح ما يظهر
- إذا كانت نص: اقرأ وترجم/اشرح
خاطب ${name} باحترام.`
        : `You are CHKEIR ROBOT, made by Mahdi Chkeir.
User: ${name}
Reply in polite English.
No emojis.

Question: ${userQuestion}

Analyze the image carefully:
- Code/screenshot: identify issues, suggest fixes
- Question/homework: solve step by step
- Chart/graph: explain what it shows
- Text: read and translate/explain`;
    
    try {
        const response = await fetch(AI_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: AI_VISION_MODEL,
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: promptText },
                            { type: 'image_url', image_url: { url: image } }
                        ]
                    }
                ],
                max_tokens: 2000,
                temperature: 0.5
            })
        });
        
        if (!response.ok) {
            return res.status(200).json({ 
                reply: isArabic 
                    ? `عذراً ${name}، لم أتمكن من تحليل الصورة. تفضل بإعادة المحاولة.`
                    : `Sorry ${name}, couldn't analyze the image. Please try again.`
            });
        }
        
        const data = await response.json();
        let reply = data.choices[0].message.content.trim();
        
        reply = reply
            .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
            .trim();
        
        return res.status(200).json({ reply });
        
    } catch (error) {
        console.error('Vision error:', error);
        return res.status(200).json({ 
            reply: isArabic 
                ? `عذراً ${name}، حدث خطأ مؤقت.`
                : `Sorry ${name}, a temporary error occurred.`
        });
    }
}
