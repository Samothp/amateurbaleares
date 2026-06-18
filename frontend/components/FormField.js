import { useState } from 'react';

export function FormField({
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  minLength,
  maxLength,
  pattern,
  placeholder,
  disabled = false,
  options,
  error: externalError,
  style = {},
}) {
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');

  const validate = (val) => {
    if (required && !val && val !== 0) return `${label} es obligatorio`;
    if (minLength && val && val.length < minLength)
      return `Mínimo ${minLength} caracteres`;
    if (maxLength && val && val.length > maxLength)
      return `Máximo ${maxLength} caracteres`;
    if (pattern && val && !pattern.value.test(val))
      return pattern.message || 'Formato no válido';
    return '';
  };

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(e);
    if (touched) {
      setError(validate(val));
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validate(value));
  };

  const displayError = externalError || (touched ? error : '');
  const borderColor = displayError ? '#e53e3e' : '#ddd';

  const inputStyle = {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    border: `1px solid ${borderColor}`,
    fontSize: 14,
    background: disabled ? '#f5f5f5' : '#fff',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    ...style,
  };

  if (options) {
    return (
      <label style={{ fontSize: 14 }}>
        <span style={{ display: 'block', marginBottom: 4, color: '#666' }}>
          {label} {required && <span style={{ color: '#e53e3e' }}>*</span>}
        </span>
        <select
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          style={inputStyle}
        >
          <option value="">{placeholder || 'Seleccionar...'}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {displayError && (
          <span style={{ color: '#e53e3e', fontSize: 12, marginTop: 4, display: 'block' }}>
            {displayError}
          </span>
        )}
      </label>
    );
  }

  return (
    <label style={{ fontSize: 14 }}>
      <span style={{ display: 'block', marginBottom: 4, color: '#666' }}>
        {label} {required && <span style={{ color: '#e53e3e' }}>*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        style={inputStyle}
      />
      {displayError && (
        <span style={{ color: '#e53e3e', fontSize: 12, marginTop: 4, display: 'block' }}>
          {displayError}
        </span>
      )}
    </label>
  );
}
