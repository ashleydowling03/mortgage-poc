import React from 'react';

interface InputFieldProps {
  label: string;
  value: any;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
  step?: string;
  disabled?: boolean;
}

const inputLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: '#6c757d',
  marginBottom: 8,
  display: 'block',
};

const inputField: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #dee2e6',
  borderRadius: 4,
  fontSize: 14,
  fontFamily: 'inherit',
  background: '#fff',
};

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  prefix,
  suffix,
  type = "number",
  step,
  disabled,
}) => {
  return (
    <div>
      <label style={inputLabel}>{label}</label>
      <div style={{ position: "relative" }}>
        {prefix && (
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#6c757d",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {prefix}
          </span>
        )}
        <input
          type={type}
          step={step}
          value={value}
          onChange={(e) => onChange(+e.target.value)}
          disabled={disabled}
          style={{
            ...inputField,
            paddingLeft: prefix ? 28 : 12,
            paddingRight: suffix ? 40 : 12,
            background: disabled ? "#f8f9fa" : "#fff",
            color: disabled ? "#6c757d" : "#212529",
            fontWeight: disabled ? 600 : 400,
          }}
        />
        {suffix && (
          <span
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#6c757d",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};

export default InputField;