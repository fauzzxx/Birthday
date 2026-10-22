import { settings } from '../settings';
import type { PhotoId } from '../photos';

/**
 * Chapter 12 — A letter from your son
 * This is YOUR letter. Edit any paragraph freely; each string is one paragraph.
 * The salutation and sign-off come from settings.ts.
 */
export const letter = {
  envelopeTo: `For ${settings.mother.envelopeName}`,
  openLabel: 'Open the letter',
  /** A photograph tucked inside the envelope. */
  tuckedPhoto: 'ma-young-mehndi' as PhotoId,
  salutation: `${settings.mother.salutation},`,
  paragraphs: [
    'I have tried to find the right words for you, but every time I think about everything you have done for me, I realise how little a few paragraphs can hold.',
    'You were there before I knew how to ask for help. You taught me before I knew what learning meant. You stayed awake when I was unwell, learned things you needed to teach me, helped me through school and took care of all of us while carrying responsibilities I was too young to understand.',
    'I remember the little boy I was. I remember the care, the food, the lessons, the school projects, the handwriting you helped me improve and the way you kept believing in me even when I struggled. You helped me become the man I am today.',
    'I know I am growing up. I know I am trying to find my place in the world, and sometimes I let my own frustrations come out in ways you do not deserve. I am truly sorry for the times I have spoken roughly to you. You have given me so much patience. I want to learn to give you that same gentleness.',
    'You have endured so much while continuing to care for everyone around you. I wish I could take away every pain you have carried, give you the rest you deserve and make life a little lighter for you.',
    'You are not perfect because you never make mistakes. You are extraordinary because of the kindness, love, knowledge, patience and strength you bring into our lives.',
    'I hope I can make you proud, not only through my education or career, but through the person I become. I want to be someone who takes care of you, listens to you, respects you and makes you feel loved without you having to ask.',
    'May Allah bless you with good health, peace, happiness, comfort and many beautiful years ahead. May He reward you for the kindness you have given so freely and make the years ahead gentler than the ones behind you.',
    `Happy birthday, ${settings.mother.salutation}.`,
    'You were my first home, my first teacher and one of the greatest blessings of my life.',
    'I love you more than I know how to explain.',
  ],
  signOff: settings.son.signOff,
  signature: settings.son.signature,
  name: settings.son.name,
  keepsakeLabel: 'Keep this letter',
  printLabel: 'Print or save as PDF',
  /** UI: closes the keepsake view. */
  keepsakeCloseLabel: 'Close',
};
