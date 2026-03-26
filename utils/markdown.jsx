export function inlineMarkdown(text, keyPrefix) {
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let last = 0, match, ki = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[2]) parts.push(<strong key={`${keyPrefix}-b-${ki++}`}>{match[2]}</strong>);
    else if (match[3]) parts.push(<em key={`${keyPrefix}-i-${ki++}`}>{match[3]}</em>);
    else if (match[4]) parts.push(<code key={`${keyPrefix}-c-${ki++}`}>{match[4]}</code>);
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

export function renderMarkdown(text, msgIdx) {
  const lines = text.split('\n');
  const result = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.match(/^[-*]\s+/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
        items.push(lines[i].replace(/^[-*]\s+/, ''));
        i++;
      }
      result.push(
        <ul key={`ul-${i}`}>
          {items.map((item, j) => (
            <li key={j}>{inlineMarkdown(item, `ul-${i}-${j}`)}</li>
          ))}
        </ul>
      );
      continue;
    }
    if (line.trim() === '') {
      result.push(<br key={`br-${i}`} />);
      i++;
      continue;
    }
    result.push(
      <span key={`l-${i}`} style={{ display: 'block' }}>
        {inlineMarkdown(line, `l-${i}`)}
      </span>
    );
    i++;
  }
  return result;
}
