"use client";

import { useState, useEffect } from 'react';
import { Settings } from "lucide-react";

export function SettingsDialog() {
  const [apiKey, setApiKey] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load API key from localStorage on mount
    const storedKey = localStorage.getItem('gemini-api-key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSave = () => {
    try {
      if (!apiKey) throw new Error('API key cannot be empty');
      if (!apiKey.startsWith('AIza')) throw new Error('Invalid API key format');
      
      localStorage.setItem('gemini-api-key', apiKey);
      window.GEMINI_API_KEY = apiKey;
      setIsOpen(false);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid API key');
    }
  };

  const handleReset = () => {
    localStorage.removeItem('gemini-api-key');
    window.GEMINI_API_KEY = '';
    setApiKey('');
    setError('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <Settings className="h-5 w-5" />
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <Settings className="h-5 w-5" />
      </button>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-semibold mb-4">Settings</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium mb-1">
                Gemini API Key
              </label>
              <input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
              />
              {error && (
                <div className="text-red-500 text-sm mt-2">{error}</div>
              )}
              <button
                onClick={handleReset}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Reset API Key
              </button>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
