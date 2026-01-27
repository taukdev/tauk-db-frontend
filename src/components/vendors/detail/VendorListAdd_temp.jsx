import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import CustomTextField from "../../CustomTextField";
import UnionIcon from "../../../assets/icons/Union-icon.svg";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setBreadcrumbs } from "../../../features/breadcrumb/breadcrumbSlice";
import { selectVendorById } from "../../../features/vendor/vendorSlice";
import CustomButton from "../../CustomButton";
import Checkbox from "../../common/Checkbox";
import { useCountries } from "../../../hooks/vendor/useCountries";
import { useListVertical } from "../../../hooks/vendor/useListVertical";
import { useDedupeBack } from "../../../hooks/vendor/useDedupeBack";
import { createListApi } from "../../../api/vendors";
import { useNavigate } from "react-router-dom";


const requiredFields = [
  "Email Address",
  "First Name",
  "Last Name",
  "Phone Number",
  "Alternative Phone Number",
  "Country",
  "IP Address",
  "Physical Address",
  "City",
  "State",
  "Zip Code",
  "Gender",
  "Offer Form URL",
  "Signup Date",
  "Date of Birth",
  "Comments",
];



const validationSchema = Yup.object({
  listName: Yup.string().required("List name is required"),
  listVertical: Yup.string().required("List vertical is required"),
  listStatus: Yup.string().required("List status is required"),
  dedupeBack: Yup.number()
    .typeError("Must be a number")
    .required("Dedupe back is required"),
});


