import type { Conversation } from '@/types/conversation';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

/**
 * Extracts a Copilot share page into a structured Conversation.
 * @param html - Raw HTML content from the Copilot share page
 * @returns Promise resolving to a structured Conversation object
 */
export async function parseCopilot(html: string): Promise<Conversation> {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Clean up elements first
  const miscElems = document.querySelectorAll('button');
  miscElems.forEach(button => button.remove());

  // Find container
  const chatContainer = document.querySelector('div[data-content="conversation"]');
  if (!chatContainer) {
    throw new Error('Conversation container not found');
  }

  // Make sure each conversation block is visible
  const hiddenDivs = chatContainer.querySelectorAll('div[style*="opacity: 0"]');
  hiddenDivs.forEach(div => {
    (div as HTMLElement).style.opacity = '1';
  });

  // Read CSS separately and inject it directly into final HTML
  const cssPath = path.resolve(process.cwd(), 'lib/parsers/assets/copilot.css');
  const css = fs.readFileSync(cssPath, 'utf-8');

  // Build final HTML
  const htmlContent = `
  <!DOCTYPE html>
  <html data-theme="light">
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
    model: 'Copilot',
    content: htmlContent,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: htmlContent.length,
  };
}
