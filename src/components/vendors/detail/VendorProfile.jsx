import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CustomTextField from '../../CustomTextField';
import CustomButton from '../../CustomButton';
import { getVendorByIdApi, updateVendorApi, activateVendorApi, deactivateVendorApi } from '../../../api/vendors';
import { useVendorTypes } from '../../../hooks/vendor/useVendorTypes';
import { usePaymentTerms } from '../../../hooks/vendor/usePaymentTerms';
import { useCountries } from '../../../hooks/vendor/useCountries';
import { useStates } from '../../../hooks/vendor/useStates';

const validationSchema = Yup.object({
  vendorName: Yup.string().required('Vendor name is required'),
  companyName: Yup.string().required('Company name is required'),
  vendorType: Yup.string().required('Vendor type is required'),
  paymentTerm: Yup.string().required('Payment term is required'),
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(
      /^(\+?\d{1,3}[- ]?)?\d{10}$/,
      'Invalid phone number'
    ),
  faxNumber: Yup.string()
    .required('Fax number is required')
    .matches(/^[0-9+\-() ]*$/, 'Invalid fax number'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  address: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  zip: Yup.string().required('Zip is required'),
  country: Yup.string().required('Country is required'),
  otherContactInfo: Yup.string(),
  referrer: Yup.string(),
  allowRecordingUpload: Yup.boolean(),
});


const VendorProfile = ({ vendor }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedCountryId, setSelectedCountryId] = useState(null);
  const [initialVendorStatus, setInitialVendorStatus] = useState(null);

  // Fetch vendor types from API
  const { vendorTypes, loading: vendorTypesLoading, error: vendorTypesError } = useVendorTypes();

  // Fetch payment terms from API
  const { paymentTerms, loading: paymentTermsLoading, error: paymentTermsError } = usePaymentTerms();

  // Fetch countries from API
  const { countries, loading: countriesLoading, error: countriesError } = useCountries();

  // Fetch states from API based on selected country
  const { states, loading: statesLoading, error: statesError } = useStates(selectedCountryId);

  const formik = useFormik({
    initialValues: {
      vendorName: '',
      companyName: '',
      vendorType: '',
      paymentTerm: '',
      phoneNumber: '',
      faxNumber: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      otherContactInfo: '',
      referrer: '',
      allowRecordingUpload: false,
      password: '',
      vendorStatus: '',
      username: '',
      backOfficeUrl: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!vendor?.id) {
        setError('Vendor ID is missing');
        return;
      }

      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      try {
        // Map form values to API payload format (snake_case) - exclude is_active
        const payload = {
          vendor_name: values.vendorName,
          company_name: values.companyName,
          vendor_type: values.vendorType,
          payment_term: values.paymentTerm,
          phone_number: values.phoneNumber,
          fax_number: values.faxNumber,
          email: values.email,
          address: values.address,
          city: values.city,
          state: values.state,
          zip: values.zip,
          country: values.country,
          other_contact_info: values.otherContactInfo,
          referrer: values.referrer,
          allow_recording_upload: values.allowRecordingUpload,
        };

        // Update vendor profile (without status)
        await updateVendorApi(vendor.id, payload);

        // Handle status change separately using activate/deactivate endpoints
        // Only call if status has changed from initial status
        if (initialVendorStatus !== null && initialVendorStatus !== values.vendorStatus) {
          if (values.vendorStatus === 'active') {
            await activateVendorApi(vendor.id);
          } else if (values.vendorStatus === 'inactive') {
            await deactivateVendorApi(vendor.id);
          }
        }
        setSuccessMessage('Vendor profile updated successfully');
        setError(null);

        // Auto-clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);

        // Optionally refetch vendor data to get latest updates
        const response = await getVendorByIdApi(vendor.id);
        const vendorData = response?.data || response;
        if (vendorData) {
          formik.setValues({
            vendorName: vendorData.vendor_name || vendorData.vendorName || '',
            companyName: vendorData.company_name || vendorData.companyName || '',
            vendorType: vendorData.vendor_type || vendorData.vendorType || '',
            paymentTerm: vendorData.payment_term || vendorData.paymentTerm || '',
            phoneNumber: vendorData.phone_number || vendorData.phoneNumber || '',
            faxNumber: vendorData.fax_number || vendorData.faxNumber || '',
            email: vendorData.email || '',
            address: vendorData.address || '',
            city: vendorData.city || '',
            state: vendorData.state || '',
            zip: vendorData.zip || '',
            country: vendorData.country || '',
            otherContactInfo: vendorData.other_contact_info || vendorData.otherContactInfo || '',
            referrer: vendorData.referrer || '',
            allowRecordingUpload: vendorData.allow_recording_upload || vendorData.allowRecordingUpload || false,
            password: vendorData.password || vendorData.generated_password || '',
            vendorStatus: vendorData.is_active ? 'active' : 'inactive',
            username: vendorData.username || '',
            backOfficeUrl: vendorData.back_office_url || vendorData.backOfficeUrl || '',
          });

          // Update initial vendor status after successful update
          setInitialVendorStatus(vendorData.is_active ? 'active' : 'inactive');
        }
      } catch (err) {
        const errorMessage = err?.data?.message || err?.message || 'Failed to update vendor profile';
        setError(errorMessage);
        setSuccessMessage(null);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Fetch vendor data when component mounts or vendor.id changes
  useEffect(() => {
    const fetchVendorData = async () => {
      if (!vendor?.id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await getVendorByIdApi(vendor.id);

        // Handle API response structure: {status: "success", data: {...}} or direct data
        const vendorData = response?.data || response;

        if (vendorData) {
          // Populate form with API data
          formik.setValues({
            vendorName: vendorData.vendor_name || vendorData.vendorName || '',
            companyName: vendorData.company_name || vendorData.companyName || '',
            vendorType: vendorData.vendor_type || vendorData.vendorType || '',
            paymentTerm: vendorData.payment_term || vendorData.paymentTerm || '',
            phoneNumber: vendorData.phone_number || vendorData.phoneNumber || '',
            faxNumber: vendorData.fax_number || vendorData.faxNumber || '',
            email: vendorData.email || '',
            address: vendorData.address || '',
            city: vendorData.city || '',
            state: vendorData.state || '',
            zip: vendorData.zip || '',
            country: vendorData.country || '',
            otherContactInfo: vendorData.other_contact_info || vendorData.otherContactInfo || '',
            referrer: vendorData.referrer || '',
            allowRecordingUpload: vendorData.allow_recording_upload || vendorData.allowRecordingUpload || false,
            password: vendorData.password || vendorData.generated_password || '',
            vendorStatus: vendorData.is_active ? 'active' : 'inactive',
            username: vendorData.username || '',
            backOfficeUrl: vendorData.back_office_url || vendorData.backOfficeUrl || '',
          });

          // Store initial vendor status for comparison
          setInitialVendorStatus(vendorData.is_active ? 'active' : 'inactive');

          // Set selected country ID for states API
          if (vendorData.country) {
            setSelectedCountryId(vendorData.country);
          }
        }
      } catch (err) {
        const errorMessage = err?.data?.message || err?.message || 'Failed to fetch vendor data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendor?.id]);

  // Update selectedCountryId when country changes in form
  useEffect(() => {
    const countryValue = formik.values.country;
    if (countryValue !== null && countryValue !== undefined && countryValue !== '') {
      const stringValue = String(countryValue).trim();
      if (stringValue !== '') {
        setSelectedCountryId(countryValue);
      } else {
        setSelectedCountryId(null);
      }
    } else {
      setSelectedCountryId(null);
    }
  }, [formik.values.country]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-5">
        <p className="text-center text-gray-500">Loading vendor data...</p>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-5">
        <p className="text-center text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md">
      <div className="p-5">
        <h2 className="text-md text-primary-dark font-bold">Vendor Profile</h2>
      </div>
      <hr className="border-t border-[#F1F1F4]" />
      {successMessage && (
        <div className="mx-6 mt-5 p-3 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mx-6 mt-5 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <div className="mx-6 mt-5 md:mt-7">
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          {/* Vendor Name */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
              Vendor Name
            </label>
            <div className="w-full md:w-3/4">
              <CustomTextField
                name="vendorName"
                type="text"
                placeholder="Vendor name"
                value={formik.values.vendorName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.vendorName ? formik.errors.vendorName : ""}
              />
            </div>
          </div>

          {/* Company Name */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
              Company Name
            </label>
            <div className="w-full md:w-3/4">
              <CustomTextField
                name="companyName"
                type="text"
                placeholder="Company name"
                value={formik.values.companyName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.companyName ? formik.errors.companyName : ""}
              />
            </div>
          </div>


          {/* Vendor Type */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
              Vendor Type
            </label>
            <div className="w-full md:w-3/4">
              <CustomTextField
                name="vendorType"
                isSelect={true}
                options={vendorTypes}
                placeholder={vendorTypesLoading ? "Loading vendor types..." : "Vendor type"}
                value={formik.values.vendorType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.vendorType ? formik.errors.vendorType : ""}
                disabled={vendorTypesLoading}
              />
            </div>
          </div>

          {/* Payment Term */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
              Payment Term
            </label>
            <div className="w-full md:w-3/4">
              <CustomTextField
                name="paymentTerm"
                isSelect={true}
                options={paymentTerms}
                placeholder={paymentTermsLoading ? "Loading payment terms..." : "Payment term"}
                value={formik.values.paymentTerm}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.paymentTerm ? formik.errors.paymentTerm : ""}
                disabled={paymentTermsLoading}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
              Phone Number
            </label>
            <div className="w-full md:w-3/4">
              <CustomTextField
                name="phoneNumber"
                type="tel"
                placeholder="Phone number"
                value={formik.values.phoneNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phoneNumber ? formik.errors.phoneNumber : ""}
              />
            </div>
          </div>

          {/* Fax Number */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
              Fax Number
            </label>
            <div className="w-full md:w-3/4">
              <CustomTextField
                name="faxNumber"
                type="text"
                placeholder="Fax number"
                value={formik.values.faxNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.faxNumber ? formik.errors.faxNumber : ""}
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
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
            <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
              Address
            </label>
            <div className="w-full md:w-3/4">
              <CustomTextField
                name="address"
                type="text"
                placeholder="Address"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address ? formik.errors.address : ""}
              />
            </div>
          </div>

          {/* City */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
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
            <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
              State
            </label>
            <div className="w-full md:w-3/4">
              <CustomTextField
                name="state"
                isSelect={true}
                options={states}
                placeholder={selectedCountryId ? (statesLoading ? "Loading states..." : "Select state") : "Select country first"}
                value={formik.values.state}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.state ? formik.errors.state : ""}
                disabled={!selectedCountryId || statesLoading}
              />
            </div>
          </div>

          {/* Zip */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
              Zip
            </label>
            <div className="w-full md:w-3/4">
              <CustomTextField
                name="zip"
                type="text"
                placeholder="Enter zip"
                value={formik.values.zip}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.zip ? formik.errors.zip : ""}
              />
            </div>
          </div>

          {/* Country */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
              Country
            </label>
            <div className="w-full md:w-3/4">
              <CustomTextField
                name="country"
                isSelect={true}
                options={countries}
                placeholder={countriesLoading ? "Loading countries..." : "Country"}
                value={formik.values.country}
                onChange={(e) => {
                  const countryValue = e.target.value;
                  formik.handleChange(e);
                  formik.setFieldValue('state', '');
                  if (countryValue !== null && countryValue !== undefined && countryValue !== '') {
                    const stringValue = String(countryValue).trim();
                    if (stringValue !== '') {
                      setSelectedCountryId(countryValue);
                    } else {
                      setSelectedCountryId(null);
                    }
                  } else {
                    setSelectedCountryId(null);
                  }
                }}
                onBlur={formik.handleBlur}
                error={formik.touched.country ? formik.errors.country : ""}
                disabled={countriesLoading}
              />
            </div>
          </div>

          {/* Other Contact Info */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
              Other Contact Info
            </label>
            <div className="w-full md:w-3/4">
              <CustomTextField
                name="otherContactInfo"
                isTextArea={true}
                placeholder="eg: Skype: examplehandle"
                value={formik.values.otherContactInfo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.otherContactInfo ? formik.errors.otherContactInfo : ""}
                rows={2}
              />
              <div className="text-xs text-gray-500 mb-2">Skype, WhatsApp, Viber, etc.</div>
            </div>
          </div>

          {/* Referrer */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
              Referrer
            </label>
            <div className="w-full md:w-3/4">
              <CustomTextField
                name="referrer"
                type="text"
                placeholder="Enter referrer"
                value={formik.values.referrer}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.referrer ? formik.errors.referrer : ""}
              />
            </div>
          </div>

          {/* Allow Recording Upload */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
              Allow Recording Upload
            </label>
            <div className="w-full md:w-3/4">
              <CustomTextField
                name="allowRecordingUpload"
                isToggle={true}
                value={formik.values.allowRecordingUpload}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 mb-4">
            <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-0">
              Back Office URL
            </label>
            <div className="w-full md:w-3/4">
              <p className='text-[14px] text-neutral'> {formik.values.backOfficeUrl || ""} </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 mb-4">
            <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-0">
              Username
            </label>
            <div className="w-full md:w-3/4">
              <p className='text-[14px] text-neutral'> {formik.values.username || ""} </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
              Password
            </label>
            <div className="w-full md:w-3/4">
              <CustomTextField
                name="password"
                type="password"
                value={formik.values.password}
                readOnly
                className="cursor-not-allowed"
                inputClassName="cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
              Vendor Status
            </label>
            <div className="w-full md:w-3/4">
              <CustomTextField
                name="vendorStatus"
                isSelect={true}
                options={[
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
                value={formik.values.vendorStatus}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
          </div>


          <div className="flex flex-col md:flex-row md:justify-end items-end gap-4 mt-0 mb-6">
            <CustomButton
              type="submit"
              fullWidth={false}
              position="end"
              disabled={submitting || loading}
            >
              {submitting ? 'Updating...' : 'Save Vendor Profile'}
            </CustomButton>
          </div>

        </form>
      </div >
    </div >
  );
};

export default VendorProfile;