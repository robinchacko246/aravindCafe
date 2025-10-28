import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

function AddItemsPage () {
  const router = useRouter()
  const [menuItems, setMenuItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [editingItemId, setEditingItemId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    gst_percentage: '',
    category: '',
    available: true
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
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching menu items:', error)
      setMessage({ type: 'error', text: 'Failed to load menu items' })
    } else {
      setMenuItems(data || [])
    }
    setIsLoading(false)
  }

  function handleChange (e) {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  async function handleSubmit (e) {
    e.preventDefault()
    
    if (!formData.name || !formData.price) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' })
      return
    }

    if (parseFloat(formData.price) <= 0) {
      setMessage({ type: 'error', text: 'Price must be greater than 0' })
      return
    }

    const gstValue = formData.gst_percentage === '' ? 0 : parseFloat(formData.gst_percentage)
    if (gstValue < 0 || gstValue > 100) {
      setMessage({ type: 'error', text: 'GST must be between 0 and 100' })
      return
    }

    setIsSaving(true)
    setMessage({ type: '', text: '' })

    const itemData = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      gst_percentage: gstValue,
      category: formData.category.trim() || null,
      available: formData.available
    }

    let error

    if (editingItemId) {
      // Update existing item
      const result = await supabase
        .from('menu_items')
        .update(itemData)
        .eq('id', editingItemId)
      error = result.error
    } else {
      // Insert new item
      const result = await supabase
        .from('menu_items')
        .insert([itemData])
      error = result.error
    }

    if (error) {
      console.error('Error saving item:', error)
      setMessage({ type: 'error', text: `Failed to ${editingItemId ? 'update' : 'add'} item` })
    } else {
      setMessage({ type: 'success', text: `Item ${editingItemId ? 'updated' : 'added'} successfully!` })
      setFormData({
        name: '',
        price: '',
        gst_percentage: '',
        category: '',
        available: true
      })
      setEditingItemId(null)
      fetchMenuItems()
    }

    setIsSaving(false)
  }

  function handleEditItem (item) {
    setEditingItemId(item.id)
    setFormData({
      name: item.name,
      price: item.price.toString(),
      gst_percentage: item.gst_percentage ? item.gst_percentage.toString() : '0',
      category: item.category || '',
      available: item.available
    })
    setMessage({ type: '', text: '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancelEdit () {
    setEditingItemId(null)
    setFormData({
      name: '',
      price: '',
      gst_percentage: '',
      category: '',
      available: true
    })
    setMessage({ type: '', text: '' })
  }

  async function handleToggleAvailability (itemId, currentStatus) {
    const { error } = await supabase
      .from('menu_items')
      .update({ available: !currentStatus })
      .eq('id', itemId)

    if (error) {
      console.error('Error updating item:', error)
      setMessage({ type: 'error', text: 'Failed to update item' })
    } else {
      fetchMenuItems()
    }
  }

  async function handleDeleteItem (itemId) {
    if (!confirm('Are you sure you want to delete this item?')) {
      return
    }

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', itemId)

    if (error) {
      console.error('Error deleting item:', error)
      setMessage({ type: 'error', text: 'Failed to delete item' })
    } else {
      setMessage({ type: 'success', text: 'Item deleted successfully!' })
      fetchMenuItems()
    }
  }

  function handleLogout () {
    localStorage.removeItem('isAuthenticated')
    router.push('/')
  }

  return (
    <div>
      <header className="header">
        <div className="header-content">
          <h1>☕ Aravind Cafe - Manage Items</h1>
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

        <div className="grid grid-2">
          <div>
            <div className="card">
              <h2 className="card-title">{editingItemId ? 'Edit Item' : 'Add New Item'}</h2>
              {editingItemId && (
                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffc107' }}>
                  <span style={{ fontWeight: '500' }}>Editing mode</span>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="btn btn-secondary"
                    style={{ padding: '4px 12px', fontSize: '12px', marginLeft: '10px' }}
                  >
                    Cancel
                  </button>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Tea, Coffee, Sandwich"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="price" className="form-label">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    className="form-input"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g., 20"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="gst_percentage" className="form-label">
                    GST (%)
                  </label>
                  <input
                    type="number"
                    id="gst_percentage"
                    name="gst_percentage"
                    className="form-input"
                    value={formData.gst_percentage}
                    onChange={handleChange}
                    placeholder="e.g., 5, 12, 18"
                    step="0.01"
                    min="0"
                    max="100"
                  />
                  <small style={{ color: '#7f8c8d', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Enter GST percentage (leave blank for 0%)
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="category" className="form-label">
                    Category (Optional)
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    className="form-input"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g., Beverages, Snacks"
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="available"
                      checked={formData.available}
                      onChange={handleChange}
                      style={{ width: 'auto', cursor: 'pointer' }}
                    />
                    <span className="form-label" style={{ marginBottom: 0 }}>Available</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? (editingItemId ? 'Updating...' : 'Adding...') : (editingItemId ? 'Update Item' : 'Add Item')}
                </button>
              </form>
            </div>
          </div>

          <div>
            <div className="card">
              <h2 className="card-title">Menu Items</h2>
              {isLoading ? (
                <div className="loading">
                  <div className="spinner"></div>
                </div>
              ) : menuItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
                  <p>No items added yet.</p>
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>Add your first menu item using the form.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Price</th>
                        <th>GST %</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuItems.map(item => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: '500' }}>{item.name}</td>
                          <td>₹{parseFloat(item.price).toFixed(2)}</td>
                          <td>{item.gst_percentage ? `${parseFloat(item.gst_percentage)}%` : '0%'}</td>
                          <td>{item.category || '-'}</td>
                          <td>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500',
                              backgroundColor: item.available ? '#d4edda' : '#f8d7da',
                              color: item.available ? '#155724' : '#721c24'
                            }}>
                              {item.available ? 'Available' : 'Unavailable'}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button
                                className="btn btn-primary"
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                onClick={() => handleEditItem(item)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                onClick={() => handleToggleAvailability(item.id, item.available)}
                              >
                                {item.available ? 'Disable' : 'Enable'}
                              </button>
                              <button
                                className="btn btn-danger"
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddItemsPage

