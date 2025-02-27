const { BaseMode } = require('@convertible/engine');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const path = require('path');
const { Readable } = require('stream');

// Configure ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

class AudioMode extends BaseMode {
    constructor() {
        super();
        this.supportedFormats = ['mp3', 'wav', 'ogg', 'm4a', 'flac'];
        this.supportedInputFormats = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/flac'];
    }

    async validate(file) {
        return this.supportedInputFormats.includes(file.mimetype);
    }

    async process(file, options) {
        const { format = 'mp3', bitrate = '192k' } = options;
        
        if (!this.supportedFormats.includes(format)) {
            throw new Error(`Unsupported format: ${format}`);
        }

        return new Promise((resolve, reject) => {
            // Create a readable stream from the buffer
            const inputStream = new Readable();
            inputStream.push(file.buffer);
            inputStream.push(null);

            let outputBuffer = [];
            let metadata = {};

            const command = ffmpeg(inputStream)
                .toFormat(format)
                .audioBitrate(bitrate);

            // Pipe to memory buffer instead of file
            const stream = command.pipe();

            stream.on('data', chunk => {
                outputBuffer.push(chunk);
            });

            stream.on('end', () => {
                const finalBuffer = Buffer.concat(outputBuffer);
                const base64 = finalBuffer.toString('base64');
                const dataUrl = `data:audio/${format};base64,${base64}`;

                resolve({
                    data: dataUrl,
                    mimeType: `audio/${format}`,
                    filename: `${path.parse(file.originalname).name}.${format}`,
                    size: finalBuffer.length,
                    originalSize: file.buffer.length,
                    bitrate: bitrate,
                    originalName: file.originalname,
                    ...metadata
                });
            });

            stream.on('error', error => {
                console.error('Audio processing error:', error);
                reject(error);
            });

            // Get audio metadata
            command.ffprobe((err, data) => {
                if (!err && data.streams[0]) {
                    const audioStream = data.streams[0];
                    metadata = {
                        duration: audioStream.duration,
                        sampleRate: audioStream.sample_rate,
                        channels: audioStream.channels
                    };
                }
            });
        });
    }

    getSupportedFormats() {
        return this.supportedFormats;
    }

    getFormatOptions(format) {
        const commonOptions = {
            bitrate: {
                type: 'select',
                options: ['128k', '192k', '256k', '320k'],
                default: '192k'
            }
        };

        const formatSpecific = {
            mp3: {
                ...commonOptions
            },
            wav: {
                // WAV doesn't use bitrate
                sampleRate: {
                    type: 'select',
                    options: ['44100', '48000', '96000'],
                    default: '44100'
                }
            },
            ogg: {
                ...commonOptions,
                quality: {
                    type: 'range',
                    min: 0,
                    max: 10,
                    default: 6,
                    step: 1
                }
            },
            m4a: {
                ...commonOptions
            },
            flac: {
                compressionLevel: {
                    type: 'range',
                    min: 0,
                    max: 12,
                    default: 5,
                    step: 1
                }
            }
        };

        return formatSpecific[format] || commonOptions;
    }
}

module.exports = AudioMode; 