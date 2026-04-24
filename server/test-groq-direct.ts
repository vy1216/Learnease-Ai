import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function testGroq() {
  try {
    console.log('[TEST] Calling Groq with model: llama-3.1-8b-instant');
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Hello, can you respond?' }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 100,
    });
    console.log('[SUCCESS] Groq response:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.log('[ERROR] Full error object:', error);
    if (error instanceof Error) {
      console.log('[ERROR] Message:', error.message);
      console.log('[ERROR] Name:', error.name);
      console.log('[ERROR] Stack:', error.stack);
    }
  }
  process.exit(0);
}

testGroq();
