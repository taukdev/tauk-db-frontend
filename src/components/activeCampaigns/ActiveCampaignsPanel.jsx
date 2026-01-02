// ActiveCampaignsPanel.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import plusIcon from "../../assets/icons/plus-icon.svg";
import tableHeaderIcon from "../../assets/icons/t-header-icon.svg";
import tableEye from "../../assets/icons/table-eye.svg";
import notepadEdit from "../../assets/icons/notepad-edit.svg";
import trush from "../../assets/icons/trush.svg";
import deletePopup from "../../assets/icons/delete-popup.svg";
import CustomButton from "../CustomButton";
import CustomTextField from "../CustomTextField";
import SearchBox from "../SearchBox";
import Pagination from "../common/Pagination";
import ShortIcon from "../../assets/icons/arrow-up-down.svg";
import ViewCampaignPopup from "./ViewCampaignPopup";
import CustomPopupModel from "../CustomPopupModel";
import {
  deleteActiveCampaign,
  updateActiveCampaign,
  fetchActiveCampaigns,
  fetchCampaignsDropdown,
  fetchActiveCampaignVendors,
  fetchTeams
} from "../../features/activeCampaigns/activeCampaignsSlice";

import Checkbox from "../common/Checkbox";
import LoadingSpinner from "../common/LoadingSpinner";
const sortOptions = [
  { label: "Vendor", value: "vendorName" },
  { label: "Assigned Team", value: "assignedTeam" },
  { label: "List ID", value: "listId" },
];

