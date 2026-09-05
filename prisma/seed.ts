import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database with quotation model...')

  // Clean database
  await prisma.review.deleteMany()
  await prisma.orderOffer.deleteMany()
  await prisma.order.deleteMany()
  await prisma.model3D.deleteMany()
  await prisma.makerProfile.deleteMany()
  await prisma.user.deleteMany()

  // Create Users
  const client = await prisma.user.create({
    data: {
      name: 'Иван Иванов (Клиент)',
      email: 'client@example.com',
      role: 'CLIENT',
      balance: 10000.0,
    },
  })

  const designer = await prisma.user.create({
    data: {
      name: 'Алексей Смирнов (Дизайнер)',
      email: 'designer@example.com',
      role: 'DESIGNER',
      balance: 1200.0,
    },
  })

  const maker1 = await prisma.user.create({
    data: {
      name: 'Дмитрий Мейкер (Казань)',
      email: 'maker1@example.com',
      role: 'MAKER',
      balance: 3400.0,
      makerProfile: {
        create: {
          printerName: 'Creality Ender 3 V2',
          bedSizeX: 220.0,
          bedSizeY: 220.0,
          bedSizeZ: 250.0,
          materials: 'PLA,PETG,ABS',
          colors: 'Signal Orange,Stealth Black,Pure White',
          location: 'Казань',
          latitude: 55.7887,
          longitude: 49.1221,
          rating: 4.8,
        },
      },
    },
  })

  const maker2 = await prisma.user.create({
    data: {
      name: 'Сергей Печатник (Москва)',
      email: 'maker2@example.com',
      role: 'MAKER',
      balance: 5100.0,
      makerProfile: {
        create: {
          printerName: 'Bambu Lab X1-Carbon',
          bedSizeX: 256.0,
          bedSizeY: 256.0,
          bedSizeZ: 256.0,
          materials: 'PLA,PETG,ABS,TPU',
          colors: 'Signal Orange,Stealth Black,Titanium Gray,Prusian Blue',
          location: 'Москва',
          latitude: 55.7558,
          longitude: 37.6173,
          rating: 4.95,
        },
      },
    },
  })

  const maker3 = await prisma.user.create({
    data: {
      name: 'Владимир 3D (СПб)',
      email: 'maker3@example.com',
      role: 'MAKER',
      balance: 1800.0,
      makerProfile: {
        create: {
          printerName: 'Custom Voron 2.4',
          bedSizeX: 300.0,
          bedSizeY: 300.0,
          bedSizeZ: 300.0,
          materials: 'PLA,ABS',
          colors: 'Stealth Black,Crimson Red',
          location: 'Санкт-Петербург',
          latitude: 59.9343,
          longitude: 30.3351,
          rating: 4.7,
        },
      },
    },
  })

  // Create Model3Ds with explicit designer prices
  const model1 = await prisma.model3D.create({
    data: {
      title: 'Калибровочный куб XYZ 20мм',
      description: 'Классический калибровочный кубик размером 20x20x20 мм для проверки точности позиционирования осей X, Y, Z вашего принтера.',
      filePath: '/sample-models/xyz_calibration_cube.stl',
      price: 150.0, // Цена цифровой модели, установленная автором
      royalty: 10.0,
      tags: 'Калибровка,Тест,Utility',
      sizeX: 20.0,
      sizeY: 20.0,
      sizeZ: 20.0,
      volume: 8.0,
      designerId: designer.id,
    },
  })

  const model2 = await prisma.model3D.create({
    data: {
      title: '3DBenchy Тестовый Кораблик',
      description: 'Легендарная лодочка 3DBenchy — признанный стандарт тестирования нависаний, мостов и качества ретрактов.',
      filePath: '/sample-models/3dbenchy.stl',
      price: 350.0, // Цена цифровой модели, установленная автором
      royalty: 15.0,
      tags: 'Бенчмарк,Сувенир,Тест',
      sizeX: 60.0,
      sizeY: 31.0,
      sizeZ: 48.0,
      volume: 15.5,
      designerId: designer.id,
    },
  })

  const model3 = await prisma.model3D.create({
    data: {
      title: 'Эргономичная подставка под ноутбук',
      description: 'Прочная подставка из двух модулей. Повышает уровень экрана до линии глаз и улучшает пассивное охлаждение.',
      filePath: '/sample-models/laptop_stand.stl',
      price: 600.0, // Цена цифровой модели, установленная автором
      royalty: 20.0,
      tags: 'Офис,Подставка,Ноутбук',
      sizeX: 220.0,
      sizeY: 30.0,
      sizeZ: 110.0,
      volume: 48.0,
      designerId: designer.id,
    },
  })

  // 1. Create a Completed Order for history demonstration
  await prisma.order.create({
    data: {
      clientId: client.id,
      modelId: model1.id,
      material: 'PLA',
      color: 'Signal Orange',
      infill: 20,
      layerHeight: 0.2,
      modelPrice: 150.0,
      makerPrice: 350.0,
      totalPrice: 525.0,
      escrowStatus: 'RELEASED',
      status: 'COMPLETED',
      deliveryAddress: 'Москва, ул. Арбат, д. 10',
      makerId: maker2.id,
      weight: 8.5,
      qcPhoto: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      trackingNumber: 'RU987654321CN',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      review: {
        create: {
          rating: 5,
          comment: 'Отличная печать, четкие грани и точный размер!',
          makerId: maker2.id,
        }
      }
    }
  })

  // 2. Create an Open Request with Bids from Makers for live testing
  const openOrder = await prisma.order.create({
    data: {
      clientId: client.id,
      modelId: model2.id,
      material: 'PETG',
      color: 'Stealth Black',
      infill: 40,
      layerHeight: 0.2,
      modelPrice: 350.0,
      makerPrice: 0.0,
      totalPrice: 0.0,
      escrowStatus: 'NONE',
      status: 'REQUEST',
      deliveryAddress: 'Москва, ул. Тверская, д. 5',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    }
  })

  // Add 2 initial bids from maker1 and maker2 for this open request
  await prisma.orderOffer.create({
    data: {
      orderId: openOrder.id,
      makerId: maker1.id,
      price: 450.0,
      estimatedDays: 2,
      comment: 'Напечатаю из прочного PETG Bestfilament, сопло 0.4',
      status: 'PENDING',
    }
  })

  await prisma.orderOffer.create({
    data: {
      orderId: openOrder.id,
      makerId: maker2.id,
      price: 550.0,
      estimatedDays: 1,
      comment: 'Готов сделать за 1 день на Bambu Lab X1-Carbon, идеальное качество',
      status: 'PENDING',
    }
  })

  console.log('Database re-seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
