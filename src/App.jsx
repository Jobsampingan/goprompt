import React, { useState, useEffect } from 'react';
import {
  Sparkles,
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
  Clock,
} from 'lucide-react';

const CATEGORIES = {
  DESIGN: {
    label: 'Design & Visuals',
    icon: Palette,
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  IMAGE: {
    label: 'Image Generation',
    icon: Image,
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  VIDEO: {
    label: 'Video Production',
    icon: Video,
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
  WRITING: {
    label: 'Writing & Copy',
    icon: FileText,
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  BUSINESS: {
    label: 'Business & Strategy',
    icon: Briefcase,
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  EDUCATION: {
    label: 'Education & Learning',
    icon: GraduationCap,
    color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  CODING: {
    label: 'Coding & Architecture',
    icon: Code,
    color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
  AI_PRODUCTIVITY: {
    label: 'AI & Workflows',
    icon: Cpu,
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  },
  GENERAL: {
    label: 'General / Custom',
    icon: Layers,
    color: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  },
};

const SAMPLE_QUERIES = [
  'Foto produk estetik dengan studio lighting',
  'Caption promosi Instagram & copywriting jualan',
  'Landing page modern & responsif untuk website',
  'Pitch deck presentasi ide bisnis & startup',
];

const PLATFORMS = [
  { id: 'Universal', name: 'Universal AI' },
  { id: 'ChatGPT', name: 'ChatGPT / OpenAI' },
  { id: 'Midjourney', name: 'Midjourney v6' },
  { id: 'Claude', name: 'Claude 3.5 Sonnet' },
  { id: 'Gemini', name: 'Google Gemini' },
  { id: 'GoogleImage', name: 'Imagen 3 / SDXL' },
  { id: 'AIVideo', name: 'Runway Gen-3 / Sora' },
  { id: 'AICoding', name: 'Cursor / Copilot' },
];

const MODES = [
  { id: 'QUICK', name: 'Ringkas', desc: 'Ringkas & to-the-point' },
  { id: 'PRO', name: 'Standar', desc: 'Terstruktur & lengkap' },
  { id: 'EXPERT', name: 'Expert', desc: 'Lengkap dengan constraints & rules' },
];

async function callGeminiForPromptBuilder({
  userQuery,
  targetPlatform,
  mode,
  language,
  styleModifier = null,
}) {
  const apiKey = '';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  const systemInstruction = `
Kamu adalah AI Expert Prompt Engineer untuk "Goprompt".
Tugasmu adalah menganalisis input natural language pengguna dalam Bahasa Indonesia/Inggris dan menghasilkan Prompt Berkualitas Tinggi (High-Converting, Highly Specific, Anti-Generic).

ATURAN UTAMA:
1. Pahami intent pengguna secara cerdas meskipun input sangat singkat.
2. Klasifikasikan ke dalam salah satu kategori: DESIGN, IMAGE, VIDEO, WRITING, BUSINESS, EDUCATION, CODING, AI_PRODUCTIVITY, atau GENERAL.
3. Deteksi Platform Target: ${targetPlatform}.
4. Mode Detail: ${mode} (QUICK: singkat, PRO: terstruktur komprehensif, EXPERT: sangat detail dengan constraints, context, & evaluation criteria).
5. Bahasa Output Prompt: ${
    language === 'EN'
      ? 'English (Sangat disarankan untuk image/video/coding gen)'
      : 'Bahasa Indonesia'
  }.
6. Jika ada detail penting yang belum disebutkan pengguna, buat dalam bentuk editable placeholder seperti [ NAMA BRAND ], [ TARGET AUDIENCE ], [ WARNA UTAMA ], [ CTA ], dll.
7. Jika pengguna sudah memberikan detail dalam input, MASUKKAN LANGSUNG tanpa placeholder.
8. ${
    styleModifier
      ? `Terapkan variasi gaya/tone: ${styleModifier}.`
      : 'Gunakan pendekatan profesional dan optimal.'
  }

Kembalikan respon DALAM FORMAT JSON SAJA dengan skema:
{
  "category": "DESIGN" | "IMAGE" | "VIDEO" | "WRITING" | "BUSINESS" | "EDUCATION" | "CODING" | "AI_PRODUCTIVITY" | "GENERAL",
  "goal": "penjelasan singkat tujuan pengguna",
  "outputType": "misal: Poster Instagram 4:5 / Python Script / Script Video 30s",
  "detectedStyle": "misal: Modern Luxury / Direct Response Marketing / Clean Architecture",
  "targetAudience": "audiens teridentifikasi atau rekomendasi",
  "missingDetails": ["detail 1 yang belum ada", "detail 2"],
  "placeholders": [
    { "tag": "[ NAMA BRAND ]", "label": "Nama Brand", "defaultValue": "Kopi Senja" },
    { "tag": "[ HARGA ]", "label": "Harga Promosi", "defaultValue": "Rp 15.000" }
  ],
  "generatedPrompt": "Teks prompt lengkap dengan placeholder di dalamnya..."
}
`;

  const payload = {
    contents: [{ parts: [{ text: `Input pengguna: "${userQuery}"` }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: { responseMimeType: 'application/json' },
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (jsonText) return JSON.parse(jsonText);
    throw new Error('Invalid response format');
  } catch (error) {
    console.warn('Using intelligent fallback generator:', error);
    return fallbackPromptGenerator(
      userQuery,
      targetPlatform,
      mode,
      language,
      styleModifier
    );
  }
}

function fallbackPromptGenerator(
  userQuery,
  platform,
  mode,
  language,
  styleModifier
) {
  const queryLower = userQuery.toLowerCase();

  let category = 'GENERAL';
  if (
    queryLower.includes('poster') ||
    queryLower.includes('logo') ||
    queryLower.includes('flyer') ||
    queryLower.includes('desain') ||
    queryLower.includes('banner')
  )
    category = 'DESIGN';
  else if (
    queryLower.includes('foto') ||
    queryLower.includes('gambar') ||
    queryLower.includes('portrait') ||
    queryLower.includes('skincare') ||
    queryLower.includes('karakter')
  )
    category = 'IMAGE';
  else if (
    queryLower.includes('video') ||
    queryLower.includes('iklan video') ||
    queryLower.includes('animasi') ||
    queryLower.includes('reels')
  )
    category = 'VIDEO';
  else if (
    queryLower.includes('caption') ||
    queryLower.includes('artikel') ||
    queryLower.includes('writing') ||
    queryLower.includes('surat') ||
    queryLower.includes('post')
  )
    category = 'WRITING';
  else if (
    queryLower.includes('bisnis') ||
    queryLower.includes('presentasi') ||
    queryLower.includes('strategi') ||
    queryLower.includes('marketing')
  )
    category = 'BUSINESS';
  else if (
    queryLower.includes('modul') ||
    queryLower.includes('pelajaran') ||
    queryLower.includes('kuis') ||
    queryLower.includes('materi')
  )
    category = 'EDUCATION';
  else if (
    queryLower.includes('website') ||
    queryLower.includes('app') ||
    queryLower.includes('coding') ||
    queryLower.includes('script') ||
    queryLower.includes('python')
  )
    category = 'CODING';

  const isEn = language === 'EN';
  let generatedPrompt = '';
  let placeholders = [];
  let missingDetails = [];

  if (category === 'DESIGN' || category === 'IMAGE') {
    placeholders = [
      {
        tag: '[ PRODUCT / BRAND NAME ]',
        label: 'Nama Produk / Brand',
        defaultValue: 'Kopi Kenangan Baru',
      },
      {
        tag: '[ MAIN VISUAL / SUBJECT ]',
        label: 'Fokus Visual Utama',
        defaultValue: 'Segelas iced coffee latte dengan whipped cream melimpah',
      },
      {
        tag: '[ COLOR PALETTE ]',
        label: 'Skema Warna',
        defaultValue: 'Warm Brown, Caramel Cream, & Soft Amber',
      },
      {
        tag: '[ CALL TO ACTION ]',
        label: 'Teks CTA Promo',
        defaultValue: 'Diskon 50% Beli 1 Gratis 1 Hari Ini!',
      },
    ];
    missingDetails = [
      'Aspect Ratio / Canvas Size',
      'Headline Text',
      'Brand Guidelines',
    ];

    if (isEn) {
      generatedPrompt = `Create a high-converting, commercial advertisement design for [ PRODUCT / BRAND NAME ].

Subject: [ MAIN VISUAL / SUBJECT ]
Visual Direction:
- Style: ${
        styleModifier ||
        'Modern, ultra-clean commercial aesthetic with sharp focal contrast'
      }
- Lighting: Studio lighting with appetizing warm highlight, cinematic depth of field
- Color Palette: [ COLOR PALETTE ]
- Typography: Bold modern sans-serif headline with high legibility and balanced hierarchy
- Text Overlay / CTA: "[ CALL TO ACTION ]"

Technical Specifications:
- Target Platform Engine: ${platform}
- Mode Spec: ${
        mode === 'EXPERT'
          ? 'Hyper-detailed 8k render quality, professional commercial grade photography'
          : 'High quality standard output'
      }

Negative Constraints: Avoid cluttered layouts, illegible typography, blurry edges, oversaturated colors, or distorted elements.`;
    } else {
      generatedPrompt = `Buat desain poster iklan komersial profesional untuk [ PRODUCT / BRAND NAME ].

Fokus Visual Utama: [ MAIN VISUAL / SUBJECT ]
Arahan Gaya Visual:
- Style: ${styleModifier || 'Modern, bersih, elegan, dan estetik'}
- Pencahayaan: Studio lighting dengan kedalaman fokus tajam
- Skema Warna: [ COLOR PALETTE ]
- Tipografi: Typography modern dengan hirarki visual yang jelas
- Teks Call to Action: "[ CALL TO ACTION ]"

Spesifikasi Teknis:
- Platform Tujuan: ${platform}
- Komposisi: Produk sebagai fokus utama di tengah dengan tata letak seimbang

Instruksi Tambahan: Hindari desain yang terlalu ramai, font sulit dibaca, warna kusam, atau elemen yang mengganggu hirarki visual.`;
    }
  } else if (category === 'CODING') {
    placeholders = [
      {
        tag: '[ PROJECT NAME ]',
        label: 'Nama Project',
        defaultValue: 'Interactive Portfolio Dashboard',
      },
      {
        tag: '[ TECH STACK ]',
        label: 'Tech Stack',
        defaultValue: 'React, Tailwind CSS, Lucide Icons',
      },
      {
        tag: '[ KEY FEATURES ]',
        label: 'Fitur Utama',
        defaultValue:
          'Hero Section, Project Gallery with Filter, Dark Mode Toggle, Contact Form',
      },
    ];
    missingDetails = [
      'State Management Strategy',
      'Responsive Breakpoints',
      'Backend API Schema',
    ];

    generatedPrompt = `Act as a Senior Lead Software Engineer specializing in scalable full-stack development.

Project: [ PROJECT NAME ]
Tech Stack: [ TECH STACK ]

Objective:
Develop a production-ready, highly responsive application module implementing the following key features:
- [ KEY FEATURES ]

Requirements & Quality Standards:
- Clean code architecture following SOLID & Component Modular principles
- Seamless responsive design optimized for Mobile, Tablet, and Desktop viewports
- Robust state management with clear input validation and error boundary handling
- Accessibility (a11y) compliant with clean semantic structure

Output Format: Provide fully working, clean, and well-commented single-file code with complete implementation (no placeholders or 'TODO' blocks).`;
  } else {
    placeholders = [
      {
        tag: '[ TARGET AUDIENCE ]',
        label: 'Target Audiens',
        defaultValue: 'Profesional Muda & Content Creator',
      },
      {
        tag: '[ CORE VALUE / OFFER ]',
        label: 'Pesan Utama / Penawaran',
        defaultValue: 'Solusi otomatisasi AI yang menghemat waktu hingga 80%',
      },
      {
        tag: '[ CALL TO ACTION ]',
        label: 'Teks CTA',
        defaultValue: 'Coba Gratis Sekarang & Rasakan Bedanya!',
      },
    ];
    missingDetails = [
      'Tone of Voice Detail',
      'Content Length Limit',
      'Specific Channel Rules',
    ];

    generatedPrompt = `Act as an expert content strategist and direct-response copywriter.

Task: Generate compelling, high-converting content for "${userQuery}".
Target Audience: [ TARGET AUDIENCE ]
Core Value Proposition: [ CORE VALUE / OFFER ]
Tone & Voice: ${
      styleModifier || 'Persuasive, engaging, authoritative yet friendly'
    }

Structure:
1. Attention-grabbing Hook (drives curiosity or addresses immediate pain point)
2. Relatable problem breakdown
3. Clear solution & value proposition
4. Strong Call to Action: "[ CALL TO ACTION ]"

Constraints: Use scannable formatting, bullet points, clean spacing, and impactful typography elements.`;
  }

  return {
    category,
    goal: `Membuat prompt ${category.toLowerCase()} untuk permintaan: "${userQuery}"`,
    outputType:
      category === 'DESIGN' || category === 'IMAGE'
        ? 'Visual / Image Prompt'
        : 'Structured Text / Code Prompt',
    detectedStyle: styleModifier || 'Profesional & Modern Minimalist',
    targetAudience: 'Audiens Spesifik / Teridentifikasi',
    missingDetails,
    placeholders,
    generatedPrompt,
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

  // Fungsi fallback yang lebih aman untuk iframe
  const copyToClipboard = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    // Hindari layar scrolling otomatis ke bawah saat textarea ditambahkan
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Oops, tidak bisa menyalin teks', err);
    }
    document.body.removeChild(textArea);
  };

  useEffect(() => {
    localStorage.setItem('upb_history_v2', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('upb_favorites_v2', JSON.stringify(favorites));
  }, [favorites]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleGenerate = async (customQuery = null, styleOverride = null) => {
    const queryToUse = customQuery || inputQuery;
    if (!queryToUse.trim()) {
      showToast('Ketik ide atau kalimat apa saja terlebih dahulu! 💡');
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
        styleModifier: styleOverride,
      });

      setAnalysisResult(res);
      setEditablePrompt(res.generatedPrompt);

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
        timestamp: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setHistory((prev) => [historyItem, ...prev.slice(0, 24)]);
    } catch (err) {
      showToast('Gagal memproses prompt. Silakan coba lagi.');
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
          updatedText = updatedText.replaceAll(phTag, phVal);
        }
      });
      setEditablePrompt(updatedText);
    }
  };

  const handleCopyPrompt = () => {
    if (!editablePrompt) return;
    copyToClipboard(editablePrompt);
    setIsCopied(true);
    showToast('Prompt berhasil disalin ✓');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const toggleFavorite = (item) => {
    const exists = favorites.some((f) => f.prompt === item.prompt);
    if (exists) {
      setFavorites(favorites.filter((f) => f.prompt !== item.prompt));
      showToast('Dihapus dari Favorit');
    } else {
      setFavorites([{ ...item, id: Date.now() }, ...favorites]);
      showToast('Disimpan ke Favorit ⭐');
    }
  };

  const isCurrentFavorite = favorites.some((f) => f.prompt === editablePrompt);

  const getCategoryInfo = (catName) => {
    return CATEGORIES[catName] || CATEGORIES.GENERAL;
  };

  // --- Claymorphism Style Helpers ---
  const clayBg =
    theme === 'dark'
      ? 'bg-[#0f172a] text-slate-100'
      : 'bg-[#e2e8f0] text-slate-800';

  const clayCard =
    theme === 'dark'
      ? 'bg-[#1e293b] rounded-[32px] shadow-[10px_10px_20px_rgba(0,0,0,0.3),_inset_-5px_-5px_15px_rgba(0,0,0,0.2),_inset_5px_5px_15px_rgba(255,255,255,0.05)] border border-slate-700/50'
      : 'bg-[#f8fafc] rounded-[32px] shadow-[10px_10px_20px_rgba(0,0,0,0.05),_inset_-5px_-5px_15px_rgba(0,0,0,0.03),_inset_5px_5px_15px_rgba(255,255,255,0.8)] border border-white/50';

  const clayInput =
    theme === 'dark'
      ? 'bg-[#0f172a] text-slate-100 rounded-2xl p-4 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),_inset_-4px_-4px_8px_rgba(255,255,255,0.03)] focus:ring-2 focus:ring-orange-500/50 outline-none border-none transition-all'
      : 'bg-[#e2e8f0] text-slate-800 rounded-2xl p-4 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),_inset_-4px_-4px_8px_rgba(255,255,255,0.9)] focus:ring-2 focus:ring-orange-400/50 outline-none border-none transition-all';

  const clayBtn =
    theme === 'dark'
      ? 'bg-[#334155] text-white rounded-[20px] shadow-[6px_6px_12px_rgba(0,0,0,0.25),_inset_-3px_-3px_8px_rgba(0,0,0,0.3),_inset_3px_3px_8px_rgba(255,255,255,0.05)] hover:scale-[1.02] active:scale-[0.96] transition-transform font-semibold flex items-center justify-center gap-2'
      : 'bg-[#f1f5f9] text-slate-800 rounded-[20px] shadow-[6px_6px_12px_rgba(0,0,0,0.06),_inset_-3px_-3px_8px_rgba(0,0,0,0.04),_inset_3px_3px_8px_rgba(255,255,255,0.9)] hover:scale-[1.02] active:scale-[0.96] transition-transform font-semibold flex items-center justify-center gap-2';

  const clayBtnActive =
    theme === 'dark'
      ? 'bg-[#f97316] text-white rounded-[20px] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),_inset_-4px_-4px_8px_rgba(255,255,255,0.1)] font-semibold flex items-center justify-center gap-2 scale-[0.98]'
      : 'bg-[#f97316] text-white rounded-[20px] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.15),_inset_-4px_-4px_8px_rgba(255,255,255,0.3)] font-semibold flex items-center justify-center gap-2 scale-[0.98]';

  const clayBtnPrimary =
    theme === 'dark'
      ? 'bg-[#ea580c] text-white rounded-[24px] shadow-[8px_8px_16px_rgba(0,0,0,0.4),_inset_-4px_-4px_10px_rgba(154,52,18,0.8),_inset_4px_4px_10px_rgba(255,166,120,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-transform font-bold flex items-center justify-center gap-2'
      : 'bg-[#f97316] text-white rounded-[24px] shadow-[8px_8px_16px_rgba(249,115,22,0.25),_inset_-4px_-4px_10px_rgba(194,65,12,0.4),_inset_4px_4px_10px_rgba(255,166,120,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-transform font-bold flex items-center justify-center gap-2';

  const clayPill =
    theme === 'dark'
      ? 'bg-[#1e293b] rounded-full shadow-[6px_6px_12px_rgba(0,0,0,0.25),_inset_-3px_-3px_8px_rgba(0,0,0,0.3),_inset_3px_3px_8px_rgba(255,255,255,0.05)]'
      : 'bg-[#f8fafc] rounded-full shadow-[6px_6px_12px_rgba(0,0,0,0.06),_inset_-3px_-3px_8px_rgba(0,0,0,0.04),_inset_3px_3px_8px_rgba(255,255,255,0.9)]';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${clayBg}`}
    >
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-auto sm:top-6 z-50 px-6 py-4 flex items-center gap-3 font-semibold ${clayCard}`}
        >
          <CheckCircle2 className="w-6 h-6 shrink-0 text-orange-500" />
          <span className="text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header
        className={`sticky top-0 z-40 transition-colors duration-300 ${
          theme === 'dark'
            ? 'bg-[#0f172a]/80 backdrop-blur-md'
            : 'bg-[#e2e8f0]/80 backdrop-blur-md'
        } pb-2 pt-2 rounded-b-[2rem]`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          {/* Logo & Branding */}
          <div
            onClick={() => setActiveTab('builder')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shrink-0 ${clayPill} text-orange-500`}
            >
              <Wand2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg sm:text-xl md:text-2xl tracking-tight">
                Goprompt
              </h1>
            </div>
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-1 sm:gap-2 bg-black/5 dark:bg-white/5 p-1 sm:p-1.5 rounded-[24px]">
              <button
                onClick={() => setActiveTab('builder')}
                className={`px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm transition-all ${
                  activeTab === 'builder'
                    ? clayBtnActive
                    : 'hover:opacity-70 rounded-[20px]'
                }`}
              >
                <span className="hidden sm:inline font-semibold">Builder</span>
                <Wand2 className="w-4 h-4 sm:hidden" />
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm transition-all ${
                  activeTab === 'history'
                    ? clayBtnActive
                    : 'hover:opacity-70 rounded-[20px]'
                }`}
              >
                <span className="hidden sm:inline font-semibold">Riwayat</span>
                <Clock className="w-4 h-4 sm:hidden" />
              </button>

              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm transition-all ${
                  activeTab === 'favorites'
                    ? clayBtnActive
                    : 'hover:opacity-70 rounded-[20px]'
                }`}
              >
                <span className="hidden sm:inline font-semibold">Favorit</span>
                <Star className="w-4 h-4 sm:hidden" />
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 sm:p-3 min-h-[40px] min-w-[40px] sm:min-h-[48px] sm:min-w-[48px] flex items-center justify-center ${clayPill}`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        {activeTab === 'builder' && (
          <div className="space-y-10">
            {/* Soft Hero Section */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
                Bikin Prompt <br />
                <span className="text-orange-500">Gak Pakai Mikir.</span>
              </h2>
              <p className="text-base sm:text-lg font-medium text-slate-500 dark:text-slate-400">
                AI Kami Yang Akan Merancangnya Untukmu.
              </p>
            </div>

            {/* Main Input Card */}
            <div className={`p-6 sm:p-10 ${clayCard}`}>
              {/* Controls Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Platform Selector */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 pl-2">
                    Target Platform
                  </label>
                  <div className="relative">
                    <select
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      className={`w-full appearance-none min-h-[56px] text-sm font-semibold cursor-pointer ${clayInput}`}
                    >
                      {PLATFORMS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                  </div>
                </div>

                {/* Depth Mode Selector */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 pl-2">
                    Kedalaman
                  </label>
                  <div
                    className={`grid grid-cols-3 gap-1 p-1.5 rounded-[24px] ${
                      theme === 'dark'
                        ? 'bg-[#0f172a] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4)]'
                        : 'bg-[#e2e8f0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06)]'
                    }`}
                  >
                    {MODES.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMode(m.id)}
                        className={`text-xs py-3 rounded-[20px] transition-all font-semibold ${
                          selectedMode === m.id
                            ? clayBtnActive
                            : 'hover:opacity-70'
                        }`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Output Language Toggle */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 pl-2">
                    Bahasa
                  </label>
                  <div
                    className={`grid grid-cols-2 gap-1 p-1.5 rounded-[24px] ${
                      theme === 'dark'
                        ? 'bg-[#0f172a] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4)]'
                        : 'bg-[#e2e8f0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06)]'
                    }`}
                  >
                    <button
                      onClick={() => setPromptLanguage('ID')}
                      className={`text-xs py-3 rounded-[20px] transition-all font-semibold ${
                        promptLanguage === 'ID'
                          ? clayBtnActive
                          : 'hover:opacity-70'
                      }`}
                    >
                      ID
                    </button>
                    <button
                      onClick={() => setPromptLanguage('EN')}
                      className={`text-xs py-3 rounded-[20px] transition-all font-semibold ${
                        promptLanguage === 'EN'
                          ? clayBtnActive
                          : 'hover:opacity-70'
                      }`}
                    >
                      EN
                    </button>
                  </div>
                </div>
              </div>

              {/* Text Area */}
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

              {/* Sample Prompts */}
              <div className="mt-8 pt-8">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 pl-2 mb-4">
                  Butuh Inspirasi?
                </p>
                <div className="flex flex-wrap gap-3">
                  {SAMPLE_QUERIES.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputQuery(q);
                        handleGenerate(q);
                      }}
                      className={`px-5 py-2.5 text-xs font-semibold ${clayPill} hover:scale-105 active:scale-95 transition-transform`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Section */}
            {analysisResult && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Editable Prompt Studio */}
                <div className="lg:col-span-8 space-y-6">
                  <div className={`p-6 sm:p-8 ${clayCard}`}>
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
                      <h3 className="font-bold text-xl flex items-center gap-2">
                        <Terminal className="w-6 h-6 text-orange-500" /> Output
                        Sempurna
                      </h3>
                      <div className="flex gap-3 w-full sm:w-auto">
                        <button
                          onClick={handleCopyPrompt}
                          className={`flex-1 sm:flex-initial px-6 py-3 text-sm ${
                            isCopied ? clayBtnActive : clayBtnPrimary
                          }`}
                        >
                          {isCopied ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                          {isCopied ? 'Tersalin!' : 'Copy Prompt'}
                        </button>
                        <button
                          onClick={() =>
                            toggleFavorite({
                              title: inputQuery,
                              prompt: editablePrompt,
                              category: analysisResult.category,
                            })
                          }
                          className={`px-4 py-3 ${clayPill} hover:scale-105 active:scale-95 transition-transform`}
                        >
                          <Star
                            className={`w-5 h-5 ${
                              isCurrentFavorite
                                ? 'fill-orange-500 text-orange-500'
                                : 'text-slate-500'
                            }`}
                          />
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

                {/* Analysis & Customizer */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Variables */}
                  {analysisResult.placeholders &&
                    analysisResult.placeholders.length > 0 && (
                      <div className={`p-6 ${clayCard}`}>
                        <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
                          <Pencil className="w-5 h-5 text-orange-500" />{' '}
                          Sesuaikan Variabel
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
                                onChange={(e) =>
                                  handlePlaceholderChange(
                                    ph.tag,
                                    e.target.value
                                  )
                                }
                                className={`w-full ${clayInput}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* AI Intel */}
                  <div className={`p-6 ${clayCard}`}>
                    <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-orange-500" /> Analisis
                      AI
                    </h4>
                    <div className="space-y-6">
                      <div
                        className={`p-4 rounded-2xl ${
                          theme === 'dark'
                            ? 'bg-[#0f172a] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4)]'
                            : 'bg-[#e2e8f0] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)]'
                        }`}
                      >
                        <span className="text-xs font-semibold text-slate-500 block mb-1">
                          Kategori Terdeteksi
                        </span>
                        <p className="font-semibold">
                          {getCategoryInfo(analysisResult.category).label}
                        </p>
                      </div>
                      <div
                        className={`p-4 rounded-2xl ${
                          theme === 'dark'
                            ? 'bg-[#0f172a] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4)]'
                            : 'bg-[#e2e8f0] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)]'
                        }`}
                      >
                        <span className="text-xs font-semibold text-slate-500 block mb-1">
                          Gaya Optimal
                        </span>
                        <p className="font-semibold">
                          {analysisResult.detectedStyle || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center px-4">
              <h2 className="text-3xl font-bold tracking-tight">Riwayat</h2>
              {history.length > 0 && (
                <button
                  onClick={() => {
                    setHistory([]);
                    showToast('Riwayat dibersihkan');
                  }}
                  className={`px-5 py-2.5 text-sm text-red-500 ${clayBtn}`}
                >
                  Bersihkan
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className={`p-10 text-center ${clayCard}`}>
                <p className="font-semibold text-lg text-slate-500">
                  Belum ada riwayat prompt.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {history.map((item) => (
                  <div key={item.id} className={`p-6 sm:p-8 ${clayCard}`}>
                    <div className="flex justify-between items-start mb-6 gap-4">
                      <div>
                        <h4 className="font-bold text-xl">{item.title}</h4>
                        <span className="text-xs font-semibold mt-2 inline-block px-3 py-1 rounded-full bg-orange-500/10 text-orange-500">
                          {item.platform} • {item.timestamp}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            copyToClipboard(item.prompt);
                            showToast('Prompt disalin! ✓');
                          }}
                          className={`w-10 h-10 flex items-center justify-center ${clayPill}`}
                        >
                          <Copy className="w-4 h-4 text-slate-500" />
                        </button>
                        <button
                          onClick={() => {
                            setInputQuery(item.title);
                            setEditablePrompt(item.prompt);
                            setActiveTab('builder');
                          }}
                          className={`w-10 h-10 flex items-center justify-center ${clayPill}`}
                        >
                          <Pencil className="w-4 h-4 text-orange-500" />
                        </button>
                      </div>
                    </div>
                    <pre
                      className={`p-5 font-mono text-sm whitespace-pre-wrap max-h-48 overflow-auto ${clayInput}`}
                    >
                      {item.prompt}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="px-4">
              <h2 className="text-3xl font-bold tracking-tight">Favorit</h2>
            </div>

            {favorites.length === 0 ? (
              <div className={`p-10 text-center ${clayCard}`}>
                <p className="font-semibold text-lg text-slate-500">
                  Belum ada prompt yang disimpan.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {favorites.map((item) => (
                  <div
                    key={item.id}
                    className={`p-6 sm:p-8 flex flex-col ${clayCard}`}
                  >
                    <div className="flex justify-between items-start mb-6 gap-3">
                      <h4 className="font-bold text-lg leading-tight line-clamp-2">
                        {item.title}
                      </h4>
                      <button
                        onClick={() => toggleFavorite(item)}
                        className={`w-10 h-10 shrink-0 flex items-center justify-center ${clayPill} text-red-500`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <pre
                      className={`p-5 font-mono text-xs whitespace-pre-wrap max-h-40 overflow-auto mb-6 ${clayInput}`}
                    >
                      {item.prompt}
                    </pre>
                    <button
                      onClick={() => {
                        copyToClipboard(item.prompt);
                        showToast('Prompt disalin! ✓');
                      }}
                      className={`w-full py-4 mt-auto text-sm ${clayBtnPrimary}`}
                    >
                      <Copy className="w-5 h-5" /> Copy Prompt
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-10 text-center font-semibold text-slate-500">
        <p>Goprompt &copy; 2026</p>
      </footer>
    </div>
  );
}
