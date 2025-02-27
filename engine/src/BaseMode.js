class BaseMode {
    constructor() {
        if (this.constructor === BaseMode) {
            throw new Error('BaseMode is abstract and cannot be instantiated directly');
        }
    }

    async validate(file) {
        throw new Error('validate() must be implemented by subclass');
    }

    async process(file, options) {
        throw new Error('process() must be implemented by subclass');
    }

    async getMetadata(file) {
        throw new Error('getMetadata() must be implemented by subclass');
    }

    getSupportedFormats() {
        throw new Error('getSupportedFormats() must be implemented by subclass');
    }

    getFormatOptions(format) {
        throw new Error('getFormatOptions() must be implemented by subclass');
    }
}

module.exports = BaseMode; 