class DAWConverter {
    constructor() {
        this.supportedFormats = {
            'als': 'Ableton Live Project',
            'flp': 'FL Studio Project',
            'logicx': 'Logic Pro Project',
            'ptx': 'Pro Tools Session'
        };
    }

    async convertProject(file, format, options = {}) {
        try {
            // Create form data
            const formData = new FormData();
            formData.append('project', file);
            formData.append('format', format);
            formData.append('options', JSON.stringify(options));

            // Send to server
            const response = await fetch('/api/convert/daw', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const result = await response.json();

            // Return converted project info
            return {
                filename: result.filename,
                originalName: file.name,
                originalSize: file.size,
                size: result.size,
                data: result.data,
                mimeType: `application/x-${format}`
            };
        } catch (error) {
            console.error('Project conversion error:', error);
            throw error;
        }
    }

    getSupportedFormats() {
        return this.supportedFormats;
    }

    validateFormat(format) {
        return format in this.supportedFormats;
    }
}

// Create global instance
window.dawConverter = new DAWConverter(); 