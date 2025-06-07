import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';
 import '../styles/AuthForm.css'

function AuthForm({ type }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const isLogin = type === 'login';

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle phone number submission
    console.log('Phone number submitted:', phoneNumber);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">{isLogin ? 'Login' : 'Create Account'}</h1>
        
        <form onSubmit={handleSubmit} className="phone-form">
          <div className="input-group">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              className="phone-input"
              required
            />
          </div>
          <button type="submit" className="submit-btn">
            {isLogin ? 'Login' : 'Register'} with Phone
          </button>
        </form>

        <div>
          <span className='text-span'>or continue with</span>
        </div>

        <div className="social-buttons">
          <button className="social-btn google">
            <FaApple />
            <span>Apple</span>
          </button>
          <button className="social-btn facebook">
            <FaGoogle />
            <span>Google</span>
          </button>
          <button className="social-btn email">
            <FaFacebook />
            <span>Facebook</span>
          </button>
        </div>

        <p className="auth-switch">
          {isLogin ? 
            "Don't have an account? " : 
            "Already have an account? "}
          <Link to={isLogin ? "/register" : "/login"}>
            {isLogin ? 'Register here' : 'Login here'}
          </Link>
        </p>
        {/* <footer>
        if you are creating a new account, read the Terms & Conditions and Privacy Policy will apply. 
      </footer> */}
      </div>
     
    </div>
  );
}

export default AuthForm;