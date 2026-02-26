import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { AddProductModal } from '@/components/admin/AddProductModal'
import { EditProductModal } from '@/components/admin/EditProductModal'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { OrderDetailModal } from '@/components/admin/OrderDetailModal'
import { toast } from '@/hooks/use-toast'
import { getAdminProducts, deleteProduct } from '@/api/products'
import { getAllOrders, exportOrdersExcel, exportOrdersPdf, downloadFile } from '@/api/orders'
import { getAllUsers, activateUser, deactivateUser } from '@/api/users'
import {
  getDashboardStats, getUserRegistrationTrends, getActivityLog,
  getNormalUserActivity, exportUserTrendsExcel, exportUserTrendsPdf,
  exportActivityLogExcel, exportActivityLogPdf,
  exportNormalUserActivityExcel, exportNormalUserActivityPdf,
} from '@/api/reports'
import { products as mockProducts, users as mockUsers } from '@/lib/mock-data'
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
  Activity, Plus, Edit, Trash2, ToggleLeft, ToggleRight,
  Download, Search, Eye, LogOut, TrendingUp, TrendingDown,
  RefreshCw, AlertCircle, CheckCircle, Clock, XCircle,
  ChevronLeft, ChevronRight, FileSpreadsheet, FileText,
  Menu, X, ArrowUpRight, Zap,
} from 'lucide-react'


interface AdminProduct {
  id: number
  name: string
  title?: string
  sku?: string
  category?: string
  price: number | string
  costPrice?: string
  stock: number
  description?: string
  active?: boolean
  status?: string
  images?: string[]
  image?: string
  rating?: number
}

interface AdminOrder {
  id: number | string
  user?: { name?: string; email?: string } | string
  status: string
  total?: number
  payment_status?: string
  created_at?: string
  date?: string
  items?: unknown[]
  products?: unknown[]
}

interface AdminUser {
  id: number
  name: string
  email: string
  role: string
  status: boolean | string
  active?: boolean
  joined?: string
  created_at?: string
}

type TabId = 'overview' | 'products' | 'orders' | 'users' | 'reports' | 'activity'

const statusColor: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  processing: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
  cancelled: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
  unpaid: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
}

const parsePrice = (price: number | string): number => {
  if (typeof price === 'number') return price
  const cleaned = String(price).replace(/[^0-9.]/g, '')
  return parseFloat(cleaned) || 0
}

