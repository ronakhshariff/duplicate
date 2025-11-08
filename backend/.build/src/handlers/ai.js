"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateText = exports.analyzeImageHandler = void 0;
const ai_1 = require("../utils/ai");
const analyzeImageHandler = async (event) => {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'need body' })
            };
        }
        const body = JSON.parse(event.body);
        const { imageData, imageUrl } = body;
        if (!imageData && !imageUrl) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'need image data or url' })
            };
        }
        // convert to bytes for rekognition
        let imageBytes;
        if (imageUrl) {
            // @ts-ignore - node-fetch types are annoying
            const fetch = (await Promise.resolve().then(() => __importStar(require('node-fetch')))).default;
            const response = await fetch(imageUrl);
            imageBytes = Buffer.from(await response.arrayBuffer());
        }
        else {
            imageBytes = Buffer.from(imageData, 'base64');
        }
        const analysis = await (0, ai_1.analyzeImage)(imageBytes);
        console.log('analyzed image, found:', analysis.labels.length, 'labels');
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(analysis)
        };
    }
    catch (error) {
        console.error('Error analyzing image:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: error?.message || 'failed' })
        };
    }
};
exports.analyzeImageHandler = analyzeImageHandler;
const translateText = async (event) => {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'need body' })
            };
        }
        const body = JSON.parse(event.body);
        const { text, targetLanguage, sourceLanguage = 'auto' } = body;
        if (!text || !targetLanguage) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'need text and target language' })
            };
        }
        const translated = await (0, ai_1.translateText)(text, targetLanguage, sourceLanguage);
        // TODO: maybe cache translations so we don't keep translating the same stuff
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                originalText: text,
                translatedText: translated,
                targetLanguage
            })
        };
    }
    catch (error) {
        console.error('Error translating text:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: error?.message || 'failed' })
        };
    }
};
exports.translateText = translateText;
//# sourceMappingURL=ai.js.map