// Audio conversion in the browser with ffmpeg.wasm 0.11 (loaded by audio.html).
//
// The default ffmpeg.wasm core is multi-threaded and needs SharedArrayBuffer,
// which browsers only allow on pages served with cross-origin isolation
// headers. The single-threaded core runs on any static server, so it is used
// here. It is slower, which is fine for short clips. Each conversion uses a
// fresh core, so the virtual file system starts empty every time.
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({
    log: false,
    corePath: 'https://unpkg.com/@ffmpeg/core-st@0.11.1/dist/ffmpeg-core.js',
    mainName: 'main'
});

let ffmpegLoading = null;
function loadFFmpeg() {
    if (!ffmpegLoading) {
        ffmpegLoading = ffmpeg.load().catch(error => {
            ffmpegLoading = null;
            throw error;
        });
    }
    return ffmpegLoading;
}

const MIME_TYPES = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    m4a: 'audio/mp4',
    flac: 'audio/flac'
};

// Encoder settings per output format. Bitrate only applies to lossy formats.
function encoderArgs(format, bitrate) {
    switch (format) {
        case 'mp3': return ['-c:a', 'libmp3lame', '-b:a', bitrate];
        case 'ogg': return ['-c:a', 'libvorbis', '-b:a', bitrate];
        case 'm4a': return ['-c:a', 'aac', '-b:a', bitrate];
        case 'wav': return ['-c:a', 'pcm_s16le'];
        case 'flac': return ['-c:a', 'flac'];
        default: throw new Error(`Unsupported output format: ${format}`);
    }
}

async function convertAudio(file, format, bitrate) {
    await loadFFmpeg();

    const dot = file.name.lastIndexOf('.');
    const baseName = dot > 0 ? file.name.slice(0, dot) : file.name;
    const inputName = 'input' + (dot > 0 ? file.name.slice(dot) : '');
    const outputName = `output.${format}`;

    ffmpeg.FS('writeFile', inputName, await fetchFile(file));
    try {
        await ffmpeg.run('-i', inputName, '-vn', ...encoderArgs(format, bitrate), outputName);
        let data;
        try {
            data = ffmpeg.FS('readFile', outputName);
        } catch (error) {
            throw new Error(`ffmpeg could not convert ${file.name} to ${format}`);
        }
        const mimeType = MIME_TYPES[format] || `audio/${format}`;
        const blob = new Blob([data.buffer], { type: mimeType });
        return {
            data: URL.createObjectURL(blob),
            mimeType,
            filename: `${baseName}.${format}`,
            originalName: file.name,
            originalSize: file.size,
            size: blob.size
        };
    } finally {
        // The single-threaded core exits when a command finishes, and a second
        // run on the same instance fails with "Program terminated". Drop the
        // instance so the next conversion loads a fresh one (the browser caches
        // the download).
        try { ffmpeg.exit(); } catch (error) { /* already exited */ }
        ffmpegLoading = null;
    }
}

window.audioConverter = {
    convertAudio
};
