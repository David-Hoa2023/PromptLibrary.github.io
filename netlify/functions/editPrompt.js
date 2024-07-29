const { MongoClient, ObjectId } = require('mongodb');

exports.handler = async (event, context) => {
  const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    if (!context.clientContext.user) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const userId = context.clientContext.user.sub;
    const { promptId, updatedPrompt } = JSON.parse(event.body);

    await client.connect();
    const database = client.db('promptLibrary');
    const collection = database.collection('userData');

    const result = await collection.updateOne(
      { userId, "prompts.id": promptId },
      { $set: { "prompts.$": updatedPrompt } }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Prompt updated successfully' }),
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Failed to update prompt', details: error.message }) 
    };
  } finally {
    await client.close();
  }
};
