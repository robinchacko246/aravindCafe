import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

function OrderHistoryPage () {
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    if (!isAuthenticated) {
      router.push('/')
      return
    }

    fetchOrders()
  }, [router])

  async function fetchOrders () {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
    } else {
      setOrders(data || [])
    }
    setIsLoading(false)
  }

  function handleLogout () {
    localStorage.removeItem('isAuthenticated')
    router.push('/')
  }

  function formatDate (dateString) {
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function calculateOrderSummary (items) {
    const subtotal = items.reduce((total, item) => {
      return total + (item.price * item.quantity)
    }, 0)

    const gstTotal = items.reduce((total, item) => {
      const itemTotal = item.price * item.quantity
      const gstAmount = (itemTotal * (item.gst_percentage || 0)) / 100
      return total + gstAmount
    }, 0)

    return { subtotal, gstTotal, grandTotal: subtotal + gstTotal }
  }

  function handleViewDetails (order) {
    setSelectedOrder(order)
  }

  function handleCloseDetails () {
    setSelectedOrder(null)
  }

  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      order.order_number.toLowerCase().includes(searchLower) ||
      order.customer_name?.toLowerCase().includes(searchLower) ||
      order.customer_phone?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div>
      <header className="header">
        <div className="header-content">
          <h1>☕ Aravind Cafe - Order History</h1>
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
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <h2 className="card-title" style={{ marginBottom: 0 }}>All Orders</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by order number, name, or phone"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ minWidth: '300px', marginBottom: 0 }}
              />
              <button
                onClick={fetchOrders}
                className="btn btn-primary"
                style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}
              >
                Refresh
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
              <p>{searchTerm ? 'No orders found matching your search.' : 'No orders yet.'}</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order No.</th>
                    <th>Customer Name</th>
                    <th>Phone</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                    <th>Date & Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: '600', color: '#3498db' }}>{order.order_number}</td>
                      <td>{order.customer_name || '-'}</td>
                      <td>{order.customer_phone || '-'}</td>
                      <td>{order.items?.length || 0} item(s)</td>
                      <td style={{ fontWeight: '600', color: '#27ae60' }}>
                        ₹{parseFloat(order.total_amount).toFixed(2)}
                      </td>
                      <td>{formatDate(order.created_at)}</td>
                      <td>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => handleViewDetails(order)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredOrders.length > 0 && (
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ecf0f1', borderRadius: '4px' }}>
              <strong>Total Orders: </strong>{filteredOrders.length}
              <span style={{ marginLeft: '20px' }}>
                <strong>Total Revenue: </strong>
                ₹{filteredOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #ecf0f1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              backgroundColor: 'white',
              zIndex: 1
            }}>
              <h2 style={{ margin: 0, color: '#2c3e50' }}>Order Details</h2>
              <button
                onClick={handleCloseDetails}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#7f8c8d'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <strong style={{ color: '#7f8c8d', fontSize: '12px' }}>ORDER NUMBER</strong>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#3498db' }}>
                      {selectedOrder.order_number}
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: '#7f8c8d', fontSize: '12px' }}>DATE & TIME</strong>
                    <div style={{ fontSize: '14px' }}>{formatDate(selectedOrder.created_at)}</div>
                  </div>
                  <div>
                    <strong style={{ color: '#7f8c8d', fontSize: '12px' }}>CUSTOMER NAME</strong>
                    <div style={{ fontSize: '14px' }}>{selectedOrder.customer_name || '-'}</div>
                  </div>
                  <div>
                    <strong style={{ color: '#7f8c8d', fontSize: '12px' }}>PHONE NUMBER</strong>
                    <div style={{ fontSize: '14px' }}>{selectedOrder.customer_phone || '-'}</div>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #ecf0f1', paddingTop: '20px', marginTop: '20px' }}>
                <strong style={{ fontSize: '16px', marginBottom: '15px', display: 'block' }}>Order Items</strong>
                {selectedOrder.items && selectedOrder.items.map((item, index) => {
                  const itemTotal = item.price * item.quantity
                  const gstAmount = (itemTotal * (item.gst_percentage || 0)) / 100
                  return (
                    <div
                      key={index}
                      style={{
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        marginBottom: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.name}</div>
                          <div style={{ fontSize: '13px', color: '#7f8c8d' }}>
                            ₹{parseFloat(item.price).toFixed(2)} × {item.quantity}
                            {item.gst_percentage > 0 && (
                              <span style={{ marginLeft: '8px' }}>
                                (GST: {parseFloat(item.gst_percentage)}%)
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: '600' }}>₹{itemTotal.toFixed(2)}</div>
                          {gstAmount > 0 && (
                            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                              +₹{gstAmount.toFixed(2)} GST
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ borderTop: '2px solid #2c3e50', paddingTop: '15px', marginTop: '20px' }}>
                {(() => {
                  const summary = calculateOrderSummary(selectedOrder.items || [])
                  return (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#7f8c8d' }}>Subtotal:</span>
                        <span style={{ fontWeight: '500' }}>₹{summary.subtotal.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: '#7f8c8d' }}>GST:</span>
                        <span style={{ fontWeight: '500' }}>₹{summary.gstTotal.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '700' }}>
                        <span>Grand Total:</span>
                        <span style={{ color: '#27ae60' }}>₹{parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
                      </div>
                    </>
                  )
                })()}
              </div>

              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={handleCloseDetails}
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderHistoryPage

