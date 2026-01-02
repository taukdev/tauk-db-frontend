import React, { useState, useEffect, useMemo } from "react";
import tableHeaderIcon from "../../assets/icons/t-header-icon.svg";
import NotepadIcon from "../../assets/icons/notepad-icon.svg";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import CustomTextField from "../CustomTextField";
import { useSelector, useDispatch } from "react-redux";
import CustomButton from "../CustomButton";
import Checkbox from "../common/Checkbox"; // shared checkbox
import { getPlatformsApi } from '../../api/platforms';
import { fetchPriorityPosts } from '../../features/outgoing/priorityPostsSlice';

function PriorityPosts() {
  const dispatch = useDispatch();
  const sectionsFromStore = useSelector(
    (state) => state.priorityPosts.sections
  );
  const { loading, error } = useSelector(
    (state) => state.priorityPosts
  );
  const [sections, setSections] = useState(sectionsFromStore);
  const [isFilterApplied, setIsFilterApplied] = useState(false);

  // sidebar filter states - declared early so they can be used in useMemo
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [statusFilters, setStatusFilters] = useState({
    Active: false,
    Archived: false,
    Paused: false,
    Fulfilled: false,
  });

  // Fetch priority posts on mount (without filters initially)
  useEffect(() => {
    if (!isFilterApplied) {
      dispatch(fetchPriorityPosts({}));
    }
  }, [dispatch, isFilterApplied]);

  // Sorting state mapped by "sectionId-positionId"
  const [sortState, setSortState] = useState({});

  // header → accessor mapping
  const headerAccessors = {
    ID: (r) => r.id,
    Platform: (r) => r.platform,
    Created: (r) => r.created,
    Integration: (r) => r.integration,
    Posted: (r) => r.posted,
    "Posted Today": (r) => r.postedToday,
    "Order Cap": (r) => r.orderCap,
    "Daily Cap": (r) => r.dailyCap,
    Status: (r) => r.status,
  };

  // sorting comparator
  const comparator = (a, b) => {
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;

    const aNum = Number(a);
    const bNum = Number(b);
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;

    return String(a).localeCompare(String(b), undefined, { numeric: true });
  };

  // toggles sorting for a specific position table
  const toggleSort = (uniqueKey, head) => {
    setSortState((prev) => {
      const current = prev[uniqueKey] || {};
      let newDir = null;

      if (current.sortBy !== head) newDir = "asc";
      else if (current.sortDir === "asc") newDir = "desc";
      else if (current.sortDir === "desc") newDir = null;

      return {
        ...prev,
        [uniqueKey]: newDir
          ? { sortBy: head, sortDir: newDir }
          : { sortBy: null, sortDir: null },
      };
    });
  };

  // updates local expanded state after store refresh
  useEffect(() => {
    setSections((prevSections) => {
      return sectionsFromStore.map((newSection) => {
        const prevSection = prevSections.find(
          (s) => s.sectionId === newSection.sectionId
        );
        if (!prevSection) {
          // New section - keep default expanded state from API (Position 1 expanded)
          return newSection;
        }

        return {
          ...newSection,
          positions: newSection.positions.map((newPos, posIndex) => {
            const prevPos = prevSection.positions.find(
              (p) => p.positionId === newPos.positionId
            );
            // Preserve expanded state if position exists, otherwise use default (first position expanded)
            return {
              ...newPos,
              isExpanded: prevPos ? prevPos.isExpanded : (posIndex === 0),
            };
          }),
        };
      });
    });
  }, [sectionsFromStore]);

  // Client-side filtering function (fallback if API doesn't support filters)
  const filterSections = (sectionsData) => {
    if (!selectedPlatform && !Object.values(statusFilters).some(v => v)) {
      return sectionsData;
    }

    return sectionsData.map(section => {
      const filteredPositions = section.positions.map(position => {
        const filteredData = position.data.filter(row => {
          // Platform filter - check platformId field or extract from platform
          if (selectedPlatform) {
            const rowPlatformId = row.platformId || 
              (typeof row.platform === 'object' ? row.platform?.id : null);
            if (!rowPlatformId || String(rowPlatformId) !== String(selectedPlatform)) {
              return false;
            }
          }

          // Status filter
          const activeStatuses = Object.keys(statusFilters).filter(key => statusFilters[key]);
          if (activeStatuses.length > 0) {
            if (!activeStatuses.includes(row.status)) {
              return false;
            }
          }

          return true;
        });

        return {
          ...position,
          data: filteredData
        };
      }).filter(position => position.data.length > 0); // Remove positions with no data

      return {
        ...section,
        positions: filteredPositions
      };
    }).filter(section => section.positions.length > 0); // Remove sections with no positions
  };

  // Apply filters
  const handleFilterClick = () => {
    setIsFilterApplied(true);
    
    const params = {};
    
    if (selectedPlatform) {
      params.platform_id = selectedPlatform;
    }

    // Add status filter if any is selected
    const activeStatuses = Object.keys(statusFilters).filter(key => statusFilters[key]);
    if (activeStatuses.length > 0) {
      params.status = activeStatuses.join(',');
    }

    dispatch(fetchPriorityPosts(params));
  };

  // Clear filters
  const handleClearFilters = () => {
    setSelectedPlatform("");
    setStatusFilters({
      Active: false,
      Archived: false,
      Paused: false,
      Fulfilled: false,
    });
    setIsFilterApplied(false);
    dispatch(fetchPriorityPosts({}));
  };

  // Get filtered sections for display - always apply client-side filtering if filters are set
  const displaySections = useMemo(() => {
    // Check if any filter is active
    const hasPlatformFilter = selectedPlatform && selectedPlatform !== "";
    const hasStatusFilter = Object.values(statusFilters).some(v => v);
    const hasActiveFilters = hasPlatformFilter || hasStatusFilter;
    
    // Always apply client-side filtering when filters are active
    // This ensures filtering works even if API doesn't support it
    if (hasActiveFilters && sections.length > 0) {
      return filterSections(sections);
    }
    
    // Otherwise show all sections
    return sections;
  }, [sections, selectedPlatform, statusFilters]);

  // expand/collapse a position
  const togglePosition = (sectionIndex, positionIndex) => {
    setSections((prevSections) => {
      const newSections = prevSections.map((section, sIdx) => {
        if (sIdx !== sectionIndex) return section;
        
        return {
          ...section,
          positions: section.positions.map((pos, idx) => ({
            ...pos,
            isExpanded: idx === positionIndex ? !pos.isExpanded : false,
          })),
        };
      });
      
      return newSections;
    });
  };

  // status style
  const getStatusStyle = (status) => {
    switch (status) {
      case "Active":
        return "bg-[#E6FFF2] text-[#13C37B]";
      case "Inactive":
        return "bg-[#FFF2E6] text-[#FF8C00]";
      case "Pending":
        return "bg-[#E6F3FF] text-primary";
      case "Suspended":
        return "bg-[#FFE6E6] text-[#FF4444]";
      default:
        return "bg-[#F5F5F5] text-[#666666]";
    }
  };

  // State for platforms dropdown
  const [platformOptions, setPlatformOptions] = useState([
    { label: "Select Platforms...", value: "" },
  ]);
  const [platformsLoading, setPlatformsLoading] = useState(true);

  // Fetch platforms on component mount
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        setPlatformsLoading(true);
        const response = await getPlatformsApi();
        
        // Handle different response structures
        let platformsData = [];
        if (Array.isArray(response)) {
          platformsData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          platformsData = response.data;
        } else if (response?.data?.platforms && Array.isArray(response.data.platforms)) {
          platformsData = response.data.platforms;
        }

        // Format platforms for dropdown
        const formattedPlatforms = platformsData.map((platform) => ({
          label: platform.platform_name || platform.name || String(platform.id || ""),
          value: String(platform.id || "")
        }));

        setPlatformOptions([
          { label: "Select Platforms...", value: "" },
          ...formattedPlatforms
        ]);
      } catch (error) {
        console.error("Error fetching platforms:", error);
        // Keep default option on error
      } finally {
        setPlatformsLoading(false);
      }
    };

    fetchPlatforms();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full">
      {/* LEFT LARGE COLUMN */}
      <div className="lg:col-span-2">
        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-custom-lg border border-[#E4E6EF] shadow-sm p-8 text-center">
            <p className="text-gray-500">Loading priority posts...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white rounded-custom-lg border border-[#E4E6EF] shadow-sm p-8 text-center">
            <p className="text-red-500">Error: {error}</p>
          </div>
        )}

        {/* Data Display */}
        {!loading && !error && (
          <div className="space-y-6">
            {displaySections.length === 0 ? (
              <div className="bg-white rounded-custom-lg border border-[#E4E6EF] shadow-sm p-8 text-center">
                <p className="text-gray-500">No priority posts found.</p>
              </div>
            ) : (
              displaySections.map((section, sectionIndex) => (
            <div
              key={section.sectionId}
              className="bg-white rounded-custom-lg border border-[#E4E6EF] shadow-sm"
            >
              {/* SECTION TITLE */}
              <div className="p-4 border-b border-[#E4E6EF]">
                <h3 className="text-md font-semibold text-primary-dark">
                  {section.sectionTitle}
                </h3>
              </div>

              {/* POSITIONS */}
              <div className="p-4 space-y-4">
                {section.positions.map((position, positionIndex) => {
                  const uniqueKey = `${section.sectionId}-${position.positionId}`;
                  const sortInfo = sortState[uniqueKey] || {};
                  const headers = [
                    "ID",
                    "Platform",
                    "Created",
                    "Integration",
                    "Posted",
                    "Posted Today",
                    "Order Cap",
                    "Daily Cap",
                    "Status",
                    "Modify",
                  ];

                  // apply sorting to rows
                  let sortedRows = [...position.data];
                  if (sortInfo.sortBy && sortInfo.sortDir) {
                    const accessor = headerAccessors[sortInfo.sortBy];
                    sortedRows.sort((a, b) =>
                      comparator(accessor(a), accessor(b))
                    );
                    if (sortInfo.sortDir === "desc") sortedRows.reverse();
                  }

                  return (
                    <div
                      key={position.positionId}
                      className="border border-[#E4E6EF] rounded-custom-lg"
                    >
                      {/* POSITION TOGGLER */}
                      <div
                        className="flex justify-between items-center p-4 cursor-pointer"
                        onClick={() =>
                          togglePosition(sectionIndex, positionIndex)
                        }
                      >
                        <h4 className="font-medium text-primary-dark">
                          {position.positionId}
                        </h4>
                        <div className="text-secondary">
                          {position.isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>

                      {/* TABLE */}
                      {position.isExpanded && position.data.length > 0 && (
                        <div className="px-4 pb-4">
                          <div className="overflow-x-auto rounded-custom-lg border border-light">
                            <table className="w-full text-sm border-collapse">
                              <thead>
                                <tr className="text-secondary bg-neutral-input text-left text-xs">
                                  {headers.map((head) => {
                                    const sortable =
                                      !!headerAccessors[head];
                                    const isActive =
                                      sortInfo.sortBy === head;

                                    return (
                                      <th
                                        key={head}
                                        className={`px-3 py-3 border border-light font-normal ${
                                          sortable
                                            ? "cursor-pointer select-none"
                                            : ""
                                        }`}
                                        onClick={() =>
                                          sortable &&
                                          toggleSort(uniqueKey, head)
                                        }
                                      >
                                        <div className="flex gap-1 items-center">
                                          <span>{head}</span>
                                          <img
                                            src={tableHeaderIcon}
                                            alt="Sort"
                                            className={`w-3 h-3 transition-transform ${
                                              sortable
                                                ? isActive
                                                  ? sortInfo.sortDir === "asc"
                                                    ? "rotate-0"
                                                    : "rotate-0"
                                                  : "opacity-50"
                                                : "opacity-30"
                                            }`}
                                          />
                                        </div>
                                      </th>
                                    );
                                  })}
                                </tr>
                              </thead>

                              <tbody>
                                {sortedRows.map((row) => (
                                  <tr
                                    key={row.id}
                                    className="bg-white hover:bg-gray-50"
                                  >
                                    {/* ID */}
                                    <td className="px-3 py-4 border border-light text-primary underline">
                                      <Link
                                        to={`/outgoing-post/${row.id}/modify`}
                                      >
                                        {row.id}
                                      </Link>
                                    </td>

                                    {/* Platform */}
                                    <td className="px-3 py-4 border border-light text-primary underline cursor-pointer">
                                      {row.platformId ? (
                                        <Link to={`/platforms/${row.platformId}`}>
                                          {row.platform}
                                        </Link>
                                      ) : (
                                        row.platform
                                      )}
                                    </td>

                                    {/* Created */}
                                    <td className="px-3 py-4 border border-light text-[#071437] font-medium">
                                      {row.created}
                                    </td>

                                    {/* Integration */}
                                    <td className="px-5 py-4 border border-light text-[#071437] font-medium">
                                      {row.integration}
                                    </td>

                                    {/* Posted */}
                                    <td className="px-5 py-4 border border-light text-[#071437] font-medium">
                                      {typeof row.posted === 'number' ? row.posted.toLocaleString() : row.posted}
                                    </td>

                                    {/* Posted Today */}
                                    <td className="px-5 py-4 border border-light text-[#071437] font-medium">
                                      {row.postedToday}
                                    </td>

                                    {/* Order Cap */}
                                    <td className="px-5 py-4 border border-light text-[#071437] font-medium">
                                      {row.orderCap}
                                    </td>

                                    {/* Daily Cap */}
                                    <td className="px-5 py-4 border border-light text-[#071437] font-medium">
                                      {row.dailyCap}
                                    </td>

                                    {/* Status */}
                                    <td className="px-5 py-4 border border-light">
                                      <span
                                        className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap border border-[#17C65333] ${getStatusStyle(
                                          row.status
                                        )}`}
                                      >
                                        ● {row.status}
                                      </span>
                                    </td>

                                    {/* Modify */}
                                    <td className="px-5 py-4 border border-light">
                                      <Link
                                        to={`/outgoing-post/${row.id}/modify`}
                                      >
                                        <button className="cursor-pointer hover:bg-gray-100 p-1 rounded">
                                          <img
                                            src={NotepadIcon}
                                            alt="Edit"
                                            className="w-5 h-5"
                                          />
                                        </button>
                                      </Link>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
            )}
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR FILTERS */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-custom-lg border border-secondary-lighter shadow-sm p-5">
          <h3 className="text-md font-semibold text-primary-dark mb-4">
            Filter Orders...
          </h3>

          <div className="border-t border-[#E4E6EF] -mx-5 mb-2" />

          {/* SELECT PLATFORMS */}
          <div className="mb-4">
            <p className="text-sm font-medium text-primary-dark mb-2">
              Select Platforms
            </p>
            <CustomTextField
              isSelect
              placeholder={platformsLoading ? "Loading platforms..." : "Select Platforms..."}
              size="sm"
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              options={platformOptions}
              disabled={platformsLoading}
            />
          </div>

          {/* STATUS FILTERS */}
          <div className="mb-4">
            <p className="text-sm font-medium text-primary-dark mb-2">
              Platform Status
            </p>

            {Object.keys(statusFilters).map((key) => (
              <label key={key} className="flex items-center gap-2 select-none">
                <Checkbox
                  checked={statusFilters[key]}
                  onChange={(e) =>
                    setStatusFilters((prev) => ({
                      ...prev,
                      [key]: e.target.checked,
                    }))
                  }
                  checkboxSize="w-4 h-4"
                />
                <span className="text-primary-dark">{key}</span>
              </label>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <CustomButton
              type="submit"
              className="py-2 w-full"
              onClick={handleFilterClick}
              disabled={loading}
            >
              {loading ? "Filtering..." : "Filter Posts"}
            </CustomButton>
            
            {(selectedPlatform || Object.values(statusFilters).some(v => v)) && (
              <CustomButton
                type="button"
                className="py-2 w-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={handleClearFilters}
                disabled={loading}
              >
                Clear Filters
              </CustomButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PriorityPosts;
