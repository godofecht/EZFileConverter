const sharp = require('sharp');
const path = require('path');

class ImageProcessor {
    constructor() {
        this.type = 'image';
        this.supportedFormats = ['jpeg', 'png', 'webp', 'avif', 'tiff'];
    }

    async process(file, options) {
        const { format = 'jpeg', quality = 80 } = options;
        
        if (!this.supportedFormats.includes(format)) {
            throw new Error(`Unsupported format: ${format}`);
        }

        try {
            const metadata = await sharp(file.buffer).metadata();
            const outputBuffer = await sharp(file.buffer)
                .toFormat(format, { quality })
                .toBuffer();

            // Convert buffer to base64 data URL
            const base64 = outputBuffer.toString('base64');
            const dataUrl = `data:image/${format};base64,${base64}`;

            return {
                data: dataUrl,
                mimeType: `image/${format}`,
                filename: `${path.parse(file.originalname).name}.${format}`,
                size: outputBuffer.length,
                originalSize: file.buffer.length,
                width: metadata.width,
                height: metadata.height,
                originalName: file.originalname
            };
        } catch (error) {
            console.error('Image processing error:', error);
            throw error;
        }
    }
}

module.exports = ImageProcessor; 