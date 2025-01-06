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
      'stability-ai/stable-diffusion-3',
      {
        input: {
          prompt: prompt,
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
