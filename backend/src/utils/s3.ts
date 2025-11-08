import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: process.env.REGION || 'us-east-1' });
const BUCKET_NAME = process.env.S3_BUCKET || 'neighbourly-uploads-dev';

export async function uploadToS3(key: string, body: Buffer, contentType: string): Promise<string> {
  await s3Client.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
    ACL: 'public-read' // so anyone can view the images (might want to change this later)
  }));
  
  // return the public url
  return `https://${BUCKET_NAME}.s3.${process.env.REGION || 'us-east-1'}.amazonaws.com/${key}`;
}

export async function getPresignedUploadUrl(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ACL: 'public-read'
  });
  
  // url expires in an hour, should be enough time to upload
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function deleteFromS3(key: string): Promise<void> {
  await s3Client.send(new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  }));
}

export function generateImageKey(userId: string, requestId: string, filename: string): string {
  const timestamp = Date.now();
  const extension = filename.split('.').pop() || 'jpg'; // default to jpg if no extension
  return `requests/${requestId}/${userId}-${timestamp}.${extension}`;
}

