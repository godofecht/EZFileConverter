const express = require('express');
const path = require('path');

// Create express app
const app = express();

// Serve static files from public directory
app.use(express.static('public'));

// Serve index.html for root path only
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Serve index.html for /img path
app.get('/img', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Serve audio.html for /audio path
app.get('/audio', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/audio.html'));
});

// Serve daw.html for /daw path
app.get('/daw', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/daw.html'));
});

// Start server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close()); 