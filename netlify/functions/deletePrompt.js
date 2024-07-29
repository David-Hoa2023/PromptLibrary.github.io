const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    if (!context.clientContext.user) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const userId = context.clientContext.user.sub;
    const promptIdToDelete = JSON.parse(event.body);

    await client.connect();
    const database = client.db('promptLibrary');
    const collection = database.collection('userData');

    const result = await collection.updateOne(
      { userId },
      { $pull: { prompts: { id: promptIdToDelete } } }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Prompt deleted successfully' }),
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Failed to delete prompt', details: error.message }) 
    };
  } finally {
    await client.close();
  }
};
