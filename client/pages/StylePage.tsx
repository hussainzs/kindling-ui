import { Eraser, Paintbrush } from 'lucide-react';

export default function StyleDemo() {
  return (
    <div
      style={{
        padding: '2rem',
        background: 'var(--bg-cream)',
        minHeight: '100svh',
      }}
    >
      {/* Google Fonts */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Shadows+Into+Light&display=swap"
      />

      <h2
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--font-size-xs)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--text-ink-soft)',
          marginBottom: '1rem',
        }}
      >
        Colors
      </h2>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '2rem',
        }}
      >
        {[
          {
            bg: 'var(--bg-cream)',
            label: 'bg-cream',
            color: 'var(--text-ink-soft)',
          },
          {
            bg: 'var(--bg-parchment)',
            label: 'bg-parchment',
            color: 'var(--text-ink-soft)',
          },
          {
            bg: 'var(--bg-warm-white)',
            label: 'bg-warm-white',
            color: 'var(--text-ink-soft)',
          },
          { bg: 'var(--accent-rust)', label: 'accent-rust', color: '#fff' },
          {
            bg: 'var(--accent-rust-light)',
            label: 'rust-light',
            color: '#fff',
          },
          {
            bg: 'var(--accent-rust-pale)',
            label: 'rust-pale',
            color: 'var(--accent-rust)',
          },
          { bg: 'var(--accent-gold)', label: 'accent-gold', color: '#fff' },
          {
            bg: 'var(--accent-gold-light)',
            label: 'gold-light',
            color: 'var(--text-ink-mid)',
          },
          {
            bg: 'var(--accent-gold-pale)',
            label: 'gold-pale',
            color: 'var(--accent-gold)',
          },
          { bg: 'var(--accent-sage)', label: 'accent-sage', color: '#fff' },
          {
            bg: 'var(--accent-sage-pale)',
            label: 'sage-pale',
            color: 'var(--accent-sage)',
          },
          { bg: 'var(--text-ink)', label: 'text-ink', color: '#faf6f0' },
          {
            bg: 'var(--text-ink-mid)',
            label: 'text-ink-mid',
            color: '#faf6f0',
          },
          {
            bg: 'var(--text-ink-soft)',
            label: 'text-ink-soft',
            color: '#faf6f0',
          },
          { bg: 'var(--text-muted)', label: 'text-muted', color: '#faf6f0' },
          {
            bg: 'var(--text-dust)',
            label: 'text-dust',
            color: 'var(--text-ink-mid)',
          },
        ].map(({ bg, label, color }) => (
          <div
            key={label}
            style={{
              background: bg,
              color,
              border: '1px solid var(--ui-divider)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.6rem 0.9rem',
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 700,
              minWidth: '100px',
            }}
          >
            {label}
          </div>
        ))}
      </div>

      <h2
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--font-size-xs)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--text-ink-soft)',
          marginBottom: '1rem',
        }}
      >
        Fonts
      </h2>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          marginBottom: '2rem',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 700,
            color: 'var(--text-ink)',
            margin: 0,
          }}
        >
          Inter Bold — the quick brown fox
        </p>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--font-size-lg)',
            fontWeight: 500,
            color: 'var(--text-ink-mid)',
            margin: 0,
          }}
        >
          Inter Medium — the quick brown fox jumps over the lazy dog
        </p>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 400,
            color: 'var(--text-ink-soft)',
            margin: 0,
          }}
        >
          Inter Regular — the quick brown fox jumps over the lazy dog
        </p>
        <p
          style={{
            fontFamily: 'var(--font-hand)',
            fontSize: 'var(--font-size-xl)',
            color: 'var(--text-ink-mid)',
            margin: 0,
          }}
        >
          Shadows Into Light — the quick brown fox jumps over the lazy dog
        </p>
      </div>

      <h2
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--font-size-xs)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--text-ink-soft)',
          marginBottom: '1rem',
        }}
      >
        Icons from Lucide
      </h2>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {[
          {
            icon: <Eraser size={20} />,
            label: 'Eraser',
            color: 'var(--text-ink-soft)',
          },
          {
            icon: <Paintbrush size={20} />,
            label: 'Paintbrush',
            color: 'var(--text-ink-soft)',
          },
        ].map(({ icon, label, color }, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.4rem',
              color,
            }}
          >
            {icon}
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
