import React, { useState, useEffect, useContext, createContext } from 'react';

// LibreTranslate API Configuration
const LIBRETRANSLATE_API = 'https://libretranslate.de'; // Free public instance
// Alternative instances:
// 'https://translate.argosopentech.com' 
// 'https://libretranslate.com' (may require API key)

// Translation Context
const TranslationContext = createContext();

// LibreTranslate API function
const translateWithLibre = async (text, sourceLang, targetLang) => {
  try {
    const response = await fetch(`${LIBRETRANSLATE_API}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      })
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.status}`);
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error('LibreTranslate error:', error);
    return text; // Return original text if translation fails
  }
};

// Get available languages from LibreTranslate
const getAvailableLanguages = async () => {
  try {
    const response = await fetch(`${LIBRETRANSLATE_API}/languages`);
    const languages = await response.json();
    return languages;
  } catch (error) {
    console.error('Failed to fetch languages:', error);
    // Fallback to common languages
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'zh', name: 'Chinese' }
    ];
  }
};

// Translation Provider - EXPORTED
export const LibreTranslationProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState('en');
  const [sourceLang, setSourceLang] = useState('en');
  const [translationCache, setTranslationCache] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [translationQueue, setTranslationQueue] = useState([]);

  // Load available languages on mount
  useEffect(() => {
    getAvailableLanguages().then(setAvailableLanguages);
  }, []);

  // Process translation queue
  useEffect(() => {
    if (translationQueue.length > 0 && !isTranslating) {
      processTranslationQueue();
    }
  }, [translationQueue, isTranslating]);

  const processTranslationQueue = async () => {
    if (translationQueue.length === 0) return;

    setIsTranslating(true);
    const batch = [...translationQueue];
    setTranslationQueue([]);

    for (const { text, resolve } of batch) {
      try {
        const result = await translate(text);
        resolve(result);
      } catch (error) {
        resolve(text); // Fallback to original text
      }
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsTranslating(false);
  };

  const translate = async (text) => {
    if (currentLang === sourceLang) return text;
    
    const cacheKey = `${sourceLang}-${currentLang}:${text}`;
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }

    try {
      const translated = await translateWithLibre(text, sourceLang, currentLang);
      setTranslationCache(prev => ({
        ...prev,
        [cacheKey]: translated
      }));
      return translated;
    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    }
  };

  const queueTranslation = (text) => {
    return new Promise((resolve) => {
      if (currentLang === sourceLang) {
        resolve(text);
        return;
      }

      const cacheKey = `${sourceLang}-${currentLang}:${text}`;
      if (translationCache[cacheKey]) {
        resolve(translationCache[cacheKey]);
        return;
      }

      setTranslationQueue(prev => [...prev, { text, resolve }]);
    });
  };

  const changeLanguage = (lang) => {
    setCurrentLang(lang);
    // Clear cache when changing language to force retranslation
    setTranslationCache({});
  };

  const changeSourceLanguage = (lang) => {
    setSourceLang(lang);
    setTranslationCache({});
  };

  return (
    <TranslationContext.Provider value={{
      currentLang,
      sourceLang,
      changeLanguage,
      changeSourceLanguage,
      translate: queueTranslation,
      isTranslating,
      availableLanguages
    }}>
      {children}
    </TranslationContext.Provider>
  );
};

// Auto-translating Text Component - EXPORTED
export const T = ({ children, fallback = '' }) => {
  const { translate, currentLang, sourceLang } = useContext(TranslationContext);
  const [translatedText, setTranslatedText] = useState(children || fallback);

  useEffect(() => {
    const translateContent = async () => {
      const text = children || fallback;
      if (text && currentLang !== sourceLang) {
        const result = await translate(text);
        setTranslatedText(result);
      } else {
        setTranslatedText(text);
      }
    };

    translateContent();
  }, [children, fallback, currentLang, sourceLang, translate]);

  return <span>{translatedText}</span>;
};