const ActiveCampaignsPanel = () => {
  const dispatch = useDispatch();
  const { campaigns, loading, pagination, dropdowns } = useSelector(
    (state) => state.activeCampaigns
  );
  const [search, setSearch] = useState("");
  // sorting state: sortBy is key, sortDir is "asc" | "desc" | null
  const [sortBy, setSortBy] = useState("vendorName");
  const [sortDir, setSortDir] = useState("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);

  // Fetch campaigns and dropdown data from API
  useEffect(() => {
    dispatch(fetchActiveCampaigns({ page: currentPage, limit: rowsPerPage }));
    dispatch(fetchCampaignsDropdown());
    dispatch(fetchTeams());
    dispatch(fetchActiveCampaignVendors());
  }, [dispatch, currentPage, rowsPerPage]);

  // Modal states
  const [showCampaignPanel, setShowCampaignPanel] = useState(false);
  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const [campaignToDelete, setCampaignToDelete] = useState(null);

  const filteredCampaigns = useMemo(() => {
    if (!search.trim()) return campaigns;

    const q = search.toLowerCase();

    return campaigns.filter((c) =>
      c.vendorName?.toLowerCase().includes(q) ||
      c.assignedTeam?.toLowerCase().includes(q) ||
      String(c.listId).includes(q) ||
      c.campaignNames?.some((name) =>
        name.toLowerCase().includes(q)
      )
    );
  }, [campaigns, search]);

  const totalItems = pagination?.total || 0;
  // If API handles pagination, paginatedCampaigns is just campaigns
  const paginatedCampaigns = filteredCampaigns;

  // header checkbox ref for indeterminate handling
  const headerRef = useRef(null);

  // header checked / indeterminate state
  const headerChecked =
    paginatedCampaigns.length > 0 &&
    paginatedCampaigns.every((c) => selected.includes(c.id));
  const headerIndeterminate =
    selected.length > 0 && selected.length < paginatedCampaigns.length;

  useEffect(() => {
    if (headerRef.current) {
      headerRef.current.indeterminate = !!headerIndeterminate;
    }
  }, [headerIndeterminate]);

  const toggleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(paginatedCampaigns.map((campaign) => campaign.id));
    } else {
      setSelected([]);
    }
  };

  const toggleSelectOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Generate options from campaigns data
  const vendorOptions = useMemo(() => {
    if (dropdowns.vendors && dropdowns.vendors.length > 0) {
      return dropdowns.vendors.map((v) => ({
        label: v.vendor_name || v.name,
        value: v.id,
      }));
    }
    const uniqueVendors = new Map();
    (campaigns || []).forEach((campaign) => {
      if (!uniqueVendors.has(campaign.vendorId)) {
        uniqueVendors.set(campaign.vendorId, {
          label: campaign.vendorName,
          value: campaign.vendorId,
        });
      }
    });
    return Array.from(uniqueVendors.values());
  }, [campaigns, dropdowns.vendors]);

  const teamOptions = useMemo(() => {
    if (dropdowns.teams && dropdowns.teams.length > 0) {
      return dropdowns.teams.map((team) => ({
        label: team.team_name || team.name || String(team.id || ""),
        value: team.id || team.value,
      }));
    }
    // Fallback to deriving from campaigns
    const uniqueTeams = new Set();
    (campaigns || []).forEach((campaign) => {
      if (campaign.assignedTeam) {
        uniqueTeams.add(campaign.assignedTeam);
      }
    });
    return Array.from(uniqueTeams).map((team) => ({
      label: team,
      value: team,
    }));
  }, [campaigns, dropdowns.teams]);

  const listIdOptions = useMemo(() => {
    if (dropdowns.listIds && dropdowns.listIds.length > 0) {
      return dropdowns.listIds.map((item) => ({
        label: item,
        value: item,
      }));
    }
    // Fallback to deriving from campaigns
    const uniqueListIds = new Set();
    (campaigns || []).forEach((campaign) => {
      if (campaign.listId) uniqueListIds.add(campaign.listId);
      if (campaign.campaignNames) {
        campaign.campaignNames.forEach((name) => uniqueListIds.add(name));
      }
    });
    return Array.from(uniqueListIds).map((listId) => ({
      label: listId,
      value: listId,
    }));
  }, [campaigns, dropdowns.listIds]);

  const handleViewCampaign = (campaign) => {
    setCurrentCampaign(campaign);
    setIsEditMode(false);
    setShowCampaignPanel(true);
  };

  const handleEditCampaign = (campaign) => {
    setCurrentCampaign(campaign);
    setIsEditMode(true);
    setShowCampaignPanel(true);
  };

  const handleDeleteCampaign = (campaign) => {
    setCampaignToDelete(campaign);
    setShowDeletePopup(true);
  };

  const handleSaveCampaign = (updatedData) => {
    dispatch(updateActiveCampaign(updatedData));
    setShowCampaignPanel(false);
    setCurrentCampaign(null);
  };

  const handleConfirmDelete = () => {
    if (campaignToDelete) {
      dispatch(deleteActiveCampaign(campaignToDelete.id));
      setShowDeletePopup(false);
      setCampaignToDelete(null);
    }
  };

  // Toggle sorting by clicking header (cycles none -> asc -> desc -> none)
  const toggleHeaderSort = (key) => {
    // if user clicks the same column, cycle direction
    if (sortBy !== key) {
      setSortBy(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortBy(null);
      setSortDir(null);
    }
    setCurrentPage(1);
  };

  // when sort dropdown changes, set sortBy and default direction asc
  const handleSortDropdownChange = (value) => {
    setSortBy(value);
    setSortDir(value ? "asc" : null);
    setCurrentPage(1);
  };

  useEffect(() => {
    // We don't want to reset currentPage on every search if search is local
    // But if search is server-side, we would.
    // For now, let's keep it simple as the user only asked for API integration of the provided endpoint.
  }, [search]);

  return (
    <div className="w-full overflow-x-auto lg:overflow-visible">
      <div className="bg-white rounded-custom-lg border border-secondary-lighter shadow-[0_3px_4px_rgba(0,0,0,0.03)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 px-3 sm:px-5 py-4">
          {/* Left: Sort by label + dropdown and Search Box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 flex-1 w-full sm:w-auto">
            {/* Sort by section */}
            <div className="flex items-center gap-2 sm:gap-3">
              <p className="text-xs font-semibold text-secondary uppercase tracking-wide flex items-center gap-1 whitespace-nowrap">
                <img src={ShortIcon} alt="Sort Icon" className="w-4 h-4" />
                Sort by
              </p>
              <div className="flex-1 sm:flex-initial">
                <CustomTextField
                  isSelect
                  size="sm"
                  value={sortBy || ""}
                  options={sortOptions}
                  onChange={(e) => handleSortDropdownChange(e.target.value)}
                  className="mb-0 w-full sm:w-auto min-w-[120px] sm:min-w-[150px]"
                />
              </div>
            </div>
            {/* Search Box */}
            <div className="flex items-center flex-1 sm:flex-initial sm:max-w-md">
              <SearchBox
                value={search}
                onChange={setSearch}
                placeholder="Search campaigns"
                className="w-full"
              />
            </div>
          </div>

          {/* Right: Add Button */}
          <div className="flex items-center w-full sm:w-auto">
            <Link to="/active-campaigns/add" className="w-full sm:w-auto">
              <CustomButton
                type="button"
                fullWidth={false}
                className="gap-2 flex items-center justify-center w-full sm:w-auto"
              >
                <img src={plusIcon} alt="Add" />
                <span className="whitespace-nowrap">Add New Campaign</span>
              </CustomButton>
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full table-auto  border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-input text-secondary text-[13px]">
                <th className="w-12 px-4 py-3 border border-light">
                  <Checkbox
                    ref={headerRef}
                    checked={headerChecked}
                    onChange={toggleSelectAll}
                  />
                </th>

                <th
                  onClick={() => toggleHeaderSort("listId")}
                  className="px-5 py-3 border border-light cursor-pointer"
                >
                  <div className="flex items-center gap-1">
                    List ID <img src={tableHeaderIcon} className="w-4 h-4" />
                  </div>
                </th>

                <th
                  onClick={() => toggleHeaderSort("vendorName")}
                  className="px-5 py-3 border border-light cursor-pointer whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    Vendor <img src={tableHeaderIcon} className="w-4 h-4" />
                  </div>
                </th>

                <th
                  onClick={() => toggleHeaderSort("assignedTeam")}
                  className="px-5 py-3 border border-light cursor-pointer whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    Assigned Team{" "}
                    <img src={tableHeaderIcon} className="w-4 h-4" />
                  </div>
                </th>

                <th className="w-28 px-4 py-3 border border-light text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center">
                    <LoadingSpinner text="Loading campaigns..." size="md" />
                  </td>
                </tr>
              ) : paginatedCampaigns.length > 0 ? (
                paginatedCampaigns.map((c) => (
                  <tr key={c.id || c.listId}>
                    <td className="w-12 px-4 py-6 border border-light text-center">
                      <Checkbox
                        checked={selected.includes(c.id)}
                        onChange={() => toggleSelectOne(c.id)}
                      />
                    </td>

                    <td className="px-5 py-6 border border-light">
                      <div
                        className="
                      flex flex-col          /* ALWAYS one column */
                      gap-2
                      lg:flex-row            /* Desktop only */
                      lg:flex-wrap
                    "
                      >
                        {/* List ID */}
                        <span
                          className="
                         inline-block
                         px-2 py-2
                         text-sm
                         font-semibold
                         text-primary-dark
                         border border-light
                         rounded-xl
                       bg-white
                         whitespace-nowrap
                         self-start        
                        "
                        >
                          {c.listId}
                        </span>

                        {/* Campaign Names */}
                        {c.campaignNames?.map((n, i) => (
                          <span
                            key={i}
                            className="
                          inline-block
                          px-2 py-2
                          text-sm
                          font-semibold
                          text-primary-dark
                          border border-light
                          rounded-xl
                        bg-white
                          whitespace-nowrap
                          self-start
                        "
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-5 py-6 border border-light text-primary font-medium decoration-dashed underline whitespace-nowrap">
                      <Link
                        to={`/vendor/${c.vendorId}`}
                        state={{
                          vendorName: c.vendorName,
                          vendorId: c.vendorId,
                        }}
                        className="break-words"
                      >
                        {c.vendorName}
                      </Link>
                    </td>

                    <td className="px-5 py-6 border border-light font-medium whitespace-nowrap">
                      {c.assignedTeam}
                    </td>

                    <td className="w-28 px-4 py-6 border border-light">
                      <div className="flex justify-center gap-3 cursor-pointer">
                        <img
                          src={tableEye}
                          onClick={() => handleViewCampaign(c)}
                        />
                        <img
                          src={notepadEdit}
                          onClick={() => handleEditCampaign(c)}
                        />
                        <img
                          src={trush}
                          onClick={() => {
                            setCampaignToDelete(c);
                            setShowDeletePopup(true);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-secondary">
                    No active campaigns found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(n) => {
            setRowsPerPage(n);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* View/Edit Campaign Popup */}
      <ViewCampaignPopup
        isOpen={showCampaignPanel}
        onClose={() => {
          setShowCampaignPanel(false);
          setCurrentCampaign(null);
        }}
        isEditMode={isEditMode}
        campaignData={currentCampaign}
        vendorOptions={vendorOptions}
        teamOptions={teamOptions}
        listIdOptions={listIdOptions}
        onSave={handleSaveCampaign}
      />

      {/* Delete Campaign Popup */}
      <CustomPopupModel
        isOpen={showDeletePopup}
        onClose={() => {
          setShowDeletePopup(false);
          setCampaignToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        image={deletePopup}
        title={`Delete Campaign`}
        titleMessage={`${campaignToDelete?.listId || ""}`}
        message="Are you sure you want to delete this campaign?"
        actionButtonName="Yes, Delete"
      />
    </div>
  );
};

export default ActiveCampaignsPanel;
