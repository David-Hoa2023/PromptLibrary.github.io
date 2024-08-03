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
    
    const adminDb = client.db().admin();
    const dbInfo = await adminDb.listDatabases();
    console.log('Available databases:', dbInfo.databases.map(db => db.name));
    
    const database = client.db('Cluster0');
    const collections = await database.listCollections().toArray();
    console.log('Collections in Cluster0:', collections.map(col => col.name));
    
    const collection = database.collection('promptLibrary');
    
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
