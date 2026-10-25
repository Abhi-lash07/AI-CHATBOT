// Storage service for ChatBot AI
const STORAGE_KEYS = {
  CONVERSATIONS: 'chatbot_ai_conversations',
  CURRENT_CHAT_ID: 'chatbot_ai_current_id',
  SETTINGS: 'chatbot_ai_settings',
  IMAGES: 'chatbot_ai_images',
  LIBRARY: 'chatbot_ai_library',
  SCHEDULED: 'chatbot_ai_scheduled',
  PROJECTS: 'chatbot_ai_projects',
  PLUGINS: 'chatbot_ai_plugins',
  AUTH_USER: 'chatbot_ai_auth_user',
  AUTH_TOKEN: 'chatbot_ai_auth_token',
};

export const DEFAULT_SETTINGS = {
  theme: 'dark', // 'light' | 'dark' | 'system'
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  selectedModel: 'gemini-3.1-flash-lite',
  useDemoMode: !import.meta.env.VITE_GEMINI_API_KEY,
  temperature: 0.7,
  systemPrompt: 'You are ChatBot AI, a brilliant, friendly, and helpful AI assistant inspired by Google Gemini. Provide clean, well-structured, modern markdown answers with formatted code blocks, concise explanations, and creative insights.',
  userName: 'Explorer',
  avatarColor: 'indigo',
};

// Seed initial default projects
const DEFAULT_PROJECTS = [
  {
    id: 'proj_ui_ux',
    name: 'UI/UX Design Project',
    description: 'Design system guidelines, color palettes, and Gemini-inspired component prototypes.',
    color: '#818CF8',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: 'proj_devops',
    name: 'DevOps & Cloud Learning',
    description: 'Infrastructure automation, Docker containerization, Kubernetes manifests, and CI/CD.',
    color: '#34D399',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    updatedAt: Date.now() - 1000 * 60 * 60 * 12,
  },
  {
    id: 'proj_deep_learning',
    name: 'Deep Learning Assignment',
    description: 'Transformer architectures, PyTorch neural network training, and vision model benchmarks.',
    color: '#C084FC',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: 'proj_testing',
    name: 'Software Testing Project',
    description: 'Unit testing strategies, end-to-end integration suites, and API mock validations.',
    color: '#FBBF24',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    updatedAt: Date.now() - 1000 * 60 * 30,
  },
];

// Seed initial plugins
const DEFAULT_PLUGINS = [
  {
    id: 'gemini_vision',
    name: 'Google Gemini 3.1 Multimodal',
    description: 'Official Google Gen AI SDK integration for high-speed streaming text generation and vision image understanding.',
    category: 'AI Engine',
    status: 'connected',
    configurable: true,
    capabilities: ['Streaming SSE', 'Image Understanding (PNG/JPG/WEBP)', 'Code Generation', 'Multi-turn History'],
    details: 'Connected to Gemini API via backend .env configuration. Supports gemini-3.1-flash-lite.',
  },
  {
    id: 'local_ocr',
    name: 'Local Vision & OCR Engine',
    description: 'In-browser neural optical character recognition to parse certifications, badges, and code screenshots.',
    category: 'Computer Vision',
    status: 'connected',
    configurable: false,
    capabilities: ['Client-side OCR', 'Zero Latency', 'Badge Parsing'],
    details: 'Active locally using Tesseract.js engine.',
  },
  {
    id: 'web_search',
    name: 'Web Grounding & Search Engine',
    description: 'Fetches real-time search engine results and citations to enrich model responses with live web information.',
    category: 'Knowledge',
    status: 'available',
    configurable: true,
    capabilities: ['Real-time News', 'Citation Links', 'Fact Checking'],
    details: 'Available for live grounding. Toggle to enrich prompts with search queries.',
  },
  {
    id: 'github_tools',
    name: 'GitHub Repository Assistant',
    description: 'Connect personal GitHub access tokens to inspect code repositories, pull requests, and commit diffs.',
    category: 'Developer Tools',
    status: 'available',
    configurable: true,
    capabilities: ['Repo Exploration', 'Code Inspection', 'PR Reviews'],
    details: 'Configure your Personal Access Token (PAT) with read:repo scope to inspect repositories.',
  },
  {
    id: 'code_sandbox',
    name: 'Code Sandbox & Syntax Highlighting',
    description: 'Multi-language programming environment supporting Python, JavaScript, Java, C++, and Go syntax styling.',
    category: 'Developer Tools',
    status: 'connected',
    configurable: false,
    capabilities: ['Syntax Styling', 'One-Click Copy', 'Language Detection'],
    details: 'Integrated directly into Codex and chat interfaces.',
  },
];

// Seed initial scheduled tasks
const DEFAULT_SCHEDULED = [
  {
    id: 'sched_1',
    title: 'Review UI/UX Architecture & Guidelines',
    description: 'Verify Midnight Indigo design system contrast and mobile drawer alignment.',
    date: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString().slice(0, 10),
    time: '10:00',
    category: 'AI Task',
    status: 'upcoming',
    completed: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: 'sched_2',
    title: 'Practice Python Data Structures & Algorithms',
    description: 'Ask Codex for a binary tree traversal challenge in Python.',
    date: new Date(Date.now() + 1000 * 60 * 60 * 42).toISOString().slice(0, 10),
    time: '18:00',
    category: 'Learning',
    status: 'upcoming',
    completed: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 10,
  },
];

