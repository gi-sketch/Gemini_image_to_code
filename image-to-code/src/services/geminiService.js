import { GoogleGenerativeAI } from "@google/generative-ai";
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function generateCodeFromImage(imageFile) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  console.log("apikey",apiKey);
  
  const imageData = await fileToGenerativePart(imageFile);
  
  const prompt = `You are an expert frontend developer. Analyze this UI design/wireframe/sketch and generate clean, modern HTML code with Tailwind CSS.

Requirements:
- Use semantic HTML5 elements
- Use Tailwind CSS classes ONLY (no custom CSS)
- Make it fully responsive (mobile-first)
- Include proper spacing and typography
- Add realistic placeholder content where needed
- Use modern UI components (cards, buttons, forms) as shown
- Return ONLY the HTML code inside a body tag, no explanations

Generate complete, production-ready code:`;

  const result = await model.generateContent([prompt, imageData]);
  const response = await result.response;
  let code = response.text();
  
  code = code.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
  
  return code;
}

async function fileToGenerativePart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}