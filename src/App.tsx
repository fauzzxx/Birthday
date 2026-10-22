import { useEffect, useState } from 'react';
import { AudioProvider } from './audio/AudioProvider';
import { AudioControls } from './audio/AudioControls';
import { GalleryProvider } from './components/gallery/GalleryProvider';
import { ChapterNav } from './components/ChapterNav';
import { Thread } from './components/Thread';
import { Album } from './components/Album';
import { RoseBloom } from './components/RoseBloom';
import { interludes } from './content/story';
import { ScrollTrigger } from './lib/gsap';
import { on } from './lib/events';

import { Opening } from './chapters/ch01-opening/Opening';
import { LittleBoy } from './chapters/ch02-little-boy/LittleBoy';
import { FirstTeacher } from './chapters/ch03-first-teacher/FirstTeacher';
import { LittleWorld } from './chapters/ch04-little-world/LittleWorld';
import { ThousandNights } from './chapters/ch05-thousand-nights/ThousandNights';
import { CouldDoEverything } from './chapters/ch06-could-do-everything/CouldDoEverything';
import { Strength } from './chapters/ch07-strength/Strength';
import { Kindness } from './chapters/ch08-kindness/Kindness';
import { BoyGrewUp } from './chapters/ch09-boy-grew-up/BoyGrewUp';
import { Lessons } from './chapters/ch10-lessons/Lessons';
import { Hands } from './chapters/ch11-hands/Hands';
import { Letter } from './chapters/ch12-letter/Letter';
import { Celebration } from './chapters/ch13-celebration/Celebration';

/**
 * The whole story, in order. Each chapter is a self-contained scene; the
 * golden <Thread> between them carries the eye (and the colour) from one to
 * the next, sometimes with a quiet line, sometimes in silence.
 */
export function App() {
  const chromeVisible = useChromeVisibility();

  // Fonts and late layout changes shift positions; re-measure scroll scenes once settled.
  useEffect(() => {
    let cancelled = false;
    const refresh = () => !cancelled && ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => undefined);
    window.addEventListener('load', refresh);
    return () => {
      cancelled = true;
      window.removeEventListener('load', refresh);
    };
  }, []);

  return (
    <AudioProvider>
      <GalleryProvider>
        <div className="grain" aria-hidden="true" />
        <ChapterNav visible={chromeVisible} />
        <AudioControls visible={chromeVisible} />

        <main id="story">
          <RoseBloom {...interludes.rose} />
          <Opening />
          <Thread from="night" to="night" length="short" />
          <LittleBoy />
          <Thread from="night" to="paper" />
          <FirstTeacher />
          <Thread from="paper" to="dusk" />
          <LittleWorld />
          <Thread from="dusk" to="midnight" length="short" />
          <ThousandNights />
          <Thread from="midnight" to="ivory" />
          <CouldDoEverything />
          <Thread from="ivory" to="rose" length="long" line={interludes.beforeStrength} />
          <Strength />
          <Thread from="rose" to="dawn" length="short" />
          <Kindness />
          <Thread from="dawn" to="espresso" length="long" line={interludes.beforeGrowingUp} />
          <BoyGrewUp />
          <Thread from="espresso" to="paper" />
          <Lessons />
          <Thread from="paper" to="lamplight" length="long" line={interludes.beforeHands} />
          <Hands />
          <Thread from="lamplight" to="burgundy" line={interludes.beforeLetter} />
          <Letter />
          <Thread from="burgundy" to="burgundy" line={interludes.beforeCelebration} />
          <Celebration />
          <Thread from="burgundy" to="burgundy" length="short" />
          <Album />
        </main>
      </GalleryProvider>
    </AudioProvider>
  );
}

/** Navigation & music controls stay hidden during the opening, then fade in. */
function useChromeVisibility() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    // Appear once the story itself (chapter 01, after the landing rose) is half-way up the screen.
    const check = () => {
      const opening = document.getElementById('before-the-world-knew-me');
      const reached = opening ? opening.getBoundingClientRect().top < window.innerHeight * 0.5 : window.scrollY > window.innerHeight;
      setVisible((v) => v || reached);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    const off = on('story:begin', () => setVisible(true));
    return () => {
      window.removeEventListener('scroll', check);
      off();
    };
  }, []);
  return visible;
}
