import { collectLeaves, tokens, NO_DESCRIPTION, type DimensionValue, type TokenEntry } from './tokens';

const BOX_SIZE = 96;

function Box({ entry }: { entry: TokenEntry }) {
  const dim = entry.value as DimensionValue;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--dimension-space-300)', width: 176 }}>
      <div
        style={{
          width: BOX_SIZE,
          height: BOX_SIZE,
          background: 'var(--color-interactive-primary)',
          borderRadius: `${dim.value}px`,
        }}
      />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--color-text-primary)' }}>
          {entry.path}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--color-text-secondary)' }}>
          {dim.value}
          {dim.unit}
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

export function RadiusFoundations() {
  const entries = collectLeaves(tokens.Radius as Parameters<typeof collectLeaves>[0], 'Radius').sort(
    (a, b) => (a.value as DimensionValue).value - (b.value as DimensionValue).value
  );

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--dimension-space-600)' }}>
      {entries.map((entry) => (
        <Box key={entry.path} entry={entry} />
      ))}
    </div>
  );
}
