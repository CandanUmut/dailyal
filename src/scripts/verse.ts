// Shared pieces: verse audio (streamed from everyayah.com) and verse text with tappable words.
import { state } from './store';
import { esc, pad3, arNum, ICON_PLAY, ICON_PAUSE } from './util';
import { wordKnown } from './coverage';
import type { Verse } from './data';

export const RECITERS: Record<string, string> = { Alafasy_128kbps: 'Mishary Alafasy', Husary_128kbps: 'Mahmoud Khalil Al-Husary', Minshawy_Murattal_128kbps: 'Mohamed Siddiq Al-Minshawi', Abdul_Basit_Murattal_192kbps: 'Abdul Basit (murattal)' };
export const audioUrl = (s: number, v: number) => `https://everyayah.com/data/${state.set.reciter || 'Alafasy_128kbps'}/${pad3(s)}${pad3(v)}.mp3`;
export const reciterName = () => RECITERS[state.set.reciter] || RECITERS.Alafasy_128kbps;

let audio: HTMLAudioElement | null = null, btn: HTMLElement | null = null;
/** Toggle playback of one verse. A button with data-s/data-v drives it. */
export function toggle(b: HTMLElement) {
  const src = audioUrl(+b.dataset.s!, +b.dataset.v!);
  if (audio && btn === b && !audio.paused) { audio.pause(); return; }
  if (!audio) { audio = new Audio(); audio.preload = 'auto'; }
  if (btn && btn !== b) setIcon(btn, false);
  if (audio.src !== src) audio.src = src;
  btn = b;
  audio.onplay = () => setIcon(b, true); audio.onpause = () => setIcon(b, false);
  audio.onended = () => { setIcon(b, false); b.dispatchEvent(new CustomEvent('audioended', { bubbles: true })); };
  audio.onerror = () => { setIcon(b, false); b.dispatchEvent(new CustomEvent('audioerror', { bubbles: true })); };
  audio.playbackRate = state.set.speed || 1; audio.currentTime = 0; audio.play().catch(() => setIcon(b, false));
}
function setIcon(b: HTMLElement, playing: boolean) { b.innerHTML = playing ? ICON_PAUSE : ICON_PLAY; b.setAttribute('aria-pressed', String(playing)); }
export const SPEEDS = [1, 0.85, 0.7];
export const speedChips = () => `<div class="chips" role="group" aria-label="Speed">${SPEEDS.map((x) => `<button class="chip" data-a="speed" data-v="${x}" aria-pressed="${(state.set.speed || 1) === x}">${x}×</button>`).join('')}</div>`;
export function setSpeed(x: number) { state.set.speed = x; if (audio) audio.playbackRate = x; }
export const playBtn = (s: number, v: number, label: string, cls = '') => `<button class="play ${cls}" data-a="play" data-s="${s}" data-v="${v}" aria-label="${esc(label)}" aria-pressed="false">${ICON_PLAY}</button>`;

/** Verse text from Tanzil, unchanged, one button per word. Known words get the thin underline. */
export function verseHtml(v: Verse, k: Uint8Array | null, opts: { sel?: number; mark?: number; gaps?: Set<number>; markItem?: number } = {}) {
  const words = v.t.map((tw, i) => {
    const w = v.w[i]; const cls = ['w'];
    if (opts.mark === i || (opts.markItem != null && w[0].includes(opts.markItem))) cls.push('this');
    else if (k && wordKnown(w[0], k)) cls.push('k');
    if (opts.sel === i) cls.push('sel');
    if (opts.gaps?.has(i)) cls.push('gap');
    return `<button class="${cls.join(' ')}" data-a="word" data-i="${i}">${esc(tw)}</button>`;
  }).join(' ');
  return `<p class="q" lang="ar">${words} <span class="end" aria-label="verse ${v.n}">۝${arNum(v.n)}</span></p>`;
}
