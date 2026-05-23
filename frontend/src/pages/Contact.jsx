import React from 'react';
import './Contact.css';

const Contact = () => {
    // Handle form submission and send message to WhatsApp
    const handleContactSubmit = (event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget); // Get form data
        // Format the message for WhatsApp
        const message = `Name: ${formData.get("name")}
Email: ${formData.get("email")}
Phone: ${formData.get("phone")}
Message: ${formData.get("message")}`;
// Redirect to WhatsApp with the message
        window.location.href = `https://wa.me/2348122112738?text=${encodeURIComponent(message)}`;
    };

    return (    
        <main className="contact-page">
            <header className="contact-header">
                <h1 className="contact-title">Contact Us</h1>
                <p>Have questions or need assistance? We're here to help! Reach out to us through the form below or connect with us on social media.</p>
                <hr style={{ color: " #b85c6b", margin: "50px 0" }} />
            </header>

            <div className="contact-content">
                <section className="contact-form-section">
                    <h2>Send Us A Message</h2>
                    {/* Form that handles the sending of messages to WhatsApp that why the `handleContactSubmit` function is used */}
                    <form className="contact-form" onSubmit={handleContactSubmit}>
                        <div className="form-group">
                            <input type="text" id="name" name="name" placeholder="Name" required />
                        </div>

                        <div className="form-group">
                            <input type="email" id="email" name="email" placeholder="Email" required />
                        </div>

                        <div className="form-group">
                            <input type="tel" id="phone" name="phone" placeholder="Phone Number" required />
                        </div>

                        <div className="form-group">
                            <textarea id="message" name="message" placeholder="Your message" required rows="5"></textarea>
                        </div>

                        <button type="submit" className="submit-button">Send Message</button>
                    </form>
                </section>

                <section className="contact-options-section">
                    <h2>Other Ways to Contact Us</h2>

                    <div className="contact-button-list">
                        <button className="social-btn" onClick={() => window.location.href = 'https://wa.me/2348122112738'}>
                            WhatsApp
                        </button>

                        <button className="social-btn" onClick={() => window.location.href = 'https://www.instagram.com/thebloombody_?igsh=MTQxeGc0amYyZ3Q5YQ=='}>
                            Instagram
                        </button>

                        <button className="social-btn" onClick={() => window.location.href = 'tel:+2348122112738'}>
                            Mobile
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default Contact;
