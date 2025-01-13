import { NextResponse, NextRequest } from 'next/server';
import Replicate from 'replicate';
import { writeFile } from 'node:fs/promises';
import { z } from 'zod';

const ZReplicateSchema = z.object({
  imageUrl: z.string(),
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    const input = {
      width: 768,
      height: 768,
      prompt: prompt,
      refine: 'expert_ensemble_refiner',
      apply_watermark: false,
      num_inference_steps: 25,
    };

    const output = await replicate.run('stability-ai/stable-diffusion-3', {
      input,
    });

    let imageUrl: string = '';

    for (const [index, item] of Object.entries(output)) {
      const filePath = `./public/${prompt}_${index}.png`;
      await writeFile(filePath, item);
      imageUrl = filePath.replace('./public', '');
    }
    ZReplicateSchema.parse({ imageUrl });
    console.log('images', imageUrl);
    return NextResponse.json({
      message: 'Images generated and saved successfully',
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to generate image' });
  }
}
