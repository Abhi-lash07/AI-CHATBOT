import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

/**
 * CodeBlock sub-component with language badge, copy button, and syntax highlight formatting
 */
function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Basic syntax highlighter helper for common keywords/strings/comments in code blocks
  const renderHighlightedCode = (rawCode) => {
    const lines = rawCode.split('\n');
    return lines.map((line, lIdx) => {
      // Highlight comments
      if (line.trim().startsWith('#') || line.trim().startsWith('//')) {
        return (
          <div key={lIdx} className="text-[#64748B] dark:text-[#71717A] italic">
            {line || ' '}
          </div>
        );
      }
      return (
        <div key={lIdx} className="leading-relaxed">
          {line || ' '}
        </div>
      );
    });
  };

  return (
    <div className="my-4 rounded-2xl overflow-hidden border border-[#E2E8F0] dark:border-[#293247] bg-[#0E1526] dark:bg-[#0B1020] shadow-md">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/90 dark:bg-[#151C2C] border-b border-[#E2E8F0] dark:border-[#293247] text-xs font-mono text-[#64748B] dark:text-[#9CA3AF]">
        <span className="uppercase tracking-wider font-semibold text-[#6366F1] dark:text-[#818CF8]">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-[#111827] dark:text-[#F3F4F6] hover:bg-slate-200 dark:hover:bg-[#1E293B] border border-transparent hover:border-[#E2E8F0] dark:hover:border-[#293247] transition-all"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm font-mono text-slate-100 dark:text-[#E2E8F0] leading-relaxed selection:bg-indigo-600/40">
        <pre className="m-0 font-mono">
          <code>{renderHighlightedCode(code)}</code>
        </pre>
      </div>
    </div>
  );
}

/**
 * Lightweight & robust MarkdownRenderer for AI responses
 */
export function MarkdownRenderer({ content = '' }) {
  if (!content) return null;

  // Split content into code blocks vs regular text
  const blocks = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({
        type: 'text',
        content: content.slice(lastIndex, match.index),
      });
    }
    blocks.push({
      type: 'code',
      language: match[1] || 'plaintext',
      code: match[2].trimEnd(),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    blocks.push({
      type: 'text',
      content: content.slice(lastIndex),
    });
  }

  return (
    <div className="markdown-content text-[#111827] dark:text-[#F3F4F6] leading-[1.7] space-y-3.5 font-sans">
      {blocks.map((block, idx) => {
        if (block.type === 'code') {
          return <CodeBlock key={idx} code={block.code} language={block.language} />;
        }
        return <TextRenderer key={idx} text={block.content} />;
      })}
    </div>
  );
}

/**
 * Parses markdown lines (headings, blockquotes, lists, tables, paragraphs)
 */
function TextRenderer({ text }) {
  const lines = text.split('\n');
  const elements = [];
  let currentList = null;
  let listType = null; // 'ul' | 'ol'
  let currentTable = null;

  const flushList = () => {
    if (currentList && currentList.length > 0) {
      if (listType === 'ol') {
        elements.push(
          <ol key={`ol-${elements.length}`} className="list-decimal pl-6 my-3 space-y-1.5">
            {currentList.map((item, i) => (
              <li key={i} className="leading-[1.7]">
                <InlineRenderer line={item} />
              </li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc pl-6 my-3 space-y-1.5">
            {currentList.map((item, i) => (
              <li key={i} className="leading-[1.7]">
                <InlineRenderer line={item} />
              </li>
            ))}
          </ul>
        );
      }
      currentList = null;
      listType = null;
    }
  };

  const flushTable = () => {
    if (currentTable && currentTable.length > 0) {
      const [header, separator, ...rows] = currentTable;
      const parseRow = (r) =>
        r
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());

      const headers = parseRow(header);

      elements.push(
        <div key={`table-${elements.length}`} className="my-4 overflow-x-auto rounded-2xl border border-[#E2E8F0] dark:border-[#293247] shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[#F8FAFC] dark:bg-[#151C2C] font-semibold text-[#111827] dark:text-[#F3F4F6]">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="px-4 py-2.5 border-b border-[#E2E8F0] dark:border-[#293247]">
                    <InlineRenderer line={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#293247] bg-white dark:bg-[#0B1020]">
              {rows.map((row, rIdx) => {
                const cells = parseRow(row);
                return (
                  <tr key={rIdx} className="hover:bg-[#F8FAFC] dark:hover:bg-[#151C2C]/60 transition-colors">
                    {cells.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-2.5 text-[#111827] dark:text-[#F3F4F6]">
                        <InlineRenderer line={cell} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      currentTable = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      flushList();
      flushTable();
      continue;
    }

    // Markdown Table row
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList();
      if (!currentTable) currentTable = [];
      currentTable.push(trimmed);
      continue;
    } else {
      flushTable();
    }

    // Headings
    if (trimmed.startsWith('#### ')) {
      flushList();
      elements.push(
        <h4 key={i} className="text-base font-bold text-[#111827] dark:text-white mt-4 mb-2">
          <InlineRenderer line={trimmed.slice(5)} />
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={i} className="text-lg font-bold text-[#111827] dark:text-white mt-5 mb-2.5 flex items-center gap-2">
          <InlineRenderer line={trimmed.slice(4)} />
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={i} className="text-xl font-bold text-[#111827] dark:text-white mt-6 mb-3">
          <InlineRenderer line={trimmed.slice(3)} />
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={i} className="text-2xl font-bold text-[#111827] dark:text-white mt-6 mb-3">
          <InlineRenderer line={trimmed.slice(2)} />
        </h1>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote
          key={i}
          className="border-l-4 border-[#818CF8] pl-4 py-1.5 italic text-[#64748B] dark:text-[#9CA3AF] my-2.5 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-r-xl"
        >
          <InlineRenderer line={trimmed.slice(2)} />
        </blockquote>
      );
      continue;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushList();
      elements.push(
        <hr key={i} className="my-5 border-[#E2E8F0] dark:border-[#293247]" />
      );
      continue;
    }

    // Unordered List (- or *)
    const ulMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
        currentList = [];
      }
      currentList.push(ulMatch[1]);
      continue;
    }

    // Ordered List (1. 2.)
    const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
        currentList = [];
      }
      currentList.push(olMatch[1]);
      continue;
    }

    // Normal paragraph line
    flushList();
    elements.push(
      <p key={i} className="my-2 leading-[1.7]">
        <InlineRenderer line={line} />
      </p>
    );
  }

  flushList();
  flushTable();

  return <>{elements}</>;
}

/**
 * Renders inline formatting: bold, italic, inline code, links
 */
function InlineRenderer({ line }) {
  if (!line) return null;

  // Split line for inline code `...`
  const codeParts = line.split(/(`[^`]+`)/g);

  return (
    <>
      {codeParts.map((part, pIdx) => {
        if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
          return (
            <code
              key={pIdx}
              className="px-1.5 py-0.5 mx-0.5 rounded-md font-mono text-xs bg-[#F1F5F9] dark:bg-[#1E293B] text-[#6366F1] dark:text-[#C084FC] border border-[#E2E8F0] dark:border-[#293247] font-medium"
            >
              {part.slice(1, -1)}
            </code>
          );
        }

        // Parse bold, italic, links in regular text
        return <FormattedText key={pIdx} text={part} />;
      })}
    </>
  );
}

function FormattedText({ text }) {
  // Parse markdown links [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIdx = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push({ type: 'text', val: text.slice(lastIdx, match.index) });
    }
    parts.push({ type: 'link', text: match[1], url: match[2] });
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < text.length) {
    parts.push({ type: 'text', val: text.slice(lastIdx) });
  }

  return (
    <>
      {parts.map((p, idx) => {
        if (p.type === 'link') {
          return (
            <a
              key={idx}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6366F1] dark:text-[#818CF8] hover:underline font-medium inline-flex items-center gap-0.5"
            >
              {p.text}
            </a>
          );
        }

        // Parse Bold (**text**) & Italic (*text*)
        return <BoldItalicText key={idx} text={p.val} />;
      })}
    </>
  );
}

function BoldItalicText({ text }) {
  // Split on **bold**
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <>
      {boldParts.map((bp, bIdx) => {
        if (bp.startsWith('**') && bp.endsWith('**') && bp.length >= 4) {
          const boldContent = bp.slice(2, -2);
          return (
            <strong key={bIdx} className="font-bold text-[#111827] dark:text-white">
              <ItalicText text={boldContent} />
            </strong>
          );
        }
        return <ItalicText key={bIdx} text={bp} />;
      })}
    </>
  );
}

function ItalicText({ text }) {
  // Split on *italic*
  const italicParts = text.split(/(\*[^*]+\*)/g);

  return (
    <>
      {italicParts.map((ip, iIdx) => {
        if (ip.startsWith('*') && ip.endsWith('*') && ip.length >= 2) {
          return (
            <em key={iIdx} className="italic text-[#64748B] dark:text-[#9CA3AF]">
              {ip.slice(1, -1)}
            </em>
          );
        }
        return <span key={iIdx}>{ip}</span>;
      })}
    </>
  );
}
