// import { useState } from 'react';
// import { Edit, Trash2 } from 'lucide-react';

import React, { useState, useEffect } from 'react';
// import { PlusCircle, X } from 'lucide-react';
import { PlusCircle, X, Edit, Trash2, LogIn, LogOut } from 'lucide-react';
import { getCurrentUser, signOut, saveData, getData } from './database';

// Add these new components here
const AdminCategoryControl = ({ category, onEdit, onDelete }) => (
  <div className="flex items-center justify-between p-2 border-b">
    <span>{category}</span>
    <div>
      <button onClick={() => onEdit(category)} className="mr-2 text-blue-500"><Edit size={16} /></button>
      <button onClick={() => onDelete(category)} className="text-red-500"><Trash2 size={16} /></button>
    </div>
  </div>
);

const AdminPromptControl = ({ prompt, onEdit, onDelete }) => (
  <div className="flex items-center justify-between p-2 border-b">
    <span>{prompt.name}</span>
    <div>
      <button onClick={() => onEdit(prompt)} className="mr-2 text-blue-500"><Edit size={16} /></button>
      <button onClick={() => onDelete(prompt)} className="text-red-500"><Trash2 size={16} /></button>
    </div>
  </div>
);

const AdminTagControl = ({ tag, onEdit, onDelete }) => (
  <div className="flex items-center justify-between p-2 border-b">
    <span>{tag}</span>
    <div>
      <button onClick={() => onEdit(tag)} className="mr-2 text-blue-500"><Edit size={16} /></button>
      <button onClick={() => onDelete(tag)} className="text-red-500"><Trash2 size={16} /></button>
    </div>
  </div>
);

const AdminCommentControl = ({ comment, onEdit, onDelete }) => (
  <div className="flex items-center justify-between p-2 border-b">
    <span>{comment.text.substring(0, 50)}...</span>
    <div>
      <button onClick={() => onEdit(comment)} className="mr-2 text-blue-500"><Edit size={16} /></button>
      <button onClick={() => onDelete(comment)} className="text-red-500"><Trash2 size={16} /></button>
    </div>
  </div>
);

const getLightPastelColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 90%)`;
};

const checkIfAdmin = async (user) => {
      try {
        const token = await user.jwt();
        const response = await fetch('/.netlify/functions/getUserRole', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const { role } = await response.json();
        return role === 'admin';
      } catch (error) {
        console.error('Error checking admin status:', error);
        // Depending on your error handling strategy, you might want to throw the error here
        // instead of returning false, so the calling code can handle it appropriately
        return false;
      }
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

useEffect(() => {
  const netlifyIdentity = window.netlifyIdentity;
  
  const handleUser = async (user) => {
    console.log('Netlify Identity initialized/User logged in:', user);
    setUser(user);
    if (user) {
      // Check if the user is an admin
      const adminStatus = await checkIfAdmin(user);
      setIsAdmin(adminStatus);
      loadData();
    } else {
      setIsLoading(false);
      setIsAdmin(false);
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
// Add this useEffect for debugging
useEffect(() => {
console.log('isAdmin state changed:', isAdmin);
}, [isAdmin]);

useEffect(() => {
  console.log('Categories:', categories);
  console.log('Prompts:', prompts);
  console.log('Tags:', tags);
}, [categories, prompts, tags]);

  // In your PromptLibrary component, add these new functions: 

  const handleLogin = () => {
    const netlifyIdentity = window.netlifyIdentity;
    netlifyIdentity.open();
    netlifyIdentity.on('login', (user) => {
      netlifyIdentity.close();
      setUser(user);
      checkIfAdmin(user).then(setIsAdmin);
    });
  };

  const handleLogout = () => {
    const netlifyIdentity = window.netlifyIdentity;
    netlifyIdentity.logout();
    netlifyIdentity.on('logout', () => {
      netlifyIdentity.close();
      setUser(null);
      setIsAdmin(false);
    });
  };

  const editCategory = async (category) => {
    const newName = prompt(`Enter new name for category "${category}":`, category);
    if (newName && newName !== category) {
      try {
        await saveData('editCategory', { oldName: category, newName });
        setCategories(categories.map(c => c === category ? newName : c));
      } catch (error) {
        setError('Failed to edit category. Please try again.');
      }
    }
  };
  
  const deleteCategory = async (category) => {
    if (window.confirm(`Are you sure you want to delete the category "${category}"?`)) {
      try {
        await saveData('deleteCategory', category);
        setCategories(categories.filter(c => c !== category));
      } catch (error) {
        setError('Failed to delete category. Please try again.');
      }
    }
  };
  
  const editPrompt = (prompt) => {
    setEditingPrompt(prompt);
  };
  
  const deletePrompt = async (prompt) => {
    if (window.confirm(`Are you sure you want to delete the prompt "${prompt.name}"?`)) {
      try {
        await saveData('deletePrompt', prompt.id);
        setPrompts(prompts.filter(p => p.id !== prompt.id));
      } catch (error) {
        setError('Failed to delete prompt. Please try again.');
      }
    }
  };
  
  const editTag = async (tag) => {
    const newTag = prompt(`Enter new name for tag "${tag}":`, tag);
    if (newTag && newTag !== tag) {
      try {
        await saveData('editTag', { oldTag: tag, newTag });
        setTags(tags.map(t => t === tag ? newTag : t));
        setPrompts(prompts.map(p => ({
          ...p,
          tags: p.tags.map(t => t === tag ? newTag : t)
        })));
      } catch (error) {
        setError('Failed to edit tag. Please try again.');
      }
    }
  };
  
  const deleteTag = async (tag) => {
    if (window.confirm(`Are you sure you want to delete the tag "${tag}"?`)) {
      try {
        await saveData('deleteTag', tag);
        setTags(tags.filter(t => t !== tag));
        setPrompts(prompts.map(p => ({
          ...p,
          tags: p.tags.filter(t => t !== tag)
        })));
      } catch (error) {
        setError('Failed to delete tag. Please try again.');
      }
    }
  };


// Add this separate useEffect to log category changes
useEffect(() => {
  console.log('Categories state updated:', categories);
}, [categories]);

    
  
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
  <div className="flex flex-col h-screen bg-gray-100">
    {/* Top bar for login/logout */}
    <div className="bg-white p-4 shadow-md">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Prompt Library</h1>
        {user ? (
          <div className="flex items-center">
            <span className="mr-2">{user.email}</span>
            <button 
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </button>
          </div>
        ) : (
          <button 
            onClick={handleLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
          >
            <LogIn size={16} className="mr-2" />
            Login
          </button>
        )}
      </div>
    </div>

    {/* Main content area */}
    <div className="flex flex-1 overflow-hidden">
      {/* Left section */}      
      <div className="w-1/4 bg-white p-4 shadow-md overflow-y-auto">
        <div className="bg-yellow-100 p-2 mb-4 rounded">
          Admin Status: {isAdmin ? 'Admin' : 'Not Admin'}
        </div>
        <h2 className="text-xl font-bold mb-4">Thư viện Prompt</h2>
        {/* Categories */}
        <ul className="mb-4">
          {categories.map(category => (
            <li key={category} className="flex items-center cursor-pointer p-2">
              <input 
                type="checkbox" 
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryChange(category)}
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
        
        {/* Tags */}
        <h3 className="font-bold mb-2">Tags</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map(tag => (
            <span 
              key={tag}
              className={`px-2 py-1 rounded-full text-sm cursor-pointer ${
                selectedTags.includes(tag) ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
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

{/*         {/* Extended Admin Controls */}
        {isAdmin && (
          <div className="mt-8">
            <h3 className="font-bold mb-2">Admin Controls</h3>
            
            {/* Categories */}
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

            {/* Prompts */}
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

            {/* Tags */}
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

            {/* Comments */}
            <div className="mb-4">
              <h4 className="font-semibold">Comments</h4>
              {comments.map(comment => (
                <AdminCommentControl 
                  key={comment.id}
                  comment={comment}
                  onEdit={editComment}
                  onDelete={deleteComment}
                />
              ))}
            </div>
          </div>
        )}
      </div> */}
          
    
                      

        {/* Left section */}

{/*         {isAdmin && (
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
        )}      */}
{/*       </div> */}
      {/* Temporarily remove isAdmin condition for debugging */}
      

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
