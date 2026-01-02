// src/components/CustomPopupModel.jsx
import React from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import CrossIcon from "../assets/icons/cross-icon.svg";
import OffImage from "../assets/Off-image.svg";
import { clearAuth } from "../auth/authStorage.js";

export default function CustomPopupModel({
  isOpen,
  onClose,
  onConfirm,
  image,
  title,
  message,
  actionButtonName,
  isLogoutPopup = false,
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const displayImage = isLogoutPopup ? OffImage : image;
  const displayTitle = isLogoutPopup ? "Logout Account" : title;
  const displayMessage = isLogoutPopup
    ? "Are you sure you want to logout your account?"
    : message;
  const displayActionButtonName = isLogoutPopup ? "Yes, Logout" : actionButtonName;

  const handleConfirm = () => {
    // If this is logout popup, clear session and redirect to login
    if (isLogoutPopup) {
      try {
        clearAuth();
      } catch (err) {
        console.warn("Error clearing storage on logout:", err);
      }

      // call optional onConfirm callback (if parent wants to do extra work)
      if (typeof onConfirm === "function") onConfirm();

      // close modal (optional: parent may close when onConfirm is called)
      if (typeof onClose === "function") onClose();

      // navigate to login route
      navigate("/", { replace: true });
      return;
    }

    // Non-logout: just call onConfirm and/or close
    if (typeof onConfirm === "function") onConfirm();
    if (typeof onClose === "function") onClose();
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center px-4 bg-black/30 z-[99999]"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-lg max-w-[600px] w-full p-4 sm:p-6 md:p-8 text-center relative mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <img src={CrossIcon} alt="Close" className="w-8 h-8" />
        </button>

        {/* Illustration */}
        <div className="flex justify-center mb-6">
          <img
            src={displayImage}
            alt="Popup Illustration"
            className={`${isLogoutPopup ? "w-42" : "w-35"} ${isLogoutPopup ? "h-42" : "h-35"}`}
          />
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl px-2 inline-block font-bold">{displayTitle}</h2>

        {/* Subtitle */}
        <p className="text-gray-600 mb-8">{displayMessage}</p>

        {/* Action button */}
        <button
          onClick={handleConfirm}
          className="px-5 py-3 cursor-pointer bg-gradient-primary text-white rounded-custom-md hover:opacity-90 transition !text-[14px] font-semibold sm:text-base"
        >
          {displayActionButtonName}
        </button>
      </div>
    </div>,
    document.body
  );
}
