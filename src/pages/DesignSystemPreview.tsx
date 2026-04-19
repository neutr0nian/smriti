import { colors, neutral, orange, fontFamily, fontSize, spacing } from '@/tokens'

export default function DesignSystemPreview() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: `${spacing[10]} ${spacing[6]}` }}>

      {/* Header */}
      <h6 style={{ marginBottom: spacing[2] }}>Design System</h6>
      <h1 style={{ marginBottom: spacing[2] }}>Claude-Book</h1>
      <p style={{ color: colors.inkSecondary, marginBottom: spacing[10] }}>
        Font styles, color palette, and spacing tokens — the foundation for every component.
      </p>

      <Divider />

      {/* Typography */}
      <Section title="Typography">
        <Row label="h1 · serif 36px bold">
          <h1>The light-dependent reactions</h1>
        </Row>
        <Row label="h2 · serif 28px bold">
          <h2>Photosystem II and PSI</h2>
        </Row>
        <Row label="h3 · serif 22px bold">
          <h3>The Z-scheme explained</h3>
        </Row>
        <Row label="h4 · serif 18px bold">
          <h4>ATP and NADPH output</h4>
        </Row>
        <Row label="h5 · sans 15px semibold">
          <h5>Chapter overview</h5>
        </Row>
        <Row label="h6 · sans 12px semibold wide uppercase">
          <h6>Section label</h6>
        </Row>
        <Row label="p · serif 15px relaxed">
          <p>
            PSII absorbs light and uses the energy to split water molecules, releasing
            oxygen and high-energy electrons. Those electrons travel down an electron
            transport chain, pumping protons across the membrane as they go.
          </p>
        </Row>
        <Row label="small · sans 12px muted">
          <small>Last edited · 2 min ago</small>
        </Row>
        <Row label="Caveat · hand 22px">
          <span style={{ fontFamily: fontFamily.hand, fontSize: fontSize.xl, color: colors.accent }}>
            ★ memorize the 3 outputs
          </span>
        </Row>
      </Section>

      <Divider />

      {/* Semantic colors */}
      <Section title="Semantic Colors">
        <SwatchRow swatches={[
          { label: 'bg',           value: colors.bg,          dark: false },
          { label: 'surface',      value: colors.surface,     dark: false },
          { label: 'border',       value: colors.border,      dark: false },
          { label: 'ink',          value: colors.inkPrimary,  dark: true  },
          { label: 'ink secondary',value: colors.inkSecondary,dark: true  },
          { label: 'ink muted',    value: colors.inkMuted,    dark: true  },
          { label: 'accent',       value: colors.accent,      dark: true  },
          { label: 'accent soft',  value: colors.accentSoft,  dark: false },
          { label: 'sticky',       value: colors.sticky,      dark: false },
        ]} />
      </Section>

      <Divider />

      {/* Neutral scale */}
      <Section title="Neutral Scale">
        <SwatchRow swatches={
          (Object.entries(neutral) as [string, string][]).map(([step, value]) => ({
            label: step, value, dark: Number(step) >= 600,
          }))
        } />
      </Section>

      <Divider />

      {/* Orange scale */}
      <Section title="Orange Scale">
        <SwatchRow swatches={
          (Object.entries(orange) as [string, string][]).map(([step, value]) => ({
            label: step, value, dark: Number(step) >= 600,
          }))
        } />
      </Section>

      <Divider />

      {/* Spacing scale */}
      <Section title="Spacing Scale">
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
          {(Object.entries(spacing) as [string, string][]).map(([step, value]) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
              <span style={{ fontSize: fontSize.sm, color: colors.inkMuted, width: 40, flexShrink: 0 }}>
                {step}
              </span>
              <div style={{
                width: value, height: 20, borderRadius: 3,
                background: colors.accentSoft,
                border: `1px solid ${colors.accent}`,
                flexShrink: 0,
              }} />
              <span style={{ fontSize: fontSize.sm, color: colors.inkMuted }}>{value}</span>
            </div>
          ))}
        </div>
      </Section>

    </div>
  )
}

// ── Layout helpers ──

function Divider() {
  return <hr style={{ border: 'none', borderTop: `1px solid ${colors.border}`, margin: `${spacing[8]} 0` }} />
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: spacing[8] }}>
      <h6 style={{ marginBottom: spacing[6], color: colors.inkMuted }}>{title}</h6>
      {children}
    </section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '220px 1fr',
      gap: spacing[6], alignItems: 'start',
      padding: `${spacing[4]} 0`,
      borderBottom: `1px solid ${colors.border}`,
    }}>
      <span style={{ fontSize: fontSize.sm, color: colors.inkMuted, paddingTop: 2, fontFamily: fontFamily.sans }}>
        {label}
      </span>
      <div>{children}</div>
    </div>
  )
}

function SwatchRow({ swatches }: { swatches: { label: string; value: string; dark: boolean }[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[3] }}>
      {swatches.map(({ label, value, dark }) => (
        <div key={label} style={{ textAlign: 'center' }}>
          <div style={{
            width: 72, height: 48, borderRadius: 4,
            background: value,
            border: `1px solid ${colors.border}`,
            marginBottom: spacing[2],
          }} />
          <div style={{ fontSize: fontSize.xs, color: colors.inkMuted, fontFamily: fontFamily.sans }}>{label}</div>
          <div style={{
            fontSize: fontSize.xs, color: dark ? colors.inkMuted : colors.inkMuted,
            fontFamily: fontFamily.sans, opacity: 0.8,
          }}>{value}</div>
        </div>
      ))}
    </div>
  )
}
