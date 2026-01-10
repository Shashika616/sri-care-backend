// seedPackage.js (in project root)
require('dotenv').config();

const mongoose = require('mongoose');
const Package = require('./src/models/Package'); // ✅ Correct

// Import static data
const { dataPackages } = require('./src/utils/dataPackages');     // ✅
const { voicePackages } = require('./src/utils/voicePackages');   // ✅
const { services } = require('./src/utils/services');             // ✅

async function seedDB() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing in environment variables');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 Connected to MongoDB');

    await Package.deleteMany({});
    console.log('🗑️ Cleared existing packages');

    const allPackages = [
      ...dataPackages.map(p => ({ ...p, type: 'data' })),
      ...voicePackages.map(p => ({ ...p, type: 'voice' })),
      ...services.map(p => ({ ...p, type: 'VAS' }))
    ];

    await Package.insertMany(allPackages);
    console.log(`✅ Successfully seeded ${allPackages.length} packages!`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding packages:', error.message || error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedDB();