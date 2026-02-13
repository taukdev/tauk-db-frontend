// VendorList.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Search } from "lucide-react";
import { fetchVendors, searchVendors } from "../../features/vendor/vendorSlice";

import tableHeaderIcon from "../../assets/icons/t-header-icon.svg";
import CloudUploadIcon from "../../assets/icons/CloudUpload-icon.svg";
import CustomButton from "../CustomButton";
import Pagination from "../common/Pagination";
import { Link, useNavigate } from "react-router-dom";

import Checkbox from "../common/Checkbox";
import LoadingSpinner from "../common/LoadingSpinner";

const VendorList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const vendors = useSelector((state) => state.vendors.vendors || []);
  const pagination = useSelector((state) => state.vendors.pagination || { total: 0 });
  const loading = useSelector((state) => state.vendors.loading);
  const error = useSelector((state) => state.vendors.error);

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Track previous values to detect changes
  const prevRowsPerPageRef = useRef(rowsPerPage);

  // Map headers to vendor keys/accessors
  const headers = [
    "Vendor ID",
    "Vendor Name",
    "Entered On",
    "Status",
  ];

  // Use vendors directly from backend (already paginated)
  // No client-side pagination needed
  const displayVendors = Array.isArray(vendors) ? vendors : [];

  // Get totalItems from backend pagination
  const totalItems = pagination.total || 0;

  // Fetch vendors when page, rowsPerPage, or search changes
  useEffect(() => {
    const limit = rowsPerPage === "Unlimited" ? 1000 : Number(rowsPerPage);
    const searchTerm = search.trim();

    if (searchTerm) {
      // Use search API if search term exists
      dispatch(searchVendors({
        search: searchTerm,
        page: currentPage,
        limit: limit,
      }));
    } else {
      // Use regular fetch API if no search
      dispatch(fetchVendors({
        page: currentPage,
        limit: limit,
      }));
    }
  }, [dispatch, currentPage, rowsPerPage, search]);

  // Reset page when rowsPerPage or search changes
  useEffect(() => {
    const rowsPerPageChanged = prevRowsPerPageRef.current !== rowsPerPage;
    if (rowsPerPageChanged) {
      setCurrentPage(1);
      prevRowsPerPageRef.current = rowsPerPage;
    }
  }, [rowsPerPage]);

  // Reset page when search changes
  useEffect(() => {
    if (search && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [search]);

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(displayVendors.map((v) => v.id));
    } else {
      setSelected([]);
    }
  };

  const toggleSelectOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const statusStyles = {
    Active: "bg-green-100 text-green-600 border border-[#17C65333]",
    Pending: "bg-yellow-100 text-yellow-600 border border-[#F6B10033]",
    Inactive: "bg-red-100 text-red-600 border border-[#FF000033]",
  };
  const dotColors = {
    Active: "bg-green-500",
    Pending: "bg-yellow-500",
    Inactive: "bg-red-500",
  };

  return (
    <div className="overflow-x-auto lg:overflow-x-visible">
      <div className="bg-white rounded-custom-lg border border-secondary-lighter shadow-[0_3px_4px_rgba(0,0,0,0.03)]">
        {/* Header */}
        <div className="py-4 px-5 space-y-3">
          {/* Top Row: Search and Add Button */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search vendors by name or ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 bg-neutral-input rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            {/* Add Vendor */}
            <Link to="/vendors/add" className="w-full sm:w-auto">
              <CustomButton position="start" className="flex items-center gap-1">
                <Plus className="w-5 h-5" />
                Add Vendor
              </CustomButton>
            </Link>
          </div>

        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="min-w-[800px] md:min-w-full text-sm border-collapse table-fixed">
            <thead>
              <tr className="text-secondary bg-neutral-input text-left text-[13px]">
                {/* Select All Checkbox */}
                <th className="min-w-10 text-center px-3 py-3 border border-light">
                  <Checkbox
                    checked={
                      selected.length === displayVendors.length &&
                      displayVendors.length > 0
                    }
                    onChange={toggleSelectAll}
                    checkboxSize="w-4 h-4"
                  />
                </th>

                {headers.map((head) => (
                  <th
                    key={head}
                    className="pl-5 pr-2 py-3 border border-light font-normal"
                  >
                    <div className="flex gap-1 items-center font-normal">
                      <span>{head}</span>
                      <img
                        src={tableHeaderIcon}
                        alt="Sort"
                        className="w-4 h-4 opacity-60"
                      />
                    </div>
                  </th>
                ))}

                <th className="pl-5 pr-2 py-3 border border-light font-normal">
                  Upload CSV
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={headers.length + 2} className="py-20 text-center">
                    <LoadingSpinner text="Loading vendors..." size="md" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={headers.length + 2} className="py-20 text-center text-red-500 text-base">
                    Error loading vendors: {typeof error === 'string' ? error : JSON.stringify(error)}
                  </td>
                </tr>
              ) : displayVendors.length === 0 ? (
                <tr>
                  <td colSpan={headers.length + 2} className="py-20 text-center text-secondary text-base">
                    No vendors found.
                  </td>
                </tr>
              ) : (
                displayVendors.map((vendor) => (
                  <tr key={vendor.id} className="bg-white hover:bg-neutral-light transition-colors">
                    {/* Row Checkbox */}
                    <td className="min-w-10 text-center px-3 py-6 border border-light">
                      <Checkbox
                        checked={selected.includes(vendor.id)}
                        onChange={() => toggleSelectOne(vendor.id)}
                        checkboxSize="w-4 h-4"
                      />
                    </td>

                    <td className="pl-5 py-6 border border-light font-medium">
                      {vendor.id}
                    </td>

                    <td className="pl-5 py-6 border border-light text-primary font-medium underline decoration-dashed underline-offset-4">
                      <Link to={`/vendor/${vendor.id}`}>{vendor.name}</Link>
                    </td>

                    <td className="pl-5 py-6 border border-light font-medium">
                      {vendor.enteredOn}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-6 border border-light font-medium">
                      <span
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs w-fit ${statusStyles[vendor.status] ||
                          "bg-gray-100 text-gray-600"
                          }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${dotColors[vendor.status] || "bg-gray-400"
                            }`}
                        ></span>
                        {vendor.status}
                      </span>
                    </td>

                    {/* Upload */}
                    <td className="p-3 border border-light">
                  
                        <div 
                          className="w-full h-full flex items-center justify-center cursor-pointer"
                          onClick={() => navigate(`/vendor/${vendor.id}`)}
                          title="Click to view vendor lists and upload CSV"
                        >
                          <img
                            src={CloudUploadIcon}
                            alt="Upload CSV"
                            className="inline-block"
                          />
                        </div>
                    
                    </td>
                  </tr>
                )
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          totalItems={totalItems}
          onPageChange={(page) => setCurrentPage(page)}
          onRowsPerPageChange={(n) => {
            setRowsPerPage(n);
            setCurrentPage(1);
          }}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </div>
    </div>
  );
};

export default VendorList;
