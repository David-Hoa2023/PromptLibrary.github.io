const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  console.log('getData function called');
  const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*', // Replace with your domain in production
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  try {
    // Check for authenticated user
    if (!context.clientContext.user) {
      console.log('No authenticated user');
      return { 
        statusCode: 401, 
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }) 
      };
    }

    const userId = context.clientContext.user.sub;
    console.log('User ID:', userId);

    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db('promptLibrary');
    const collection = database.collection('userData');

    // Fetch user data
    const userData = await collection.findOne({ userId });
    console.log('User data:', userData);

    // Validate user data
    if (!userData || typeof userData !== 'object') {
      console.log('User data not found or invalid');
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User data not found or invalid' })
      };
    }

    // Define default categories
    const defaultCategories = ['All', 'Văn bản', 'Hình ảnh', 'Đa phương thức', 'Suy luận'];

    // Prepare result with default categories and user data
    const result = {
      categories: [...new Set([...defaultCategories, ...(userData.categories || [])])],
      prompts: userData.prompts || [],
      tags: userData.tags || [],
      comments: userData.comments || []
    };

    console.log('Returning data:', result);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };

  } catch (error) {
    console.error('Error in getData:', error);

    // Handle specific error types
    if (error.name === 'MongoNetworkError') {
      return { 
        statusCode: 503,
        headers,
        body: JSON.stringify({ error: 'Database unavailable', details: error.message }) 
      };
    }

    return { 
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch data', details: error.message }) 
    };

  } finally {
    // Ensure the client is closed when the function is complete
    await client.close();
  }
};
