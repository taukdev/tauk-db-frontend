import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import CustomTextField from "../../CustomTextField";
import UnionIcon from "../../../assets/icons/Union-icon.svg";
import { Link, useParams, useNavigate } from "react-router-dom";
import { setBreadcrumbs } from "../../../features/breadcrumb/breadcrumbSlice";
import { useDispatch, useSelector } from "react-redux";
import { selectVendorById } from "../../../features/vendor/vendorSlice";
import { updateList, activateList, deactivateList, fetchListById, selectListById } from "../../../features/vendor/vendorListingSlice";
import CustomButton from "../../CustomButton";
import Checkbox from "../../common/Checkbox";
import { useCountries } from "../../../hooks/vendor/useCountries";
import { useListVertical } from "../../../hooks/vendor/useListVertical";
import { useDedupeBack } from "../../../hooks/vendor/useDedupeBack";

const listStatusOptions = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
  { label: "6", value: "6" },
  { label: "Unlimited", value: "unlimited" },
];

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

const countriesStaticFallback = [
  { label: "United States", value: "United States" },
  { label: "United Kingdom", value: "United Kingdom" },
  { label: "Canada", value: "Canada" },
  { label: "Australia", value: "Australia" },
  { label: "New Zealand", value: "New Zealand" },
  { label: "South Africa", value: "South Africa" },
];

const validationSchema = Yup.object({
  listName: Yup.string().required("List name is required"),
  costPerLead: Yup.number()
    .typeError("Must be a number")
    .required("Cost per lead is required"),
  listVertical: Yup.string().required("List vertical is required"),
  ownerReshare: Yup.number()
    .typeError("Must be a number")
    .required("Owner reshare % is required"),
  salesRep: Yup.string(),
  referrer: Yup.string(),
  listStatus: Yup.string().required("List status is required"),
  dedupeBack: Yup.number()
    .typeError("Must be a number")
    .required("Dedupe back is required"),
});

