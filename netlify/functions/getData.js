const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

exports.handler = async function(event, context) {
  console.log('getData function called');
  let connection = null;

  try {
    console.log('Attempting to connect to MongoDB');
    console.log('MongoDB URI:', uri.replace(/:([^:@]{1,})@/, ':****@')); // Log URI with password masked
    connection = await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db('promptLibrary');
    const collection = database.collection('data');

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
      console.log('Initial data added. Insert result:', insertResult);
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
    console.error('Error in getData:', error);
    console.error('Error stack:', error.stack);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: error.message, 
        stack: error.stack,
        mongodbUri: uri ? 'Set' : 'Not set'
      }) 
    };
  } finally {
    if (connection) {
      console.log('Closing MongoDB connection');
      await connection.close();
    }
  }
};
