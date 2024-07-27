const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  console.log('getData function called');
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

    const data = await collection.find({ userId: userId }).toArray();
    console.log('Data fetched:', data);

    const result = data.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    console.log('Formatted result:', result);

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
    await client.close();
  }
};
