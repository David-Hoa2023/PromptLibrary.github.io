const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

exports.handler = async function(event, context) {
  try {
    await client.connect();
    const database = client.db('promptLibrary');
    const collection = database.collection('data');

    const { key, value } = JSON.parse(event.body);

    await collection.updateOne(
      { key: key },
      { $set: { value: value } },
      { upsert: true }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Data saved successfully' }),
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  } finally {
    await client.close();
  }
};
