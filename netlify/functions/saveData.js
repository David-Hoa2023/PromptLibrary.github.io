const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  console.log('saveData function called');
  console.log('Event headers:', event.headers);
  console.log('Client context:', context.clientContext);

  const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    // Check if the user is authenticated
    if (!event.headers.authorization) {
      console.log('No authorization header');
      return { 
        statusCode: 401, 
        body: JSON.stringify({ error: 'Unauthorized', details: 'No authorization header' }) 
      };
    }

    const token = event.headers.authorization.split(' ')[1];
    console.log('Received token:', token.slice(0, 10) + '...');

    // Here you would typically verify the JWT token
    // For now, we'll assume if a token is present, the user is authenticated
    const userId = context.clientContext.user ? context.clientContext.user.sub : 'unknown';
    console.log('User ID:', userId);

    await client.connect();
    console.log('Connected to MongoDB');
    const database = client.db('promptLibrary');
    const collection = database.collection('userData');

    const { key, value } = JSON.parse(event.body);
    console.log('Saving data:', { key, value });

    await collection.updateOne(
      { userId: userId, key: key },
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
