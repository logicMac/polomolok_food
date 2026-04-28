// Quick script to check and clear blocked IPs for localhost
const mongoose = require('mongoose');
require('dotenv').config();

const BlockedIPSchema = new mongoose.Schema({
  ipAddress: String,
  reason: String,
  isActive: Boolean,
  blockedAt: Date,
  expiresAt: Date
});

const BlockedIP = mongoose.model('BlockedIP', BlockedIPSchema);

async function checkAndClearLocalhost() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');
    
    const localhostIPs = ['127.0.0.1', '::1', '::ffff:127.0.0.1', 'localhost'];
    
    console.log('\n🔍 Checking for blocked localhost IPs...\n');
    
    for (const ip of localhostIPs) {
      const blocked = await BlockedIP.find({ ipAddress: ip });
      
      if (blocked.length > 0) {
        console.log(`❌ Found ${blocked.length} blocked entry(ies) for ${ip}:`);
        blocked.forEach(entry => {
          console.log(`   - Reason: ${entry.reason}`);
          console.log(`   - Active: ${entry.isActive}`);
          console.log(`   - Blocked at: ${entry.blockedAt}`);
        });
        
        // Delete them
        const result = await BlockedIP.deleteMany({ ipAddress: ip });
        console.log(`✅ Deleted ${result.deletedCount} entry(ies) for ${ip}\n`);
      } else {
        console.log(`✓ No blocked entries for ${ip}`);
      }
    }
    
    console.log('\n✅ Done! Localhost IPs are now clear.');
    console.log('Please restart your backend server for changes to take effect.\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAndClearLocalhost();
