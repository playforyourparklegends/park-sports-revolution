// Shared brand styling for Legends of the Park emails:
// near-black lacquer background, antique-gold accents, serif display type.
const GOLD = '#c8a349';
const NEAR_BLACK = '#0b0b0c';
const PANEL = '#141416';

export const main = {
  backgroundColor: NEAR_BLACK,
  fontFamily: "Georgia, 'Times New Roman', serif",
  margin: '0',
  padding: '24px 0',
};

export const container = {
  backgroundColor: PANEL,
  border: `1px solid ${GOLD}55`,
  borderRadius: '14px',
  padding: '32px 28px',
  maxWidth: '520px',
  margin: '0 auto',
};

export const h1 = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: '24px',
  letterSpacing: '0.04em',
  fontWeight: 'normal' as const,
  color: GOLD,
  margin: '0 0 22px',
};

export const text = {
  fontSize: '15px',
  color: '#d8d6d1',
  lineHeight: '1.6',
  margin: '0 0 24px',
};

export const link = { color: GOLD, textDecoration: 'underline' };

export const button = {
  backgroundColor: GOLD,
  color: NEAR_BLACK,
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: '13px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  border: `1px solid ${GOLD}`,
  borderRadius: '8px',
  padding: '13px 26px',
  textDecoration: 'none',
};

export const codeStyle = {
  fontFamily: "'Courier New', monospace",
  fontSize: '30px',
  letterSpacing: '0.3em',
  color: GOLD,
  backgroundColor: '#000000',
  border: `1px solid ${GOLD}55`,
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

export const footer = {
  fontSize: '12px',
  color: '#8a8780',
  margin: '30px 0 0',
  lineHeight: '1.5',
};

// Rendered as a text child, which React may HTML-escape: keep this CSS free of >, &, and quotes.
export const darkModeCss = `
  @media (prefers-color-scheme: dark) {
    .dm-btn { background-color: #c8a349 !important; color: #0b0b0c !important; }
  }
  [data-ogsc] .dm-btn { background-color: #c8a349 !important; color: #0b0b0c !important; }
  [data-ogsb] .dm-btn { background-color: #c8a349 !important; color: #0b0b0c !important; }
`;
