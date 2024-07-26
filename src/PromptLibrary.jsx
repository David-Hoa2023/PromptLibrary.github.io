import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { saveData, getAllData } from './database';
import { PlusCircle } from 'lucide-react';

const PromptLibrary = () => {
  const [categories, setCategories] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(['All']);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

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

  const addCategory = async () => {
    const newCategory = prompt('Enter new category name:');
    if (newCategory && !categories.includes(newCategory)) {
      const newCategories = [...categories, newCategory];
      setCategories(newCategories);
      try {
        await saveData('categories', newCategories);
      } catch (err) {
        setError('Failed to save category. Please try again.');
      }
    }
  };

  const addPrompt = async () => {
    // Implementation for adding a new prompt
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

  const filteredPrompts = prompts.filter(prompt => 
    (selectedCategories.includes('All') || selectedCategories.includes(prompt.category)) &&
    (selectedTags.length === 0 || selectedTags.some(tag => prompt.tags.includes(tag)))
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {error && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 text-center">
          {error}
        </div>
      )}
      {/* Left section */}
      <div className="w-1/4 bg-white p-4 shadow-md overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Thư viện Prompt</h2>
        <ul className="mb-4">
          {categories.map(category => (
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
      <div className="w-3/4 p-4 bg-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Prompt</h2>
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={addPrompt}
          >
            Prompt mới
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {filteredPrompts.map(prompt => (
            <div 
              key={prompt.id} 
              className="bg-white p-4 rounded shadow-md cursor-pointer"
            >
              <h3 className="font-bold mb-2">{prompt.name}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-3">{prompt.content}</p>
              <div className="text-right text-xs text-gray-400">
                {prompt.category}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromptLibrary;
