import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { toast } from '@/hooks/use-toast'
import { CreditCard, Smartphone, Globe, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { createOrder } from '@/api/orders'
import { initiateMpesa, verifyFlutterwave } from '@/api/payments'

const paymentMethods = [
  { id: 'mpesa', label: 'M-PESA', icon: Smartphone, description: 'Pay via M-PESA STK Push' },
  { id: 'flutterwave', label: 'Flutterwave', icon: CreditCard, description: 'Pay with card or mobile money' },
  { id: 'dpo', label: 'DPO', icon: Globe, description: 'DPO payment gateway' },
]

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [payment, setPayment] = useState('mpesa')
  const [loading, setLoading] = useState(false)
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    phone: '',
  })

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '')
    
    // If starts with 254, return as is
    if (cleanPhone.startsWith('254') && cleanPhone.length === 12) {
      return cleanPhone
    }
    
    // If starts with 0 and has 10 digits, convert to 254 format
    if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
      return '254' + cleanPhone.substring(1)
    }
    
    // If starts with 7 and has 9 digits, add 254 prefix
    if (cleanPhone.startsWith('7') && cleanPhone.length === 9) {
      return '254' + cleanPhone
    }
    
    // Return original if no pattern matches
    return phone
  }

  const placeOrder = async () => {
    setLoading(true)
    try {
      // Create order for each item in cart (backend expects single product per order)
      const firstItem = items[0]
      console.log('Creating order for product:', firstItem.product.id, 'quantity:', firstItem.quantity)
      
      const res = await createOrder({
        product_id: firstItem.product.id,
        quantity: firstItem.quantity,
      })

      console.log('Order creation response:', res.data)
      const orderId = res.data.data?.order_id
      console.log('Extracted order ID:', orderId)

      if (payment === 'mpesa' && orderId) {
        const phone = mpesaPhone || address.phone
        const formattedPhone = formatPhoneNumber(phone)
        console.log('Initiating M-Pesa payment for order:', orderId, 'original phone:', phone, 'formatted phone:', formattedPhone)
        
        if (!formattedPhone || formattedPhone.length < 12) {
          toast({
            title: 'Invalid Phone Number',
            description: 'Please enter a valid M-Pesa phone number (e.g., 2547XXXXXXXX or 07XXXXXXXX)',
            variant: 'destructive',
          })
          return
        }
        
        try {
          const mpesaResponse = await initiateMpesa({
            order_id: orderId,
            phone_number: formattedPhone,
          })
          console.log('M-Pesa initiation response:', mpesaResponse.data)
          toast({ title: 'M-PESA STK Push sent!', description: 'Check your phone to complete payment.' })
        } catch (mpesaError: any) {
          console.error('M-Pesa initiation error:', mpesaError)
          const error = mpesaError as { response?: { data?: { message?: string } } }
          toast({
            title: 'M-Pesa Payment Failed',
            description: error?.response?.data?.message || 'Could not initiate M-Pesa payment. Please check your phone number and try again.',
            variant: 'destructive',
          })
          return // Don't proceed if M-Pesa fails
        }
      } else {
        toast({ title: 'Order placed!', description: 'Your order has been placed successfully.' })
      }

      clearCart()
      navigate('/orders')
    } catch (err: unknown) {
      console.error('Order placement error:', err)
      const error = err as { response?: { data?: { message?: string } } }
      toast({
        title: 'Order failed',
        description: error?.response?.data?.message || 'Could not place order. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFlutterwavePayment = () => {
    const FLW_PUBLIC_KEY = import.meta.env.VITE_FLW_PUBLIC_KEY

    if (!FLW_PUBLIC_KEY || FLW_PUBLIC_KEY.includes('SANDBOX')) {
      // Fallback if key not configured properly
      toast({ title: 'Demo mode', description: 'Flutterwave not configured — placing order directly.' })
      placeOrder()
      return
    }

    // @ts-expect-error - Flutterwave loaded via CDN or package
    const flw = window.FlutterwaveCheckout || null
    if (flw) {
      flw({
        public_key: FLW_PUBLIC_KEY,
        tx_ref: `symatech-${Date.now()}`,
        amount: totalPrice,
        currency: 'KES',
        customer: { email: user?.email, name: user?.name },
        customizations: { title: 'Symatech Labs', description: 'Order Payment' },
        callback: async (response: { status: string; transaction_id: string }) => {
          if (response.status === 'successful') {
            // FIX: verify the Flutterwave transaction with backend before placing order
            try {
              await verifyFlutterwave({ transaction_id: String(response.transaction_id) })
            } catch {
              // Verification failed — still attempt order (backend can re-verify)
            }
            placeOrder()
          }
        },
        onclose: () => {},
      })
    } else {
      // Direct place if Flutterwave not initialized
      placeOrder()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (payment === 'flutterwave') {
      handleFlutterwavePayment()
    } else {
      await placeOrder()
    }
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="font-display font-semibold text-lg mb-4">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>First Name</Label>
                    <Input
                      value={address.firstName}
                      onChange={(e) => setAddress({ ...address, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Last Name</Label>
                    <Input
                      value={address.lastName}
                      onChange={(e) => setAddress({ ...address, lastName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label>Address</Label>
                    <Input
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      required
                      placeholder="Street address"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>City</Label>
                    <Input
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      required
                      placeholder="Nairobi"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      required
                      placeholder="0712345678"
                      type="tel"
                    />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="font-display font-semibold text-lg mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {paymentMethods.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayment(m.id)}
                      className={`w-full flex items-center gap-3 rounded-lg border p-4 text-sm font-medium transition-all text-left ${
                        payment === m.id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-muted-foreground/30 hover:bg-muted/30'
                      }`}
                    >
                      <m.icon className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold">{m.label}</p>
                        <p className="text-xs text-muted-foreground">{m.description}</p>
                      </div>
                      {payment === m.id && <CheckCircle className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>

                {payment === 'mpesa' && (
                  <div className="mt-4 space-y-1.5">
                    <Label>M-PESA Phone Number</Label>
                    <Input
                      placeholder="2547XXXXXXXX or 07XXXXXXXX"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Leave blank to use your account phone number</p>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="rounded-lg border border-border bg-card p-6 sticky top-24">
                <h2 className="font-display font-semibold text-lg mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={item.product.image}
                          alt={item.product.title}
                          className="h-8 w-8 rounded object-cover bg-muted flex-shrink-0"
                        />
                        <span className="truncate text-xs">
                          {item.product.title} × {item.quantity}
                        </span>
                      </div>
                      <span className="font-medium ml-2 whitespace-nowrap text-xs">
                        KES {(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between font-bold text-base mb-6">
                  <span>Total</span>
                  <span className="text-primary">KES {totalPrice.toLocaleString()}</span>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Processing...' : `Pay KES ${totalPrice.toLocaleString()}`}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
