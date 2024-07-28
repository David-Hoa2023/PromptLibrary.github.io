const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  console.log('getData function called');
  const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    if (!context.clientContext.user) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const userId = context.clientContext.user.sub;
    await client.connect();
    const database = client.db('promptLibrary');
    const collection = database.collection('userData');

    const data = await collection.findOne({ userId });

    // Ensure we always return an object with categories, prompts, and tags
    const result = {
      categories: (data && data.categories) || [],
      prompts: (data && data.prompts) || [],
      tags: (data && data.tags) || []
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
