
import React, { useState, useCallback } from 'react';
import { generateImageFromImage } from './services/geminiService';
import { UploadIcon, SparklesIcon, XCircleIcon } from './components/icons';

const App: React.FC = () => {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalImageFile(file);
      setGeneratedImageUrl(null);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setOriginalImageFile(null);
    setOriginalImageUrl(null);
    setGeneratedImageUrl(null);
    setError(null);
  }

  const handleSubmit = useCallback(async () => {
    if (!originalImageFile || !prompt) {
      setError('Vui lòng tải lên ảnh và nhập loại phương tiện mới.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(originalImageFile);
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const mimeType = originalImageFile.type;

        const result = await generateImageFromImage(base64Data, mimeType, prompt);
        
        if (result) {
          const newImageUrl = `data:${result.mimeType};base64,${result.base64Image}`;
          setGeneratedImageUrl(newImageUrl);
        } else {
           setError('Không thể tạo ảnh. Vui lòng thử lại với một ảnh hoặc mô tả khác.');
        }
      };
      reader.onerror = () => {
         setError('Đã xảy ra lỗi khi đọc tệp ảnh.');
         setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImageFile, prompt]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm p-4 text-center border-b border-gray-700 sticky top-0 z-10">
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
          Biến Đổi Phương Tiện Trong Ảnh
        </h1>
        <p className="text-sm text-gray-400 mt-1">Sử dụng AI để thay đổi loại xe trong ảnh của bạn</p>
      </header>

      <main className="p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Cot dieu khien */}
          <div className="flex flex-col gap-6 p-6 bg-gray-800 rounded-2xl border border-gray-700">
            <div>
              <label className="block text-lg font-semibold mb-2 text-indigo-300">1. Tải lên ảnh gốc</label>
              {originalImageUrl ? (
                 <div className="relative group">
                    <img src={originalImageUrl} alt="Original preview" className="w-full h-auto object-contain rounded-lg max-h-[400px]" />
                    <button 
                      onClick={clearImage}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-red-600/80 transition-all duration-200 opacity-0 group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      <XCircleIcon className="w-6 h-6" />
                    </button>
                 </div>
              ) : (
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-600 rounded-lg hover:border-indigo-400 hover:bg-gray-700/50 transition-colors duration-300">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadIcon className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Nhấn để tải lên</span> hoặc kéo và thả</p>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP (tối đa 5MB)</p>
                  </div>
                  <input id="image-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                </label>
              )}
            </div>

            <div>
              <label htmlFor="prompt" className="block text-lg font-semibold mb-2 text-indigo-300">2. Nhập loại phương tiện mới</label>
              <input
                id="prompt"
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ví dụ: một chiếc xe máy thể thao, tàu hỏa hơi nước,..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 placeholder-gray-500"
                disabled={!originalImageFile}
              />
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={isLoading || !originalImageFile || !prompt}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-6 h-6" />
                  Tạo ảnh mới
                </>
              )}
            </button>
          </div>
          
          {/* Cot ket qua */}
          <div className="flex items-center justify-center p-6 bg-gray-800 rounded-2xl border border-gray-700 min-h-[400px] lg:min-h-0">
             {isLoading ? (
                <div className="text-center">
                    <svg className="animate-spin mx-auto h-12 w-12 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-lg font-semibold">AI đang sáng tạo...</p>
                    <p className="text-gray-400">Quá trình này có thể mất một chút thời gian.</p>
                </div>
            ) : error ? (
                <div className="text-center text-red-400">
                    <XCircleIcon className="w-12 h-12 mx-auto mb-2"/>
                    <p className="font-semibold">Đã xảy ra lỗi</p>
                    <p className="text-sm">{error}</p>
                </div>
            ) : generatedImageUrl ? (
                <img src={generatedImageUrl} alt="Generated result" className="w-full h-auto object-contain rounded-lg max-h-[600px]" />
            ) : (
                <div className="text-center text-gray-500">
                    <SparklesIcon className="w-12 h-12 mx-auto mb-2"/>
                    <p className="font-semibold">Ảnh mới của bạn sẽ xuất hiện ở đây</p>
                    <p className="text-sm">Hãy bắt đầu bằng cách tải lên một hình ảnh và mô tả.</p>
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
