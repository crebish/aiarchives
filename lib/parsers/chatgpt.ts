import type { Conversation } from '@/types/conversation';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

/**
 * Extracts a ChatGPT share page into a structured Conversation.
 */
export async function parseChatGPT(html: string): Promise<Conversation> {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Clean up elements first
  const miscElems = document.querySelectorAll('button');
  miscElems.forEach(button => button.remove());

  // Find container
  const chatContainer = document.querySelector('div[class*="pb-25"]');
  if (!chatContainer) {
    throw new Error('Conversation container not found');
  }

  // Ensure all divs are using light mode
  const darkElements = chatContainer.querySelectorAll('.dark');
  darkElements.forEach(element => {
    element.classList.remove('dark');
    element.classList.add('light');
  });

  // Read CSS separately and inject it directly into final HTML
  const cssPath = path.resolve(process.cwd(), 'lib/parsers/assets/chatgpt.css');
  const css = fs.readFileSync(cssPath, 'utf-8');

  // Build final HTML
  const htmlContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <style>
        ${css}
      </style>
    </head>
    <body>
      ${chatContainer.outerHTML}
    </body>
  </html>
  `;

  return {
    model: 'ChatGPT',
    content: htmlContent,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: htmlContent.length,
  };
}
