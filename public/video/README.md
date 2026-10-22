# The rose video (landing scene)

The site opens on a single rose that blooms as Mamma scrolls. Until a video is
added, an illustrated rose plays this part.

## Add your video

1. Save it here as `public/video/rose-bloom.mp4`.
2. In `src/content/settings.ts`, set:
   ```ts
   rose: { src: '/video/rose-bloom.mp4', poster: null },
   ```
3. Reload the page.

Best results:
- A rose on a **pure black** background, camera completely still, 5–8 seconds.
  The black melts away into the page, so only the rose shows.
- Square or 16:9 with the rose centred (the edges are softly faded anyway).
- Under ~10 MB.

## Optional: make scrolling buttery-smooth

Scrubbing a video by scroll is smoothest when every frame is a keyframe. If you
have ffmpeg installed, run this once (from the project folder):

```bash
ffmpeg -i rose.mp4 -an -vf "scale=1080:-2,fps=30" -c:v libx264 -preset slow -crf 23 -g 1 -pix_fmt yuv420p -movflags +faststart public/video/rose-bloom.mp4
```

If the video is missing or fails to load, the illustrated rose is used
automatically — nothing breaks.