function VendorListDetail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { vendorId, id } = useParams();
  const { countries, loading: countriesLoading } = useCountries();
  const { verticals: listVerticals, loading: listVerticalsLoading } = useListVertical();
  const { dedupeBacks, loading: dedupeBacksLoading } = useDedupeBack();
  const [showCustomFields, setShowCustomFields] = useState(false);
  const vendor = useSelector((state) => selectVendorById(state, vendorId));
  const fetchedList = useSelector((state) =>
    selectListById(state, id)
  );

  const convertToInt = (val) => {
    if (!val || val === '') return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  };

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

  const reverseRequiredFieldsMap = Object.fromEntries(
    Object.entries(requiredFieldsMap).map(([k, v]) => [v, k])
  );

  const formik = useFormik({
    initialValues: {
      listName: "",
      dateEntered: "",
      costPerLead: "",
      listVertical: "",
      ownerReshare: "",
      category: "",
      howToSell: "basic",
      sellTimes: "unlimited",
      salesRep: "",
      referrer: "",
      listStatus: "active",
      suppressionScrub: true,
      level1EmailScrub: true,
      level2EmailScrub: false,
      level2PhoneScrub: false,
      level3EmailScrub: false,
      tcpaScrub: true,
      usAddressValidation: false,
      validateIpAddress: true,
      geoComplete: true,
      blockBadWords: false,
      genderComplete: true,
      appendMissingFields: true,
      listflexAppendService: false,
      dedupeAgainst: "",
      dedupeBack: 40,
      requiredFields: [],
      allowedCountries: ["United States"],
      listType: "import",
      redirectAfterImport: true,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        const mappedRequiredFields = values.requiredFields.map(
          (field) => requiredFieldsMap[field] || field
        );

        const payload = {
          list_name: values.listName,
          fixed_cost_per_lead: Number(values.costPerLead) || 0,
          list_vertical: convertToInt(values.listVertical),
          owner_revshare_percent: Number(values.ownerReshare) || 0,
          how_to_sell: values.howToSell === "basic" ? "basic_rules" : "advanced_rules",
          sell_times: values.sellTimes === "unlimited" ? "Unlimited" : values.sellTimes,
          sales_rep: values.salesRep ? convertToInt(values.salesRep) : null,
          referrer: values.referrer ? convertToInt(values.referrer) : null,
          list_status: values.listStatus || "active",
          allowed_countries: values.allowedCountries.map((c) => convertToInt(c)).filter((c) => c !== null),
          required_fields: mappedRequiredFields,
          list_type: values.listType,
          suppression_scrub: values.suppressionScrub,
          level_1_email_scrub: values.level1EmailScrub,
          level_2_email_scrub: values.level2EmailScrub,
          level_2_phone_scrub: values.level2PhoneScrub,
          level_3_email_scrub: values.level3EmailScrub,
          tcpa_scrub: values.tcpaScrub,
          us_address_validation: values.usAddressValidation,
          validate_ip_address: values.validateIpAddress,
          geo_complete: values.geoComplete,
          block_bad_words: values.blockBadWords,
          gender_complete: values.genderComplete,
          append_missing_fields: values.appendMissingFields,
          listflex_append_service: values.listflexAppendService,
          dedupe_against: values.dedupeAgainst,
          dedupe_back: convertToInt(values.dedupeBack),
          redirect_after_import: values.redirectAfterImport,
        };

        await dispatch(updateList({ id, payload })).unwrap();
      } catch (error) {
        // Display error in the form instead of alert
        const errorMessage = error?.error || error?.message || error || "Failed to update list";
        setFieldError("listName", errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleStatusChange = async (newStatus) => {
    try {
      formik.setFieldValue("listStatus", newStatus);

      if (newStatus === 'active') {
        await dispatch(activateList(id)).unwrap();
      } else {
        await dispatch(deactivateList(id)).unwrap();
      }
    } catch (error) {
      formik.setFieldValue("listStatus", formik.values.listStatus);
    }
  };

  const handleRequiredFieldChange = (field) => {
    const exists = formik.values.requiredFields.includes(field);
    formik.setFieldValue(
      "requiredFields",
      exists
        ? formik.values.requiredFields.filter((f) => f !== field)
        : [...formik.values.requiredFields, field]
    );
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchListById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (fetchedList) {
      const displayRequiredFields = (fetchedList.requiredFields || []).map(
        (f) => reverseRequiredFieldsMap[f] || f
      );

      formik.setValues({
        listName: fetchedList.listName || "",
        dateEntered: fetchedList.dateEntered || "",
        costPerLead: fetchedList.costPerLead || "",
        listVertical: fetchedList.listVertical || "",
        ownerReshare: fetchedList.ownerReshare || "",
        category: fetchedList.category || fetchedList.listVertical || "",
        howToSell: fetchedList.howToSell === "basic_rules" ? "basic" : (fetchedList.howToSell || "basic"),
        sellTimes: fetchedList.sellTimes === "Unlimited" ? "unlimited" : (fetchedList.sellTimes || "unlimited"),
        salesRep: fetchedList.salesRep || "",
        referrer: fetchedList.referrer || "",
        listStatus: fetchedList.listStatus || "active",
        suppressionScrub: fetchedList.suppressionScrub ?? true,
        level1EmailScrub: fetchedList.level1EmailScrub ?? true,
        level2EmailScrub: fetchedList.level2EmailScrub ?? false,
        level2PhoneScrub: fetchedList.level2PhoneScrub ?? false,
        level3EmailScrub: fetchedList.level3EmailScrub ?? false,
        tcpaScrub: fetchedList.tcpaScrub ?? true,
        usAddressValidation: fetchedList.usAddressValidation ?? false,
        validateIpAddress: fetchedList.validateIpAddress ?? true,
        geoComplete: fetchedList.geoComplete ?? true,
        blockBadWords: fetchedList.blockBadWords ?? false,
        genderComplete: fetchedList.genderComplete ?? true,
        appendMissingFields: fetchedList.appendMissingFields ?? true,
        listflexAppendService: fetchedList.listflexAppendService ?? false,
        dedupeAgainst: fetchedList.dedupeAgainst || "reset",
        dedupeBack: fetchedList.dedupeBack || "",
        requiredFields: displayRequiredFields,
        allowedCountries: (fetchedList.allowedCountries || []).map(String),
        listType: fetchedList.listType || "import",
        redirectAfterImport: fetchedList.redirectAfterImport ?? true,
      });
    }
  }, [fetchedList]);

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: "Vendors", path: "/vendors" },
        {
          label: vendor?.id + " - " + vendor?.name,
          path: "/vendor/" + vendor?.id,
        },
        {
          label: `${fetchedList?.id} - ${fetchedList?.listName}`,
          path: `/vendor/${vendorId}/list/${id}`,
        },
      ])
    );
  }, [dispatch, vendor, fetchedList, vendorId, id]);

  return (
    <>
      <div>
        <Link to={`/vendor/${vendorId}`} style={{ textDecoration: "none" }}>
          <div className="flex items-center gap-2 md:gap-4 text-primary-dark font-bold text-md cursor-pointer">
            <img src={UnionIcon} alt="" className="cursor-pointer" />
            <h2 className="text-md text-primary-dark font-bold cursor-pointer">
              {fetchedList?.id} - {fetchedList?.listName}
            </h2>
          </div>
        </Link>
      </div>

      <div className="mt-4 md:mt-3 min-h-screen sm:px-4">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-x-auto">
          <div className="min-w-[280px]">
            <div className="p-5">
              <h2 className="text-lg text-primary-dark font-bold">
                List ID - {id}
              </h2>
            </div>
            <hr className="border-t border-[#F1F1F4]" />

            <form
              onSubmit={formik.handleSubmit}
              className="custom-form px-3 sm:px-6 md:px-10 mt-0 md:mt-7 flex flex-col gap-4"
            >
              {/* List Name */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 mt-4 md:mt-0">
                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4 cursor-pointer">
                  List Name
                </label>
                <div className="w-full md:w-3/4">
                  <CustomTextField
                    name="listName"
                    placeholder="Oros Partials"
                    value={formik.values.listName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.listName ? formik.errors.listName : ""
                    }
                  />
                </div>
              </div>

              {/* Date Entered */}
              {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4 cursor-default">
                  Date Entered
                </label>
                <div className="w-full md:w-3/4 text-sm text-gray-700 mb-3">
                  {formik.values.dateEntered ? new Date(formik.values.dateEntered).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  }) : "N/A"}
                </div>
              </div> */}

              {/* Fixed Cost Per Lead */}
              {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4 cursor-pointer">
                  Fixed Cost Per Lead
                </label>
                <div className="w-full md:w-3/4">
                  <CustomTextField
                    name="costPerLead"
                    min="0"
                    type="number"
                    placeholder="0.00"
                    value={formik.values.costPerLead}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.costPerLead
                        ? formik.errors.costPerLead
                        : ""
                    }
                  />
                </div>
              </div> */}

              {/* List Vertical */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4 cursor-pointer">
                  List Vertical
                </label>
                <div className="w-full md:w-3/4 cursor-pointer">
                  <CustomTextField
                    name="listVertical"
                    isSelect={true}
                    options={listVerticals}
                    placeholder={listVerticalsLoading ? "Loading verticals..." : "Select Vertical"}
                    value={formik.values.listVertical}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.listVertical
                        ? formik.errors.listVertical
                        : ""
                    }
                    disabled={listVerticalsLoading}
                  />
                </div>
              </div>

              {/* Owner's Reshare % */}
              {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4 cursor-pointer">
                  Owner's Reshare %
                </label>
                <div className="w-full md:w-3/4">
                  <CustomTextField
                    name="ownerReshare"
                    min="0"
                    type="number"
                    placeholder="0"
                    value={formik.values.ownerReshare}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.ownerReshare
                        ? formik.errors.ownerReshare
                        : ""
                    }
                  />
                </div>
              </div> */}

              {/* How to Sell (Radio Group) + Sell Times */}
              {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 flex items-center cursor-pointer">
                  How to Sell
                </label>

                <div className="w-full md:w-3/4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1 flex items-center cursor-pointer">
                    <CustomTextField
                      name="howToSell"
                      isRadio={true}
                      options={[
                        { label: "Basic Rules", value: "basic" },
                        { label: "Advanced Rules", value: "advanced" },
                      ]}
                      value={formik.values.howToSell}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.howToSell ? formik.errors.howToSell : ""
                      }
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral whitespace-nowrap">
                      Sell
                    </span>
                    <div className="w-full cursor-pointer">
                      <CustomTextField
                        name="sellTimes"
                        isSelect={true}
                        options={listStatusOptions}
                        value={formik.values.sellTimes}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.sellTimes
                            ? formik.errors.sellTimes
                            : ""
                        }
                      />
                    </div>
                    <span className="text-sm text-neutral whitespace-nowrap">
                      Times
                    </span>
                  </div>
                </div>
              </div> */}

              {/* Sales Rep */}
              {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4 cursor-pointer">
                  Sales Rep
                </label>
                <div className="w-full md:w-3/4 cursor-pointer">
                  <CustomTextField
                    name="salesRep"
                    isSelect={true}
                    options={[
                      { label: "No Sales Rep", value: "" },
                    ]}
                    value={formik.values.salesRep}
                    onChange={(e) =>
                      formik.setFieldValue("salesRep", e.target.value)
                    }
                    placeholder="...No Sales Rep..."
                  />
                </div>
              </div> */}

              {/* Referrer */}
              {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4 cursor-pointer">
                  Referrer
                </label>
                <div className="w-full md:w-3/4 cursor-pointer">
                  <CustomTextField
                    name="referrer"
                    isSelect={true}
                    options={[
                      { label: "No Referrer", value: "" },
                    ]}
                    value={formik.values.referrer}
                    onChange={(e) =>
                      formik.setFieldValue("referrer", e.target.value)
                    }
                    placeholder="...No Referrer..."
                  />
                </div>
              </div> */}

              {/* List Status */}
              {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4 cursor-pointer">
                  List Status
                </label>
                <div className="w-full md:w-3/4 cursor-pointer">
                  <CustomTextField
                    name="listStatus"
                    isSelect={true}
                    options={[
                      { label: "Active", value: "active" },
                      { label: "Archived", value: "archived" },
                      { label: "Pending", value: "pending" },
                    ]}
                    value={formik.values.listStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    placeholder="Select Status"
                  />
                </div>
              </div> */}

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

              {/* Level 2 Email Scrub */}
              {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                  Level 2 Email Scrub
                </label>
                <div className="w-full md:w-3/4">
                  <CustomTextField
                    name="level2EmailScrub"
                    isRadio={true}
                    options={[
                      { label: "Yes", value: "true" },
                      { label: "No", value: "false" },
                    ]}
                    value={String(formik.values.level2EmailScrub)}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "level2EmailScrub",
                        e.target.value === "true"
                      )
                    }
                  />
                </div>
              </div> */}

              {/* Level 2 Phone Scrub */}
              {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                  Level 2 Phone Scrub
                </label>
                <div className="w-full md:w-3/4">
                  <CustomTextField
                    name="level2PhoneScrub"
                    isRadio={true}
                    options={[
                      { label: "Yes", value: "true" },
                      { label: "No", value: "false" },
                    ]}
                    value={String(formik.values.level2PhoneScrub)}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "level2PhoneScrub",
                        e.target.value === "true"
                      )
                    }
                  />
                </div>
              </div> */}

              {/* Level 3 Email Scrub */}
              {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                  Level 3 Email Scrub
                </label>
                <div className="w-full md:w-3/4">
                  <CustomTextField
                    name="level3EmailScrub"
                    isRadio={true}
                    options={[
                      { label: "Yes", value: "true" },
                      { label: "No", value: "false" },
                    ]}
                    value={String(formik.values.level3EmailScrub)}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "level3EmailScrub",
                        e.target.value === "true"
                      )
                    }
                  />
                </div>
              </div> */}

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
                      formik.setFieldValue(
                        "tcpaScrub",
                        e.target.value === "true"
                      )
                    }
                  />
                </div>
              </div>

              {/* US Address Validation */}
              {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                  US Address Validation
                </label>
                <div className="w-full md:w-3/4">
                  <CustomTextField
                    name="usAddressValidation"
                    isRadio={true}
                    options={[
                      { label: "Yes", value: "true" },
                      { label: "No", value: "false" },
                    ]}
                    value={String(formik.values.usAddressValidation)}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "usAddressValidation",
                        e.target.value === "true"
                      )
                    }
                  />
                </div>
              </div> */}

              {/* Validate IP Address */}
              {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                  Validate IP Address
                </label>
                <div className="w-full md:w-3/4">
                  <CustomTextField
                    name="validateIpAddress"
                    isRadio={true}
                    options={[
                      { label: "Yes", value: "true" },
                      { label: "No", value: "false" },
                    ]}
                    value={String(formik.values.validateIpAddress)}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "validateIpAddress",
                        e.target.value === "true"
                      )
                    }
                  />
                </div>
              </div> */}

              {/* GTO Complete */}
              {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                  GEO Complete
                </label>
                <div className="w-full md:w-3/4">
                  <CustomTextField
                    name="geoComplete"
                    isRadio={true}
                    options={[
                      { label: "Yes", value: "true" },
                      { label: "No", value: "false" },
                    ]}
                    value={String(formik.values.geoComplete)}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "geoComplete",
                        e.target.value === "true"
                      )
                    }
                  />
                </div>
              </div> */}

              {/* Block Bad Words */}
              {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                  Block Bad Words
                </label>
                <div className="w-full md:w-3/4">
                  <CustomTextField
                    name="blockBadWords"
                    isRadio={true}
                    options={[
                      { label: "Yes", value: "true" },
                      { label: "No", value: "false" },
                    ]}
                    value={String(formik.values.blockBadWords)}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "blockBadWords",
                        e.target.value === "true"
                      )
                    }
                  />
                </div>
              </div> */}

              {/* Gender Complete */}
              {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                  Gender Complete
                </label>
                <div className="w-full md:w-3/4">
                  <CustomTextField
                    name="genderComplete"
                    isRadio={true}
                    options={[
                      { label: "Yes", value: "true" },
                      { label: "No", value: "false" },
                    ]}
                    value={String(formik.values.genderComplete)}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "genderComplete",
                        e.target.value === "true"
                      )
                    }
                  />
                </div>
              </div> */}

              {/* Append Missing Fields */}
              {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                  Append Missing Fields
                </label>
                <div className="w-full md:w-3/4">
                  <CustomTextField
                    name="appendMissingFields"
                    isRadio={true}
                    options={[
                      { label: "Yes", value: "true" },
                      { label: "No", value: "false" },
                    ]}
                    value={String(formik.values.appendMissingFields)}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "appendMissingFields",
                        e.target.value === "true"
                      )
                    }
                  />
                </div>
              </div> */}

              {/* Listflex Append Service */}
              {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral mb-0 md:mb-4">
                  Listflex Append Service
                </label>
                <div className="w-full md:w-3/4">
                  <CustomTextField
                    name="listflexAppendService"
                    isRadio={true}
                    options={[
                      { label: "Yes", value: "true" },
                      { label: "No", value: "false" },
                    ]}
                    value={String(formik.values.listflexAppendService)}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "listflexAppendService",
                        e.target.value === "true"
                      )
                    }
                  />
                </div>
              </div> */}

              {/* Dedupe Against */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral">
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
                    className="flex flex-wrap gap-2" // <-- add this for wrapping on small screens
                  />
                </div>
              </div>

              {/* Dedupe Back (Days) */}
              {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral cursor-pointer">
                  Dedupe Back
                </label>
                <div className="w-full md:w-3/4 cursor-pointer">
                  <CustomTextField
                    name="dedupeBack"
                    isSelect={true}
                    options={dedupeBacks}
                    placeholder={dedupeBacksLoading ? "Loading..." : "Select Days"}
                    value={formik.values.dedupeBack}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.dedupeBack ? formik.errors.dedupeBack : ""
                    }
                    disabled={dedupeBacksLoading}
                  />
                </div>
              </div> */}

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
                        name="requiredFields"
                        label={field}
                        checked={formik.values.requiredFields.includes(field)}
                        onChange={() => handleRequiredFieldChange(field)}
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setShowCustomFields((prev) => !prev)}
                    className="mt-2 text-sm text-blue-600 border-b border-dotted border-blue-600 cursor-pointer"
                  >
                    {showCustomFields
                      ? "Hide Custom Fields"
                      : "Show Custom Fields"}
                  </button>

                  {showCustomFields && (
                    <div className="mt-2">{/* custom fields area */}</div>
                  )}
                </div>
              </div>

              {/* Allowed Countries */}
              {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral cursor-pointer text-nowrap">
                  Allowed Countries
                </label>
                <div className="w-full md:w-3/4">
                  <div className="flex flex-wrap gap-2">
                    {countriesLoading ? (
                      <span className="text-sm text-neutral">Loading countries...</span>
                    ) : (
                      countries.map((country) => (
                        <div key={country.value} className="flex items-center gap-1">
                          <Checkbox
                            id={`country-${country.value}`}
                            checked={formik.values.allowedCountries.includes(String(country.value))}
                            onChange={() => {
                              const countryIdStr = String(country.value);
                              const exists = formik.values.allowedCountries.includes(countryIdStr);
                              formik.setFieldValue(
                                "allowedCountries",
                                exists
                                  ? formik.values.allowedCountries.filter((c) => c !== countryIdStr)
                                  : [...formik.values.allowedCountries, countryIdStr]
                              );
                            }}
                          />
                          <label htmlFor={`country-${country.value}`} className="text-sm cursor-pointer whitespace-nowrap">
                            {country.label}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div> */}

              {/* List Type */}
              {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 mt-4 md:mt-0">
                <label className="w-full md:w-1/4 text-sm text-neutral cursor-pointer">
                  List Type
                </label>
                <div className="w-full md:w-3/4 cursor-pointer">
                  <CustomTextField
                    name="listType"
                    isRadio={true}
                    options={[
                      { label: "Import", value: "import" },
                      { label: "Priority Order", value: "priority_order" },
                      { label: "Bidding", value: "bidding" },
                    ]}
                    value={formik.values.listType}
                    onChange={formik.handleChange}
                  />
                </div>
              </div> */}

              {/* Redirect After Import */}
              {/* <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral cursor-pointer">
                  Redirect After Import
                </label>
                <div className="w-full md:w-3/4 cursor-pointer">
                  <CustomTextField
                    name="redirectAfterImport"
                    isRadio={true}
                    options={[
                      { label: "Yes", value: "true" },
                      { label: "No", value: "false" },
                    ]}
                    value={String(formik.values.redirectAfterImport)}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "redirectAfterImport",
                        e.target.value === "true"
                      )
                    }
                  />
                </div>
              </div> */}

              <CustomButton
                type="submit"
                fullWidth={false}
                className="px-6 py-3 text-sm font-bold sm:text-base rounded-xl cursor-pointer my-8"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? "Saving..." : "Save List Detail"}
              </CustomButton>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default VendorListDetail;
