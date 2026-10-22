# Music (optional)

The site plays a soft, generated ambient score by default (no file needed).

To use your own music instead:

1. Put an audio file here, e.g. `public/audio/ambient.mp3` (MP3 or M4A, ideally under 5 MB, a calm piece that loops well).
2. In `src/content/settings.ts`, set `audio.src` to `'/audio/ambient.mp3'`.

If the file is missing or fails to load, the site falls back to the generated score automatically.
