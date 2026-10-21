import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  Wand2,
  Star,
  Trash2,
  Moon,
  Sun,
  Layers,
  Image,
  Video,
  FileText,
  Briefcase,
  GraduationCap,
  Code,
  Cpu,
  Palette,
  CheckCircle2,
  ChevronDown,
  Terminal,
  Pencil,
  Zap,
  Clock
} from 'lucide-react';

const CATEGORIES = {
  DESIGN: { label: 'Design & Visuals', icon: Palette, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  IMAGE: { label: 'Image Generation', icon: Image, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  VIDEO: { label: 'Video Production', icon: Video, color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  WRITING: { label: 'Writing & Copy', icon: FileText, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  BUSINESS: { label: 'Business & Strategy', icon: Briefcase, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  EDUCATION: { label: 'Education & Learning', icon: GraduationCap, color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  CODING: { label: 'Coding & Architecture', icon: Code, color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  AI_PRODUCTIVITY: { label: 'AI & Workflows', icon: Cpu, color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  GENERAL: { label: 'General / Custom', icon: Layers, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' }
};

const PLATFORMS = [
  { id: 'Universal', name: 'Universal AI' },
  { id: 'ChatGPT', name: 'ChatGPT / OpenAI' },
  { id: 'Midjourney', name: 'Midjourney v6' },
  { id: 'Claude', name: 'Claude 3.5 Sonnet' },
  { id: 'Gemini', name: 'Google Gemini' },
  { id: 'GoogleImage', name: 'Imagen 3 / SDXL' },
  { id: 'AIVideo', name: 'Runway Gen-3 / Sora' },
  { id: 'AICoding', name: 'Cursor / Copilot' }
];

const MODES = [
  { id: 'QUICK', name: 'Ringkas', desc: 'Ringkas & to-the-point' },
  { id: 'PRO', name: 'Standar', desc: 'Terstruktur & lengkap' },
  { id: 'EXPERT', name: 'Expert', desc: 'Lengkap dengan constraints & rules' }
];

async function callGeminiForPromptBuilder({ userQuery, targetPlatform, mode, language, styleModifier = null }) {
  let apiKey = '';
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
      apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    }
  } catch (e) {
    apiKey = '';
  }

  if (!apiKey || apiKey.trim() === '') {
    throw new Error("Kunci API belum terbaca di Vercel");
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;

  const systemInstruction = `Kamu adalah AI Expert Prompt Engineer untuk "Goprompt".
Tugasmu adalah menganalisis input pengguna dan menghasilkan Prompt Berkualitas Tinggi.
Kategori: DESIGN, IMAGE, VIDEO, WRITING, BUSINESS, EDUCATION, CODING, AI_PRODUCTIVITY, atau GENERAL.
Platform Target: ${targetPlatform}. Mode Detail: ${mode}. Bahasa Output: ${language === 'EN' ? 'English' : 'Bahasa Indonesia'}.
Buat editable placeholder seperti [ NAMA BRAND ], [ TARGET AUDIENCE ] jika perlu.

Kembalikan respon DALAM FORMAT JSON SAJA dengan skema:
{
  "category": "DESIGN",
  "goal": "penjelasan",
  "outputType": "Poster",
  "detectedStyle": "Modern",
  "targetAudience": "audiens",
  "missingDetails": ["detail 1"],
  "placeholders": [
    { "tag": "[ NAMA BRAND ]", "label": "Nama Brand", "defaultValue": "Kopi Senja" }
  ],
  "generatedPrompt": "Teks prompt lengkap..."
}`;

  const payload = {
    contents: [{ parts: [{ text: `Input pengguna: "${userQuery}"` }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: { responseMimeType: "application/json" }
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Ditolak Server Google (Status ${response.status})`);
  }

  const data = await response.json();
  const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (jsonText) {
    try {
      const parsedData = JSON.parse(jsonText);
      parsedData._source = 'API_GEMINI';
      return parsedData;
    } catch (parseErr) {
      throw new Error("Format JSON tidak valid");
    }
  }
  throw new Error("Respon AI kosong");
}

function fallbackPromptGenerator(userQuery, platform, mode, language, styleModifier) {
  const queryLower = userQuery.toLowerCase();
  let category = 'GENERAL';

  if (queryLower.includes('poster') || queryLower.includes('logo') || queryLower.includes('desain') || queryLower.includes('banner')) category = 'DESIGN';
  else if (queryLower.includes('foto') || queryLower.includes('gambar') || queryLower.includes('portrait') || queryLower.includes('karakter')) category = 'IMAGE';
  else if (queryLower.includes('video') || queryLower.includes('animasi') || queryLower.includes('reels')) category = 'VIDEO';
  else if (queryLower.includes('caption') || queryLower.includes('artikel') || queryLower.includes('surat') || queryLower.includes('konten')) category = 'WRITING';
  else if (queryLower.includes('bisnis') || queryLower.includes('strategi') || queryLower.includes('marketing')) category = 'BUSINESS';
  else if (queryLower.includes('web') || queryLower.includes('app') || queryLower.includes('coding') || queryLower.includes('script')) category = 'CODING';

  const isEn = language === 'EN';
  let generatedPrompt = '';
  let placeholders = [];

  if (category === 'DESIGN' || category === 'IMAGE') {
    placeholders = [
      { tag: '[ NAMA BRAND / PRODUK ]', label: 'Nama Produk / Brand', defaultValue: 'Kopi Senja Utama' },
      { tag: '[ VISUAL UTAMA ]', label: 'Fokus Visual Utama', defaultValue: userQuery },
      { tag: '[ SKEMA WARNA ]', label: 'Skema Warna', defaultValue: 'Warm Earth Tone & Soft Gold' },
      { tag: '[ TEKS CTA ]', label: 'Teks Call to Action', defaultValue: 'Pesan Sekarang Diskon 30%!' }
    ];

    if (isEn) {
      generatedPrompt = `Create a high-converting commercial visual design for [ NAMA BRAND / PRODUK ].

Main Subject: [ VISUAL UTAMA ]
Visual Direction:
- Style: ${styleModifier || 'Modern commercial aesthetic, sharp focus, studio lighting'}
- Color Palette: [ SKEMA WARNA ]
- Call to Action Overlay: "[ TEKS CTA ]"
- Target Engine: ${platform} (${mode} Detail Mode)

Constraints: Avoid cluttered layout, distorted text, or low-resolution artifacts.`;
    } else {
      generatedPrompt = `Buat desain visual komersial profesional untuk [ NAMA BRAND / PRODUK ].

Fokus Visual Utama: [ VISUAL UTAMA ]
Arahan Gaya Visual:
- Gaya Desain: ${styleModifier || 'Modern, bersih, estetik, pencahayaan studio tajam'}
- Palet Warna: [ SKEMA WARNA ]
- Teks Promo / CTA: "[ TEKS CTA ]"
- Platform Tujuan: ${platform} (Mode: ${mode})

Instruksi Tambahan: Pastikan komposisi seimbang, tipografi mudah dibaca, dan kualitas gambar sangat tajam.`;
    }
  } else if (category === 'CODING') {
    placeholders = [
      { tag: '[ NAMA PROJECT ]', label: 'Nama Project', defaultValue: userQuery },
      { tag: '[ TECH STACK ]', label: 'Teknologi Utama', defaultValue: 'React, Tailwind CSS, Node.js' },
      { tag: '[ FITUR UTAMA ]', label: 'Daftar Fitur', defaultValue: 'Responsive UI, Dark Mode, Dashboard Analitik' }
    ];

    if (isEn) {
      generatedPrompt = `Act as a Senior Full-Stack Developer. Build a clean, production-ready implementation for: [ NAMA PROJECT ].

Tech Stack: [ TECH STACK ]
Key Features to Implement:
- [ FITUR UTAMA ]

Requirements: Write modular, well-commented code optimized for ${platform} (${mode} level). Ensure responsive design and proper error handling.`;
    } else {
      generatedPrompt = `Bertindaklah sebagai Senior Full-Stack Developer. Buat kode yang bersih dan siap rilis (production-ready) untuk: [ NAMA PROJECT ].

Tech Stack: [ TECH STACK ]
Fitur Utama yang Diinginkan:
- [ FITUR UTAMA ]

Standar Kualitas: Tulis kode yang rapi, modular, responsif di semua layar, dan dioptimalkan untuk ${platform} (Level: ${mode}). Sertakan penanganan error yang baik.`;
    }
  } else {
    placeholders = [
      { tag: '[ TOPIK UTAMA ]', label: 'Topik / Permintaan', defaultValue: userQuery },
      { tag: '[ TARGET AUDIENS ]', label: 'Target Audiens', defaultValue: 'Profesional Muda & Pengguna Sosmed' },
      { tag: '[ GAYA BAHASA ]', label: 'Nada Bicara (Tone)', defaultValue: 'Persuasif, Ramah, dan Mengalir' }
    ];

    if (isEn) {
      generatedPrompt = `Act as an expert strategist and copywriter. Create high-impact content for: [ TOPIK UTAMA ].

Target Audience: [ TARGET AUDIENS ]
Tone of Voice: [ GAYA BAHASA ]
Platform Optimization: ${platform} (Depth: ${mode})

Structure: Start with a strong hook, deliver clear value points using bullet formatting, and end with a compelling Call to Action.`;
    } else {
      generatedPrompt = `Bertindaklah sebagai ahli strategi konten dan copywriter profesional. Buat konten berkualitas tinggi untuk: [ TOPIK UTAMA ].

Target Audiens: [ TARGET AUDIENS ]
Gaya Bahasa (Tone): [ GAYA BAHASA ]
Optimasi Platform: ${platform} (Kedalaman: ${mode})

Struktur: Gunakan kalimat pembuka (hook) yang memikat, jabarkan poin penting dengan rapi, dan tutup dengan ajakan bertindak (Call to Action) yang kuat.`;
    }
  }

  return {
    category,
    goal: `Merancang prompt untuk: "${userQuery}"`,
    outputType: 'Prompt Terstruktur',
    detectedStyle: styleModifier || 'Profesional',
    targetAudience: 'Umum',
    missingDetails: [],
    placeholders,
    generatedPrompt,
    _source: 'OFFLINE_FALLBACK'
  };
}

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [inputQuery, setInputQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('Universal');
  const [selectedMode, setSelectedMode] = useState('PRO');
  const [promptLanguage, setPromptLanguage] = useState('ID');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [editablePrompt, setEditablePrompt] = useState('');
  const [placeholderValues, setPlaceholderValues] = useState({});

  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('builder');

  const [toastMessage, setToastMessage] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('upb_history_v2');
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      const savedFavs = localStorage.getItem('upb_favorites_v2');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('upb_history_v2', JSON.stringify(history));
    } catch (e) {}
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem('upb_favorites_v2', JSON.stringify(favorites));
    } catch (e) {}
  }, [favorites]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const copyToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Gagal menyalin', err);
    }
    document.body.removeChild(textArea);
  };

  const handleGenerate = async (customQuery = null, styleOverride = null) => {
    const queryToUse = customQuery || inputQuery;
    if (!queryToUse.trim()) {
      showToast("Ketik ide atau kalimat apa saja terlebih dahulu! 💡");
      return;
    }

    setIsAnalyzing(true);
    setIsCopied(false);

    try {
      const res = await callGeminiForPromptBuilder({
        userQuery: queryToUse,
        targetPlatform: selectedPlatform,
        mode: selectedMode,
        language: promptLanguage,
        styleModifier: styleOverride
      });

      setAnalysisResult(res);
      setEditablePrompt(res.generatedPrompt);
      showToast("✅ Berhasil! Prompt diracik langsung oleh AI Gemini 🚀");

      const initialPlaceholders = {};
      if (res.placeholders && Array.isArray(res.placeholders)) {
        res.placeholders.forEach((item) => {
          initialPlaceholders[item.tag] = item.defaultValue || '';
        });
      }
      setPlaceholderValues(initialPlaceholders);

      const historyItem = {
        id: Date.now(),
        title: queryToUse,
        category: res.category || 'GENERAL',
        platform: selectedPlatform,
        mode: selectedMode,
        prompt: res.generatedPrompt,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      setHistory((prev) => [historyItem, ...prev.slice(0, 24)]);
    } catch (err) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      showToast(`⚠️ Mode Cadangan Aktif (${err.message})`);

      const fallbackData = fallbackPromptGenerator(queryToUse, selectedPlatform, selectedMode, promptLanguage, styleOverride);
      setAnalysisResult(fallbackData);
      setEditablePrompt(fallbackData.generatedPrompt);

      const initialPlaceholders = {};
      if (fallbackData.placeholders && Array.isArray(fallbackData.placeholders)) {
        fallbackData.placeholders.forEach((item) => {
          initialPlaceholders[item.tag] = item.defaultValue || '';
        });
      }
      setPlaceholderValues(initialPlaceholders);

      const historyItem = {
        id: Date.now(),
        title: queryToUse,
        category: fallbackData.category || 'GENERAL',
        platform: selectedPlatform,
        mode: selectedMode,
        prompt: fallbackData.generatedPrompt,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      setHistory((prev) => [historyItem, ...prev.slice(0, 24)]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePlaceholderChange = (tag, value) => {
    const newValues = { ...placeholderValues, [tag]: value };
    setPlaceholderValues(newValues);

    if (analysisResult?.generatedPrompt) {
      let updatedText = analysisResult.generatedPrompt;
      Object.entries(newValues).forEach(([phTag, phVal]) => {
        if (phVal.trim() !== '') {
          updatedText = updatedText.split(phTag).join(phVal);
        }
      });
      setEditablePrompt(updatedText);
    }
  };

  const handleCopyPrompt = () => {
    if (!editablePrompt) return;
    copyToClipboard(editablePrompt);
    setIsCopied(true);
    showToast("Prompt berhasil disalin ke Clipboard ✓");
    setTimeout(() => setIsCopied(false), 2500);
  };

  const toggleFavorite = (item) => {
    const exists = favorites.some((f) => f.prompt === item.prompt);
    if (exists) {
      setFavorites(favorites.filter((f) => f.prompt !== item.prompt));
      showToast("Dihapus dari Favorit");
    } else {
      setFavorites([{ ...item, id: Date.now() }, ...favorites]);
      showToast("Disimpan ke Favorit ⭐");
    }
  };

  const isCurrentFavorite = favorites.some((f) => f.prompt === editablePrompt);

  const clayBg = theme === 'dark' ? 'bg-[#0f172a] text-slate-100' : 'bg-[#e2e8f0] text-slate-800';
  const clayCard = theme === 'dark'
    ? 'bg-[#1e293b] rounded-[32px] shadow-[10px_10px_20px_rgba(0,0,0,0.3),_inset_-5px_-5px_15px_rgba(0,0,0,0.2),_inset_5px_5px_15px_rgba(255,255,255,0.05)] border border-slate-700/50'
    : 'bg-[#f8fafc] rounded-[32px] shadow-[10px_10px_20px_rgba(0,0,0,0.05),_inset_-5px_-5px_15px_rgba(0,0,0,0.03),_inset_5px_5px_15px_rgba(255,255,255,0.8)] border border-white/50';
  const clayInput = theme === 'dark'
    ? 'bg-[#0f172a] text-slate-100 rounded-2xl p-4 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),_inset_-4px_-4px_8px_rgba(255,255,255,0.03)] focus:ring-2 focus:ring-orange-500/50 outline-none border-none transition-all'
    : 'bg-[#e2e8f0] text-slate-800 rounded-2xl p-4 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),_inset_-4px_-4px_8px_rgba(255,255,255,0.9)] focus:ring-2 focus:ring-orange-400/50 outline-none border-none transition-all';
  const clayBtnActive = theme === 'dark'
    ? 'bg-[#f97316] text-white rounded-[20px] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),_inset_-4px_-4px_8px_rgba(255,255,255,0.1)] font-semibold flex items-center justify-center gap-2 scale-[0.98]'
    : 'bg-[#f97316] text-white rounded-[20px] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.15),_inset_-4px_-4px_8px_rgba(255,255,255,0.3)] font-semibold flex items-center justify-center gap-2 scale-[0.98]';
  const clayBtnPrimary = theme === 'dark'
    ? 'bg-[#ea580c] text-white rounded-[24px] shadow-[8px_8px_16px_rgba(0,0,0,0.4),_inset_-4px_-4px_10px_rgba(154,52,18,0.8),_inset_4px_4px_10px_rgba(255,166,120,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-transform font-bold flex items-center justify-center gap-2'
    : 'bg-[#f97316] text-white rounded-[24px] shadow-[8px_8px_16px_rgba(249,115,22,0.25),_inset_-4px_-4px_10px_rgba(194,65,12,0.4),_inset_4px_4px_10px_rgba(255,166,120,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-transform font-bold flex items-center justify-center gap-2';
  const clayPill = theme === 'dark'
    ? 'bg-[#1e293b] rounded-full shadow-[6px_6px_12px_rgba(0,0,0,0.25),_inset_-3px_-3px_8px_rgba(0,0,0,0.3),_inset_3px_3px_8px_rgba(255,255,255,0.05)]'
    : 'bg-[#f8fafc] rounded-full shadow-[6px_6px_12px_rgba(0,0,0,0.06),_inset_-3px_-3px_8px_rgba(0,0,0,0.04),_inset_3px_3px_8px_rgba(255,255,255,0.9)]';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${clayBg}`}>
      {toastMessage && (
        <div className={`fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-auto sm:top-6 z-50 px-6 py-4 flex items-center gap-3 font-semibold ${clayCard}`}>
          <CheckCircle2 className="w-6 h-6 shrink-0 text-orange-500" />
          <span className="text-sm">{toastMessage}</span>
        </div>
      )}

      <header className={`sticky top-0 z-40 transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0f172a]/80 backdrop-blur-md' : 'bg-[#e2e8f0]/80 backdrop-blur-md'} pb-2 pt-2 rounded-b-[2rem]`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <div onClick={() => setActiveTab('builder')} className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shrink-0 ${clayPill} text-orange-500`}>
              <Wand2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h1 className="font-extrabold text-lg sm:text-xl md:text-2xl tracking-tight">Goprompt</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-1 sm:gap-2 bg-black/5 dark:bg-white/5 p-1 sm:p-1.5 rounded-[24px]">
              <button
                onClick={() => setActiveTab('builder')}
                className={`px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm transition-all ${activeTab === 'builder' ? clayBtnActive : 'hover:opacity-70 rounded-[20px]'}`}
              >
                <span className="hidden sm:inline font-semibold">Builder</span>
                <Wand2 className="w-4 h-4 sm:hidden" />
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm transition-all ${activeTab === 'history' ? clayBtnActive : 'hover:opacity-70 rounded-[20px]'}`}
              >
                <span className="hidden sm:inline font-semibold">Riwayat ({history.length})</span>
                <Clock className="w-4 h-4 sm:hidden" />
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm transition-all ${activeTab === 'favorites' ? clayBtnActive : 'hover:opacity-70 rounded-[20px]'}`}
              >
                <span className="hidden sm:inline font-semibold">Favorit ({favorites.length})</span>
                <Star className="w-4 h-4 sm:hidden" />
              </button>
            </div>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 sm:p-3 min-h-[40px] min-w-[40px] sm:min-h-[48px] sm:min-w-[48px] flex items-center justify-center ${clayPill}`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />}
            </button>
          </div>
        </div>
      </header>

      {}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        {activeTab === 'builder' && (
          <div className="space-y-10">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
                Bikin Prompt <br /><span className="text-orange-500">Gak Pakai Mikir.</span>
              </h2>
              <p className="text-base sm:text-lg font-medium text-slate-500 dark:text-slate-400">
                AI Kami Yang Akan Merancangnya Untukmu.
              </p>
            </div>

            <div className={`p-6 sm:p-10 ${clayCard}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 pl-2">Target Platform</label>
                  <div className="relative">
                    <select
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      className={`w-full appearance-none min-h-[56px] text-sm font-semibold cursor-pointer ${clayInput}`}
                    >
                      {PLATFORMS.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 pl-2">Kedalaman</label>
                  <div className={`grid grid-cols-3 gap-1 p-1.5 rounded-[24px] ${theme === 'dark' ? 'bg-[#0f172a] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4)]' : 'bg-[#e2e8f0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06)]'}`}>
                    {MODES.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMode(m.id)}
                        className={`text-xs py-3 rounded-[20px] transition-all font-semibold ${selectedMode === m.id ? clayBtnActive : 'hover:opacity-70'}`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 pl-2">Bahasa Output</label>
                  <div className={`grid grid-cols-2 gap-1 p-1.5 rounded-[24px] ${theme === 'dark' ? 'bg-[#0f172a] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4)]' : 'bg-[#e2e8f0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06)]'}`}>
                    <button
                      onClick={() => setPromptLanguage('ID')}
                      className={`text-xs py-3 rounded-[20px] transition-all font-semibold ${promptLanguage === 'ID' ? clayBtnActive : 'hover:opacity-70'}`}
                    >
                      ID (Indonesia)
                    </button>
                    <button
                      onClick={() => setPromptLanguage('EN')}
                      className={`text-xs py-3 rounded-[20px] transition-all font-semibold ${promptLanguage === 'EN' ? clayBtnActive : 'hover:opacity-70'}`}
                    >
                      EN (English)
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <textarea
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ketik ide besarmu di sini... (Contoh: Bikin poster kopi yang estetik)"
                  rows={4}
                  className={`w-full p-6 text-lg font-medium resize-none ${clayInput}`}
                />

                <button
                  onClick={() => handleGenerate()}
                  disabled={isAnalyzing}
                  className={`w-full py-5 text-lg ${clayBtnPrimary} disabled:opacity-50`}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span>Memproses Keajaiban...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6" />
                      <span>Eksekusi Prompt!</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {analysisResult && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                  <div className={`p-6 sm:p-8 ${clayCard}`}>
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
                      <h3 className="font-bold text-xl flex items-center gap-2">
                        <Terminal className="w-6 h-6 text-orange-500" /> Hasil Prompt Siap Pakai
                      </h3>
                      <div className="flex gap-3 w-full sm:w-auto">
                        <button
                          onClick={handleCopyPrompt}
                          className={`flex-1 sm:flex-initial px-6 py-3 text-sm ${isCopied ? clayBtnActive : clayBtnPrimary}`}
                        >
                          {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                          {isCopied ? 'Tersalin!' : 'Copy Prompt'}
                        </button>
                        <button
                          onClick={() => toggleFavorite({ title: inputQuery, prompt: editablePrompt, category: analysisResult.category })}
                          className={`px-4 py-3 ${clayPill} hover:scale-105 active:scale-95 transition-transform`}
                        >
                          <Star className={`w-5 h-5 ${isCurrentFavorite ? 'fill-orange-500 text-orange-500' : 'text-slate-500'}`} />
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={editablePrompt}
                      onChange={(e) => setEditablePrompt(e.target.value)}
                      rows={12}
                      className={`w-full p-6 text-sm font-mono leading-relaxed ${clayInput}`}
                    />
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  {analysisResult.placeholders && analysisResult.placeholders.length > 0 && (
                    <div className={`p-6 ${clayCard}`}>
                      <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Pencil className="w-5 h-5 text-orange-500" /> Sesuaikan Variabel
                      </h4>
                      <div className="space-y-5">
                        {analysisResult.placeholders.map((ph, idx) => (
                          <div key={idx} className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 pl-2">
                              {ph.label}
                            </label>
                            <input
                              type="text"
                              value={placeholderValues[ph.tag] || ''}
                              onChange={(e) => handlePlaceholderChange(ph.tag, e.target.value)}
                              className={`w-full ${clayInput}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {}
        {activeTab === 'history' && (
          <div className={`p-6 sm:p-10 ${clayCard} space-y-6`}>
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Clock className="w-6 h-6 text-orange-500" /> Riwayat Prompt
              </h3>
              {history.length > 0 && (
                <button onClick={() => setHistory([])} className="text-sm text-rose-500 font-semibold flex items-center gap-1 hover:underline">
                  <Trash2 className="w-4 h-4" /> Hapus Semua
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-slate-500 py-8 text-center">Belum ada riwayat prompt yang dibuat.</p>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className={`p-5 ${clayInput} flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center`}>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-orange-500">{item.platform} • {item.timestamp}</span>
                      <h4 className="font-bold text-base">{item.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 font-mono">{item.prompt}</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditablePrompt(item.prompt);
                        setInputQuery(item.title);
                        setAnalysisResult({ category: item.category, generatedPrompt: item.prompt, placeholders: [] });
                        setActiveTab('builder');
                      }}
                      className={`px-4 py-2 text-xs shrink-0 ${clayBtnPrimary}`}
                    >
                      Gunakan Lagi
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className={`p-6 sm:p-10 ${clayCard} space-y-6`}>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Star className="w-6 h-6 text-orange-500" /> Prompt Favorit
            </h3>
            {favorites.length === 0 ? (
              <p className="text-slate-500 py-8 text-center">Belum ada prompt yang disimpan ke favorit.</p>
            ) : (
              <div className="space-y-4">
                {favorites.map((item) => (
                  <div key={item.id} className={`p-5 ${clayInput} flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center`}>
                    <div className="space-y-1">
                      <h4 className="font-bold text-base">{item.title || 'Prompt Tersimpan'}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 font-mono">{item.prompt}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => {
                          copyToClipboard(item.prompt);
                          showToast("Prompt favorit disalin ✓");
                        }}
                        className={`px-4 py-2 text-xs ${clayBtnPrimary}`}
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => toggleFavorite(item)}
                        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
