import { S3Client } from '@aws-sdk/client-s3';

export function getS3Client() {
  const region = process.env.AWS_REGION || process.env.AWS_S3_REGION;

  if (!region) {
    throw new Error('AWS_REGION is required for S3 uploads');
  }

  return new S3Client({
    region,
    credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
  });
}
