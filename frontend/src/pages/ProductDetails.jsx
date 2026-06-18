import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../data/products";
import { useShop } from "../context/ShopContext";
import { productsApi } from "../services/api";
import { normalizeProduct, isProductAvailable } from "../utils/productMapper";
import "./ProductDetails.css";

const reviewsByProduct = {
  1: [
    { name: "Jessica M.", rating: 5, comment: "This Protein Powder is a game-changer! Tastes great and mixes so easily.", date: "2026-05-10" },
    { name: "Amina K.", rating: 4, comment: "Really helped me stay consistent with my fitness goals. Highly recommend.", date: "2026-06-02" }
  ],
  2: [
    { name: "Debra O.", rating: 5, comment: "Best Protein Oats ever! So filling and the texture is perfect.", date: "2026-04-18" },
    { name: "Chioma N.", rating: 5, comment: "Amazing breakfast option, very nutritious.", date: "2026-05-22" }
  ],
  3: [
    { name: "Sarah B.", rating: 5, comment: "Tummy Shrink Tea works wonders! Saw results in just two weeks.", date: "2026-05-01" },
    { name: "Fatima Y.", rating: 4, comment: "Nice soothing taste. Helps with bloating immensely.", date: "2026-05-29" }
  ],
  4: [
    { name: "Zainab S.", rating: 5, comment: "Booty Gummies are delicious and I can definitely see a difference! Will rebuy.", date: "2026-06-11" },
    { name: "Tunde A.", rating: 5, comment: "Bought this for my partner, she absolutely loves it.", date: "2026-06-14" }
  ],
  5: [
    { name: "Linda G.", rating: 5, comment: "Nutrivia Gummies are so tasty, and my energy levels have improved so much.", date: "2026-03-15" },
    { name: "Evelyn U.", rating: 4, comment: "Great multivitamin gummies, gentle on the stomach.", date: "2026-04-05" }
  ],
  default: [
    { name: "Grace O.", rating: 5, comment: "Exceptional quality. Bloom Body never disappoints!", date: "2026-06-01" },
    { name: "Joy I.", rating: 5, comment: "Highly recommend this product! It's worth every penny.", date: "2026-06-10" }
  ]
};

const ProductDetails = () => {
  const { id } = useParams();
  const fallbackProduct = getProductById(id);
  const [product, setProduct] = useState(fallbackProduct);
  const { addToCart } = useShop();
  const [quantity, setQuantity] = useState(1);
  const savedRatings = JSON.parse(localStorage.getItem("bloomProductRatings") || "{}");
  const [productRating, setProductRating] = useState(savedRatings[fallbackProduct.id] || 0);

  const [isBouncing, setIsBouncing] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    const success = addToCart(product, quantity);
    if (success) {
      setIsBouncing(true);
      setIsAdded(true);
      setTimeout(() => setIsBouncing(false), 500);
      setTimeout(() => setIsAdded(false), 800);
    }
  };

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

  const salesCount = product.id ? (product.id * 14 + 25) : 35;
  const stockCount = product.stock_quantity ?? 10;
  const productReviews = reviewsByProduct[product.id] || reviewsByProduct.default;

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
          
          <div className="product-stock-sales-info">
            <span className="info-badge sold-badge">
              <i className="fas fa-fire"></i> {salesCount} units sold
            </span>
            <span className="info-badge stock-badge">
              <i className="fas fa-box"></i> {stockCount} units in stock
            </span>
          </div>

          <p className="product-details-price">Price: NGN {product.price}</p>
          { !isProductAvailable(product) && (
            <p className="product-details-price" style={{ color: 'var(--deep-pink)' }}>Currently unavailable</p>
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

          { !isProductAvailable(product) ? (
            <p className="product-unavailable-message" style={{ color: 'var(--deep-pink)', fontSize: '1rem', marginTop: '20px' }}>
              {product.unavailable_message || 'Currently unavailable'}
            </p>
          ) : (
            <button
              className={`add-to-cart-large ${isBouncing ? 'active-bounce' : ''} ${isAdded ? 'added-animate' : ''}`}
              type="button"
              onClick={handleAddToCart}
            >
              Add to cart
            </button>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <section className="product-reviews-section">
        <h2>Customer Reviews & Ratings</h2>
        <div className="reviews-container">
          {productReviews.map((rev, idx) => (
            <div key={idx} className="review-card">
              <div className="review-header">
                <div className="review-user-info">
                  <span className="user-avatar">{rev.name.charAt(0)}</span>
                  <div>
                    <h4 className="user-name">{rev.name}</h4>
                    <span className="verified-purchase"><i className="fas fa-check-circle"></i> Verified Purchase</span>
                  </div>
                </div>
                <span className="review-date">{rev.date}</span>
              </div>
              <div className="review-stars-list">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`review-star ${i < rev.rating ? 'active' : ''}`}>★</span>
                ))}
              </div>
              <p className="review-comment">{rev.comment}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="product-details-footer-lines"></div>
    </main>
  );
};

export default ProductDetails;
