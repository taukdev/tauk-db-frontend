// VendorLists.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import tableHeaderIcon from "../../../assets/icons/t-header-icon.svg";
import cloudUploadIcon from "../../../assets/icons/cloud-upload.svg";
import CustomButton from "../../CustomButton";
import Pagination from "../../common/Pagination";
import LoadingSpinner from "../../common/LoadingSpinner";
import CustomPopupModel from "../../CustomPopupModel";

import { getVendorListsApi, updateListStatusApi } from "../../../api/vendors";

const statusStyles = {
  Active: "bg-green-100 text-green-600 border border-[#17C65333]",
  Archived: "bg-yellow-100 text-yellow-600 border border-[#F6B10033]",
};

function VendorLists({ vendorName }) {
  const { id } = useParams();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [lists, setLists] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Modal state for archive/unarchive confirmation
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // sorting
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState(null);

  const fetchLists = async () => {
    try {
      setLoading(true);

      // Send vendorId and current activeTab (as listStatus) so backend
      // can filter server-side. activeTab is "active" or "archived".
      const res = await getVendorListsApi(
        currentPage,
        rowsPerPage,
        id,
        activeTab
      );

      let rawData = [];
      let paginationData = null;

      if (Array.isArray(res)) {
        rawData = res;
      } else if (res?.data && Array.isArray(res.data)) {
        rawData = res.data;
        paginationData = res.pagination;
      } else if (res?.data?.data && Array.isArray(res.data.data)) {
        rawData = res.data.data;
        paginationData = res.data.pagination || res.pagination;
      } else if (Array.isArray(res?.data?.lists)) {
        rawData = res.data.lists;
        paginationData = res.data.pagination || res.pagination;
      }

      const transformedData = rawData.map((item) => ({
        ...item,
        listName: item.listName || item.list_name || "-",
        dateAdded:
          item.dateAdded ||
          (item.date_entered
            ? new Date(item.date_entered).toLocaleDateString()
            : item.created_at
              ? new Date(item.created_at).toLocaleDateString()
              : "-"),
        // revshare: item.revshare || item.owner_revshare_percent || "0",
        vertical: item.vertical || item.list_vertical || "-",
        records: item.records || item.sell_times || 0,
        status: item.list_status
          ? item.list_status.charAt(0).toUpperCase() +
          item.list_status.slice(1).toLowerCase()
          : item.status || "Active",
      }));

      setLists(transformedData);
      setTotalItems(
        paginationData?.totalItems ||
        paginationData?.total ||
        res?.pagination?.totalItems ||
        res?.pagination?.total ||
        0
      );
    } catch (e) {
      setLists([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, [currentPage, rowsPerPage, activeTab, id]);

  // FILTER (Active / Archived)
  const filteredByStatus = useMemo(() => {
    const filtered = lists.filter((item) => {
      const status = (item.status || "").toLowerCase();
      if (activeTab === "active") {
        // Show Active, Pending, and any non-archived statuses (exclude only archived and inactive)
        const isArchived = status === "archived";
        const isInactive = status === "inactive";
        const statusMatch = !isArchived && !isInactive;
        return statusMatch;
      } else {
        // Show only Archived
        const statusMatch = status === "archived";
        return statusMatch;
      }
    });
    return filtered;
  }, [lists, activeTab]);

  // SEARCH
  const searchedData = useMemo(() => {
    if (!search) return filteredByStatus;

    const q = search.toLowerCase();
    return filteredByStatus.filter(
      (item) =>
        item.id?.toString().includes(q) ||
        item.listName?.toLowerCase().includes(q)
    );
  }, [filteredByStatus, search]);

  // SORT
  const headers = [
    "List ID",
    "List Name",
    "Date Added",
    "Vertical",
    "Status",
    "API",
    "Webhook",
    "Upload Data",
  ];

  const headerToAccessor = {
    "List ID": (i) => i.id,
    "List Name": (i) => i.listName,
    "Date Added": (i) => i.dateAdded,
    Vertical: (i) => i.vertical,
    Status: (i) => i.status,
    API: (i) => i.api || "",
    Webhook: (i) => i.webhook || "",
    "Upload Data": (i) => i.uploadData || "",
  };

  const toggleSort = (head) => {
    if (!headerToAccessor[head]) return;
    if (sortBy !== head) {
      setSortBy(head);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortBy(null);
      setSortDir(null);
    }
  };

  const sortedData = useMemo(() => {
    if (!sortBy || !sortDir) {
      return searchedData;
    }
    const accessor = headerToAccessor[sortBy];
    const sorted = [...searchedData].sort((a, b) =>
      String(accessor(a)).localeCompare(String(accessor(b)), undefined, {
        numeric: true,
      })
    );
    const result = sortDir === "asc" ? sorted : sorted.reverse();
    return result;
  }, [searchedData, sortBy, sortDir]);

  // UI
  return (
    <div className="w-full">
      <div className="bg-white rounded-custom-lg border border-secondary-lighter shadow-sm">
        {/* HEADER */}
        <div className="flex flex-wrap justify-between items-center px-5 py-4 gap-3">
          <div className="flex gap-6 items-center">
            <h2 className="text-sm font-semibold text-primary-dark">
              {vendorName}
            </h2>

            <button
              onClick={() => setActiveTab("active")}
              className={`pb-2 cursor-pointer ${activeTab === "active"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500"
                }`}
            >
              Active List
            </button>

            <button
              onClick={() => setActiveTab("archived")}
              className={`pb-2 cursor-pointer ${activeTab === "archived"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500"
                }`}
            >
              Archived List
            </button>
          </div>

          <div className="flex gap-3 items-center">
            <div className="relative w-72">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lists"
                className="w-full border border-gray-300 bg-neutral-input rounded-lg pl-10 pr-3 py-2 text-sm"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            <Link to={`/vendor/list-add/${id}`}>
              <CustomButton className="flex items-center gap-1">
                <Plus size={18} /> Add List
              </CustomButton>
            </Link>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead>
              <tr className="bg-neutral-input">
                {headers.map((head) => (
                  <th
                    key={head}
                    onClick={() => toggleSort(head)}
                    className="px-3 py-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-1 cursor-pointer text-secondary font-normal text-sm">
                      {head}
                      <img src={tableHeaderIcon} className="w-4 h-4" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="text-center py-6">
                    <LoadingSpinner text="Loading..." size="md" />
                  </td>
                </tr>
              )}

              {!loading && sortedData.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-6">
                    No records found
                  </td>
                </tr>
              )}

              {!loading && sortedData.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-4">{item.id}</td>
                  <td className="px-3 py-4 cursor-pointer text-primary">
                    <Link to={`/vendor/${id}/list/${item.id}`}
                      className="underline decoration-dashed underline-offset-4">
                      {item.listName}
                    </Link>
                  </td>
                  <td className="px-3 py-4">{item.dateAdded}</td>
                  <td className="px-3 py-4">{item.vertical}</td>
                  <td className="px-3 py-4">
                    <div className="inline-block">
                      {actionLoading === item.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <button
                          onClick={() => {
                            const isArchived = (item.status || "").toLowerCase() === "archived";
                            setPendingAction({
                              itemId: item.id,
                              itemName: item.listName,
                              isArchived,
                              newStatus: isArchived ? "active" : "archived",
                            });
                            setModalOpen(true);
                          }}
                          title={(item.status || "").toLowerCase() === "archived" ? "Unarchive" : "Archive"}
                          className={`px-3 py-1 rounded-full text-xs ${statusStyles[item.status]}`}
                        >
                          {item.status}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <Link to={`/vendor/list/${id}/api-posting-instruction`} className="text-primary underline decoration-dashed underline-offset-4">
                      Instructions
                    </Link>
                  </td>
                  <td className="px-3 py-4">
                    <Link to={`/vendor/list/${id}/webhook`} className="text-primary underline decoration-dashed underline-offset-4">
                      Webhook
                    </Link>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <Link
                      to={`/vendor/list/${item.id}/upload`}
                      className="inline-block cursor-pointer"
                      title="Upload CSV to this list"
                    >
                      <img src={cloudUploadIcon} className="w-5 h-5 mx-auto" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <Pagination
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(n) => {
            setRowsPerPage(n);
            setCurrentPage(1);
          }}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </div>

      {/* Archive/Unarchive Confirmation Modal */}
      <CustomPopupModel
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setPendingAction(null);
        }}
        onConfirm={async () => {
          if (!pendingAction) return;
          try {
            setActionLoading(pendingAction.itemId);
            await updateListStatusApi(pendingAction.itemId, pendingAction.newStatus);
            await fetchLists();
          } catch (err) {
            console.error("Error updating list status:", err);
          } finally {
            setActionLoading(null);
            setModalOpen(false);
            setPendingAction(null);
          }
        }}
        title={pendingAction?.isArchived ? "Unarchive List" : "Archive List"}
        message={pendingAction?.isArchived
          ? `Are you sure you want to unarchive "${pendingAction?.itemName}"?`
          : `Are you sure you want to archive "${pendingAction?.itemName}"?`
        }
        actionButtonName={pendingAction?.isArchived ? "Unarchive" : "Archive"}
      />
    </div>
  );
}

export default VendorLists;
