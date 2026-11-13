# EZFileConverter

A local file converter, built because file conversion websites should not exist.

## What this is

EZFileConverter changes files from one format to another on your own computer. Uploading a file to a website to change its format is a bad trade: you hand a stranger your file to get something your own machine can do.

It has three pages. The image converter turns pictures into JPEG, PNG or WebP and sets their quality. The audio converter turns sound files into MP3, WAV, OGG, M4A or FLAC. A DAW (digital audio workstation, music production software such as Ableton Live or FL Studio) project converter is started but not implemented, and its page says so. See "Project status".

The interface is built with Vite (a development web server) and Tailwind (a CSS toolkit), and there is a Tauri target so it can be a desktop app instead of a browser tab.

## What you can learn from it

- How file formats differ, and why JPEG, PNG and WebP suit different pictures (Computer Science).
- How lossy compression trades file size against quality, and how a quality slider controls it (Computer Science, Physics).
- How a web page can process a file in the browser without sending it anywhere (Computer Science).
- How a project is split into modules with a shared base class, so new converters follow one pattern (Computer Science).
- Why privacy matters when you upload files to online services (Computer Science, Citizenship).

## Run it

### On your own computer

**You will need:** [Node.js](https://nodejs.org/), which includes `npm`, the tool that downloads the project's libraries. The page also loads a library from the internet when it opens, so you need a connection the first time.

The pages use addresses that start from the site root, such as `/css/output.css`. Opening `public/index.html` by double-clicking breaks those links, so the page needs a local web server.

1. On the repository page, choose **Code**, then **Download ZIP**, and unzip it.
2. Open a terminal in the unzipped folder.
3. Install the libraries:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000/` in your browser.

The terminal prints `VITE ... ready` and `Local: http://localhost:3000/`. In the browser you should see the "Convertible" image converter. Drag pictures onto the drop area or click it to choose files, pick an output format and a quality, and convert. Each result has a download link.

To convert sound, open `http://localhost:3000/audio.html`, choose one or more audio files, pick a format and a bitrate, and press **Convert Audio**. The first conversion downloads ffmpeg (about 25 MB) from unpkg.com, so it needs an internet connection and takes a few seconds. Each result has a player and a **Download** button.

Stop the server with Ctrl and C in the terminal.

### Controls

| Control | What it does |
|---|---|
| Drop area | Drag images here, or click to choose one or more files |
| Format | JPEG, PNG, WebP, AVIF or TIFF |
| Quality slider | From low to maximum quality |
| Theme menu | Light, Dark, Cupcake, Cyberpunk, Forest or Neon colours |

## How it works

Both working converters run in your browser, so your files never leave your computer.

The image converter `public/js/converter.js` hands each picture to the [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression) library, which redraws it at the chosen format and quality and returns a new file.

The audio converter uses [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm), the ffmpeg program compiled to WebAssembly. `public/js/audio-converter.js` writes your file into ffmpeg's in-memory file system, runs ffmpeg with an encoder for the chosen format (LAME for MP3, Vorbis for OGG, AAC for M4A, FLAC, or plain PCM for WAV), and reads the result back. It uses the single-threaded build of ffmpeg.wasm, because the faster multi-threaded build only runs on pages served with cross-origin isolation headers.

The repository also holds the start of a server-side design: a conversion engine with one "mode" per kind of file, using [sharp](https://sharp.pixelplumbing.com/) for images and [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) for audio. Nothing starts that server yet.

| File or folder | What is in it |
|---|---|
| `public/index.html` | The image converter page |
| `public/audio.html` | The audio converter page |
| `public/daw.html` | The DAW project converter page (not implemented; the page says so) |
| `public/js/` | Browser code for each converter |
| `public/css/` | Tailwind source (`styles.css`) and the built stylesheet (`output.css`) |
| `engine/src/` | The shared conversion engine, base class and server |
| `imageconverter/src/` | Image conversion with sharp |
| `audioconverter/src/` | Audio conversion with ffmpeg |
| `dawconverter/src/` | DAW project parsers for Ableton, FL Studio, Logic and Pro Tools |
| `src/server.js` | A small Express server that serves the pages |
| `src-tauri/` | The Tauri desktop app wrapper |
| `Extending.md` | A guide to adding a new kind of conversion |

## Ideas to try

1. Add a quality preset. In `public/index.html`, find the `presets` list in `updateQualityLabel` and add one.
2. Change the default format. In `public/index.html`, move another `<option>` to the top of the format list.
3. Add a sample-rate option to the audio page. In `encoderArgs` in `public/js/audio-converter.js`, add `'-ar', '22050'` and listen to the difference.
4. Show the size saving. Each result from `convertImage` in `public/js/converter.js` has `originalSize` and `size`. Show the percentage saved.
5. Add a new converter, such as text encoding. Follow `Extending.md`, using `engine/src/BaseMode.js` as the base class.

## Technical details

Conversion was planned to happen in a local Express server through `fluent-ffmpeg`. The interface is a Vite and Tailwind front end, and there is a Tauri target so it can be a desktop app.

### Commands from `package.json`

```bash
npm install
npm run dev          # Vite dev server for the front end, port 3000
node src/server.js   # Express server that serves the same pages, also port 3000
npm run build        # build the front end into dist/
npm run css:build    # rebuild public/css/output.css from styles.css
```

`npm run dev` and `node src/server.js` both use port 3000, so run one at a time. `src/server.js` serves the pages only; it has no conversion routes.

As a desktop app (needs [Rust](https://www.rust-lang.org/tools/install) and the [Tauri 1 prerequisites](https://v1.tauri.app/v1/guides/getting-started/prerequisites)):

```bash
npm run tauri:dev
npm run tauri:build
```

### Adding a conversion

The pipeline is three parts and you usually add one of each:

1. A processor on the server, which does the conversion.
2. A converter on the client, which supplies the options for it.
3. A visualizer on the client, which previews the result.

[Extending.md](Extending.md) walks through adding a text and an audio conversion. Its file paths (`server/src/processors/`, `client/src/converters/`) describe a planned layout that does not match the current folders.

### Workspaces

The root `package.json` is an npm workspace with four packages: `engine` (`@convertible/engine`), `imageconverter`, `audioconverter` and `dawconverter`. The audio mode lists MP3, WAV, OGG, M4A and FLAC output; the image mode lists JPEG, PNG, WebP, AVIF and TIFF.

## Project status

Work in progress. No tests.

- Image and audio conversion in the browser work.
- The audio converter loads ffmpeg.wasm from unpkg.com on first use, so it does not work offline.
- DAW project conversion is not implemented. The page shows a notice and the convert button is disabled. No server handles `/api/convert/daw`, and `DAWMode.convertFromCommonFormat` throws "Not implemented yet".
- The server-side engine is never started. `imageconverter/src/ImageMode.js` imports `@img-convert/engine`, a package name that does not exist in this project.
- AVIF and TIFF output depends on what the browser can encode and may not give a real AVIF or TIFF file.

## Licence

You can use, copy and change this code for any purpose, as long as you keep the copyright notice. See [LICENSE](LICENSE) (MIT).

## Credits

Written by Abhishek Shivakumar. Built with [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [daisyUI](https://daisyui.com/), [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression), [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm), [Express](https://expressjs.com/), [sharp](https://sharp.pixelplumbing.com/), [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) and [Tauri](https://tauri.app/). To cite this work, see [CITATION.cff](CITATION.cff).
