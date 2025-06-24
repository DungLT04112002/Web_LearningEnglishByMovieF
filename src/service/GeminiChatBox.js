
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
if (!apiKey) {
    throw new Error('NEXT_PUBLIC_GOOGLE_API_KEY is missing. Check your .env.local file and ensure it is loaded correctly by Next.js.');
}

// --- Khởi tạo Google AI Client ---
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // Hoặc "gemini-1.5-pro"
});

// --- Bước 3: Cấu hình (tương tự API Route) ---
const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    // Thêm các cài đặt an toàn khác nếu cần
];
const generationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};
const chatSession = model.startChat({
    generationConfig,
    safetySettings,
    history: [],
});
async function sendMessageToGemini(userMessage) {
    if (!chatSession) {
        return;
    }

    const result = await chatSession.sendMessage(userMessage);
    return result.response.text();
}


export default sendMessageToGemini;
