import React, { useEffect, useState } from 'react';
import { adminProductsApi } from '../../services/adminApi';
import { products as fallbackProducts } from '../../data/products';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock_quantity: 10,
  is_available: true,
  is_featured: false,
  image: '',
  category_id: '',
  category_name: '',
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const mockProducts = fallbackProducts.map(p => ({
  id: p.id,
  name: p.title || p.name,
  category: { name: 'Uncategorized' },
  price: typeof p.price === 'string' ? parseFloat(p.price.replace(/,/g, '')) : p.price,
  stock_quantity: p.stock_quantity ?? 10,
  is_available: p.is_available !== false,
  is_featured: false,
  image: p.image
}));

const Products = () => {
  const [products, setProducts] = useState(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await adminProductsApi.getAll();
      if (data && data.length > 0) {
        setProducts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await adminProductsApi.getCategories();
      setCategories(data);
    } catch (e) {
      console.error(e);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock_quantity: product.stock_quantity ?? 0,
      is_available: Boolean(product.is_available),
      is_featured: Boolean(product.is_featured),
      image: product.image || '',
      category_id: product.category_id || '',
      category_name: '',
    });
    setShowModal(true);
  };

  const handleToggle = async (id, field, newValue) => {
    // Local interactivity fallback
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: newValue } : p));
    try {
      await adminProductsApi.update(id, { [field]: newValue });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      // Local interactivity fallback
      setProducts(prev => prev.filter(p => p.id !== id));
      try {
        await adminProductsApi.delete(id);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const image = await fileToDataUrl(file);
    setFormData((current) => ({ ...current, image }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      category_id: formData.category_name ? null : formData.category_id || null,
      category: { name: formData.category_name || categories.find(c => c.id == formData.category_id)?.name || 'Uncategorized' }
    };
    
    // Local state update for interactivity
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...payload } : p));
    } else {
      setProducts(prev => [...prev, { ...payload, id: Date.now() }]);
    }
    setShowModal(false);
    setFormData(emptyForm);

    try {
      if (editingProduct) {
        await adminProductsApi.update(editingProduct.id, payload);
      } else {
        await adminProductsApi.create(payload);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div>Loading products...</div>;

  return (
    <div style={{ padding: '24px 32px', backgroundColor: '#fcfcfc', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: 'var(--text-dark)', fontSize: '28px', fontWeight: '600', margin: '0 0 20px 0' }}>Products</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#888' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 16px 10px 36px', borderRadius: '8px', border: '1px solid #eee', outline: 'none' }} 
            />
          </div>
          <select style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #eee', outline: 'none', backgroundColor: '#fff', color: 'var(--text-dark)' }}>
            <option>All Categories</option>
          </select>
          <select style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #eee', outline: 'none', backgroundColor: '#fff', color: 'var(--text-dark)' }}>
            <option>All Status</option>
          </select>
          <select style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #eee', outline: 'none', backgroundColor: '#fff', color: 'var(--text-dark)' }}>
            <option>All Stock Status</option>
          </select>
          <button onClick={openCreateModal} className="view-btn" style={{ padding: '10px 20px', backgroundColor: 'var(--deep-pink)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            + Add New Product
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: 'var(--shadow)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '860px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee', color: '#888', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '16px 20px', fontWeight: '600' }}>PRODUCT</th>
              <th style={{ padding: '16px 20px', fontWeight: '600' }}>PRICE</th>
              <th style={{ padding: '16px 20px', fontWeight: '600' }}>STOCK</th>
              <th style={{ padding: '16px 20px', fontWeight: '600', textAlign: 'center' }}>AVAILABILITY</th>
              <th style={{ padding: '16px 20px', fontWeight: '600', textAlign: 'center' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(product => (
              <tr key={product.id} style={{ borderBottom: '1px solid #f9f9f9', transition: 'background-color 0.2s' }}>
                <td style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {product.image ? <img src={product.image} alt={product.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#f5f5f5' }} /> : <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#f5f5f5' }} />}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: 'var(--text-dark)', fontWeight: '500', fontSize: '15px' }}>{product.name}</span>
                    <span style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>SKU: BB00{product.id}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 20px', color: '#555', fontSize: '14px' }}>₦{parseFloat(product.price).toLocaleString()}</td>
                <td style={{ padding: '16px 20px', color: '#555', fontSize: '14px' }}>
                  {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                  <label style={{ display: 'inline-block', position: 'relative', width: '40px', height: '20px' }}>
                    <input type="checkbox" checked={Boolean(product.is_available)} onChange={() => handleToggle(product.id, 'is_available', !product.is_available)} style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: product.is_available ? 'var(--deep-pink)' : '#e0e0e0', borderRadius: '20px', transition: '.4s' }}></span>
                    <span style={{ position: 'absolute', height: '16px', width: '16px', left: product.is_available ? '22px' : '2px', bottom: '2px', backgroundColor: 'white', borderRadius: '50%', transition: '.4s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></span>
                  </label>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'center', whiteSpace: 'nowrap', fontSize: '14px' }}>
                  <button onClick={() => openEditModal(product)} className="view-btn" style={{ padding: '4px 12px', minHeight: '28px', fontSize: '12px', borderRadius: '6px', marginRight: '8px', boxShadow: 'none' }}>Edit</button>
                  <button onClick={() => handleDelete(product.id)} className="view-btn" style={{ padding: '4px 12px', minHeight: '28px', fontSize: '12px', borderRadius: '6px', backgroundColor: '#fff1f3', color: 'var(--deep-pink)', border: '1px solid var(--deep-pink)', boxShadow: 'none' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#888', fontSize: '14px', marginTop: '10px' }}>
        <span>Showing 1 to {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length} of {products.length} products</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ border: 'none', background: 'var(--deep-pink)', color: '#fff', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer' }}>1</button>
          <button style={{ border: 'none', background: 'transparent', color: '#555', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer' }}>2</button>
          <button style={{ border: 'none', background: 'transparent', color: '#555', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer' }}>3</button>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px' }}>...</span>
          <button style={{ border: 'none', background: 'transparent', color: '#555', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer' }}>&gt;</button>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ color: 'var(--deep-pink)', marginBottom: '20px' }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" placeholder="Product Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
              <input type="number" placeholder="Price (NGN)" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
              <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', minHeight: '80px' }}></textarea>
              <input type="number" placeholder="Stock Quantity" required value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
              <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value, category_name: ''})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                <option value="">Select existing category</option>
                {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <input type="text" placeholder="Or add new category" value={formData.category_name} onChange={e => setFormData({...formData, category_name: e.target.value, category_id: ''})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
              <input type="text" placeholder="Image URL" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: 'var(--light-bg)' }} />
              {formData.image && <img src={formData.image} alt="Product preview" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--primary-pink)' }} />}
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-dark)' }}>
                <input type="checkbox" checked={formData.is_available} onChange={e => setFormData({...formData, is_available: e.target.checked})} />
                Available
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-dark)' }}>
                <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} />
                Featured Product
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="view-btn" style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', backgroundColor: 'var(--deep-pink)', color: '#fff', cursor: 'pointer' }}>{editingProduct ? 'Update Product' : 'Save Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
