const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  
  console.log('getUserRole function called');
  try {
    if (!context.clientContext || !context.clientContext.user) {
      console.log('No authenticated user or client context');
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }
    const userId = context.clientContext.user.sub;
    console.log('Checking role for user ID:', userId);
    
    await client.connect();
    console.log('Connected to MongoDB');
    
    const database = client.db('Project 0');
    const collection = database.collection('promptLibrary');
    
    console.log('Querying MongoDB with:', { userId });
    const user = await collection.findOne({ userId });
    
    if (!user) {
      console.log('User not found in database for ID:', userId);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' })
      };
    }
    
    console.log('User data from MongoDB:', JSON.stringify(user, null, 2));
    
    const role = user.role || 'user';
    console.log('User role:', role);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ role }),
    };
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Failed to fetch user role', details: error.message }) 
    };
  } finally {
    await client.close();
  }
};
