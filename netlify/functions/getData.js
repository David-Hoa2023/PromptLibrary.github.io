const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  console.log('getData function called');
  console.log('Event headers:', JSON.stringify(event.headers));
  console.log('Client context:', JSON.stringify(context.clientContext));

  const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    if (!event.headers.authorization) {
      console.log('No authorization header');
      return { 
        statusCode: 401, 
        body: JSON.stringify({ error: 'Unauthorized', details: 'No authorization header' }) 
      };
    }

    const token = event.headers.authorization.split(' ')[1];
    console.log('Received token:', token.slice(0, 10) + '...');

    if (!context.clientContext || !context.clientContext.user) {
      console.log('No user context');
      return { 
        statusCode: 401, 
        body: JSON.stringify({ error: 'Unauthorized', details: 'No user context' }) 
      };
    }

    const userId = context.clientContext.user.sub;
    console.log('User ID:', userId);

    await client.connect();
    console.log('Connected to MongoDB');
    const database = client.db('promptLibrary');
    const collection = database.collection('userData');

    const data = await collection.find({ userId: userId }).toArray();
    console.log('Data fetched:', JSON.stringify(data));

    const result = data.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    console.log('Formatted result:', JSON.stringify(result));

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error in getData:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Failed to fetch data', details: error.message, stack: error.stack }) 
    };
  } finally {
    await client.close();
  }
};
