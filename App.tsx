
import React, { useState, useCallback } from 'react';
import { generateImageFromPrompt, editImageWithPrompt } from './services/geminiService';
import { Header } from './components/Header';
import { Spinner } from './components/Spinner';
import { ImageUpload } from './components/ImageUpload';
import type { UploadedImage } from './types';

const GeneratedImageViewer: React.FC<{ images: string[], prompt: string }> = ({ images, prompt }) => {
    const downloadImage = (src: string, index: number) => {
        const link = document.createElement('a');
        link.href = src;
        const safePrompt = prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `genioaipk_${safePrompt}_${index + 1}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full">
            <h2 className="text-2xl font-orbitron text-center mb-6 text-purple-300">Your Creations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 perspective-container">
                {images.map((src, index) => (
                    <div key={index} className="group transform-3d hover:-translate-y-2 hover:rotate-x-2">
                        <div className="relative bg-stone-800 p-2 rounded-lg card-glow border border-purple-900/50">
                            <img src={src} alt={`Generated image ${index + 1} from prompt: ${prompt}`} className="w-full rounded-md aspect-square object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-md">
                                <button
                                    onClick={() => downloadImage(src, index)}
                                    className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg btn-3d"
                                >
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt to generate an image.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      let result: string[];
      if (uploadedImages.length > 0) {
        result = await editImageWithPrompt(prompt, uploadedImages);
      } else {
        result = await generateImageFromPrompt(prompt);
      }
      setGeneratedImages(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, uploadedImages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-purple-950/20 to-stone-950 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-7xl">
        <Header />

        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Control Panel */}
          <div className="flex flex-col gap-6 p-6 bg-stone-900/50 rounded-xl border border-stone-800 card-glow">
            <div>
              <label htmlFor="prompt" className="block text-lg font-orbitron mb-2 text-purple-300">
                1. Describe your vision
              </label>
              <textarea
                id="prompt"
                rows={4}
                className="w-full p-3 bg-stone-800 rounded-lg border-2 border-stone-700 focus:border-purple-500 focus:ring-purple-500 focus:ring-opacity-50 transition-colors text-stone-200 placeholder-stone-500"
                placeholder="e.g., A majestic lion with a nebula mane, photorealistic, 4k"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
                 <label className="block text-lg font-orbitron mb-2 text-purple-300">
                    2. Add reference images
                </label>
                <ImageUpload uploadedImages={uploadedImages} setUploadedImages={setUploadedImages} disabled={isLoading} />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt}
              className="w-full py-4 text-xl font-orbitron bg-purple-600 text-white rounded-lg disabled:bg-stone-600 disabled:cursor-not-allowed btn-3d"
            >
              {isLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>

          {/* Display Area */}
          <div className="flex items-center justify-center p-6 bg-stone-900/50 rounded-xl border border-stone-800 min-h-[400px] lg:min-h-full">
            {isLoading ? (
              <Spinner />
            ) : error ? (
              <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
                <h3 className="font-bold text-lg">Error</h3>
                <p>{error}</p>
              </div>
            ) : generatedImages.length > 0 ? (
              <GeneratedImageViewer images={generatedImages} prompt={prompt} />
            ) : (
              <div className="text-center text-stone-500">
                <h2 className="text-2xl font-orbitron mb-2">Welcome to GenioAIpk</h2>
                <p>Your generated images will appear here.</p>
                <p>Describe your idea, upload an image to edit, and click Generate!</p>
              </div>
            )}
          </div>
        </main>
        
        <footer className="text-center py-8 mt-12 text-stone-500 text-sm">
            <p>&copy; {new Date().getFullYear()} GenioAIpk by shahzaib ali (zavinity). All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
