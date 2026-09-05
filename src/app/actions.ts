"use server"

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { hashPassword, verifyPassword, setSession, clearSession, getCurrentUser } from '@/lib/auth'

// 0. Authentication Actions
export async function registerUser(data: {
  name: string
  email: string
  password: string
  role: 'CLIENT' | 'DESIGNER' | 'MAKER'
  printerName?: string
  bedSizeX?: number
  bedSizeY?: number
  bedSizeZ?: number
  materials?: string
  colors?: string
  location?: string
}) {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() }
    })
    if (existing) {
      return { success: false, error: 'Пользователь с таким email уже зарегистрирован' }
    }

    if (!data.password || data.password.length < 4) {
      return { success: false, error: 'Пароль должен содержать не менее 4 символов' }
    }

    const passwordHash = hashPassword(data.password)

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role: data.role,
        balance: 5000.0,
        ...(data.role === 'MAKER' ? {
          makerProfile: {
            create: {
              printerName: data.printerName || 'Bambu Lab P1S',
              bedSizeX: data.bedSizeX || 256,
              bedSizeY: data.bedSizeY || 256,
              bedSizeZ: data.bedSizeZ || 256,
              materials: data.materials || 'PLA,PETG,ABS',
              colors: data.colors || 'Черный,Белый,Оранжевый',
              location: data.location || 'Москва',
              rating: 5.0
            }
          }
        } : {})
      },
      include: {
        makerProfile: true
      }
    })

    await setSession(user.id)
    revalidatePath('/')
    revalidatePath('/dashboard')
    revalidatePath('/catalog')
    return { success: true, user }
  } catch (error: any) {
    console.error('Register error:', error)
    return { success: false, error: error.message || 'Ошибка регистрации' }
  }
}

export async function loginUser(data: {
  email: string
  password: string
}) {
  try {
    const email = data.email.toLowerCase().trim()
    const user = await prisma.user.findUnique({
      where: { email },
      include: { makerProfile: true }
    })

    if (!user) {
      return { success: false, error: 'Пользователь с таким email не найден' }
    }

    const isValid = user.passwordHash 
      ? verifyPassword(data.password, user.passwordHash) 
      : (data.password === '123456')
      
    if (!isValid) {
      return { success: false, error: 'Неверный пароль' }
    }

    await setSession(user.id)
    revalidatePath('/')
    revalidatePath('/dashboard')
    revalidatePath('/catalog')
    return { success: true, user }
  } catch (error: any) {
    console.error('Login error:', error)
    return { success: false, error: error.message || 'Ошибка входа' }
  }
}

export async function logoutUser() {
  await clearSession()
  revalidatePath('/')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function getAuthUser() {
  return getCurrentUser()
}

// 1. User Actions
export async function getUsers() {
  return prisma.user.findMany({
    include: {
      makerProfile: true
    }
  })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { makerProfile: true }
  })
}

export async function updateMakerProfile(
  userId: string,
  data: {
    printerName: string
    bedSizeX: number
    bedSizeY: number
    bedSizeZ: number
    materials: string
    colors: string
    location: string
  }
) {
  const result = await prisma.makerProfile.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
      rating: 5.0
    }
  })
  revalidatePath('/dashboard')
  return result
}

