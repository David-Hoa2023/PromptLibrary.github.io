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

    const data = await collection.find({ userId: user.sub }).toArray();
    const result = data.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  } finally {
    await client.close();
  }
};
