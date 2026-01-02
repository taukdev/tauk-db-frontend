import React from 'react';
import ReactDOM from 'react-dom';
import { X, Plus } from 'lucide-react'; 
import VendorImage from "../../assets/VendorAdd-image.svg"; 
import CustomButton from '../CustomButton';
import { useNavigate } from 'react-router-dom';

function VendorAddPopup({ isOpen, onClose, vendorName, username, password, vendorId }) {

  if (!isOpen) return null;
  const navigate = useNavigate();
  const handleViewProfile = () => {
    onClose();
    if (vendorId && vendorId !== 'null' && vendorId !== 'undefined') {
      navigate(`/vendor/${vendorId}`); 
    } else {
      navigate('/vendors');
    }
  };

  const handleClose = () => {
    onClose();
    navigate('/vendors');
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-center justify-center px-4 
                  bg-black/30 z-[99999]">
      <div className="bg-white rounded-2xl shadow-lg max-w-xl w-full relative flex flex-col">

        {/* Top row: content + illustration */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start px-6 pt-6 space-y-6 sm:space-y-0 sm:space-x-6">
          {/* Content */}
          <div className="flex-1 w-full">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            {/* Title */}
            <h1 className="font-bold text-lg text-primary-dark mb-4">Vendor has been added</h1>

            {/* Vendor details */}
            <div className="text-gray-600 mb-4 space-y-1 text-left">
              <p><span className='text-sm'>Name:</span> <span className="font-bold text-sm text-primary-dark">{vendorName}</span></p>
              <p><span className='text-sm'>Username:</span> <span className="font-bold text-sm text-primary-dark">{username}</span></p>
              <p><span className='text-sm'>Password:</span> <span className="font-bold text-sm text-primary-dark">{password}</span></p>
            </div>

            {/* View Vendor Profile */}
            <button
              onClick={handleViewProfile}
              className="text-primary border-b-2 border-dotted border-blue-500 pb-[1px] transition cursor-pointer 
                hover:opacity-90 text-sm sm:text-[14px]"
            >
              View Vendor Profile
            </button>

          </div>

          {/* Illustration */}
          <div className="mt-6 sm:mt-0 sm:ml-6 flex-shrink-0">
            <img src={VendorImage} alt="Vendor Illustration" className="w-40 h-40 sm:w-48 sm:h-48" />
          </div>
        </div>

        <hr className="border-[#DBDFE999]" />

        {/* Second row: responsive full-width button */}
        <div className="w-full border-gray-200 pt-3 p-4 sm:p-5 flex justify-center sm:justify-end">
          <CustomButton
            onClick={handleClose}
            className='flex items-center gap-1'
          >
            <Plus className="w-5 h-5" />
            Add Another Vendor
          </CustomButton>
        </div>

      </div>
    </div >,
    document.body
  );
}

export default VendorAddPopup;