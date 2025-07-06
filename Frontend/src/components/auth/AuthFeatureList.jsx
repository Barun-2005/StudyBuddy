import React from "react";

const AuthFeatureList = ({ features }) => {
  return (
    <div className="auth-features-list">
      {features.map((feature, index) => (
        <div 
          key={index} 
          className={`auth-feature-item ${index % 2 === 0 ? 'primary-feature' : 'secondary-feature'}`}
        >
          <div className="auth-feature-item-icon-container">
            <feature.icon className="auth-feature-item-icon" />
          </div>
          <div>
            <h3 className="auth-feature-item-title">{feature.title}</h3>
            <p className="auth-feature-item-description">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuthFeatureList;