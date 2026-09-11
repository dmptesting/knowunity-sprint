import { collectLeaves, tokens, NO_DESCRIPTION, type DimensionValue, type TokenEntry } from './tokens';

const MAX_BAR_PX = 160; // the largest real Space value — everything else scales against it

function Row({ entry }: { entry: TokenEntry }) {
  const dim = entry.value as DimensionValue;
  const isNegative = dim.value < 0;
  const magnitude = Math.min(Math.abs(dim.value), MAX_BAR_PX);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--dimension-space-400)',
        padding: 'var(--dimension-space-200) 0',
        borderBottom: '1px solid var(--color-border-default)',
      }}
    >
      <div style={{ width: 160, fontFamily: 'monospace', fontSize: 13, color: 'var(--color-text-primary)' }}>
        {entry.path}
      </div>
      <div style={{ width: 70, fontFamily: 'monospace', fontSize: 12, color: 'var(--color-text-secondary)' }}>
        {dim.value}
        {dim.unit}
      </div>
      <div style={{ position: 'relative', flex: '0 0 340px', height: 16 }}>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 1,
            background: 'var(--color-border-strong)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            height: '100%',
            borderRadius: 'var(--dimension-radius-100)',
            background: isNegative ? 'var(--color-text-tertiary)' : 'var(--color-interactive-primary)',
            ...(isNegative ? { right: '50%', width: magnitude } : { left: '50%', width: magnitude }),
          }}
        />
      </div>
      <div
        style={{
          flex: 1,
          fontSize: 13,
          color: entry.description ? 'var(--color-text-secondary)' : 'var(--color-text-tertiary)',
          fontStyle: entry.description ? 'normal' : 'italic',
        }}
      >
        {entry.description ?? NO_DESCRIPTION}
      </div>
    </div>
  );
}

export function SpacingFoundations() {
  const entries = collectLeaves(tokens.Space as Parameters<typeof collectLeaves>[0], 'Space');
  const positive = entries
    .filter((e) => (e.value as DimensionValue).value >= 0)
    .sort((a, b) => (a.value as DimensionValue).value - (b.value as DimensionValue).value);
  const negative = entries
    .filter((e) => (e.value as DimensionValue).value < 0)
    .sort((a, b) => (b.value as DimensionValue).value - (a.value as DimensionValue).value);

  return (
    <div>
      <section style={{ marginBottom: 'var(--dimension-space-800)' }}>
        <h3 style={{ fontFamily: 'var(--font-family-default)', color: 'var(--color-text-primary)' }}>Scale</h3>
        {positive.map((entry) => (
          <Row key={entry.path} entry={entry} />
        ))}
      </section>
      <section>
        <h3 style={{ fontFamily: 'var(--font-family-default)', color: 'var(--color-text-primary)' }}>
          Negative (for negative margins)
        </h3>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 'var(--dimension-space-300)' }}>
          These mirror the positive scale above — same magnitudes, negative sign — so they're shown muted rather
          than as their own scale.
        </p>
        {negative.map((entry) => (
          <Row key={entry.path} entry={entry} />
        ))}
      </section>
    </div>
  );
}
