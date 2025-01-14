import { useState } from 'react';
import { z } from 'zod';
const ZReplicateSchema = z.object({
  imageUrl: z.string(),
});

export function useImageGeneration() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const generateImage = async (prompt: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/replicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Failed to generate image');

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      const parsedData = ZReplicateSchema.parse(data);
      setImage(parsedData.imageUrl);
    } catch (error) {
      console.error('Error:', error);
      setImage(null);
    } finally {
      setLoading(false);
    }
  };
  return { generateImage, image, loading };
}
