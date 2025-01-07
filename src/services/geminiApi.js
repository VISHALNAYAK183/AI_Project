// src/services/geminiApi.js
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Initialize the GoogleGenerativeAI client with your Gemini API key.
 * WARNING: This exposes your key in client-side code.
 */
const genAI = new GoogleGenerativeAI('AIzaSyD1RqVeSGdfzaSSsLEbcF07jYcF22BXcEE');

/**
 * Get a handle on the Gemini model you want: e.g. "gemini-1.5-flash".
 */
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Helper to build a prompt from the conversation + new question.
 */
function buildPrompt(question, conversation = [], sources = []) {
  let prompt = '';
  conversation.forEach((msg) => {
    if (msg.role === 'user') {
      prompt += `User: ${msg.content}\n`;
    } else {
      prompt += `Assistant: ${msg.content}\n`;
    }
  });

  if (sources.length > 0) {
    prompt += `Relevant Documents/Links: ${sources.join(', ')}\n`;
  }

  // End with the new question
  prompt += `User: ${question}\nAssistant:`;

  return prompt;
}

/**
 * geminiQa
 *   question: user’s question
 *   conversation: entire array of { role, content } for context
 *   sources: references to doc IDs, file names, or Google links
 *
 * Returns { data: { answer: string } } so you can do e.g. `response.data.answer`.
 */
export async function geminiQa(question, conversation, sources) {
  try {
    const prompt = buildPrompt(question, conversation, sources);
    const result = await model.generateContent(prompt);

    // The library returns an object with result.response?.text()
    const answerText = result.response?.text() || '';

    // Return the response in a similar format as axios
    return {
      data: {
        answer: answerText,
      },
    };
  } catch (error) {
    console.error('Error calling Gemini:', error);
    return {
      data: {
        answer: 'Error generating content.',
      },
    };
  }
}
