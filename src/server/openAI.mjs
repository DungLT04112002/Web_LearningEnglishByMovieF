// !!!!! CẢNH BÁO BẢO MẬT NGHIÊM TRỌNG !!!!!
// FILE NÀY GỌI GOOGLE API VÀ CÓ THỂ LÀM LỘ API KEY NẾU IMPORT TRỰC TIẾP VÀO CLIENT COMPONENT.
// HÃY SỬ DỤNG API ROUTE TRONG NEXT.JS ĐỂ ĐẢM BẢO AN TOÀN.
// XEM XÉT KỸ RỦI RO TRƯỚC KHI SỬ DỤNG CODE NÀY.

// --- Sử dụng import (ES Module) ---
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// --- Sử dụng biến môi trường với tiền tố NEXT_PUBLIC_ ---
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

// --- Log để kiểm tra ---
console.log("[gemini.mjs] Checking env var NEXT_PUBLIC_GOOGLE_API_KEY:", apiKey ? 'Exists' : 'MISSING!');

// --- Kiểm tra API Key ---
if (!apiKey) {
    // Nếu vẫn lỗi ở đây, vấn đề có thể là file .env.local không được load đúng cách
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


// --- Bước 4: Hàm tạo quiz (logic gọi API Gemini) ---
async function createQuiz(subtitle) {
    // Lấy lại key một lần nữa để chắc chắn (dù không cần thiết nếu scope đúng)
    const currentApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!currentApiKey) {
        throw new Error('NEXT_PUBLIC_GOOGLE_API_KEY is missing when trying to create quiz.');
    }

    try {
        if (!subtitle || typeof subtitle !== 'string') {
            throw new Error('Invalid subtitle input');
        }


        const prompt = `
        Bạn là một giáo viên luyện thi TOEIC chuyên nghiệp.
        
        Dưới đây là nội dung phụ đề phim:
        
        [START OF MOVIE SUBTITLES]
        ${subtitle}
        [END OF MOVIE SUBTITLES]
        
        ===> Nhiệm vụ:
        Bạn trong vai một người ra đề thi toeic, hãy tạo một nội dung cấp độ khó mức 1-2 thang bloom.
        1. Tạo 5 bài đọc hiểu bằng cách tóm tắt nội dung phim được suy ra từ phụ đề TOEIC Part 7 (mỗi bài khoảng 300–350 từ).
        2. Mỗi bài có 5 câu hỏi trắc nghiệm (question + 4 lựa chọn + đáp án đúng + giải thích + trích dẫn hỗ trợ).
        
        ===> Output format:
        TRẢ VỀ DUY NHẤT MỘT MẢNG JSON KHÔNG CÓ BẤT KỲ KÝ TỰ ĐẶC BIỆT NÀO KHÁC.
        KHÔNG THÊM \`\`\`json, \`\`\` HOẶC BẤT KỲ ĐỊNH DẠNG MARKDOWN NÀO.
        KHÔNG THÊM BẤT KỲ CHÚ THÍCH HOẶC VĂN BẢN NÀO KHÁC.
        
        [
          {
            "passage": "...",
            "questions": [
              {
                "question": "...",
                "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
                "answer": "B",
                "explanation": "...",
                "quote": "..."
              }
            ]
          }
        ]
        `;

        console.log("[gemini.mjs] Sending request to Google AI...");
        const chatSession = model.startChat({
            generationConfig,
            safetySettings,
            history: [],
        });

        const result = await chatSession.sendMessage(prompt);
        let responseText = result.response.text();
        console.log("[gemini.mjs] Received raw response text:", responseText);

        // Clean up the response text to handle potential markdown formatting
        responseText = responseText
            .replace(/```json\s*/g, '')  // Remove ```json  
            .replace(/```\s*/g, '')      // Remove remaining ```
            .trim();                     // Remove extra whitespace

        try {
            const quiz = JSON.parse(responseText);
            console.log("[gemini.mjs] Parsed JSON successfully.");
            return quiz;
        } catch (parseError) {
            console.error('[gemini.mjs] Failed to parse JSON response:', parseError, 'Raw text:', responseText);
            const detailedError = new Error(`Invalid JSON format received from Gemini: ${parseError.message}`);
            detailedError.rawContent = responseText;
            throw detailedError;
        }

    } catch (error) {
        console.error('[gemini.mjs] Error creating quiz:', error);
        // Ném lại lỗi để component có thể xử lý
        throw new Error(`Failed to create quiz via Gemini: ${error.message} `);
    }
}

// --- Sử dụng export default (ES Module) ---
export default createQuiz;
