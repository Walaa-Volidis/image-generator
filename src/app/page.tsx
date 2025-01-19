'use client';
import { FormEvent, useState } from 'react';
import { useImageGeneration } from './hooks/use-imageGenerator';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const { generateImage, image, loading } = useImageGeneration();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim()) return;
    await generateImage(prompt);
  };

  return (
    <div className="min-h-screen p-4 flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>AI Image Generator</CardTitle>
          <CardDescription>Create images using Replicate AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Describe the image you want to create..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={!prompt.trim() || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Image'
              )}
            </Button>
          </form>

          {image && (
            <div className="rounded-lg overflow-hidden bg-slate-100">
              <img
                src={image}
                alt="Generated image"
                className="w-full h-auto"
              />
            </div>
          )}

          {!image && !loading && (
            <div className="h-64 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
              Your generated image will appear here
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
