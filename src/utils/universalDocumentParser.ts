import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

export interface DocumentParseResult {
  title: string;
  content: string; // HTML format for rich rendering
  plainText: string;
  fileType: 'plain' | 'rich' | 'markdown';
}

/**
 * Universal document loader that supports virtually all common document formats:
 * - Plain text / code: .txt, .md, .markdown, .js, .ts, .jsx, .tsx, .json, .csv, .xml, .html, .css, .py, .java, .cpp, .c, .sh, .bat, .yml, .yaml, .ini, .log, .sql, etc.
 * - Microsoft Word: .docx, .doc (via arrayBuffer text extraction)
 * - Adobe PDF: .pdf (via pdfjs-dist)
 * - Spreadsheets: .xlsx, .xls, .csv, .ods (via XLSX -> HTML table)
 * - Rich Text / Web: .rtf, .htm, .html
 */
export async function parseDocumentFile(file: File): Promise<DocumentParseResult> {
  const fileName = file.name;
  const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  const baseTitle = fileName.replace(/\.[^/.]+$/, "");

  try {
    // 1. Microsoft Word (.docx)
    if (extension === '.docx') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const rawTextResult = await mammoth.extractRawText({ arrayBuffer });
      return {
        title: baseTitle,
        content: result.value || `<p>${rawTextResult.value}</p>`,
        plainText: rawTextResult.value || '',
        fileType: 'rich'
      };
    }

    // 2. Spreadsheets (.xlsx, .xls, .csv, .ods)
    if (['.xlsx', '.xls', '.ods', '.tsv'].includes(extension)) {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      let htmlTables = '';
      let textContent = '';

      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const sheetHtml = XLSX.utils.sheet_to_html(worksheet);
        const sheetCsv = XLSX.utils.sheet_to_csv(worksheet);
        htmlTables += `<h3>Sheet: ${sheetName}</h3>` + sheetHtml + '<br/>';
        textContent += `--- Sheet: ${sheetName} ---\n` + sheetCsv + '\n\n';
      });

      return {
        title: baseTitle,
        content: htmlTables,
        plainText: textContent,
        fileType: 'rich'
      };
    }

    // 3. Adobe PDF (.pdf)
    if (extension === '.pdf') {
      try {
        const pdfjs = await import('pdfjs-dist');
        // Set worker source or disable worker for direct parsing
        if (pdfjs.GlobalWorkerOptions) {
          pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '3.11.174'}/pdf.worker.min.js`;
        }
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = '';
        let fullHtml = `<h2>${baseTitle} (PDF Document)</h2>`;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageStrings = textContent.items.map((item: any) => item.str).join(' ');
          fullText += `--- Page ${pageNum} ---\n` + pageStrings + '\n\n';
          fullHtml += `<div class="pdf-page" style="margin-bottom: 16px; padding: 10px; border-bottom: 1px dashed #666;"><strong>Page ${pageNum}</strong><p>${pageStrings}</p></div>`;
        }

        return {
          title: baseTitle,
          content: fullHtml,
          plainText: fullText,
          fileType: 'rich'
        };
      } catch (pdfErr) {
        console.warn('PDF specialized parse error, falling back to text stream:', pdfErr);
        const rawText = await file.text();
        return {
          title: baseTitle,
          content: `<pre>${escapeHtml(rawText)}</pre>`,
          plainText: rawText,
          fileType: 'plain'
        };
      }
    }

    // 4. RTF (Rich Text Format)
    if (extension === '.rtf') {
      const text = await file.text();
      // Basic RTF strip or display
      const stripped = text.replace(/\\([a-z]{1,32})(-?[0-9]{1,10})?[ ]?|[\{\}]|\\\n/g, ' ').replace(/\s+/g, ' ').trim();
      return {
        title: baseTitle,
        content: `<p>${escapeHtml(stripped || text)}</p>`,
        plainText: stripped || text,
        fileType: 'rich'
      };
    }

    // 5. HTML / Web pages (.html, .htm, .svg)
    if (['.html', '.htm'].includes(extension)) {
      const htmlText = await file.text();
      // Extract body if present
      const match = htmlText.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      const bodyContent = match ? match[1] : htmlText;
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = bodyContent;
      return {
        title: baseTitle,
        content: bodyContent,
        plainText: tempDiv.innerText || '',
        fileType: 'rich'
      };
    }

    // 6. Markdown (.md, .markdown)
    if (['.md', '.markdown'].includes(extension)) {
      const mdText = await file.text();
      // Convert markdown line formatting to basic HTML preview
      const lines = mdText.split('\n');
      let html = '';
      lines.forEach(line => {
        if (line.startsWith('# ')) html += `<h1>${escapeHtml(line.slice(2))}</h1>`;
        else if (line.startsWith('## ')) html += `<h2>${escapeHtml(line.slice(3))}</h2>`;
        else if (line.startsWith('### ')) html += `<h3>${escapeHtml(line.slice(4))}</h3>`;
        else if (line.startsWith('- ') || line.startsWith('* ')) html += `<li>${escapeHtml(line.slice(2))}</li>`;
        else if (line.trim() === '') html += '<p></p>';
        else html += `<p>${escapeHtml(line)}</p>`;
      });
      return {
        title: baseTitle,
        content: html,
        plainText: mdText,
        fileType: 'markdown'
      };
    }

    // 7. JSON
    if (extension === '.json') {
      const jsonText = await file.text();
      let formatted = jsonText;
      try {
        formatted = JSON.stringify(JSON.parse(jsonText), null, 2);
      } catch (e) {}
      return {
        title: baseTitle,
        content: `<pre style="font-family: monospace; tab-size: 2;">${escapeHtml(formatted)}</pre>`,
        plainText: formatted,
        fileType: 'plain'
      };
    }

    // 8. Universal Plain Text / Code / Other formats
    // .txt, .csv, .xml, .yaml, .yml, .ini, .log, .sql, .js, .ts, .py, .java, .cpp, .c, .h, .cs, .go, .rs, .php, .rb, .sh, .bat, etc.
    const rawText = await file.text();
    const formattedHtml = rawText
      .split('\n')
      .map(line => `<p>${escapeHtml(line) || '&nbsp;'}</p>`)
      .join('');

    return {
      title: baseTitle,
      content: formattedHtml,
      plainText: rawText,
      fileType: 'plain'
    };
  } catch (error) {
    console.error('Error reading document:', error);
    // Fallback: read raw text
    const fallbackText = await file.text().catch(() => 'Unable to read binary contents.');
    return {
      title: baseTitle,
      content: `<pre>${escapeHtml(fallbackText)}</pre>`,
      plainText: fallbackText,
      fileType: 'plain'
    };
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
