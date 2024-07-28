const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  console.log('saveData function called');
  const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    if (!context.clientContext.user) {
      console.log('No authenticated user');
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const userId = context.clientContext.user.sub;
    console.log('User ID:', userId);

    await client.connect();
    console.log('Connected to MongoDB');
    const database = client.db('promptLibrary');
    const collection = database.collection('userData');

    // const { key, value } = JSON.parse(event.body);
    // console.log('Saving data:', { key, value });
    // In saveData.js
    const { key, value } = JSON.parse(event.body);
    await collection.updateOne(
      { userId },
      { $set: { [key]: value } },
      { upsert: true }
    );

    await collection.updateOne(
      { userId },
      { $set: { [key]: value } },
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
