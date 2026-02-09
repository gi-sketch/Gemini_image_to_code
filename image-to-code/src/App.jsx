import { useState } from 'react';
import Split from 'react-split';
import { generateCodeFromImage } from './services/geminiService';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    setImage(URL.createObjectURL(file));
    setLoading(true);
    setError('');
    
    try {
      const code = await generateCodeFromImage(file);
      setGeneratedCode(code);
    } catch (error) {
      console.error('Error generating code:', error);
      setError('Failed to generate code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    alert('Code copied to clipboard!');
  };

  const resetApp = () => {
    setGeneratedCode('');
    setImage(null);
    setError('');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-white">✨ Image to Code Generator</h1>
        <p className="text-blue-100 text-sm mt-1">Powered by Google Gemini AI</p>
      </header>

      <div className="flex-1 overflow-hidden">
        {!generatedCode ? (
          <div className="h-full flex items-center justify-center p-8">
            <div className="max-w-2xl w-full">
              <label className="cursor-pointer block">
                <div className="border-4 border-dashed border-gray-600 rounded-2xl p-16 hover:border-blue-500 hover:bg-gray-800 transition-all duration-300">
                  {image ? (
                    <div className="text-center">
                      <img src={image} alt="Uploaded" className="max-w-full max-h-96 mx-auto rounded-lg shadow-xl" />
                      {loading && (
                        <div className="mt-6">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                          <p className="mt-4 text-blue-400 font-medium">Analyzing your design...</p>
                          <p className="text-gray-400 text-sm mt-2">This may take 10-20 seconds</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg className="w-24 h-24 mx-auto text-gray-500 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-2xl text-white mb-3 font-semibold">Drop your UI design here</p>
                      <p className="text-gray-400 mb-2">or click to browse files</p>
                      <p className="text-gray-500 text-sm">Supports: Sketches, Wireframes, Screenshots, Mockups</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={loading}
                />
              </label>
              
              {error && (
                <div className="mt-4 p-4 bg-red-900 border border-red-700 rounded-lg">
                  <p className="text-red-200">{error}</p>
                </div>
              )}

              <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm">
                  💡 <strong>Tip:</strong> Works best with clear UI designs, hand-drawn sketches, or Figma screenshots
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Split
            className="flex h-full"
            sizes={[50, 50]}
            minSize={300}
            gutterSize={10}
            gutterAlign="center"
            snapOffset={30}
            dragInterval={1}
            direction="horizontal"
            cursor="col-resize"
          >
            {/* Code Editor Panel */}
            <div className="bg-gray-800 h-full flex flex-col overflow-hidden">
              <div className="p-4 bg-gray-900 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <span>📝</span> Generated Code
                </h3>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Code
                </button>
              </div>
              <pre className="flex-1 overflow-auto p-6 text-sm font-mono">
                <code className="text-green-400 whitespace-pre-wrap">{generatedCode}</code>
              </pre>
            </div>

            {/* Live Preview Panel */}
            <div className="bg-white h-full flex flex-col overflow-hidden">
              <div className="p-4 bg-gray-900 border-b border-gray-700">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <span>👁️</span> Live Preview
                </h3>
              </div>
              <div className="flex-1 overflow-auto bg-gray-50">
                <iframe
                  srcDoc={`
                    <!DOCTYPE html>
                    <html lang="en">
                      <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                          body { margin: 0; padding: 20px; }
                        </style>
                      </head>
                      <body>
                        ${generatedCode}
                      </body>
                    </html>
                  `}
                  className="w-full h-full border-0"
                  title="Preview"
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          </Split>
        )}
      </div>

      {generatedCode && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          <button
            onClick={resetApp}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 shadow-lg font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            New Design
          </button>
        </div>
      )}
    </div>
  );
}

export default App;