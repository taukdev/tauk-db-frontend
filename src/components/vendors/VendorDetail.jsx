import React, { useEffect, useRef, useState, useMemo } from "react";
import VendorListing from "./detail/VendorListing";
import VendorProfile from "./detail/VendorProfile";
import VendorNotes from "./detail/VendorNotes";
import VendorPayment from "./detail/VendorPayment";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectVendorById, fetchVendorById } from "../../features/vendor/vendorSlice";
import { setBreadcrumbs } from "../../features/breadcrumb/breadcrumbSlice";
import UnionIcon from "../../assets/icons/Union-icon.svg";

/**
 * DropdownMenu - unchanged behavior, opens small menu for additional actions
 */
function DropdownMenu({ vendor }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = React.useRef(null);
  const navigate = useNavigate();

  const options = [
    { label: "Add New List", value: "", to: `/vendor/list-add/${vendor?.id}` },
    vendor?.id && {
      label: "API Instructions",
      value: "",
      to: `/vendor/list/${vendor.id}/api-posting-instruction`
    },
  ].filter(Boolean);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative self-start sm:self-auto" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className="px-3 py-2 text-sm bg-white hover:bg-gray-100 rounded-lg transition-colors border border-[#E1E3EA] flex items-center justify-between gap-2 w-full sm:w-auto cursor-pointer"
      >
        More options
        <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.585l3.71-3.354a.75.75 0 111.02 1.1l-4.22 3.814a.75.75 0 01-1.02 0L5.25 8.33a.75.75 0 01-.02-1.12z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {menuOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-full sm:w-52 bg-white border border-[#E1E3EA] rounded-xl shadow-lg z-10 p-2 cursor-pointer">
          {options.map((option, index) => (
            <button
              key={index}
              type="button"
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-primary-dark hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                setMenuOpen(false);
                navigate(option.to);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * VendorDetail - shows vendor header using location.state (fast) or redux fallback.
 * No other files need changes; this will show name when navigating from ActiveCampaigns
 * that passes state: { vendorName }.
 */
function VendorDetail() {
  const { id } = useParams(); // expects route like /vendor/:id
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // fast path: vendorName passed via Link state (ActiveCampaigns should pass this)
  const passedVendorName = location?.state?.vendorName || null;
  const passedVendorId = location?.state?.vendorId || null;

  const loading = useSelector((state) => state.vendors.loading);

  const vendorFromStore = useSelector((state) =>
    selectVendorById(state, id) || selectVendorById(state, Number(id)) || null
  );

  // Derived display name: prefer passed state, then store value
  const displayName = useMemo(() => {
    return passedVendorName || vendorFromStore?.name || null;
  }, [passedVendorName, vendorFromStore]);

  // Build vendor object to pass to child components:
  // - prefer full vendorFromStore if available
  // - otherwise keep minimal object so children won't crash
  const vendor = useMemo(() => {
    if (vendorFromStore) return vendorFromStore;
    // if we have a passed name or id, create a minimal vendor object
    if (passedVendorName || passedVendorId || id) {
      return {
        id: passedVendorId || id,
        name: passedVendorName || "-",
        enteredOn: null,
      };
    }
    return null;
  }, [vendorFromStore, passedVendorName, passedVendorId, id]);

  // Nicely format enteredOn if available
  const enteredOnText = useMemo(() => {
    const raw = vendor?.enteredOn;
    if (!raw) return null;
    try {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        return `${d.toLocaleDateString()} @ ${d.toLocaleTimeString()}`;
      }
      return String(raw);
    } catch {
      return String(raw);
    }
  }, [vendor]);

  // Fetch vendor by ID if not in store
  useEffect(() => {
    if (!vendorFromStore && id) {
      dispatch(fetchVendorById(id));
    }
  }, [id, vendorFromStore, dispatch]);

  // Update breadcrumbs when we have displayName/vendor
  useEffect(() => {
    if (displayName) {
      dispatch(
        setBreadcrumbs([
          { label: "Vendors", path: "/vendors" },
          { label: `${vendor?.id} - ${displayName}`, path: `/vendor/${vendor?.id}` },
        ])
      );
    }
  }, [dispatch, displayName, vendor?.id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <button className="cursor-pointer"
              onClick={() => navigate("/vendors")}
            >
              <img src={UnionIcon} alt="Back" className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <h1 className="text-xl font-semibold">
              {vendor?.id} - {displayName || (loading ? "Loading..." : "-")}
            </h1>
          </div>
          <p className="text-gray-500 text-sm">
            {enteredOnText ? `Vendor entered on ${enteredOnText}` : (loading ? "Fetching details..." : "No entry date available")}
          </p>
        </div>

        {/* Dropdown */}
        <DropdownMenu vendor={vendor} />
      </div>

      {/* Layout - Orders + Profile/Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Section (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="sticky top-0">
            <VendorListing vendorId={vendor?.id} vendorName={displayName} />
            <VendorPayment />
          </div>
        </div>

        {/* Right Sidebar (Profile + Notes + Add Note) */}
        <div className="flex flex-col gap-6">
          <VendorProfile vendor={vendor} />
          <VendorNotes vendorId={vendor?.id} />
        </div>
      </div>
    </div>
  );
}

export default VendorDetail;
