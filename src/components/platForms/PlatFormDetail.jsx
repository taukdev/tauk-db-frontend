import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectPlatformById } from "../../features/platform/platformSlice";
import UnionIcon from "../../assets/icons/Union-icon.svg";
import { fetchPlatformDetail, clearPlatformDetail } from "../../features/platform/platformDetailSlice";

// Subcomponents
import PlatformOrders from "./detail/PlatformOrders";
import PlatformProfile from "./detail/PlatformProfile";
import PlatformNotes from "./detail/PlatformNotes";
import AddNoteForm from "./detail/AddNoteForm";
import { setBreadcrumbs } from "../../features/breadcrumb/breadcrumbSlice";

export default function PlatFormDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Try to find in list first, but rely on selectedPlatform from detail slice for truth
  const platformFromList = useSelector((state) => selectPlatformById(state, id));
  const { selectedPlatform, loading, error } = useSelector((state) => state.platformDetail);

  const platform = selectedPlatform || platformFromList;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Fetch detail on mount
  useEffect(() => {
    if (id) {
      dispatch(fetchPlatformDetail(id));
    }
    return () => {
      dispatch(clearPlatformDetail());
    };
  }, [dispatch, id]);

  // Auto-close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (platform) {
      dispatch(
        setBreadcrumbs([
          { label: "Platforms", path: "/platforms" },
          { label: platform.name || platform.platform_name || "Detail", path: `/platforms/${id}/` },
        ])
      );
    }
  }, [dispatch, platform, id]);


  if (!platform) {
    return <p className="p-4 text-red-500">Platform not found</p>;
  }

  return (
    <div className="p-0 space-y-3 xs:space-y-4 md:space-y-6">
      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Title + Subtitle */}
        <div className="space-y-1 xs:space-y-2">
          <div className="flex items-center gap-2">
          <button className="cursor-pointer"
            onClick={() => navigate("/platforms")}
          >
            <img src={UnionIcon} alt="Back" className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <h1 className="text-base xs:text-lg sm:text-xl md:text-2xl font-semibold text-primary-dark break-words">
            {platform.id} - {platform.name || platform.platform_name}
          </h1>
          </div>  
          <p className="text-xs xs:text-sm sm:text-base text-gray-500">
            Platform entered on {platform.enteredOn} @ 10:43:20
          </p>
        </div>

        {/* Dropdown Menu */}
        <div className="relative self-start sm:self-auto" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="px-3 py-2 text-sm bg-white hover:bg-gray-200 rounded-lg transition-colors border border-[#E1E3EA] flex items-center gap-2 w-full sm:w-auto cursor-pointer"
          >
            More Options
            <svg
              className="w-4 h-4 text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.585l3.71-3.354a.75.75 0 111.02 1.1l-4.22 3.814a.75.75 0 01-1.02 0L5.25 8.33a.75.75 0 01-.02-1.12z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-full sm:w-52 bg-white border border-[#E1E3EA] rounded-xl shadow-lg z-10 p-2">
              <button
                type="button"
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-primary-dark hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setMenuOpen(false);
                  navigate(`/platforms/${platform.id}/api-integrations`);
                }}
              >
                API Integrations
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-primary-dark hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setMenuOpen(false);
                  navigate(`/platforms/${platform.id}/send-leads`);
                }}
              >
                Send Leads
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Layout */}
  <div className="grid grid-cols-1 gap-3 xs:gap-4 md:gap-6">
  <div className="col-span-1 w-full">
    <PlatformOrders platformId={platform.id} />
  </div>
</div>

    </div>
  );
}
