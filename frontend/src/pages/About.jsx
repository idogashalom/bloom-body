import React from "react";
import Ceo from "../assets/ceo.jpeg";
import "./About.css";

const About = () => {
  return (
    <main className="about-page">
   

      <section className="our-story">
        <div className="story-text">
          <h2 style={{ fontSize: "60px",}}>Our Story</h2>
          <hr className="short-hr" />
          <p>
            Bloom Body was created from a place of understanding and personal
            experience. Many women struggle with gaining healthy weight and
            feeling confident in their bodies.
          </p>
          <p>
            Our founder experienced this journey firsthand and decided to create
            a solution that truly works. What started as a simple idea has grown
            into a brand dedicated to helping women feel confident, strong, and beautiful.
          </p>
        </div>

        <div className="story-image-card">
          <img src={Ceo} alt="Bloom Body CEO" />
        </div>
      </section>

      <section className="mission">
        <h2>Mission Statement</h2>
        <p>
          At Bloom Body, our mission is to help women gain healthy weight, build
          confidence, and embrace their natural beauty. We are committed to
          providing safe, effective, and trusted products that support
          transformation and self-love.
        </p>
      </section>

    
    </main>
  );
};

export default About;
