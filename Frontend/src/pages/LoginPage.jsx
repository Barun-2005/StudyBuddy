import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, Book, GraduationCap, Users, Globe, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { FcGoogle } from 'react-icons/fc';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [focusedField, setFocusedField] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const user = await login(formData);
      setLoginSuccess(true);
      
      // Short delay for success animation
      setTimeout(() => {
        if (user && !user.isProfileComplete) {
          navigate("/profile");
        } else {
          navigate("/dashboard");
        }
      }, 800);
    } catch (error) {
      setIsLoading(false);
      toast.error("Login failed. Please try again.");
    }
  };

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.MODE === "development"
      ? 'http://localhost:5001'
      : window.location.origin;
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  return (
    <div className="auth-page-container">
      {/* Decorative elements */}
      <div className="auth-decoration-circle top-20 left-10"></div>
      <div className="auth-decoration-circle bottom-20 right-10"></div>
      
      {/* Content */}
      <div className="auth-content-wrapper">
        {/* Left Side - Form */}
        <div className="auth-form-container">
          <div className={`auth-form-card ${loginSuccess ? 'success-animation' : ''}`}>
            <div className="auth-branding">
              <div className="auth-logo-container">
                <GraduationCap className="auth-logo-icon" />
              </div>
              <h2 className="auth-title">
                Welcome Back, Scholar!
              </h2>
              <p className="auth-subtitle">
                Your academic journey continues here.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-fields">
                <div className="form-field">
                  <div className={`form-input-container ${focusedField === 'email' ? 'focused' : ''} ${formData.email ? 'has-value' : ''}`}>
                    <Mail className="form-field-icon" />
                    <input
                      type="email"
                      id="email"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                    <label htmlFor="email" className="form-label">Email address</label>
                  </div>
                </div>

                <div className="form-field">
                  <div className="form-field-header">
                    <label htmlFor="password" className="form-field-label">Password</label>
                    <Link to="/forgot-password" className="form-field-link">
                      Forgot password?
                    </Link>
                  </div>
                  <div className={`form-input-container ${focusedField === 'password' ? 'focused' : ''} ${formData.password ? 'has-value' : ''}`}>
                    <Lock className="form-field-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="form-input"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                    <label htmlFor="password" className="form-label">Password</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="form-toggle-visibility"
                      tabIndex="-1"
                    >
                      {showPassword ? (
                        <EyeOff className="toggle-icon" />
                      ) : (
                        <Eye className="toggle-icon" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className={`auth-submit-button ${isLoggingIn || isLoading ? 'loading' : ''} ${loginSuccess ? 'success' : ''}`}
                disabled={isLoggingIn || isLoading}
              >
                {loginSuccess ? (
                  <>
                    <span className="auth-btn-text">Success!</span>
                    <ArrowRight className="auth-btn-icon" />
                  </>
                ) : isLoggingIn || isLoading ? (
                  <>
                    <Loader2 className="auth-loading-icon" />
                    <span className="auth-btn-text">Connecting...</span>
                  </>
                ) : (
                  <>
                    <span className="auth-btn-text">Sign in</span>
                    <ArrowRight className="auth-btn-icon" />
                  </>
                )}
              </button>
            </form>

            <div className="divider">OR</div>

            <button
              onClick={handleGoogleLogin}
              className="btn btn-outline w-full flex items-center justify-center gap-2"
            >
              <FcGoogle size={20} />
              Continue with Google
            </button>

            <div className="auth-alt-action">
              <p>
                New to StudyBuddy?{" "}
                <Link to="/signup" className="auth-alt-link">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Features */}
        <div className="auth-feature-container">
          <div className="auth-feature-card">
            <div className="auth-feature-icon-container">
              <Book className="auth-feature-icon" />
            </div>
            
            <h1 className="auth-feature-title">
              Unlock Your Academic Potential
            </h1>
            
            <p className="auth-feature-description">
              Connect with fellow students, share knowledge, and achieve your study goals together.
            </p>
            
            <div className="auth-features-grid">
              <div className="auth-feature-item primary-feature">
                <Users className="auth-feature-item-icon" />
                <span className="auth-feature-item-text">Find study partners</span>
              </div>
              <div className="auth-feature-item secondary-feature">
                <Globe className="auth-feature-item-icon" />
                <span className="auth-feature-item-text">Virtual learning</span>
              </div>
              <div className="auth-feature-item primary-feature">
                <Book className="auth-feature-item-icon" />
                <span className="auth-feature-item-text">Share resources</span>
              </div>
              <div className="auth-feature-item secondary-feature">
                <GraduationCap className="auth-feature-item-icon" />
                <span className="auth-feature-item-text">Track progress</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

