import React, { useState, useEffect } from 'react';
import { Plus, X, ArrowLeft, Search, Check, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { Tag, Task, Screen } from './types';

// --- Constants & Initial Data ---

const PRIMARY_COLOR = '#FF5E78';
const TEXT_DARK = '#1D1B4B';

const INITIAL_TAGS: Tag[] = [
  { id: '1', label: 'Famille', color: '#CBD5E1' },
  { id: '2', label: 'Ecole', color: '#FF5E78' },
  { id: '3', label: 'Finance', color: '#CBD5E1' },
  { id: '4', label: 'Boulot', color: '#94A3B8' },
  { id: '5', label: 'Politique', color: '#CBD5E1' },
];

const INITIAL_TASKS: Task[] = [];

const COLOR_PALETTE = [
  '#FF5E78', '#D8B4FE', '#9333EA', '#1E293B', '#F97316', '#14B8A6',
  '#06B6D4', '#B45309', '#EF4444', '#6366F1'
];

// --- Components ---

const Button = ({ onClick, children, className = "", fullWidth = false }: { onClick: () => void, children?: React.ReactNode, className?: string, fullWidth?: boolean }) => (
  <button
    onClick={onClick}
    className={`bg-[#FF5E78] text-white font-semibold py-4 px-8 rounded-full shadow-lg active:scale-95 transition-transform select-none ${fullWidth ? 'w-full' : ''} ${className}`}
  >
    {children}
  </button>
);

const Input = ({ placeholder, value, onChange, type = "text", className = "" }: { placeholder: string, value: string, onChange: (v: string) => void, type?: string, className?: string }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`w-full bg-transparent border-b border-gray-300 py-3 text-lg text-[#1D1B4B] placeholder-gray-400 focus:outline-none focus:border-[#FF5E78] transition-colors ${className}`}
  />
);

// --- Main App Component ---

