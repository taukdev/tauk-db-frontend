import React from "react";
import PropTypes from "prop-types";

const CustomButton = ({
  children,
  onClick,
  type = "button",
  className = "",
  position = "end", // 'start' | 'center' | 'end'
  fullWidth = false, // if true: full width always; otherwise: responsive
  disabled = false,
}) => {
  // Flex alignment for wrapper div
  const justifyClass = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
  }[position];

  // Responsive button width: always full if fullWidth, else full on mobile, auto on md+
  const widthClass = fullWidth ? "w-full" : "w-full md:w-auto";

  return (
    <div className={`w-full flex ${justifyClass}`}>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 cursor-pointer bg-gradient-primary text-white rounded-custom-md hover:opacity-90 transition !text-[14px] font-semibold ${widthClass} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {children}
      </button>
    </div>
  );
};

CustomButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  className: PropTypes.string,
  position: PropTypes.oneOf(["start", "center", "end"]),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default CustomButton;
