import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { SERVER_SETTINGS } from './../../../settings';
import { uploadToS3 } from '@/lib/uploadToS3';

const replicate = new Replicate({
  auth: SERVER_SETTINGS.replicateApiToken,
});

async function streamToBuffer(
  stream: ReadableStream<Uint8Array>
): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  let done = false;
  while (!done) {
    const { value, done: readerDone } = await reader.read();
    if (value) chunks.push(value);
    done = readerDone;
  }

  return Buffer.concat(chunks);
}

type ReplicateOutput = string[]; 

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

  let output: ReplicateOutput = [];
  try {
    output = (await replicate.run('stability-ai/stable-diffusion-3', {
      input,
    })) as ReplicateOutput;
    console.log('output', output);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to generate image' });
  }

  if (!Array.isArray(output) || output.length === 0) {
    return NextResponse.json({ error: 'Invalid output from Replicate API' });
  }

  let imageUrl: string = '';
  console.log('output', output);

  const imageResponse = await fetch(output[0]);
  const imageStream = imageResponse.body as ReadableStream;
  const buffer = await streamToBuffer(imageStream);
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