export default function App() {
  // --- Persistent State ---
  const [email, setEmail] = useState(() => localStorage.getItem('mytask_email') || '');
  
  // Decide initial screen based on login status
  const [screen, setScreen] = useState<Screen>(() => {
    // If we have an email, start at HOME (skip login/welcome for returning users)
    return localStorage.getItem('mytask_email') ? 'HOME' : 'LOGIN';
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('mytask_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [tags, setTags] = useState<Tag[]>(() => {
    const saved = localStorage.getItem('mytask_tags');
    return saved ? JSON.parse(saved) : INITIAL_TAGS;
  });

  // --- Temporary State ---
  // Holds data for New Note screen to persist content when switching to "New Tag" and back
  const [draft, setDraft] = useState<{title: string, desc: string, tagId: string | null, dueDate: string | null}>({
    title: '', desc: '', tagId: null, dueDate: null
  });
  
  // If editing, this holds the ID
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // --- Effects (Persistence) ---
  useEffect(() => { localStorage.setItem('mytask_email', email); }, [email]);
  useEffect(() => { localStorage.setItem('mytask_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('mytask_tags', JSON.stringify(tags)); }, [tags]);

  // --- Navigation & Hardware Back Button Support ---
  
  const navigate = (to: Screen, method: 'push' | 'replace' = 'push') => {
    setScreen(to);
    if (method === 'push') {
      window.history.pushState({ screen: to }, '');
    } else {
      window.history.replaceState({ screen: to }, '');
    }
  };

  const goBack = () => {
    window.history.back();
  };

  useEffect(() => {
    // Handle Android hardware back button (popstate)
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.screen) {
        setScreen(event.state.screen);
      } else {
        // Fallback if state is missing
        setScreen(localStorage.getItem('mytask_email') ? 'HOME' : 'LOGIN');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Initialize history state on mount
    const initialScreen = localStorage.getItem('mytask_email') ? 'HOME' : 'LOGIN';
    window.history.replaceState({ screen: initialScreen }, '');

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);


  // --- Screens ---

  const LoginScreen = () => {
    const [localEmail, setLocalEmail] = useState(email);
    const [error, setError] = useState('');

    const handleLogin = () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(localEmail)) {
        setError('Veuillez fournir un email valide');
        return;
      }
      setEmail(localEmail);
      navigate('WELCOME', 'replace');
    };

    return (
      <div className="flex flex-col h-screen p-8 bg-[#F3F6F8]">
        <div className="mt-12 mb-8">
          <h1 className="text-5xl font-bold text-[#1D1B4B] mb-2">MyTask</h1>
          <p className="text-sm text-gray-500">Organisez votre journée et restez zen</p>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <label className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Email</label>
          <div className="bg-gray-200 rounded-full h-12 mb-2 flex items-center px-4">
             <input 
                type="email" 
                value={localEmail}
                onChange={(e) => { setLocalEmail(e.target.value); setError(''); }}
                className="bg-transparent w-full outline-none text-gray-700"
             />
          </div>
          {error && <p className="text-red-500 text-xs ml-2 mb-4">{error}</p>}
          
          <div className="mt-8">
             <Button onClick={handleLogin} fullWidth>OK</Button>
          </div>
        </div>

        <div className="text-center text-[10px] text-gray-400 mt-auto">
          copyright | PIGIER 2025
        </div>
      </div>
    );
  };

  const WelcomeScreen = () => {
    useEffect(() => {
      const timer = setTimeout(() => {
        navigate('HOME', 'replace');
      }, 2500);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div className="flex flex-col h-screen p-8 bg-white justify-center items-center">
        <div className="absolute top-12 left-8">
            <h1 className="text-3xl font-bold text-[#1D1B4B]">MyTask</h1>
            <p className="text-xs text-gray-500">Organisez votre journée et restez zen</p>
        </div>

        <div className="text-center">
          <h2 className="text-2xl text-[#1D1B4B] mb-2">Bienvenue</h2>
          <p className="text-sm text-gray-400 mb-8">{email || 'user@yopmail.com'}</p>
          
          <div className="w-8 h-8 border-4 border-[#FF5E78] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>

        <div className="absolute bottom-8 text-[10px] text-gray-400">
          copyright | 2025
        </div>
      </div>
    );
  };

  const HomeScreen = () => {
    const [search, setSearch] = useState('');

    const filteredTasks = tasks.filter(t => 
      t.title.toLowerCase().includes(search.toLowerCase()) || 
      tags.find(tag => tag.id === t.tagId)?.label.toLowerCase().includes(search.toLowerCase())
    );

    // Smart Sorting:
    // 1. Uncompleted tasks first
    // 2. Overdue tasks (if uncompleted)
    // 3. Due Date ascending (if uncompleted)
    // 4. No Due Date (if uncompleted)
    // 5. Completed tasks
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (a.completed === b.completed) {
            // Both uncompleted or both completed
            if (a.completed) return 0; // Keep existing order for completed

            // Handle dates
            if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
            if (a.dueDate) return -1; // a has date, goes first
            if (b.dueDate) return 1; // b has date, goes first
            
            return 0;
        }
        return a.completed ? 1 : -1; // Uncompleted comes before completed
    });

    const hasTasks = sortedTasks.length > 0;
    const completedCount = tasks.filter(t => t.completed).length;
    const totalCount = tasks.length;

    const toggleTask = (taskId: string) => {
      setTasks(currentTasks => 
        currentTasks.map(t => 
          t.id === taskId ? { ...t, completed: !t.completed } : t
        )
      );
    };

    const deleteTask = (taskId: string, e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent triggering edit
      if (window.confirm('Voulez-vous vraiment supprimer cette note ?')) {
        setTasks(currentTasks => currentTasks.filter(t => t.id !== taskId));
      }
    };

    const handleEditTask = (task: Task) => {
      setEditingTaskId(task.id);
      setDraft({
        title: task.title,
        description: task.description || '',
        tagId: task.tagId,
        dueDate: task.dueDate || null
      } as any);
      navigate('NEW_NOTE', 'push');
    };

    const handleNewNote = () => {
        setEditingTaskId(null);
        setDraft({ title: '', desc: '', tagId: null, dueDate: null });
        navigate('NEW_NOTE', 'push');
    };

    const handleLogout = () => {
        if(window.confirm("Se déconnecter ?")) {
            setEmail('');
            localStorage.removeItem('mytask_email');
            navigate('LOGIN', 'replace');
        }
    }

    // Helper to format date
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const isOverdue = (dateString: string) => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const d = new Date(dateString);
        return d < today;
    };

    return (
      <div className="flex flex-col h-screen bg-[#F3F6F8] relative">
        <div className="pt-12 px-6 pb-6 flex justify-between items-start">
           <div>
               <h1 className="text-4xl font-bold text-[#1D1B4B]">MyTask</h1>
               <p className="text-sm text-gray-500 cursor-pointer" onClick={handleLogout}>{email || 'user@yopmail.com'}</p>
           </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 mb-6">
            <div className="bg-white rounded-full flex items-center px-4 py-3 shadow-sm">
                <input 
                    type="text" 
                    placeholder="Rechercher un titre, un tag" 
                    className="flex-1 outline-none text-gray-600 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="w-5 h-5 text-gray-400" />
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 px-6 overflow-y-auto">
            {!hasTasks && search === '' ? (
                <div className="flex flex-col items-center justify-center h-[60%] text-center">
                    <h2 className="text-4xl font-light text-[#1D1B4B] mb-6">Bonne Journée !!</h2>
                    <p className="text-gray-600 max-w-xs">
                        Félicitation. vous n'avez aucune tâche en attente.
                    </p>
                </div>
            ) : (
                <div className="space-y-4 pb-24">
                    <div className="flex justify-between items-end mb-4">
                        <h3 className="text-xl font-medium text-[#1D1B4B]">Notes</h3>
                        <span className="text-xs font-bold text-gray-400">{completedCount}/{totalCount} complété</span>
                    </div>
                    
                    {sortedTasks.map(task => {
                        const tag = tags.find(t => t.id === task.tagId);
                        const overdue = task.dueDate && !task.completed && isOverdue(task.dueDate);
                        
                        return (
                            <div 
                                key={task.id} 
                                className={`bg-white rounded-2xl p-4 flex items-center shadow-sm active:scale-[0.99] transition-all duration-300 ${task.completed ? 'opacity-60 bg-gray-50' : 'opacity-100'}`}
                                onClick={() => handleEditTask(task)}
                            >
                                <div 
                                  onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 cursor-pointer transition-all duration-300 flex-shrink-0 ${task.completed ? 'border-gray-300 bg-gray-200' : 'border-[#FF5E78] bg-transparent'}`}
                                >
                                    <Check className={`w-3.5 h-3.5 text-gray-500 transition-all duration-300 transform ${task.completed ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} strokeWidth={3} />
                                </div>
                                
                                <div className="flex-1 overflow-hidden">
                                    <h4 className={`text-[#1D1B4B] font-medium text-lg truncate transition-all duration-300 ${task.completed ? 'text-gray-400 line-through decoration-gray-300' : ''}`}>
                                        {task.title}
                                    </h4>
                                    
                                    <div className="flex items-center gap-2 mt-1">
                                      {tag && (
                                          <span 
                                              className="text-[10px] px-2 py-0.5 rounded-full inline-block text-white shadow-sm"
                                              style={{ backgroundColor: tag.color }} 
                                          >
                                              {tag.label}
                                          </span>
                                      )}
                                      
                                      {task.dueDate && (
                                        <div className={`flex items-center text-[10px] px-2 py-0.5 rounded-full border ${overdue ? 'bg-red-50 text-red-500 border-red-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                            {overdue ? <AlertCircle size={10} className="mr-1"/> : <Calendar size={10} className="mr-1" />}
                                            {formatDate(task.dueDate)}
                                        </div>
                                      )}
                                    </div>
                                </div>

                                <button 
                                    onClick={(e) => deleteTask(task.id, e)}
                                    className="ml-2 p-2 text-gray-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        {/* FAB */}
        <button 
            onClick={handleNewNote}
            className="absolute bottom-8 right-8 w-16 h-16 bg-[#FF5E78] rounded-full flex items-center justify-center shadow-lg text-white hover:scale-105 transition-transform"
        >
            <Plus size={32} />
        </button>
      </div>
    );
  };

  const NewNoteScreen = () => {
    const [title, setTitle] = useState(draft.title);
    const [desc, setDesc] = useState(draft.desc);
    const [selectedTagId, setSelectedTagId] = useState<string | null>(draft.tagId);
    const [dueDate, setDueDate] = useState<string>(draft.dueDate || '');

    const handleBack = () => {
        // Clear draft and edit state when cancelling
        setDraft({ title: '', desc: '', tagId: null, dueDate: null });
        setEditingTaskId(null);
        goBack(); // Use history back
    };

    const handleDelete = () => {
        if (!editingTaskId) return;
        if (window.confirm('Voulez-vous vraiment supprimer cette note ?')) {
            setTasks(prev => prev.filter(t => t.id !== editingTaskId));
            // Don't call handleBack() here directly if we want to reset state first, 
            // but handleBack does both.
            handleBack(); 
        }
    };

    const handleSave = () => {
        if (!title) return; // Simple validation

        if (editingTaskId) {
            // Update existing
            setTasks(tasks.map(t => t.id === editingTaskId ? {
                ...t,
                title,
                description: desc,
                tagId: selectedTagId || (tags[0]?.id ?? '1'),
                dueDate: dueDate || undefined
            } : t));
        } else {
            // Create new
            const newTask: Task = {
                id: Date.now().toString(),
                title,
                description: desc,
                tagId: selectedTagId || (tags[0]?.id ?? '1'),
                completed: false,
                dueDate: dueDate || undefined
            };
            setTasks([newTask, ...tasks]);
        }
        
        // Reset and navigate back
        setDraft({ title: '', desc: '', tagId: null, dueDate: null });
        setEditingTaskId(null);
        goBack();
    };

    const goToNewTag = () => {
        // Save current progress to draft
        setDraft({ title, desc, tagId: selectedTagId, dueDate });
        navigate('NEW_TAG', 'push');
    };

    const handleTagDelete = (e: React.MouseEvent, tagId: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Prevent deleting default tags if desired, or allow it.
        // Let's protect IDs 1-5 for safety if they are defaults, or check INITIAL_TAGS
        if (INITIAL_TAGS.some(it => it.id === tagId)) {
            alert("Impossible de supprimer les tags par défaut.");
            return;
        }

        if (window.confirm("Supprimer ce tag ?")) {
            setTags(prev => prev.filter(t => t.id !== tagId));
            // Reset selection if deleted
            if (selectedTagId === tagId) setSelectedTagId(tags[0]?.id || '1');
            
            // Clean up tasks using this tag?
            setTasks(prev => prev.map(t => t.tagId === tagId ? { ...t, tagId: '1' } : t));
        }
    }

    return (
      <div className="flex flex-col h-screen bg-[#F3F6F8]">
        <div className="px-6 pt-8 pb-4">
             <div className="flex justify-between items-center mb-6">
                 <button onClick={handleBack} className="text-gray-400">
                     <X size={24} className="border rounded-full p-0.5" />
                 </button>
                 {editingTaskId && (
                     <button 
                        onClick={handleDelete}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm hover:bg-red-50 active:scale-90 transition-all"
                        title="Supprimer la note"
                     >
                        <Trash2 size={20} />
                     </button>
                 )}
             </div>
             <h1 className="text-5xl font-bold text-[#1D1B4B]">{editingTaskId ? 'Modifier' : 'Nouvelle'}</h1>
             <h1 className="text-5xl font-light text-[#1D1B4B]">Note</h1>
        </div>

        <div className="flex-1 bg-white rounded-t-[3rem] p-8 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] mt-4 flex flex-col">
            <div className="space-y-6 mt-2">
                <Input placeholder="Titre" value={title} onChange={setTitle} />
                
                <textarea 
                    placeholder="Description" 
                    className="w-full bg-transparent border-l-2 border-gray-300 pl-4 py-2 text-lg text-gray-500 outline-none h-24 resize-none"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                />

                {/* Due Date Picker */}
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Date d'échéance</label>
                  <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                      <Calendar className="text-[#FF5E78] w-5 h-5 mr-3" />
                      <input 
                          type="date" 
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="bg-transparent w-full text-gray-700 outline-none font-medium"
                      />
                  </div>
                </div>
            </div>

            <div className="mt-8">
                <div className="flex justify-between items-end mb-3">
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tags</p>
                     <span className="text-[10px] text-gray-300">Maintenir pour supprimer</span>
                </div>
                
                <div className="flex flex-wrap gap-3 mb-4">
                    {tags.map(tag => (
                        <button
                            key={tag.id}
                            onClick={() => setSelectedTagId(tag.id)}
                            onContextMenu={(e) => handleTagDelete(e, tag.id)}
                            className={`px-4 py-1 rounded-full text-sm font-medium transition-colors shadow-sm ${
                                selectedTagId === tag.id 
                                ? 'text-white scale-105' 
                                : 'bg-gray-100 text-gray-600'
                            }`}
                            style={{ 
                                backgroundColor: selectedTagId === tag.id ? tag.color : undefined 
                            }}
                        >
                            {tag.label}
                        </button>
                    ))}
                </div>
                
                <button 
                    onClick={goToNewTag}
                    className="px-4 py-1 rounded-full border border-gray-300 text-gray-500 text-sm hover:bg-gray-50"
                >
                    + Creer un tag
                </button>
            </div>

            <div className="mt-auto flex justify-center pb-6">
                <Button 
                    onClick={handleSave} 
                    className={`w-48 ${!title ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {editingTaskId ? 'Modifier' : 'Ajouter'}
                </Button>
            </div>
        </div>
      </div>
    );
  };

  const NewTagScreen = () => {
      const [label, setLabel] = useState('');
      const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);

      const handleSave = () => {
          if (!label) return;
          
          // Check for duplicate
          if (tags.some(t => t.label.toLowerCase() === label.trim().toLowerCase())) {
              alert("Ce tag existe déjà.");
              return;
          }

          const newTag: Tag = {
              id: Date.now().toString(),
              label: label.trim(),
              color: selectedColor
          };
          setTags([...tags, newTag]);
          
          // Update draft to select this new tag automatically
          setDraft(d => ({ ...d, tagId: newTag.id }));
          
          goBack(); // Return to NewNoteScreen
      };

      return (
        <div className="flex flex-col h-screen bg-[#F3F6F8] p-8">
            <div className="mb-8">
                <button onClick={goBack} className="mb-4 text-gray-400">
                    <ArrowLeft size={24} className="border rounded-full p-0.5" />
                </button>
                <h1 className="text-5xl font-bold text-[#1D1B4B]">Tag</h1>
                <h2 className="text-4xl font-light text-[#1D1B4B]">Nouveau</h2>
            </div>

            <div className="flex-1">
                <div className="mt-12 mb-12">
                    <Input placeholder="Label" value={label} onChange={setLabel} />
                </div>

                <p className="text-sm text-gray-500 mb-4">Couleur</p>
                <div className="bg-white rounded-3xl p-6 grid grid-cols-5 gap-4 shadow-sm">
                    {COLOR_PALETTE.map(color => (
                        <button 
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`w-10 h-10 rounded-full mx-auto transition-transform ${
                                selectedColor === color 
                                ? 'scale-110 ring-2 ring-offset-2 ring-gray-300 shadow-md' 
                                : ''
                            }`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </div>

            <div className="mt-auto flex justify-center">
                <Button 
                    onClick={handleSave} 
                    className={`w-48 ${!label ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Enregistrer
                </Button>
            </div>
        </div>
      );
  };

  // --- Render Switch ---

  return (
    <div className="w-full max-w-md mx-auto h-full min-h-screen bg-[#F3F6F8] shadow-2xl overflow-hidden relative">
      {screen === 'LOGIN' && <LoginScreen />}
      {screen === 'WELCOME' && <WelcomeScreen />}
      {screen === 'HOME' && <HomeScreen />}
      {screen === 'NEW_NOTE' && <NewNoteScreen />}
      {screen === 'NEW_TAG' && <NewTagScreen />}
    </div>
  );
}