import { ComprehendClient, DetectSentimentCommand, DetectEntitiesCommand } from '@aws-sdk/client-comprehend';
import { TranslateClient, TranslateTextCommand } from '@aws-sdk/client-translate';
import { RekognitionClient, DetectLabelsCommand, DetectTextCommand } from '@aws-sdk/client-rekognition';

declare const process: {
  env: {
    REGION?: string;
    [key: string]: string | undefined;
  };
};

interface Buffer {
  [key: number]: number;
  length: number;
}

declare const Buffer: {
  from(data: string, encoding?: string): Buffer;
  from(data: ArrayBuffer): Buffer;
  new (data: string, encoding?: string): Buffer;
};

const comprehendClient = new ComprehendClient({ region: process.env.REGION || 'us-east-1' });
const translateClient = new TranslateClient({ region: process.env.REGION || 'us-east-1' });
const rekognitionClient = new RekognitionClient({ region: process.env.REGION || 'us-east-1' });

export interface SentimentResult {
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED';
  confidence: number;
}

export async function detectSentiment(text: string, languageCode: string = 'en'): Promise<SentimentResult> {
  // comprehend figures out if text is positive/negative/etc
  const command = new DetectSentimentCommand({
    Text: text,
    LanguageCode: languageCode as any
  });
  
  const response = await comprehendClient.send(command);
  const sentimentKey = response.Sentiment === 'POSITIVE' ? 'Positive' : 
                       response.Sentiment === 'NEGATIVE' ? 'Negative' :
                       response.Sentiment === 'NEUTRAL' ? 'Neutral' : 'Mixed';
  return {
    sentiment: response.Sentiment!,
    confidence: response.SentimentScore?.[sentimentKey as keyof typeof response.SentimentScore] || 0
  };
}

export async function detectEntities(text: string, languageCode: string = 'en'): Promise<string[]> {
  const command = new DetectEntitiesCommand({
    Text: text,
    LanguageCode: languageCode as any
  });
  
  const response = await comprehendClient.send(command);
  return response.Entities?.map((e: any) => e.Text || '') || [];
}

export async function translateText(text: string, targetLanguage: string, sourceLanguage: string = 'auto'): Promise<string> {
  const command = new TranslateTextCommand({
    Text: text,
    SourceLanguageCode: sourceLanguage,
    TargetLanguageCode: targetLanguage
  });
  
  const response = await translateClient.send(command);
  return response.TranslatedText || text;
}

export interface ImageLabels {
  labels: string[];
  text?: string[];
}

export async function analyzeImage(imageBytes: Buffer): Promise<ImageLabels> {
  // figure out what's in the pic
  const bytesArray = new Uint8Array(imageBytes);
  const labelsCommand = new DetectLabelsCommand({
    Image: { Bytes: bytesArray }
  });
  
  const labelsResponse = await rekognitionClient.send(labelsCommand);
  const labels = labelsResponse.Labels?.map((l: any) => l.Name || '').filter(Boolean) || [];
  
  // also try to read any text in there
  const textCommand = new DetectTextCommand({
    Image: { Bytes: bytesArray }
  });
  
  const textResponse = await rekognitionClient.send(textCommand);
  const text = textResponse.TextDetections?.map((t: any) => t.DetectedText || '').filter(Boolean) || [];
  
  return { labels, text };
}

export interface CategoryResult {
  category: string;
  confidence: number;
}

// basically just looks for keywords and guesses what category it is
// TODO: could use actual ML for this but keyword matching works for now
export async function autoCategorizeRequest(text: string): Promise<CategoryResult> {
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
    if (lowerText.includes(keyword)) medicalScore++;
  });
  
  safetyKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) safetyScore++;
  });
  
  accessibilityKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) accessibilityScore++;
  });
  
  communityKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) communityScore++;
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

export interface PriorityResult {
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  confidence: number;
  reason?: string;
}

// tries to figure out how urgent this is based on what they wrote
// hack: just keyword matching + sentiment, could be smarter
export async function detectPriority(text: string): Promise<PriorityResult> {
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
    if (lowerText.includes(keyword)) emergencyScore += 2;
  });
  
  highKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) highScore++;
  });
  
  lowKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) lowScore++;
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
  } else if (highScore > 0 || emergencyScore > 0) {
    return {
      urgency: 'high',
      confidence: 0.7,
      reason: 'High priority keywords detected'
    };
  } else if (lowScore > 0) {
    return {
      urgency: 'low',
      confidence: 0.6,
      reason: 'Low priority indicators found'
    };
  } else {
    return {
      urgency: 'medium',
      confidence: 0.5,
      reason: 'Default priority'
    };
  }
}

