import { useRef } from "react";
import "./Hero3D.css";

//this is the hero 3d component
const Hero3D = () => {
  const imgRef = useRef(null);

  //this is the function that handles the mouse movement
  const handleMouseMove = (event) => {
    if (!imgRef.current) return;
    //this is the function that gets the mouse position
    const rect = imgRef.current.getBoundingClientRect();

    //this is the function that calculates the mouse position
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    //this is the function that calculates the center of the image
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    //this is the function that calculates the rotation of the image
    const rotateX = -(y - centerY) / 12;
    const rotateY = (x - centerX) / 12;     
    //this is the function that applies the rotation to the image
    imgRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  };

  const handleMouseLeave = () => {
    if (!imgRef.current) return;
    //this is the function that resets the rotation of the image

    imgRef.current.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
  };

  //this is the return statement
  return (
    <div className="hero-container">
      <div
        className="hero-card"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <img
          ref={imgRef}
          src="/src/assets/bloom-logo.png"
          alt="Bloom Body logo"
          className="hero-image"
        />
      </div>
    </div>
  );
};

export default Hero3D;
