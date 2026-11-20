import { describe, it, expect } from 'vitest';
import { readCorpus, ar } from '../scripts/data/morph.mjs';
const { words } = readCorpus('data/sources/quranic-corpus-morphology-0.4.txt');

describe('corpus items', () => {
  it('reads every word of the Quran', () => expect(words.size).toBe(77429));
  it('converts Buckwalter to Arabic', () => expect(ar('{ll~ah').normalize('NFC')).toBe('ٱللَّه'.normalize('NFC')));
  it('2:3:4 وَيُقِيمُونَ = and + establish; the subject ending is conjugation, not an item', () => expect(words.get('2:3:4').items).toEqual(['p:wa', 'l:>aqaAma']));
  it('2:3:7 رَزَقْنَاهُمْ keeps the object pronoun "them" (3MP) but not the subject ending', () => expect(words.get('2:3:7').items).toEqual(['l:razaqa', 'pr:3MP']));
  it('2:3:3 بِٱلْغَيْبِ = bi + al + ghayb', () => expect(words.get('2:3:3').items).toEqual(['p:bi', 'p:al', 'l:gayob']));
  it('the opening letters (2:1 الٓمٓ) carry no item', () => expect(words.get('2:1:1').items).toEqual([]));
  it('a separate pronoun and an attached one are the same item', () => { expect(words.get('2:4:11').items).toContain('pr:3MP'); });
});
