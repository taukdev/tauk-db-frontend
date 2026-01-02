// ModifyPosts.jsx
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import UnionIcon from "../../assets/icons/Union-icon.svg";
import { Link, useParams } from "react-router-dom";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import GraphIcon from "../../assets/icons/graph-icons.svg";
import DangerCircleIcon from "../../assets/icons/DangerCircle-icon.svg";
import CustomTextField from "../CustomTextField";
import { useDispatch, useSelector } from "react-redux";
import { setBreadcrumbs } from "../../features/breadcrumb/breadcrumbSlice";
import CustomButton from "../CustomButton";
import Checkbox from "../../components/common/Checkbox";
import DateTimePickerForModifyPost from "../DateTimePickerForModifyPost";
import vectorIcon from "../../assets/vector.svg";
import Dropdown from "../common/Dropdown";
import { getCountriesApi, getStatesApi } from "../../api/platforms";
import { getDedupeBackApi } from "../../api/vendors";

const validationSchema = Yup.object({
  leadOrderId: Yup.string().required("Lead Order ID is required"),
  dateEntered: Yup.string().required("Date Entered is required"),
  orderNotes: Yup.string(),
  internalViewOnly: Yup.string().required(
    "Internal View Only selection is required"
  ),
  realtimePost: Yup.string().required("Realtime Post selection is required"),
  postIntegration: Yup.string().required(
    "Post Integration selection is required"
  ),
  ownerNotes: Yup.string(),
  whenLeadsTurn: Yup.string().required("When Leads Turn selection is required"),
  leadsCap: Yup.string(),
  qualityLeadCap: Yup.string(),
  dailyRefreshPosts: Yup.number().min(0).max(100, "Must be between 0-100"),
  pricePerLead: Yup.number().min(0, "Price must be positive"),
  deliverBookDays: Yup.string().required(
    "Deliver Book Days selection is required"
  ),
  passOrderAfter: Yup.string(),
  dataLastSynced: Yup.string().required(
    "Data Last Synced selection is required"
  ),
  optForRecording: Yup.string().required(
    "Opt For Recording selection is required"
  ),
  selectedFields: Yup.array().min(1, "At least one field must be selected"),
  broadcasting: Yup.string(),
  scheduled: Yup.string(),
  overrides: Yup.string(),
  gender: Yup.string(),
  states: Yup.string(),
  areaCodes: Yup.string(),
  zipCodes: Yup.string(),
  bookDomainGroups: Yup.string(),
  leadLocks: Yup.string(),
  filterByCustomField: Yup.string(),
  filterByOfferUrl: Yup.string(),
  excludeIps: Yup.string(),
  supersededFiles: Yup.string(),
  howToSend: Yup.string().required("How to Send selection is required"),
});

const platformsList = [
  "Facebook",
  "Google",
  "Twitter",
  "LinkedIn",
  "Instagram",
  "TikTok",
  "Snapchat",
];

