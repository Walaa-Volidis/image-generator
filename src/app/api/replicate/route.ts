import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { SERVER_SETTINGS } from './../../../settings';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

const replicate = new Replicate({
  auth: SERVER_SETTINGS.replicateApiToken,
});

const S3 = new S3Client({
  region: SERVER_SETTINGS.region,
  endpoint: SERVER_SETTINGS.endpoint,
  credentials: {
    accessKeyId: SERVER_SETTINGS.accessKeyId,
    secretAccessKey: SERVER_SETTINGS.secretAccessKey,
  },
});

const DEST_BUCKET = SERVER_SETTINGS.destBucket;

async function streamToBuffer(stream: ReadableStream): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks = [];
  let done, value;
  while ((({ done, value } = await reader.read()), !done)) {
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function POST(request: NextRequest) {
  const { prompt } = await request.json();

  const input = {
    width: 768,
    height: 768,
    prompt,
    refine: 'expert_ensemble_refiner',
    apply_watermark: false,
    num_inference_steps: 25,
  };
  let output;
  try {
    output = await replicate.run('stability-ai/stable-diffusion-3', {
      input,
    });
    console.log('output', output);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to generate image' });
  }
  let imageUrl: string = '';
  const buffer = await streamToBuffer(output[0]);
  const imageName = `${crypto.randomUUID()}.png`;
  console.log('imageName', imageName);

  await S3.send(
    new PutObjectCommand({
      Bucket: DEST_BUCKET,
      Key: imageName,
      Body: buffer,
      ACL: 'public-read',
    })
  );
  imageUrl = `${SERVER_SETTINGS.s3CDN}${imageName}`;
  console.log('images', imageUrl);
  return NextResponse.json({
    message: 'Images generated and uploaded successfully',
    imageUrl,
  });
}
