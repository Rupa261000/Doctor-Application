const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/test'; // Update with your MongoDB URI and DB name

async function removeUsernameIndex() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // List indexes before dropping
    const indexesBefore = await collection.indexes();
    console.log('Indexes before dropping:', indexesBefore);

    // Drop the username_1 index
    await collection.dropIndex('username_1');
    console.log('Dropped index username_1 successfully.');

    // List indexes after dropping
    const indexesAfter = await collection.indexes();
    console.log('Indexes after dropping:', indexesAfter);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error dropping index:', error);
    process.exit(1);
  }
}

removeUsernameIndex();
