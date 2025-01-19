import { NextResponse, NextRequest } from 'next/server';
import Replicate from 'replicate';
import { writeFile } from 'node:fs/promises';
import { SERVER_SETTINGS } from './../../../settings';

const replicate = new Replicate({
  auth: SERVER_SETTINGS.replicateApiToken,
});

export async function POST(request: NextRequest) {
  const { prompt } = await request.json();

  const input = {
    width: 768,
    height: 768,
    prompt: prompt,
    refine: 'expert_ensemble_refiner',
    apply_watermark: false,
    num_inference_steps: 25,
  };
  let output;
  try {
    output = await replicate.run('stability-ai/stable-diffusion-3', {
      input,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to generate image' });
  }
  let imageUrl: string = '';

  for (const [index, item] of Object.entries(output)) {
    const filePath = `./public/${prompt}_${index}.png`;
    await writeFile(filePath, item);
    imageUrl = filePath.replace('./public', '');
  }
  console.log('images', imageUrl);
  return NextResponse.json({
    message: 'Images generated and saved successfully',
    imageUrl: imageUrl,
  });
}
