import { GoogleGenerativeAI } from '@google/generative-ai';

// Access your API key from environment
const genAI = new GoogleGenerativeAI('AIzaSyAnkmthgBT57AueLY5jN5b0tTbTXjDybqs');

async function test() {
  try {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      }
    });

    const prompt = "Write a short hello message.";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Success! Response:', text);
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
  }
}

test();