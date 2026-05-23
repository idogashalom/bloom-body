import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Hero3D from "../components/Hero3D";
import Logo from "../assets/bloom-logo.png";
import "./Home.css";
import Leaf from "../assets/leaf.jpeg";
import { products as fallbackProducts } from "../data/products";
import { useShop } from "../context/ShopContext";
import { productsApi } from "../services/api";
import { normalizeProduct } from "../utils/productMapper";

// This is just dummy testimonials that will be changed later
const testimonials = [
  '"I love the products! They have transformed my skin!" - Jenifer',
  '"The customer service is amazing. Highly recommend!" - Sandra',
  '"Bloom Body has become a staple in my skincare routine." - Emily',
];


const savedTestimonials = () => {
  const saved = localStorage.getItem("bloomTestimonials");
  // Returns the saved testimonials if there are none
  return saved ? JSON.parse(saved) : testimonials;
};

// Gets the saved likes 
const savedLikes = () => JSON.parse(localStorage.getItem("bloomTestimonialLikes") || "{}");
// Gets the saved liked state
const savedLikedState = () => JSON.parse(localStorage.getItem("bloomLikedTestimonials") || "{}");

const Home = () => {
  const { addToCart } = useShop(); // Accesses the addToCart function from the shop context
  const [customerTestimonials, setCustomerTestimonials] = useState(savedTestimonials); // Saves the customer testimonials   
  const [testimonialLikes, setTestimonialLikes] = useState(savedLikes); // Saves the testimonial likes
  const [likedTestimonials, setLikedTestimonials] = useState(savedLikedState); // Saves the liked testimonials
  const [newTestimonial, setNewTestimonial] = useState(""); // Saves the new testimonial
  const [customerName, setCustomerName] = useState(""); // Saves the customer name
  const [activeIndex, setActiveIndex] = useState(0); // Saves the active index
  const [currentFeatureSlide, setCurrentFeatureSlide] = useState(0); // Saves the current feature slide
  const [isTransitioning, setIsTransitioning] = useState(true); // Saves the transition state
  const [itemsPerPage, setItemsPerPage] = useState(4); // Saves the number of items per page
  const [featuredProducts, setFeaturedProducts] = useState(fallbackProducts);

  // This useEffect is used to handle the resize event for the product carousel
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 620) setItemsPerPage(1);
      else if (window.innerWidth <= 900) setItemsPerPage(2);
      else setItemsPerPage(4);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Gets the saved ratings 
  const savedRatings = JSON.parse(localStorage.getItem("bloomProductRatings") || "{}");

  // Renders the product stars 
  const renderProductStars = (rating) =>
    [1, 2, 3, 4, 5].map((star) => {
      const starClass = rating >= star ? "is-full" : rating >= star - 0.5 ? "is-half" : "";
      return (
        <span className={`product-star ${starClass}`} key={star}>
          {"\u2605"}
        </span>
      );
    });

  // Handles the heart reaction for the testimonials
  const handleHeartReaction = (index) => {
    const hasLiked = likedTestimonials[index];

    // Updates the testimonial likes
    setTestimonialLikes((likes) => {
      const newLikes = {
        ...likes,
        [index]: Math.max((likes[index] || 0) + (hasLiked ? -1 : 1), 0),
      };
      localStorage.setItem("bloomTestimonialLikes", JSON.stringify(newLikes));
      return newLikes;
    });
    setLikedTestimonials((liked) => {
      const newLikedState = {
        ...liked,
        [index]: !hasLiked,
      };
      localStorage.setItem("bloomLikedTestimonials", JSON.stringify(newLikedState));
      return newLikedState;
    });
  };

  // This useEffect handles the feature carousel (swiping through products)
  useEffect(() => {
    let mounted = true;
    const fetchFeaturedProducts = () => productsApi.getFeatured()
      .then((data) => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          setFeaturedProducts(data.map(normalizeProduct));
        }
      })
      .catch((error) => console.error(error));

    fetchFeaturedProducts();
    const interval = setInterval(fetchFeaturedProducts, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (featuredProducts.length === 0) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentFeatureSlide((current) => current + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [featuredProducts.length]);

  useEffect(() => {
    if (currentFeatureSlide === featuredProducts.length) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentFeatureSlide(0);
      }, 600); // Wait for CSS transition to finish
      return () => clearTimeout(timeout);
    }
  }, [currentFeatureSlide, featuredProducts.length]);

  // Handles the dot click for the feature carousel
  const handleDotClick = (idx) => {
    setIsTransitioning(true);
    setCurrentFeatureSlide(idx);
  };

  // Creates a copy of the products to allow for seamless looping of the feature carousel
  const extendedProducts = [...featuredProducts, ...featuredProducts];

  useEffect(() => {
    localStorage.setItem("bloomTestimonials", JSON.stringify(customerTestimonials));
  }, [customerTestimonials]);

  // This useEffect handles the customer testimonials (swiping through testimonials)
  useEffect(() => {
    if (customerTestimonials.length === 0) return;
    const interval = setInterval(() => {
      // Updates the active index to the next index
      setActiveIndex((current) => (current + 1) % customerTestimonials.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [customerTestimonials.length]);

  // Handles the submission of new testimonials
  const handleAddTestimonial = (event) => {
    event.preventDefault();

    if (!newTestimonial.trim()) {
      return;
    }

    const name = customerName.trim() || "Happy Customer";
    setCustomerTestimonials((items) => [
      ...items,
      `"${newTestimonial.trim()}" - ${name}`,
    ]);

    setNewTestimonial("");
    setCustomerName("");
  };

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
          <h1 className="bloom-title" style={{ fontFamily: "'Great Vibes', cursive", fontSize: "60px", color: "#b85c6b" }}>
            <img src={Leaf} alt="Leaf" />
            The Bloom Body
            </h1>
          <p>
            Discover your journey to a healthier, fuller you with soft,
            confidence-building body care.
          </p>
          <Link className="home-cta-button" to="/product">
            View products
          </Link>
          <Link className="home-cta-button" to="/testimonials" style={{ marginLeft: "10px", border: " border: 1px solid rgba(233, 30, 99, 0.22);" }} >
          Testimonials
          </Link>
        </div>

        <Hero3D />
      </section>

      <section className="features">
        <div className="section-heading">
          <h2>Featured Products</h2>
          <hr />
        </div>

        <div className="feature-carousel-container">
          {/* This map handles the display of the products on the homepage */}
          <div 
            className="feature-carousel-track" 
            style={{ 
              transform: `translateX(calc(-100% / var(--items-per-page) * ${currentFeatureSlide}))`,
              transition: isTransitioning ? 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
            }}
          > 
            {/* This map handles the display of the products on the homepage */ }
            {extendedProducts.map((product, idx) => (
              <div className="feature-slide" key={`${product.id}-${idx}`}>
                <div className="feature-card">
                  <img src={product.image} alt={product.title} />
                  <div className="feature-info">
                    <h3 className="feature-name">{product.title}</h3>
                    {/* This handles the display of the product stars */}
                    <div className="feature-stars" aria-label={`${savedRatings[product.id] || 0} star rating`}>
                      {renderProductStars(savedRatings[product.id] || 0)}
                    </div>
                    <p className="feature-price">NGN {product.price}</p>
                    {product.is_available === false && (
                      <p className="feature-price" style={{ color: 'var(--deep-pink)', fontSize: '0.95rem' }}>Unavailable</p>
                    )}
                    {/*This handles the view and add to cart buttons */}
                    <div className="feature-actions">
                      <Link
                        to={`/product/${product.id}`}
                        className="view-btn"
                        onClick={(event) => {
                          if (product.is_available === false) {
                            event.preventDefault();
                            try {
                              window.dispatchEvent(new CustomEvent("bloom-toast", { detail: { message: "This product is currently unavailable 💕", duration: 3000 } }));
                            } catch (error) { }
                          }
                        }}
                      >
                        View
                      </Link>
                      <button className="add-cart-btn" onClick={() => addToCart(product)} aria-disabled={product.is_available === false}>
                        {product.is_available === false ? 'Unavailable' : 'Add to cart'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="feature-carousel-dots">
            
            {featuredProducts.map((_, idx) => (
              <button 
                key={idx} 
                className={`dot ${currentFeatureSlide % featuredProducts.length === idx ? 'active' : ''}`}
                onClick={() => handleDotClick(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
        {/* <div className="view-products-container">
          <Link className="view-products-button" to="/product">
            View products
          </Link>
        </div> */}
      </section>

      <section className="testimonials">
        <div className="section-heading">
          <h2>Customers Testimonials</h2>
          <hr />
        </div>

        <div className="testimonial-grid">
          {customerTestimonials.map((testimonial, index) => (

            <div 
              className={`testimonial-card ${index === activeIndex ? "is-active" : ""}`} 
              key={`${testimonial}-${index}`}
            >
              <p>{testimonial}</p>
              <button
                className={`testimonial-heart ${likedTestimonials[index] ? "is-liked" : ""}`}
                type="button"
                aria-label="React with heart"
                aria-pressed={!!likedTestimonials[index]}
                onClick={() => handleHeartReaction(index)}
              >
                {/* This handles the display of the heart icon */}
                <span className="testimonial-heart-icon">{likedTestimonials[index] ? "\u2665" : "\u2661"}</span>
                <strong>{testimonialLikes[index] || 0}</strong>
              </button>
            </div>
          ))}
        </div>

        <form className="testimonial-form" onSubmit={handleAddTestimonial}>
          <input
            type="text"
            placeholder="Your name"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
          />
          <textarea
            placeholder="Add your testimonial"
            value={newTestimonial}
            onChange={(event) => setNewTestimonial(event.target.value)}
          ></textarea>
          <button type="submit">Add Testimonial</button>
        </form>
      </section>
    </main>
  );
};

export default Home;