const getProductName = (p: AdminProduct) => p.name || p.title || 'Unnamed Product'
const getProductImage = (p: AdminProduct) => p.images?.[0] || p.image || ''
const getUserName = (order: AdminOrder): string => {
  if (typeof order.user === 'object' && order.user !== null) return order.user.name || 'Unknown'
  if (typeof order.user === 'string') return order.user
  return 'Unknown'
}
const getUserActive = (u: AdminUser): boolean => {
  if (typeof u.active === 'boolean') return u.active
  if (typeof u.status === 'boolean') return u.status
  return u.status === 'active' || u.status === 'true' || u.status === '1'
}
const getOrderDate = (o: AdminOrder): string => {
  const d = o.created_at || o.date || ''
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [products, setProducts] = useState<AdminProduct[]>([])
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [usersList, setUsersList] = useState<AdminUser[]>(
    mockUsers.map(u => ({ ...u, status: u.active ? 'active' : 'inactive' }))
  )
  const [dashboardStats, setDashboardStats] = useState<Record<string, unknown> | null>(null)
  const [registrationTrends, setRegistrationTrends] = useState<{ date: string; registrations: number }[]>([])
  const [activityLogs, setActivityLogs] = useState<unknown[]>([])
  const [normalActivity, setNormalActivity] = useState<unknown[]>([])
  const [addProductOpen, setAddProductOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [dataSource, setDataSource] = useState<'live' | 'mock'>('mock')

  const fetchAllData = useCallback(async () => {
    setRefreshing(true)
    let anyLive = false

    await Promise.allSettled([
      getAdminProducts().then(res => {
        const d = res.data?.data || res.data
        console.log('Admin products response:', res)
        console.log('Products data:', d)
        if (Array.isArray(d) && d.length) { 
          const formattedProducts = d.map((p: any) => ({
            ...p,
            name: p.name || p.title || 'Untitled Product',
            images: p.images || (p.image ? [p.image] : [])
          }))
          console.log('Formatted products:', formattedProducts)
          setProducts(formattedProducts); anyLive = true 
        }
      }),
      getAllOrders().then(res => {
        const d = res.data?.data || res.data
        const arr = Array.isArray(d) ? d : []
        if (Array.isArray(arr) && arr.length) { setOrders(arr); anyLive = true }
      }),
      getAllUsers().then(res => {
        const d = res.data?.data || res.data
        if (Array.isArray(d) && d.length) { setUsersList(d); anyLive = true }
      }),
      getDashboardStats().then(res => {
        if (res.data) { setDashboardStats(res.data); anyLive = true }
      }),
      getUserRegistrationTrends().then(res => {
        const d = res.data?.data || res.data
        if (Array.isArray(d)) setRegistrationTrends(d)
      }),
      getActivityLog({ per_page: 50 }).then(res => {
        const d = res.data?.activities?.data || res.data?.activities || res.data?.data || res.data
        if (Array.isArray(d)) setActivityLogs(d)
      }),
      getNormalUserActivity({ per_page: 50 }).then(res => {
        const d = res.data?.activities?.data || res.data?.activities || res.data?.data || res.data
        if (Array.isArray(d)) setNormalActivity(d)
      }),
    ])

    setDataSource(anyLive ? 'live' : 'mock')
    setRefreshing(false)
  }, [])

  useEffect(() => { fetchAllData() }, [fetchAllData])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const revenue = orders.reduce((s, o) => s + parsePrice(o.total || 0), 0)
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const activeUsersCount = usersList.filter(u => getUserActive(u)).length
  const avgOrderValue = orders.length > 0 ? revenue / orders.length : 0

  const stats = dashboardStats as Record<string, Record<string, number>> | null
  const totalUsers = stats?.user_stats?.total_users ?? usersList.length
  const totalActivities = stats?.activity_stats?.total_activities ?? activityLogs.length

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'activity', label: 'Activity', icon: Activity },
  ]

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── SIDEBAR ─── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-60 flex flex-col
        border-r border-border bg-card transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-sm leading-none">Symatech</p>
            <p className="text-xs text-muted-foreground mt-0.5">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 p-3 flex-1 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false) }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4 shrink-0" />
              {tab.label}
              {tab.id === 'orders' && pendingOrders > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {pendingOrders}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User info */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/50 mb-2">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">{user?.name?.[0]?.toUpperCase() || 'A'}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email || ''}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-md hover:bg-muted"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-bold text-base capitalize leading-none">
                {tabs.find(t => t.id === activeTab)?.label}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {dataSource === 'live' ? (
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live data
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-500">
                    <AlertCircle className="h-3 w-3" />
                    Showing demo data
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-44 h-8 text-sm"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={fetchAllData}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <OverviewTab
              products={products}
              orders={orders}
              usersList={usersList}
              revenue={revenue}
              pendingOrders={pendingOrders}
              activeUsersCount={activeUsersCount}
              avgOrderValue={avgOrderValue}
              totalUsers={totalUsers as number}
              totalActivities={totalActivities as number}
              registrationTrends={registrationTrends}
              activityLogs={activityLogs}
              onTabChange={setActiveTab}
              onAddProduct={() => setAddProductOpen(true)}
            />
          )}
          {activeTab === 'products' && (
            <ProductsTab
              search={searchQuery}
              products={products}
              onRefresh={fetchAllData}
              onAdd={() => setAddProductOpen(true)}
            />
          )}
          {activeTab === 'orders' && (
            <OrdersTab search={searchQuery} orders={orders} />
          )}
          {activeTab === 'users' && (
            <UsersTab search={searchQuery} users={usersList} onRefresh={fetchAllData} />
          )}
          {activeTab === 'reports' && (
            <ReportsTab
              orders={orders}
              registrationTrends={registrationTrends}
              onRefreshTrends={() => getUserRegistrationTrends().then(res => {
                const d = res.data?.data
                if (Array.isArray(d)) setRegistrationTrends(d)
              })}
            />
          )}
          {activeTab === 'activity' && (
            <ActivityTab
              activityLogs={activityLogs}
              normalActivity={normalActivity}
              search={searchQuery}
              onRefresh={fetchAllData}
            />
          )}
        </main>
      </div>

      <AddProductModal
        open={addProductOpen}
        onOpenChange={setAddProductOpen}
        onSuccess={fetchAllData}
      />
    </div>
  )
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────

