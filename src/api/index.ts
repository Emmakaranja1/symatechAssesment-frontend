   import { initiateMpesa, verifyFlutterwave } from '@/api'

export * from './auth'
export * from './products'
export * from './cart'
export * from './orders'
export * from './payments'
export * from './stock'

// Selective exports for admin to avoid conflicts
export {
  getRealtimeData,
  getDashboardStats,
  getHealthCheck,
  resetDatabase,
  type DashboardStatsParams,
  type RealtimeData,
  type DashboardStats,
  type HealthCheck
} from './admin'

// Selective exports to avoid conflicts
export { 
  getAllUsers,
  getUser,
  activateUser,
  deactivateUser,
  registerAdmin,
  type AdminUsersParams,
  type AdminUser,
  type AdminUserDetails,
  type UserStatusResponse,
  type RegisterAdminPayload
} from './admin-users'

export {
  getAdminProducts,
  getAdminProduct,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  type AdminProductsParams,
  type AdminProduct,
  type AdminProductDetails,
  type AdminProductsResponse
} from './admin-products'

export {
  getAdminOrders,
  getAdminOrder,
  updateAdminOrderStatus,
  exportAdminOrdersExcel,
  exportAdminOrdersPdf,
  type AdminOrdersParams,
  type AdminOrder,
  type AdminOrderDetails,
  type AdminOrdersResponse,
  type UpdateOrderStatusPayload
} from './admin-orders'

export {
  getAdminPayments,
  processRefund,
  type AdminPaymentsParams,
  type AdminPayment,
  type AdminPaymentsResponse,
  type ProcessRefundPayload,
  type RefundResponse
} from './admin-payments'

export {
  getUserRegistrationTrends,
  exportUserRegistrationTrendsExcel,
  exportUserRegistrationTrendsPdf,
  getActivityLog,
  exportActivityLogExcel,
  exportActivityLogPdf,
  getNormalUserActivity,
  type UserRegistrationTrendsParams,
  type UserRegistrationTrends,
  type ActivityLogParams,
  type ActivityLogEntry,
  type ActivityLogResponse,
  type NormalUserActivityResponse
} from './admin-reports'

export * from './users'
export * from './reports'
export * from './utils'
export { default as client } from './client'
