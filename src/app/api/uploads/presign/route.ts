import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';
import { getS3Client } from '@/src/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) throw new Error('Missing user session');

    const { filename, contentType } = await request.json();
    if (!filename || !contentType) {
      return NextResponse.json({ error: 'filename and contentType are required' }, { status: 400 });
    }

    const bucket = process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME;
    if (!bucket) {
      throw new Error('S3_BUCKET_NAME is required for uploads');
    }

    const safeName = String(filename).replace(/[^a-zA-Z0-9._-]/g, '-');
    const key = `uploads/${userId}/${crypto.randomUUID()}-${safeName}`;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn: 300 });
    const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL || `https://${bucket}.s3.amazonaws.com`;

    return NextResponse.json({
      uploadUrl,
      key,
      publicUrl: `${publicBaseUrl.replace(/\/$/, '')}/${key}`,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create upload URL' }, { status: 400 });
  }
}
