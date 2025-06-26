
import { GoogleGenerativeAI } from "@google/generative-ai";
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error('NEXT_PUBLIC_GOOGLE_API_KEY is missing. Check your .env.local file and ensure it is loaded correctly by Next.js.');
}
// Khởi tạo Google AI Client 
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // Hoặc "gemini-1.5-pro"
});
// Cấu hình
const generationConfig = {
  temperature: 0.7, //mức độ sáng tạo/ ngẫu nhiên của AI
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};
// Định nghĩa các loại quiz
const QUIZ_TYPES = {
  READING: 'reading',
  DIALOGUE_REORDERING: 'dialogue_reordering',
  TRANSLATION: 'translation',
  EQUIVALENT: 'equivalent'
};
// Chuyển PROMPTS thành hàm để nhận subtitle
const getPrompt = (quizType, subtitle) => {
  const prompts = {
    [QUIZ_TYPES.READING]: `
        Bạn là một giáo viên luyện thi TOEIC chuyên nghiệp.
        
        Dưới đây là nội dung phụ đề phim:
        
        [START OF MOVIE SUBTITLES]
        ${subtitle}
        [END OF MOVIE SUBTITLES]
        
        ===> Nhiệm vụ:
        Tạo 5 bài đọc hiểu tiếng anh theo dạng TOEIC Part 7:
        - Mỗi bài là một đoạn văn tóm tắt nội dung phim (khoảng 300 đến 350 từ)
        - Mỗi bài có 5 câu hỏi trắc nghiệm bằng tiếng anh
        - Trong 5 câu hỏi, bắt buộc phải có ít nhất 1 câu hỏi về từ đồng nghĩa (synonym) với format:
          * Câu hỏi: "The word 'X' in line Y, paragraph Z is closest in meaning to"
          * 4 lựa chọn là các từ/cụm từ tiếng Anh có nghĩa tương đương
          * Đáp án đúng và giải thích chi tiết
          * Trích dẫn câu chứa từ đó từ phụ đề
        - Các câu hỏi còn lại có thể là:
          * Câu hỏi về ý chính
          * Câu hỏi về chi tiết
          * Câu hỏi về suy luận
          * Câu hỏi về từ vựng khác

        ===> Output format:
        TRẢ VỀ DUY NHẤT MỘT MẢNG JSON KHÔNG CÓ BẤT KỲ KÝ TỰ ĐẶC BIỆT NÀO KHÁC.
        KHÔNG THÊM \`\`\`json, \`\`\` HOẶC BẤT KỲ ĐỊNH DẠNG MARKDOWN NÀO.
        KHÔNG THÊM BẤT KỲ CHÚ THÍCH HOẶC VĂN BẢN NÀO KHÁC.

        [
          {
            "passage": "Đoạn văn bài đọc 5",
            "questions": [
              {
                "question": "The word 'determined' in line 3, paragraph 1 is closest in meaning to",
                "options": ["A. decided", "B. confused", "C. worried", "D. excited"],
                "answer": "A",
                "explanation": "Trong ngữ cảnh này, 'determined' có nghĩa là 'đã quyết định' (decided), thể hiện sự kiên định trong quyết định của nhân vật",
                "quote": "Trích dẫn từ phụ đề liên quan"
              },
              {
                "question": "Câu hỏi thông thường khác?",
                "options": ["A. Lựa chọn A", "B. Lựa chọn B", "C. Lựa chọn C", "D. Lựa chọn D"],
                "answer": "B",
                "explanation": "Giải thích tại sao B là đáp án đúng",
                "quote": "Trích dẫn từ phụ đề liên quan"
              }
            ]
          }
        ]
    `,

    [QUIZ_TYPES.DIALOGUE_REORDERING]: `
        Bạn là một giáo viên luyện thi TOEIC chuyên nghiệp.
        
        Dưới đây là nội dung phụ đề phim:
        
        [START OF MOVIE SUBTITLES]
        ${subtitle}
        [END OF MOVIE SUBTITLES]
        
        ===> Nhiệm vụ:
        Tạo 5 bài tập sắp xếp hội thoại:
        - Mỗi bài là một đoạn hội thoại hoàn chỉnh từ phim (khoảng 5-7 câu) giữa 2 người trở lên
        - Các đoạn hội thoại phải:
          + Dựa trên nội dung từ phim nhưng được viết lại để tự nhiên và hấp dẫn hơn
          + Thêm các yếu tố giao tiếp tự nhiên như:
            * Các từ nối (well, actually, you know...)
            * Các câu cảm thán ngắn (Really? Wow! That's amazing!)
            * Các câu hỏi đuôi
            * Các phản ứng tự nhiên
          + Giữ nguyên bối cảnh và ý chính của cuộc trò chuyện trong phim
          + Có thể thêm một vài câu mở đầu hoặc kết thúc để làm rõ ngữ cảnh
          + Đảm bảo tính logic và mạch lạc trong cuộc trò chuyện
          + Sử dụng tiếng Anh chuẩn, phù hợp với trình độ TOEIC
          + Tránh các từ lóng, tiếng lóng, hoặc cách diễn đạt quá phức tạp
          + Đảm bảo ngữ pháp chính xác và tự nhiên
        - Mỗi câu trong hội thoại phải được đánh số thứ tự (1, 2, 3, 4, 5...)
        - Đảo lộn thứ tự các câu trong hội thoại
        - Tạo 5 câu hỏi trắc nghiệm để kiểm tra thứ tự đúng của hội thoại
        - Mỗi câu hỏi bao gồm: câu hỏi, 4 lựa chọn là các số thứ tự (ví dụ: "A. 2,1,3,4,5", "B. 1,2,3,4,5", "C. 3,2,1,4,5", "D. 1,3,2,4,5"), đáp án đúng, giải thích

        ===> Output format:
        TRẢ VỀ DUY NHẤT MỘT MẢNG JSON KHÔNG CÓ BẤT KỲ KÝ TỰ ĐẶC BIỆT NÀO KHÁC.
        KHÔNG THÊM \`\`\`json, \`\`\` HOẶC BẤT KỲ ĐỊNH DẠNG MARKDOWN NÀO.
        KHÔNG THÊM BẤT KỲ CHÚ THÍCH HOẶC VĂN BẢN NÀO KHÁC.

        [
          {
            "passage": "1. Emma: You know, my dad actually rebuilt this entire place from scratch.\n2. James: Wait, really? Your dad did all of this?\n3. Emma: Yeah! Can you believe it? He did everything with his own hands - every single brick and board.\n4. James: Wow, that's incredible! He must be really skilled.\n5. Emma: Well, it wasn't easy. When he first found it, the place was practically in ruins.",
            "questions": [
              {
                "question": "Sắp xếp các câu hội thoại theo thứ tự đúng:",
                "options": ["A. 2,1,3,4,5", "B. 1,2,3,4,5", "C. 3,2,1,4,5", "D. 1,3,2,4,5"],
                "answer": "B",
                "explanation": "Giải thích tại sao thứ tự 1,2,3,4,5 là đúng",
                "quote": "Trích dẫn từ phụ đề liên quan"
              }
            ]
          }
        ]
    `,

    [QUIZ_TYPES.TRANSLATION]: `
        Bạn là một giáo viên luyện thi TOEIC chuyên nghiệp.
        
        Dưới đây là nội dung phụ đề phim:
        
        [START OF MOVIE SUBTITLES]
        ${subtitle}
        [END OF MOVIE SUBTITLES]
        
        ===> Nhiệm vụ:
        Tạo 5 bài tập dịch câu:
        - Mỗi bài là một câu tiếng Anh từ phim
        - Tạo 4 lựa chọn dịch tiếng Việt, trong đó có 1 đáp án đúng
        - Mỗi câu hỏi bao gồm: câu tiếng Anh, 4 lựa chọn dịch tiếng Việt, đáp án đúng, giải thích

        ===> Output format:
        TRẢ VỀ DUY NHẤT MỘT MẢNG JSON KHÔNG CÓ BẤT KỲ KÝ TỰ ĐẶC BIỆT NÀO KHÁC.
        KHÔNG THÊM \`\`\`json, \`\`\` HOẶC BẤT KỲ ĐỊNH DẠNG MARKDOWN NÀO.
        KHÔNG THÊM BẤT KỲ CHÚ THÍCH HOẶC VĂN BẢN NÀO KHÁC.

        [
          {
            "passage": null,
            "questions": [
              {
                "question": "Dịch câu sau: 'I have been waiting for you for hours.'",
                "options": ["A. Tôi đã đợi bạn nhiều giờ", "B. Tôi đang đợi bạn nhiều giờ", "C. Tôi sẽ đợi bạn nhiều giờ", "D. Tôi đã đợi bạn"],
                "answer": "A",
                "explanation": "Giải thích về thì và cách dịch",
                "quote": "I have been waiting for you for hours."
              }
            ]
          }
        ]
    `,

    [QUIZ_TYPES.EQUIVALENT]: `
        Bạn là một giáo viên luyện thi TOEIC chuyên nghiệp.
        
        Dưới đây là nội dung phụ đề phim:
        
        [START OF MOVIE SUBTITLES]
        ${subtitle}
        [END OF MOVIE SUBTITLES]
        
        ===> Nhiệm vụ:
        Tạo 5 bài tập chọn câu tương đương:
        - Mỗi bài là một câu tiếng Việt từ phim
        - Tạo 4 lựa chọn câu tiếng Anh tương đương, trong đó có 1 đáp án đúng
        - Mỗi câu hỏi bao gồm: câu tiếng Việt, 4 lựa chọn tiếng Anh, đáp án đúng, giải thích

        ===> Output format:
        TRẢ VỀ DUY NHẤT MỘT MẢNG JSON KHÔNG CÓ BẤT KỲ KÝ TỰ ĐẶC BIỆT NÀO KHÁC.
        KHÔNG THÊM \`\`\`json, \`\`\` HOẶC BẤT KỲ ĐỊNH DẠNG MARKDOWN NÀO.
        KHÔNG THÊM BẤT KỲ CHÚ THÍCH HOẶC VĂN BẢN NÀO KHÁC.

        [
          {
            "passage": null,
            "questions": [
              {
                "question": "Chọn câu tiếng Anh tương đương với: 'Tôi đã đợi bạn nhiều giờ.'",
                "options": ["A. I am waiting for you for hours", "B. I have been waiting for you for hours", "C. I will wait for you for hours", "D. I waited for you for hours"],
                "answer": "B",
                "explanation": "Giải thích về thì và cách dịch",
                "quote": "Tôi đã đợi bạn nhiều giờ."
              }
            ]
          }
        ]
    `
  };
  return prompts[quizType];
};
async function createQuiz(subtitle, quizType = QUIZ_TYPES.READING) {
  try {
    // Lấy prompt tương ứng với quiz type
    const prompt = getPrompt(quizType, subtitle);
    const chatSession = model.startChat({
      generationConfig,
      history: [], // không truyền lịch sử chat cũ
    });
    const result = await chatSession.sendMessage(prompt);
    let responseText = result.response.text();
    // Xóa tất cả các đoạn mở đầu ```json (hoặc ```json kèm khoảng trắng/newline) trong chuỗi
    responseText = responseText
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    try {
      const quiz = JSON.parse(responseText);
      return quiz;
    } catch (parseError) {
      console.log("Lỗi:" + parseError)
    }
  } catch (error) {
    throw new Error(`Lỗi tạo quizz: ${error.message}`);
  }
}
export { QUIZ_TYPES };
export default createQuiz;
