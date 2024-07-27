import React, { useState, useEffect } from 'react';
import { PlusCircle, X, LogIn, UserPlus, LogOut } from 'lucide-react';
import { getCurrentUser, signOut, saveData, getAllData } from './database';

// Function to generate a random light pastel color
const getLightPastelColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 90%)`; // Increased lightness to 90%
};

const PromptLibrary = () => {
  const [categories, setCategories] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(['All']);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isAddingPrompt, setIsAddingPrompt] = useState(false);
  const [newPrompt, setNewPrompt] = useState({
    name: '',
    category: '',
    content: '',
    tags: []
  });
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const netlifyIdentity = window.netlifyIdentity;
    netlifyIdentity.on('init', user => {
      setUser(user);
      if (user) {
        loadData();
      }
    });
    netlifyIdentity.on('login', user => {
      setUser(user);
      loadData();
      if (rememberMe) {
        netlifyIdentity.remember(true);
      }
    });
    netlifyIdentity.on('logout', () => {
      setUser(null);
    });
    netlifyIdentity.init();

    return () => {
      netlifyIdentity.off('init');
      netlifyIdentity.off('login');
      netlifyIdentity.off('logout');
    };
  }, [rememberMe]);

  // const handleSignIn = () => {
  //   const netlifyIdentity = window.netlifyIdentity;
  //   netlifyIdentity.open('login');
  // };

  // const handleSignUp = () => {
  //   const netlifyIdentity = window.netlifyIdentity;
  //   netlifyIdentity.open('signup');
  // };

  // const handleSignOut = async () => {
  //   const netlifyIdentity = window.netlifyIdentity;
  //   netlifyIdentity.logout();
  // };

  useEffect(() => {
    const netlifyIdentity = window.netlifyIdentity;
    netlifyIdentity.on('login', (user) => setUser(user));
    netlifyIdentity.on('logout', () => setUser(null));
    
    const currentUser = getCurrentUser();
    setUser(currentUser);

    return () => {
      netlifyIdentity.off('login');
      netlifyIdentity.off('logout');
    };
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const data = await getAllData();
      setCategories(data.categories || ['All', 'Văn bản', 'Hình ảnh', 'Đa phương thức', 'Suy luận']);
      setPrompts(data.prompts || []);
      setTags(data.tags || []);
    } catch (err) {
      setError('Failed to load data. Please try again later.');
    }
  };

  // const addCategory = async () => {
  //   const newCategory = prompt('Enter new category name:');
  //   if (newCategory && !categories.includes(newCategory)) {
  //     const newCategories = [...categories, newCategory];
  //     setCategories(newCategories);
  //     try {
  //       await saveData('categories', newCategories);
  //     } catch (err) {
  //       setError('Failed to save category. Please try again.');
  //     }
  //   }
  // };
  const addCategory = async () => {
    const newCategory = prompt('Enter new category name:');
    if (newCategory && !categories.includes(newCategory)) {
      const newCategories = [...categories, newCategory];
      try {
        await saveData('categories', newCategories);
        setCategories(newCategories);
      } catch (err) {
        setError('Failed to save category. Please try again.');
      }
    }
  };

  const addPrompt = () => {
    setNewPrompt({
      name: '',
      category: categories[0] || '',
      content: '',
      tags: []
    });
    setIsAddingPrompt(true);
  };

  const saveNewPrompt = async () => {
    if (!newPrompt.name || !newPrompt.category || !newPrompt.content) {
      setError('Please fill in all fields');
      return;
    }
    const updatedPrompt = { ...newPrompt, id: Date.now() };
    const newPrompts = [...prompts, updatedPrompt];
    try {
      await saveData('prompts', newPrompts);
      setPrompts(newPrompts);
      setIsAddingPrompt(false);
      
      // Update tags
      const newTags = [...new Set([...tags, ...updatedPrompt.tags])];
      await saveData('tags', newTags);
      setTags(newTags);
    } catch (err) {
      setError('Failed to save prompt. Please try again.');
    }
  };

  //   try {
  //     await saveData('prompts', newPrompts);
  //     await saveData('tags', newTags);
  //     setPrompts(newPrompts);
  //     setTags(newTags);
  //     setEditingPrompt(null);
  //   } catch (err) {
  //     setError('Failed to save prompt. Please try again.');
  //   }
  // };

  const toggleCategory = (category) => {
    if (category === 'All') {
      setSelectedCategories(['All']);
    } else {
      const newSelected = selectedCategories.includes(category)
        ? selectedCategories.filter(c => c !== category)
        : [...selectedCategories.filter(c => c !== 'All'), category];
      setSelectedCategories(newSelected.length ? newSelected : ['All']);
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags(
      selectedTags.includes(tag)
        ? selectedTags.filter(t => t !== tag)
        : [...selectedTags, tag]
    );
  };

  const handleSignIn = () => {
    const netlifyIdentity = window.netlifyIdentity;
    netlifyIdentity.open('login');
  };

  const handleSignUp = () => {
    const netlifyIdentity = window.netlifyIdentity;
    netlifyIdentity.open('signup');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      setError('Failed to sign out. Please try again.');
    }
  };

  const filteredPrompts = prompts.filter(prompt => 
    (selectedCategories.includes('All') || selectedCategories.includes(prompt.category)) &&
    (selectedTags.length === 0 || selectedTags.some(tag => prompt.tags.includes(tag)))
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {error && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-4 text-center z-50">
          <p>Error: {error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 bg-white text-red-500 px-4 py-2 rounded hover:bg-red-100"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Authentication buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        {user ? (
          <>
            <span className="mr-2">Welcome, {user.email}</span>
            <button 
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2" size={20} />
              Sign Out
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center mr-2">
              <input 
                type="checkbox" 
                id="rememberMe" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
                className="mr-1"
              />
              <label htmlFor="rememberMe">Remember Me</label>
            </div>
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
              onClick={handleSignIn}
            >
              <LogIn className="mr-2" size={20} />
              Sign In
            </button>
            <button 
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
              onClick={handleSignUp}
            >
              <UserPlus className="mr-2" size={20} />
              Sign Up
            </button>
          </>
        )}
      </div>

      {user ? (
        <>
          {/* Left section */}
          <div className="w-1/4 bg-white p-4 shadow-md overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Thư viện Prompt</h2>
            <ul className="mb-4">
              {['All', 'Văn bản', 'Hình ảnh', 'Đa phương thức', 'Suy luận', ...categories].map(category => (
                <li 
                  key={category} 
                  className="flex items-center cursor-pointer p-2"
                  onClick={() => toggleCategory(category)}
                >
                  <input 
                    type="checkbox" 
                    checked={selectedCategories.includes(category)}
                    readOnly
                    className="mr-2"
                  />
                  {category}
                </li>
              ))}
            </ul>
            <button 
              className="w-full mb-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 flex items-center justify-center"
              onClick={addCategory}
            >
              <PlusCircle className="mr-2" size={20} />
              Thêm Loại Prompt
            </button>
            <h3 className="font-bold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span 
                  key={tag}
                  className={`px-2 py-1 rounded-full text-sm cursor-pointer ${
                    selectedTags.includes(tag) ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right section */}
          <div className="w-3/4 p-4 bg-gray-100 overflow-y-auto">
            <div className="flex justify-between items-center mb-4 mt-16">
              <h2 className="text-xl font-bold">Prompt</h2>
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={addPrompt}
              >
                Prompt mới
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {filteredPrompts.map(prompt => {
                const bgColor = getLightPastelColor();
                return (
                  <div 
                    key={prompt.id} 
                    className="p-4 rounded shadow-md cursor-pointer text-gray-800"
                    style={{ backgroundColor: bgColor }}
                    onClick={() => setEditingPrompt(prompt)}
                  >
                    <h3 className="font-bold mb-2">{prompt.name}</h3>
                    <p className="text-sm mb-2 line-clamp-3">
                      {prompt.content.slice(0, 100)}
                      {prompt.content.length > 100 && '...'}
                    </p>
                    <div className="text-right text-xs opacity-75">
                      {prompt.category}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* New Prompt Modal */}
          {isAddingPrompt && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg w-2/3 h-2/3 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <input 
                    className="text-xl font-bold"
                    value={newPrompt.name}
                    onChange={(e) => setNewPrompt({...newPrompt, name: e.target.value})}
                    placeholder="Prompt Name"
                  />
                  <button onClick={() => setIsAddingPrompt(false)}>
                    <X size={24} />
                  </button>
                </div>
                <select 
                  className="mb-4 p-2 border rounded"
                  value={newPrompt.category}
                  onChange={(e) => setNewPrompt({...newPrompt, category: e.target.value})}
                >
                  {['Văn bản', 'Hình ảnh', 'Đa phương thức', 'Suy luận', ...categories].map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <textarea 
                  className="flex-grow p-2 border rounded resize-none mb-4"
                  value={newPrompt.content}
                  onChange={(e) => setNewPrompt({...newPrompt, content: e.target.value})}
                  placeholder="Prompt Content"
                />
                <div className="mb-4">
                  <input 
                    className="p-2 border rounded w-full"
                    placeholder="Add tags (comma-separated)"
                    value={editingPrompt.tags.join(', ')}
                    onChange={(e) => setEditingPrompt({
                      ...editingPrompt, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                    })}
                  />
                </div>
                <button 
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={() => updatePrompt(editingPrompt)}
                >
                  Save Changes
                </button>
                <button 
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={() => saveNewPrompt(newPrompt)}
                >
                  Save New Prompt
                </button>
              </div>
            </div>
          )}


          
      ) : (
        <div className="w-full flex items-center justify-center">
          <p>Please sign in to view your prompt library.</p>
        </div>
      )}
    </div>
  );
};

export default PromptLibrary;
