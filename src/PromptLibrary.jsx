import React, { useState, useEffect } from 'react';
import { PlusCircle, X, LogIn, UserPlus, LogOut } from 'lucide-react';
import { getCurrentUser, signOut, saveData, getData } from './database';

const getLightPastelColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 90%)`;
};

const PromptLibrary = () => {
  const [categories, setCategories] = useState(['All', 'Văn bản', 'Hình ảnh', 'Đa phương thức', 'Suy luận']);
  const [prompts, setPrompts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(['All']);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [isAddingPrompt, setIsAddingPrompt] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const netlifyIdentity = window.netlifyIdentity;
    netlifyIdentity.on('init', user => {
      console.log('Netlify Identity initialized');
      setUser(user);
      if (user) {
        loadData();
      } else {
        setIsLoading(false);
      }
    });
    netlifyIdentity.on('login', user => {
      console.log('User logged in:', user);
      setUser(user);
      loadData();
      netlifyIdentity.close(); // Close the modal after successful login
    });
    netlifyIdentity.on('logout', () => {
      console.log('User logged out');
      setUser(null);
      setIsLoading(false);
    });
    netlifyIdentity.init();

    return () => {
      netlifyIdentity.off('init');
      netlifyIdentity.off('login');
      netlifyIdentity.off('logout');
    };
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getData();
      console.log('Loaded data:', data);
      setCategories(data.categories || ['All', 'Văn bản', 'Hình ảnh', 'Đa phương thức', 'Suy luận']);
      setPrompts(data.prompts || []);
      setTags(data.tags || []);
    } catch (err) {
      console.error('Load data error:', err);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = async () => {
    const newCategory = prompt('Enter new category name:');
    if (newCategory && !categories.includes(newCategory)) {
      const newCategories = [...categories, newCategory];
      try {
        await saveData('categories', newCategories);
        setCategories(newCategories);
      } catch (err) {
        console.error('Save category error:', err);
        setError('Failed to save category. Please try again.');
      }
    }
  };

  const addPrompt = () => {
    setEditingPrompt({
      id: Date.now(),
      name: '',
      category: categories[1],
      content: '',
      tags: []
    });
    setIsAddingPrompt(true);
  };

  const deleteCategory = async (category) => {
    if (category === 'All') return;
    const newCategories = categories.filter(c => c !== category);
    const newPrompts = prompts.filter(p => p.category !== category);
    try {
      await saveData('categories', newCategories);
      await saveData('prompts', newPrompts);
      setCategories(newCategories);
      setPrompts(newPrompts);
    } catch (err) {
      console.error('Delete category error:', err);
      setError('Failed to delete category. Please try again.');
    }
  };

  const deleteTag = async (tagToDelete) => {
    const newTags = tags.filter(tag => tag !== tagToDelete);
    const newPrompts = prompts.map(prompt => ({
      ...prompt,
      tags: prompt.tags.filter(tag => tag !== tagToDelete)
    }));
    try {
      await saveData('tags', newTags);
      await saveData('prompts', newPrompts);
      setTags(newTags);
      setPrompts(newPrompts);
    } catch (err) {
      console.error('Delete tag error:', err);
      setError('Failed to delete tag. Please try again.');
    }
  };

  const deletePrompt = async (promptId) => {
    const newPrompts = prompts.filter(p => p.id !== promptId);
    try {
      await saveData('prompts', newPrompts);
      setPrompts(newPrompts);
    } catch (err) {
      console.error('Delete prompt error:', err);
      setError('Failed to delete prompt. Please try again.');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const json = JSON.parse(e.target.result);
          const newPrompts = json.map(item => ({
            id: Date.now() + Math.random(),
            name: item['Mô tả'].slice(0, 50) + '...',
            category: 'Uploaded',
            content: `Mô tả: ${item['Mô tả']}\n\nVí dụ: ${item['Ví dụ']}`,
            tags: []
          }));
          const updatedPrompts = [...prompts, ...newPrompts];
          await saveData('prompts', updatedPrompts);
          setPrompts(updatedPrompts);
          if (!categories.includes('Uploaded')) {
            const newCategories = [...categories, 'Uploaded'];
            await saveData('categories', newCategories);
            setCategories(newCategories);
          }
        } catch (err) {
          console.error('File upload error:', err);
          setError('Failed to upload file. Please ensure it\'s a valid JSON.');
        }
      };
      reader.readAsText(file);
    }
  };

 const savePrompt = async (updatedPrompt) => {
  console.log('Saving prompt:', updatedPrompt);
  if (!updatedPrompt.name.trim() || !updatedPrompt.category.trim() || !updatedPrompt.content.trim()) {
    setError('Please fill in all fields');
    return;
  }
  const newPrompts = prompts.some(p => p.id === updatedPrompt.id)
    ? prompts.map(p => p.id === updatedPrompt.id ? updatedPrompt : p)
    : [...prompts, updatedPrompt];
  
  const newTags = [...new Set([...tags, ...updatedPrompt.tags])];

  try {
    console.log('Saving prompts:', newPrompts);
    await saveData('prompts', newPrompts);
    console.log('Saving tags:', newTags);
    await saveData('tags', newTags);
    setPrompts(newPrompts);
    setTags(newTags);
    setEditingPrompt(null);
    setIsAddingPrompt(false);
  } catch (error) {
    console.error('Save prompt error:', error);
    setError(`Failed to save prompt: ${error.message}`);
  }
};

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

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

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
              {categories.map(category => (
                <li 
                  key={category} 
                  className="flex items-center justify-between cursor-pointer p-2"
                >
                  <div className="flex items-center" onClick={() => toggleCategory(category)}>
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.includes(category)}
                      readOnly
                      className="mr-2"
                    />
                    {category}
                  </div>
                  {category !== 'All' && (
                    <Trash2
                      size={18}
                      className="text-red-500 cursor-pointer"
                      onClick={() => setShowDeleteConfirm({ type: 'category', item: category })}
                    />
                  )}
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
                  className={`px-2 py-1 rounded-full text-sm cursor-pointer flex items-center ${
                    selectedTags.includes(tag) ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  <span onClick={() => toggleTag(tag)}>{tag}</span>
                  <Trash2
                    size={14}
                    className="ml-1 text-red-500 cursor-pointer"
                    onClick={() => setShowDeleteConfirm({ type: 'tag', item: tag })}
                  />
                </span>
              ))}
            </div>
          </div>

          {/* Right section */}
          <div className="w-3/4 p-4 bg-gray-100 overflow-y-auto">
            <div className="flex justify-between items-center mb-4 mt-16">
              <h2 className="text-xl font-bold">Prompt</h2>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  accept=".json"
                />
                <button 
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
                  onClick={() => fileInputRef.current.click()}
                >
                  <Upload className="mr-2" size={20} />
                  Upload JSON
                </button>
                <button 
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={addPrompt}
                >
                  Prompt mới
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {filteredPrompts.map(prompt => {
                const bgColor = getLightPastelColor();
                return (
                  <div 
                    key={prompt.id} 
                    className="p-4 rounded shadow-md cursor-pointer text-gray-800 relative"
                    style={{ backgroundColor: bgColor }}
                  >
                    <Trash2
                      size={18}
                      className="absolute top-2 right-2 text-red-500 cursor-pointer"
                      onClick={() => setShowDeleteConfirm({ type: 'prompt', item: prompt })}
                    />
                    <div onClick={() => setEditingPrompt(prompt)}>
                      <h3 className="font-bold mb-2">{prompt.name}</h3>
                      <p className="text-sm mb-2 line-clamp-3">
                        {prompt.content.slice(0, 100)}
                        {prompt.content.length > 100 && '...'}
                      </p>
                      <div className="text-right text-xs opacity-75">
                        {prompt.category}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                <p>Are you sure you want to delete this {showDeleteConfirm.type}?</p>
                <div className="flex justify-end mt-4">
                  <button 
                    className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
                    onClick={() => setShowDeleteConfirm(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="bg-red-500 text-white px-4 py-2 rounded"
                    onClick={() => {
                      if (showDeleteConfirm.type === 'category') deleteCategory(showDeleteConfirm.item);
                      if (showDeleteConfirm.type === 'tag') deleteTag(showDeleteConfirm.item);
                      if (showDeleteConfirm.type === 'prompt') deletePrompt(showDeleteConfirm.item.id);
                      setShowDeleteConfirm(null);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit/Add Prompt Modal */}
          {editingPrompt && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg w-2/3 h-2/3 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <input 
                    className="text-xl font-bold"
                    value={editingPrompt.name}
                    onChange={(e) => setEditingPrompt({...editingPrompt, name: e.target.value})}
                    placeholder="Prompt Name"
                  />
                  <button onClick={() => setEditingPrompt(null)}>
                    <X size={24} />
                  </button>
                </div>
                <select 
                  className="mb-4 p-2 border rounded"
                  value={editingPrompt.category}
                  onChange={(e) => setEditingPrompt({...editingPrompt, category: e.target.value})}
                >
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <textarea 
                  className="flex-grow p-2 border rounded resize-none mb-4"
                  value={editingPrompt.content}
                  onChange={(e) => setEditingPrompt({...editingPrompt, content: e.target.value})}
                  placeholder="Prompt Content"
                />
                <div className="mb-4">
                  <input 
                    className="p-2 border rounded w-full"
                    placeholder="Add tags (comma-separated)"
                    value={editingPrompt.tags.join(', ')}
                    onChange={(e) => setEditingPrompt({
                      ...editingPrompt, 
                      tags: e.target.value.split(',').map(tag => tag.trim().startsWith('#') ? tag.trim() : `#${tag.trim()}`).filter(tag => tag)
                    })}
                  />
                </div>
                <button 
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={() => savePrompt(editingPrompt)}
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full flex items-center justify-center">
          <p>Please sign in to view your prompt library.</p>
        </div>
      )}
    </div>
  );
};

export default PromptLibrary;
