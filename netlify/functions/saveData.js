const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
  console.log('saveData function called');
  const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    // Verify the JWT token
    const token = event.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.sub;

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
      statusCode: error.name === 'JsonWebTokenError' ? 401 : 500, 
      body: JSON.stringify({ error: 'Failed to save data', details: error.message }) 
    };
  } finally {
    await client.close();
  }
};
