import User from '../features/users/user.model.js';

export const autoSeedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'System Administrator',
        email: process.env.ADMIN_EMAIL || 'admin@bustracker.com',
        password: process.env.ADMIN_PASSWORD || 'AdminPassword123!',
        role: 'admin',
      });
      console.log('✅ [AutoSeed] Default production admin created successfully:');
      console.log(`   Email: ${process.env.ADMIN_EMAIL || 'admin@bustracker.com'}`);
      console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'AdminPassword123!'}`);
    } else {
      console.log('[DB] Admin account verified in database.');
    }
  } catch (error) {
    console.error('⚠️ [AutoSeed] Error checking/seeding admin:', error.message);
  }
};

export default autoSeedAdmin;
