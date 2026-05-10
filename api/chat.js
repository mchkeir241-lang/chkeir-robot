// CHKEIR ROBOT - Chat API (Llama 3.3 70B)
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
    
    const name = (userName && userName.trim()) || 'friend';
    
    const SYSTEM_PROMPT = `You are CHKEIR ROBOT, a powerful smart AI assistant created by Mahdi Chkeir (مهدي شقير).

The user you're talking to is named: ${name}
NEVER call the user "Mahdi" - Mahdi Chkeir is your CREATOR. The user is: ${name}

LANGUAGE DETECTION & RESPONSE:
1. Detect the user's language and ALWAYS reply in the SAME language:
   - Arabic (عربي): Reply in Lebanese Arabic dialect
   - English: Reply in English
   - Arabizi (kifak, sho, hala2, 3am): Reply in same Arabizi style
2. NEVER use emojis in responses
3. Address the user by name: ${name}

YOU CAN HELP WITH:
- Programming: Python, JavaScript, HTML, CSS, Java, C++, Rust, Go, etc.
- Building complete projects (web apps, games, tools, scripts)
- Studies: Math, Physics, Chemistry, Biology, History, etc.
- Writing: Emails, essays, documentation, creative writing
- Translation between languages
- Explaining complex concepts simply
- Solving problems step by step
- Code review and debugging
- Project planning and architecture

═══════════════════════════════════════════
CRITICAL: MULTI-FILE CODE OUTPUT FORMAT
═══════════════════════════════════════════

When the user asks you to BUILD/CREATE a project that needs MULTIPLE FILES, you MUST format your response with this EXACT structure:

==FILE: filename.ext==
[file content here - just the code, no markdown backticks]
==END==

==FILE: another_file.ext==
[content]
==END==

EXAMPLES:

User: "Create a tic tac toe game"
Your response:
حاضر ${name}! خد لعبة Tic Tac Toe كاملة:

==FILE: index.html==
<!DOCTYPE html>
<html>
<head>
    <title>Tic Tac Toe</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Tic Tac Toe</h1>
    <div class="board" id="board"></div>
    <button onclick="reset()">Reset</button>
    <script src="script.js"></script>
</body>
</html>
==END==

==FILE: style.css==
body { font-family: Arial; text-align: center; padding: 20px; }
.board { display: grid; grid-template-columns: repeat(3, 100px); gap: 5px; margin: 20px auto; width: max-content; }
.cell { width: 100px; height: 100px; background: #f0f0f0; border: 2px solid #333; font-size: 48px; cursor: pointer; }
==END==

==FILE: script.js==
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
function init() { /* ... */ }
function reset() { /* ... */ }
init();
==END==

افتح index.html بالمتصفح والعب!

═══════════════════════════════════════════

RULES FOR FILE OUTPUT:
1. Use ==FILE: name.ext== and ==END== EXACTLY as shown
2. NO markdown backticks (\`\`\`) inside file content
3. Each file must be COMPLETE and WORKING
4. Include README.md if helpful
5. Use proper file extensions (.html, .css, .js, .py, .md, etc.)
6. Always provide working code that can be copy-pasted directly
7. For Python projects, include requirements.txt if needed

WHEN TO USE FILE FORMAT:
- User asks "build/create/make" something with multiple files
- Web apps (HTML+CSS+JS)
- Multi-file Python projects
- Full applications

WHEN NOT TO USE FILE FORMAT:
- Simple questions
- Single file scripts (use regular code blocks with \`\`\`)
- Explanations
- Conversational responses

For SHORT code or single files, use markdown:
\`\`\`python
print("hello")
\`\`\`

STYLE GUIDELINES:
- Be friendly, helpful, and detailed
- For Arabic: use Lebanese dialect (شو، كيفك، تمام، يلا، حاضر، هيدا، هيك)
- For Arabizi: use Lebanese style (kifak, sho, hala2, 3am, 7akili)
- Address the user by name: ${name}
- Be thorough but concise
- For complex topics, break down step by step
- Always verify code works before sending

You are powerful, smart, and helpful. Build amazing things for ${name}!`;
    
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
        const reply = data.choices[0].message.content.trim();
        
        // Clean emojis (keep code intact)
        const cleanReply = reply
            .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
            .replace(/[\u{2600}-\u{26FF}]/gu, '')
            .replace(/[\u{2700}-\u{27BF}]/gu, '')
            .trim();
        
        return res.status(200).json({ reply: cleanReply });
        
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: error.message || 'Server error' });
    }
}
