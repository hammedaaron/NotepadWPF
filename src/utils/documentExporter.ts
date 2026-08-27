import { NotepadDocument } from '../types';

export type ExportFormat = 
  | 'txt' 
  | 'md' 
  | 'html' 
  | 'standalone-html' 
  | 'json' 
  | 'doc' 
  | 'csv' 
  | 'rtf';

/**
 * Universal Document Exporter supporting all common formats
 * and interactive standalone HTML that retains frames and nested pages
 */
export function exportDocument(
  doc: NotepadDocument, 
  format: ExportFormat
) {
  const fileName = (doc.title || 'Untitled').trim().replace(/[/\\?%*:|"<>]/g, '_');
  let blob: Blob;
  let extension: string = format;

  switch (format) {
    case 'md': {
      // Convert HTML content / plainText to Markdown
      let mdText = doc.plainText || '';
      
      // If doc has frames or subpages, append them nicely
      if (doc.frameDecks && doc.frameDecks.length > 0) {
        mdText += '\n\n---\n## Interactive Frame Decks\n';
        doc.frameDecks.forEach(deck => {
          mdText += `\n### Frame Deck: ${deck.title}\n`;
          deck.frames.forEach((item, idx) => {
            mdText += `\n#### Slide ${idx + 1}: ${item.title}\n${item.plainText || item.content}\n`;
          });
        });
      }

      if (doc.subpages) {
        const subpageList = Object.values(doc.subpages);
        if (subpageList.length > 0) {
          mdText += '\n\n---\n## Nested Pages\n';
          subpageList.forEach(sub => {
            mdText += `\n### 📄 ${sub.title}\n${sub.plainText || sub.content}\n`;
          });
        }
      }

      blob = new Blob([mdText], { type: 'text/markdown;charset=utf-8' });
      extension = 'md';
      break;
    }

    case 'html': {
      // Clean HTML document
      const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(doc.title || 'Document')}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #222; }
    h1, h2, h3 { font-family: "Segoe UI Variable Display", -apple-system, sans-serif; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #f4f4f5; }
    .apple-callout { border-left: 3px solid #3b82f6; padding: 12px 16px; margin: 16px 0; background: #f8fafc; }
    pre { background: #f1f5f9; padding: 12px; border-radius: 6px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>${escapeHtml(doc.title || 'Untitled')}</h1>
  ${doc.content}
</body>
</html>`;
      blob = new Blob([htmlBody], { type: 'text/html;charset=utf-8' });
      extension = 'html';
      break;
    }

    case 'standalone-html': {
      // Interactive Standalone HTML that runs in any browser with toggleable frames & subpages!
      const subpages = doc.subpages ? Object.values(doc.subpages) : [];
      const subpagesHtml = subpages.map((sub, i) => `
        <details style="margin: 12px 0; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
          <summary style="font-weight: 600; cursor: pointer; color: #0284c7;">📄 ${escapeHtml(sub.title || `Page ${i+1}`)}</summary>
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #f1f5f9;">
            ${sub.content}
          </div>
        </details>
      `).join('');

      const frameDecks = doc.frameDecks || [];
      const framesHtml = frameDecks.map(deck => `
        <div style="margin: 20px 0; padding: 16px; border: 1px solid #cbd5e1; border-radius: 10px; background: #f8fafc;">
          <div style="font-weight: 700; font-size: 16px; margin-bottom: 12px; color: #1e293b;">🖼️ Deck: ${escapeHtml(deck.title)}</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
            ${deck.frames.map((item, idx) => `
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
                <div style="font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 4px;">Slide ${idx + 1}: ${escapeHtml(item.title)}</div>
                <div style="font-size: 14px;">${item.content}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');

      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(doc.title || 'Interactive Document')} - Notepad-XR</title>
  <style>
    :root { color-scheme: light dark; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI Variable Text", "Segoe UI", Roboto, sans-serif; 
      line-height: 1.6; 
      max-width: 860px; 
      margin: 40px auto; 
      padding: 0 24px; 
      color: #1e293b;
      background: #fdfdfd;
    }
    @media (prefers-color-scheme: dark) {
      body { background: #121212; color: #e2e8f0; }
      details { background: #1e1e1e !important; border-color: #333 !important; }
      div[style*="background: #f8fafc"] { background: #1a1a1a !important; border-color: #333 !important; }
      div[style*="background: #ffffff"] { background: #242424 !important; border-color: #3a3a3a !important; color: #e2e8f0 !important; }
      th { background: #262626 !important; }
      td, th { border-color: #383838 !important; }
    }
    h1 { font-size: 2.2rem; font-weight: 700; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; background: #e0f2fe; color: #0369a1; font-weight: 600; margin-bottom: 24px; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; }
    .apple-callout { border-left: 4px solid #0284c7; padding: 14px 18px; margin: 16px 0; background: rgba(2, 132, 199, 0.05); border-radius: 0 6px 6px 0; }
    pre { background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; font-family: "Cascadia Code", Consolas, monospace; }
  </style>
</head>
<body>
  <div class="badge">Created with Notepad-XR • Standalone Interactive Document</div>
  <h1>${escapeHtml(doc.title || 'Untitled')}</h1>
  <div class="content-body">
    ${doc.content}
  </div>

  ${framesHtml ? `
    <h2 style="margin-top: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Interactive Frame Decks</h2>
    ${framesHtml}
  ` : ''}

  ${subpagesHtml ? `
    <h2 style="margin-top: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Nested Sub-pages (Click to expand)</h2>
    ${subpagesHtml}
  ` : ''}

  <footer style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; opacity: 0.6; text-align: center;">
    Exported from <strong>Notepad-XR</strong> • Powered by HAMST✧R
  </footer>
</body>
</html>`;
      blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
      extension = 'interactive.html';
      break;
    }

    case 'doc': {
      // Microsoft Word compatible HTML document
      const wordHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${escapeHtml(doc.title || 'Document')}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; }
    h1 { font-size: 18pt; color: #1f497d; }
    h2 { font-size: 14pt; color: #1f497d; }
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid #7f7f7f; padding: 6px; }
    th { background: #d9d9d9; }
  </style>
</head>
<body>
  <h1>${escapeHtml(doc.title || 'Untitled')}</h1>
  ${doc.content}
</body>
</html>`;
      blob = new Blob(['\ufeff' + wordHtml], { type: 'application/msword' });
      extension = 'doc';
      break;
    }

    case 'json': {
      // Complete backup of the document object with subpages and frames intact
      const jsonStr = JSON.stringify(doc, null, 2);
      blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      extension = 'json';
      break;
    }

    case 'csv': {
      // Export as CSV (if table exists or plain lines)
      const lines = (doc.plainText || '').split('\n');
      const csvContent = lines.map(line => `"${line.replace(/"/g, '""')}"`).join('\n');
      blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      extension = 'csv';
      break;
    }

    case 'rtf': {
      const plain = (doc.plainText || doc.content).replace(/\\/g, '\\\\').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
      const rtfText = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Calibri;}}\\f0\\fs22 ${plain.replace(/\n/g, '\\par\n')}}`;
      blob = new Blob([rtfText], { type: 'application/rtf' });
      extension = 'rtf';
      break;
    }

    case 'txt':
    default: {
      const text = doc.plainText || doc.content;
      blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      extension = 'txt';
      break;
    }
  }

  // Trigger download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
