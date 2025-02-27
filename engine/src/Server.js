const express = require('express');
const multer = require('multer');
const path = require('path');

class ConversionServer {
    constructor(options = {}) {
        this.app = express();
        this.port = options.port || 3000;
        this.engine = options.engine;
        this.staticDir = options.staticDir || 'public';
        this.uploadLimit = options.uploadLimit || 10 * 1024 * 1024; // 10MB default
        this.routes = options.routes || {};
        
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        // Configure multer for file uploads
        this.upload = multer({
            storage: multer.memoryStorage(),
            limits: {
                fileSize: this.uploadLimit
            }
        });

        // Serve static files
        this.app.use(express.static(this.staticDir));

        // Serve audio.html for /audio path
        this.app.get('/audio', (req, res) => {
            res.sendFile(path.join(process.cwd(), this.staticDir, 'audio.html'));
        });

        // Serve index.html for /img path
        this.app.get('/img', (req, res) => {
            res.sendFile(path.join(process.cwd(), this.staticDir, 'index.html'));
        });
    }

    setupRoutes() {
        // Handle conversion for each processor with custom routes
        for (const [type, processor] of this.engine.processors) {
            const route = this.routes[type] || `/convert/${type}`;
            
            // Handle conversion
            this.app.post(route, this.upload.array('images'), async (req, res) => {
                try {
                    const format = req.body.format;
                    const formatOptions = JSON.parse(req.body.formatOptions || '{}');
                    
                    const results = await Promise.all(req.files.map(async (file) => {
                        return await this.engine.convert(file, {
                            type,
                            format,
                            ...formatOptions
                        });
                    }));

                    res.json(results);
                } catch (error) {
                    console.error('Conversion error:', error);
                    res.status(500).json({ error: error.message });
                }
            });

            // Get supported formats
            this.app.get(`${route}/formats`, (req, res) => {
                try {
                    res.json({
                        formats: processor.getSupportedFormats(),
                        options: processor.getFormatOptions()
                    });
                } catch (error) {
                    res.status(500).json({ error: error.message });
                }
            });
        }
    }

    start() {
        return new Promise((resolve) => {
            this.server = this.app.listen(this.port, () => {
                console.log(`Conversion server running at http://localhost:${this.port}`);
                resolve(this.server);
            });
        });
    }

    stop() {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.close(() => {
                    console.log('Server stopped');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

module.exports = ConversionServer; 