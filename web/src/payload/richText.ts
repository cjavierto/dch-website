/**
 * Rich text ↔ the Block type that components/ui/RichText renders.
 *
 * The editor only offers what the public site can render: paragraphs, H2s,
 * bulleted lists, a "Lead paragraph" block and a "Pull quote" block (quote +
 * attribution). Inline formatting is not offered, so text is plain.
 * No server-only imports — used by the seed script and src/lib/cms.ts.
 */
import type { Block } from "@/lib/types";

type LexicalNode = {
  type: string;
  text?: string;
  tag?: string;
  listType?: string;
  children?: LexicalNode[];
  fields?: { blockType?: string; text?: string; quote?: string; cite?: string };
};

export type LexicalState = { root: LexicalNode & { type: "root" } };

function textOf(node: LexicalNode): string {
  if (node.type === "text") return node.text ?? "";
  if (node.type === "linebreak") return "\n";
  return (node.children ?? []).map(textOf).join("");
}

/** Lexical editor state → Block[]. Unknown nodes are skipped. */
export function lexicalToBlocks(state: unknown): Block[] {
  const root = (state as LexicalState | null | undefined)?.root;
  if (!root?.children) return [];
  const blocks: Block[] = [];
  for (const node of root.children) {
    switch (node.type) {
      case "paragraph": {
        const text = textOf(node).trim();
        if (text) blocks.push({ type: "p", text });
        break;
      }
      case "heading": {
        const text = textOf(node).trim();
        if (text) blocks.push({ type: "h2", text });
        break;
      }
      case "list": {
        const items = (node.children ?? []).map((li) => textOf(li).trim()).filter(Boolean);
        if (items.length) blocks.push({ type: "ul", items });
        break;
      }
      case "quote": {
        const text = textOf(node).trim();
        if (text) blocks.push({ type: "quote", text, cite: "" });
        break;
      }
      case "block": {
        const f = node.fields;
        if (f?.blockType === "lead" && f.text?.trim()) blocks.push({ type: "lead", text: f.text.trim() });
        if (f?.blockType === "pullQuote" && f.quote?.trim())
          blocks.push({ type: "quote", text: f.quote.trim(), cite: f.cite?.trim() ?? "" });
        break;
      }
    }
  }
  return blocks;
}

const base = { format: "", indent: 0, version: 1, direction: "ltr" as const };
const blockId = () => globalThis.crypto.randomUUID().replaceAll("-", "").slice(0, 24);
const text = (t: string) => ({ type: "text", text: t, format: 0, detail: 0, mode: "normal", style: "", version: 1 });

/** Block[] → Lexical editor state. Used by the seed script. */
export function blocksToLexical(blocks: Block[]) {
  const children = blocks.map((b) => {
    switch (b.type) {
      case "p":
        return { ...base, type: "paragraph", textFormat: 0, textStyle: "", children: [text(b.text)] };
      case "h2":
        return { ...base, type: "heading", tag: "h2", children: [text(b.text)] };
      case "ul":
        return {
          ...base,
          type: "list",
          listType: "bullet",
          tag: "ul",
          start: 1,
          children: b.items.map((item, n) => ({ ...base, type: "listitem", value: n + 1, children: [text(item)] })),
        };
      case "lead":
        return { type: "block", format: "", version: 2, fields: { id: blockId(), blockName: "", blockType: "lead", text: b.text } };
      case "quote":
        return {
          type: "block",
          format: "",
          version: 2,
          fields: { id: blockId(), blockName: "", blockType: "pullQuote", quote: b.text, cite: b.cite },
        };
    }
  });
  return { root: { ...base, type: "root", children } };
}
