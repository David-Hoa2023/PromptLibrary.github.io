const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

exports.handler = async function(event, context) {
  console.log('saveData function called');
  let connection = null;

  try {
    console.log('Attempting to connect to MongoDB');
    connection = await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db('promptLibrary');
    const collection = database.collection('data');

    const { key, value } = JSON.parse(event.body);
    console.log(`Saving data: key=${key}`);

    await collection.updateOne(
      { key: key },
      { $set: { value: value } },
      { upsert: true }
    );

    console.log('Data saved successfully');

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Data saved successfully' }),
    };
  } catch (error) {
    console.error('Error in saveData:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message, stack: error.stack }) 
    };
  } finally {
    if (connection) await connection.close();
  }
};
