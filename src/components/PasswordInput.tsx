"use client";

import { useState } from "react";

export default function PasswordInput({
  value,
  onChange,
  placeholder = "비밀번호",
  required,
  name = "password",
  autoComplete = "current-password",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  name?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="password-field">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="eye-btn"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"}
      >
        {show ? "숨김" : "보기"}
      </button>
    </div>
  );
}
