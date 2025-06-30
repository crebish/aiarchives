import type { Conversation } from '@/types/conversation';
import { JSDOM } from 'jsdom';

/**
 * Extracts a Gemini share page into a structured Conversation.
 */
export async function parseGemini(html: string): Promise<Conversation> {
  
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Grab the document styling
  const styleTags = document.head.querySelectorAll('style');
  let combinedStyles = '';
  
  styleTags.forEach(styleTag => {
    styleTag.textContent = "html{overflow:scroll}" + styleTag.textContent;
    combinedStyles += styleTag.outerHTML + '\n';
  });

  const style = document.createElement("style");
  style.textContent = combinedStyles;

  // Remove all misc elements
  const miscElems = document.querySelectorAll('sources-list, mat-icon, [class*="actions-container-v2"]');
  miscElems.forEach(element => element.remove());

  // Grab the chat history container
  const chatHistory = document.querySelector('[data-test-id="chat-history-container"]')

  // Add the styling to the container
  if (chatHistory !== null) {
    chatHistory.prepend(style);
  }

  const chat = chatHistory?.innerHTML ?? "";

  return {
    model: 'Gemini',
    content: chat,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: chat.length,
  };
}
