import { API_BASE } from '../constants'

export function renderMarkdown(text: string): string {
  let html = text
    .replace(/\[image:(\d+)\]/g, `<img src="${API_BASE}/image/$1" class="chat-image" alt="image $1" />`)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^\s*[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/^\s*\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/^---$/gm, '<hr/>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n\n(?!<)/g, '</p><p>')
    .replace(/(?<!>)\n(?!<)/g, '<br/>')

  if (!/^<(h[1-6]|p|ul|ol|pre|blockquote|hr)/.test(html)) {
    html = `<p>${html}</p>`
  }
  return html
}
