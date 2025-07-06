import React from "react";

const AuthFeatureGrid = ({ features }) => {
  return (
    <div className="auth-features-grid">
      {features.map((feature, index) => (
        <div 
          key={index} 
          className={`auth-feature-item ${feature.primary ? 'primary-feature' : 'secondary-feature'}`}
        >
          <feature.icon className="auth-feature-item-icon" />
          <span className="auth-feature-item-text">{feature.text}</span>
        </div>
      ))}
    </div>
  );
};

export default AuthFeatureGrid;