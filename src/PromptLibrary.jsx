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
  const [comment, setComment] = useState('');
  const [savedComments, setSavedComments] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false); // You'll need to set this based on user role

//   useEffect(() => {
//   const netlifyIdentity = window.netlifyIdentity;
  
//   const handleUser = async (user) => {
//     console.log('Netlify Identity initialized/User logged in:', user);
//     setUser(user);
//     if (user) {
//       // Check if the user is an admin
//       const adminStatus = await checkIfAdmin(user);
//       setIsAdmin(adminStatus);
//       loadData();
//     } else {
//       setIsLoading(false);
//       setIsAdmin(false);
//     }
//   };

//   netlifyIdentity.on('init', handleUser);
//   netlifyIdentity.on('login', handleUser);
//   netlifyIdentity.on('logout', () => {
//     console.log('User logged out');
//     setUser(null);
//     setIsLoading(false);
//     setIsAdmin(false);
//   });
//   netlifyIdentity.init();

//   return () => {
//     netlifyIdentity.off('init');
//     netlifyIdentity.off('login');
//     netlifyIdentity.off('logout');
//   };
// }, []);

useEffect(() => {
  const netlifyIdentity = window.netlifyIdentity;
  
  const handleUser = async (user) => {
    console.log('Netlify Identity initialized/User logged in:', user);
    setUser(user);
    if (user) {
      // Check if the user is an admin
      const adminStatus = await checkIfAdmin(user);
      setIsAdmin(adminStatus);
      await loadData();
    } else {
      setIsLoading(false);
      setIsAdmin(false);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Starting to load data');
      const data = await getData();
      console.log('Loaded data:', data);
      if (data && typeof data === 'object') {
        setCategories(data.categories || []);
        console.log('Categories set:', data.categories || []);
        setPrompts(data.prompts || []);
        console.log('Prompts set:', data.prompts || []);
        setTags(data.tags || []);
        setComment(data.comment || '');
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

  netlifyIdentity.on('init', handleUser);
  netlifyIdentity.on('login', handleUser);
  netlifyIdentity.on('logout', () => {
    console.log('User logged out');
    setUser(null);
    setIsLoading(false);
    setIsAdmin(false);
  });
  netlifyIdentity.init();

  return () => {
    netlifyIdentity.off('init');
    netlifyIdentity.off('login');
    netlifyIdentity.off('logout');
  };
}, []);

// Add this separate useEffect to log category changes
useEffect(() => {
  console.log('Categories state updated:', categories);
}, [categories]);

const checkIfAdmin = async (user) => {
  try {
    const response = await fetch('/.netlify/functions/getUserRole', {
      headers: {
        'Authorization': `Bearer ${user.token.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user role');
    }

    const { role } = await response.json();
    return role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

  //  const saveComment = async () => {
  //   try {
  //     await saveData('comment', comment);
  //     console.log('Comment saved successfully');
  //   } catch (err) {
  //     console.error('Save comment error:', err);
  //     setError('Failed to save comment. Please try again.');
  //   }
  // };
  const saveComment = async () => {
    try {
      const newComment = { id: Date.now(), text: comment };
      const updatedComments = [...savedComments, newComment];
      await saveData('comments', updatedComments);
      setSavedComments(updatedComments);
      setComment('');
      console.log('Comment saved successfully');
    } catch (err) {
      console.error('Save comment error:', err);
      setError('Failed to save comment. Please try again.');
    }
  };

  
   // Extract unique hashtags from all prompts
  const allHashtags = [...new Set(prompts.flatMap(prompt => prompt.tags))];

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Starting to load data');
      const data = await getData();
      console.log('Loaded data:', data);
      if (data && typeof data === 'object') {
        const defaultCategories = ['All', 'Văn bản', 'Hình ảnh', 'Đa phương thức', 'Suy luận'];
        const dbCategories = data.categories || [];
        const newCategories = [...new Set([...defaultCategories, ...dbCategories])];
        setCategories(newCategories);
        console.log('Categories set:', newCategories);
        setPrompts(data.prompts || []);
        console.log('Prompts set:', data.prompts || []);
        setTags(data.tags || []);
        setComment(data.comment || '');
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
    } else if (categories.includes(newCategory)) {
      setError('This category already exists.');
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
        <div className="flex flex-wrap gap-2 mb-4">
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
      
        <h3 className="font-bold mb-2">Hashtags from Prompts</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {allHashtags.map(hashtag => (
            <span 
              key={hashtag}
              className="px-2 py-1 rounded-full text-sm bg-gray-200"
            >
              {hashtag}
            </span>
          ))}
        </div>
      
        {/* Comment Section */}
        <h3 className="font-bold mb-2">Your Comment</h3>
        <textarea
          className="w-full p-2 border rounded mb-2"
          rows="4"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your comment here..."
        ></textarea>
        <button 
          className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-700"
          onClick={saveComment}
        >
          Gửi
        </button>
        <div className="mt-4">
          <h4 className="font-bold mb-2">Saved Comments:</h4>
          {savedComments.map((savedComment) => (
            <p key={savedComment.id} className="mb-2">{savedComment.text}</p>
          ))}
        </div>
      
        {/* Admin Controls (if user is admin) */}
        {isAdmin && (
          <div className="mt-8">
            <h3 className="font-bold mb-2">Admin Controls</h3>
            <div className="mb-4">
              <h4 className="font-semibold">Categories</h4>
              {categories.filter(c => c !== 'All').map(category => (
                <AdminCategoryControl 
                  key={category}
                  category={category}
                  onEdit={editCategory}
                  onDelete={deleteCategory}
                />
              ))}
            </div>
            <div className="mb-4">
              <h4 className="font-semibold">Prompts</h4>
              {prompts.map(prompt => (
                <AdminPromptControl 
                  key={prompt.id}
                  prompt={prompt}
                  onEdit={editPrompt}
                  onDelete={deletePrompt}
                />
              ))}
            </div>
            <div className="mb-4">
              <h4 className="font-semibold">Tags</h4>
              {tags.map(tag => (
                <AdminTagControl 
                  key={tag}
                  tag={tag}
                  onEdit={editTag}
                  onDelete={deleteTag}
                />
              ))}
            </div>
          </div>
        )}
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
              <option value="">Select a category</option>
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
              onClick={() => {
                if (!editingPrompt.name || !editingPrompt.category || !editingPrompt.content) {
                  setError('Please fill in all required fields (Name, Category, and Content).');
                  return;
                }
                savePrompt(editingPrompt);
              }}
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
