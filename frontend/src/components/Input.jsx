import React from 'react';

export default function Input(props) {
  return (
    <div style={{ marginBottom: 16 }}>
      {props.label && (
        <label
          style={{
            display: 'block',
            fontWeight: 600,
            marginBottom: 6,
            color: '#111',
            fontSize: 12,
          }}
        >
          {props.label}
        </label>
      )}
      <input
        {...props}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: 8,
          border: props.error ? '1px solid #e53935' : '1px solid #ddd',
          background: '#fafafa',
        }}
      />
      {props.error && (
        <div style={{ color: '#e53935', fontSize: 12, marginTop: 6 }}>
          {props.error}
        </div>
      )}
    </div>
  );
}
