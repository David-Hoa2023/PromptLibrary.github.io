const { MongoClient } = require('mongodb');

exports.handler = async function(event, context) {
  console.log('getData function called');
  
  const uri = process.env.MONGODB_URI;
  console.log('MongoDB URI (masked):', uri ? uri.replace(/:([^:@]{1,})@/, ':****@') : 'Not set');

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  let connection = null;

  try {
    console.log('Attempting to connect to MongoDB');
    connection = await client.connect();
    console.log('Connected to MongoDB successfully');

    const database = client.db('promptLibrary');
    console.log('Accessed promptLibrary database');
    const collection = database.collection('data');
    console.log('Accessed data collection');

    // Check if collection is empty and add initial data if it is
    const count = await collection.countDocuments();
    console.log('Document count:', count);
    
    if (count === 0) {
      console.log('Collection is empty. Adding initial data.');
      const initialData = [
        { key: 'categories', value: ['All', 'Văn bản', 'Hình ảnh', 'Đa phương thức', 'Suy luận'] },
        { key: 'prompts', value: [] },
        { key: 'tags', value: [] }
      ];
      const insertResult = await collection.insertMany(initialData);
      console.log('Initial data added. Insert result:', JSON.stringify(insertResult));
    }

    console.log('Fetching data from collection');
    const data = await collection.find({}).toArray();
    console.log('Data fetched:', JSON.stringify(data, null, 2));

    const result = data.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error in getData:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: error.message, 
        name: error.name,
        code: error.code,
        stack: error.stack,
        mongodbUri: uri ? 'Set' : 'Not set'
      }) 
    };
  } finally {
    if (connection) {
      console.log('Closing MongoDB connection');
      await client.close();
    }
  }
};
