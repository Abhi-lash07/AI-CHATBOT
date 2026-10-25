import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { storageService, DEFAULT_SETTINGS } from '../services/storageService';
import { apiService } from '../services/apiService';
import { feedbackApi } from '../services/feedbackApi';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  // Navigation active view: 'chat' | 'images' | 'library' | 'scheduled' | 'plugins' | 'projects' | 'codex' | 'feedback'
  const [activeView, setActiveView] = useState('chat');

  // Core Chat State
  const [conversations, setConversations] = useState(() => storageService.getConversations());
  const [currentChatId, setCurrentChatId] = useState(() => storageService.getCurrentChatId());
  const [settings, setSettings] = useState(() => storageService.getSettings());
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftAttachedFiles, setDraftAttachedFiles] = useState([]);
  const [draftInputText, setDraftInputText] = useState('');

  // Modals & Popups
  const [activeModal, setActiveModal] = useState(null); // 'settings' | 'about' | 'help' | 'clearConfirm' | 'deleteConfirm' | 'deleteImageConfirm' | 'deleteLibraryConfirm' | 'deleteScheduledConfirm' | 'deleteProjectConfirm' | null
  const [modalData, setModalData] = useState(null);
  const [toast, setToast] = useState(null); // { message, type: 'info' | 'success' | 'error' }
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Images Section State
  const [images, setImages] = useState(() => storageService.getImages());

  // Library Section State
  const [libraryItems, setLibraryItems] = useState(() => storageService.getLibraryItems());

  // Scheduled Section State
  const [scheduledItems, setScheduledItems] = useState(() => storageService.getScheduledItems());

  // Projects Section State
  const [projects, setProjects] = useState(() => storageService.getProjects());

  // Plugins Section State
  const [plugins, setPlugins] = useState(() => storageService.getPlugins());
  const [feedback, setFeedback] = useState([]);

  // User Authentication State
  const [user, setUser] = useState(() => storageService.getUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [authLoading, setAuthLoading] = useState(false);

  const abortControllerRef = useRef(null);

  useEffect(() => {
    let isActive = true;
    const token = storageService.getToken();
    fetch('/api/auth/session', {
      credentials: 'same-origin',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          if (response.status === 401) return null;
          throw new Error(data.error || 'Unable to verify your sign-in session.');
        }
        return data.user;
      })
      .then((sessionUser) => {
        if (!isActive) return;
        if (!sessionUser) {
          storageService.clearAuth();
          setUser(null);
          return;
        }
        storageService.setUser(sessionUser);
        if (sessionUser.provider === 'google') storageService.setToken(null);
        setUser(sessionUser);
      })
      .catch((error) => {
        if (isActive) showToast(`Unable to verify your sign-in session: ${error.message}`, 'error');
      });
    return () => {
      isActive = false;
    };
  }, []);

  // Synchronize user name with settings
  useEffect(() => {
    if (user && user.name && user.name !== settings.userName) {
      setSettings((prev) => ({ ...prev, userName: user.name }));
    }
  }, [user]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (theme) => {
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemPrefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme(settings.theme);

    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme]);

  // Persist State Changes
  useEffect(() => {
    storageService.saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    storageService.setCurrentChatId(currentChatId);
  }, [currentChatId]);

  useEffect(() => {
    storageService.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    storageService.saveImages(images);
  }, [images]);

  useEffect(() => {
    storageService.saveLibraryItems(libraryItems);
  }, [libraryItems]);

  useEffect(() => {
    storageService.saveScheduledItems(scheduledItems);
  }, [scheduledItems]);

  useEffect(() => {
    storageService.saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    storageService.savePlugins(plugins);
  }, [plugins]);

  useEffect(() => {
    let isActive = true;
    feedbackApi.getMine()
      .then((data) => {
        if (isActive) setFeedback(data.feedback.map((item) => ({ ...item, type: item.feedbackType })));
      })
      .catch((error) => {
        if (isActive) showToast(`Feedback service unavailable: ${error.message}`, 'error');
      });
    return () => {
      isActive = false;
    };
  }, [user?.id]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const saveResponseFeedback = async ({ conversationId, responseId, responseContent, ...details }) => {
    const { feedback: savedFeedback } = await feedbackApi.submit({
      feedbackType: 'response',
      conversationId,
      responseId,
      responseContent,
      ...details,
    });
    const normalized = {
      ...savedFeedback,
      type: 'response',
    };
    setFeedback((previous) => [
      ...previous.filter(
        (item) => !(item.conversationId === conversationId && item.responseId === responseId)
      ),
      normalized,
    ]);
    return normalized;
  };

  const submitOverallRating = async ({ starRating, comment }) => {
    const { feedback: savedFeedback } = await feedbackApi.submit({
      feedbackType: 'overall',
      starRating,
      thumbsRating: null,
      categories: [],
      comment,
    });
    setFeedback((previous) => [{ ...savedFeedback, type: 'overall' }, ...previous]);
    showToast('Thank you! Your feedback helps us improve ChatBot AI.', 'success');
  };

  const refreshMyFeedback = async () => {
    const data = await feedbackApi.getMine();
    const ownFeedback = data.feedback.map((item) => ({ ...item, type: item.feedbackType }));
    setFeedback(ownFeedback);
    return ownFeedback;
  };

  // Real In-App Scheduler: Check for due reminders every 30 seconds
  useEffect(() => {
    const checkScheduled = () => {
      const now = new Date();
      setScheduledItems((prev) =>
        prev.map((item) => {
          if (!item.completed && !item.notified && item.date && item.time) {
            const itemDate = new Date(`${item.date}T${item.time}`);
            if (itemDate <= now) {
              showToast(`⏰ Reminder Due: ${item.title}`, 'info');
              return { ...item, notified: true };
            }
          }
          return item;
        })
      );
    };

    checkScheduled();
    const interval = setInterval(checkScheduled, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get current active conversation
  const currentConversation = conversations.find((c) => c.id === currentChatId) || null;
  const currentMessages = currentConversation ? currentConversation.messages : [];

  // ==========================================
  // NAVIGATION & CHAT ACTIONS
  // ==========================================

  const createNewChat = () => {
    if (isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
    setCurrentChatId(null);
    setActiveView('chat');
    setDraftInputText('');
    setDraftAttachedFiles([]);
  };

  const selectChat = (id) => {
    if (isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
    setCurrentChatId(id);
    setActiveView('chat');
  };

  // Send a message (User -> Backend -> Gemini Streaming)
  const sendMessage = async (textContent, attachedFiles = []) => {
    if ((!textContent || !textContent.trim()) && (!attachedFiles || attachedFiles.length === 0)) {
      return;
    }

    // Auto-save uploaded image files to Images library so they are accessible in Images view
    if (attachedFiles && attachedFiles.length > 0) {
      attachedFiles.forEach((file) => {
        if (file.type && file.type.startsWith('image/')) {
          addImageFromChat(file);
        }
      });
    }

    let targetChatId = currentChatId;
    let updatedConversations = [...conversations];

    // If starting a new conversation, create unique conversation record
    if (!targetChatId) {
      targetChatId = 'chat_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const generatedTitle =
        textContent && textContent.trim()
          ? textContent.trim().slice(0, 38) + (textContent.trim().length > 38 ? '...' : '')
          : (attachedFiles[0]?.name ? `Image: ${attachedFiles[0].name.slice(0, 24)}` : 'New Conversation');

      const newConversation = {
        id: targetChatId,
        title: generatedTitle,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        projectId: null,
        messages: [],
      };

      updatedConversations = [newConversation, ...conversations];
      setConversations(updatedConversations);
      setCurrentChatId(targetChatId);
    }

    const userMessageId = 'msg_user_' + Date.now();
    const userMessage = {
      id: userMessageId,
      role: 'user',
      content: textContent ? textContent.trim() : '',
      files: attachedFiles || [],
      timestamp: Date.now(),
    };

    const aiMessageId = 'msg_ai_' + (Date.now() + 1);
    const tempAiMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now() + 1,
      isStreaming: true,
      isError: false,
    };

    // Add user message & empty assistant placeholder to active conversation
    updatedConversations = updatedConversations.map((conv) => {
      if (conv.id === targetChatId) {
        return {
          ...conv,
          updatedAt: Date.now(),
          messages: [...conv.messages, userMessage, tempAiMessage],
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setIsGenerating(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const activeConv = updatedConversations.find((c) => c.id === targetChatId);
      const conversationHistory = activeConv ? activeConv.messages.slice(0, -1) : [userMessage];

      const onChunk = (streamedContent) => {
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === targetChatId) {
              return {
                ...conv,
                messages: conv.messages.map((m) =>
                  m.id === aiMessageId ? { ...m, content: streamedContent } : m
                ),
              };
            }
            return conv;
          })
        );
      };

      try {
        await apiService.streamChat({
          messages: conversationHistory,
          model: settings.selectedModel,
          systemPrompt: settings.systemPrompt,
          temperature: settings.temperature,
          apiKey: settings.apiKey,
          onChunk,
          signal: abortController.signal,
        });
      } catch (streamErr) {
        if (streamErr.name === 'AbortError' || streamErr.message?.includes('cancelled')) {
          throw streamErr;
        }
        console.error('Backend stream error:', streamErr);
        onChunk(
          streamErr.message ||
            'Sorry, the AI response could not be generated at this time. Please check your network and Gemini API configuration.'
        );
      }

      // Mark generation complete
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === targetChatId) {
            return {
              ...conv,
              messages: conv.messages.map((m) =>
                m.id === aiMessageId ? { ...m, isStreaming: false } : m
              ),
            };
          }
          return conv;
        })
      );
    } catch (err) {
      if (err.name === 'AbortError' || err.message?.includes('cancelled')) {
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === targetChatId) {
              return {
                ...conv,
                messages: conv.messages.map((m) =>
                  m.id === aiMessageId ? { ...m, isStreaming: false } : m
                ),
              };
            }
            return conv;
          })
        );
      } else {
        console.error('AI Generation Error:', err);
        const errorFeedback = `⚠️ **Error Generating Response:**\n\n${
          err.message || 'An unexpected error occurred.'
        }\n\n*Tip: Check that GEMINI_API_KEY is configured in the backend .env file.*`;

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === targetChatId) {
              return {
                ...conv,
                messages: conv.messages.map((m) =>
                  m.id === aiMessageId
                    ? { ...m, content: errorFeedback, isError: true, isStreaming: false }
                    : m
                ),
              };
            }
            return conv;
          })
        );
        showToast('Generation failed: ' + (err.message || 'Network error'), 'error');
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
      showToast('Generation stopped', 'info');
    }
  };

  const regenerateResponse = async (responseId = null) => {
    if (isGenerating || !currentConversation || currentConversation.messages.length === 0) return;

    const msgs = [...currentConversation.messages];
    const responseIndex = responseId
      ? msgs.findIndex((message) => message.id === responseId && message.role === 'assistant')
      : msgs.length;
    let userMessageIndex = -1;

    for (let i = Math.min(responseIndex, msgs.length - 1); i >= 0; i--) {
      if (msgs[i].role === 'user') {
        userMessageIndex = i;
        break;
      }
    }

    if (userMessageIndex === -1) return;

    const userMsg = msgs[userMessageIndex];
    const truncatedMessages = msgs.slice(0, userMessageIndex);

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === currentChatId) {
          return {
            ...conv,
            messages: truncatedMessages,
          };
        }
        return conv;
      })
    );

    await sendMessage(userMsg.content, userMsg.files);
  };

  const renameChat = (id, newTitle) => {
    if (!newTitle || !newTitle.trim()) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle.trim(), updatedAt: Date.now() } : c))
    );
    showToast('Conversation renamed', 'success');
  };

  const deleteChat = (id) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentChatId === id) {
      setCurrentChatId(null);
    }
    showToast('Conversation deleted', 'info');
  };

  const clearAllChats = () => {
    setConversations([]);
    setCurrentChatId(null);
    storageService.saveConversations([]);
    showToast('All chat history cleared', 'info');
  };

  // ==========================================
  // IMAGES SECTION HANDLERS
  // ==========================================

  const addImage = (imageObj) => {
    const newImage = {
      id: 'img_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: imageObj.name || 'Uploaded Image',
      type: imageObj.type || 'image/png',
      size: imageObj.size || 0,
      data: imageObj.data,
      uploadedAt: Date.now(),
      associatedChatId: currentChatId || null,
    };
    setImages((prev) => [newImage, ...prev]);
    showToast(`Image "${newImage.name}" added to Images library`, 'success');
    return newImage;
  };

  const addImageFromChat = (file) => {
    setImages((prev) => {
      // Avoid duplicate images with exact same data
      if (prev.some((img) => img.data === file.data)) return prev;
      const newImg = {
        id: 'img_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: file.name || 'Chat Attachment',
        type: file.type || 'image/png',
        size: file.size || 0,
        data: file.data,
        uploadedAt: Date.now(),
        associatedChatId: currentChatId || null,
      };
      return [newImg, ...prev];
    });
  };

  const deleteImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    showToast('Image removed from library', 'info');
  };

  const startChatWithImage = (imageItem) => {
    // Switch to Chat view and pre-populate draft attached image
    setActiveView('chat');
    setDraftAttachedFiles([
      {
        name: imageItem.name,
        type: imageItem.type,
        data: imageItem.data,
        size: imageItem.size,
      },
    ]);
    setDraftInputText('Explain this image in detail:');
    showToast(`Image "${imageItem.name}" attached. Type your question or send!`, 'success');
  };

  // ==========================================
  // LIBRARY SECTION HANDLERS
  // ==========================================

  const saveToLibrary = ({ title, content, category = 'AI Responses', sourceChatId = null }) => {
    if (!content) return;
    const cleanTitle = title || (content.slice(0, 36) + '...');
    const newItem = {
      id: 'lib_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title: cleanTitle,
      content,
      category,
      sourceChatId: sourceChatId || currentChatId,
      createdAt: Date.now(),
    };
    setLibraryItems((prev) => [newItem, ...prev]);
    showToast('Saved response to Library!', 'success');
  };

  const renameLibraryItem = (id, newTitle) => {
    if (!newTitle || !newTitle.trim()) return;
    setLibraryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, title: newTitle.trim() } : item))
    );
    showToast('Library item renamed', 'success');
  };

  const deleteLibraryItem = (id) => {
    setLibraryItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Item removed from Library', 'info');
  };

  // ==========================================
  // SCHEDULED TASKS SECTION HANDLERS
  // ==========================================

  const addScheduledItem = (task) => {
    const newItem = {
      id: 'sched_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title: task.title.trim(),
      description: task.description ? task.description.trim() : '',
      date: task.date,
      time: task.time,
      category: task.category || 'Reminder',
      status: 'upcoming',
      completed: false,
      notified: false,
      createdAt: Date.now(),
    };
    setScheduledItems((prev) => [newItem, ...prev]);
    showToast(`Scheduled "${newItem.title}" for ${newItem.date} ${newItem.time}`, 'success');
  };

  const updateScheduledItem = (id, updated) => {
    setScheduledItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    showToast('Scheduled task updated', 'success');
  };

  const toggleScheduledComplete = (id) => {
    setScheduledItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: !item.completed,
              status: !item.completed ? 'completed' : 'upcoming',
            }
          : item
      )
    );
  };

  const deleteScheduledItem = (id) => {
    setScheduledItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Scheduled item deleted', 'info');
  };

  // ==========================================
  // PROJECTS SECTION HANDLERS
  // ==========================================

  const addProject = ({ name, description, color = '#818CF8' }) => {
    const newProj = {
      id: 'proj_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name.trim(),
      description: description ? description.trim() : '',
      color,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setProjects((prev) => [newProj, ...prev]);
    showToast(`Project "${newProj.name}" created`, 'success');
    return newProj;
  };

  const renameProject = (id, { name, description, color }) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              name: name !== undefined ? name.trim() : p.name,
              description: description !== undefined ? description.trim() : p.description,
              color: color || p.color,
              updatedAt: Date.now(),
            }
          : p
      )
    );
    showToast('Project updated', 'success');
  };

  const deleteProject = (id) => {
    // Unlink conversations associated with this project (does NOT delete conversations!)
    setConversations((prev) =>
      prev.map((c) => (c.projectId === id ? { ...c, projectId: null } : c))
    );
    setProjects((prev) => prev.filter((p) => p.id !== id));
    showToast('Project deleted (conversations preserved)', 'info');
  };

  const assignChatToProject = (chatId, projectId) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, projectId } : c))
    );
    const targetProj = projects.find((p) => p.id === projectId);
    showToast(
      targetProj
        ? `Conversation moved to project "${targetProj.name}"`
        : 'Conversation removed from project',
      'success'
    );
  };

  // ==========================================
  // PLUGINS SECTION HANDLERS
  // ==========================================

  const togglePlugin = (id) => {
    setPlugins((prev) =>
      prev.map((plugin) => {
        if (plugin.id === id) {
          const nextStatus = plugin.status === 'connected' ? 'available' : 'connected';
          showToast(
            `${plugin.name} is now ${nextStatus === 'connected' ? 'Connected' : 'Disconnected'}`,
            'info'
          );
          return { ...plugin, status: nextStatus };
        }
        return plugin;
      })
    );
  };

  const configurePlugin = (id, updatedDetails) => {
    setPlugins((prev) =>
      prev.map((plugin) => (plugin.id === id ? { ...plugin, ...updatedDetails } : plugin))
    );
    showToast('Plugin configuration saved', 'success');
  };

  // ==========================================
  // REAL AUTHENTICATION HANDLERS
  // ==========================================

  const loginUser = async (email, password) => {
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in.');
      }

      setUser(data.user);
      storageService.setUser(data.user);
      storageService.setToken(data.token);
      setSettings((prev) => ({ ...prev, userName: data.user.name }));
      setAuthModalOpen(false);
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      return { success: true };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const registerUser = async (name, email, password) => {
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account.');
      }

      setUser(data.user);
      storageService.setUser(data.user);
      storageService.setToken(data.token);
      setSettings((prev) => ({ ...prev, userName: data.user.name }));
      setAuthModalOpen(false);
      showToast(`Account created! Welcome, ${data.user.name}`, 'success');
      return { success: true };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Password reset failed.');
      }
      showToast(`Reset code generated: ${data.resetCode}`, 'info');
      return { success: true, resetCode: data.resetCode };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }
      showToast('Password updated! You can now log in.', 'success');
      setAuthMode('login');
      return { success: true };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      const token = storageService.getToken();
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('The server could not end your session.');
    } catch (error) {
      showToast(`Sign out failed: ${error.message}`, 'error');
      return;
    }
    setUser(null);
    storageService.clearAuth();
    setSettings((prev) => ({ ...prev, userName: 'Explorer' }));
    showToast('Signed out successfully', 'info');
  };

  // General Settings & Modals
  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Settings saved', 'success');
  };

  const openModal = (modalName, data = null) => {
    setActiveModal(modalName);
    setModalData(data);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  return (
    <ChatContext.Provider
      value={{
        // Navigation Views
        activeView,
        setActiveView,

        // Core Chat
        conversations,
        currentChatId,
        currentConversation,
        currentMessages,
        isGenerating,
        settings,
        feedback,
        draftAttachedFiles,
        setDraftAttachedFiles,
        draftInputText,
        setDraftInputText,

        // Modals & Search
        activeModal,
        modalData,
        toast,
        searchQuery,
        setSearchQuery,
        isSidebarOpen,
        setIsSidebarOpen,

        // Chat Actions
        sendMessage,
        stopGenerating,
        regenerateLastResponse: regenerateResponse,
        regenerateResponse,
        createNewChat,
        selectChat,
        renameChat,
        deleteChat,
        clearAllChats,
        updateSettings,
        openModal,
        closeModal,
        showToast,
        saveResponseFeedback,
        submitOverallRating,
        refreshMyFeedback,

        // Images Section
        images,
        addImage,
        deleteImage,
        startChatWithImage,

        // Library Section
        libraryItems,
        saveToLibrary,
        renameLibraryItem,
        deleteLibraryItem,

        // Scheduled Section
        scheduledItems,
        addScheduledItem,
        updateScheduledItem,
        toggleScheduledComplete,
        deleteScheduledItem,

        // Projects Section
        projects,
        addProject,
        renameProject,
        deleteProject,
        assignChatToProject,

        // Plugins Section
        plugins,
        togglePlugin,
        configurePlugin,

        // Real Authentication
        user,
        authModalOpen,
        setAuthModalOpen,
        authMode,
        setAuthMode,
        authLoading,
        loginUser,
        registerUser,
        forgotPassword,
        resetPassword,
        logoutUser,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
