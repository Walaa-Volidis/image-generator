import { NextResponse, NextRequest } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    console.log('Prompt:', prompt);
    console.log('hey open ai', openai);
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '512x512',
      quality: 'standard',
    });

    const imageUrl = response.data[0].url;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}

// import { NextResponse, NextRequest } from 'next/server';
// import Replicate from 'replicate';

// const replicate = new Replicate({
//   auth: process.env.REPLICATE_API_TOKEN,
// });

// export async function POST(request: NextRequest) {
//   try {
//     const { prompt } = await request.json();
//     console.log('Prompt:', prompt);

//     const output = await replicate.run(
//       'stability-ai/stable-diffusion-3',
//       {
//         input: {
//           prompt: prompt,
//         },
//       }
//     );

//     console.log('Output:', output);

//     return NextResponse.json({ output });
//   } catch (error) {
//     console.error('Error:', error);
//     return NextResponse.json(
//       { error: 'Failed to generate image' },
//       { status: 500 }
//     );
//   }
// }
