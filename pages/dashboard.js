import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

function DashboardPage () {
  const router = useRouter()
  const [menuItems, setMenuItems] = useState([])
  const [cart, setCart] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: ''
  })

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    if (!isAuthenticated) {
      router.push('/')
      return
    }

    fetchMenuItems()
  }, [router])

  async function fetchMenuItems () {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .order('name')

    if (error) {
      console.error('Error fetching menu items:', error)
      setMessage({ type: 'error', text: 'Failed to load menu items' })
    } else {
      setMenuItems(data || [])
    }
    setIsLoading(false)
  }

  function handleAddToCart (item) {
    const existingItem = cart.find(cartItem => cartItem.id === item.id)

    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  function isItemInCart (itemId) {
    return cart.some(cartItem => cartItem.id === itemId)
  }

  function getItemQuantityInCart (itemId) {
    const item = cart.find(cartItem => cartItem.id === itemId)
    return item ? item.quantity : 0
  }

  function handleUpdateQuantity (itemId, delta) {
    setCart(cart.map(cartItem => {
      if (cartItem.id !== itemId) return cartItem

      const newQuantity = cartItem.quantity + delta

      if (newQuantity <= 0) return null

      return { ...cartItem, quantity: newQuantity }
    }).filter(Boolean))
  }

  function handleRemoveFromCart (itemId) {
    setCart(cart.filter(cartItem => cartItem.id !== itemId))
  }

  function calculateSubtotal () {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  function calculateTotalGST () {
    return cart.reduce((total, item) => {
      const itemTotal = item.price * item.quantity
      const gstAmount = (itemTotal * (item.gst_percentage || 0)) / 100
      return total + gstAmount
    }, 0)
  }

  function calculateGrandTotal () {
    return calculateSubtotal() + calculateTotalGST()
  }

  function handleCustomerInfoChange (e) {
    const { name, value } = e.target
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }))
  }

  async function handlePaid () {
    if (cart.length === 0) {
      setMessage({ type: 'error', text: 'Cart is empty' })
      return
    }

    if (!customerInfo.name.trim()) {
      setMessage({ type: 'error', text: 'Please enter customer name' })
      return
    }

    setIsSaving(true)
    setMessage({ type: '', text: '' })

    const orderNumber = `ORD-${Date.now()}`
    const orderData = {
      order_number: orderNumber,
      customer_name: customerInfo.name.trim(),
      customer_phone: customerInfo.phone.trim(),
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        gst_percentage: item.gst_percentage || 0,
        quantity: item.quantity
      })),
      total_amount: calculateGrandTotal(),
      status: 'paid'
    }

    const { error } = await supabase
      .from('orders')
      .insert([orderData])

    if (error) {
      console.error('Error saving order:', error)
      setMessage({ type: 'error', text: 'Failed to save order' })
    } else {
      setMessage({ type: 'success', text: `Order ${orderNumber} saved successfully!` })
      setCart([])
      setCustomerInfo({ name: '', phone: '' })
    }

    setIsSaving(false)
  }

  function handleLogout () {
    localStorage.removeItem('isAuthenticated')
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div>
      <header className="header">
        <div className="header-content">
          <h1>☕ Aravind Cafe - Take Orders</h1>
          <nav className="nav">
            <a href="/dashboard" className="nav-link">Orders</a>
            <a href="/add-items" className="nav-link">Manage Items</a>
            <a href="/order-history" className="nav-link">Order History</a>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
              Logout
            </button>
          </nav>
        </div>
      </header>

      <div className="container">
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="card">
              <h2 className="card-title">Menu Items</h2>
              {menuItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
                  <p>No menu items available.</p>
                  <p>Please add items from the <a href="/add-items" style={{ color: '#3498db' }}>Manage Items</a> page.</p>
                </div>
              ) : (
                <div className="menu-grid">
                  {menuItems.map(item => {
                    const isSelected = isItemInCart(item.id)
                    const quantity = getItemQuantityInCart(item.id)
                    return (
                      <div
                        key={item.id}
                        className={`menu-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleAddToCart(item)}
                        style={{
                          backgroundColor: isSelected ? '#e8f8f5' : 'white',
                          borderColor: isSelected ? '#27ae60' : '#bdc3c7',
                          position: 'relative'
                        }}
                      >
                        {isSelected && (
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            backgroundColor: '#27ae60',
                            color: 'white',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {quantity}
                          </div>
                        )}
                        <div className="menu-item-name">{item.name}</div>
                        <div className="menu-item-price">₹{parseFloat(item.price).toFixed(2)}</div>
                        {item.category && (
                          <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '4px' }}>
                            {item.category}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <div className="cart">
              <h2 className="card-title">Current Order</h2>
              
              <div style={{ marginBottom: '20px' }}>
                <div className="form-group">
                  <label htmlFor="customerName" className="form-label">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    name="name"
                    className="form-input"
                    value={customerInfo.name}
                    onChange={handleCustomerInfoChange}
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="customerPhone" className="form-label">
                    Customer Phone
                  </label>
                  <input
                    type="tel"
                    id="customerPhone"
                    name="phone"
                    className="form-input"
                    value={customerInfo.phone}
                    onChange={handleCustomerInfoChange}
                    placeholder="Enter phone number (optional)"
                  />
                </div>
              </div>

              {cart.length === 0 ? (
                <div className="empty-cart">
                  <p>No items in cart</p>
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>Click on menu items to add</p>
                </div>
              ) : (
                <>
                  <div className="cart-items">
                    {cart.map(item => (
                      <div key={item.id} className="cart-item">
                        <div className="cart-item-info">
                          <div className="cart-item-name">{item.name}</div>
                          <div className="cart-item-price">
                            ₹{parseFloat(item.price).toFixed(2)} each
                            {item.gst_percentage > 0 && (
                              <span style={{ fontSize: '11px', color: '#7f8c8d', marginLeft: '4px' }}>
                                (GST: {parseFloat(item.gst_percentage)}%)
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="cart-item-quantity">
                          <button
                            className="quantity-btn"
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                          >
                            -
                          </button>
                          <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '600' }}>
                            {item.quantity}
                          </span>
                          <button
                            className="quantity-btn"
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => handleRemoveFromCart(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid #ecf0f1', paddingTop: '15px', marginTop: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#7f8c8d' }}>Subtotal:</span>
                      <span style={{ fontWeight: '500' }}>₹{calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#7f8c8d' }}>GST:</span>
                      <span style={{ fontWeight: '500' }}>₹{calculateTotalGST().toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="cart-total">
                    <span>Grand Total:</span>
                    <span style={{ color: '#27ae60' }}>₹{calculateGrandTotal().toFixed(2)}</span>
                  </div>

                  <button
                    className="btn btn-success"
                    style={{ width: '100%', fontSize: '16px', padding: '16px' }}
                    onClick={handlePaid}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Processing...' : '✓ Mark as Paid'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage

