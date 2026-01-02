import React, { useState } from "react";
import { Search } from "lucide-react";
import MagnifyingImage from "../../../assets/magnifying-image.svg";

function VendorPayment() {
  const [search, setSearch] = useState("");

  return (
    <div className="mx-auto bg-white rounded-xl shadow-md mt-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 p-4">
        <h2 className="text-md text-primary-dark font-bold">Vendor Payments</h2>
        {/* Responsive Search Bar */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search lists by name or ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 bg-neutral-input rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        </div>
      </div>
      <hr className="border-t border-[#F1F1F4]" />

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <img
          src={MagnifyingImage}
          alt="No Payments" 
          className="h-20 w-20 md:h-40 md:w-40 mb-4"
        />
        <p className="text-sm md:text-md text-black font-medium">
          No Payments have been made for <br /> this vendor
        </p>
      </div>  
    </div>   
  );      
}      
               
export default VendorPayment;