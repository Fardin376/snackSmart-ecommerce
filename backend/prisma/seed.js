import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();

  // Seed Admins
  const adminPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);

  const admin1 = await prisma.admin.create({
    data: {
      name: 'Admin User',
      email: 'admin@snacksmart.com',
      password: adminPassword,
      role: 'Super Admin',
    },
  });

  await prisma.admin.create({
    data: {
      name: 'Staff Member',
      email: 'staff@snacksmart.com',
      password: staffPassword,
      role: 'Staff Admin',
    },
  });

  await prisma.admin.create({
    data: {
      name: 'John Manager',
      email: 'john.m@snacksmart.com',
      password: staffPassword,
      role: 'Staff Admin',
    },
  });

  // Seed Users (Customers)
  const userPassword = await bcrypt.hash('user123', 10);

  const user1 = await prisma.user.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: userPassword,
      confirmed: true,
      isActive: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      password: userPassword,
      confirmed: true,
      isActive: true,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob@example.com',
      password: userPassword,
      confirmed: true,
      isActive: false,
    },
  });

  const user4 = await prisma.user.create({
    data: {
      firstName: 'Alice',
      lastName: 'Williams',
      email: 'alice@example.com',
      password: userPassword,
      confirmed: true,
      isActive: true,
    },
  });

  const user5 = await prisma.user.create({
    data: {
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie@example.com',
      password: userPassword,
      confirmed: true,
      isActive: true,
    },
  });

  // Seed products
  const products = [
    {
      name: 'Trail Mix - Superfood',
      description: 'Nuts, seeds, and goji berries mix',
      category: 'Mix',
      price: 8.49,
      stock: 120,
      status: 'active',
      image:
        'https://www.shutterstock.com/shutterstock/photos/2601168577/display_1500/stock-photo-organic-raw-whole-dry-almonds-in-a-bowl-2601168577.jpg',
    },
    {
      name: 'Sweet Potato Chips',
      description: 'Baked sweet potato chips with sea salt',
      category: 'Chips',
      price: 4.79,
      stock: 250,
      status: 'active',
      image:
        'https://www.shutterstock.com/shutterstock/photos/2627996685/display_1500/stock-photo-mix-of-tasty-salty-nuts-a-group-of-almonds-pistachios-walnuts-macadamia-cashews-2627996685.jpg',
    },
    {
      name: 'Seaweed Snacks',
      description: 'Roasted seaweed sheets with sesame',
      category: 'Seaweed',
      price: 2.99,
      stock: 80,
      status: 'active',
      image:
        'https://www.shutterstock.com/shutterstock/photos/634164194/display_1500/stock-photo-a-closup-of-honey-roasted-cashews-634164194.jpg',
    },
    {
      name: 'Rice Cakes - Whole Grain',
      description: 'Lightly salted whole grain rice cakes',
      category: 'Cakes',
      price: 3.29,
      stock: 150,
      status: 'active',
      image:
        'https://www.shutterstock.com/shutterstock/photos/2398083593/display_1500/stock-photo-chocolate-balls-with-hazelnut-isolated-on-white-background-2398083593.jpg',
    },
    {
      name: 'Quinoa Chips',
      description: 'Baked quinoa chips with sea salt',
      category: 'Chips',
      price: 4.49,
      stock: 200,
      status: 'active',
      image:
        'https://www.shutterstock.com/shutterstock/photos/2566437943/display_1500/stock-photo-lots-of-macadamia-nuts-in-a-box-being-sold-at-the-market-selective-focus-2566437943.jpg',
    },
    {
      name: 'Apple Chips',
      description: 'Crispy baked apple chips, no sugar added',
      category: 'Dried Fruit',
      price: 3.99,
      stock: 30,
      status: 'active',
      image:
        'https://www.shutterstock.com/shutterstock/photos/2654522913/display_1500/stock-photo-stockholm-sweden-mix-of-different-protein-bars-2654522913.jpg',
    },
    {
      name: 'Chickpea Puffs',
      description: 'Crunchy roasted chickpea snack',
      category: 'Chips',
      price: 3.49,
      stock: 156,
      status: 'active',
      image:
        'https://www.shutterstock.com/shutterstock/photos/2238424425/display_1500/stock-photo-dried-cranberries-and-walnuts-in-a-bowl-on-a-wooden-table-2238424425.jpg',
    },
    {
      name: 'Kale Chips',
      description: 'Organic baked kale chips with olive oil',
      category: 'Chips',
      price: 5.99,
      stock: 89,
      status: 'active',
      image:
        'https://www.shutterstock.com/shutterstock/photos/1814003546/display_1500/stock-photo-whole-grain-wheat-round-crackers-and-milk-on-white-table-background-1814003546.jpg',
    },
    {
      name: 'Pumpkin Seeds',
      description: 'Roasted and lightly salted',
      category: 'Seeds',
      price: 5.49,
      stock: 342,
      status: 'active',
      image:
        'https://www.shutterstock.com/shutterstock/photos/2287990401/display_1500/stock-photo-roasted-salted-pistachios-in-a-bowl-on-wooden-background-top-view-2287990401.jpg',
    },
    {
      name: 'Dark Chocolate Bar',
      description: '85% cacao dark chocolate',
      category: 'Chocolate',
      price: 3.99,
      stock: 298,
      status: 'active',
      image:
        'https://www.shutterstock.com/shutterstock/photos/2646185457/display_1500/stock-photo-two-delicious-granola-bars-with-almonds-oats-and-dried-cranberries-isolated-on-a-white-2646185457.jpg',
    },
  ];

  const createdProducts = [];
  for (const product of products) {
    const p = await prisma.product.create({
      data: product,
    });
    createdProducts.push(p);
  }

  // Seed Orders
  const order1 = await prisma.order.create({
    data: {
      userId: user1.id,
      total: 18.97,
      status: 'completed',
      orderItems: {
        create: [
          { productId: createdProducts[0].id, quantity: 1, price: 8.49 },
          { productId: createdProducts[1].id, quantity: 2, price: 4.79 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      userId: user2.id,
      total: 8.97,
      status: 'completed',
      orderItems: {
        create: [
          { productId: createdProducts[2].id, quantity: 3, price: 2.99 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      userId: user4.id,
      total: 29.94,
      status: 'completed',
      orderItems: {
        create: [
          { productId: createdProducts[4].id, quantity: 1, price: 4.49 },
          { productId: createdProducts[7].id, quantity: 4, price: 5.49 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      userId: user3.id,
      total: 5.99,
      status: 'pending',
      orderItems: {
        create: [
          { productId: createdProducts[6].id, quantity: 1, price: 5.99 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      userId: user5.id,
      total: 19.96,
      status: 'completed',
      orderItems: {
        create: [
          { productId: createdProducts[9].id, quantity: 5, price: 3.99 },
        ],
      },
    },
  });

  // Seed Coupons
  await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      validFrom: new Date('2024-12-31'),
      validTo: new Date('2025-12-30'),
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'SAVE5',
      type: 'fixed',
      value: 5.0,
      validFrom: new Date('2023-12-31'),
      validTo: new Date('2024-06-29'),
      isActive: false,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'SUMMER20',
      type: 'percentage',
      value: 20,
      validFrom: new Date('2024-05-31'),
      validTo: new Date('2024-12-30'),
      isActive: false,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'WINTER20',
      type: 'percentage',
      value: 10,
      validFrom: new Date('2025-11-19'),
      validTo: new Date('2025-12-05'),
      isActive: true,
    },
  });

  console.log(`✅ Seeded ${products.length} products successfully!`);
  console.log(`✅ Seeded 3 admins successfully!`);
  console.log(`✅ Seeded 5 users successfully!`);
  console.log(`✅ Seeded 5 orders successfully!`);
  console.log(`✅ Seeded 4 coupons successfully!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
