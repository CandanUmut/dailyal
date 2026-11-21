// Colour tokens, one source for the CSS and for scripts/contrast.mjs. See docs/design/DESIGN.md §3.2.
export const palettes = {
  light: {
    paper: '#F6F1E6', card: '#FBF8F1', sunk: '#EEE7D8', ink: '#1B1A17', 'ink-soft': '#5E5850', faint: '#6B645A', rule: '#DDD4C2', 'rule-strong': '#8C8476',
    rubric: '#9B2C22', 'rubric-soft': '#F3E2DC', 'on-rubric': '#FFFFFF', mark: '#F2E3B3',
    known: '#2F6B45', 'known-soft': '#E0EEE3', missed: '#9B2C22', 'missed-soft': '#F3E2DC', effort: '#7D5A00', 'effort-soft': '#F4EAD0',
  },
  dark: {
    paper: '#14120F', card: '#1B1915', sunk: '#0E0D0B', ink: '#ECE6DA', 'ink-soft': '#ABA395', faint: '#958D80', rule: '#2E2A24', 'rule-strong': '#6A6358',
    rubric: '#F19A8C', 'rubric-soft': '#3A211D', 'on-rubric': '#1B0F0C', mark: '#4A3F1C',
    known: '#8FCB9F', 'known-soft': '#17281C', missed: '#F19A8C', 'missed-soft': '#3A211D', effort: '#E3BD62', 'effort-soft': '#33280F',
  },
};
