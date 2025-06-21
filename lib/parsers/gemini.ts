import type { Conversation } from '@/types/conversation';
import { JSDOM } from 'jsdom';

/**
 * Extracts a Gemini share page into a structured Conversation.
 */
export async function parseGemini(html: string): Promise<Conversation> {
  
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const chatHistory = document.querySelector('[data-test-id="chat-history-container"]')?.innerHTML ?? '';

  return {
    model: 'Gemini',
    content: chatHistory,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: chatHistory.length,
  };
}