function VendorListAdd() {
  const { countries, loading: countriesLoading } = useCountries();
  const { verticals: listVerticals, loading: listVerticalsLoading } = useListVertical();
  const { dedupeBacks, loading: dedupeBacksLoading } = useDedupeBack();
  const [showCustomFields, setShowCustomFields] = useState(false);
  const { id: vendorId } = useParams(); // get vendor id from route params

  const vendor = useSelector((state) => selectVendorById(state, vendorId));

  const formik = useFormik({
    initialValues: {
      listName: "",
      dateEntered: "",
      listVertical: "",
      sellTimes: "unlimited",
      suppressionScrub: true,
      level1EmailScrub: true,
      tcpaScrub: true,
      validateIp: true,
      dedupeAgainst: "itself",
      dedupeBack: "1",
      requiredFields: [],
      allowedCountries: [],
      listStatus: "active",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        // Map form values to API payload format
        const convertToInt = (val) => {
          if (!val || val === '') return null;
          const num = Number(val);
          return isNaN(num) ? null : num;
        };

        // Map required fields to API format (snake_case)
        const requiredFieldsMap = {
          "Email Address": "email",
          "First Name": "first_name",
          "Last Name": "last_name",
          "Phone Number": "phone_number",
          "Alternative Phone Number": "alternative_phone_number",
          "Country": "country",
          "IP Address": "ip_address",
          "Physical Address": "address",
          "City": "city",
          "State": "state",
          "Zip Code": "zip_code",
          "Gender": "gender",
          "Offer Form URL": "offer_form_url",
          "Signup Date": "signup_date",
          "Date of Birth": "date_of_birth",
          "Comments": "comments",
        };

        const mappedRequiredFields = values.requiredFields.map(
          (field) => requiredFieldsMap[field] || field.toLowerCase().replace(/\s+/g, '_')
        );

        // Map sellTimes: "unlimited" -> "Unlimited", numbers stay as string
        const sellTimesValue = values.sellTimes === "unlimited" ? "Unlimited" : values.sellTimes;

        // Map dedupeBack: value is already a number from the dropdown
        const dedupeBackValue = convertToInt(values.dedupeBack);

        // dedupeAgainst value (already in correct format)
        const dedupeAgainstValue = values.dedupeAgainst || "itself";

        const payload = {
          list_name: values.listName,
          vendor_id: convertToInt(vendorId),
          list_vertical: convertToInt(values.listVertical),
          sell_times: sellTimesValue,
          list_status: values.listStatus || "active",
          allowed_countries: values.allowedCountries.map((c) => convertToInt(c)).filter((c) => c !== null), // Array of country IDs
          required_fields: mappedRequiredFields,
          suppression_scrub: values.suppressionScrub || false,
          tcpa_scrub: values.tcpaScrub || false,
          dedupe_against: dedupeAgainstValue,
          dedupe_back: dedupeBackValue,
        };

        // Call API
        await createListApi(payload);

        // Navigate back to vendor detail page on success
        navigate(`/vendor/${vendorId}`);
      } catch (error) {
        const errorMessage = error?.data?.message || error?.message || "Failed to create list. Please try again.";
        setFieldError('listName', errorMessage);

        if (error?.data?.errors) {
          Object.keys(error.data.errors).forEach((field) => {
            const camelField = field.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            setFieldError(camelField, error.data.errors[field]);
          });
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const navigate = useNavigate();

  const handleRequiredFieldChange = (field) => {
    const exists = formik.values.requiredFields.includes(field);
    formik.setFieldValue(
      "requiredFields",
      exists
        ? formik.values.requiredFields.filter((f) => f !== field)
        : [...formik.values.requiredFields, field]
    );
  };

  const handleAllowedCountryChange = (countryId) => {
    const exists = formik.values.allowedCountries.includes(countryId);
    formik.setFieldValue(
      "allowedCountries",
      exists
        ? formik.values.allowedCountries.filter((c) => c !== countryId)
        : [...formik.values.allowedCountries, countryId]
    );
  };

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: "Vendors", path: "/vendors" },
        {
          label: vendor?.id + " - " + vendor?.name,
          path: "/vendor/" + vendor?.id,
        },
        { label: "Add New List", path: `/vendor/list-add/${vendorId}` },
      ])
    );
  }, [dispatch]);

  return (
    <>
      <div>
        <Link to={`/vendor/${vendorId}`} style={{ textDecoration: "none" }}>
          <div className="flex items-center gap-2 md:gap-4 text-primary-dark font-bold text-md">
            <img src={UnionIcon} alt="" />
            <h2 className="text-md text-primary-dark font-bold">
              Add New List
            </h2>
          </div>
        </Link>
      </div>
      <div className="p-4 md:p-10 min-h-screen">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md">
          <div className="p-5">
            <h2 className="text-lg text-primary-dark font-bold">
              List Information
            </h2>
          </div>
          <hr className="border-t border-[#F1F1F4]" />
          <form
            onSubmit={formik.handleSubmit}
            className="mx-6 mt-0 md:m-10 md:mt-7 flex flex-col gap-4"
          >
            {/* All fields in a single vertical column */}
            {/* List Name */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 mt-4 md:mt-0">
              <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                List Name
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="listName"
                  placeholder="Enter list name"
                  value={formik.values.listName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.listName ? formik.errors.listName : ""}
                />
              </div>
            </div>

            {/* List Vertical */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                List Vertical
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="listVertical"
                  isSelect={true}
                  options={listVerticals}
                  placeholder={listVerticalsLoading ? "Loading verticals..." : "Select Vertical"}
                  value={formik.values.listVertical}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.listVertical ? formik.errors.listVertical : ""}
                  disabled={listVerticalsLoading}
                />
              </div>
            </div>

            {/* Sell Times Dropdown */}
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-0 flex items-center">
                Sell Times
              </label>
              <div className="w-full md:w-3/4 flex items-center gap-2">
                <div className="flex-1">
                  <CustomTextField
                    name="sellTimes"
                    isSelect={true}
                    options={[
                      { label: "1", value: "1" },
                      { label: "2", value: "2" },
                      { label: "3", value: "3" },
                      { label: "4", value: "4" },
                      { label: "5", value: "5" },
                      { label: "6", value: "6" },
                      { label: "Unlimited", value: "unlimited" },
                    ]}
                    value={formik.values.sellTimes}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.sellTimes ? formik.errors.sellTimes : ""
                    }
                  />
                </div>
                <label className="text-sm text-neutral whitespace-nowrap">
                  Times
                </label>
              </div>
            </div>

            {/* Scrubs and Validations Section */}
            {/* Suppression Scrub */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                Suppression Scrub
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="suppressionScrub"
                  isRadio={true}
                  options={[
                    { label: "Yes", value: "true" },
                    { label: "No", value: "false" },
                  ]}
                  value={String(formik.values.suppressionScrub)}
                  onChange={(e) =>
                    formik.setFieldValue(
                      "suppressionScrub",
                      e.target.value === "true"
                    )
                  }
                />
              </div>
            </div>

            {/* Level 1 Email Scrub */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                Level 1 Email Scrub
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="level1EmailScrub"
                  isRadio={true}
                  options={[
                    { label: "Yes", value: "true" },
                    { label: "No", value: "false" },
                  ]}
                  value={String(formik.values.level1EmailScrub)}
                  onChange={(e) =>
                    formik.setFieldValue(
                      "level1EmailScrub",
                      e.target.value === "true"
                    )
                  }
                />
              </div>
            </div>

            {/* TCPA Scrub */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                TCPA Scrub
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="tcpaScrub"
                  isRadio={true}
                  options={[
                    { label: "Yes", value: "true" },
                    { label: "No", value: "false" },
                  ]}
                  value={String(formik.values.tcpaScrub)}
                  onChange={(e) =>
                    formik.setFieldValue("tcpaScrub", e.target.value === "true")
                  }
                />
              </div>
            </div>

            {/* Dedupe Against */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                Dedupe Against
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="dedupeAgainst"
                  isRadio={true}
                  options={[
                    { label: "Itself", value: "itself" },
                    { label: "Entire Database", value: "entire_database" },
                    { label: "Specific Lists", value: "specific_lists" },
                  ]}
                  value={formik.values.dedupeAgainst}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
            </div>

            {/* Dedupe Back (Days) */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral">
                Dedupe Back (Days)
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="dedupeBack"
                  isSelect={true}
                  options={dedupeBacks}
                  placeholder={dedupeBacksLoading ? "Loading..." : "Select Days"}
                  value={formik.values.dedupeBack}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.dedupeBack ? formik.errors.dedupeBack : ""}
                  disabled={dedupeBacksLoading}
                />
              </div>
            </div>

            {/* Required Fields */}
            {/* Required Fields */}
            <div className="flex flex-col md:flex-row items-start md:items-start gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral cursor-default">
                Required Fields
              </label>

              <div className="w-full md:w-3/4">
                {requiredFields.map((field) => (
                  <div key={field} className="mb-1">
                    <Checkbox
                      id={`req-${field}`}
                      name={`requiredFields`}
                      label={field}
                      checked={formik.values.requiredFields.includes(field)}
                      onChange={() => handleRequiredFieldChange(field)}
                      className="text-sm"
                      checkboxSize="w-4 h-4"
                      labelClassName="text-sm"
                    />
                  </div>
                ))}

                {/* Show Custom Fields line */}
                <button
                  type="button"
                  onClick={() => setShowCustomFields((prev) => !prev)}
                  className="mt-2 text-sm text-blue-600 border-b border-dotted border-blue-600 cursor-pointer"
                >
                  {showCustomFields
                    ? "Hide Custom Fields"
                    : "Show Custom Fields"}
                </button>

                {/* Agar custom fields dikhaavva hoy to yaha add kari sakay */}
                {showCustomFields && (
                  <div className="mt-2">
                    {/* custom fields checkboxes ya inputs yaha add karo */}
                  </div>
                )}
              </div>
            </div>

            {/* Allowed Countries - Multiple Select using Checkboxes */}
            <div className="flex flex-col md:flex-row items-start md:items-start gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral cursor-default">
                Allowed Countries
              </label>
              <div className="w-full md:w-3/4">
                {countriesLoading ? (
                  <div className="text-sm text-gray-500">Loading countries...</div>
                ) : countries.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {countries.map((country) => (
                      <div key={country.value} className="mb-1">
                        <Checkbox
                          id={`country-${country.value}`}
                          name={`allowedCountries`}
                          label={country.label}
                          checked={formik.values.allowedCountries.includes(country.value)}
                          onChange={() => handleAllowedCountryChange(country.value)}
                          className="text-sm"
                          checkboxSize="w-4 h-4"
                          labelClassName="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No countries available</div>
                )}
              </div>
            </div>

            {/* Required Fields */}
            <div className="flex flex-col md:flex-row items-start md:items-start gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral cursor-default">
                Required Fields
              </label>

              <div className="w-full md:w-3/4">
                {requiredFields.map((field) => (
                  <div key={field} className="mb-1">
                    <Checkbox
                      id={`req-${field}`}
                      name={`requiredFields`}
                      label={field}
                      checked={formik.values.requiredFields.includes(field)}
                      onChange={() => handleRequiredFieldChange(field)}
                      className="text-sm"
                      checkboxSize="w-4 h-4"
                      labelClassName="text-sm"
                    />
                  </div>
                ))}

                {/* Show Custom Fields line */}
                <button
                  type="button"
                  onClick={() => setShowCustomFields((prev) => !prev)}
                  className="mt-2 text-sm text-blue-600 border-b border-dotted border-blue-600 cursor-pointer"
                >
                  {showCustomFields
                    ? "Hide Custom Fields"
                    : "Show Custom Fields"}
                </button>

                {/* Agar custom fields dikhaavva hoy to yaha add kari sakay */}
                {showCustomFields && (
                  <div className="mt-2">
                    {/* custom fields checkboxes ya inputs yaha add karo */}
                  </div>
                )}
              </div>
            </div>

