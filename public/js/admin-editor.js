/**
 * Premium Admin Rich Text Editor for portozaid CMS
 * Pure JavaScript, zero external dependencies, 100% offline compatible.
 */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form.admin-article-form');
  const hiddenTextarea = document.getElementById('article-content');
  const editorArea = document.getElementById('editor-area');
  const toolbar = document.getElementById('editor-toolbar');
  const wordCountDisplay = document.getElementById('editor-word-count');
  const readTimeDisplay = document.getElementById('editor-read-time');

  if (!editorArea || !hiddenTextarea) return;

  // 1. Initial content hydration
  let initialContent = hiddenTextarea.value || '';
  if (initialContent) {
    // If legacy plain text (no HTML tags), convert double newlines to paragraphs
    const hasHtml = /<\/?(p|h1|h2|h3|h4|ul|ol|li|blockquote|div|br)\b/i.test(initialContent);
    if (!hasHtml) {
      initialContent = initialContent
        .split(/\n{2,}/)
        .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
        .join('');
    }
    editorArea.innerHTML = initialContent;
  } else {
    editorArea.innerHTML = '<p><br></p>';
  }

  // Helper to sync editor content to hidden textarea
  function syncContent() {
    let html = editorArea.innerHTML;
    // Clean up empty trailing breaks or spaces
    if (html === '<p><br></p>' || html === '<p></p>') {
      html = '';
    }
    hiddenTextarea.value = html;
    updateStats();
  }

  // Update live statistics (word count and estimated reading time)
  function updateStats() {
    const text = (editorArea.innerText || '').trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 200));

    if (wordCountDisplay) wordCountDisplay.textContent = `${words} kata`;
    if (readTimeDisplay) readTimeDisplay.textContent = `~${minutes} menit baca`;
  }

  updateStats();

  // 2. Toolbar Actions
  toolbar.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-cmd]');
    if (!btn) return;

    e.preventDefault();
    editorArea.focus();

    const cmd = btn.getAttribute('data-cmd');
    const val = btn.getAttribute('data-val') || null;

    if (cmd === 'createLink') {
      handleLinkModal();
      return;
    }

    if (cmd === 'unlink') {
      document.execCommand('unlink', false, null);
      updateToolbarState();
      syncContent();
      return;
    }

    if (cmd === 'formatBlock') {
      // Check current block
      const currentBlock = getCurrentBlockTag();
      if (currentBlock === val.replace(/[<>]/g, '').toLowerCase()) {
        // Toggle back to paragraph if same
        document.execCommand('formatBlock', false, '<p>');
      } else {
        document.execCommand('formatBlock', false, val);
      }
    } else {
      document.execCommand(cmd, false, val);
    }

    updateToolbarState();
    syncContent();
  });

  // 3. Link Handler
  function handleLinkModal() {
    const selection = window.getSelection();
    let currentLink = null;
    let selectedText = '';

    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      selectedText = range.toString();
      let node = range.commonAncestorContainer;
      while (node && node !== editorArea) {
        if (node.nodeName === 'A') {
          currentLink = node;
          break;
        }
        node = node.parentNode;
      }
    }

    const currentUrl = currentLink ? currentLink.getAttribute('href') : '';
    const promptUrl = prompt('Masukkan URL tautan (contoh: https://linkedin.com atau /projects):', currentUrl || 'https://');
    
    if (promptUrl === null) return; // User cancelled
    
    let cleanUrl = promptUrl.trim();
    if (!cleanUrl) {
      if (currentLink) {
        document.execCommand('unlink', false, null);
      }
      syncContent();
      return;
    }

    // Security check: block javascript: or unsafe protocols
    if (/^javascript:/i.test(cleanUrl) || /^data:/i.test(cleanUrl)) {
      alert('Protokol URL tidak diizinkan demi keamanan.');
      return;
    }

    // Auto-prefix http if missing and not relative/anchor/mailto/tel
    if (!/^(https?:\/\/|\/|#|mailto:|tel:)/i.test(cleanUrl)) {
      cleanUrl = 'https://' + cleanUrl;
    }

    if (currentLink) {
      currentLink.setAttribute('href', cleanUrl);
      currentLink.setAttribute('target', '_blank');
      currentLink.setAttribute('rel', 'noopener noreferrer');
    } else {
      // If nothing selected, prompt for text
      if (!selectedText) {
        const linkText = prompt('Teks untuk tautan ini:', cleanUrl);
        if (linkText) {
          const a = document.createElement('a');
          a.href = cleanUrl;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.textContent = linkText;
          const range = selection.getRangeAt(0);
          range.insertNode(a);
          // Move cursor after
          range.setStartAfter(a);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } else {
        document.execCommand('createLink', false, cleanUrl);
        // Find created anchor to set target & rel
        const links = editorArea.querySelectorAll('a[href="' + cleanUrl + '"]');
        links.forEach(l => {
          l.setAttribute('target', '_blank');
          l.setAttribute('rel', 'noopener noreferrer');
        });
      }
    }

    updateToolbarState();
    syncContent();
  }

  // 4. Active Toolbar State Tracker
  function getCurrentBlockTag() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return 'p';
    let node = selection.getRangeAt(0).startContainer;
    while (node && node !== editorArea) {
      if (node.nodeType === 1) {
        const tag = node.nodeName.toLowerCase();
        if (['h1', 'h2', 'h3', 'h4', 'blockquote', 'p', 'ul', 'ol', 'li'].includes(tag)) {
          return tag;
        }
      }
      node = node.parentNode;
    }
    return 'p';
  }

  function updateToolbarState() {
    const commands = ['bold', 'italic', 'underline', 'insertUnorderedList', 'insertOrderedList'];
    commands.forEach(cmd => {
      const btn = toolbar.querySelector(`button[data-cmd="${cmd}"]`);
      if (btn) {
        try {
          if (document.queryCommandState(cmd)) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        } catch (e) {}
      }
    });

    const block = getCurrentBlockTag();
    ['<h2>', '<h3>', '<p>', '<blockquote>'].forEach(tag => {
      const btn = toolbar.querySelector(`button[data-val="${tag}"]`);
      if (btn) {
        const tagClean = tag.replace(/[<>]/g, '').toLowerCase();
        if (block === tagClean) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });

    // Check link state
    const linkBtn = toolbar.querySelector(`button[data-cmd="createLink"]`);
    const unlinkBtn = toolbar.querySelector(`button[data-cmd="unlink"]`);
    const selection = window.getSelection();
    let isInLink = false;
    if (selection.rangeCount) {
      let node = selection.getRangeAt(0).startContainer;
      while (node && node !== editorArea) {
        if (node.nodeName === 'A') {
          isInLink = true;
          break;
        }
        node = node.parentNode;
      }
    }
    if (linkBtn) linkBtn.classList.toggle('active', isInLink);
    if (unlinkBtn) unlinkBtn.style.display = isInLink ? 'inline-flex' : 'none';
  }

  // Listen to selection changes and typing
  document.addEventListener('selectionchange', () => {
    if (document.activeElement === editorArea || editorArea.contains(document.activeElement)) {
      updateToolbarState();
    }
  });

  editorArea.addEventListener('keyup', () => {
    updateToolbarState();
    syncContent();
  });

  editorArea.addEventListener('input', () => {
    syncContent();
  });

  // 5. Special Keyboard handling (Enter inside Headings creates a Paragraph)
  editorArea.addEventListener('keydown', (e) => {
    // Shortcuts: Cmd/Ctrl + B, I, U
    if (e.key === 'Enter' && !e.shiftKey) {
      const block = getCurrentBlockTag();
      if (['h2', 'h3'].includes(block)) {
        // Allow enter to finish heading and switch next block to <p>
        setTimeout(() => {
          const newBlock = getCurrentBlockTag();
          if (newBlock === block) {
            document.execCommand('formatBlock', false, '<p>');
          }
          syncContent();
        }, 10);
      }
    }
  });

  // 6. Clean Paste Handler: strips unwanted styles from Word/Docs while keeping semantics
  editorArea.addEventListener('paste', (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData || window.clipboardData;
    let html = clipboardData.getData('text/html');
    const text = clipboardData.getData('text/plain');

    if (html) {
      // Clean HTML: strip inline style, font, mso, class, id
      html = html
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/\s(style|class|face|color|size|mso-[^=]+|lang)="[^"]*"/gi, '')
        .replace(/\s(style|class|face|color|size|mso-[^=]+|lang)='[^']*'/gi, '')
        .replace(/<\/?(span|font|meta|link)\b[^>]*>/gi, '')
        // Clean empty paragraphs
        .replace(/<p>\s*(&nbsp;|\s)*\s*<\/p>/gi, '<p><br></p>');

      document.execCommand('insertHTML', false, html);
    } else if (text) {
      // If plain text, preserve paragraphs
      const formatted = text
        .split(/\r?\n\r?\n/)
        .map(p => `<p>${p.trim().replace(/\r?\n/g, '<br>')}</p>`)
        .join('');
      document.execCommand('insertHTML', false, formatted);
    }

    syncContent();
  });

  // 7. Ensure form submit captures exact HTML
  if (form) {
    form.addEventListener('submit', () => {
      syncContent();
    });
  }
});