// Seed initial library items
const DEFAULT_LIBRARY = [
  {
    id: 'lib_react_hook',
    title: 'Reusable React Debounce Hook',
    category: 'Code',
    content: '```javascript\nimport { useState, useEffect } from "react";\n\nexport function useDebounce(value, delay = 300) {\n  const [debouncedValue, setDebouncedValue] = useState(value);\n\n  useEffect(() => {\n    const handler = setTimeout(() => {\n      setDebouncedValue(value);\n    }, delay);\n\n    return () => clearTimeout(handler);\n  }, [value, delay]);\n\n  return debouncedValue;\n}\n```\n\n**Usage:** Ideal for search inputs and auto-saving drafts without firing excessive requests.',
    sourceChatId: null,
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: 'lib_quantum_concept',
    title: 'Quantum Computing Analogy',
    category: 'Explanations',
    content: 'Classical bits are like a coin resting flat on a table — it must be either Heads (0) or Tails (1). A qubit in superposition is like a coin spinning on a table: until you stop and measure it, it exists in a blend of both states simultaneously.',
    sourceChatId: null,
    createdAt: Date.now() - 1000 * 60 * 60 * 36,
  },
];

export const storageService = {
  // --- Conversations ---
  getConversations: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load conversations from localStorage:', e);
      return [];
    }
  },

  saveConversations: (conversations) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to save conversations to localStorage:', e);
    }
  },

  getCurrentChatId: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_CHAT_ID) || null;
    } catch (e) {
      return null;
    }
  },

  setCurrentChatId: (id) => {
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_CHAT_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_CHAT_ID);
      }
    } catch (e) {
      console.error('Failed to set current chat id:', e);
    }
  },

  // --- Settings ---
  getSettings: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings: (settings) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  // --- Images Library ---
  getImages: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.IMAGES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveImages: (images) => {
    try {
      localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(images));
    } catch (e) {
      console.error('Failed to save images:', e);
    }
  },

  // --- Saved Library ---
  getLibraryItems: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LIBRARY);
      return data ? JSON.parse(data) : DEFAULT_LIBRARY;
    } catch (e) {
      return DEFAULT_LIBRARY;
    }
  },

  saveLibraryItems: (items) => {
    try {
      localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save library items:', e);
    }
  },

  // --- Scheduled Tasks ---
  getScheduledItems: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHEDULED);
      return data ? JSON.parse(data) : DEFAULT_SCHEDULED;
    } catch (e) {
      return DEFAULT_SCHEDULED;
    }
  },

  saveScheduledItems: (items) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHEDULED, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save scheduled items:', e);
    }
  },

  // --- Projects ---
  getProjects: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return data ? JSON.parse(data) : DEFAULT_PROJECTS;
    } catch (e) {
      return DEFAULT_PROJECTS;
    }
  },

  saveProjects: (projects) => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects:', e);
    }
  },

  // --- Plugins ---
  getPlugins: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLUGINS);
      return data ? JSON.parse(data) : DEFAULT_PLUGINS;
    } catch (e) {
      return DEFAULT_PLUGINS;
    }
  },

  savePlugins: (plugins) => {
    try {
      localStorage.setItem(STORAGE_KEYS.PLUGINS, JSON.stringify(plugins));
    } catch (e) {
      console.error('Failed to save plugins:', e);
    }
  },

  // --- User Authentication ---
  getUser: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setUser: (user) => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      }
    } catch (e) {}
  },

  getToken: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || null;
    } catch (e) {
      return null;
    }
  },

  setToken: (token) => {
    try {
      if (token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      }
    } catch (e) {}
  },

  clearAuth: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (e) {}
  },

  // Clear all data
  clearAll: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_CHAT_ID);
      localStorage.removeItem(STORAGE_KEYS.IMAGES);
      localStorage.removeItem(STORAGE_KEYS.LIBRARY);
      localStorage.removeItem(STORAGE_KEYS.SCHEDULED);
      localStorage.removeItem(STORAGE_KEYS.PROJECTS);
      localStorage.removeItem(STORAGE_KEYS.PLUGINS);
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
  },

  // Export conversations as JSON
  exportDataJSON: () => {
    const data = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      conversations: storageService.getConversations(),
      projects: storageService.getProjects(),
      library: storageService.getLibraryItems(),
      scheduled: storageService.getScheduledItems(),
      settings: storageService.getSettings(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatbot-ai-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Export specific conversation as Markdown
  exportConversationMarkdown: (conversation) => {
    if (!conversation) return;
    let md = `# ${conversation.title || 'ChatBot AI Conversation'}\n\n`;
    md += `*Exported on: ${new Date().toLocaleString()}*\n\n---\n\n`;

    conversation.messages.forEach((msg) => {
      const roleName = msg.role === 'user' ? '👤 User' : '✨ ChatBot AI';
      const time = new Date(msg.timestamp).toLocaleTimeString();
      md += `### ${roleName} (${time})\n\n${msg.content}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedTitle = (conversation.title || 'conversation').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `${sanitizedTitle}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
