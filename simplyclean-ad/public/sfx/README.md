# public/sfx/

CC0 UI sound effects, mirrored locally from [remotion.media](https://remotion.media) via
`@remotion/sfx` (Remotion's own asset host, released CC0 and peak-normalised to −3 dB).

They are mirrored rather than referenced by URL so that a headless render never depends on
the network. `@remotion/sfx` exports CDN URLs; a render that fetches them will fail on a
machine without internet access, which is exactly the kind of thing that breaks at the worst
moment.

| File | Used for |
|---|---|
| `mouse-click.wav` | connector tile click, primary-button press |
| `switch.wav` | the two automation toggles |
| `ding.wav` | the success checkmark |
| `whoosh.wav` | the cleaning-job chip sliding into the timeline |

Note: the CDN serves an HTML page to requests with a non-browser User-Agent. Download with
`curl -A "Mozilla/5.0"` or you will silently save a 404 page as a `.wav`.
