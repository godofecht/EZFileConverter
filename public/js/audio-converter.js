// Import FFmpeg from CDN
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

// Initialize FFmpeg
let ffmpegLoaded = false;
async function loadFFmpeg() {
    if (!ffmpegLoaded) {
        await ffmpeg.load();
        ffmpegLoaded = true;
    }
}

// Audio conversion function
async function convertAudio(file, format, bitrate) {
    await loadFFmpeg();
    
    // Write the file to FFmpeg's virtual filesystem
    ffmpeg.FS('writeFile', file.name, await fetchFile(file));
    
    // Run the conversion
    await ffmpeg.run(
        '-i', file.name,
        '-b:a', bitrate,
        `output.${format}`
    );
    
    // Read the result
    const data = ffmpeg.FS('readFile', `output.${format}`);
    
    // Create a blob URL for the result
    const blob = new Blob([data.buffer], { type: `audio/${format}` });
    const url = URL.createObjectURL(blob);
    
    // Clean up
    ffmpeg.FS('unlink', file.name);
    ffmpeg.FS('unlink', `output.${format}`);
    
    return {
        data: url,
        mimeType: `audio/${format}`,
        filename: `${file.name.split('.')[0]}.${format}`,
        originalName: file.name,
        originalSize: file.size,
        size: blob.size
    };
}

// Export functions
window.audioConverter = {
    convertAudio
}; 