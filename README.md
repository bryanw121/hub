# Bryan's tools

One repo for the hub page and for new personal projects. Every folder below is
**its own app**: you can deploy it alone, or copy it into a new repo and deploy
it there, and nothing else here notices.

```
hub/                 the hub page (bryanwu-tools.vercel.app)
projects/<name>/     one folder per project, any tech stack
templates/<kind>/    starting points that `new-project` copies
scripts/             repo tooling only; no project imports from here
```

## Make a new project

```
node scripts/new-project.mjs my-idea
```

That copies `templates/static` to `projects/my-idea/` and fills in its name.
Use `--template <kind>` for another template. Then build inside that folder
like any standalone app.

To put it on the hub, add a card to `hub/tools.json` once it has a URL
(`--hub-url https://…` does this for you).

## Deploy a project

Vercel → New Project → import this repo → **Root Directory:
`projects/my-idea`** → Deploy. Its `vercel.json` skips rebuilds unless
something inside its own folder changed, so pushing to one project never
redeploys another.

## Move a project to its own repo

Copy `projects/my-idea/` into the new repo's root and deploy it there. Nothing
to untangle: it has its own `package.json`, lockfile, config and `.env`.
Then delete the folder here, and update its card in `hub/tools.json`.

## The rules that keep folders independent

1. **No reaching outside your folder.** No imports, asset paths or scripts that
   go `../` above the project's own root. Copy what you need instead.
2. **Own dependencies.** Each folder has its own `package.json` and lockfile.
   No workspace or root-level `package.json`.
3. **Own config and secrets.** `vercel.json`, `.env.example` and the like live
   in the folder. Real secrets go in that project's Vercel settings, never in
   the repo.
4. **Own README.** What it is, how to run it, how to deploy it.

`node scripts/check-independence.mjs` checks rules 1, 2 and 4, and runs on
every pull request.
