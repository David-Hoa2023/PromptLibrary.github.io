const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    if (!context.clientContext.user) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const userId = context.clientContext.user.sub;
    const tagToDelete = JSON.parse(event.body);

    await client.connect();
    const database = client.db('promptLibrary');
    const collection = database.collection('userData');

    const result = await collection.updateOne(
      { userId },
      { 
        $pull: { tags: tagToDelete },
        $pull: { "prompts.$[].tags": tagToDelete }
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Tag deleted successfully' }),
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Failed to delete tag', details: error.message }) 
    };
  } finally {
    await client.close();
  }
};
