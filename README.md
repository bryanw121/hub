# hub

One page that links to all of Bryan's tools. Static, no build step, hosted on Vercel.

## Add a tool

Add an entry to `tools.json` and push. Vercel redeploys.

```json
{ "id": "newtool", "name": "New tool", "blurb": "What it does", "url": "https://newtool.vercel.app",
  "icon": "box", "tint": "#E0E9FF", "ink": "#1F4FC9", "status": "Beta", "private": false }
```

- `icon`: calendar, people, pin, briefcase, code, box. To add more, add them to `ICONS` in `index.html`.
- `status`: optional badge, such as "Beta".
- `private: true`: the card shows only on your own devices. Open the hub once with `?me` on each device. This only hides the card; the tool itself has to guard its own access (job hunt does).

Each tool keeps its own repo, its own tech stack and its own hosting. The hub only links to it.
