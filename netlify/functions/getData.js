const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

exports.handler = async function(event, context) {
  console.log('getData function called');
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const database = client.db('promptLibrary');
    const collection = database.collection('data');

    const data = await collection.find({}).toArray();
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
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  } finally {
    await client.close();
  }
};
