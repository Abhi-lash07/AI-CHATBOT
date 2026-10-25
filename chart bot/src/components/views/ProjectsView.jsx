import React, { useState, useMemo } from 'react';
import { useChat } from '../../context/ChatContext';
import {
  Folder,
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  Search,
  Check,
  X,
  ExternalLink,
  MinusCircle,
  Clock,
} from 'lucide-react';

const PRESET_COLORS = [
  { label: 'Indigo', value: '#818CF8' },
  { label: 'Violet', value: '#C084FC' },
  { label: 'Emerald', value: '#10B981' },
  { label: 'Amber', value: '#F59E0B' },
  { label: 'Rose', value: '#F43F5E' },
  { label: 'Sky', value: '#38BDF8' },
  { label: 'Pink', value: '#EC4899' },
  { label: 'Purple', value: '#A855F7' },
];

export function ProjectsView() {
  const {
    projects,
    conversations,
    addProject,
    renameProject,
    assignChatToProject,
    selectChat,
    createNewChat,
    openModal,
    showToast,
  } = useChat();

  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedProjectId, setExpandedProjectId] = useState(projects[0]?.id || null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#818CF8');

  // Selected chat to assign to current expanded project
  const [chatToAssign, setChatToAssign] = useState('');

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }, [projects, search]);

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setName('');
    setDescription('');
    setColor('#818CF8');
  };

  const handleStartEdit = (p) => {
    setEditingId(p.id);
    setIsCreating(false);
    setName(p.name);
    setDescription(p.description || '');
    setColor(p.color || '#818CF8');
  };

  const handleCancelForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setName('');
    setDescription('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a project name', 'error');
      return;
    }

    if (editingId) {
      renameProject(editingId, { name, description, color });
      setEditingId(null);
    } else {
      const created = addProject({ name, description, color });
      if (created) {
        setExpandedProjectId(created.id);
      }
      setIsCreating(false);
    }

    setName('');
    setDescription('');
  };

  const handleStartNewChatInProject = (project) => {
    // Create new chat and switch view
    createNewChat();
    // After creating a new chat, the conversation will be created on first send,
    // but we can also store target projectId in context if needed, or create immediate conversation:
    showToast(`New chat initiated for project "${project.name}"`, 'success');
  };

  const handleAssignChat = (projectId) => {
    if (!chatToAssign) return;
    assignChatToProject(chatToAssign, projectId);
    setChatToAssign('');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    return new Date(timestamp).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#F8FAFC] dark:bg-[#0B1020] p-4 sm:p-6 md:p-8 animate-fade-in font-sans">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#293247]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-[#151C2C] border border-indigo-200/60 dark:border-[#293247] flex items-center justify-center text-[#6366F1] dark:text-[#818CF8]">
                <Folder className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">
                Projects & Workspaces
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9CA3AF] mt-1">
              Cluster chats, vision analysis, and codex tasks into dedicated project spaces.
            </p>
          </div>

          {/* Action & Search */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center w-full sm:w-56">
              <Search className="w-4 h-4 absolute left-3 text-[#64748B] dark:text-[#9CA3AF]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] text-[#111827] dark:text-[#F3F4F6] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:border-[#818CF8] transition-colors"
              />
            </div>

            <button
              onClick={handleStartCreate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#818CF8] hover:bg-[#6366F1] text-white shadow-sm hover:shadow-indigo-500/20 active:scale-95 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Create / Edit Form Drawer */}
        {(isCreating || editingId) && (
          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] shadow-xl space-y-4 animate-slide-up"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#293247]">
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <h3 className="text-sm font-bold text-[#111827] dark:text-[#F3F4F6]">
                  {editingId ? 'Edit Project' : 'Create New Project Workspace'}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCancelForm}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#64748B] dark:text-[#9CA3AF] mb-1.5">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Next.js SaaS Platform, Vision Research..."
                  required
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0B1020] border border-[#E2E8F0] dark:border-[#293247] text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] dark:text-[#9CA3AF] mb-1.5">
                  Color Accent
                </label>
                <div className="flex items-center gap-2 flex-wrap pt-0.5">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                        color === c.value
                          ? 'ring-2 ring-offset-2 ring-[#818CF8] dark:ring-offset-[#151C2C] scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    >
                      {color === c.value && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] dark:text-[#9CA3AF] mb-1.5">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe the objectives or scope of this project..."
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#0B1020] border border-[#E2E8F0] dark:border-[#293247] text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:border-[#818CF8] resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCancelForm}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#64748B] dark:text-[#9CA3AF] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#818CF8] hover:bg-[#6366F1] text-white shadow-sm"
              >
                {editingId ? 'Save Changes' : 'Create Workspace'}
              </button>
            </div>
          </form>
        )}

        {/* Empty State */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-[#E2E8F0] dark:border-[#293247] bg-white/50 dark:bg-[#151C2C]/50 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-[#1E293B] border border-indigo-200/60 dark:border-[#293247] flex items-center justify-center mx-auto text-[#6366F1] dark:text-[#818CF8]">
              <Layers className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F4F6]">
                {search ? 'No Matching Projects' : 'No Projects Created Yet'}
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9CA3AF] mt-1">
                {search
                  ? `No project matched "${search}". Try another keyword or create a new one.`
                  : 'Group your conversations, research notes, and AI code solutions into cohesive project workspaces.'}
              </p>
            </div>
            <button
              onClick={handleStartCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#818CF8] hover:bg-[#6366F1] text-white shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Project</span>
            </button>
          </div>
        ) : (
          /* Projects Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((project) => {
              const projectChats = conversations.filter((c) => c.projectId === project.id);
              const isExpanded = expandedProjectId === project.id;
              const unassignedChats = conversations.filter((c) => c.projectId !== project.id);

              return (
                <div
                  key={project.id}
                  className={`rounded-2xl border transition-all duration-200 bg-white dark:bg-[#151C2C] flex flex-col justify-between ${
                    isExpanded
                      ? 'border-[#818CF8] shadow-md md:col-span-2'
                      : 'border-[#E2E8F0] dark:border-[#293247] hover:border-[#818CF8]/50'
                  }`}
                >
                  {/* Project Card Header */}
                  <div className="p-5 sm:p-6 space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                          style={{
                            backgroundColor: `${project.color || '#818CF8'}18`,
                            color: project.color || '#818CF8',
                            border: `1px solid ${project.color || '#818CF8'}40`,
                          }}
                        >
                          <Folder className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F4F6] truncate">
                            {project.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5" />
                              {projectChats.length} {projectChats.length === 1 ? 'chat' : 'chats'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(project.updatedAt || project.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Small Actions: Edit & Trash */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEdit(project)}
                          className="p-1.5 rounded-xl text-[#64748B] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
                          title="Edit project"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal('deleteProjectConfirm', project)}
                          className="p-1.5 rounded-xl text-[#64748B] hover:text-rose-500 dark:text-[#9CA3AF] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/40 transition-colors"
                          title="Delete project (preserves chats)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    {project.description && (
                      <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#9CA3AF] line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    )}
                  </div>

                  {/* Expanded Conversations List inside project */}
                  {isExpanded && (
                    <div className="px-5 sm:px-6 pb-5 pt-2 border-t border-[#E2E8F0] dark:border-[#293247]/80 space-y-4 bg-[#F8FAFC]/50 dark:bg-[#0B1020]/30 rounded-b-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9CA3AF] flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#818CF8]" />
                          Assigned Conversations ({projectChats.length})
                        </h4>

                        {/* Assign existing chat to this project */}
                        {unassignedChats.length > 0 && (
                          <div className="flex items-center gap-2">
                            <select
                              value={chatToAssign}
                              onChange={(e) => setChatToAssign(e.target.value)}
                              className="px-2.5 py-1.5 rounded-xl text-xs bg-white dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:border-[#818CF8] max-w-[200px]"
                            >
                              <option value="">+ Assign existing chat...</option>
                              {unassignedChats.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.title.slice(0, 32)}
                                </option>
                              ))}
                            </select>
                            {chatToAssign && (
                              <button
                                onClick={() => handleAssignChat(project.id)}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#818CF8] text-white hover:bg-[#6366F1]"
                              >
                                Link
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {projectChats.length === 0 ? (
                        <div className="p-4 rounded-xl border border-dashed border-[#E2E8F0] dark:border-[#293247] text-center text-xs text-[#64748B] dark:text-[#9CA3AF]">
                          No conversations linked to this workspace yet.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {projectChats.map((chat) => (
                            <div
                              key={chat.id}
                              className="p-3 rounded-xl bg-white dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] hover:border-[#818CF8]/60 transition-all flex items-center justify-between gap-2 shadow-sm group"
                            >
                              <button
                                onClick={() => selectChat(chat.id)}
                                className="flex-1 text-left min-w-0"
                              >
                                <p className="text-xs font-semibold text-[#111827] dark:text-[#F3F4F6] truncate group-hover:text-[#818CF8] transition-colors">
                                  {chat.title}
                                </p>
                                <span className="text-[10px] text-[#64748B] dark:text-[#9CA3AF] flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(chat.updatedAt)} • {chat.messages.length} msgs
                                </span>
                              </button>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => selectChat(chat.id)}
                                  className="p-1 rounded-lg text-[#64748B] hover:text-[#818CF8] dark:text-[#9CA3AF] dark:hover:text-[#818CF8]"
                                  title="Open conversation"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => assignChatToProject(chat.id, null)}
                                  className="p-1 rounded-lg text-[#64748B] hover:text-amber-500 dark:text-[#9CA3AF] dark:hover:text-amber-400"
                                  title="Unlink from project"
                                >
                                  <MinusCircle className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Footer Bar */}
                  <div className="p-3 sm:px-6 sm:py-3.5 border-t border-[#E2E8F0] dark:border-[#293247] flex items-center justify-between gap-2 bg-[#F8FAFC]/80 dark:bg-[#111827]/40 rounded-b-2xl">
                    <button
                      onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                      className="text-xs font-semibold text-[#6366F1] dark:text-[#818CF8] hover:underline flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Collapse Workspace' : 'View Chats & Details'}</span>
                      <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleStartNewChatInProject(project)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-[#1E293B] text-[#6366F1] dark:text-[#818CF8] hover:bg-[#818CF8] hover:text-white dark:hover:bg-[#818CF8] dark:hover:text-[#0B1020] border border-indigo-200/60 dark:border-[#293247] transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Start Chat</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
