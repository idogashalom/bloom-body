import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { products as fallbackProducts } from "../data/products";
import { useShop } from "../context/ShopContext";
import { productsApi } from "../services/api";
import { normalizeProduct } from "../utils/productMapper";
import "./Product.css";

const Product = () => {
  const { addToCart } = useShop();
  const [productList, setProductList] = useState(fallbackProducts);
  const savedRatings = JSON.parse(localStorage.getItem("bloomProductRatings") || "{}");

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
          <div key={product.id} className="product-list-item">
            <img className="product-list-image" src={product.image} alt={product.title} />

            <div className="product-details">
              <h2>{product.title}</h2>
              <div className="product-stars" aria-label={`${savedRatings[product.id] || 0} star rating`}>
                {renderProductStars(savedRatings[product.id] || 0)}
              </div>
              <p className="product-price">NGN {product.price}</p>
              {product.is_available === false && (
                <p className="product-price" style={{ color: 'var(--deep-pink)', fontSize: '0.95rem' }}>Unavailable</p>
              )}

              <div className="product-buttons">
                <Link
                  to={`/product/${product.id}`}
                  className="view-btn"
                  onClick={(e) => {
                    if (product.is_available === false) {
                      e.preventDefault();
                      try {
                        window.dispatchEvent(new CustomEvent("bloom-toast", { detail: { message: "This product is currently unavailable 💕", duration: 3000 } }));
                      } catch (err) { }
                    }
                  }}
                >
                  View
                </Link>
                <button className="add-cart-btn" type="button" onClick={() => addToCart(product)} aria-disabled={product.is_available === false}>
                  {product.is_available === false ? 'Unavailable' : 'Add to cart'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Product;
