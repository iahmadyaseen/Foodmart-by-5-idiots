import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { CATEGORIES } from '../src/data/categories';
import { INITIAL_PRODUCTS } from '../src/data/products';
import { INITIAL_REVIEWS } from '../src/data/reviews';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Categories
  console.log('Seeding categories...');
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        image: cat.image,
        subcategories: JSON.stringify(cat.subcategories || []),
        productCount: cat.productCount,
      },
      create: {
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        image: cat.image,
        subcategories: JSON.stringify(cat.subcategories || []),
        productCount: cat.productCount,
      },
    });
  }

  // 2. Seed Products
  console.log('Seeding products...');
  for (const prod of INITIAL_PRODUCTS) {
    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {
        name: prod.name,
        categorySlug: prod.category,
        categoryName: prod.categoryName,
        subcategory: prod.subcategory || null,
        price: prod.price,
        originalPrice: prod.originalPrice || null,
        sale: prod.sale || false,
        unit: prod.unit,
        stockQuantity: prod.stockQuantity,
        stockStatus: prod.stockStatus,
        image: prod.image,
        rating: prod.rating,
        reviewCount: prod.reviewCount,
        description: prod.description,
        isTopSelling: prod.isTopSelling || false,
      },
      create: {
        id: prod.id,
        sku: prod.sku,
        name: prod.name,
        categorySlug: prod.category,
        categoryName: prod.categoryName,
        subcategory: prod.subcategory || null,
        price: prod.price,
        originalPrice: prod.originalPrice || null,
        sale: prod.sale || false,
        unit: prod.unit,
        stockQuantity: prod.stockQuantity,
        stockStatus: prod.stockStatus,
        image: prod.image,
        rating: prod.rating,
        reviewCount: prod.reviewCount,
        description: prod.description,
        isTopSelling: prod.isTopSelling || false,
      },
    });
  }

  // 3. Seed Reviews
  console.log('Seeding customer reviews...');
  for (const rev of INITIAL_REVIEWS) {
    await prisma.review.upsert({
      where: { id: rev.id },
      update: {
        name: rev.name,
        avatar: rev.avatar,
        rating: rev.rating,
        review: rev.review,
        location: rev.location || null,
      },
      create: {
        id: rev.id,
        name: rev.name,
        avatar: rev.avatar,
        rating: rev.rating,
        review: rev.review,
        location: rev.location || null,
      },
    });
  }

  // 4. Seed Admin & Demo Customer Accounts
  console.log('Seeding users (Admin & Customer)...');
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const demoPasswordHash = await bcrypt.hash('demo123', 10);

  const adminEmail = process.env.ADMIN_EMAIL || 'ay8880625@gmail.com';

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'FOOD MART Owner',
      role: 'admin',
    },
    create: {
      id: 'admin-user-01',
      email: adminEmail,
      name: 'FOOD MART Owner',
      password: adminPasswordHash,
      role: 'admin',
    },
  });

  await prisma.user.upsert({
    where: { email: 'demo@foodmart.com' },
    update: {
      name: 'Janger Customer',
      role: 'customer',
    },
    create: {
      id: 'customer-user-01',
      email: 'demo@foodmart.com',
      name: 'Janger Customer',
      password: demoPasswordHash,
      role: 'customer',
    },
  });

  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
