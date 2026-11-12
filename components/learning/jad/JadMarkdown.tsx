import { Fragment, type ReactNode } from "react";

/**
 * Renders JAD AI's answers. The model is asked for a small Markdown subset and the
 * output is turned into React elements only (never HTML), so a reply can't inject
 * markup or scripts. Supported: paragraphs, ### headings, "- " bullets, "1. " steps,
 * **bold**, *italic* and `code`. Works on half-finished text while it streams.
 */
type Block =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[]; start: number };

function parse(source: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ kind: "p", text: para.join(" ") });
    para = [];
  };
  for (const raw of source.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    const heading = /^#{1,6}\s+(.*)$/.exec(line);
    const bullet = /^[-*•]\s+(.*)$/.exec(line);
    const numbered = /^(\d+)[.)]\s+(.*)$/.exec(line);
    const last = blocks[blocks.length - 1];
    if (heading) {
      flush();
      blocks.push({ kind: "h", text: heading[1] });
    } else if (bullet) {
      flush();
      if (last?.kind === "ul" && !para.length) last.items.push(bullet[1]);
      else blocks.push({ kind: "ul", items: [bullet[1]] });
    } else if (numbered) {
      flush();
      if (last?.kind === "ol") last.items.push(numbered[2]);
      else blocks.push({ kind: "ol", items: [numbered[2]], start: Number(numbered[1]) || 1 });
    } else {
      para.push(line);
    }
  }
  flush();
  return blocks;
}

function inline(text: string): ReactNode[] {
  // Bold before italic so "**x**" isn't read as two italics.
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g).map((part, i) => {
    if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.length > 2 && part.startsWith("`") && part.endsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
    if (part.length > 2 && ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))))
      return <em key={i}>{part.slice(1, -1)}</em>;
    // A "**" that hasn't closed yet (mid-stream) shouldn't flash as asterisks.
    return <Fragment key={i}>{part.replace(/\*\*$/, "")}</Fragment>;
  });
}

export function JadMarkdown({ text }: { text: string }) {
  return (
    <div className="jad-md">
      {parse(text).map((block, i) => {
        if (block.kind === "h") return <h4 key={i}>{inline(block.text)}</h4>;
        if (block.kind === "ul")
          return (
            <ul key={i}>
              {block.items.map((item, j) => (
                <li key={j}>{inline(item)}</li>
              ))}
            </ul>
          );
        if (block.kind === "ol")
          return (
            <ol key={i} start={block.start}>
              {block.items.map((item, j) => (
                <li key={j}>{inline(item)}</li>
              ))}
            </ol>
          );
        return <p key={i}>{inline(block.text)}</p>;
      })}
    </div>
  );
}

/** Plain text for copying an answer to the clipboard. */
export function stripMarkdown(text: string) {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1$2");
}
