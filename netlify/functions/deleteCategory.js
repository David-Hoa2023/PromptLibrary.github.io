const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    if (!context.clientContext.user) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const userId = context.clientContext.user.sub;
    const categoryToDelete = JSON.parse(event.body);

    await client.connect();
    const database = client.db('promptLibrary');
    const collection = database.collection('userData');

    const result = await collection.updateOne(
      { userId },
      { 
        $pull: { categories: categoryToDelete },
        $pull: { prompts: { category: categoryToDelete } }
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Category deleted successfully' }),
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Failed to delete category', details: error.message }) 
    };
  } finally {
    await client.close();
  }
};