// 2. Model 3D Actions
export async function getModels() {
  return prisma.model3D.findMany({
    include: {
      designer: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function getModelById(id: string) {
  return prisma.model3D.findUnique({
    where: { id },
    include: { designer: true }
  })
}

export async function createModel3D(data: {
  title: string
  description: string
  filePath: string
  price: number // Авторская цена за модель
  royalty?: number
  tags: string
  sizeX: number
  sizeY: number
  sizeZ: number
  volume: number
  designerId: string
}) {
  const model = await prisma.model3D.create({
    data: {
      ...data,
      royalty: data.royalty ?? 15.0
    }
  })
  revalidatePath('/catalog')
  revalidatePath('/dashboard')
  return model
}

// 3. Quotation & Order Lifecycle Actions

// Client creates an order request (Заявка) - no funds frozen yet
export async function createOrderRequest(data: {
  clientId: string
  modelId: string
  material: string
  color: string
  infill: number
  layerHeight: number
  deliveryAddress: string
}) {
  const client = await prisma.user.findUnique({ where: { id: data.clientId } })
  if (!client) throw new Error('Пользователь не найден')

  const model = await prisma.model3D.findUnique({ where: { id: data.modelId } })
  if (!model) throw new Error('Модель не найдена')

  const order = await prisma.order.create({
    data: {
      clientId: data.clientId,
      modelId: data.modelId,
      material: data.material,
      color: data.color,
      infill: data.infill,
      layerHeight: data.layerHeight,
      modelPrice: model.price,
      makerPrice: 0.0,
      totalPrice: 0.0,
      escrowStatus: 'NONE',
      status: 'REQUEST',
      deliveryAddress: data.deliveryAddress
    }
  })

  revalidatePath('/dashboard')
  return order
}

// Maker submits a quotation offer for an open request
export async function submitMakerOffer(data: {
  orderId: string
  makerId: string
  price: number // Maker's proposed printing price
  estimatedDays: number
  comment?: string
}) {
  const order = await prisma.order.findUnique({
    where: { id: data.orderId }
  })
  if (!order) throw new Error('Заявка не найдена')
  if (order.status !== 'REQUEST') throw new Error('Заявка уже закрыта или принята другим мастером')

  // Check if maker already sent an offer
  const existingOffer = await prisma.orderOffer.findFirst({
    where: {
      orderId: data.orderId,
      makerId: data.makerId
    }
  })

  let offer
  if (existingOffer) {
    offer = await prisma.orderOffer.update({
      where: { id: existingOffer.id },
      data: {
        price: data.price,
        estimatedDays: data.estimatedDays,
        comment: data.comment,
        status: 'PENDING'
      }
    })
  } else {
    offer = await prisma.orderOffer.create({
      data: {
        orderId: data.orderId,
        makerId: data.makerId,
        price: data.price,
        estimatedDays: data.estimatedDays,
        comment: data.comment,
        status: 'PENDING'
      }
    })
  }

  revalidatePath('/dashboard')
  return offer
}

// Client reviews offers and accepts one (freezing funds in Escrow)
export async function acceptMakerOffer(offerId: string, clientId: string) {
  const offer = await prisma.orderOffer.findUnique({
    where: { id: offerId },
    include: {
      order: {
        include: { model: true }
      },
      maker: true
    }
  })

  if (!offer) throw new Error('Предложение не найдено')
  if (offer.order.status !== 'REQUEST') throw new Error('Заявка уже находится в работе')
  if (offer.order.clientId !== clientId) throw new Error('Вы не являетесь автором этой заявки')

  // Calculate grand total: Designer Model Price + Maker Printing Price + 5% Escrow Commission
  const subtotal = offer.order.modelPrice + offer.price
  const platformFee = Math.round(subtotal * 0.05)
  const grandTotal = subtotal + platformFee

  const result = await prisma.$transaction(async (tx) => {
    // Check client balance
    const client = await tx.user.findUnique({ where: { id: clientId } })
    if (!client) throw new Error('Клиент не найден')
    if (client.balance < grandTotal) {
      throw new Error(`Недостаточно средств. Требуется: ${grandTotal} ₽, доступно на балансе: ${Math.round(client.balance)} ₽`)
    }

    // Freeze client funds in Escrow
    await tx.user.update({
      where: { id: clientId },
      data: { balance: { decrement: grandTotal } }
    })

    // Mark winning offer as ACCEPTED, others as REJECTED
    await tx.orderOffer.update({
      where: { id: offerId },
      data: { status: 'ACCEPTED' }
    })
    await tx.orderOffer.updateMany({
      where: {
        orderId: offer.orderId,
        id: { not: offerId }
      },
      data: { status: 'REJECTED' }
    })

    // Update order status to PRINTING
    return tx.order.update({
      where: { id: offer.orderId },
      data: {
        makerId: offer.makerId,
        makerPrice: offer.price,
        totalPrice: grandTotal,
        escrowStatus: 'HELD',
        status: 'PRINTING'
      }
    })
  })

  revalidatePath('/dashboard')
  return result
}

// Maker uploads QC check details (photo, weight, track number) and marks as SHIPPED
export async function submitOrderQCCheck(data: {
  orderId: string
  weight: number
  qcPhoto: string
  trackingNumber: string
}) {
  const order = await prisma.order.findUnique({
    where: { id: data.orderId }
  })
  if (!order) throw new Error('Заказ не найден')
  if (order.status !== 'PRINTING') throw new Error('Заказ должен быть в статусе "В печати"')

  const updated = await prisma.order.update({
    where: { id: data.orderId },
    data: {
      weight: data.weight,
      qcPhoto: data.qcPhoto,
      trackingNumber: data.trackingNumber,
      status: 'SHIPPED'
    }
  })

  revalidatePath('/dashboard')
  return updated
}

// Client confirms receipt, releasing funds from Escrow: Designer gets modelPrice, Maker gets makerPrice
export async function confirmOrderDelivery(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      model: { include: { designer: true } },
      maker: true
    }
  })

  if (!order) throw new Error('Заказ не найден')
  if (order.status !== 'SHIPPED') throw new Error('Заказ еще не отправлен')
  if (order.escrowStatus !== 'HELD') throw new Error('Средства уже распределены')

  const result = await prisma.$transaction([
    // Update order to COMPLETED
    prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETED',
        escrowStatus: 'RELEASED'
      }
    }),
    // Payout to Maker
    prisma.user.update({
      where: { id: order.makerId! },
      data: { balance: { increment: order.makerPrice } }
    }),
    // Payout to Designer (Author's exact model price!)
    prisma.user.update({
      where: { id: order.model.designerId },
      data: { balance: { increment: order.modelPrice } }
    })
  ])

  revalidatePath('/dashboard')
  return result
}

// Client submits review
export async function submitOrderReview(data: {
  orderId: string
  rating: number
  comment: string
  makerId: string
}) {
  const review = await prisma.review.create({
    data
  })

  const makerReviews = await prisma.review.findMany({
    where: { makerId: data.makerId }
  })
  
  const avgRating = makerReviews.reduce((sum, r) => sum + r.rating, 0) / makerReviews.length

  await prisma.makerProfile.update({
    where: { userId: data.makerId },
    data: { rating: Math.round(avgRating * 100) / 100 }
  })

  revalidatePath('/dashboard')
  return review
}

export async function getOrders() {
  return prisma.order.findMany({
    include: {
      client: true,
      model: {
        include: { designer: true }
      },
      maker: {
        include: { makerProfile: true }
      },
      offers: {
        include: { maker: { include: { makerProfile: true } } },
        orderBy: { price: 'asc' }
      },
      review: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}
