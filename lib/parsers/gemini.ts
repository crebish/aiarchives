import type { Conversation } from '@/types/conversation';
import { JSDOM } from 'jsdom';

/**
 * Extracts a Gemini share page into a structured Conversation.
 */
export async function parseGemini(html: string): Promise<Conversation> {
  
  const dom = new JSDOM(html);
  const document = dom.window.document;

  //Remove all misc elements
  const miscElems = document.querySelectorAll('[class*="avatar-gutter"], [class*="response-container-header"], [class*="response-container-footer"]');
  miscElems.forEach(element => element.remove());

  //Grab the chat history container
  const chatHistory = document.querySelector('[data-test-id="chat-history-container"]')?.innerHTML ?? '';

  return {
    model: 'Gemini',
    content: chatHistory,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: chatHistory.length,
  };
}
