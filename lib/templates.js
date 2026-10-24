// Templates are preset block lists (see blocks.js). The composer starts from one and edits it.
import { THEMES } from './themes.js';
import { renderBlocks, sanitizeBlocks } from './blocks.js';

const card = (c, extra = {}) => ({ type: 'card', card: c, ...extra });
const heading = (text, extra = {}) => ({ type: 'heading', text, ...extra });
const text = (t, extra = {}) => ({ type: 'text', text: t, ...extra });
const links = (extra = {}) => ({ type: 'links', sep: 'dot', ...extra });
const footer = (what) => text(`{name} · ${what} made with Profilewright`, { align: 'center', small: true });
const section = (type, extra = {}) => ({ type, ...extra });
const NUMBERS = '**{repos}** public repositories, **{stars}** stars, **{contributions}** contributions in the last year, a longest streak of **{bestStreak}** days and **{followers}** followers.';

const PRESETS = {
  room: {
    label: 'Dev Room', blurb: 'An isometric room furnished by your work', tags: ['creative'],
    blocks: [
      card('hero'),
      card('room', { title: '🪑 Welcome to my dev room', caption: "One book per repository, my top language on screen, a plant that grows with my streak, and trophies I've earned.", small: true }),
      card('projects', { title: '📚 Off the shelf' }),
      card('stack', { title: '🖥️ On screen' }),
      card('social', { title: '🚪 Knock knock' }),
      links(),
      footer('dev room'),
    ],
  },
  island: {
    label: 'Voxel Island', blurb: 'A floating island built from your days', tags: ['creative'],
    blocks: [
      card('hero'),
      card('island', { title: '🏝️ The island I raised this year', caption: 'Every block is a day. The newest days sit at the centre, and more contributions build taller land.', small: true }),
      card('projects', { title: '🏘️ Settlements' }),
      card('stats', { title: '🧭 Expedition log' }),
      card('social', { title: '⛵ Sail over' }),
      links(),
      footer('voxel island'),
    ],
  },
  synthwave: {
    label: 'Synthwave Horizon', blurb: 'A retro 3D sunset made of your year', tags: ['creative'],
    blocks: [
      card('synthwave', { theme: 'synthwave' }),
      text('**{tagline}**', { align: 'center' }),
      links(),
      card('projects', { title: '📼 Side A: Projects', theme: 'synthwave' }),
      card('stack', { title: '🎛️ Equalizer: Languages', theme: 'synthwave' }),
      card('stats', { title: '📡 Signal', theme: 'synthwave' }),
      footer('synthwave horizon'),
    ],
  },
  recruiter: {
    label: 'Recruiter-ready', blurb: 'Hiring-optimized, fast scan', tags: ['hiring'],
    blocks: [
      section('recruiterHero'),
      section('evaluate'),
      section('proofNumbers'),
      card('stats'),
      section('selectedWork'),
      card('stack', { title: 'Technical toolkit' }),
      section('langTable'),
      card('heatmap', { title: 'Consistency signal' }),
      { type: 'divider' },
      section('cta'),
      footer('recruiter-ready profile'),
    ],
  },
  hub: {
    label: 'Everything Hub', blurb: 'Every section folds away', tags: ['hiring'],
    blocks: [
      card('hero'),
      text('**{name}** · {role}\n{tagline}', { align: 'center' }),
      links(),
      card('projects', { title: '📌 Top projects', fold: 'open', list: true }),
      card('stack', { title: '🧰 Stack', fold: 'closed' }),
      card('stats', { title: '📊 By the numbers', fold: 'closed', caption: NUMBERS, captionPos: 'above' }),
      card('heatmap', { title: '🟩 Activity', fold: 'closed' }),
      card('social', { title: '👋 Say hello', fold: 'closed' }),
      footer('everything hub'),
    ],
  },
  city: {
    label: 'Contribution City', blurb: 'Your year as a 3D skyline', tags: ['creative'],
    blocks: [
      card('hero'),
      card('city', { title: 'The city I built this year', caption: 'Every building is a day; taller means more contributions.', small: true }),
      card('stats', { title: 'Population' }),
      card('projects', { title: 'Landmarks' }),
      card('social', { title: 'Visit' }),
      links(),
      footer('contribution city'),
    ],
  },
  galaxy: {
    label: 'Repo Galaxy', blurb: 'Your repositories as a galaxy of stars', tags: ['creative'],
    blocks: [
      heading('{name}', { level: '1', align: 'center' }),
      text('{role}', { align: 'center' }),
      card('galaxy', { caption: NUMBERS }),
      card('projects', { title: 'Brightest stars' }),
      card('stack', { title: 'Elements' }),
      card('social', { title: 'Transmission' }),
      links(),
      footer('repo galaxy'),
    ],
  },
  snake: {
    label: 'Snake Trail', blurb: 'A snake eats your contribution graph', tags: ['creative'],
    blocks: [card('hero'), card('projects'), card('snake'), card('stats'), card('social'), footer('snake trail')],
  },
  neofetch: {
    label: 'Neofetch', blurb: 'System info, but it’s you', tags: ['technical'],
    blocks: [card('neofetch'), links({ sep: 'spaced', prefix: '`~/links`' }), footer('neofetch card')],
  },
  frontpage: {
    label: 'Front Page', blurb: 'Your profile as a newspaper', tags: ['creative'],
    blocks: [
      section('masthead'),
      { type: 'divider' },
      text(NUMBERS),
      section('newsTable'),
      heading('Editorial', { level: '3' }),
      text('> {tagline}'),
      card('heatmap', { title: 'Activity forecast' }),
      { type: 'divider' },
      links({ prefix: 'CLASSIFIEDS', suffix: 'Printed with Profilewright', small: true }),
    ],
  },
  minimal: {
    label: 'Minimal', blurb: 'Clean intro with stats and stack', tags: ['simple'],
    blocks: [section('intro'), card('stats'), card('stack'), heading('Recent work', { level: '3' }), section('projectList')],
  },
  terminal: {
    label: 'Terminal', blurb: 'Your profile as a shell session', tags: ['technical'],
    blocks: [
      section('whoami'),
      section('lsProjects'),
      card('heatmap', { title: '`$ cat activity.log`', theme: 'terminal' }),
      links({ align: 'left', sep: 'spaced', prefix: '`$ contact`' }),
    ],
  },
};

