const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  console.log('getData function called');
  const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    if (!context.clientContext.user) {
      console.log('No authenticated user');
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const userId = context.clientContext.user.sub;
    console.log('User ID:', userId);

    await client.connect();
    console.log('Connected to MongoDB');
    const database = client.db('promptLibrary');
    const collection = database.collection('userData');

    const userData = await collection.findOne({ userId });
    console.log('User data:', userData);

    // const result = {
    //   categories: (userData && userData.categories) || [],
    //   prompts: (userData && userData.prompts) || [],
    //   tags: (userData && userData.tags) || [],
    //   comment: userData && userData.comment
    // };
    // In getData.js
    const result = {
      categories: (userData && userData.categories) || [],
      prompts: (userData && userData.prompts) || [],
      tags: (userData && userData.tags) || [],
      comments: (userData && userData.comments) || []
    };

    console.log('Returning data:', result);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error in getData:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Failed to fetch data', details: error.message }) 
    };
  } finally {
    await client.close();
  }
};
