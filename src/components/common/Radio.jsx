import React from "react";

// CustomRadio + RadioGroup (React, Tailwind-friendly)
// - Accessible (uses native input hidden visually)
// - Keyboard + screen-reader friendly
// - Supports controlled and uncontrolled usage
// - Simple animation and custom styling using Tailwind classes
//
// Props:
// - name: string (required for grouping)
// - options: Array<{ value: string, label: React.ReactNode, desc?: React.ReactNode, disabled?: boolean }>
// - value: string (controlled)
// - defaultValue: string (uncontrolled initial)
// - onChange: (value) => void
// - size: 'sm' | 'md' | 'lg'
// - className, optionClassName for custom wrapper classes

function CustomRadio({
  name,
  value,
  defaultValue,
  onChange = () => {},
  options = [],
  size = "md",
  className = "",
  optionClassName = "",
}) {
  const isControlled = value !== undefined && value !== null;
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? null);

  React.useEffect(() => {
    if (!isControlled && defaultValue !== undefined) setInternalValue(defaultValue);
  }, [defaultValue, isControlled]);

  const selected = isControlled ? value : internalValue;

  function handleChange(next) {
    if (!isControlled) setInternalValue(next);
    onChange(next);
  }

  const sizeMap = {
    sm: {
      outer: "w-4 h-4",
      inner: "w-2 h-2",
      text: "text-sm",
      gap: "gap-2",
    },
    md: {
      outer: "w-5 h-5",
      inner: "w-2.5 h-2.5",
      text: "text-sm",
      gap: "gap-3",
    },
    lg: {
      outer: "w-6 h-6",
      inner: "w-3 h-3",
      text: "text-base",
      gap: "gap-3",
    },
  };

  const s = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex flex-col ${className}`} role="radiogroup" aria-label={name}>
      {options.map((opt) => {
        const checked = selected === opt.value;
        return (
          <label
            key={opt.value}
            className={`flex items-start ${s.gap} ${optionClassName} cursor-pointer select-none p-2 rounded-md transition-colors duration-150 ${
              opt.disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-50"
            }`}
          >
            {/* Native input visually hidden but accessible */}
            <input
              className="sr-only"
              type="radio"
              name={name}
              value={opt.value}
              checked={checked}
              disabled={opt.disabled}
              onChange={() => !opt.disabled && handleChange(opt.value)}
              aria-checked={checked}
            />

            {/* Custom circle */}
            <span
              aria-hidden
              className={`flex items-center justify-center rounded-full border transition-all duration-150 ${s.outer} ${
                checked ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"
              } shrink-0`}
            >
              {/* inner dot */}
              <span
                className={`rounded-full transition-transform transform ${s.inner} ${
                  checked ? "scale-100 bg-white" : "scale-0 bg-transparent"
                }`}
              />
            </span>

            {/* Label + optional description */}
            <div className="flex flex-col">
              <span className={`${s.text} font-medium block`}>{opt.label}</span>
              {opt.desc && <span className="text-xs text-gray-500 mt-0.5">{opt.desc}</span>}
            </div>
          </label>
        );
      })}
    </div>
  );
}

export default CustomRadio;

// -------------------------
// Usage examples
// -------------------------

/*

// Controlled example
import React from 'react';
import CustomRadio from './CustomRadio';

function ControlledDemo() {
  const [choice, setChoice] = React.useState('upi');
  const opts = [
    { value: 'card', label: 'Credit / Debit Card', desc: 'Visa, MasterCard, etc.' },
    { value: 'upi', label: 'UPI', desc: 'Fast bank-to-bank payments' },
    { value: 'cod', label: 'Cash on Delivery', disabled: true },
  ];

  return (
    <div>
      <CustomRadio
        name="payment"
        options={opts}
        value={choice}
        onChange={(v) => setChoice(v)}
        size="md"
      />
      <div className="mt-2">Selected: {choice}</div>
    </div>
  );
}

// Uncontrolled example
function UncontrolledDemo() {
  const opts = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B', desc: 'This is B' },
  ];

  function handle(v) {
    console.log('selected', v);
  }

  return <CustomRadio name="demo" options={opts} defaultValue="b" onChange={handle} size="sm" />;
}

*/
