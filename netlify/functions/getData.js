const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  console.log('getData function called');
  const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    console.log('Attempting to connect to MongoDB');
    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db('promptLibrary');
    const collection = database.collection('userData');

    const { user } = context.clientContext;
    if (!user) {
      console.log('No user context provided');
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    console.log('Fetching data for user:', user.sub);
    const data = await collection.find({ userId: user.sub }).toArray();
    console.log('Data fetched:', data);

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
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Failed to fetch data', details: error.message }) 
    };
  } finally {
    console.log('Closing MongoDB connection');
    await client.close();
  }
};
