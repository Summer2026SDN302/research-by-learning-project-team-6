const Chat = require('../models/Chat');
const Car = require('../models/Car');
const User = require('../models/User');

exports.chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const user = await User.findById(req.user.id);
        const userName = user ? user.name : 'Customer';

        const cars = await Car.find();
        const carContext = cars.map(c => 
            `- ${c.brand} ${c.name}: Type: ${c.type}, Seats: ${c.seats}, Transmission: ${c.transmission}, Fuel: ${c.fuelType}, Price: ${c.pricePerDay} USD/day, Location: ${c.location || 'Hanoi'}, Rating: ${c.rating}, Description: ${c.description}`
        ).join('\n');

        const dbHistory = await Chat.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);
        
        const chatHistory = dbHistory.reverse();

        const historyContents = chatHistory.map(doc => ({
            role: doc.role,
            parts: [{ text: doc.parts }]
        }));

        historyContents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        await Chat.create({
            user: req.user.id,
            role: 'user',
            parts: message
        });

        const systemInstruction = `You are a premium luxury car rental AI assistant for LuxeRide.
Greet the user by their name if provided (user name: ${userName}).

Here is the list of cars currently available in our database:
${carContext}

Rules:
- Recommend cars that actually exist in the list above based on user's requirements.
- Keep responses helpful, professional, polite, and brief.
- Answer in the same language as the user's query (usually Vietnamese).`;

        const payload = {
            contents: historyContents,
            systemInstruction: {
                parts: [{ text: systemInstruction }]
            },
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 800
            }
        };

        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error?.message || `Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        await Chat.create({
            user: req.user.id,
            role: 'model',
            parts: reply
        });

        res.json({ reply });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        const history = await Chat.find({ user: req.user.id }).sort({ createdAt: 1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
