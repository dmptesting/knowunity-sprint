// Shared reader for tokens/tokens.json, used only by the Storybook foundations
// pages under stories/foundations/. Never edit tokens.json's values here —
// this just follows `{a.b.c}` references and flattens groups for display.
import raw from '../../tokens/tokens.json';

export type ColorValue = {
  colorSpace: string;
  components: [number, number, number];
  alpha: number;
  hex: string;
};

export type DimensionValue = { value: number; unit: string };

type TokenLeaf = {
  $type: string;
  $value: unknown;
  $description?: string;
};

type TokenTree = { [key: string]: TokenLeaf | TokenTree };

export const tokens = raw as unknown as TokenTree;

function getNode(path: string): TokenLeaf {
  const parts = path.split('.');
  let cur: TokenLeaf | TokenTree = tokens;
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object' || !(part in cur)) {
      throw new Error(`Token reference not found: {${path}}`);
    }
    cur = (cur as TokenTree)[part];
  }
  return cur as TokenLeaf;
}

function isRef(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('{') && value.endsWith('}');
}

/** Follows a `{a.b.c}` reference chain down to its literal value. */
export function resolveValue(value: unknown): unknown {
  if (isRef(value)) {
    const node = getNode(value.slice(1, -1));
    return resolveValue(node.$value);
  }
  return value;
}

export function colorCss(color: ColorValue): string {
  if (color.alpha >= 1) return color.hex;
  const [r, g, b] = color.components.map((c) => Math.round(c * 255));
  return `rgba(${r}, ${g}, ${b}, ${color.alpha})`;
}

export interface TypographyResolved {
  fontFamily: string;
  fontWeight: string;
  fontSize: DimensionValue;
  lineHeight: DimensionValue;
}

export function resolveTypography(value: Record<string, unknown>): TypographyResolved {
  return {
    fontFamily: resolveValue(value.fontFamily) as string,
    fontWeight: resolveValue(value.fontWeight) as string,
    fontSize: resolveValue(value.fontSize) as DimensionValue,
    lineHeight: resolveValue(value.lineHeight) as DimensionValue,
  };
}

export interface TokenEntry {
  path: string;
  value: unknown;
  description: string | null;
}

function isLeaf(node: unknown): node is TokenLeaf {
  return typeof node === 'object' && node !== null && '$type' in node;
}

/** Flattens a token group (any nesting depth) into {path, resolved value, description}. */
export function collectLeaves(group: TokenTree, prefix = ''): TokenEntry[] {
  const entries: TokenEntry[] = [];
  for (const [key, node] of Object.entries(group)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (isLeaf(node)) {
      entries.push({
        path,
        value: resolveValue(node.$value),
        description: node.$description ?? null,
      });
    } else {
      entries.push(...collectLeaves(node as TokenTree, path));
    }
  }
  return entries;
}

export const NO_DESCRIPTION = 'No description in tokens.json';
