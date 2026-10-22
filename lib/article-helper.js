const slugify = require('slugify');

/**
 * Whitelist-based HTML Sanitizer for Rich Text Articles
 * Strips script tags, unsafe protocols (javascript:), and disallowed tags/attributes.
 */
function sanitizeHtml(dirty) {
  if (!dirty || typeof dirty !== 'string') return '';

  // 1. Remove dangerous script, style, iframe, object, embed, form, meta, link tags and their contents
  let clean = dirty
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, ''); // remove comments

  // 2. Allowed tags
  const allowedTags = new Set([
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'b', 'em', 'i', 'u', 's', 'strike',
    'ul', 'ol', 'li', 'blockquote', 'a', 'br', 'hr',
    'code', 'pre', 'span', 'div', 'img', 'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tr', 'th', 'td'
  ]);

  // 3. Process every HTML tag
  clean = clean.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, tagName, attrs) => {
    const tag = tagName.toLowerCase();
    if (!allowedTags.has(tag)) {
      return ''; // Strip disallowed tag
    }

    const isClosing = match.startsWith('</');
    if (isClosing) {
      return `</${tag}>`;
    }

    // Parse attributes
    const safeAttrs = [];
    const attrRegex = /([a-z0-9_-]+)(?:\s*=\s*(?:'([^']*)'|"([^"]*)"|([^\s>]+)))?/gi;
    let attrMatch;

    while ((attrMatch = attrRegex.exec(attrs)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrValue = attrMatch[2] !== undefined ? attrMatch[2] : (attrMatch[3] !== undefined ? attrMatch[3] : attrMatch[4] || '');

      // Strictly drop any inline JS event handlers
      if (attrName.startsWith('on')) continue;

      if (tag === 'a' && attrName === 'href') {
        const trimmed = attrValue.trim();
        // Allow only safe protocols
        if (/^(https?:|\/|#|mailto:|tel:)/i.test(trimmed)) {
          safeAttrs.push(`href="${escapeAttr(trimmed)}"`);
        }
      } else if (tag === 'a' && attrName === 'target') {
        if (attrValue === '_blank') {
          safeAttrs.push('target="_blank"');
          safeAttrs.push('rel="noopener noreferrer"');
        }
      } else if (tag === 'img' && attrName === 'src') {
        const trimmed = attrValue.trim();
        if (/^(https?:|\/uploads\/|\/images\/|\/assets\/)/i.test(trimmed)) {
          safeAttrs.push(`src="${escapeAttr(trimmed)}"`);
        }
      } else if (tag === 'img' && ['alt', 'title', 'loading', 'width', 'height'].includes(attrName)) {
        safeAttrs.push(`${attrName}="${escapeAttr(attrValue)}"`);
      } else if (['id', 'class', 'title'].includes(attrName)) {
        // Safe alphanumeric class or ID
        const sanitizedVal = attrValue.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();
        if (sanitizedVal) {
          safeAttrs.push(`${attrName}="${sanitizedVal}"`);
        }
      }
    }

    // Ensure links with target="_blank" always have rel="noopener noreferrer"
    if (tag === 'a' && safeAttrs.some(a => a.includes('target="_blank"')) && !safeAttrs.some(a => a.startsWith('rel='))) {
      safeAttrs.push('rel="noopener noreferrer"');
    }

    const selfClosing = ['br', 'hr', 'img'].includes(tag);
    const attrString = safeAttrs.length > 0 ? ' ' + safeAttrs.join(' ') : '';
    return selfClosing ? `<${tag}${attrString} />` : `<${tag}${attrString}>`;
  });

  return clean;
}

