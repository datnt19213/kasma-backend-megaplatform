import { Injectable } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class ContentSanitizerService {
  private readonly defaultOptions: sanitizeHtml.IOptions = {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
      'pre', 'code', 'blockquote', 'hr', 'br',
      'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      'img': ['src', 'alt', 'width', 'height', 'loading'],
      'code': ['class'],
      'pre': ['class'],
      '*': ['id', 'class', 'style'] // Allow style for professional layout
    },
    allowedStyles: {
      '*': {
        'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i],
        'background-color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i],
        'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
        'font-size': [/^\d+(?:px|em|rem|%)$/]
      }
    },
    allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com']
  };

  /**
   * Sanitizes HTML content from untrusted sources (Frontend).
   * Prevents XSS and removes dangerous scripts/attributes.
   */
  sanitize(content: string): string {
    if (!content) return '';
    
    return sanitizeHtml(content, this.defaultOptions);
  }

  /**
   * Checks if content contains suspicious patterns beyond basic HTML sanitization.
   */
  isSuspicious(content: string): boolean {
    const suspiciousPatterns = [
      /<script\b[^>]*>([\s\S]*?)<\/script>/gim,
      /on\w+\s*=\s*["'][^"']*["']/gim, // event handlers like onclick
      /javascript:/gim,
      /expression\s*\(/gim
    ];

    return suspiciousPatterns.some(pattern => pattern.test(content));
  }
}
