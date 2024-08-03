
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
    console.log('User ID from context:', userId); // Added logging

    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db('promptLibrary');
    const collection = database.collection('userData');

    console.log('Querying MongoDB for user data with userId:', userId); // More specific logging
    const userDocument = await collection.findOne({ userId: userId });

    if (userDocument) {
      console.log('Found user document:', JSON.stringify(userDocument, null, 2));
      console.log('User role from document:', userDocument.role);

      let role = userDocument.role || 'user'; // Default to 'user' if role is not found
      console.log('Determined user role:', role);

      return {
        statusCode: 200,
        body: JSON.stringify({ role }),
      };
    } else {
      console.log('No matching document found for user ID:', userId);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' })
      };
    }
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