function escapeAttr(val) {
  return String(val || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Converts legacy plain-text articles to structured HTML
 */
function plainTextToHtml(text) {
  if (!text) return '';

  const lines = text.split(/\r?\n/);
  const result = [];
  let inList = false;
  let listType = 'ul';
  let paragraphBuffer = [];

  function flushParagraph() {
    if (paragraphBuffer.length > 0) {
      const content = paragraphBuffer.join(' ').trim();
      if (content) {
        result.push(`<p>${content}</p>`);
      }
      paragraphBuffer = [];
    }
  }

  function flushList() {
    if (inList) {
      result.push(`</${listType}>`);
      inList = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    // Horizontal separator
    if (/^[-*_]{3,}$/.test(line)) {
      flushParagraph();
      flushList();
      result.push('<hr />');
      continue;
    }

    // Major Section Heading detection (e.g. "1. PKWT dan PKWTT...", "Penutup:...", "Referensi dan Sumber")
    const isNumberedHeading = /^\d+\.\s+[A-Z0-9\s:—\-,"'()\/]{4,}$/i.test(line) && line.length < 120;
    const isKeywordHeading = /^(Penutup|Kesimpulan|Referensi\s+dan\s+Sumber|Catatan|Latar\s+Belakang|Metodologi):/i.test(line);

    if (isNumberedHeading || isKeywordHeading) {
      flushParagraph();
      flushList();
      result.push(`<h2>${line}</h2>`);
      continue;
    }

    // Subheading or List item: "1). ..." or "1. ..." or "• ..." or "- ..."
    const numberedListItemMatch = line.match(/^(\d+[\.\)])\s+(.*)/);
    const bulletListItemMatch = line.match(/^[•\-\*]\s+(.*)/);

    if (numberedListItemMatch) {
      flushParagraph();
      if (!inList || listType !== 'ol') {
        flushList();
        inList = true;
        listType = 'ol';
        result.push('<ol>');
      }
      result.push(`<li>${numberedListItemMatch[2]}</li>`);
      continue;
    }

    if (bulletListItemMatch) {
      flushParagraph();
      if (!inList || listType !== 'ul') {
        flushList();
        inList = true;
        listType = 'ul';
        result.push('<ul>');
      }
      result.push(`<li>${bulletListItemMatch[1]}</li>`);
      continue;
    }

    // Regular line -> accumulate in paragraph
    paragraphBuffer.push(line);
  }

  flushParagraph();
  flushList();

  return result.join('\n');
}

/**
 * Process Article Content:
 * 1. Checks if HTML or plain text
 * 2. Sanitizes HTML
 * 3. Injects stable anchor IDs into H2 and H3 tags
 * 4. Extracts Table of Contents
 * 5. Computes word count & estimated reading time
 */
function processArticleContent(rawContent) {
  if (!rawContent) {
    return {
      html: '',
      headings: [],
      wordCount: 0,
      readingTime: 1
    };
  }

  // Detect if already HTML
  const hasHtml = /<\/?(p|h1|h2|h3|h4|ul|ol|li|blockquote|div|br)\b/i.test(rawContent);
  const baseHtml = hasHtml ? rawContent : plainTextToHtml(rawContent);

  // Sanitize
  const cleanHtml = sanitizeHtml(baseHtml);

  // Extract headings and inject IDs
  const headings = [];
  const usedIds = new Set();

  const processedHtml = cleanHtml.replace(/<(h[23])(\s+[^>]*)?>(.*?)<\/\1>/gi, (match, tag, attrs, text) => {
    // Strip inner HTML to get clean text for the TOC label
    const rawText = text.replace(/<[^>]+>/g, '').trim();
    if (!rawText) return match;

    // Check if ID already exists
    let id = '';
    const idMatch = attrs ? attrs.match(/\bid\s*=\s*["']([^"']+)["']/i) : null;
    if (idMatch && idMatch[1]) {
      id = idMatch[1];
    } else {
      let baseSlug = slugify(rawText, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g }) || 'section';
      id = baseSlug;
      let counter = 1;
      while (usedIds.has(id)) {
        id = `${baseSlug}-${counter++}`;
      }
    }

    usedIds.add(id);

    const level = tag.toLowerCase() === 'h2' ? 2 : 3;
    headings.push({
      id: id,
      text: rawText,
      level: level
    });

    // Clean existing id from attrs if any to prevent duplicate
    const cleanAttrs = attrs ? attrs.replace(/\bid\s*=\s*["'][^"']*["']/gi, '').trim() : '';
    const attrString = cleanAttrs ? ` ${cleanAttrs}` : '';

    return `<${tag} id="${id}"${attrString}>${text}</${tag}>`;
  });

  // Calculate word count & reading time
  const plainText = processedHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = plainText ? plainText.split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return {
    html: processedHtml,
    headings: headings,
    wordCount: wordCount,
    readingTime: readingTime
  };
}

module.exports = {
  sanitizeHtml,
  plainTextToHtml,
  processArticleContent
};
