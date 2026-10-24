// A theme is a dark palette + accents; mode=light keeps the accents on a light base,
// which is what the <picture> light source in templates asks for.
const LIGHT = { bg: '#ffffff', bg2: '#f6f8fa', border: '#d0d7de', text: '#1f2328', muted: '#59636e', empty: '#ebedf0' };

export const THEMES = {
  'github-dark': { label: 'GitHub Dark', bg: '#0d1117', bg2: '#161b22', border: '#30363d', text: '#e6edf3', muted: '#8b949e', empty: '#161b22', accents: ['#58a6ff', '#39d353', '#a371f7', '#22d3ee'] },
  'tokyo-night': { label: 'Tokyo Night', bg: '#1a1b26', bg2: '#24283b', border: '#414868', text: '#c0caf5', muted: '#7982a9', empty: '#24283b', accents: ['#7aa2f7', '#bb9af7', '#9ece6a', '#f7768e'] },
  dracula: { label: 'Dracula', bg: '#282a36', bg2: '#343746', border: '#44475a', text: '#f8f8f2', muted: '#a4a8c2', empty: '#343746', accents: ['#bd93f9', '#ff79c6', '#50fa7b', '#8be9fd'] },
  terminal: { label: 'Terminal', bg: '#050805', bg2: '#0b130b', border: '#1f3b1f', text: '#c8facc', muted: '#6fae76', empty: '#0f1a0f', accents: ['#39ff14', '#7ee787', '#2ea043', '#a6f4a6'] },
  synthwave: { label: 'Synthwave', bg: '#14052b', bg2: '#2a0b48', border: '#5b2a86', text: '#fdf0ff', muted: '#c39bd3', empty: '#22093d', accents: ['#ff2fb3', '#2de2e6', '#ffb84d', '#b967ff'] },
  sunset: { label: 'Sunset', bg: '#1c1210', bg2: '#2a1a16', border: '#4a2c24', text: '#fde8dc', muted: '#c49a88', empty: '#2a1a16', accents: ['#ff7b54', '#ffb26b', '#ff5e7e', '#ffd56b'] },
};

export function palette(theme, mode = 'dark') {
  const t = THEMES[theme] || THEMES['github-dark'];
  return mode === 'light' ? { ...t, ...LIGHT } : t;
}
