import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../data/products";
import { useShop } from "../context/ShopContext";
import { productsApi } from "../services/api";
import { normalizeProduct } from "../utils/productMapper";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const fallbackProduct = getProductById(id);
  const [product, setProduct] = useState(fallbackProduct);
  const { addToCart } = useShop();
  const [quantity, setQuantity] = useState(1);
  const savedRatings = JSON.parse(localStorage.getItem("bloomProductRatings") || "{}");
  const [productRating, setProductRating] = useState(savedRatings[fallbackProduct.id] || 0);

  useEffect(() => {
    let mounted = true;
    const fetchProduct = () => productsApi.getById(id)
      .then((data) => {
        const normalized = normalizeProduct(data);
        if (mounted) {
          setProduct(normalized);
          setProductRating(savedRatings[normalized.id] || 0);
        }
      })
      .catch((error) => console.error(error));

    fetchProduct();
    const interval = setInterval(fetchProduct, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [id]);

  const handleProductRating = (rating) => {
    const updatedRatings = {
      ...savedRatings,
      [product.id]: rating,
    };
    localStorage.setItem("bloomProductRatings", JSON.stringify(updatedRatings));
    setProductRating(rating);
  };

  return (
    <main className="product-details-page">
      <header className="product-details-header">
        <h1>Product Details</h1>
        <hr style={{ color: " #b85c6b", margin: "50px 0" }} />
      </header>

      <div className="product-details-content">
        <img className="product-details-image" src={product.image} alt={product.title} />

        <div className="product-details-info">
          <h2>{product.title}</h2>
          <div className="product-rating" aria-label={`Product rating ${productRating} out of 5`}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                className={`product-rating-star ${rating <= productRating ? "is-rated" : ""}`}
                type="button"
                key={rating}
                aria-label={`Rate ${rating} star${rating > 1 ? "s" : ""}`}
                onClick={() => handleProductRating(rating)}
              >
                {"\u2605"}
              </button>
            ))}
          </div>
          <p className="product-details-price">Price: NGN {product.price}</p>
          {product.is_available === false && (
            <p className="product-details-price" style={{ color: 'var(--deep-pink)' }}>Unavailable</p>
          )}
          <p className="product-details-description">
            {product.description || "A trusted Bloom Body essential created to support your confidence, self-love, and healthy transformation journey."}
          </p>

          <div className="quantity-selector">
            <p>Quantity</p>
            <div className="quantity-controls">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>-</button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity((value) => value + 1)}>+</button>
            </div>
          </div>

          <button
            className="add-to-cart-large"
            type="button"
            onClick={() => addToCart(product, quantity)}
            aria-disabled={product.is_available === false}
          >
            {product.is_available === false ? "Unavailable" : "Add to cart"}
          </button>
        </div>
      </div>

      <div className="product-details-footer-lines"></div>
    </main>
  );
};

export default ProductDetails;
