import React, { useEffect, useState, useRef, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown } from "lucide-react";
import CustomTextField from "../CustomTextField";
import CustomButton from "../CustomButton";
import { setBreadcrumbs } from "../../features/breadcrumb/breadcrumbSlice";
import {
  addCampaign,
  createActiveCampaign,
  fetchCampaignsDropdown,
  fetchTeams,
  fetchActiveCampaignVendors
} from "../../features/activeCampaigns/activeCampaignsSlice";
import leftArrow from "../../assets/left-arrow.svg";
import VendorDropdown from "./VendorDropdown";
import TeamDropdown from "./TeamDropdown";

const AddNewCampaign = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { campaigns, dropdowns } = useSelector((state) => state.activeCampaigns);
  const vendors = dropdowns.vendors;
  
  // Dropdown states
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);

  // Local teams state (since teams are stored in campaigns)
  const [localTeams, setLocalTeams] = useState([]);

  // Refs for positioning dropdowns
  const vendorTriggerRef = useRef(null);
  const teamTriggerRef = useRef(null);

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: "Active Campaigns", path: "/active-campaigns" },
        { label: "Add New Campaign", path: "/active-campaigns/add" },
      ])
    );

    // Fetch dynamic data for dropdowns
    dispatch(fetchCampaignsDropdown());
    dispatch(fetchTeams());
    dispatch(fetchActiveCampaignVendors());
  }, [dispatch]);

  // Sync local teams with Redux teams
  useEffect(() => {
    if (dropdowns.teams && dropdowns.teams.length > 0) {
      setLocalTeams(dropdowns.teams.map(t => t.team_name || t.name));
    }
  }, [dropdowns.teams]);

  // Generate options from Redux dropdown data
  const listIdOptions = useMemo(() => {
    if (dropdowns.listIds && dropdowns.listIds.length > 0) {
      return dropdowns.listIds.map((item) => ({
        label: item,
        value: item,
      }));
    }
    return [];
  }, [dropdowns.listIds]);

  const validationSchema = Yup.object({
    listIds: Yup.array().min(1, "Select at least one List ID").required("List ID is required"),
    vendorId: Yup.string().required("Vendor is required"),
    teamId: Yup.string().required("Assign to Team is required"),
    description: Yup.string().required("Description is required"),
  });

  const formik = useFormik({
    initialValues: {
      listIds: [],
      vendorId: "",
      teamId: "",
      assignedTeam: "", // for display
      description: "",
    },
    validationSchema,
    onSubmit: (values) => {
      const payload = {
        list_ids: values.listIds,
        vendor_id: parseInt(values.vendorId),
        team_id: parseInt(values.teamId),
        description: values.description,
      };
      dispatch(createActiveCampaign(payload)).then((result) => {
        if (!result.error) {
          navigate("/active-campaigns");
        }
      });
    },
  });

  // Get selected vendor name for display
  const selectedVendorName = useMemo(() => {
    if (!formik.values.vendorId) return "";
    const vendor = vendors.find(
      (v) => (v.id || v._id) === parseInt(formik.values.vendorId)
    );
    return vendor ? (vendor.vendor_name || vendor.name) : "";
  }, [formik.values.vendorId, vendors]);

  return (
    <div className="w-full lg:p-4 md:p-4 mt-3 md:mt-1">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/active-campaigns" className="flex items-center">
          <img src={leftArrow} alt="Back" className="w-6 h-6" />
        </Link>
        <h1 className="text-md text-primary-dark font-semibold">
          Add New Campaign
        </h1>
      </div>
      {/* Form Card */}
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md">
        {/* Card Header */}
        <div className="p-5 border-b border-[#F1F1F4]">
          <h2 className="text-lg font-semibold text-primary-dark">
            Add New Campaign
          </h2>
        </div>

        {/* Form Content */}
        <div className="p-5 md:p-10">
          <form
            onSubmit={formik.handleSubmit}
            className="flex flex-col gap-1 md:gap-5"
          >
            {/* List ID */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral">
                List ID
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="listIds"
                  isSelect
                  isMultiSelect
                  options={listIdOptions}
                  value={formik.values.listIds}
                  onChange={(e) =>
                    formik.setFieldValue("listIds", e.target.value)
                  }
                  onBlur={() => formik.setFieldTouched("listIds", true)}
                  error={
                    formik.touched.listIds && formik.errors.listIds
                      ? formik.errors.listIds
                      : ""
                  }
                  placeholder="Select list IDs"
                  className="mb-0 "
                />
              </div>
            </div>

            {/* Vendor */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral">
                Vendor
              </label>
              <div className="w-full md:w-3/4 relative">
                <button
                  ref={vendorTriggerRef}
                  type="button"
                  onClick={() => setShowVendorDropdown(!showVendorDropdown)}
                  className={`w-full flex justify-between items-center border border-default rounded-custom-md bg-neutral-input text-gray-700 px-4 py-3 cursor-pointer ${formik.touched.vendorId && formik.errors.vendorId
                    ? "border-red-500"
                    : ""
                    }`}
                >
                  <span
                    className={
                      selectedVendorName ? "text-gray-900" : "text-gray-400"
                    }
                  >
                    {selectedVendorName || "Select vendor"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {formik.touched.vendorId && formik.errors.vendorId && (
                  <p className="mt-1 text-sm text-red-500">
                    {formik.errors.vendorId}
                  </p>
                )}

                <VendorDropdown
                  isOpen={showVendorDropdown}
                  onClose={() => setShowVendorDropdown(false)}
                  onSelect={(vendor) => {
                    formik.setFieldValue("vendorId", vendor.id.toString());
                    formik.setFieldTouched("vendorId", true);
                  }}
                  selectedVendorId={
                    formik.values.vendorId
                      ? parseInt(formik.values.vendorId)
                      : null
                  }
                  triggerRef={vendorTriggerRef}
                  formik={formik}
                />
              </div>
            </div>

            {/* Assign to Team */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral">
                Assign to Team
              </label>
              <div className="w-full md:w-3/4 relative">
                <button
                  ref={teamTriggerRef}
                  type="button"
                  onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                  className={`w-full flex justify-between items-center border border-default rounded-custom-md bg-neutral-input text-gray-700 px-4 py-3 cursor-pointer ${formik.touched.teamId && formik.errors.teamId
                    ? "border-red-500"
                    : ""
                    }`}
                >
                  <span
                    className={
                      formik.values.assignedTeam
                        ? "text-gray-900"
                        : "text-gray-400"
                    }
                  >
                    {formik.values.assignedTeam || "Select team"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {formik.touched.teamId && formik.errors.teamId && (
                  <p className="mt-1 text-sm text-red-500">
                    {formik.errors.teamId}
                  </p>
                )}

                <TeamDropdown
                  isOpen={showTeamDropdown}
                  onClose={() => setShowTeamDropdown(false)}
                  onSelect={(team) => {
                    const teamName = team.team_name || team.name;
                    formik.setFieldValue("assignedTeam", teamName);
                    formik.setFieldValue("teamId", team.id.toString());
                    formik.setFieldTouched("teamId", true);
                  }}
                  selectedTeam={formik.values.assignedTeam}
                  triggerRef={teamTriggerRef}
                  formik={formik}
                  teams={dropdowns.teams}
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral">
                Description
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  isTextArea
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.description && formik.errors.description
                      ? formik.errors.description
                      : ""
                  }
                  placeholder="Enter description here"
                  rows={3}
                  className="mb-0"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-4 md:mt-8">
              <CustomButton type="submit" className="p-2">
                Add Campaign
              </CustomButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNewCampaign;
