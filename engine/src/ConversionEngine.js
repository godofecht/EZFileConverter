const sharp = require('sharp');
const ExifReader = require('exifreader');

class ConversionEngine {
    constructor() {
        this.processors = new Map();
    }

    registerProcessor(type, processor) {
        this.processors.set(type, processor);
    }

    getProcessor(type) {
        return this.processors.get(type);
    }

    async convert(file, options) {
        const processor = this.processors.get(options.type);
        if (!processor) {
            throw new Error(`No processor registered for type: ${options.type}`);
        }
        return await processor.process(file, options);
    }

    async getMetadata(file) {
        try {
            const metadata = await sharp(file.buffer).metadata();
            const exif = await ExifReader.load(file.buffer);
            return { ...metadata, exif };
        } catch (error) {
            console.error('Metadata extraction error:', error);
            return null;
        }
    }
}

module.exports = ConversionEngine; 