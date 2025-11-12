import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '../features/authSlice';
import axios from 'axios';

const url = "http://localhost:3000";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  async function handleClick(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const userDetails = {
        email: email,
        password: password,
      };
      
      const response = await axios.post(`${url}/api/auth/login`, userDetails, {
        withCredentials: true
      });
      
      if (response.data.success && response.data.token) {
        dispatch(setToken(response.data.token));
        dispatch(setUser(response.data.user));
        navigate('/');
      } else {
        setError(response.data.message || "Login failed");
      }
      
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: '450px',
        width: '100%',
        backgroundColor: '#f8e8f5',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ 
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          Login
        </h2>
        
        {error && (
          <div style={{ 
            color: '#c62828',
            marginBottom: '20px',
            padding: '12px',
            backgroundColor: '#ffebee',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleClick}>
          <div style={{ marginBottom: '20px', position: 'relative' }}>
            <input 
              type="email" 
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ 
                width: '100%',
                padding: '15px 15px 15px 45px',
                border: 'none',
                borderRadius: '25px',
                fontSize: '14px',
                backgroundColor: '#6b4c9a',
                color: 'white',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <span style={{
              position: 'absolute',
              left: '18px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '16px'
            }}>
              ✉️
            </span>
          </div>
          
          <div style={{ marginBottom: '25px', position: 'relative' }}>
            <input 
              type="password" 
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ 
                width: '100%',
                padding: '15px 15px 15px 45px',
                border: 'none',
                borderRadius: '25px',
                fontSize: '14px',
                backgroundColor: '#6b4c9a',
                color: 'white',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <span style={{
              position: 'absolute',
              left: '18px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '16px'
            }}>
              🔒
            </span>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: loading ? '#555' : '#2c1a4d',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              marginBottom: '20px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#1a0f2e')}
            onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#2c1a4d')}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p style={{ 
          marginTop: '20px',
          textAlign: 'center',
          color: '#333',
          fontSize: '14px'
        }}>
          Don't have an account? <Link to="/register" style={{ color: '#4a5ff7', textDecoration: 'none', fontWeight: 'bold' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login