function OverviewTab({
  products, orders, usersList, revenue, pendingOrders,
  activeUsersCount, avgOrderValue, totalUsers, totalActivities,
  registrationTrends, activityLogs, onTabChange, onAddProduct,
}: {
  products: AdminProduct[]
  orders: AdminOrder[]
  usersList: AdminUser[]
  revenue: number
  pendingOrders: number
  activeUsersCount: number
  avgOrderValue: number
  totalUsers: number
  totalActivities: number
  registrationTrends: { date: string; registrations: number }[]
  activityLogs: unknown[]
  onTabChange: (tab: TabId) => void
  onAddProduct: () => void
}) {
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered').length
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length
  const inactiveUsers = totalUsers - activeUsersCount

  const statCards = [
    {
      label: 'Total Revenue', value: `KES ${revenue.toLocaleString()}`,
      sub: `Avg KES ${Math.round(avgOrderValue).toLocaleString()} / order`,
      icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: 'Total Orders', value: orders.length,
      sub: `${pendingOrders} pending`,
      icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Total Users', value: totalUsers,
      sub: `${activeUsersCount} active`,
      icon: Users, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20',
    },
    {
      label: 'Products', value: products.length,
      sub: `${products.filter(p => (p.stock ?? 0) < 10).length} low stock`,
      icon: Package, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      label: 'Active Users', value: activeUsersCount,
      sub: `${inactiveUsers} inactive`,
      icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: 'Pending Orders', value: pendingOrders,
      sub: `${Math.round((pendingOrders / Math.max(orders.length, 1)) * 100)}% of total`,
      icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      label: 'Avg Order Value', value: `KES ${Math.round(avgOrderValue).toLocaleString()}`,
      sub: 'per transaction',
      icon: ArrowUpRight, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Activities', value: totalActivities,
      sub: 'total logged',
      icon: Activity, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20',
    },
  ]

  // Mini bar chart helper
  const maxReg = Math.max(...registrationTrends.map(d => d.registrations), 1)

  return (
    <div className="p-5 space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
              <div className={`h-7 w-7 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
              </div>
            </div>
            <p className="font-bold text-xl tracking-tight leading-none mb-1">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Registration Trends */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">User Registration Trends</h3>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>
            <button
              onClick={() => onTabChange('reports')}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Full report <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          {registrationTrends.length > 0 ? (
            <div className="flex items-end gap-0.5 h-32">
              {registrationTrends.slice(-30).map((d, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end group relative">
                  <div
                    className="bg-primary/20 hover:bg-primary rounded-t transition-all cursor-default"
                    style={{ height: `${Math.max((d.registrations / maxReg) * 100, 4)}%` }}
                  />
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-foreground text-background text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap z-10">
                    {d.date}: {d.registrations}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
              No trend data available
            </div>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Order Status Distribution</h3>
              <p className="text-xs text-muted-foreground">{orders.length} total orders</p>
            </div>
            <button
              onClick={() => onTabChange('orders')}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          {orders.length > 0 ? (
            <div className="space-y-3">
              {[
                { label: 'Completed/Delivered', count: completedOrders, color: 'bg-emerald-500' },
                { label: 'Pending', count: pendingOrders, color: 'bg-amber-500' },
                { label: 'Processing', count: orders.filter(o => o.status === 'processing').length, color: 'bg-blue-500' },
                { label: 'Cancelled', count: cancelledOrders, color: 'bg-red-500' },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium">{row.count}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${row.color} rounded-full transition-all duration-500`}
                      style={{ width: `${(row.count / Math.max(orders.length, 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
              No order data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Recent Activity</h3>
            <button
              onClick={() => onTabChange('activity')}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          {(activityLogs as Record<string, unknown>[]).slice(0, 6).length > 0 ? (
            <div className="space-y-2.5">
              {(activityLogs as Record<string, unknown>[]).slice(0, 6).map((log, i) => {
                const causer = (log.causer as Record<string, string>) || {}
                const desc = String(log.description || log.event || 'Activity')
                const ts = String(log.created_at || log.updated_at || '')
                return (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-primary">
                        {causer.name?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{causer.name || 'System'}</p>
                      <p className="text-xs text-muted-foreground capitalize truncate">{desc}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No activity data yet</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold text-sm mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'Add New Product', icon: Plus, action: onAddProduct, color: 'text-primary' },
              { label: 'View All Orders', icon: ShoppingCart, action: () => onTabChange('orders'), color: 'text-blue-600' },
              { label: 'Manage Users', icon: Users, action: () => onTabChange('users'), color: 'text-violet-600' },
              { label: 'Generate Reports', icon: BarChart3, action: () => onTabChange('reports'), color: 'text-amber-600' },
              { label: 'Activity Logs', icon: Activity, action: () => onTabChange('activity'), color: 'text-emerald-600' },
            ].map(action => (
              <button
                key={action.label}
                onClick={action.action}
                className="flex w-full items-center gap-3 rounded-lg p-2.5 text-sm hover:bg-muted transition-colors text-left"
              >
                <action.icon className={`h-4 w-4 ${action.color}`} />
                {action.label}
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── PRODUCTS TAB ─────────────────────────────────────────────────────────────

function ProductsTab({ search, products, onRefresh, onAdd }: {
  search: string
  products: AdminProduct[]
  onRefresh: () => void
  onAdd: () => void
}) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null)
  const [editTarget, setEditTarget] = useState<AdminProduct | null>(null)

  const filtered = products.filter((p: AdminProduct) =>
    getProductName(p).toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  )

  const lowStock = products.filter(p => (p.stock ?? 0) < 10 && (p.stock ?? 0) > 0).length
  const outOfStock = products.filter(p => (p.stock ?? 0) === 0).length

  return (
    <div className="p-5 space-y-4">
      {/* Mini stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Products', value: products.length, color: 'text-foreground' },
          { label: 'Active', value: products.filter(p => p.active !== false).length, color: 'text-emerald-600' },
          { label: 'Low Stock', value: lowStock, color: 'text-amber-600' },
          { label: 'Out of Stock', value: outOfStock, color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`font-bold text-lg ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{filtered.length} products</p>
        <Button size="sm" className="gap-1.5" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" /> Add Product
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[300px]">Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No products found
                </TableCell>
              </TableRow>
            ) : filtered.map((p) => (
              <TableRow key={p.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg overflow-hidden bg-muted shrink-0">
                      {getProductImage(p) ? (
                        <img src={getProductImage(p)} alt={getProductName(p)} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate max-w-[180px]">{getProductName(p)}</p>
                      {p.sku && <p className="text-[10px] text-muted-foreground">{p.sku}</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.category || '—'}</TableCell>
                <TableCell className="text-sm font-medium">
                  KES {parsePrice(p.price).toLocaleString()}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border ${
                    (p.stock ?? 0) === 0
                      ? 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800'
                      : (p.stock ?? 0) < 10
                      ? 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800'
                      : 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800'
                  }`}>
                    {(p.stock ?? 0) === 0 ? 'Out of Stock' : `${p.stock} units`}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`text-xs font-medium ${p.active !== false ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                    {p.active !== false ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7"
                      onClick={() => setEditTarget(p)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget({ id: p.id, title: getProductName(p) })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditProductModal
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        product={editTarget}
        onSuccess={() => {
          setEditTarget(null)
          onRefresh()
        }}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Product"
        description={`Are you sure you want to permanently delete "${deleteTarget?.title}"?`}
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            await deleteProduct(deleteTarget.id)
            toast({ title: 'Product deleted', description: `${deleteTarget.title} removed.` })
            onRefresh()
          } catch {
            toast({ title: 'Delete failed', variant: 'destructive' })
          }
          setDeleteTarget(null)
        }}
        destructive
      />
    </div>
  )
}

// ─── ORDERS TAB ───────────────────────────────────────────────────────────────

function OrdersTab({ search, orders }: { search: string; orders: AdminOrder[] }) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [exportLoading, setExportLoading] = useState<'excel' | 'pdf' | null>(null)
  const perPage = 10

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      String(o.id).toLowerCase().includes(search.toLowerCase()) ||
      getUserName(o).toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const pages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  const handleExport = async (type: 'excel' | 'pdf') => {
    setExportLoading(type)
    try {
      const res = type === 'excel' ? await exportOrdersExcel() : await exportOrdersPdf()
      downloadFile(res, `symatech-orders.${type === 'excel' ? 'xlsx' : 'pdf'}`)
      toast({ title: `Orders exported as ${type.toUpperCase()}` })
    } catch {
      toast({ title: 'Export failed', variant: 'destructive' })
    } finally {
      setExportLoading(null)
    }
  }

  const statuses = ['all', 'pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled']
  const statusCounts = statuses.reduce((acc, s) => ({
    ...acc,
    [s]: s === 'all' ? orders.length : orders.filter(o => o.status === s).length
  }), {} as Record<string, number>)

  return (
    <div className="p-5 space-y-4">
      {/* Mini stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Pending', value: statusCounts['pending'] || 0, icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Completed', value: (statusCounts['completed'] || 0) + (statusCounts['delivered'] || 0), icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Cancelled', value: statusCounts['cancelled'] || 0, icon: XCircle, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-3 flex items-center gap-3">
            <div className={`h-8 w-8 rounded-lg ${s.color.split(' ').slice(1).join(' ')} flex items-center justify-center shrink-0`}>
              <s.icon className={`h-4 w-4 ${s.color.split(' ')[0]}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="font-bold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap gap-1.5">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setCurrentPage(1) }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              {statusCounts[s] > 0 && (
                <span className="ml-1 opacity-70">({statusCounts[s]})</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7"
            onClick={() => handleExport('excel')} disabled={exportLoading === 'excel'}>
            <FileSpreadsheet className="h-3 w-3" />
            {exportLoading === 'excel' ? 'Exporting...' : 'Excel'}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7"
            onClick={() => handleExport('pdf')} disabled={exportLoading === 'pdf'}>
            <FileText className="h-3 w-3" />
            {exportLoading === 'pdf' ? 'Exporting...' : 'PDF'}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="w-[60px]">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            ) : paginated.map((o) => (
              <TableRow key={o.id} className="hover:bg-muted/30">
                <TableCell className="font-mono text-xs">#{String(o.id).padStart(4, '0')}</TableCell>
                <TableCell className="text-sm font-medium">{getUserName(o)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{getOrderDate(o)}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${statusColor[o.status] || ''}`}>
                    {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  {o.payment_status && (
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${statusColor[o.payment_status] || 'text-muted-foreground border-border'}`}>
                      {o.payment_status.charAt(0).toUpperCase() + o.payment_status.slice(1)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm font-semibold">
                  KES {parsePrice(o.total || 0).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7"
                    onClick={() => setSelectedOrder(o)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground text-xs">
            Showing {((currentPage - 1) * perPage) + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7"
              disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
              <Button
                key={p}
                variant={currentPage === p ? 'default' : 'outline'}
                size="icon" className="h-7 w-7 text-xs"
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </Button>
            ))}
            <Button variant="outline" size="icon" className="h-7 w-7"
              disabled={currentPage === pages} onClick={() => setCurrentPage(p => p + 1)}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      <OrderDetailModal
        order={selectedOrder as never}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      />
    </div>
  )
}

// ─── USERS TAB ────────────────────────────────────────────────────────────────

function UsersTab({ search, users, onRefresh }: {
  search: string
  users: AdminUser[]
  onRefresh: () => void
}) {
  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )
  const [toggleTarget, setToggleTarget] = useState<{ id: number; name: string; active: boolean } | null>(null)
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 15

  const roleFiltered = filtered.filter(u =>
    roleFilter === 'all' || u.role === roleFilter
  )
  const pages = Math.ceil(roleFiltered.length / perPage)
  const paginated = roleFiltered.slice((currentPage - 1) * perPage, currentPage * perPage)

  const adminCount = users.filter(u => u.role === 'admin').length
  const activeCount = users.filter(u => getUserActive(u)).length

  return (
    <div className="p-5 space-y-4">
      {/* Mini stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: users.length },
          { label: 'Active', value: activeCount },
          { label: 'Inactive', value: users.length - activeCount },
          { label: 'Admins', value: adminCount },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="font-bold text-lg">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-1.5">
        {['all', 'admin', 'user'].map(r => (
          <button
            key={r}
            onClick={() => { setRoleFilter(r); setCurrentPage(1) }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              roleFilter === r
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {r === 'all' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Toggle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : paginated.map((u) => {
              const isActive = getUserActive(u)
              return (
                <TableRow key={u.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">{u.name[0]?.toUpperCase()}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'admin' ? 'default' : 'outline'} className="capitalize text-xs">
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {u.created_at
                      ? new Date(u.created_at).toLocaleDateString()
                      : u.joined || '—'}
                  </TableCell>
                  <TableCell>
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${isActive ? 'text-emerald-600' : 'text-red-500'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-400'}`} />
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7"
                      onClick={() => setToggleTarget({ id: u.id, name: u.name, active: isActive })}
                    >
                      {isActive
                        ? <ToggleRight className="h-5 w-5 text-emerald-600" />
                        : <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                      }
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-xs text-muted-foreground">
            Showing {((currentPage - 1) * perPage) + 1}–{Math.min(currentPage * perPage, roleFiltered.length)} of {roleFiltered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7"
              disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
              <Button key={p} variant={currentPage === p ? 'default' : 'outline'}
                size="icon" className="h-7 w-7 text-xs" onClick={() => setCurrentPage(p)}>
                {p}
              </Button>
            ))}
            <Button variant="outline" size="icon" className="h-7 w-7"
              disabled={currentPage === pages} onClick={() => setCurrentPage(p => p + 1)}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!toggleTarget}
        onOpenChange={(open) => !open && setToggleTarget(null)}
        title={toggleTarget?.active ? 'Deactivate User' : 'Activate User'}
        description={`Are you sure you want to ${toggleTarget?.active ? 'deactivate' : 'activate'} ${toggleTarget?.name}?`}
        onConfirm={async () => {
          if (!toggleTarget) return
          try {
            if (toggleTarget.active) {
              await deactivateUser(toggleTarget.id)
            } else {
              await activateUser(toggleTarget.id)
            }
            toast({ title: toggleTarget.active ? 'User deactivated' : 'User activated' })
            onRefresh()
          } catch {
            toast({ title: 'Action failed', variant: 'destructive' })
          }
          setToggleTarget(null)
        }}
        destructive={toggleTarget?.active}
      />
    </div>
  )
}

// ─── REPORTS TAB ──────────────────────────────────────────────────────────────

function ReportsTab({ orders, registrationTrends, onRefreshTrends }: {
  orders: AdminOrder[]
  registrationTrends: { date: string; registrations: number }[]
  onRefreshTrends: () => void
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const [groupBy, setGroupBy] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  const revenue = orders.reduce((s, o) => s + parsePrice(o.total || 0), 0)
  const completedOrders = orders.filter(o => ['completed', 'delivered'].includes(o.status)).length
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length

  const maxReg = Math.max(...registrationTrends.map(d => d.registrations), 1)
  const totalRegs = registrationTrends.reduce((s, d) => s + d.registrations, 0)
  const avgRegs = registrationTrends.length > 0 ? (totalRegs / registrationTrends.length).toFixed(1) : '0'
  const peakDay = registrationTrends.find(d => d.registrations === maxReg)

  const handleExport = async (type: string, format: 'excel' | 'pdf') => {
    const key = `${type}-${format}`
    setLoading(key)
    const params = dateRange.start ? { start_date: dateRange.start, end_date: dateRange.end, group_by: groupBy } : { group_by: groupBy }
    try {
      let res
      if (type === 'orders') {
        res = format === 'excel' ? await exportOrdersExcel() : await exportOrdersPdf()
        downloadFile(res, `orders.${format === 'excel' ? 'xlsx' : 'pdf'}`)
      } else if (type === 'trends') {
        res = format === 'excel' ? await exportUserTrendsExcel(params) : await exportUserTrendsPdf(params)
        downloadFile(res, `user-trends.${format === 'excel' ? 'xlsx' : 'pdf'}`)
      } else if (type === 'activity') {
        res = format === 'excel' ? await exportActivityLogExcel(params) : await exportActivityLogPdf(params)
        downloadFile(res, `activity-log.${format === 'excel' ? 'xlsx' : 'pdf'}`)
      } else if (type === 'normal-activity') {
        res = format === 'excel' ? await exportNormalUserActivityExcel(params) : await exportNormalUserActivityPdf(params)
        downloadFile(res, `user-activity.${format === 'excel' ? 'xlsx' : 'pdf'}`)
      }
      toast({ title: `Report exported successfully` })
    } catch {
      toast({ title: 'Export failed — backend may be unavailable', variant: 'destructive' })
    } finally {
      setLoading(null)
    }
  }

  const ExportBtn = ({ type, format, label }: { type: string; format: 'excel' | 'pdf'; label: string }) => {
    const key = `${type}-${format}`
    const Icon = format === 'excel' ? FileSpreadsheet : FileText
    return (
      <Button
        variant="outline" size="sm"
        className="gap-1.5 text-xs h-8"
        onClick={() => handleExport(type, format)}
        disabled={loading === key}
      >
        <Icon className="h-3 w-3" />
        {loading === key ? 'Exporting...' : label}
      </Button>
    )
  }

  return (
    <div className="p-5 space-y-5">
      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Revenue', value: `KES ${revenue.toLocaleString()}` },
          { label: 'Total Orders', value: orders.length },
          { label: 'Registrations', value: totalRegs },
          { label: 'Avg/Day', value: avgRegs },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="font-bold text-lg">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-semibold text-sm mb-3">Report Filters</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Group By</label>
            <div className="flex gap-1">
              {(['daily', 'weekly', 'monthly'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setGroupBy(g)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    groupBy === g ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={e => setDateRange(d => ({ ...d, start: e.target.value }))}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange(d => ({ ...d, end: e.target.value }))}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={onRefreshTrends}>
            <RefreshCw className="h-3 w-3 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Registration Trends Chart */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">User Registration Trends</h3>
              <div className="flex gap-4 mt-1">
                <span className="text-xs text-muted-foreground">Total: <strong>{totalRegs}</strong></span>
                <span className="text-xs text-muted-foreground">Avg: <strong>{avgRegs}/day</strong></span>
                {peakDay && <span className="text-xs text-muted-foreground">Peak: <strong>{peakDay.date} ({maxReg})</strong></span>}
              </div>
            </div>
            <div className="flex gap-1.5">
              <ExportBtn type="trends" format="excel" label="Excel" />
              <ExportBtn type="trends" format="pdf" label="PDF" />
            </div>
          </div>
          {registrationTrends.length > 0 ? (
            <>
              <div className="flex items-end gap-0.5 h-36">
                {registrationTrends.slice(-30).map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end group relative">
                    <div
                      className="bg-primary/30 hover:bg-primary rounded-t-sm transition-all cursor-default"
                      style={{ height: `${Math.max((d.registrations / maxReg) * 100, 3)}%` }}
                    />
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-foreground text-background text-[9px] rounded px-1 py-0.5 whitespace-nowrap z-10">
                      {d.date}: {d.registrations}
                    </div>
                  </div>
                ))}
              </div>
              {/* Data table */}
              <div className="mt-4 max-h-48 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-1.5 text-muted-foreground font-medium">Date</th>
                      <th className="text-right py-1.5 text-muted-foreground font-medium">Registrations</th>
                      <th className="text-right py-1.5 text-muted-foreground font-medium">Cumulative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrationTrends.map((d, i) => {
                      const cumulative = registrationTrends.slice(0, i + 1).reduce((s, r) => s + r.registrations, 0)
                      return (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-1.5">{d.date}</td>
                          <td className="text-right py-1.5 font-medium">{d.registrations}</td>
                          <td className="text-right py-1.5 text-muted-foreground">{cumulative}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="h-36 flex items-center justify-center text-muted-foreground text-sm">
              No registration data available
            </div>
          )}
        </div>

        {/* Order Analytics */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Order Analytics</h3>
              <p className="text-xs text-muted-foreground">{orders.length} total orders</p>
            </div>
            <div className="flex gap-1.5">
              <ExportBtn type="orders" format="excel" label="Excel" />
              <ExportBtn type="orders" format="pdf" label="PDF" />
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Completed / Delivered', count: completedOrders, pct: orders.length ? (completedOrders / orders.length * 100).toFixed(0) : 0, color: 'bg-emerald-500' },
              { label: 'Pending', count: pendingOrders, pct: orders.length ? (pendingOrders / orders.length * 100).toFixed(0) : 0, color: 'bg-amber-500' },
              { label: 'Processing', count: orders.filter(o => o.status === 'processing').length, pct: orders.length ? (orders.filter(o => o.status === 'processing').length / orders.length * 100).toFixed(0) : 0, color: 'bg-blue-500' },
              { label: 'Cancelled', count: cancelledOrders, pct: orders.length ? (cancelledOrders / orders.length * 100).toFixed(0) : 0, color: 'bg-red-500' },
            ].map(row => (
              <div key={row.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium">{row.count} <span className="text-muted-foreground">({row.pct}%)</span></span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${row.color} rounded-full`} style={{ width: `${row.pct}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-border">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Revenue</span>
                <span className="font-bold">KES {revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-muted-foreground">Avg Order Value</span>
                <span className="font-medium">KES {orders.length > 0 ? Math.round(revenue / orders.length).toLocaleString() : 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { title: 'Orders Report', desc: 'All order data with status and revenue', type: 'orders', icon: ShoppingCart },
          { title: 'Registration Trends', desc: 'User signup trends over time', type: 'trends', icon: TrendingUp },
          { title: 'Full Activity Log', desc: 'All user activities and events', type: 'activity', icon: Activity },
          { title: 'User Activity', desc: 'Normal user activity only (no admin)', type: 'normal-activity', icon: Users },
        ].map(card => (
          <div key={card.type} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <card.icon className="h-4 w-4 text-primary" />
              <h4 className="font-medium text-sm">{card.title}</h4>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{card.desc}</p>
            <div className="flex gap-2">
              <ExportBtn type={card.type} format="excel" label="Excel" />
              <ExportBtn type={card.type} format="pdf" label="PDF" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── ACTIVITY TAB ─────────────────────────────────────────────────────────────

function ActivityTab({ activityLogs, normalActivity, search, onRefresh }: {
  activityLogs: unknown[]
  normalActivity: unknown[]
  search: string
  onRefresh: () => void
}) {
  const [view, setView] = useState<'all' | 'normal'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [exportLoading, setExportLoading] = useState<string | null>(null)
  const perPage = 15

  const rawLogs = (view === 'all' ? activityLogs : normalActivity) as Record<string, unknown>[]
  const filtered = rawLogs.filter(log => {
    if (!search) return true
    const causer = (log.causer as Record<string, string>) || {}
    const desc = String(log.description || log.event || '')
    return (
      (causer.name || '').toLowerCase().includes(search.toLowerCase()) ||
      desc.toLowerCase().includes(search.toLowerCase())
    )
  })

  const pages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  const handleExport = async (format: 'excel' | 'pdf') => {
    const key = `${view}-${format}`
    setExportLoading(key)
    try {
      let res
      if (view === 'all') {
        res = format === 'excel' ? await exportActivityLogExcel() : await exportActivityLogPdf()
        downloadFile(res, `activity-log.${format === 'excel' ? 'xlsx' : 'pdf'}`)
      } else {
        res = format === 'excel' ? await exportNormalUserActivityExcel() : await exportNormalUserActivityPdf()
        downloadFile(res, `user-activity.${format === 'excel' ? 'xlsx' : 'pdf'}`)
      }
      toast({ title: 'Activity log exported' })
    } catch {
      toast({ title: 'Export failed', variant: 'destructive' })
    } finally {
      setExportLoading(null)
    }
  }

  // Top activities summary
  const activityCounts: Record<string, number> = {}
  rawLogs.forEach(log => {
    const desc = String(log.description || log.event || 'Other')
    activityCounts[desc] = (activityCounts[desc] || 0) + 1
  })
  const topActivities = Object.entries(activityCounts).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const maxCount = topActivities[0]?.[1] || 1

  return (
    <div className="p-5 space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Activities', value: activityLogs.length },
          { label: 'User Activities', value: normalActivity.length },
          { label: 'Unique Types', value: Object.keys(activityCounts).length },
          { label: 'Top Activity', value: topActivities[0]?.[0]?.slice(0, 12) || '—' },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="font-bold text-sm truncate">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Top activities bar */}
      {topActivities.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold text-sm mb-4">Activity Breakdown</h3>
          <div className="space-y-2.5">
            {topActivities.map(([activity, count]) => (
              <div key={activity}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground capitalize truncate max-w-[70%]">{activity}</span>
                  <span className="font-medium">{count} <span className="text-muted-foreground">({Math.round(count / rawLogs.length * 100)}%)</span></span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/60 rounded-full transition-all duration-500"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex gap-1.5">
          {[
            { key: 'all', label: `All Activities (${activityLogs.length})` },
            { key: 'normal', label: `User Activities (${normalActivity.length})` },
          ].map(v => (
            <button
              key={v.key}
              onClick={() => { setView(v.key as 'all' | 'normal'); setCurrentPage(1) }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                view === v.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={onRefresh}>
            <RefreshCw className="h-3 w-3" /> Refresh
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7"
            onClick={() => handleExport('excel')} disabled={exportLoading !== null}>
            <FileSpreadsheet className="h-3 w-3" />
            {exportLoading?.includes('excel') ? 'Exporting...' : 'Excel'}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7"
            onClick={() => handleExport('pdf')} disabled={exportLoading !== null}>
            <FileText className="h-3 w-3" />
            {exportLoading?.includes('pdf') ? 'Exporting...' : 'PDF'}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Subject</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  {rawLogs.length === 0 ? 'No activity data — backend may be loading' : 'No results for this search'}
                </TableCell>
              </TableRow>
            ) : paginated.map((log, i) => {
              const causer = (log.causer as Record<string, string>) || {}
              const desc = String(log.description || log.event || 'Activity')
              const subject = String(log.subject_type || log.log_name || '—').split('\\').pop() || '—'
              const ts = String(log.created_at || log.updated_at || '')
              const idx = ((currentPage - 1) * perPage) + i + 1
              return (
                <TableRow key={i} className="hover:bg-muted/30">
                  <TableCell className="text-xs text-muted-foreground font-mono">{String(idx).padStart(3, '0')}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {ts ? new Date(ts).toLocaleString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-primary">{causer.name?.[0]?.toUpperCase() || '?'}</span>
                      </div>
                      <span className="text-xs font-medium">{causer.name || 'System'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs capitalize bg-muted px-2 py-0.5 rounded-full">{desc}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground capitalize">{subject}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {((currentPage - 1) * perPage) + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7"
              disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
              <Button key={p} variant={currentPage === p ? 'default' : 'outline'}
                size="icon" className="h-7 w-7 text-xs" onClick={() => setCurrentPage(p)}>
                {p}
              </Button>
            ))}
            <Button variant="outline" size="icon" className="h-7 w-7"
              disabled={currentPage === pages} onClick={() => setCurrentPage(p => p + 1)}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
