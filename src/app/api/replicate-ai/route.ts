import { NextResponse, NextRequest } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    console.log('Prompt:', prompt);

    const output = await replicate.run(
      //'stability-ai/stable-diffusion-3',
      'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      {
        input: {
          prompt: prompt,
          negative_prompt: 'low quality, bad anatomy, blurry, pixelated',
          num_outputs: 1,
          num_inference_steps: 50,
          guidance_scale: 7.5,
        },
      }
    );

    console.log('Output:', output);

    return NextResponse.json({ output });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}



