import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Video, Loader2, AlertCircle } from 'lucide-react';

export const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("Cinematic macro shot of lithium dendrites growing on a graphite anode surface inside a battery cell, freezing cold atmosphere, blue and metallic tones, high detail, 4k");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');

  const generateVideo = async () => {
    setError(null);
    setIsGenerating(true);
    setVideoUrl(null);

    try {
      // 1. Check/Request API Key
      // @ts-ignore - window.aistudio is injected by the environment
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          // @ts-ignore
          await window.aistudio.openSelectKey();
          // We assume success if they return, or they can try again.
          // Re-checking immediately might be racy, but we proceed.
        }
      }

      // 2. Initialize Client
      // We must create a new instance to ensure we pick up the latest key if it was just selected
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      // 3. Call API
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: aspectRatio
        }
      });

      // 4. Poll for completion
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      // 5. Get Result
      const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (uri) {
        // Fetch with API key header
        const response = await fetch(uri, {
          method: 'GET',
          headers: {
            'x-goog-api-key': process.env.GEMINI_API_KEY || '',
          },
        });
        
        if (!response.ok) throw new Error(`Failed to fetch video: ${response.statusText}`);
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setVideoUrl(objectUrl);
      } else {
        throw new Error("No video URI returned");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate video");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
          <Video size={20} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">AI Video Simulation (Veo 3)</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
            rows={3}
          />
        </div>

        <div className="flex gap-4">
             <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input 
                    type="radio" 
                    name="aspect" 
                    checked={aspectRatio === '16:9'} 
                    onChange={() => setAspectRatio('16:9')}
                    className="accent-purple-600"
                />
                Landscape (16:9)
             </label>
             <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input 
                    type="radio" 
                    name="aspect" 
                    checked={aspectRatio === '9:16'} 
                    onChange={() => setAspectRatio('9:16')}
                    className="accent-purple-600"
                />
                Portrait (9:16)
             </label>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button
          onClick={generateVideo}
          disabled={isGenerating}
          className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Generating Video (this may take a minute)...
            </>
          ) : (
            'Generate Simulation Video'
          )}
        </button>

        {videoUrl && (
          <div className="mt-6 rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
            <video 
              src={videoUrl} 
              controls 
              autoPlay 
              loop 
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
};