function ModifyPosts() {
  const { id } = useParams();
  const platforms = useSelector((state) => state.platform.platforms || []);
  const defaultPlatformId = platforms?.[0]?.id || "";

  const [expanded, setExpanded] = useState(null);

  // Available fields for selection
  const availableFields = [
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

  const formik = useFormik({
    initialValues: {
      leadOrderId: id || "",
      modifyPost: "Advertise Health",
      dateEntered: "Jun 5, 2023, 10:38 pm",
      orderNotes: "",
      internalViewOnly: "Yes",
      realtimePost: "Yes",
      postIntegration: "API URL Specified via LEAD",
      ownerNotes: "Sent due to 5 minute update",
      whenLeadsTurn: "Default",
      leadsCap: "",
      qualityLeadCap: "",
      dailyRefreshPosts: 80,
      pricePerLead: "",
      deliverBookDays: "Default Delivery",
      passOrderAfter: "Yes",
      dataLastSynced: "This feature is not expected",
      optForRecording: "This feature is not expected",
      selectedFields: [],
      broadcasting: "",
      scheduled: "",
      overrides: "",
      gender: "",
      states: "",
      areaCodes: "",
      zipCodes: "",
      bookDomainGroups: "",
      leadLocks: "",
      filterByCustomField: "",
      filterByOfferUrl: "",
      excludeIsps: "",
      includeIsps: "",
      suppressionFiles: "",
      postStatus: "",
      howToSave: "Save Existing",
      leadPost: "635",
      delayBetweenPosts: 987,
      liveFeedDelayBetweenPosts: 0,

      // Miscellaneous controls
      postStartTime: "",
      deliverFromHour: "",
      deliverFromMin: "",
      deliverToHour: "",
      deliverToMin: "",
      weekdays: [],
      countries: [],
      excludeStates: false,
      areaCodesInput: "",
      excludeAreaCodes: false,
      zipCodesInput: "",
      excludeZipCodes: false,
      bookDomainGroupsSelect: "",
      disregardLocks: false,
      filterByCustomFieldValues: "",
      filterByCustomFieldMode: "include",
      filterByOfferUrlInput: "",
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Form submitted:", values);
    },
  });

  const leadsPerDay = Math.floor(
    formik.values.delayBetweenPosts > 0
      ? (24 * 60 * 60) / formik.values.delayBetweenPosts
      : 0
  );

  const toggleWeekday = (day) => {
    const current = formik.values.weekdays || [];
    if (current.includes(day)) {
      formik.setFieldValue(
        "weekdays",
        current.filter((d) => d !== day)
      );
    } else {
      formik.setFieldValue("weekdays", [...current, day]);
    }
  };

  const handleFieldSelection = (field) => {
    const currentFields = formik.values.selectedFields;
    if (currentFields.includes(field)) {
      formik.setFieldValue(
        "selectedFields",
        currentFields.filter((f) => f !== field)
      );
    } else {
      formik.setFieldValue("selectedFields", [...currentFields, field]);
    }
  };

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: "Outgoing Posts", path: "/outgoing-post" },
        {
          label: `${id} - Live Post Order`,
          path: `/outgoing-post/${id}/modify`,
        },
      ])
    );
  }, [dispatch, id]);

  const [searchQuery, setSearchQuery] = useState("");
  const [platformList] = useState(platformsList);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);

  // State for countries and states dropdowns
  const [countriesOptions, setCountriesOptions] = useState([]);
  const [statesOptions, setStatesOptions] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [statesLoading, setStatesLoading] = useState(true);

  // State for dedupe back days dropdown
  const [dedupeBackOptions, setDedupeBackOptions] = useState([
    { label: "Do Not Dedupe", value: "Do Not Dedupe" },
  ]);
  const [dedupeBackLoading, setDedupeBackLoading] = useState(true);

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setCountriesLoading(true);
        const response = await getCountriesApi();
        
        // Handle different response structures
        let countriesData = [];
        if (Array.isArray(response)) {
          countriesData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          countriesData = response.data;
        } else if (response?.data?.countries && Array.isArray(response.data.countries)) {
          countriesData = response.data.countries;
        }

        // Format countries for dropdown
        const formattedCountries = countriesData.map((country) => {
          // Handle different country data structures
          const countryName = typeof country === 'string' 
            ? country 
            : country.name || country.country_name || country.country || String(country.id || "");
          
          return {
            label: countryName,
            value: countryName
          };
        });

        setCountriesOptions(formattedCountries);
      } catch (error) {
        console.error("Error fetching countries:", error);
        // Keep empty array on error
        setCountriesOptions([]);
      } finally {
        setCountriesLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Fetch states on component mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        setStatesLoading(true);
        const response = await getStatesApi();
        
        // Handle different response structures
        let statesData = [];
        if (Array.isArray(response)) {
          statesData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          statesData = response.data;
        } else if (response?.data?.states && Array.isArray(response.data.states)) {
          statesData = response.data.states;
        }

        // Format states for dropdown
        const formattedStates = statesData.map((state) => {
          // Handle different state data structures
          const stateName = typeof state === 'string' 
            ? state 
            : state.name || state.state_name || state.state || String(state.id || "");
          
          return {
            label: stateName,
            value: stateName
          };
        });

        setStatesOptions(formattedStates);
      } catch (error) {
        console.error("Error fetching states:", error);
        // Keep empty array on error
        setStatesOptions([]);
      } finally {
        setStatesLoading(false);
      }
    };

    fetchStates();
  }, []);

  // Fetch dedupe back days on component mount
  useEffect(() => {
    const fetchDedupeBacks = async () => {
      try {
        setDedupeBackLoading(true);
        const response = await getDedupeBackApi();
        
        // Handle different response structures
        let dedupeBacksData = [];
        if (Array.isArray(response)) {
          dedupeBacksData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          dedupeBacksData = response.data;
        } else if (response?.data?.dedupe_backs && Array.isArray(response.data.dedupe_backs)) {
          dedupeBacksData = response.data.dedupe_backs;
        }

        // Format dedupe backs for dropdown
        // Always include "Do Not Dedupe" as first option
        const formattedOptions = [
          { label: "Do Not Dedupe", value: "Do Not Dedupe" }
        ];

        // Add API options
        const apiOptions = dedupeBacksData.map((item) => {
          // Handle different data structures
          if (typeof item === 'object' && item !== null) {
            // If it has label and value/id
            if (item.label) {
              return {
                label: item.label,
                value: String(item.id || item.value || item.label)
              };
            }
            // If it's just a number (days)
            if (typeof item.id === 'number' || typeof item.value === 'number') {
              const days = item.id || item.value;
              return {
                label: `${days} Days`,
                value: String(days)
              };
            }
            // If it has a name or days property
            if (item.name) {
              return {
                label: item.name,
                value: String(item.id || item.value || item.name)
              };
            }
            if (item.days) {
              return {
                label: `${item.days} Days`,
                value: String(item.days)
              };
            }
          }
          
          // Handle string values like "30 Days" or "30"
          if (typeof item === 'string') {
            const match = item.match(/\d+/);
            if (match) {
              const days = match[0];
              return {
                label: item.includes('Days') || item.includes('days') ? item : `${item} Days`,
                value: days
              };
            }
            return {
              label: item,
              value: item
            };
          }
          
          // Handle number values
          if (typeof item === 'number') {
            return {
              label: `${item} Days`,
              value: String(item)
            };
          }
          
          return null;
        }).filter(Boolean);

        // Add "No Limit" if not already present
        const hasNoLimit = apiOptions.some(opt => 
          opt.label.toLowerCase().includes('no limit') || 
          opt.value.toLowerCase().includes('no limit')
        );
        
        if (!hasNoLimit) {
          apiOptions.push({ label: "No Limit", value: "No Limit" });
        }

        setDedupeBackOptions([...formattedOptions, ...apiOptions]);
      } catch (error) {
        console.error("Error fetching dedupe backs:", error);
        // Keep default option on error
        setDedupeBackOptions([
          { label: "Do Not Dedupe", value: "Do Not Dedupe" },
          { label: "No Limit", value: "No Limit" }
        ]);
      } finally {
        setDedupeBackLoading(false);
      }
    };

    fetchDedupeBacks();
  }, []);

  const handleSelect = (platform) => {
    setSelectedPlatforms([...selectedPlatforms, platform]);
  };

  const handleDeselect = (platform) => {
    setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform));
  };

  const handleSelectAll = () => {
    setSelectedPlatforms([...platformList]);
  };

  const handleDeselectAll = () => {
    setSelectedPlatforms([]);
  };

  const filteredPlatforms = platformList.filter(
    (p) =>
      !selectedPlatforms.includes(p) &&
      p.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLeadDeliveryClick = () => {
    const platform = platforms?.[0];
    if (!platform) return;
    dispatch(
      setBreadcrumbs([
        { label: "Platform", path: "/platform" },
        {
          label: `${platform.id} - ${platform.name}`,
          path: `/platform/${platform.id}`,
        },
        {
          label: `${id} - Lead Order`,
          path: `/platform/${platform.id}/orders/${id}`,
        },
        {
          label: "Lead Delivery Report",
          path: `/platform/${platform.id}/orders/${id}/lead-delivery-report`,
        },
      ])
    );
  };

  // Weekday labels for Scheduling panel
  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between w-full pb-2 gap-2">
        <Link
          to="/outgoing-post"
          className="flex items-center gap-2 md:gap-4 text-primary-dark no-underline"
        >
          <img src={UnionIcon} alt="Back" className="w-4 h-4" />
          <h2 className="text-md font-bold">{id} - Live Post Order</h2>
        </Link>

        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
          <button
            onClick={() => console.log("Search Report")}
            className="flex items-center justify-center gap-1 text-primary px-3 py-2 border border-[#1B84FF33] bg-[#EFF6FF] rounded-[6px] text-sm font-medium"
          >
            <Search size={16} color="#1B84FF" className="mr-1" />
            View Post Logs
          </button>

          <Link
            to={`/platform/${defaultPlatformId}/orders/${id}/lead-delivery-report`}
            onClick={handleLeadDeliveryClick}
          >
            <button className="flex items-center justify-center gap-1 px-3 py-2 border border-default cursor-pointer rounded-[6px] text-sm font-medium text-primary-dark bg-white">
              <img src={GraphIcon} alt="Graph" className="w-4 h-4 mr-1" />
              Lead Delivery Report
            </button>
          </Link>
        </div>
      </div>

      <div className="md:p-10 min-h-screen">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md">
          <div className="p-5">
            <h2 className="text-md text-primary-dark font-bold">
              Lead Delivery Report
            </h2>
          </div>
          <hr className="border-t border-[#F1F1F4]" />
          <div className="mx-6 mt-5 md:m-10 md:mt-7">
            <form
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-4"
            >
              {/* Lead Order ID */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                  Lead Order ID
                </label>
                <div className="w-full md:w-3/4">
                  <CustomTextField
                    name="leadOrderId"
                    size="sm"
                    type="text"
                    placeholder="Enter Lead Order ID"
                    value={formik.values.leadOrderId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.leadOrderId
                        ? formik.errors.leadOrderId
                        : ""
                    }
                  />
                </div>
              </div>

              {/* Advertise Health */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                  Advertise Health
                </label>
                <div className="w-full md:w-3/4">
                  <span className="text-sm text-primary underline decoration-dotted underline-offset-4 cursor-pointer">
                    {formik.values.modifyPost}
                  </span>
                </div>
              </div>

              {/* Date Entered */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                  Date Entered
                </label>
                <div className="w-full md:w-3/4">
                  <span className="text-sm">{formik.values.dateEntered}</span>
                </div>
              </div>

              {/* Order Notes */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                  Order Notes
                </label>
                <div className="w-full md:w-3/4">
                  <CustomTextField
                    name="orderNotes"
                    size="sm"
                    isTextArea={true}
                    placeholder="Write note"
                    value={formik.values.orderNotes}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.orderNotes ? formik.errors.orderNotes : ""
                    }
                    rows={3}
                  />
                </div>
              </div>

              {/* Internal View Only */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                  Internal View Only
                </label>
                <div className="w-full md:w-3/4">
                  <CustomTextField
                    name="internalViewOnly"
                    isRadio={true}
                    options={[
                      { label: "Yes", value: "Yes" },
                      { label: "No", value: "No" },
                    ]}
                    value={formik.values.internalViewOnly}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.internalViewOnly
                        ? formik.errors.internalViewOnly
                        : ""
                    }
                  />
                </div>
              </div>

              {/* Realtime Post */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                  Realtime Post
                </label>
                <div className="w-full md:w-3/4">
                  <CustomTextField
                    name="realtimePost"
                    isRadio={true}
                    options={[
                      { label: "Yes", value: "Yes" },
                      { label: "No", value: "No" },
                    ]}
                    value={formik.values.realtimePost}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.realtimePost
                        ? formik.errors.realtimePost
                        : ""
                    }
                  />
                </div>
              </div>

              {/* Post Integration */}
              <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full">
                <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                  Post Integration
                </label>

                <div className="w-full md:w-3/4 flex flex-col sm:flex-row gap-2">
                  <div className="w-full sm:w-[75%]">
                    <CustomTextField
                      size="sm"
                      name="postIntegration"
                      isSelect={true}
                      options={[
                        {
                          label: "AH Diet Partials Bio P 92",
                          value: "AH Diet Partials Bio P 92",
                        },
                        {
                          label: "AH Diet Partials Super P 92",
                          value: "AH Diet Partials Super P 92",
                        },
                        {
                          label: "AH Diet Partials FB P 104",
                          value: "AH Diet Partials FB P 104",
                        },
                        {
                          label: "AH Diet Partials 105",
                          value: "AH Diet Partials 105",
                        },
                        {
                          label: "AH Diet Declines 106 Super D",
                          value: "AH Diet Declines 106 Super D",
                        },
                        {
                          label: "AH Diet Declines 96 Bio D",
                          value: "AH Diet Declines 96 Bio D",
                        },
                        {
                          label: "AH Diet Declines 106 Super DNU",
                          value: "AH Diet Declines 106 Super DNU",
                        },
                      ]}
                      placeholder="Post Integration"
                      value={formik.values.postIntegration}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.postIntegration
                          ? formik.errors.postIntegration
                          : ""
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="text-sm text-primary underline decoration-dotted underline-offset-4 cursor-pointer"
                  >
                    Edit this Integration
                  </button>
                </div>
              </div>

              {/* Cutoff Date */}
              <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full">
                <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                  Cutoff Date
                </label>

                <div className="w-full md:w-3/4 flex flex-col sm:flex-row gap-2">
                  <div className="w-full sm:w-[75%]">
                    <CustomTextField
                      name="cutoffDate"
                      size="sm"
                      type="text"
                      placeholder="2023-05-11 21:19:24"
                      value={formik.values.cutoffDate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.cutoffDate
                          ? formik.errors.cutoffDate
                          : ""
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="text-sm text-primary underline decoration-dotted underline-offset-4 cursor-pointer"
                  >
                    Update
                  </button>
                </div>
              </div>

              {/* When Leads Turn */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                  When Leads Turn
                </label>
                <div className="w-full md:w-3/4">
                  <CustomTextField
                    size="sm"
                    name="whenLeadsTurn"
                    isSelect={true}
                    options={[
                      { label: "0 Hours", value: "0 Hours" },
                      { label: "1 Hour", value: "1 Hour" },
                      { label: "3 Hour", value: "3 Hour" },
                      { label: "6 Hours", value: "6 Hours" },
                      { label: "1 Day", value: "1 Day" },
                      { label: "1 Day", value: "1 Day" },
                    ]}
                    placeholder="0 Hours"
                    value={formik.values.whenLeadsTurn}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.whenLeadsTurn
                        ? formik.errors.whenLeadsTurn
                        : ""
                    }
                  />
                </div>
              </div>

              {/* Leads Posted */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                  Leads Posted
                </label>
                <div className="w-full md:w-3/4">
                  <span className="text-sm">{formik.values.leadPost}</span>
                </div>
              </div>

              {/* Overall Lead Cap */}
              <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full">
                <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                  Overall Lead Cap
                </label>

                <div className="w-full md:w-3/4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <div className="w-full sm:w-[60%]">
                    <CustomTextField
                      size="sm"
                      name="overallleadcap"
                      min="0"
                      type="number"
                      step="0"
                      value={formik.values.overallleadcap}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.overallleadcap
                          ? formik.errors.overallleadcap
                          : ""
                      }
                      placeholder="0"
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    (set cap to 0 to make order unlimited)
                  </span>
                </div>
              </div>

              {/* Daily Lead Cap */}
              <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full">
                <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                  Daily Lead Cap
                </label>

                <div className="w-full md:w-3/4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <div className="w-full sm:w-[60%]">
                    <CustomTextField
                      size="sm"
                      name="dailyleadcap"
                      min="0"
                      type="number"
                      step="0"
                      value={formik.values.dailyleadcap}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.dailyleadcap
                          ? formik.errors.dailyleadcap
                          : ""
                      }
                      placeholder="0"
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    (set cap to 0 to not have a daily cap)
                  </span>
                </div>
              </div>

              {/* Delay Between Posts */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 w-full">
                <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                  Delay Between Posts
                </label>

                <div className="w-full md:w-3/4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <div>
                      <span>{formik.values.delayBetweenPosts} Seconds</span>
                      &nbsp;&nbsp;
                      <span className="bg-secondary-light">
                        ({leadsPerDay} leads per day)
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="3600"
                    step="1"
                    name="liveFeedDelayBetweenPosts"
                    value={formik.values.liveFeedDelayBetweenPosts || 0}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "liveFeedDelayBetweenPosts",
                        parseInt(e.target.value, 10)
                      )
                    }
                    className="w-full custom-range"
                    style={{
                      background: `linear-gradient(
                        to right,
                        #1F6FEB 0%,
                        #1F6FEB ${
                          ((formik.values.liveFeedDelayBetweenPosts || 0) /
                            3600) *
                          100
                        }%,
                        #e5e7eb ${
                          ((formik.values.liveFeedDelayBetweenPosts || 0) /
                            3600) *
                          100
                        }%,
                        #e5e7eb 100%
                      )`,
                    }}
                  />
                  <style>{`
                    input.custom-range {
                      -webkit-appearance: none;
                      appearance: none;
                      height: 8px;
                      border-radius: 999px;
                      padding: 0;
                      outline: none;
                    }
                    input.custom-range::-webkit-slider-runnable-track {
                      height: 8px;
                      border-radius: 999px;
                    }
                    input.custom-range::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      appearance: none;
                      width: 18px;
                      height: 18px;
                      border-radius: 999px;
                      background: #1F6FEB;
                      border: 3px solid #ffffff;
                      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                      margin-top: -5px;
                      cursor: pointer;
                    }
                    input.custom-range::-moz-range-track {
                      height: 8px;
                      border-radius: 999px;
                    }
                    input.custom-range::-moz-range-thumb {
                      width: 18px;
                      height: 18px;
                      border-radius: 999px;
                      background: #1F6FEB;
                      border: 3px solid #ffffff;
                      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                      cursor: pointer;
                    }
                  `}</style>
                </div>
              </div>

              {/* Price Per Lead */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                  Price Per Lead
                </label>
                <div className="w-full md:w-3/4">
                  <CustomTextField
                    size="sm"
                    name="pricePerLead"
                    min="0"
                    type="number"
                    step="0.01"
                    value={formik.values.pricePerLead}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.pricePerLead
                        ? formik.errors.pricePerLead
                        : ""
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Dedupe Back Days */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                  Dedupe Back Days
                </label>
                <div className="w-full md:w-3/4">
                  <CustomTextField
                    size="sm"
                    name="DoNotDedupe"
                    isSelect
                    options={dedupeBackOptions}
                    placeholder={dedupeBackLoading ? "Loading..." : "Select Dedupe Back Days"}
                    value={formik.values.DoNotDedupe}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.DoNotDedupe
                        ? formik.errors.DoNotDedupe
                        : ""
                    }
                    disabled={dedupeBackLoading}
                  />
                </div>
              </div>

              {/* Pause Order After */}
              <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full">
                <label className="w-full md:w-1/4 text-sm text-neutral font-medium mt-1">
                  Pause Order After
                </label>

                <div className="w-full md:w-3/4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <div className="w-full sm:w-[60%]">
                    <CustomTextField
                      size="sm"
                      name="pauseOrderAfter"
                      isSelect
                      options={[
                        { label: 10, value: 10 },
                        { label: 50, value: 50 },
                        { label: 100, value: 100 },
                        { label: 150, value: 150 },
                        { label: 200, value: 200 },
                        { label: 300, value: 300 },
                        { label: 500, value: 500 },
                        { label: 1000, value: 1000 },
                        { label: "Never Pause", value: "Never Pause" },
                      ]}
                      placeholder="Post Integration"
                      value={formik.values.pauseOrderAfter}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                  <button type="button" className="text-sm text-gray-600">
                    Unsuccessful Post Attempts in a Row
                  </button>
                </div>
              </div>

              {/* Date Last Seeded */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                  Date Last Seeded
                </label>
                <div className="flex items-center gap-2 text-sm text-gray-600 md:w-3/4">
                  <img
                    src={DangerCircleIcon}
                    alt="warning"
                    className="w-4 h-4"
                  />
                  This feature is not enabled
                </div>
              </div>

              {/* Due for Seeding */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                  Due for Seeding
                </label>
                <div className="flex items-center gap-2 text-sm text-gray-600 md:w-3/4">
                  <img
                    src={DangerCircleIcon}
                    alt="warning"
                    className="w-4 h-4"
                  />
                  This feature is not enabled
                </div>
              </div>

              {/* Selected Fields */}
              <div className="flex flex-col md:flex-row items-start gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                  Selected Fields
                </label>
                <div className="w-full md:w-3/4 flex flex-col gap-2">
                  {availableFields.map((field) => (
                    <div key={field} className="mb-1">
                      <Checkbox
                        id={`field-${field}`}
                        name="selectedFields"
                        label={field}
                        checked={formik.values.selectedFields.includes(field)}
                        onChange={() => handleFieldSelection(field)}
                        className="text-sm"
                        checkboxSize="w-4 h-4"
                        labelClassName="text-sm text-neutral"
                      />
                    </div>
                  ))}
                  <span className="text-sm text-primary underline decoration-dotted underline-offset-4 cursor-pointer mb-2">
                    Show Custom Fields
                  </span>
                  <hr className="border-t border-[#F1F1F4]" />
                  <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                    <label className="w-full md:w-2/4 text-sm text-neutral">
                      Field Selection Strictness
                    </label>
                    <div className="w-full md:w-3/4">
                      <CustomTextField
                        name="internalViewOnly"
                        isRadio={true}
                        options={[
                          { label: "Strict", value: "Strict" },
                          { label: "Loose", value: "Loose" },
                        ]}
                        value={formik.values.internalViewOnly}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.internalViewOnly
                            ? formik.errors.internalViewOnly
                            : ""
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Select Platforms */}
              <div className="mb-6">
                <h3 className="text-primary-dark text-sm font-medium mb-3">
                  Select Platforms
                </h3>

                <div className="flex flex-col md:flex-row gap-3 justify-between">
                  {/* Available Platforms */}
                  <div className="mt-3 w-full">
                    <div className="rounded-custom-lg border border-separator bg-neutral-input overflow-hidden">
                      <div className="relative w-full p-3">
                        <input
                          type="text"
                          placeholder="Search lists by name or ID"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full border border-gray-300 bg-neutral-input rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                        <Search className="absolute left-6 top-6 h-4 w-4 text-gray-400" />
                      </div>
                      <div className="h-39.5 overflow-y-auto ">
                        <ul className="divide-y divide-gray-100">
                          {filteredPlatforms.length === 0 ? (
                            <li className="px-4 py-2 text-sm text-gray-400">
                              No platforms found
                            </li>
                          ) : (
                            filteredPlatforms.map((platform) => (
                              <li
                                key={platform}
                                className="px-4 py-2 text-sm cursor-pointer hover:bg-[#F5F7F9]"
                                onClick={() => handleSelect(platform)}
                              >
                                {platform}
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Selected Platforms */}
                  <div className="mt-3 w-full">
                    <h4 className="text-sm text-neutral font-medium mb-2 w-full">
                      You have selected
                    </h4>
                    <div className="rounded-custom-lg border border-separator overflow-hidden">
                      <div className="h-48 overflow-y-auto bg-neutral-input">
                        <ul className="divide-y divide-gray-100">
                          {selectedPlatforms.length === 0 ? (
                            <li className="px-4 py-2 text-sm text-gray-400">
                              No platforms selected
                            </li>
                          ) : (
                            selectedPlatforms.map((platform) => (
                              <li
                                key={platform}
                                className="px-4 py-2 text-sm cursor-pointer hover:bg-[#F5F7F9] flex items-center justify-between"
                                onClick={() => handleDeselect(platform)}
                              >
                                {platform}
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-[13px] text-left">
                  <button
                    type="button"
                    className="text-primary underline decoration-dashed underline-offset-4 mr-2"
                    onClick={handleSelectAll}
                  >
                    Select All
                  </button>
                  /
                  <button
                    type="button"
                    className="text-primary underline decoration-dashed underline-offset-4 ml-2"
                    onClick={handleDeselectAll}
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Miscellaneous Stuff (Accordion with full controls) */}
              <div className="flex flex-col md:flex-row items-start gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                  Miscellaneous Stuff
                </label>
                <div className="w-full md:w-3/4 p-2 border rounded-custom-lg border-separator">
                  <div className="bg-white rounded-custom-lg divide-y divide-gray-100">
                    {/* Lead Validation */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setExpanded(expanded === 0 ? null : 0)}
                        className={`w-full cursor-pointer flex items-center justify-between px-4 py-3 text-left rounded-lg ${
                          expanded === 0 ? "bg-neutral" : ""
                        }`}
                      >
                        <span
                          className={`font-medium text-[13px] ${
                            expanded === 0 ? "text-primary" : ""
                          }`}
                        >
                          Lead Validation
                        </span>
                        <span className="ml-2 text-gray-400">
                          {expanded === 0 ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </span>
                      </button>
                      {expanded === 0 && (
                        <div className="px-4 py-2 bg-white">
                          <p className="flex items-start gap-2 text-sm text-neutral">
                            <img
                              src={DangerCircleIcon}
                              alt="warning"
                              className="w-4 h-4 mt-0.5"
                            />
                            <span>
                              This feature is disabled.{" "}
                              <a
                                href="#"
                                className="underline text-neutral font-bold"
                              >
                                Click here
                              </a>{" "}
                              to enable.
                            </span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Scheduling */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setExpanded(expanded === 1 ? null : 1)}
                        className={`w-full cursor-pointer flex items-center justify-between px-4 py-3 text-left rounded-lg ${
                          expanded === 1 ? "bg-neutral" : ""
                        }`}
                      >
                        <span
                          className={`font-medium text-[13px] ${
                            expanded === 1 ? "text-primary" : ""
                          }`}
                        >
                          Scheduling
                        </span>
                        <span className="ml-2 text-gray-400">
                          {expanded === 1 ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </span>
                      </button>

                      {expanded === 1 && (
                        <div className="px-4 py-4 bg-white">
                          {/* Post Start Time */}
                          <div className="mb-4">
                            <label className="block text-[13px] text-primary-dark font-medium mb-2">
                              Post Start Time
                            </label>

                            {/* DateTimePickerForModifyPost is Formik-aware: pass formik and field name */}
                            <DateTimePickerForModifyPost
                              formik={formik}
                              name="postStartTime"
                              placeholder="0000-00-00 00:00:00"
                              // optional: label override
                              // label="Schedule Start Time"
                              className="w-full"
                            />
                          </div>

                          {/* Hours range */}
                          <div className="mb-4">
                            <div className="text-sm text-primary-dark font-medium mb-2">
                              Only Deliver Leads Between the Hours of:
                            </div>
                            <div className="text-sm text-gray-500 mb-3">
                              (Currently delivery takes place 24 hours a day)
                            </div>

                            {/* Hours grid (boxes like screenshot) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                              {/* From */}
                              <div>
                                <div className="text-sm font-medium mb-1">
                                  From
                                </div>
                                <div className="flex items-center gap-4">
                                  {/* Hour box */}
                                  <Dropdown
                                    value={formik.values.deliverFromHour}
                                    onChange={(val) =>
                                      formik.setFieldValue(
                                        "deliverFromHour",
                                        val
                                      )
                                    }
                                    placeholder="00"
                                    options={[...Array(25).keys()].map((h) =>
                                      String(h).padStart(2, "0")
                                    )}
                                    className="w-28"
                                  />

                                  {/* colon */}
                                  <div className="text-sm font-bold">:</div>

                                  {/* Minute box */}
                                  <Dropdown
                                    value={formik.values.deliverFromMin}
                                    onChange={(val) =>
                                      formik.setFieldValue(
                                        "deliverFromMin",
                                        val
                                      )
                                    }
                                    placeholder="00"
                                    options={["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"]}
                                    className="w-28"
                                  />
                                </div>
                              </div>

                              {/* To */}
                              <div>
                                <div className="text-sm font-medium mb-1">
                                  To
                                </div>
                                <div className="flex items-center gap-4">
                                  {/* Hour box */}
                                  <Dropdown
                                    value={formik.values.deliverToHour}
                                    onChange={(val) =>
                                      formik.setFieldValue("deliverToHour", val)
                                    }
                                    placeholder="00"
                                    options={[...Array(24).keys()].map((h) =>
                                      String(h).padStart(2, "0")
                                    )}
                                    className="w-28"
                                  />

                                  <div className="text-sm font-bold">:</div>

                                  {/* Minute box */}
                                  <Dropdown
                                    value={formik.values.deliverToMin}
                                    onChange={(val) =>
                                      formik.setFieldValue("deliverToMin", val)
                                    }
                                    placeholder="00"
                                    options={["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"]}
                                    className="w-28"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Weekday checkboxes (vertical) */}
                          <div>
                            <div className="text-[13px] text-primary-dark font-medium mb-3">
                              Only Deliver on Following Weekdays
                            </div>

                            <div className="flex flex-col gap-2">
                              {[
                                "Sun",
                                "Mon",
                                "Tue",
                                "Wed",
                                "Thu",
                                "Fri",
                                "Sat",
                              ].map((d) => (
                                <div key={d} className="mb-1">
                                  <Checkbox
                                    id={`weekday-${d}`}
                                    name="weekdays"
                                    label={d}
                                    checked={(
                                      formik.values.weekdays || []
                                    ).includes(d)}
                                    onChange={() => {
                                      const cur = formik.values.weekdays || [];
                                      if (cur.includes(d))
                                        formik.setFieldValue(
                                          "weekdays",
                                          cur.filter((x) => x !== d)
                                        );
                                      else
                                        formik.setFieldValue("weekdays", [
                                          ...cur,
                                          d,
                                        ]);
                                    }}
                                    checkboxSize="w-5 h-5"
                                    labelClassName="text-sm "
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Countries */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setExpanded(expanded === 2 ? null : 2)}
                        className={`w-full cursor-pointer flex items-center justify-between px-4 py-3 text-left rounded-lg ${
                          expanded === 2 ? "bg-neutral" : ""
                        }`}
                      >
                        <span
                          className={`font-medium text-[13px] ${
                            expanded === 2 ? "text-primary" : ""
                          }`}
                        >
                          Countries
                        </span>
                        <span className="ml-2 text-gray-400">
                          {expanded === 2 ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </span>
                      </button>
                      {expanded === 2 && (
                        <div className="px-0 py-2 bg-white">
                          {/* Inline dropdown container (screenshot style) */}
                          <div className="w-full bg-white rounded-[10px] border border-[#E6E9EE] overflow-hidden">
                            <div
                              className="max-h-[204px] overflow-y-auto"
                              style={{ paddingTop: 0, paddingBottom: 0 }}
                            >
                              {countriesLoading ? (
                                <div className="px-6 py-4 text-center text-gray-500">
                                  Loading countries...
                                </div>
                              ) : countriesOptions.length === 0 ? (
                                <div className="px-6 py-4 text-center text-gray-500">
                                  No countries available
                                </div>
                              ) : (
                                countriesOptions.map((opt, idx) => {
                                  const selectedArray =
                                    formik.values.countries ?? [];
                                  const isSelected = Array.isArray(selectedArray)
                                    ? selectedArray.includes(opt.value)
                                    : selectedArray === opt.value;

                                  return (
                                    <div
                                      key={opt.value}
                                      onClick={(e) => {
                                        // Ctrl/Meta to multi-toggle, otherwise single-select
                                        const holdCtrl = e.ctrlKey || e.metaKey;
                                        if (holdCtrl) {
                                          // toggle in array
                                          const cur = Array.isArray(
                                            formik.values.countries
                                          )
                                            ? formik.values.countries
                                            : [];
                                          const next = cur.includes(opt.value)
                                            ? cur.filter((v) => v !== opt.value)
                                            : [...cur, opt.value];
                                          formik.setFieldValue("countries", next);
                                        } else {
                                          // single select — set array with single value to keep compatibility
                                          formik.setFieldValue("countries", [
                                            opt.value,
                                          ]);
                                        }
                                      }}
                                      className={`px-6 py-4 cursor-pointer text-[15px] select-none hover:bg-[#F5F7F9] ${
                                        isSelected
                                          ? "bg-[#F5F7F9] font-medium"
                                          : "text-neutral"
                                      }`}
                                      style={{
                                        borderTopLeftRadius: idx === 0 ? 8 : 0,
                                        borderTopRightRadius: idx === 0 ? 8 : 0,
                                      }}
                                    >
                                      {opt.label}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>

                          {/* helper text */}
                          <div className="text-[12px] text-neutral mt-2">
                            (hold down Ctrl key to pick more than one)
                          </div>

                          {/* Optional: slim scrollbar style (move to global CSS if you prefer) */}
                          <style jsx>{`
                            /* webkit scrollbar for the dropdown */
                            .max-h-[360px]::-webkit-scrollbar {
                              width: 10px;
                            }
                            .max-h-[360px]::-webkit-scrollbar-thumb {
                              background: #cfcfcf;
                              border-radius: 999px;
                            }
                            .max-h-[360px]::-webkit-scrollbar-track {
                              background: transparent;
                            }
                          `}</style>
                        </div>
                      )}
                    </div>

                    {/* Gender */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setExpanded(expanded === 3 ? null : 3)}
                        className={`w-full cursor-pointer flex items-center justify-between px-4 py-3 text-left rounded-lg ${
                          expanded === 3 ? "bg-neutral" : ""
                        }`}
                      >
                        <span
                          className={`font-medium text-[13px] ${
                            expanded === 3 ? "text-primary" : ""
                          }`}
                        >
                          Gender
                        </span>
                        <span className="ml-2 text-gray-400">
                          {expanded === 3 ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </span>
                      </button>

                      {expanded === 3 && (
                        <div className="px-2 py-2 bg-white">
                          <div className="flex flex-col gap-4">
                            {/* Male */}
                            <label className="flex items-center gap-3 cursor-pointer">
                              <Checkbox
                                id="gender-male"
                                name="gender"
                                // checked if included in array
                                checked={
                                  Array.isArray(formik.values.gender)
                                    ? formik.values.gender.includes("Male")
                                    : false
                                }
                                onChange={() => {
                                  const cur = Array.isArray(
                                    formik.values.gender
                                  )
                                    ? [...formik.values.gender]
                                    : [];
                                  if (cur.includes("Male"))
                                    formik.setFieldValue(
                                      "gender",
                                      cur.filter((g) => g !== "Male")
                                    );
                                  else
                                    formik.setFieldValue("gender", [
                                      ...cur,
                                      "Male",
                                    ]);
                                }}
                                checkboxSize="w-5 h-5"
                                // hide default label inside component (we're using external text for better vertical alignment)
                                labelClassName="sr-only"
                              />
                              <span className="text-sm font-medium text-[#071437]">
                                Male
                              </span>
                            </label>

                            {/* Female */}
                            <label className="flex items-center gap-3 cursor-pointer">
                              <Checkbox
                                id="gender-female"
                                name="gender"
                                checked={
                                  Array.isArray(formik.values.gender)
                                    ? formik.values.gender.includes("Female")
                                    : false
                                }
                                onChange={() => {
                                  const cur = Array.isArray(
                                    formik.values.gender
                                  )
                                    ? [...formik.values.gender]
                                    : [];
                                  if (cur.includes("Female"))
                                    formik.setFieldValue(
                                      "gender",
                                      cur.filter((g) => g !== "Female")
                                    );
                                  else
                                    formik.setFieldValue("gender", [
                                      ...cur,
                                      "Female",
                                    ]);
                                }}
                                checkboxSize="w-5 h-5"
                                labelClassName="sr-only"
                              />
                              <span className="text-sm font-medium text-[#071437]">
                                Female
                              </span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* States */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setExpanded(expanded === 4 ? null : 4)}
                        className={`w-full cursor-pointer flex items-center justify-between px-4 py-3 text-left rounded-lg ${
                          expanded === 4 ? "bg-neutral" : ""
                        }`}
                      >
                        <span
                          className={`font-medium text-[13px] ${
                            expanded === 4 ? "text-primary" : ""
                          }`}
                        >
                          States
                        </span>
                        <span className="ml-2 text-gray-400">
                          {expanded === 4 ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </span>
                      </button>

                      {expanded === 4 && (
                        <div className="px-0 py-2 bg-white">
                          {/* Inline dropdown container (same style as Countries) */}
                          <div className="w-full bg-white rounded-[10px] border border-[#E6E9EE] overflow-hidden">
                            <div
                              className="max-h-[204px] overflow-y-auto"
                              style={{ paddingTop: 0, paddingBottom: 0 }}
                            >
                              {statesLoading ? (
                                <div className="px-6 py-4 text-center text-gray-500">
                                  Loading states...
                                </div>
                              ) : statesOptions.length === 0 ? (
                                <div className="px-6 py-4 text-center text-gray-500">
                                  No states available
                                </div>
                              ) : (
                                statesOptions.map((opt, idx) => {
                                  const selectedArray =
                                    formik.values.states ?? [];
                                  const isSelected = Array.isArray(selectedArray)
                                    ? selectedArray.includes(opt.value)
                                    : selectedArray === opt.value;

                                  return (
                                    <div
                                      key={opt.value}
                                      onClick={(e) => {
                                        const holdCtrl = e.ctrlKey || e.metaKey;
                                        if (holdCtrl) {
                                          // multi-toggle
                                          const cur = Array.isArray(
                                            formik.values.states
                                          )
                                            ? formik.values.states
                                            : [];
                                          const next = cur.includes(opt.value)
                                            ? cur.filter((v) => v !== opt.value)
                                            : [...cur, opt.value];
                                          formik.setFieldValue("states", next);
                                        } else {
                                          // single select -> set array with single value (keeps shape consistent)
                                          formik.setFieldValue("states", [
                                            opt.value,
                                          ]);
                                        }
                                      }}
                                      className={`px-6 py-4 cursor-pointer text-[15px] select-none hover:bg-[#F5F7F9] ${
                                        isSelected
                                          ? "bg-[#F5F7F9] font-medium"
                                          : "text-neutral"
                                      }`}
                                      style={{
                                        borderTopLeftRadius: idx === 0 ? 8 : 0,
                                        borderTopRightRadius: idx === 0 ? 8 : 0,
                                      }}
                                    >
                                      {opt.label}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>

                          <div className="text-[12px] text-neutral mt-2">
                            (hold down Ctrl key to pick more than one)
                          </div>

                          <div className="mt-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <Checkbox
                                id="excludeStates"
                                name="excludeStates"
                                labelClassName="sr-only"
                                checked={formik.values.excludeStates}
                                onChange={() =>
                                  formik.setFieldValue(
                                    "excludeStates",
                                    !formik.values.excludeStates
                                  )
                                }
                                checkboxSize="w-5 h-5"
                              />
                              <span className="text-sm text-neutral font-medium">
                                Exclude Selected States
                              </span>
                            </label>
                          </div>

                          {/* Optional: slim scrollbar style (move to global CSS if preferred) */}
                          <style jsx>{`
                            .max-h-[360px]::-webkit-scrollbar {
                              width: 10px;
                            }
                            .max-h-[360px]::-webkit-scrollbar-thumb {
                              background: #cfcfcf;
                              border-radius: 999px;
                            }
                            .max-h-[360px]::-webkit-scrollbar-track {
                              background: transparent;
                            }
                          `}</style>
                        </div>
                      )}
                    </div>

                    {/* ZIP Codes */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setExpanded(expanded === 6 ? null : 6)}
                        className={`w-full cursor-pointer flex items-center justify-between px-4 py-3 text-left rounded-lg ${
                          expanded === 6 ? "bg-neutral" : ""
                        }`}
                      >
                        <span
                          className={`font-medium text-[13px] ${
                            expanded === 6 ? "text-primary" : ""
                          }`}
                        >
                          ZIP Codes
                        </span>
                        <span className="ml-2 text-gray-400">
                          {expanded === 6 ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </span>
                      </button>
                      {expanded === 6 && (
                        <div className="px-4 py-2 bg-white">
                          <div className="text-xs text-neutral mb-2">
                            Please enter values in one of two formats: one per
                            line or comma delimited
                          </div>
                          <CustomTextField
                            name="zipCodesInput"
                            isTextArea
                            rows={4}
                            size="sm"
                            value={formik.values.zipCodesInput}
                            onChange={formik.handleChange}
                            placeholder=""
                          />
                          <Checkbox
                            id="excludeZipCodes"
                            name="excludeZipCodes"
                            label="Exclude Listed Zip Codes"
                            checked={formik.values.excludeZipCodes}
                            onChange={() =>
                              formik.setFieldValue(
                                "excludeZipCodes",
                                !formik.values.excludeZipCodes
                              )
                            }
                            checkboxSize="w-5 h-5"
                            labelClassName="text-sm text-neutral"
                          />
                        </div>
                      )}
                    </div>

                    {/* Block Domain Groups */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setExpanded(expanded === 7 ? null : 7)}
                        className={`w-full cursor-pointer flex items-center justify-between px-4 py-3 text-left rounded-lg ${
                          expanded === 7 ? "bg-neutral" : ""
                        }`}
                      >
                        <span
                          className={`font-medium text-[13px] ${
                            expanded === 7
                              ? "text-primary"
                              : "text-primary-dark"
                          }`}
                        >
                          Block Domain Groups
                        </span>
                        <span className="ml-2 text-gray-400">
                          {expanded === 7 ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </span>
                      </button>

                      {expanded === 7 && (
                        <div className="px-6 py-4 bg-white">
                          <div className="text-sm text-gray-700">
                            You have not defined any domain groups to block. You
                            can do it{" "}
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                // replace with actual navigation or modal open
                                console.log("Open domain groups management");
                              }}
                              className="underline text-primary font-medium"
                            >
                              here
                            </a>
                            .
                          </div>

                          <hr className="mt-4 border-t border-[#F1F1F4]" />
                        </div>
                      )}
                    </div>

                    {/* Lead Locking */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setExpanded(expanded === 8 ? null : 8)}
                        className={`w-full cursor-pointer flex items-center justify-between px-4 py-3 text-left rounded-lg ${
                          expanded === 8 ? "bg-neutral" : ""
                        }`}
                      >
                        <span
                          className={`font-medium text-[13px] ${
                            expanded === 8 ? "text-primary" : ""
                          }`}
                        >
                          Lead Locking
                        </span>
                        <span className="ml-2 text-gray-400">
                          {expanded === 8 ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </span>
                      </button>
                      {expanded === 8 && (
                        <div className="px-4 py-2 bg-white">
                          <Checkbox
                            id="disregardLocks"
                            name="disregardLocks"
                            label="Disregard Locks"
                            checked={formik.values.disregardLocks}
                            onChange={() =>
                              formik.setFieldValue(
                                "disregardLocks",
                                !formik.values.disregardLocks
                              )
                            }
                            checkboxSize="w-5 h-5"
                            labelClassName="text-sm font-medium"
                          />
                        </div>
                      )}
                    </div>

                    {/* Filter by Custom Field */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setExpanded(expanded === 9 ? null : 9)}
                        className={`w-full cursor-pointer flex items-center justify-between px-4 py-3 text-left rounded-lg ${
                          expanded === 9 ? "bg-neutral" : ""
                        }`}
                      >
                        <span
                          className={`font-medium text-[13px] text ${
                            expanded === 9 ? "text-primary" : ""
                          }`}
                        >
                          Filter by Custom Field
                        </span>
                        <span className="ml-2 text-gray-400">
                          {expanded === 9 ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </span>
                      </button>
                      {expanded === 9 && (
                        <div className="px-4 py-2 bg-neutral">
                          <CustomTextField
                            name="filterByCustomField"
                            isSelect
                            size="sm"
                            options={[
                              { label: "Pick Custom Field", value: "" },
                              {
                                label: "prospectid (cust_field_318)",
                                value: "cust_field_318",
                              },
                              {
                                label: "height (cust_field_356)",
                                value: "cust_field_356",
                              },
                              {
                                label: "weight_goal (cust_field_355)",
                                value: "cust_field_355",
                              },
                              {
                                label: "gender_id (cust_field_353)",
                                value: "cust_field_353",
                              },
                            ]}
                            value={formik.values.filterByCustomField}
                            onChange={formik.handleChange}
                          />
                          <div className="text-[12px] text-neutral mt-2 mb-1">
                            Please enter values in one of two formats: one per
                            line or comma delimited
                          </div>
                          <CustomTextField
                            name="filterByCustomFieldValues"
                            isTextArea
                            rows={3}
                            size="sm"
                            value={formik.values.filterByCustomFieldValues}
                            onChange={formik.handleChange}
                            placeholder=""
                          />
                          <div className="flex items-center gap-4 mt-2">
                            <CustomTextField
                              name="filterByCustomFieldMode"
                              isRadio
                              options={[
                                { label: "Include", value: "include" },
                                { label: "Exclude", value: "exclude" },
                              ]}
                              value={formik.values.filterByCustomFieldMode}
                              onChange={formik.handleChange}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Filter by Offer URL */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setExpanded(expanded === 10 ? null : 10)}
                        className={`w-full cursor-pointer flex items-center justify-between px-4 py-3 text-left rounded-lg ${
                          expanded === 10 ? "bg-neutral" : ""
                        }`}
                      >
                        <span
                          className={`font-medium text-[13px]  ${
                            expanded === 10 ? "text-primary" : ""
                          }`}
                        >
                          Filter by Offer URL
                        </span>
                        <span className="ml-2 text-gray-400">
                          {expanded === 10 ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </span>
                      </button>
                      {expanded === 10 && (
                        <div className="px-4 py-2 bg-white">
                          <label className="text-[13px] font-medium mb-1 block">
                            Enter any part of the offer URL to match below
                          </label>
                          <CustomTextField
                            name="filterByOfferUrlInput"
                            type="text"
                            size="sm"
                            value={formik.values.filterByOfferUrlInput}
                            onChange={formik.handleChange}
                            placeholder=""
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Exclude ISPs */}
              <div className="flex flex-col md:flex-row items-start gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                  Exclude ISPs
                </label>
                <div className="w-full md:w-3/4">
                  <div className="text-sm text-gray-500 mb-2">
                    Please enter values in one of two formats: one per line or
                    comma delimited
                  </div>
                  <CustomTextField
                    size="sm"
                    name="excludeIsps"
                    isTextArea
                    rows={4}
                    value={formik.values.excludeIsps}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Write note"
                  />
                </div>
              </div>

              {/* Include ISPs */}
              <div className="flex flex-col md:flex-row items-start gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                  Include ISPs
                </label>
                <div className="w-full md:w-3/4">
                  <div className="text-sm text-gray-500 mb-2">
                    Please enter values in one of two formats: one per line or
                    comma delimited
                  </div>
                  <CustomTextField
                    size="sm"
                    name="includeIsps"
                    isTextArea
                    rows={4}
                    value={formik.values.includeIsps}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Write note"
                  />
                </div>
              </div>

              {/* Suppression Files */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                  Suppression Files
                </label>
                <div className="w-full md:w-3/4">
                  <CustomTextField
                    size="sm"
                    name="suppressionFiles"
                    isSelect
                    options={[
                      { label: "N/A", value: "N/A" },
                      {
                        label: "All Suppression Files",
                        value: "All Suppression Files",
                      },
                      { label: "Abc", value: "Abc" },
                    ]}
                    value={formik.values.suppressionFiles}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
              </div>

              {/* Post Status */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                  Post Status
                </label>
                <div className="w-full md:w-3/4">
                  <CustomTextField
                    size="sm"
                    name="postStatus"
                    placeholder="Archived"
                    isSelect
                    options={[
                      { label: "Active", value: "Active" },
                      { label: "Paused", value: "Paused" },
                      { label: "Archived", value: "Archived" },
                      { label: "Fulfiled", value: "Fulfiled" },
                    ]}
                    value={formik.values.postStatus}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
              </div>

              {/* How to Save */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-1/4 text-sm text-neutral font-medium">
                  How to Save?
                </label>
                <div className="w-full md:w-3/4">
                  <CustomTextField
                    name="howToSave"
                    direction="row"
                    isRadio
                    options={[
                      { label: "Save Existing", value: "Save Existing" },
                      { label: "Make a Copy", value: "Make a Copy" },
                    ]}
                    value={formik.values.howToSave}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.howToSave ? formik.errors.howToSave : ""
                    }
                  />
                </div>
              </div>

              <CustomButton
                type="submit"
                position="end"
                className="py-2.5 sm:py-3 text-sm sm:text-base text-center mb-8"
              >
                Save Changes
              </CustomButton>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default ModifyPosts;
