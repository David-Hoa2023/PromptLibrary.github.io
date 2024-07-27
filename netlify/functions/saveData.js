const { MongoClient } = require('mongodb');
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  console.log('saveData function called');
  console.log('Event headers:', event.headers);

  const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    // Manually verify the token
    const authHeader = event.headers.authorization;
    if (!authHeader) {
      console.log('No authorization header');
      return { 
        statusCode: 401, 
        body: JSON.stringify({ error: 'Unauthorized', details: 'No authorization header' }) 
      };
    }

    const token = authHeader.split(' ')[1];
    const response = await fetch(`${process.env.URL}/.netlify/identity/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      console.log('Invalid token');
      return { 
        statusCode: 401, 
        body: JSON.stringify({ error: 'Unauthorized', details: 'Invalid token' }) 
      };
    }

    const user = await response.json();
    console.log('Authenticated user:', user.id);

    await client.connect();
    console.log('Connected to MongoDB');
    const database = client.db('promptLibrary');
    const collection = database.collection('userData');

    const { key, value } = JSON.parse(event.body);
    console.log('Saving data:', { key, value });

    await collection.updateOne(
      { userId: user.id, key: key },
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
