/**
 * Vercel Serverless Function: /api/mock-interview
 * Generates tailored interview questions and evaluates candidate answers.
 */

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { action, role, type, difficulty, question, answer, history } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    // ACTION 1: Generate Questions
    if (action === 'generate_questions') {
      if (apiKey) {
        try {
          const prompt = `
You are a senior technical interviewer for CareerSetu.
Generate 5 realistic interview questions for:
- Role: ${role || 'Frontend Web Developer'}
- Interview Type: ${type || 'Technical'}
- Difficulty: ${difficulty || 'Beginner / Intermediate'}

Return ONLY a JSON response without codeblocks or backticks matching:
{
  "role": "${role || 'Frontend Web Developer'}",
  "type": "${type || 'Technical'}",
  "difficulty": "${difficulty || 'Intermediate'}",
  "questions": [
    {
      "id": 1,
      "question": "Can you explain the difference between 'let', 'const', and 'var' in modern JavaScript, and how block scoping works?",
      "expectedKeyPoints": ["Hoisting", "Block scope vs Function scope", "Re-assignment immutability with const"],
      "tips": "Structure your response with clear definitions, scoping rules, and practical examples."
    },
    {
      "id": 2,
      "question": "How does the browser event loop handle asynchronous tasks like Promises and setTimeout?",
      "expectedKeyPoints": ["Call Stack", "Microtask Queue (Promises)", "Macrotask Queue (setTimeout)", "Non-blocking execution"],
      "tips": "Explain the prioritization of microtasks over macrotasks."
    },
    {
      "id": 3,
      "question": "How do you ensure a web application is responsive across different mobile and desktop screen sizes without third-party CSS libraries?",
      "expectedKeyPoints": ["CSS Grid & Flexbox", "Viewport meta tag", "CSS media queries", "Relative units (rem, em, %)"],
      "tips": "Mention mobile-first approach and performance benefits of pure CSS."
    },
    {
      "id": 4,
      "question": "What are RESTful APIs and what is the difference between GET, POST, PUT, and DELETE methods?",
      "expectedKeyPoints": ["HTTP methods", "Idempotency", "Request headers & JSON bodies", "Status codes"],
      "tips": "State clearly when each verb should be employed in a real application."
    },
    {
      "id": 5,
      "question": "Describe a challenging bug you encountered in a coding project and the systematic approach you took to debug and solve it.",
      "expectedKeyPoints": ["Problem identification", "Debugging tools (DevTools / logs)", "Root cause resolution", "Preventative testing"],
      "tips": "Use the STAR format: Situation, Task, Action, Result."
    }
  ]
}
`;

          const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.4, responseMimeType: "application/json" }
            })
          });

          if (geminiResponse.ok) {
            const data = await geminiResponse.json();
            const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (raw) {
              const parsed = JSON.parse(raw.replace(/^```json\s*/, '').replace(/\s*```$/, ''));
              return res.status(200).json({ source: 'gemini-api', data: parsed });
            }
          }
        } catch (err) {
          console.warn('Gemini questions API failed, using fallback:', err.message);
        }
      }

      // Fallback questions
      return res.status(200).json({
        source: apiKey ? 'gemini-fallback' : 'demo-mode',
        data: {
          role: role || 'Frontend Web Developer',
          type: type || 'Technical',
          difficulty: difficulty || 'Intermediate',
          questions: [
            {
              id: 1,
              question: "What is the difference between synchronous and asynchronous code in JavaScript, and how do Promises solve callback hell?",
              expectedKeyPoints: ["Call Stack non-blocking nature", "Promises states (pending, resolved, rejected)", "Async/Await syntax readability"],
              tips: "Provide an example contrasting nested callbacks with clean async/await syntax."
            },
            {
              id: 2,
              question: "How does the CSS Box Model work, and what is the difference between content-box and border-box?",
              expectedKeyPoints: ["Margin, Border, Padding, Content", "box-sizing property", "Impact on layout width calculations"],
              tips: "Explain why 'box-sizing: border-box' is standard practice in modern CSS resets."
            },
            {
              id: 3,
              question: "Why should sensitive credentials like API keys not be stored in client-side frontend code?",
              expectedKeyPoints: ["Browser inspection exposure", "Reverse engineering risks", "Serverless proxy / backend functions protection", "Environment variables"],
              tips: "Discuss the security boundary between client browser and cloud backend."
            },
            {
              id: 4,
              question: "How do you optimize a web application to achieve fast initial page load times?",
              expectedKeyPoints: ["Minification of CSS/JS", "Lazy loading images", "Eliminating render-blocking resources", "Efficient DOM updates"],
              tips: "Mention Core Web Vitals (LCP, FID/INP, CLS) and modern browser caching."
            },
            {
              id: 5,
              question: "Tell me about a time when you had to learn a new tool or technology under a tight deadline, such as during a hackathon.",
              expectedKeyPoints: ["Adaptability", "Rapid documentation reading", "Focus on MVP requirements", "Overcoming blockers"],
              tips: "Highlight your problem-solving mindset and resourceful learning strategies."
            }
          ]
        }
      });
    }

    // ACTION 2: Evaluate User Answer
    if (action === 'evaluate_answer') {
      if (apiKey) {
        try {
          const prompt = `
You are a supportive but rigorous technical interviewer for CareerSetu.
Evaluate the candidate's answer:
- Target Role: ${role || 'Frontend Web Developer'}
- Question: "${question}"
- Candidate Answer: "${answer || 'No response provided'}"

Return ONLY valid JSON matching this schema:
{
  "score": 8,
  "technicalAccuracy": "Strong explanation of the fundamental concept with correct terminology.",
  "communication": "Clear and coherent sentence structure.",
  "strengths": [
    "Identified the core concept directly without rambling",
    "Included accurate technical terminology"
  ],
  "areasToImprove": [
    "Could provide a brief real-world code scenario or edge case to demonstrate depth"
  ],
  "suggestedBetterAnswer": "A top-tier response should explicitly state: ..."
}
`;

          const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.3, responseMimeType: "application/json" }
            })
          });

          if (geminiResponse.ok) {
            const data = await geminiResponse.json();
            const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (raw) {
              const parsed = JSON.parse(raw.replace(/^```json\s*/, '').replace(/\s*```$/, ''));
              return res.status(200).json({ source: 'gemini-api', data: parsed });
            }
          }
        } catch (err) {
          console.warn('Gemini evaluation API failed, using fallback:', err.message);
        }
      }

      // Fallback evaluation
      const length = (answer || '').trim().length;
      let calculatedScore = length > 120 ? 8.5 : length > 50 ? 7.0 : 5.0;
      return res.status(200).json({
        source: apiKey ? 'gemini-fallback' : 'demo-mode',
        data: {
          score: calculatedScore,
          technicalAccuracy: length > 80 ? "Demonstrates good conceptual grasp of the core subject matter." : "Basic understanding shown, but missing deeper technical keywords and mechanism details.",
          communication: "Structured thoughts logically with easy-to-follow phrasing.",
          strengths: [
            "Addressed the primary intent of the question promptly",
            "Maintained a professional, direct tone"
          ],
          areasToImprove: [
            "Incorporate specific edge cases or real-world implementation nuances",
            "Quantify trade-offs (e.g. memory consumption, execution speed, or security implications)"
          ],
          suggestedBetterAnswer: "Start with a direct definition, outline 2-3 key mechanisms, mention a quick code or project example, and summarize the best-practice trade-off."
        }
      });
    }

    return res.status(400).json({ error: 'Invalid action. Specify action=generate_questions or action=evaluate_answer.' });
  } catch (error) {
    return res.status(500).json({ error: 'Interview endpoint failure', details: error.message });
  }
};
