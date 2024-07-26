const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

exports.handler = async function(event, context) {
  console.log('getData function called');
  let connection = null;

  try {
    console.log('Attempting to connect to MongoDB');
    connection = await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db('promptLibrary');
    const collection = database.collection('data');

    console.log('Fetching data from collection');
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
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message, stack: error.stack }) 
    };
  } finally {
    if (connection) await connection.close();
  }
};