// Language Switcher Component - EXPORTED
export const LanguageSwitcher = () => {
  const { 
    currentLang, 
    sourceLang, 
    changeLanguage, 
    changeSourceLanguage, 
    isTranslating, 
    availableLanguages 
  } = useContext(TranslationContext);

  const getLanguageName = (code) => {
    const lang = availableLanguages.find(l => l.code === code);
    return lang ? lang.name : code.toUpperCase();
  };

  const getFlag = (code) => {
    const flags = {
      'en': '🇺🇸', 'es': '🇪🇸', 'fr': '🇫🇷', 'de': '🇩🇪', 'it': '🇮🇹',
      'pt': '🇵🇹', 'ru': '🇷🇺', 'ja': '🇯🇵', 'ko': '🇰🇷', 'zh': '🇨🇳',
      'ar': '🇸🇦', 'hi': '🇮🇳', 'tr': '🇹🇷', 'pl': '🇵🇱', 'nl': '🇳🇱'
    };
    return flags[code] || '🌐';
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Source Language Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Source Language (what you write in):
        </label>
        <select
          value={sourceLang}
          onChange={(e) => changeSourceLanguage(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {availableLanguages.map(lang => (
            <option key={lang.code} value={lang.code}>
              {getFlag(lang.code)} {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Target Language Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Language:
        </label>
        <div className="flex flex-wrap gap-2">
          {availableLanguages.slice(0, 8).map(lang => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              disabled={isTranslating}
              className={`px-4 py-2 rounded-lg border transition-all duration-200 flex items-center gap-2 ${
                currentLang === lang.code 
                  ? 'bg-blue-500 text-white border-blue-500 shadow-md' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
              } ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="text-lg">{getFlag(lang.code)}</span>
              <span className="font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      {isTranslating && (
        <div className="flex items-center gap-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm">Translating with LibreTranslate...</span>
        </div>
      )}
    </div>
  );
};

// Hook to use translation context - EXPORTED
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LibreTranslationProvider');
  }
  return context;
};

// Sample Content Components
const Navigation = () => (
  <nav className="bg-gray-800 text-white p-4 rounded-lg mb-6">
    <div className="flex gap-6">
      <a href="#" className="hover:text-blue-300 transition-colors">
        <T>Home</T>
      </a>
      <a href="#" className="hover:text-blue-300 transition-colors">
        <T>About Us</T>
      </a>
      <a href="#" className="hover:text-blue-300 transition-colors">
        <T>Services</T>
      </a>
      <a href="#" className="hover:text-blue-300 transition-colors">
        <T>Contact</T>
      </a>
    </div>
  </nav>
);

const ContentSection = () => (
  <div className="space-y-6">
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        <T>Welcome to Our Website</T>
      </h1>
      <p className="text-lg text-gray-600 leading-relaxed">
        <T>This content is automatically translated using LibreTranslate, a free and open-source translation service. You can write your content in any language and it will be translated in real-time.</T>
      </p>
    </div>
    
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="font-semibold mb-2 text-gray-800">
          <T>Free Translation</T>
        </h3>
        <p className="text-gray-600 mb-4">
          <T>No API keys required for basic usage. Perfect for testing and small projects.</T>
        </p>
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
          <T>Learn More</T>
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="font-semibold mb-2 text-gray-800">
          <T>Open Source</T>
        </h3>
        <p className="text-gray-600 mb-4">
          <T>LibreTranslate is completely open source. You can even host your own instance for unlimited usage.</T>
        </p>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          <T>Get Started</T>
        </button>
      </div>
    </div>
  </div>
);

// Demo App Component
export default function App() {
  return (
    <LibreTranslationProvider>
      <div className="max-w-4xl mx-auto p-6">
        <Navigation />
        <LanguageSwitcher />
        <ContentSection />
      </div>
    </LibreTranslationProvider>
  );
}