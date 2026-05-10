export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { image, text, userName, userLang } = req.body;
    
    if (!image) return res.status(400).json({ error: 'Image required' });
    
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) return res.status(500).json({ error: 'API key not configured' });
    
    const name = (userName && userName.trim()) || 'friend';
    const userQuestion = text || 'What is in this image? Analyze it carefully.';
    
    // Detect lang from question
    const isArabic = /[\u0600-\u06FF]/.test(userQuestion);
    
    const langInstruction = isArabic 
        ? 'Reply in Lebanese Arabic. Use Lebanese dialect.'
        : userLang === 'arabizi'
        ? 'Reply in Arabizi (Lebanese with English letters)'
        : 'Reply in English';
    
    const promptText = `You are CHKEIR ROBOT, an AI assistant created by Mahdi Chkeir.
The user is: ${name}
${langInstruction}

User asks: ${userQuestion}

Analyze the image carefully and provide a helpful, detailed answer.
- If it's code/screenshot: identify issues, suggest fixes, explain
- If it's a question/homework: solve it step by step
- If it's a chart/graph: explain what it shows
- If it's text: read and translate/explain
- Address the user by name: ${name}
- Don't use emojis`;
    
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.2-90b-vision-preview',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: promptText },
                            { type: 'image_url', image_url: { url: image } }
                        ]
                    }
                ],
                max_tokens: 1500,
                temperature: 0.5
            })
        });
        
        if (!response.ok) {
            const errText = await response.text();
            console.error('Vision error:', response.status, errText);
            
            // Fallback to text-only model
            return res.status(200).json({ 
                reply: isArabic 
                    ? `آسف ${name}، ما قدرت أحلل الصورة. جرّب مرة ثانية أو اكتبلي شو فيها بالكلام.`
                    : `Sorry ${name}, I couldn't analyze the image. Try again or describe it in text.`
            });
        }
        
        const data = await response.json();
        const reply = data.choices[0].message.content.trim();
        
        const cleanReply = reply
            .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
            .trim();
        
        return res.status(200).json({ reply: cleanReply });
        
    } catch (error) {
        console.error('Vision error:', error);
        return res.status(500).json({ error: error.message });
    }
}
