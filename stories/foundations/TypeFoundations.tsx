import { collectLeaves, resolveTypography, tokens, NO_DESCRIPTION } from './tokens';

// tokens.json stores font weight as a keyword ('regular', 'semi-bold', 'bold',
// 'heavy'), not a CSS numeric weight. This mapping is presentational only —
// it exists so the sample text renders at roughly the right weight, it is
// not itself a design token.
const CSS_FONT_WEIGHT: Record<string, number> = {
  regular: 400,
  'semi-bold': 600,
  bold: 700,
  heavy: 800,
};

const SAMPLE_TEXT = 'Explain the concept in your own words';

export function TypeFoundations() {
  // textStyle's own key order in tokens.json is already largest-to-smallest.
  const entries = collectLeaves(tokens.textStyle as Parameters<typeof collectLeaves>[0], 'textStyle');

  return (
    <div>
      {entries.map((entry) => {
        const { fontFamily, fontWeight, fontSize, lineHeight } = resolveTypography(
          entry.value as Record<string, unknown>
        );
        return (
          <div
            key={entry.path}
            style={{
              padding: 'var(--dimension-space-400) 0',
              borderBottom: '1px solid var(--color-border-default)',
            }}
          >
            <div
              style={{
                fontFamily: `'${fontFamily}', ui-sans-serif, system-ui, sans-serif`,
                fontWeight: CSS_FONT_WEIGHT[fontWeight] ?? 400,
                fontSize: `${fontSize.value}${fontSize.unit}`,
                lineHeight: `${lineHeight.value}${lineHeight.unit}`,
                color: 'var(--color-text-primary)',
              }}
            >
              {SAMPLE_TEXT}
            </div>
            <div
              style={{
                display: 'flex',
                gap: 'var(--dimension-space-400)',
                marginTop: 'var(--dimension-space-200)',
                fontFamily: 'monospace',
                fontSize: 12,
                color: 'var(--color-text-secondary)',
              }}
            >
              <span>{entry.path}</span>
              <span>
                {fontWeight} · {fontSize.value}
                {fontSize.unit} / {lineHeight.value}
                {lineHeight.unit}
              </span>
            </div>
            <div
              style={{
                fontSize: 12,
                marginTop: 'var(--dimension-space-100)',
                color: entry.description ? 'var(--color-text-secondary)' : 'var(--color-text-tertiary)',
                fontStyle: entry.description ? 'normal' : 'italic',
              }}
            >
              {entry.description ?? NO_DESCRIPTION}
            </div>
          </div>
        );
      })}
    </div>
  );
}
