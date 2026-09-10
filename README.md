# EZFileConverter

A file converter that runs on your own machine, because uploading a file to a
website to change its format is a bad trade.

Conversion happens in a local Express server through `fluent-ffmpeg`. The
interface is a Vite and Tailwind front end, and there is a Tauri target so it can
be a desktop app rather than a browser tab.

## Run

```bash
npm install
npm run dev          # front end
node src/server.js   # conversion server
```

As a desktop app:

```bash
npm run tauri:dev
npm run tauri:build
```

## Adding a conversion

The pipeline is three parts and you usually add one of each:

1. A **processor** on the server, which does the conversion.
2. A **converter** on the client, which supplies the options for it.
3. A **visualizer** on the client, which previews the result.

[Extending.md](Extending.md) walks through adding a text and an audio conversion.

## Licence

You are not permitted to host this on a server and charge people to use it
through an online portal. That is the one thing it exists to avoid.
