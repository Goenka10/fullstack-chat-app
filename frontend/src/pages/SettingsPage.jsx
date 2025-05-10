import React, { useState } from 'react';
import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { User } from "lucide-react";

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const [previewTheme, setPreviewTheme] = useState(theme);
  
  const handlePreviewTheme = (themeName) => {
    setPreviewTheme(themeName);
  };
  
  const applyTheme = () => {
    setTheme(previewTheme);
  };

  return (
    <div className="h-screen container mx-auto px-4 pt-20 max-w-5xl bg-base-300">
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          {/* Increased from text-xl to text-2xl */}
          <h2 className="text-2xl font-semibold">Theme</h2>
          {/* Increased from text-base to text-lg */}
          <p className="text-lg text-base-content/70">Choose a theme for your chat interface</p>
        </div>
        
        {/* Theme Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {THEMES.map((t) => (
            <button
              key={t}
              className={`
                group flex flex-col items-center gap-2 p-2 rounded-lg transition-colors
                ${previewTheme === t ? "bg-base-200 ring-1 ring-primary" : 
                  theme === t ? "bg-base-200/70" : "hover:bg-base-200/50"}
              `}
              onClick={() => handlePreviewTheme(t)}
            >
              {/* Increased height from h-8 to h-10 */}
              <div className="relative h-10 w-full rounded-md overflow-hidden" data-theme={t}>
                <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                  <div className="rounded bg-primary"></div>
                  <div className="rounded bg-secondary"></div>
                  <div className="rounded bg-accent"></div>
                  <div className="rounded bg-neutral"></div>
                </div>
              </div>
              {/* Increased from text-sm to text-base */}
              <span className="text-base font-medium truncate w-full text-center">
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </span>
            </button>
          ))}
        </div>
        
        {/* Preview Section */}
        <div className="mt-10">
          <div className="flex justify-between items-center mb-4">
            {/* Increased from text-xl to text-2xl */}
            <h3 className="text-2xl font-semibold">Preview</h3>
            {previewTheme !== theme && (
              <button 
                className="btn btn-primary btn-lg text-lg"
                onClick={applyTheme}
              >
                Apply Theme
              </button>
            )}
          </div>
          
          <div className="bg-base-100 rounded-xl p-8" data-theme={previewTheme}>
            {/* User message */}
            <div className="flex items-start mb-10">
              {/* Increased avatar size from w-10 to w-12 */}
              <div className="w-12 h-12 rounded-full bg-base-300 flex items-center justify-center mr-4 flex-shrink-0">
                <User className="w-7 h-7" />
              </div>
              <div className="flex flex-col">
                {/* Increased from text-lg to text-xl */}
                <div className="font-medium text-xl">User</div>
                {/* Increased from text-base to text-lg */}
                <p className="text-lg mt-1">Hello! How are you today?</p>
              </div>
            </div>
            
            {/* Your message */}
            <div className="flex justify-end">
              <div className="max-w-[80%] bg-primary text-primary-content p-5 rounded-xl">
                {/* Increased from text-lg to text-xl */}
                <div className="text-right font-medium text-xl mb-1">You</div>
                {/* Increased from text-base to text-lg */}
                <p className="text-lg">I'm doing great, thanks for asking!</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-base-content/10 my-12"></div>
      </div>
    </div>
  );
};

export default SettingsPage;