// types/index.ts

// ✅ Utiliser des enums au lieu de types
export type ProductCategory = 'BOULANGERIE' | 'VIENNOISERIE' | 'PATISSERIE'
export type ProductStatus = 'AVAILABLE' | 'OUT_OF_STOCK' | 'ARCHIVED' 

export type OrderStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED'


export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export type PaymentMethod = 'CASH' | 'MOBILE_MONEY' | 'CARD'

// Types pour les produits
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

// Types pour les commandes
export interface OrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  quantity: number
  price: number
  subtotal: number
  product?: Product
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  orderId: string
  method: PaymentMethod
  status: PaymentStatus
  amount: number
  transactionId: string | null
  transactionRef: string | null
  provider: string | null
  phoneNumber: string | null
  operator: string | null
  paymentUrl: string | null
  metadata: any
  completedAt: string | null
  failureReason: string | null
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail: string | null
  status: OrderStatus
  subtotal: number
  deliveryFee: number
  total: number
  isDelivery: boolean
  deliveryAddress: string | null
  deliveryTime: string | null
  notes: string | null
  adminNotes: string | null
  completedAt: string | null
  cancelledAt: string | null
  items: OrderItem[]
  payment: Payment | null
  createdAt: string
  updatedAt: string
}

// Types pour les réponses API
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Types pour les formulaires
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

export interface CreateOrderData {
  customerName: string
  customerPhone: string
  customerEmail?: string
  items: {
    productId: string
    quantity: number
  }[]
  isDelivery: boolean
  deliveryAddress?: string
  deliveryTime?: string
  notes?: string
  paymentMethod: PaymentMethod
  phoneNumber?: string
  operator?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  admin: {
    id: string
    email: string
    name: string
  }
}

// Types pour le panier (store Zustand)
export interface CartItem {
  id: string
  name: string
  slug: string
  price: number
  quantity: number
  image: string | null
  category: ProductCategory
  weight: number | null
}

export interface CartStore {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}