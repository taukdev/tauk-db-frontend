import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import CustomTextField from "../../CustomTextField";
import CustomButton from "../../CustomButton";
import { fetchPlatformDropdowns, fetchStatesByCountry } from "../../../features/platform/platformSlice";
import { updatePlatformDetail, activatePlatform, deactivatePlatform } from "../../../features/platform/platformDetailSlice";

const validationSchema = Yup.object({
  name: Yup.string().required("Platform name is required"),
  company: Yup.string().required("Company name is required"),
  platformType: Yup.string().required("Platform type is required"),
  paymentTerm: Yup.string().required("Payment term is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^(\+?\d{1,3}[- ]?)?\d{10}$/, "Invalid phone number"),
  fax: Yup.string().matches(/^[0-9+\-() ]*$/, "Invalid fax number"),
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  zip: Yup.string().required("Zip is required"),
  country: Yup.string().required("Country is required"),
});

const PlatformProfile = ({ platform }) => {
  const dispatch = useDispatch();
  const { dropdowns } = useSelector((state) => state.platform);
  const [pageMessage, setPageMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    dispatch(fetchPlatformDropdowns());
    if (platform?.country_id || platform?.country) {
      dispatch(fetchStatesByCountry(platform.country_id || platform.country));
    }
  }, [dispatch, platform?.country_id, platform?.country]);

  // Derived options from API
  const platformTypes = dropdowns.types.map(t => ({
    label: t.type_name || t.name || t.label || String(t.id || ""),
    value: String(t.id || t.value || (typeof t === 'string' ? t : ''))
  }));
  const paymentTerms = dropdowns.terms.map(t => ({
    label: t.term_name || t.name || t.label || String(t.id || ""),
    value: String(t.id || t.value || (typeof t === 'string' ? t : ''))
  }));
  const countries = dropdowns.countries.map(c => ({
    label: c.country_name || c.name || c.label || String(c.id || ""),
    value: String(c.id || c.value || (typeof c === 'string' ? c : ''))
  }));
  const states = dropdowns.states.map(s => ({
    label: s.state_name || s.name || s.label || String(s.id || ""),
    value: String(s.id || s.value || (typeof s === 'string' ? s : ''))
  }));
  const leadReturnCutoffs = dropdowns.cutoffs.map(c => ({
    label: c.cutoff_label || c.name || c.label || String(c.id || ""),
    value: String(c.id || c.value || (typeof c === 'string' ? c : ''))
  }));

  const formik = useFormik({
    initialValues: {
      name: platform?.platform_name || platform?.name || "",
      company: platform?.company_name || platform?.company || "",
      platformType: String(platform?.PlatformType?.id || platform?.platform_type_id || platform?.platform_type || ""),
      paymentTerm: String(platform?.PaymentTerm?.id || platform?.payment_term_id || platform?.payment_term || ""),
      phone: platform?.phone_number || platform?.phone || "",
      fax: platform?.fax_number || platform?.fax || "",
      email: platform?.email || "",
      address: platform?.address || "",
      city: platform?.city || "",
      state: String(platform?.State?.id || platform?.state_id || platform?.state || ""),
      zip: platform?.zip || "",
      country: String(platform?.Country?.id || platform?.country_id || platform?.country || ""),
      otherContactInfo: platform?.other_contact_info || platform?.otherContactInfo || "",
      leadReturnCutoff: String(platform?.LeadReturnCutoff?.id || platform?.lead_return_cutoff_id || platform?.leadReturnCutoff || ""),
      referrer: platform?.referrer || "N/A",
      referrerPercent: platform?.referrer_percent || platform?.referrerPercent || "0.00",
      salesRep: platform?.sales_rep || platform?.salesRep || "N/A",
      backOfficeUrl: platform?.base_offline_url || platform?.backOfficeUrl || "",
      username: platform?.username || "",
      password: platform?.password || "",
      platformStatus: platform?.status || "Active",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      setPageMessage({ type: "", text: "" });
      const payload = {
        platform_name: values.name,
        company_name: values.company,
        platform_type: parseInt(values.platformType),
        payment_term: parseInt(values.paymentTerm),
        phone_number: values.phone,
        fax_number: values.fax,
        email: values.email,
        address: values.address,
        city: values.city,
        state: parseInt(values.state),
        zip: values.zip,
        country: parseInt(values.country),
        other_contact_info: values.otherContactInfo,
        lead_return_cutoff: parseInt(values.leadReturnCutoff),
        referrer: values.referrer,
        referrer_percent: parseFloat(values.referrerPercent),
        sales_rep: values.salesRep,
        since_year: platform?.since_year || "2020",
        base_offline_url: values.backOfficeUrl,
        internal_view_only: platform?.internal_view_only || false
      };

      try {
        await dispatch(updatePlatformDetail({ id: platform.id, payload })).unwrap();
        setPageMessage({ type: "success", text: "Profile updated successfully!" });
      } catch (error) {
        console.error("Update failed:", error);
        setPageMessage({ type: "error", text: "Failed to update profile: " + error });
      }
    },
  });

  const handleCountryChange = (e) => {
    const countryId = e.target.value;
    formik.setFieldValue("country", countryId);
    formik.setFieldValue("state", "");
    if (countryId) {
      dispatch(fetchStatesByCountry(countryId));
    }
  };

  return (
    <div className="mt-3 md:mt-1 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white rounded-custom-lg shadow-md">
        <div className="p-5">
          <h2 className="text-md text-primary-dark font-bold">
            Platform Profile
          </h2>
        </div>
        <hr className="border-t border-[#F1F1F4]" />

        <div className="mx-4 md:mx-10 mt-3 md:mt-6">
          {pageMessage.text && (
            <div
              className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium
                ${pageMessage.type === "success"
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
                }`}
            >
              {pageMessage.text}
            </div>
          )}
          <form
            onSubmit={formik.handleSubmit}
            className="flex flex-col gap-1 md:gap-5 "
          >
            {/* Platform Name */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm font-medium">
                Platform Name
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="name"
                  type="text"
                  placeholder="Platform name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name ? formik.errors.name : ""}
                />
              </div>
            </div>

            {/* Company Name */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm font-medium">
                Company Name
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="company"
                  type="text"
                  placeholder="Company name"
                  value={formik.values.company}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.company ? formik.errors.company : ""}
                />
              </div>
            </div>

            {/* Platform Type */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm font-medium">
                Platform Type
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="platformType"
                  placeholder="Platform Type"
                  isSelect
                  options={platformTypes}
                  value={formik.values.platformType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.platformType
                      ? formik.errors.platformType
                      : ""
                  }
                />
              </div>
            </div>

            {/* Payment Term */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm font-medium">
                Payment Term
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="paymentTerm"
                  placeholder="Payment Term"
                  isSelect
                  options={paymentTerms}
                  value={formik.values.paymentTerm}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.paymentTerm ? formik.errors.paymentTerm : ""
                  }
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                Phone Number
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="phone"
                  type="text"
                  placeholder="Phone number"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phone ? formik.errors.phone : ""}
                />
              </div>
            </div>

            {/* Fax Number */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                Fax Number
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="fax"
                  type="text"
                  placeholder="Fax number"
                  value={formik.values.fax}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.fax ? formik.errors.fax : ""}
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                Email
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="email"
                  type="email"
                  placeholder="Email address"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email ? formik.errors.email : ""}
                />
              </div>
            </div>

            {/* Address */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                Address
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="address"
                  type="text"
                  placeholder="Street address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.address ? formik.errors.address : ""}
                />
              </div>
            </div>

            {/* City */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                City
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="city"
                  type="text"
                  placeholder="City"
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.city ? formik.errors.city : ""}
                />
              </div>
            </div>

            {/* State */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                State
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="state"
                  placeholder="State"
                  isSelect
                  options={states}
                  value={formik.values.state}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.state ? formik.errors.state : ""}
                />
              </div>
            </div>

            {/* Zip */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                Zip
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="zip"
                  type="text"
                  placeholder="Zip"
                  value={formik.values.zip}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.zip ? formik.errors.zip : ""}
                />
              </div>
            </div>

            {/* Country */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                Country
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="country"
                  isSelect
                  options={countries}
                  value={formik.values.country}
                  onChange={handleCountryChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.country ? formik.errors.country : ""}
                />
              </div>
            </div>

            {/* Other Contact Info (textarea) */}
            <div className="flex flex-col md:flex-row items-start md:items-start gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                Other Contact Info
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  isTextArea
                  name="otherContactInfo"
                  placeholder="eg: Skype: examplehandle"
                  value={formik.values.otherContactInfo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.otherContactInfo
                      ? formik.errors.otherContactInfo
                      : ""
                  }
                  size="md"
                />
                <p className="text-xs text-gray-400">
                  Skype, WhatsApp, Viber, etc.
                </p>
              </div>
            </div>

            {/* Lead Return Cutoff */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                Lead Return Cutoff
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="leadReturnCutoff"
                  isSelect
                  options={leadReturnCutoffs}
                  value={formik.values.leadReturnCutoff}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
            </div>

            {/* Referrer Percent */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                Referrer Percent
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="referrerPercent"
                  min="0"
                  type="number"
                  placeholder="0.00"
                  value={formik.values.referrerPercent}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
            </div>

            {/* Back Office URL */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                Back Office URL
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="backOfficeUrl"
                  type="url"
                  placeholder="http://example.com/vendorcp/"
                  value={formik.values.backOfficeUrl}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.backOfficeUrl
                      ? formik.errors.backOfficeUrl
                      : ""
                  }
                />
              </div>
            </div>

            {/* Username */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                Username
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="username"
                  type="text"
                  placeholder="Enter username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.username ? formik.errors.username : ""}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                Password
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password ? formik.errors.password : ""}
                />
              </div>
            </div>

            {/* Platform Status */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                Platform Status
              </label>
              <div className="w-full md:w-3/4">
                <CustomTextField
                  name="platformStatus"
                  isSelect
                  options={[
                    { label: "Active", value: "Active" },
                    { label: "Inactive", value: "Inactive" },
                  ]}
                  value={formik.values.platformStatus}
                  onChange={async (e) => {
                    const newStatus = e.target.value;
                    formik.setFieldValue("platformStatus", newStatus);

                    try {
                      setPageMessage({ type: "", text: "" });
                      if (newStatus === "Active") {
                        await dispatch(activatePlatform(platform.id)).unwrap();
                        setPageMessage({ type: "success", text: "Platform activated successfully!" });
                      } else {
                        await dispatch(deactivatePlatform(platform.id)).unwrap();
                        setPageMessage({ type: "success", text: "Platform deactivated successfully!" });
                      }
                    } catch (error) {
                      console.error("Status update failed:", error);
                      setPageMessage({ type: "error", text: "Failed to update status: " + error });
                    }
                  }}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.platformStatus
                      ? formik.errors.platformStatus
                      : ""
                  }
                />
              </div>
            </div>

            {/* Submit */}
            <CustomButton
              type="submit"
              position="end"
              className="cursor-pointer my-5"
            >
              Save Platform Profile
            </CustomButton>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlatformProfile;
