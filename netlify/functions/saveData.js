const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  console.log('saveData function called');
  const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const database = client.db('promptLibrary');
    const collection = database.collection('userData');

    const { user } = context.clientContext;
    if (!user) {
      console.log('No user context');
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const { key, value } = JSON.parse(event.body);
    console.log('Saving data:', { key, value });

    await collection.updateOne(
      { userId: user.sub, key: key },
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
      body: JSON.stringify({ error: 'Failed to save data', details: error.message }) 
    };
  } finally {
    await client.close();
  }
};
