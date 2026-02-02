// src/types/index.ts

import { 
  ProductCategory, 
  ProductStatus, 
  OrderStatus, 
  PaymentMethod, 
  PaymentStatus 
} from '@prisma/client'

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  category: ProductCategory
  status: ProductStatus
  price: number
  image: string | null
  images: string[]
  weight: number | null
  isAvailable: boolean
  stock: number | null
  metaTitle: string | null
  metaDescription: string | null
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  price: number
  quantity: number
  subtotal: number
  createdAt: string
  product?: {
    id: string
    name: string
    slug: string
    category: ProductCategory
    image: string | null
  }
}

export interface Payment {
  id: string
  orderId: string
  method: PaymentMethod
  status: PaymentStatus
  amount: number
  phoneNumber: string | null
  operator: string | null
  transactionId: string | null
  transactionRef: string | null
  metadata: any
  failureReason: string | null
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  customerName: string
  customerEmail: string | null
  customerPhone: string
  subtotal: number
  deliveryFee: number
  total: number
  isDelivery: boolean
  deliveryAddress: string | null
  deliveryTime: string | null
  notes: string | null
  adminNotes: string | null
  createdAt: string
  updatedAt: string
  completedAt: string | null
  cancelledAt: string | null
  items: OrderItem[]
  payment: Payment | null
}

export interface Admin {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: 'ADMIN' | 'SUPER_ADMIN'
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
}

export interface CartItem {
  id: string
  name: string
  slug: string
  price: number
  quantity: number
  image: string | null
  category: string
  weight?: number | null
}

export interface CreateProductData {
  name: string
  description?: string | null
  category: ProductCategory
  status?: ProductStatus
  price: number
  image?: string | null
  images?: string[]
  weight?: number | null
  isAvailable?: boolean
  stock?: number | null
  metaTitle?: string | null
  metaDescription?: string | null
}

export interface UpdateProductData extends Partial<CreateProductData> {}
