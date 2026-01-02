import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Search, Plus, X } from "lucide-react";
import {
  createActiveCampaignVendor,
  updateActiveCampaignVendor,
  deleteActiveCampaignVendor,
} from "../../features/activeCampaigns/activeCampaignsSlice";
import editIcon from "../../assets/icons/editPen.svg";
import CustomButton from "../CustomButton";
import CustomTextField from "../CustomTextField";

const VendorDropdown = ({
  isOpen,
  onClose,
  onSelect,
  selectedVendorId,
  triggerRef,
  formik,
}) => {
  const dispatch = useDispatch();
  const vendors = useSelector((state) => state.activeCampaigns.dropdowns.vendors);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const dropdownRef = useRef(null);

  const filteredVendors = useMemo(() => {
    if (!search) return vendors;
    const searchLower = search.toLowerCase();
    return vendors.filter(
      (vendor) => {
        const name = vendor.vendor_name || vendor.name || "";
        return name.toLowerCase().includes(searchLower) ||
          (vendor.id || "").toString().includes(search);
      }
    );
  }, [vendors, search]);

  // Position dropdown: width ≈ trigger width (all screens), overflow-safe
  useEffect(() => {
    if (isOpen && triggerRef?.current && dropdownRef?.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const dropdown = dropdownRef.current;

      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const spacing = 8;

      // width = trigger width, but not more than viewport - padding
      const maxWidth = viewportWidth - spacing * 2;
      const dropdownWidth = Math.min(triggerRect.width, maxWidth);

      dropdown.style.width = `${dropdownWidth}px`;

      // horizontal positioning
      let left = triggerRect.left;

      if (left + dropdownWidth > viewportWidth - spacing) {
        left = viewportWidth - dropdownWidth - spacing;
      }
      if (left < spacing) {
        left = spacing;
      }

      dropdown.style.left = `${left}px`;

      // default: open below trigger
      let top = triggerRect.bottom + spacing;
      dropdown.style.top = `${top}px`;

      // measure height then adjust if overflows bottom
      const dropdownHeight = dropdown.offsetHeight || 0;
      if (top + dropdownHeight > viewportHeight - spacing) {
        top = Math.max(
          spacing,
          viewportHeight - dropdownHeight - spacing
        );
      }

      dropdown.style.top = `${top}px`;
    }
  }, [isOpen, triggerRef]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef?.current &&
        !triggerRef.current.contains(event.target)
      ) {
        onClose();
        setShowAddForm(false);
        setEditingVendorId(null);
        setFormData({ name: "" });
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose, triggerRef]);

  const handleAddVendor = () => {
    if (formData.name.trim()) {
      dispatch(createActiveCampaignVendor(formData.name.trim()));
      setFormData({ name: "" });
      setShowAddForm(false);
    }
  };

  const handleEditVendor = (vendor) => {
    setEditingVendorId(vendor.id);
    setFormData({ name: vendor.vendor_name || vendor.name });
    setShowAddForm(false);
  };

  const handleUpdateVendor = (vendorId) => {
    if (formData.name.trim()) {
      dispatch(
        updateActiveCampaignVendor({
          id: vendorId,
          vendorName: formData.name.trim(),
        })
      );
      setFormData({ name: "" });
      setEditingVendorId(null);
    }
  };

  const handleDeleteVendor = (vendorId) => {
    dispatch(deleteActiveCampaignVendor(vendorId));
    if (formik.values.vendorId === vendorId.toString()) {
      formik.setFieldValue("vendorId", "");
    }
  };

  const handleResetForm = () => {
    setFormData({ name: "" });
    setEditingVendorId(null);
    setShowAddForm(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40  " onClick={onClose} />

      {/* Dropdown */}
      <div
        ref={dropdownRef}
        className="fixed z-50 bg-white rounded-xl shadow-lg border border-[#E1E3EA] max-h-[60vh] flex flex-col overflow-hidden"
      >
        {/* Search and Add Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 border-b border-[#F1F1F4]">
          <div className="relative flex-1">
            <div className="relative">
              <CustomTextField
                type="text"
                name="searchVendor"
                placeholder="Search vendor"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="mb-0"
                inputClassName="pl-9"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                style={{ marginTop: "2px" }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowAddForm(true);
              setEditingVendorId(null);
              setFormData({ name: "" });
            }}
            className="flex items-center gap-2 px-4 py-2 text-primary cursor-pointer rounded-lg transition sm:w-auto w-full justify-center"
          >
            <Plus className="w-4 h-4" color="#1b84ff" />
            <span className="text-primary font-medium">Add New Vendor</span>
          </button>
        </div>

        {/* Add Form at Top */}
        {showAddForm && !editingVendorId && (
          <div className="p-4 border-b border-[#F1F1F4]">
            <h3 className="font-semibold text-primary-dark mb-3">
              Add New Vendor
            </h3>
            <div className="space-y-3">
              <CustomTextField
                label="Vendor Name"
                type="text"
                name="vendorName"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ name: e.target.value })
                }
                placeholder="Enter vendor name"
                onClick={(e) => e.stopPropagation()}
                className="mb-0"
              />
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetForm();
                  }}
                  className="px-4 py-1.5 text-sm text-[#78829D] bg-gray-200 rounded-lg hover:text-gray-800 cursor-pointer transition"
                >
                  cancel
                </button>
                <div>
                  <CustomButton
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddVendor();
                    }}
                    className="!px-4 !py-1.5 !text-sm"
                    position=""
                  >
                    Add Vendor
                  </CustomButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vendor List */}
        <div className="flex-1 overflow-y-auto max-h-[300px] custom-scrollbar rounded-b-xl">
          {filteredVendors.length > 0 ? (
            <div className="divide-y divide-[#F1F1F4]">
              {filteredVendors.map((vendor) => (
                <div key={vendor.id}>
                  {editingVendorId !== vendor.id ? (
                    <div
                      className={`p-4 flex items-center justify-between hover:bg-gray-50 transition ${formik.values.vendorId === vendor.id.toString()
                          ? "bg-gray-100"
                          : ""
                        }`}
                    >
                      <span
                        className="text-primary-dark font-medium flex-1 cursor-pointer"
                        onClick={() => {
                          formik.setFieldValue(
                            "vendorId",
                            vendor.id.toString()
                          );
                          formik.setFieldTouched("vendorId", true);
                          onClose();
                        }}
                      >
                        {vendor.vendor_name || vendor.name}
                      </span>
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="p-1.5 rounded-full transition cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditVendor(vendor);
                          }}
                        >
                          <img src={editIcon} alt="Edit" className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 rounded-full transition cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVendor(vendor.id);
                          }}
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <CustomTextField
                          type="text"
                          name="editVendorName"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ name: e.target.value })
                          }
                          placeholder="Enter vendor name"
                          onClick={(e) => e.stopPropagation()}
                          className="mb-0 flex-1"
                          size="sm"
                          inputClassName="text-sm"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData({
                              name: vendor.vendor_name || vendor.name,
                            });
                            setEditingVendorId(null);
                          }}
                          className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap cursor-pointer"
                        >
                          Reset
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateVendor(vendor.id);
                          }}
                          className="text-xs sm:text-sm text-[#1b84ff] hover:underline whitespace-nowrap font-medium cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No vendors found
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VendorDropdown;
