const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const database = client.db('promptLibrary');
    const collection = database.collection('data');

    const { user } = context.clientContext;
    if (!user) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    const { key, value } = JSON.parse(event.body);
    await collection.updateOne(
      { userId: user.sub, key: key },
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
