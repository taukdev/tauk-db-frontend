import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import CustomTextField from "../CustomTextField";
import CustomButton from "../CustomButton";
import CustomTitle from "../CustomTitle";
import Checkbox from "../common/Checkbox";
import { setBreadcrumbs } from "../../features/breadcrumb/breadcrumbSlice";
import { getVendorListByIdApi, uploadCsvApi } from "../../api/vendors";
import DangerCircleIcon from "../../assets/icons/DangerCircle-icon.svg";
import UnionIcon from "../../assets/icons/Union-icon.svg";

const validationSchema = Yup.object({
  listId: Yup.string().required("List ID is required"),
  file: Yup.mixed().required("Please select a file to upload"),
  delimiter: Yup.string().required("Field delimiter is required"),
  hasHeaderRow: Yup.boolean(),
  hasOptInDates: Yup.string().required("Please select if records have opt in dates"),
});

const UploadRecords = () => {
  const { listId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [listName, setListName] = useState("");
  const [vendorId, setVendorId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("No file selected");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch list details to get list name
  useEffect(() => {
    const fetchListDetails = async () => {
      if (listId) {
        try {
          setLoading(true);
          const response = await getVendorListByIdApi(listId);
          const listData = response?.data || response;
          const name = listData?.list_name || listData?.listName || "Unknown List";
          const vendor = listData?.vendor_id || listData?.vendorId || listData?.created_by || listData?.createdBy;
          setListName(name);
          setVendorId(vendor);
        } catch (error) {
          console.error("Error fetching list details:", error);
          setListName("Unknown List");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchListDetails();
  }, [listId]);

  // Set breadcrumbs
  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: "Vendors", path: "/vendors" },
        { label: "Upload Records", path: `/vendor/list/${listId}/upload` },
      ])
    );
  }, [dispatch, listId]);

  const formik = useFormik({
    initialValues: {
      listId: listId || "",
      file: null,
      delimiter: "comma",
      hasHeaderRow: true,
      hasOptInDates: "yes",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setErrorMessage("");
      setSuccessMessage("");
      
      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append("csv_file", values.file);
        formData.append("delimiter", delimiterMap[values.delimiter] || "Comma");
        formData.append("has_header_row", String(values.hasHeaderRow));
        formData.append("has_opt_in_dates", values.hasOptInDates === "yes" ? "true" : "false");

        // Call API
        await uploadCsvApi(values.listId, formData);

        setSuccessMessage("File uploaded successfully!");
        // Navigate to vendor detail page after a short delay
        setTimeout(() => {
          if (vendorId) {
            navigate(`/vendor/${vendorId}`);
          } else {
            navigate(`/vendor/list/${listId}`);
          }
        }, 1500);
      } catch (error) {
        console.error("Error uploading file:", error);
        // Extract error message from different possible response structures
        const errorMsg = 
          error?.response?.data?.error || 
          error?.response?.data?.message || 
          error?.message || 
          "Error uploading file. Please try again.";
        setErrorMessage(errorMsg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setErrorMessage("");
    setSuccessMessage("");
    
    if (file) {
      // Check file size (200MB = 200 * 1024 * 1024 bytes)
      const maxSize = 200 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrorMessage("File size exceeds 200MB. Please select a smaller file.");
        e.target.value = "";
        setFileName("No file selected");
        formik.setFieldValue("file", null);
        return;
      }
      formik.setFieldValue("file", file);
      setFileName(file.name);
    }
  };

  const delimiterOptions = [
    { label: "Comma", value: "comma" },
    { label: "Tab", value: "tab" },
    { label: "Pipe", value: "pipe" },
  ];

  // Map delimiter values to API format
  const delimiterMap = {
    comma: "Comma",
    tab: "Tab",
    pipe: "Vertical Bar",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button
          className="cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <img src={UnionIcon} alt="Back" className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <div className="text-xl font-semibold">
          UPLOAD RECORDS TO '{listName.toUpperCase() || "LIST"}'
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <img src={DangerCircleIcon} alt="Info" className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          Attention: Maximum allowed files size is 200M.
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="bg-white rounded-custom-lg border border-secondary-lighter shadow-[0_3px_4px_rgba(0,0,0,0.03)] p-6 space-y-6">
        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <img src={DangerCircleIcon} alt="Error" className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <img src={DangerCircleIcon} alt="Success" className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {/* List ID */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
          <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
            List ID:
          </label>
          <div className="w-full md:w-3/4">
            <CustomTextField
              name="listId"
              value={formik.values.listId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.listId && formik.errors.listId}
              disabled
            />
          </div>
        </div>

        {/* Pick File To Upload */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
          <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
            Pick File To Upload:
          </label>
          <div className="w-full md:w-3/4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={fileName}
                disabled
                className="flex-1 border border-default rounded-custom-md bg-neutral-input text-gray-700 px-4 py-3 text-base"
              />
              <label className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-custom-md cursor-pointer hover:bg-gray-200 transition-colors text-sm font-medium">
                Choose File
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            {formik.touched.file && formik.errors.file && (
              <p className="mt-1 text-sm text-red-500">{formik.errors.file}</p>
            )}
          </div>
        </div>

        {/* Pick Field Delimiter */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
          <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
            Pick Field Delimiter:
          </label>
          <div className="w-full md:w-3/4">
            <CustomTextField
              name="delimiter"
              isSelect={true}
              options={delimiterOptions}
              value={formik.values.delimiter}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.delimiter && formik.errors.delimiter}
            />
          </div>
        </div>

        {/* File Has Header Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
          <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
            File Has Header Row:
          </label>
          <div className="w-full md:w-3/4">
            <Checkbox
              name="hasHeaderRow"
              checked={formik.values.hasHeaderRow}
              onChange={(e) =>
                formik.setFieldValue("hasHeaderRow", e.target.checked)
              }
            />
          </div>
        </div>

        {/* Do Records Have Opt In Dates? */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
          <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
            Do Records Have Opt In Dates?:
          </label>
          <div className="w-full md:w-3/4">
            <CustomTextField
              name="hasOptInDates"
              isRadio={true}
              options={[
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ]}
              value={formik.values.hasOptInDates}
              onChange={formik.handleChange}
              error={formik.touched.hasOptInDates && formik.errors.hasOptInDates}
            />
          </div>
        </div>

        {/* Upload File Button */}
        <div className="flex justify-end pt-4">
          <CustomButton
            type="submit"
            position="end"
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 !bg-orange-500 rounded-lg"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Uploading..." : "Upload File"}
          </CustomButton>
        </div>
      </form>
    </div>
  );
};

export default UploadRecords;

