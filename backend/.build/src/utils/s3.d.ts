export declare function uploadToS3(key: string, body: Buffer, contentType: string): Promise<string>;
export declare function getPresignedUploadUrl(key: string, contentType: string): Promise<string>;
export declare function deleteFromS3(key: string): Promise<void>;
export declare function generateImageKey(userId: string, requestId: string, filename: string): string;
//# sourceMappingURL=s3.d.ts.map