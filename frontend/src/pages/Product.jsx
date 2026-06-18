import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { products as fallbackProducts } from "../data/products";
import { useShop } from "../context/ShopContext";
import { productsApi } from "../services/api";
import { normalizeProduct, isProductAvailable } from "../utils/productMapper";
import "./Product.css";

const Product = () => {
  const { addToCart, cartCount } = useShop();
  const navigate = useNavigate();
  const [productList, setProductList] = useState(fallbackProducts);
  const savedRatings = JSON.parse(localStorage.getItem("bloomProductRatings") || "{}");
  const [bouncingProductId, setBouncingProductId] = useState(null);
  const [addedProductId, setAddedProductId] = useState(null);

  const handleAddToCart = (product) => {
    const success = addToCart(product);
    if (success) {
      setBouncingProductId(product.id);
      setAddedProductId(product.id);
      setTimeout(() => {
        setBouncingProductId(null);
      }, 500);
      setTimeout(() => {
        setAddedProductId(null);
      }, 800);
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetchProducts = () => productsApi.getAll()
      .then((data) => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          setProductList(data.map(normalizeProduct));
        }
      })
      .catch((error) => console.error(error));

    fetchProducts();
    const interval = setInterval(fetchProducts, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const renderProductStars = (rating) =>
    [1, 2, 3, 4, 5].map((star) => {
      const starClass = rating >= star ? "is-full" : rating >= star - 0.5 ? "is-half" : "";

      return (
        <span className={`product-star ${starClass}`} key={star}>
          {"\u2605"}
        </span>
      );
    });

  return (
    <main className="products-page">
      <header className="products-header">
        <h1>Our Products</h1>
        <hr style={{ color: " #b85c6b", margin: "30px 0" }} />
      </header>

      <div className="products-list">
        {productList.map((product) => (
          <div 
            key={product.id} 
            className="product-list-item"
            onClick={() => {
              if (window.innerWidth <= 768) {
                navigate(`/product/${product.id}`);
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <img className="product-list-image" src={product.image} alt={product.title} />

            <div className="product-details">
              <h2>{product.title}</h2>
              <div className="product-stars" aria-label={`${savedRatings[product.id] || 0} star rating`}>
                {renderProductStars(savedRatings[product.id] || 0)}
              </div>
              <p className="product-price">NGN {product.price}</p>
              { !isProductAvailable(product) && (
                <p className="product-price" style={{ color: 'var(--deep-pink)', fontSize: '0.95rem' }}>Currently unavailable</p>
              )}

              <div className="product-buttons">
                <Link
                  to={`/product/${product.id}`}
                  className="view-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  View
                </Link>
                { !isProductAvailable(product) ? (
                  <p className="product-unavailable-message" style={{ color: 'var(--deep-pink)', fontSize: '0.95rem', margin: 0 }}>
                    {product.unavailable_message || 'Currently unavailable'}
                  </p>
                ) : (
                  <div className="mobile-cart-action-group" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className={`add-cart-btn ${bouncingProductId === product.id ? 'active-bounce' : ''} ${addedProductId === product.id ? 'added-animate' : ''}`} 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                    >
                      Add to cart
                    </button>
                    
                    <Link 
                      to="/cart" 
                      className="mobile-cart-icon-btn"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="View Cart"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                      {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Product;
