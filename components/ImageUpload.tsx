
import React, { useCallback } from 'react';
import type { UploadedImage } from '../types';

interface ImageUploadProps {
  uploadedImages: UploadedImage[];
  setUploadedImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  disabled: boolean;
}

const fileToDataUrl = (file: File): Promise<UploadedImage> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        name: file.name,
        dataUrl: reader.result as string,
        mimeType: file.type,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const ImageUpload: React.FC<ImageUploadProps> = ({ uploadedImages, setUploadedImages, disabled }) => {

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const imagePromises = files.map(fileToDataUrl);
      try {
        const newImages = await Promise.all(imagePromises);
        setUploadedImages(prev => [...prev, ...newImages]);
      } catch (error) {
        console.error("Error reading files:", error);
      }
    }
  }, [setUploadedImages]);

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full">
      <label htmlFor="file-upload" className={`relative cursor-pointer w-full flex justify-center items-center px-4 py-6 bg-stone-800/50 text-purple-300 rounded-lg border-2 border-dashed border-stone-600 hover:border-purple-500 transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <div className="flex flex-col items-center">
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            <span className="font-medium">Upload images to edit (optional)</span>
            <span className="text-xs text-stone-400">PNG, JPG, GIF up to 10MB</span>
        </div>
        <input id="file-upload" name="file-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleFileChange} disabled={disabled} />
      </label>
      
      {uploadedImages.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-stone-300 mb-2">Uploaded Files:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group perspective-container">
                <div className="relative transform-3d group-hover:rotate-y-3">
                    <img src={image.dataUrl} alt={image.name} className="w-full h-24 object-cover rounded-md border-2 border-stone-700"/>
                    <button 
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-700"
                        aria-label="Remove image"
                    >
                        &times;
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
