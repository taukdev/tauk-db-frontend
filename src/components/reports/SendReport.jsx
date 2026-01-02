// SendReport.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";

import tableHeaderIcon from "../../assets/icons/t-header-icon.svg";
import tableEye from "../../assets/icons/table-eye.svg";
import notepadEdit from "../../assets/icons/notepad-edit.svg";
import trush from "../../assets/icons/trush.svg";
import crossIcon from "../../assets/icons/cross-icon.svg";
import deletePopup from "../../assets/icons/delete-popup.svg";

import {
  setPerPage,
  toggleSelect,
  toggleSelectAllOnPage,
  setSearch as setReduxSearch,
  fetchSendReports,
} from "../../features/reports/SendReportSlice";

import CustomPopupModel from "../CustomPopupModel";
import CustomTextField from "../CustomTextField";
import ViewReportPopup from "../reports/ViewReportPopup";
import { setBreadcrumbs } from "../../features/breadcrumb/breadcrumbSlice";
import CustomButton from "../CustomButton";
import Pagination from "../common/Pagination";
import Checkbox from "../common/Checkbox";

const SendReport = () => {
  const dispatch = useDispatch();
  const {
    items = [],
    loading = false,
    search = "",
    page = 1,
    perPage = 10,
    selected = [],
    showPanel = false,
  } = useSelector((s) => s.sendReport || {});

  // Local UI / pagination state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showReportPanel, setShowReportPanel] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(perPage || 10);

  // Sorting config
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // options for popup
  const reportOptions = [
    { label: "Report A", value: "report_a" },
    { label: "Report B", value: "report_b" },
    { label: "Report C", value: "report_c" },
  ];

  const frequencyOptions = [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Yearly", value: "yearly" },
  ];

  // local filter drawer form state
  const [filterForm, setFilterForm] = useState({
    report: "", // report value (report_a/report_b...)
    email: "",
    scheduleType: "frequency", // 'frequency' | 'schedule'
    mailCount: "",
    frequency: "",
  });

  // fetch data on mount
  useEffect(() => {
    dispatch(fetchSendReports());
  }, [dispatch]);

  // set breadcrumbs on mount
  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: "Reports", path: "/report" },
        { label: "Send Report", path: "/report/send-report" },
      ])
    );
  }, [dispatch]);

  // sync perPage coming from redux if it changes externally
  useEffect(() => {
    if (perPage && perPage !== rowsPerPage) {
      setRowsPerPage(perPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perPage]);

  // local filtered list based on redux search
  const filtered = useMemo(() => {
    const q = (search || "").toString().trim().toLowerCase();
    if (!q) return items || [];
    return (items || []).filter((it) =>
      (it.report || "").toLowerCase().includes(q)
    );
  }, [items, search]);

  // local pagination calculations
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  // keep page bounds in sync
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages, currentPage]);

  // reset local page when redux search or rowsPerPage change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, rowsPerPage]);

  // header checkbox state for current page
  const paginatedItemsBase = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filtered.slice(start, end);
  }, [filtered, currentPage, rowsPerPage]);

  // Sorting helper
  const compareValues = (a, b) => {
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;

    const na = Number(a);
    const nb = Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;

    return String(a).localeCompare(String(b), undefined, {
      numeric: true,
      sensitivity: "base",
    });
  };

  // toggle sorting on given key
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return { key: null, direction: null };
    });
    setCurrentPage(1);
  };

  // produce sorted items for the current page
  const sortedFull = useMemo(() => {
    if (!sortConfig.key) return filtered;
    const s = [...filtered].sort((a, b) =>
      compareValues(a[sortConfig.key], b[sortConfig.key])
    );
    return sortConfig.direction === "asc" ? s : s.reverse();
  }, [filtered, sortConfig]);

  // now slice sortedFull for page
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedFull.slice(start, start + rowsPerPage);
  }, [sortedFull, currentPage, rowsPerPage]);

  // header checkbox state (all items on current page selected?)
  const headerChecked =
    paginatedItems.length > 0 &&
    paginatedItems.every((r) => selected.includes(r.id));

  // dispatch to redux for toggling select all on page: we pass the ids on current page
  const handleHeaderCheckbox = (checked) => {
    if (checked) {
      const allIds = paginatedItems.map((r) => r.id);
      dispatch(toggleSelectAllOnPage(allIds));
    } else {
      dispatch(toggleSelectAllOnPage([]));
    }
  };

  // helper to update filterForm
  const handleFilterChange = (e) => {
    const { name, value } = e.target || {};
    setFilterForm((prev) => ({ ...prev, [name]: value }));
  };

  // when Send Report clicked in drawer
  const handleSendReportFromDrawer = () => {
    // Replace this with whatever you need (dispatch an action / API call)
    console.log("Send Report with filters:", filterForm);
    // close drawer
    setShowFilterPanel(false);
  };

  return (
    <div className="overflow-x-auto lg:overflow-x-visible">
      <div className="text-primary-dark font-bold text-md mb-3">
        <h2 className="text-xl text-primary-dark font-medium">Scrub Report</h2>
      </div>

      <div className="bg-white rounded-2xl border border-[#E1E3EA] shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 border-b border-[#F1F1F4] py-5 px-5">
          <h2 className="text-md font-semibold text-primary-dark">Send Report</h2>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2 md:gap-3">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search lists by name or ID"
                value={search}
                onChange={(e) => dispatch(setReduxSearch(e.target.value))}
                className="w-full border border-gray-300 bg-neutral-input rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            <button
              onClick={() => setShowFilterPanel(true)}
              className="flex items-center justify-center sm:justify-start w-full sm:w-auto text-primary px-3 py-1.5 gap-1 border border-[#1B84FF33] rounded-[6px] bg-[#EFF6FF] cursor-pointer"
            >
              <Plus color="#1b84ff" />
              <span className="whitespace-nowrap">Search Report</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="min-w-[800px] md:min-w-full text-sm border-collapse table-fixed">
            <thead>
              <tr>
                <th className="w-15 min-w-10 text-center px-5 py-3 border border-light">
                  <Checkbox
                    checked={headerChecked}
                    onChange={(e) => handleHeaderCheckbox(e.target.checked)}
                    checkboxSize="w-4 h-4"
                  />
                </th>

                {[{ label: "Report", key: "report" },
                { label: "Recipients Email", key: "recipient" },
                { label: "Schedule Type", key: "scheduleType" }].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="pl-5 pr-2 py-3 border border-light text-left cursor-pointer select-none font-normal"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSort(col.key);
                      }
                    }}
                    aria-sort={
                      sortConfig.key === col.key
                        ? sortConfig.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <div className="flex gap-1 items-center">
                      {col.label}
                      <img
                        src={tableHeaderIcon}
                        alt="Sort"
                        className={`transition-transform ${
                          sortConfig.key === col.key
                            ? sortConfig.direction === "asc"
                              ? "rotate-0"
                              : "rotate-0"
                            : "opacity-40"
                        } w-4 h-4`}
                      />
                    </div>
                  </th>
                ))}

                <th
                  className="pl-5 pr-2 py-3 border border-light text-left"
                  style={{ width: 150 }}
                >
                  <div className="flex gap-1 items-center font-normal">Actions</div>
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedItems.map((r) => (
                <tr key={r.id}>
                  <td className="w-15 text-center px-5 py-3 border border-light">
                    <Checkbox
                      checked={selected.includes(r.id)}
                      onChange={() => dispatch(toggleSelect(r.id))}
                      checkboxSize="w-4 h-4"
                    />
                  </td>

                  <td className="pl-5 py-6 border border-light text-primary-dark font-medium">
                    {r.report}
                  </td>

                  <td className="pl-5 py-6 border border-light text-primary-dark font-medium">
                    {r.recipient}
                  </td>

                  <td className="pl-5 py-6 border border-light text-primary-dark font-medium">
                    {r.scheduleType}
                  </td>

                  <td className="p-3 border border-light text-primary-dark">
                    <div className="flex items-center justify-around">
                      <img
                        src={tableEye}
                        alt="view"
                        className="cursor-pointer"
                        onClick={() => {
                          setCurrentReport(r);
                          setIsEditMode(false);
                          setShowReportPanel(true);
                        }}
                      />

                      <img
                        src={notepadEdit}
                        alt="edit"
                        className="cursor-pointer"
                        onClick={() => {
                          setCurrentReport(r);
                          setIsEditMode(true);
                          setShowReportPanel(true);
                        }}
                      />

                      <img
                        src={trush}
                        alt="delete"
                        className="cursor-pointer"
                        onClick={() => {
                          setReportToDelete(r);
                          setShowDeletePopup(true);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer - reusable component */}
        <Pagination
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          totalItems={totalItems}
          onPageChange={(page) => setCurrentPage(page)}
          onRowsPerPageChange={(n) => {
            setRowsPerPage(n);
            setCurrentPage(1);
            dispatch(setPerPage(n));
          }}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </div>

      {/* ---------------- Filter Popup ---------------- */}
      {showFilterPanel && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setShowFilterPanel(false)}
          />

          <div className="fixed inset-0 m-6 lg:m-0 rounded-custom-lg lg:inset-auto lg:right-6 lg:top-6 lg:bottom-6 lg:min-w-[720px] bg-white shadow-xl border border-[#E1E3EA] lg:rounded-xl z-50 overflow-auto">
            <div className="flex justify-between items-center p-4 border-b border-[#F1F1F4]">
              <h2 className="text-primary-dark text-[16px] font-semibold">
                Filter
              </h2>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="text-gray-400 cursor-pointer text-xl p-1"
              >
                <img src={crossIcon} alt="Close" />
              </button>
            </div>

            <div className="px-4 lg:px-8 py-6 overflow-auto max-h-[calc(100vh-100px)]">
              <CustomTextField
                label="Report"
                placeholder="Select report"
                isSelect
                name="report"
                options={reportOptions}
                value={filterForm.report}
                onChange={handleFilterChange}
                className="pb-4"
              />

              <CustomTextField
                label="Recipients Email"
                name="email"
                placeholder="Enter recipients email"
                value={filterForm.email}
                onChange={handleFilterChange}
              />

              <div className="flex gap-4 items-center border-t border-[#F1F1F4] pt-2 mt-4">
                <span className="text-sm text-primary-dark font-medium">
                  Schedule Report
                </span>

                <CustomTextField
                  isRadio
                  name="scheduleType"
                  options={[
                    { label: "Frequency", value: "frequency" },
                    { label: "Schedule", value: "schedule" },
                  ]}
                  value={filterForm.scheduleType}
                  onChange={handleFilterChange}
                  className="!m-0 cursor-pointer"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <CustomTextField
                  label="Enter Mail Count"
                  name="mailCount"
                  min="0"
                  placeholder="Eg. 21"
                  type="number"
                  value={filterForm.mailCount}
                  onChange={handleFilterChange}
                />
                <CustomTextField
                  label="Frequency"
                  name="frequency"
                  placeholder="Select Frequency"
                  isSelect
                  options={frequencyOptions}
                  value={filterForm.frequency}
                  onChange={handleFilterChange}
                />
              </div>

              <CustomButton
                className="mt-15"
                type="button"
                onClick={handleSendReportFromDrawer}
              >
                Send Report
              </CustomButton>
            </div>
          </div>
        </>
      )}

      {/* ---------------- View Report Popup ---------------- */}
      <ViewReportPopup
        isOpen={showReportPanel}
        onClose={() => setShowReportPanel(false)}
        isEditMode={isEditMode}
        reportData={currentReport}
        reportOptions={reportOptions}
        frequencyOptions={frequencyOptions}
        onSave={(updatedData) => {
          console.log("Updated report:", updatedData);
        }}
      />

      {/* ---------------- Delete Popup ---------------- */}
      <CustomPopupModel
        isOpen={showDeletePopup}
        onClose={() => {
          setShowDeletePopup(false);
          setReportToDelete(null);
        }}
        onConfirm={() => {
          console.log("Deleting report:", reportToDelete);
          setShowDeletePopup(false);
          setReportToDelete(null);
        }}
        image={deletePopup}
        title="Delete Report"
        message="Are you sure you want to delete this report?"
        actionButtonName="Yes, Delete"
      />
    </div>
  );
};

export default SendReport;
