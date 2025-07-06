import React from "react";

const AuthFormField = ({
  id,
  type = "text",
  label,
  icon: Icon,
  value,
  onChange,
  focused,
  onFocus,
  onBlur,
  required,
  placeholder,
  endAdornment,
  hint
}) => {
  return (
    <div className="form-field">
      <div className={`form-input-container ${focused ? 'focused' : ''} ${value ? 'has-value' : ''}`}>
        {Icon && <Icon className="form-field-icon" />}
        <input
          type={type}
          id={id}
          className="form-input"
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          required={required}
          placeholder={placeholder}
          aria-label={label}
        />
        <label htmlFor={id} className="form-label">{label}</label>
        {endAdornment}
      </div>
      {hint && <p className="form-hint">{hint}</p>}
    </div>
  );
};

export default AuthFormField;