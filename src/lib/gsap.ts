/**
 * Single place where GSAP and its plugins are registered.
 * Always import gsap / ScrollTrigger / SplitText from here, never from 'gsap' directly,
 * so plugins are guaranteed to be registered before use.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, ScrollToPlugin, useGSAP);

gsap.defaults({ ease: 'power3.out', duration: 1 });

ScrollTrigger.config({
  // Mobile browsers resize the viewport when the address bar shows/hides; don't recalc on that.
  ignoreMobileResize: true,
});

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, ScrollToPlugin, useGSAP };
