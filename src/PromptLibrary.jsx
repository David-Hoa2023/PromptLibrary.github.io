import React, { useState, useEffect } from 'react';
import { PlusCircle, X } from 'lucide-react';
import { getCurrentUser, signOut, saveData, getData } from './database';

const getLightPastelColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 90%)`;
};

const PromptLibrary = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(['All']);
  const [prompts, setPrompts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(['All']);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [editingPrompt, setEditingPrompt] = useState(null);

  useEffect(() => {
    const netlifyIdentity = window.netlifyIdentity;
    netlifyIdentity.on('init', user => {
      console.log('Netlify Identity initialized', user);
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
      console.log('Starting to load data');
      const data = await getData();
      console.log('Loaded data:', data);
      if (data && typeof data === 'object') {
        const newCategories = ['All', ...(data.categories || [])];
        setCategories(newCategories);
        console.log('Categories set:', newCategories);
        setPrompts(data.prompts || []);
        console.log('Prompts set:', data.prompts || []);
        setTags(data.tags || []);
        console.log('Data successfully set in state');
      } else {
        throw new Error('Received invalid data format');
      }
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
      const newCategories = [...categories.filter(cat => cat !== 'All'), newCategory];
      try {
        console.log('Saving categories:', newCategories);
        await saveData('categories', newCategories);
        setCategories(['All', ...newCategories]);
        console.log('Category added successfully:', newCategory);
      } catch (err) {
        console.error('Save category error:', err);
        setError('Failed to save category. Please try again.');
      }
    }
  };

  const savePrompt = async (promptToSave) => {
    try {
      let updatedPrompts;
      if (promptToSave.id) {
        updatedPrompts = prompts.map(p => p.id === promptToSave.id ? promptToSave : p);
      } else {
        updatedPrompts = [...prompts, { ...promptToSave, id: Date.now() }];
      }
      console.log('Saving prompts:', updatedPrompts);
      await saveData('prompts', updatedPrompts);
      setPrompts(updatedPrompts);
      setEditingPrompt(null);
      console.log('Prompt saved successfully');
    } catch (error) {
      console.error('Error saving prompt:', error);
      setError('Failed to save prompt. Please try again.');
    }
  };

  const filteredPrompts = prompts.filter(prompt => 
    (selectedCategories.includes('All') || selectedCategories.includes(prompt.category)) &&
    (selectedTags.length === 0 || selectedTags.some(tag => prompt.tags.includes(tag)))
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left section */}
      <div className="w-1/4 bg-white p-4 shadow-md overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Thư viện Prompt</h2>
        <ul className="mb-4">
          {categories.map(category => (
            <li 
              key={category} 
              className="flex items-center cursor-pointer p-2"
              onClick={() => setSelectedCategories(category === 'All' ? ['All'] : [category])}
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
              onClick={() => setSelectedTags(
                selectedTags.includes(tag)
                  ? selectedTags.filter(t => t !== tag)
                  : [...selectedTags, tag]
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Right section */}
      <div className="w-3/4 p-4 bg-gray-100 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Prompt</h2>
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => setEditingPrompt({
              id: null,
              name: '',
              category: categories.length > 1 ? categories[1] : '',
              content: '',
              tags: []
            })}
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

      {/* Edit Prompt Modal */}
      {editingPrompt && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-2/3 h-2/3 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <input 
                className="text-xl font-bold w-full"
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
              {categories.filter(category => category !== 'All').map(category => (
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
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                })}
              />
            </div>
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => savePrompt(editingPrompt)}
            >
              {editingPrompt.id ? 'Update Prompt' : 'Add Prompt'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptLibrary;
