import { sequelize } from '../config/db.js';
import { User } from '../models/user.model.js';
import { Post } from '../models/post.model.js';
import { Comment } from '../models/comment.model.js';
import { Product } from '../models/product.model.js';
import { Order } from '../models/order.model.js';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import path from 'path';

async function seed() {
  await sequelize.sync();
  const pwd = await bcrypt.hash(process.env.SEED_PASSWORD || 'password123', 10);

  const admin = await User.findOne({ where: { email: 'admin@example.com' } });
  if (!admin)
    await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: pwd,
      role: 'admin',
    });

  const u = await User.findOne({ where: { email: 'user@example.com' } });
  if (!u)
    await User.create({
      name: 'User',
      email: 'user@example.com',
      password: pwd,
      role: 'user',
    });

  const products = await Product.count();
  if (products === 0) {
    await Product.bulkCreate([
      { name: 'Widget', price: 9.99 },
      { name: 'Gadget', price: 19.99 },
    ]);
  }

  const posts = await Post.count();
  if (posts === 0) {
    const adminUser = await User.findOne({
      where: { email: 'admin@example.com' },
    });
    const normalUser = await User.findOne({
      where: { email: 'user@example.com' },
    });
    const p1 = await Post.create({
      title: 'Welcome',
      body: 'Hello world',
      userId: adminUser.id,
    });
    await Post.create({
      title: 'Second',
      body: 'Another post',
      userId: normalUser.id,
    });
    await Comment.create({
      text: 'Nice!',
      postId: p1.id,
      userId: normalUser.id,
    });
  }

  const orders = await Order.count();
  if (orders === 0) {
    const normalUser = await User.findOne({
      where: { email: 'user@example.com' },
    });
    await Order.create({ total: 29.99, userId: normalUser.id });
  }

  console.log('✅ Seed completed');
}

// --- Fix for ES Modules (no require.main) ---
const __filename = fileURLToPath(import.meta.url);
const isMain = process.argv[1] === __filename;

if (isMain) {
  seed()
    .then(() => {
      console.log('🌱 Seeding finished successfully');
      process.exit(0);
    })
    .catch((e) => {
      console.error('❌ Error during seeding:', e);
      process.exit(1);
    });
}

export default seed;