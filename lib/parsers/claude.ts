import type { Conversation } from '@/types/conversation';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

/**
 * Extracts a Claude share page into a structured Conversation.
 */
export async function parseClaude(html: string): Promise<Conversation> {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Clean up elements first
  const miscElems = document.querySelectorAll('button, div[data-testid="message-warning"]');
  miscElems.forEach(button => button.remove());

  // Find container
  const chatContainer = document.querySelector('.flex-1.flex.flex-col.gap-3.px-4.max-w-3xl.mx-auto.w-full.pt-1');
  if (!chatContainer) {
    throw new Error('Conversation container not found');
  }

  chatContainer.querySelectorAll('pre, code').forEach(element => {
    (element as HTMLElement).style.textShadow = '';
  });

  // Read CSS separately and inject it directly into final HTML
  const cssPath = path.resolve(process.cwd(), 'lib/parsers/assets/claude.css');
  const css = fs.readFileSync(cssPath, 'utf-8');

  // Build final HTML
  const htmlContent = `
  <!DOCTYPE html>
  <html class="h-screen antialiased [font-feature-settings:'ss01'] scroll-smooth __variable_dcab32 __variable_820c23 __variable_b4db0f __variable_669e4a __variable_e4ce97 __variable_e4195f" lang="en-US" data-theme="claude" data-mode="light" data-build-id="41c59ae0d3" data-env="" style="--font-user-message: var(--font-sans-serif); --font-claude-message: var(--font-serif);">
    <head>
      <meta charset="utf-8">
      <style>
        ${css}
      </style>
    </head>
    <body class="bg-bg-100 text-text-100 font-ui min-h-screen" style="pointer-events: auto;" data-new-gr-c-s-check-loaded="14.1246.0" data-gr-ext-installed="" data-new-gr-c-s-loaded="14.1246.0">
      ${chatContainer.outerHTML}
    </body>
  </html>
  `;

  return {
    model: 'Claude',
    content: htmlContent,
    scrapedAt: new Date().toISOString(),
    sourceHtmlBytes: htmlContent.length,
  };
}
