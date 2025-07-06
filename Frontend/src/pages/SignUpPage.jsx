import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User, Book, Lightbulb, Users, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [focusedField, setFocusedField] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = validateForm();
    
    if (success === true) {
      setIsLoading(true);
      try {
        await signup(formData);
        setSignupSuccess(true);
        // Let the success animation play before any redirects
        setTimeout(() => {
          // Any redirects would happen here
        }, 1500);
      } catch (error) {
        setIsLoading(false);
        // Toast error is likely handled in the store
      }
    }
  };

  return (
    <div className="auth-page-container">
      {/* Decorative elements */}
      <div className="auth-decoration-circle top-20 right-10"></div>
      <div className="auth-decoration-circle bottom-20 left-10"></div>
      
      {/* Content */}
      <div className="auth-content-wrapper">
        {/* Left side - Form */}
        <div className="auth-form-container">
          <div className={`auth-form-card ${signupSuccess ? 'success-animation' : ''}`}>
            {/* LOGO */}
            <div className="auth-branding">
              <div className="auth-logo-container">
                <Book className="auth-logo-icon" />
              </div>
              <h1 className="auth-title">
                Join StudyBuddy
              </h1>
              <p className="auth-subtitle">
                Your academic journey starts here
              </p>
            </div>

            {signupSuccess ? (
              <div className="auth-success-message">
                <div className="auth-success-icon-container">
                  <CheckCircle className="auth-success-icon" />
                </div>
                <h2 className="auth-success-title">Account Created!</h2>
                <p className="auth-success-text">Your StudyBuddy account has been successfully created.</p>
                <Link to="/login" className="auth-success-button">
                  Continue to Login
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-fields">
                  <div className="form-field">
                    <div className={`form-input-container ${focusedField === 'fullName' ? 'focused' : ''} ${formData.fullName ? 'has-value' : ''}`}>
                      <User className="form-field-icon" />
                      <input
                        type="text"
                        id="fullName"
                        className="form-input"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        onFocus={() => setFocusedField('fullName')}
                        onBlur={() => setFocusedField(null)}
                        required
                      />
                      <label htmlFor="fullName" className="form-label">Full Name</label>
                    </div>
                  </div>

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
                        className="form-toggle-visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex="-1"
                      >
                        {showPassword ? (
                          <EyeOff className="toggle-icon" />
                        ) : (
                          <Eye className="toggle-icon" />
                        )}
                      </button>
                    </div>
                    <p className="form-hint">
                      Must be at least 6 characters
                    </p>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className={`auth-submit-button ${isSigningUp || isLoading ? 'loading' : ''}`}
                  disabled={isSigningUp || isLoading}
                >
                  {isSigningUp || isLoading ? (
                    <>
                      <Loader2 className="auth-loading-icon" />
                      <span className="auth-btn-text">Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span className="auth-btn-text">Create Account</span>
                      <ArrowRight className="auth-btn-icon" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="auth-alt-action">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="auth-alt-link">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Information */}
        <div className="auth-feature-container">
          <div className="auth-feature-card">
            <div className="auth-feature-icon-container">
              <Users className="auth-feature-icon" />
            </div>
            
            <h2 className="auth-feature-title">
              Connect, Learn, Succeed
            </h2>
            
            <p className="auth-feature-description">
              Join our community of motivated students and transform the way you learn. Find study partners who share your academic goals.
            </p>
            
            <div className="auth-features-list">
              <div className="auth-feature-item primary-feature">
                <div className="auth-feature-item-icon-container">
                  <Users className="auth-feature-item-icon" />
                </div>
                <div>
                  <h3 className="auth-feature-item-title">Collaborative Learning</h3>
                  <p className="auth-feature-item-description">Connect with peers who complement your study style</p>
                </div>
              </div>
              
              <div className="auth-feature-item secondary-feature">
                <div className="auth-feature-item-icon-container">
                  <MessageSquare className="auth-feature-item-icon" />
                </div>
                <div>
                  <h3 className="auth-feature-item-title">Virtual Study Rooms</h3>
                  <p className="auth-feature-item-description">Study together from anywhere in the world</p>
                </div>
              </div>
              
              <div className="auth-feature-item primary-feature">
                <div className="auth-feature-item-icon-container">
                  <Lightbulb className="auth-feature-item-icon" />
                </div>
                <div>
                  <h3 className="auth-feature-item-title">Knowledge Exchange</h3>
                  <p className="auth-feature-item-description">Share resources and insights to excel together</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;