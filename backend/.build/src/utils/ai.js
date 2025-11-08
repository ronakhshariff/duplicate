"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectSentiment = detectSentiment;
exports.detectEntities = detectEntities;
exports.translateText = translateText;
exports.analyzeImage = analyzeImage;
exports.autoCategorizeRequest = autoCategorizeRequest;
exports.detectPriority = detectPriority;
const client_comprehend_1 = require("@aws-sdk/client-comprehend");
const client_translate_1 = require("@aws-sdk/client-translate");
const client_rekognition_1 = require("@aws-sdk/client-rekognition");
const comprehendClient = new client_comprehend_1.ComprehendClient({ region: process.env.REGION || 'us-east-1' });
const translateClient = new client_translate_1.TranslateClient({ region: process.env.REGION || 'us-east-1' });
const rekognitionClient = new client_rekognition_1.RekognitionClient({ region: process.env.REGION || 'us-east-1' });
async function detectSentiment(text, languageCode = 'en') {
    // comprehend figures out if text is positive/negative/etc
    const command = new client_comprehend_1.DetectSentimentCommand({
        Text: text,
        LanguageCode: languageCode
    });
    const response = await comprehendClient.send(command);
    const sentimentKey = response.Sentiment === 'POSITIVE' ? 'Positive' :
        response.Sentiment === 'NEGATIVE' ? 'Negative' :
            response.Sentiment === 'NEUTRAL' ? 'Neutral' : 'Mixed';
    return {
        sentiment: response.Sentiment,
        confidence: response.SentimentScore?.[sentimentKey] || 0
    };
}
async function detectEntities(text, languageCode = 'en') {
    const command = new client_comprehend_1.DetectEntitiesCommand({
        Text: text,
        LanguageCode: languageCode
    });
    const response = await comprehendClient.send(command);
    return response.Entities?.map((e) => e.Text || '') || [];
}
async function translateText(text, targetLanguage, sourceLanguage = 'auto') {
    const command = new client_translate_1.TranslateTextCommand({
        Text: text,
        SourceLanguageCode: sourceLanguage,
        TargetLanguageCode: targetLanguage
    });
    const response = await translateClient.send(command);
    return response.TranslatedText || text;
}
async function analyzeImage(imageBytes) {
    // figure out what's in the pic
    const bytesArray = new Uint8Array(imageBytes);
    const labelsCommand = new client_rekognition_1.DetectLabelsCommand({
        Image: { Bytes: bytesArray }
    });
    const labelsResponse = await rekognitionClient.send(labelsCommand);
    const labels = labelsResponse.Labels?.map((l) => l.Name || '').filter(Boolean) || [];
    // also try to read any text in there
    const textCommand = new client_rekognition_1.DetectTextCommand({
        Image: { Bytes: bytesArray }
    });
    const textResponse = await rekognitionClient.send(textCommand);
    const text = textResponse.TextDetections?.map((t) => t.DetectedText || '').filter(Boolean) || [];
    return { labels, text };
}
// basically just looks for keywords and guesses what category it is
// TODO: could use actual ML for this but keyword matching works for now
async function autoCategorizeRequest(text) {
    const lowerText = text.toLowerCase();
    // words that sound medical
    const medicalKeywords = ['medical', 'doctor', 'hospital', 'medicine', 'medication', 'pain', 'hurt', 'injured', 'faint', 'dizzy', 'sick', 'ill', 'emergency', 'ambulance', 'health'];
    const safetyKeywords = ['safety', 'unsafe', 'dangerous', 'hazard', 'danger', 'risk', 'threat', 'emergency', 'urgent', 'immediate'];
    const accessibilityKeywords = ['accessibility', 'wheelchair', 'walker', 'disabled', 'mobility', 'ramp', 'accessible', 'barrier', 'obstacle'];
    const communityKeywords = ['shovel', 'snow', 'yard', 'garden', 'move', 'furniture', 'delivery', 'groceries', 'errand', 'task', 'help', 'assistance'];
    // count how many keywords match
    let medicalScore = 0;
    let safetyScore = 0;
    let accessibilityScore = 0;
    let communityScore = 0;
    medicalKeywords.forEach(keyword => {
        if (lowerText.includes(keyword))
            medicalScore++;
    });
    safetyKeywords.forEach(keyword => {
        if (lowerText.includes(keyword))
            safetyScore++;
    });
    accessibilityKeywords.forEach(keyword => {
        if (lowerText.includes(keyword))
            accessibilityScore++;
    });
    communityKeywords.forEach(keyword => {
        if (lowerText.includes(keyword))
            communityScore++;
    });
    const scores = [
        { category: 'Medical', score: medicalScore },
        { category: 'Safety', score: safetyScore },
        { category: 'Accessibility', score: accessibilityScore },
        { category: 'Community Task', score: communityScore }
    ];
    scores.sort((a, b) => b.score - a.score);
    const maxScore = scores[0].score;
    const total = medicalScore + safetyScore + accessibilityScore + communityScore;
    // return the category with highest score, or General if nothing matches
    return {
        category: maxScore > 0 ? scores[0].category : 'General',
        confidence: total > 0 ? maxScore / total : 0.5 // confidence is how much it matched
    };
}
// tries to figure out how urgent this is based on what they wrote
// hack: just keyword matching + sentiment, could be smarter
async function detectPriority(text) {
    const lowerText = text.toLowerCase();
    // emergency words
    const emergencyKeywords = ['emergency', 'urgent', 'immediate', 'now', 'asap', 'critical', 'life', 'death', 'faint', 'can\'t breathe', 'can\'t move', 'stuck', 'trapped'];
    const highKeywords = ['important', 'soon', 'quickly', 'fast', 'need help', 'please help', 'urgently', 'serious'];
    const lowKeywords = ['whenever', 'no rush', 'flexible', 'sometime', 'eventually', 'not urgent'];
    // count matches
    let emergencyScore = 0;
    let highScore = 0;
    let lowScore = 0;
    emergencyKeywords.forEach(keyword => {
        if (lowerText.includes(keyword))
            emergencyScore += 2;
    });
    highKeywords.forEach(keyword => {
        if (lowerText.includes(keyword))
            highScore++;
    });
    lowKeywords.forEach(keyword => {
        if (lowerText.includes(keyword))
            lowScore++;
    });
    // check sentiment too - if they sound really negative, might be urgent
    const sentiment = await detectSentiment(text);
    if (sentiment.sentiment === 'NEGATIVE' && sentiment.confidence > 0.7) {
        emergencyScore += 1; // boost emergency score
    }
    // decide urgency based on scores
    if (emergencyScore >= 2) {
        return {
            urgency: 'emergency',
            confidence: 0.9,
            reason: 'Emergency keywords detected'
        };
    }
    else if (highScore > 0 || emergencyScore > 0) {
        return {
            urgency: 'high',
            confidence: 0.7,
            reason: 'High priority keywords detected'
        };
    }
    else if (lowScore > 0) {
        return {
            urgency: 'low',
            confidence: 0.6,
            reason: 'Low priority indicators found'
        };
    }
    else {
        return {
            urgency: 'medium',
            confidence: 0.5,
            reason: 'Default priority'
        };
    }
}
//# sourceMappingURL=ai.js.map