
# Extending the Conversion Engine

This guide explains how to add new conversion types to the system. We'll use text and audio examples.

## Architecture Overview

The system is split into three main parts:
1. **Processors** (Server-side conversion logic)
2. **Converters** (Client-side UI and options)
3. **Visualizers** (Client-side preview and result display)

## Adding a New Conversion Type

### 1. Create a Server-side Processor

```javascript
// server/src/processors/TextProcessor.js
import { BaseProcessor } from '../core/BaseProcessor.js';

export class TextProcessor extends BaseProcessor {
  constructor() {
    super({
      id: 'text',
      name: 'Text Converter',
      inputFormats: ['text/plain', 'text/markdown', 'text/html'],
      outputFormats: {
        txt: {
          encoding: {
            type: 'select',
            options: ['utf-8', 'ascii', 'iso-8859-1'],
            default: 'utf-8',
          },
          lineEnding: {
            type: 'select',
            options: ['lf', 'crlf'],
            default: 'lf',
          },
        },
        md: {
          flavor: {
            type: 'select',
            options: ['github', 'commonmark'],
            default: 'github',
          },
        },
      },
    });
  }

  async process(file, options) {
    const text = await file.buffer.toString(options.encoding);
    // Process based on format...
    const processedText = text; // Add actual processing logic here
    return {
      data: Buffer.from(processedText),
      mimeType: `text/${options.format}`,
      filename: `${path.parse(file.originalname).name}.${options.format}`,
    };
  }
}
```

### 2. Create a Client-side Converter

```javascript
// client/src/converters/TextConverter.js
import { BaseConverter } from './BaseConverter.js';
import { TextVisualizer } from '../visualizers/TextVisualizer.js';

export class TextConverter extends BaseConverter {
  constructor() {
    super({
      id: 'text',
      name: 'Text Converter',
      visualizer: new TextVisualizer(),
      options: {
        format: {
          type: 'select',
          options: ['txt', 'md'],
          default: 'txt',
        },
        encoding: {
          type: 'select',
          options: ['utf-8', 'ascii', 'iso-8859-1'],
          default: 'utf-8',
        },
      },
    });
  }

  createOptionsUI() {
    return `
      <div class="form-control">
        <label class="label">Output Format</label>
        <select class="select" name="format">${this.renderFormatOptions()}</select>
      </div>
      <div class="form-control">
        <label class="label">Encoding</label>
        <select class="select" name="encoding">${this.renderEncodingOptions()}</select>
      </div>
    `;
  }
}
```

### 3. Create a Visualizer

```javascript
// client/src/visualizers/TextVisualizer.js
import { BaseVisualizer } from './BaseVisualizer.js';

export class TextVisualizer extends BaseVisualizer {
  createPreview(file, content) {
    return `
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body p-4">
          <h3 class="card-title text-sm">${file.name}</h3>
          <pre class="bg-base-200 p-4 rounded-lg overflow-auto max-h-48">
            ${this.escapeHtml(content)}
          </pre>
        </div>
      </div>
    `;
  }

  createResult(result) {
    const content = new TextDecoder().decode(result.data);
    return `
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body p-4">
          <h3 class="card-title text-sm">${result.filename}</h3>
          <pre class="bg-base-200 p-4 rounded-lg overflow-auto max-h-48">
            ${this.escapeHtml(content)}
          </pre>
          <div class="card-actions justify-end mt-2">
            <a href="data:${result.mimeType};base64,${btoa(content)}" download="${result.filename}" class="btn btn-primary btn-sm">
              Download
            </a>
          </div>
        </div>
      </div>
    `;
  }
}
```

## Audio Example

```javascript
// server/src/processors/AudioProcessor.js
import { BaseProcessor } from '../core/BaseProcessor.js';
import ffmpeg from 'fluent-ffmpeg';

export class AudioProcessor extends BaseProcessor {
  constructor() {
    super({
      id: 'audio',
      name: 'Audio Converter',
      inputFormats: ['audio/mp3', 'audio/wav', 'audio/ogg'],
      outputFormats: {
        mp3: {
          bitrate: {
            type: 'select',
            options: ['128k', '192k', '320k'],
            default: '192k',
          },
        },
        // Add other formats here...
      },
    });
  }

  async process(file, options) {
    // Audio processing logic with ffmpeg
  }
}
```