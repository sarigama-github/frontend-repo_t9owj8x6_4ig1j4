import React, { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import RestaurantCard from './components/RestaurantCard'
import Menu from './components/Menu'

function App() {
  const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [restaurants, setRestaurants] = useState([])
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [menu, setMenu] = useState([])

  const [cartOpen, setCartOpen] = useState(false)
  const [cart, setCart] = useState([])
  const [placing, setPlacing] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(null)

  const subtotal = useMemo(() => cart.reduce((sum, it) => sum + it.price * it.qty, 0), [cart])
  const delivery_fee = 30
  const total = useMemo(() => subtotal + (cart.length > 0 ? delivery_fee : 0), [subtotal])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        let r = await fetch(`${API_BASE}/api/restaurants`)
        if (!r.ok) throw new Error('Failed to load restaurants')
        let data = await r.json()
        if (!data || data.length === 0) {
          // seed
          const s = await fetch(`${API_BASE}/api/seed`, { method: 'POST' })
          if (s.ok) {
            r = await fetch(`${API_BASE}/api/restaurants`)
            data = await r.json()
          }
        }
        setRestaurants(data)
      } catch (e) {
        setError(e.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const openRestaurant = async (r) => {
    setSelectedRestaurant(r)
    setMenu([])
    try {
      const res = await fetch(`${API_BASE}/api/restaurants/${r._id}/menu`)
      const data = await res.json()
      setMenu(data)
    } catch (e) {
      // ignore
    }
  }

  const addToCart = (item) => {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p._id === item._id)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 }
        return copy
      }
      return [...prev, { ...item, qty: 1 }]
    })
  }

  const decQty = (id) => {
    setCart((prev) => prev.flatMap((p) => (p._id === id ? (p.qty > 1 ? [{ ...p, qty: p.qty - 1 }] : []) : [p])))
  }

  const incQty = (id) => {
    setCart((prev) => prev.map((p) => (p._id === id ? { ...p, qty: p.qty + 1 } : p)))
  }

  const clearCart = () => setCart([])

  const placeOrder = async () => {
    if (!selectedRestaurant || cart.length === 0) return
    setPlacing(true)
    setOrderSuccess(null)
    try {
      const payload = {
        restaurant_id: selectedRestaurant._id,
        items: cart.map((c) => ({ item_id: c._id, name: c.name, qty: c.qty, price: c.price })),
        subtotal: Number(subtotal.toFixed(2)),
        delivery_fee,
        total: Number(total.toFixed(2)),
        customer_name: 'Guest',
        address: 'Demo Address',
      }
      const res = await fetch(`${API_BASE}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Failed to place order')
      const data = await res.json()
      setOrderSuccess(data.order_id)
      clearCart()
    } catch (e) {
      setError(e.message || 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50">
      <Header cartCount={cart.reduce((a, b) => a + b.qty, 0)} onViewCart={() => setCartOpen(true)} />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700">{error}</div>
        )}

        {!selectedRestaurant && (
          <section>
            <div className="flex items-end justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Top restaurants near you</h2>
                <p className="text-slate-600 text-sm">Powered by a simple backend and seeded demo data</p>
              </div>
              <a href="/test" className="text-sm text-slate-600 hover:text-slate-900 underline">Check backend</a>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-56 rounded-2xl bg-white border border-slate-200 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((r) => (
                  <RestaurantCard key={r._id} restaurant={r} onClick={() => openRestaurant(r)} />
                ))}
              </div>
            )}
          </section>
        )}

        {selectedRestaurant && (
          <section>
            <button onClick={() => setSelectedRestaurant(null)} className="text-sm text-slate-600 hover:text-slate-900 underline">← Back to restaurants</button>
            <div className="mt-2 flex items-start gap-6">
              <div className="flex-1">
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
                  <div className="relative h-48 overflow-hidden">
                    <img src={selectedRestaurant.image_url} alt={selectedRestaurant.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                  <div className="p-4">
                    <h2 className="text-2xl font-bold">{selectedRestaurant.name}</h2>
                    <p className="text-slate-600 text-sm">{selectedRestaurant.cuisine} • {selectedRestaurant.delivery_time} mins • ★ {selectedRestaurant.rating}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Menu</h3>
                  <Menu items={menu} onAdd={addToCart} />
                </div>
              </div>

              <aside className="w-full max-w-sm sticky top-24 hidden lg:block">
                <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                  <h3 className="font-semibold mb-2">Your Cart</h3>
                  {cart.length === 0 ? (
                    <p className="text-sm text-slate-500">Add some tasty items</p>
                  ) : (
                    <div className="space-y-3">
                      {cart.map((c) => (
                        <div key={c._id} className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">{c.name}</p>
                            <p className="text-xs text-slate-500">₹{c.price}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => decQty(c._id)} className="px-2 py-1 border rounded">-</button>
                            <span className="w-6 text-center">{c.qty}</span>
                            <button onClick={() => incQty(c._id)} className="px-2 py-1 border rounded">+</button>
                          </div>
                        </div>
                      ))}
                      <div className="pt-3 border-t">
                        <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between text-sm"><span>Delivery</span><span>₹{cart.length > 0 ? delivery_fee.toFixed(2) : '0.00'}</span></div>
                        <div className="flex justify-between font-semibold mt-1"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
                        <button disabled={placing} onClick={placeOrder} className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition">{placing ? 'Placing...' : 'Place Order'}</button>
                        {orderSuccess && <p className="text-green-600 text-xs mt-2">Order placed! ID: {orderSuccess}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </section>
        )}
      </main>

      {cartOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={() => setCartOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Your Cart</h3>
              <button onClick={() => setCartOpen(false)} className="text-slate-500">✕</button>
            </div>
            {cart.length === 0 ? (
              <p className="text-sm text-slate-500">Cart is empty</p>
            ) : (
              <div className="space-y-3">
                {cart.map((c) => (
                  <div key={c._id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-slate-500">₹{c.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => decQty(c._id)} className="px-2 py-1 border rounded">-</button>
                      <span className="w-6 text-center">{c.qty}</span>
                      <button onClick={() => incQty(c._id)} className="px-2 py-1 border rounded">+</button>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t">
                  <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm"><span>Delivery</span><span>₹{cart.length > 0 ? delivery_fee.toFixed(2) : '0.00'}</span></div>
                  <div className="flex justify-between font-semibold mt-1"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
                  <button disabled={placing} onClick={placeOrder} className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition">{placing ? 'Placing...' : 'Place Order'}</button>
                  {orderSuccess && <p className="text-green-600 text-xs mt-2">Order placed! ID: {orderSuccess}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
