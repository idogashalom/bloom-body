import { useState } from 'react';
import './PasswordInput.css';

const PasswordInput = ({ className = '', inputStyle, ...inputProps }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className={`password-input-wrap ${className}`.trim()}>
      <input
        {...inputProps}
        type={isVisible ? 'text' : 'password'}
        className="password-input"
        style={inputStyle}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setIsVisible((visible) => !visible)}
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        aria-pressed={isVisible}
        title={isVisible ? 'Hide password' : 'Show password'}
      >
        <i
          className={`fa-solid ${isVisible ? 'fa-eye' : 'fa-eye-slash'}`}
          aria-hidden="true"
        />
      </button>
    </span>
  );
};

export default PasswordInput;
