import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { SERVER_SETTINGS } from './../../../settings';
import { uploadToS3 } from '@/lib/uploadToS3';

const replicate = new Replicate({
  auth: SERVER_SETTINGS.replicateApiToken,
});

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
  let output: unknown;
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
  console.log('output', output);
  const item = output[0];
  const buffer = await streamToBuffer(item);
  const imageName = `${crypto.randomUUID()}.png`;
  console.log('imageName', imageName);
  try {
    imageUrl = await uploadToS3(buffer);
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return NextResponse.json({ error: 'Failed to upload image to S3' });
  }
  return NextResponse.json({
    message: 'Images generated and uploaded successfully',
    imageUrl,
  });
}
