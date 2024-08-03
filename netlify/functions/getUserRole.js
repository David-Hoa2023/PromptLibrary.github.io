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
    
    const database = client.db('promptLibrary');
    const collections = await database.listCollections().toArray();
    console.log('Collections in promptLibrary:', collections.map(col => col.name));
    
    if (collections.length === 0) {
      console.log('No collections found in the promptLibrary database');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Database structure issue' })
      };
    }
    
    // Assuming the first collection is the one we want
    const collection = database.collection(collections[0].name);
    console.log('Using collection:', collections[0].name);
    
    console.log('Querying MongoDB for user role');
    const userDocuments = await collection.find({}).toArray();
    console.log(`Found ${userDocuments.length} total documents in the collection`);
    
    const userDocument = userDocuments.find(doc => doc.userId === userId || doc._id === userId);
    
    if (userDocument) {
      console.log('Found user document:', JSON.stringify(userDocument, null, 2));
      const role = userDocument.role || 'user';
      console.log('User role:', role);
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
