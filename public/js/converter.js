// Image conversion function
async function convertImage(file, format, quality) {
    console.log('Starting image conversion:', { file, format, quality });
    
    try {
        // Optimize compression options based on format
        const options = {
            maxSizeMB: 10,
            maxWidthOrHeight: 4096,
            useWebWorker: true,
            fileType: `image/${format}`,
            quality: quality / 100,
            alwaysKeepResolution: true,
            initialQuality: quality / 100,
            // Add optimizations for different formats
            ...getFormatSpecificOptions(format)
        };
        
        console.log('Compression options:', options);
        
        // Compress the image with progress tracking
        const compressedFile = await imageCompression(file, {
            ...options,
            onProgress: (progress) => {
                console.log(`Compression progress: ${Math.round(progress * 100)}%`);
                // Update progress in UI if needed
                const progressElement = document.getElementById('conversionProgress');
                if (progressElement) {
                    progressElement.style.width = `${Math.round(progress * 100)}%`;
                }
            }
        });
        
        console.log('Compression complete:', compressedFile);
        
        // Create a blob URL for the result
        const url = URL.createObjectURL(compressedFile);
        console.log('Created blob URL:', url);
        
        return {
            data: url,
            mimeType: `image/${format}`,
            filename: `${file.name.split('.')[0]}.${format}`,
            originalName: file.name,
            originalSize: file.size,
            size: compressedFile.size
        };
    } catch (error) {
        console.error('Error in image conversion:', error);
        throw error;
    }
}

// Helper function to get format-specific compression options
function getFormatSpecificOptions(format) {
    switch (format) {
        case 'jpeg':
        case 'jpg':
            return {
                // JPEG-specific optimizations
                mozjpeg: true,
                exifOrientation: true
            };
        case 'png':
            return {
                // PNG-specific optimizations
                maxSizeMB: 5, // PNGs can be larger
                alwaysKeepResolution: true
            };
        case 'webp':
            return {
                // WebP-specific optimizations
                maxSizeMB: 2, // WebP has better compression
                alwaysKeepResolution: true
            };
        default:
            return {};
    }
}

// Export functions
window.converter = {
    convertImage
}; 