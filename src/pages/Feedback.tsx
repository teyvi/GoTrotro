// Feedback.jsx
import React from "react";
import "../styles/FeedBack.css";
import { FaWhatsapp } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

function Feedback() {

  
  return (
    <div className="feedback-container">
      <div className="feedback-content">
        <h1 className="feedback-title">Send Feedback</h1>
        
        <div className="feedback-text">
          <p>
            We would like to know what you think of this application. 
            What can we add to it for better experience? 
            Are there routes you would like us to add to our map?
          </p>
          <p className="contact-text">Let us know on:</p>
        </div>

        <ul className="contact-list">
          <li className="contact-item">
            <FaWhatsapp className="contact-icon" />
            <span>WhatsApp</span>
          </li>
          <li className="contact-item">
            <MdEmail className="contact-icon" />
            <span>Email</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Feedback;