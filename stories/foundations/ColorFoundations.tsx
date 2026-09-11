import { collectLeaves, colorCss, tokens, NO_DESCRIPTION, type ColorValue, type TokenEntry } from './tokens';

// The semantic groups design-system.md documents — not the raw color.* ramp,
// which has no descriptions and isn't meant to be used directly.
const SEMANTIC_GROUPS = [
  'background',
  'interactive',
  'text',
  'border',
  'pro',
  'accent',
  'mascot',
  'feedback',
  'highlight',
] as const;

function Swatch({ entry }: { entry: TokenEntry }) {
  const css = colorCss(entry.value as ColorValue);
  return (
    <div
      style={{
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--dimension-radius-200)',
        overflow: 'hidden',
        background: 'var(--color-background-surface)',
      }}
    >
      <div style={{ height: 72, background: css }} />
      <div style={{ padding: 'var(--dimension-space-300)' }}>
        <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--color-text-primary)' }}>
          {entry.path}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
          {css}
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
    </div>
  );
}

export function ColorFoundations() {
  return (
    <div>
      {SEMANTIC_GROUPS.map((group) => {
        const entries = collectLeaves(tokens[group] as Parameters<typeof collectLeaves>[0], group);
        return (
          <section key={group} style={{ marginBottom: 'var(--dimension-space-800)' }}>
            <h3
              style={{
                fontFamily: 'var(--font-family-default)',
                color: 'var(--color-text-primary)',
                textTransform: 'capitalize',
                marginBottom: 'var(--dimension-space-300)',
              }}
            >
              {group}
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 'var(--dimension-space-400)',
              }}
            >
              {entries.map((entry) => (
                <Swatch key={entry.path} entry={entry} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
