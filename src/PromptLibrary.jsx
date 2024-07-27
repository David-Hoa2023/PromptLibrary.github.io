import React, { useState, useEffect } from 'react';
import { PlusCircle, X, LogIn, UserPlus } from 'lucide-react';
import { saveData, getAllData, signUp, signIn, signOut, getCurrentUser } from './database';

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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const addPrompt = () => {
    const newPrompt = {
      id: Date.now(),
      name: 'New Prompt',
      category: categories[1],
      content: '',
      tags: []
    };
    setEditingPrompt(newPrompt);
  };

  const savePrompt = async (updatedPrompt) => {
    let newPrompts;
    if (prompts.some(p => p.id === updatedPrompt.id)) {
      newPrompts = prompts.map(p => p.id === updatedPrompt.id ? updatedPrompt : p);
    } else {
      newPrompts = [...prompts, updatedPrompt];
    }
    
    // Update tags
    const newTags = [...new Set([...tags, ...updatedPrompt.tags])];

    try {
      await saveData('prompts', newPrompts);
      await saveData('tags', newTags);
      setPrompts(newPrompts);
      setTags(newTags);
      setEditingPrompt(null);
    } catch (err) {
      setError('Failed to save prompt. Please try again.');
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

  // const handleAuth = async (e) => {
  //   e.preventDefault();
  //   try {
  //     if (isSignUp) {
  //       console.log('Attempting to sign up...');
  //       await signUp(email, password);
  //       console.log('Sign up successful');
  //     } else {
  //       console.log('Attempting to sign in...');
  //       await signIn(email, password);
  //       console.log('Sign in successful');
  //     }
  //     setShowAuthModal(false);
  //     setEmail('');
  //     setPassword('');
  //   } catch (error) {
  //     console.error('Authentication error:', error);
  //     setError(error.message || 'An error occurred during authentication');
  //   }
  // };
  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        console.log('Attempting to sign up...');
        await signUp();
        console.log('Sign up successful');
      } else {
        console.log('Attempting to sign in...');
        await signIn();
        console.log('Sign in successful');
      }
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message || 'An error occurred during authentication');
    }
  };

  const filteredPrompts = prompts.filter(prompt => 
    (selectedCategories.includes('All') || selectedCategories.includes(prompt.category)) &&
    (selectedTags.length === 0 || selectedTags.some(tag => prompt.tags.includes(tag)))
  );

  return (
    // <div className="flex h-screen bg-gray-100">
    //   {error && (
    //     <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 text-center">
    //       {error}
    //     </div>
    //   )}
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
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
              onClick={signOut}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
              onClick={() => { setShowAuthModal(true); setIsSignUp(false); }}
            >
              <LogIn className="mr-2" size={20} />
              Sign In
            </button>
            <button 
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
              onClick={() => { setShowAuthModal(true); setIsSignUp(true); }}
            >
              <UserPlus className="mr-2" size={20} />
              Sign Up
            </button>
          </>
        )}
      </div>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-2xl font-bold mb-4">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
            <form onSubmit={handleAuth}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 mb-4 border rounded"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 mb-4 border rounded"
                required
              />
              <button 
                type="submit"
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
            </form>
            <button 
              className="w-full mt-4 text-blue-500 hover:text-blue-700"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
            </button>
            <button 
              className="w-full mt-4 text-gray-500 hover:text-gray-700"
              onClick={() => setShowAuthModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {user ? (
        <>
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
          <div className="w-3/4 p-4 bg-gray-100 overflow-y-auto">
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

          {/* Full-screen edit modal */}
          {editingPrompt && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg w-2/3 h-2/3 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <input 
                    className="text-xl font-bold"
                    value={editingPrompt.name}
                    onChange={(e) => setEditingPrompt({...editingPrompt, name: e.target.value})}
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