export const TEMPLATES = Object.fromEntries(Object.entries(PRESETS).map(([k, t]) => [k, { ...t, blocks: sanitizeBlocks(t.blocks) }]));

export function defaults(profile) {
  return {
    role: 'Software engineer',
    tagline: profile.bio || 'Building useful software and sharing the work in public.',
    status: 'Open to new opportunities',
    website: profile.blog,
    linkedin: '',
    email: '',
    cta: 'Open to thoughtful teams, ambitious products, and useful engineering work.',
    projects: profile.projects.slice(0, 3).map((r) => r.name),
  };
}

// User input is untrusted: drop empty values, keep only http(s) links and plain emails.
export function cleanOptions(raw) {
  // Collapse newlines: a multi-line tagline would break markdown blocks like "> quote".
  const o = Object.fromEntries(
    Object.entries(raw)
      .map(([k, v]) => [k, typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : v])
      .filter(([, v]) => v !== undefined && v !== '')
  );
  for (const k of ['website', 'linkedin']) if (o[k] && !/^https?:\/\/[^\s"'<>]+$/i.test(o[k])) delete o[k];
  if (o.email && !/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(o.email)) delete o.email;
  if (o.theme && !THEMES[o.theme]) delete o.theme;
  return o;
}

// `blocks` (already sanitized) overrides the template's preset.
export function renderReadme(template, profile, opts, base, blocks) {
  const list = blocks || (TEMPLATES[template] || TEMPLATES.recruiter).blocks;
  return renderBlocks(list, { profile, opts: { theme: 'github-dark', ...defaults(profile), ...cleanOptions(opts) }, base });
}
