import DashboardIcon from "../../assets/icons/Dashboard-icon.svg";
import DashboardBoldIcon from "../../assets/icons/Dashboard-Bold.svg";
import DocumentIcon from "../../assets/icons/Document-icon.svg";
import MagniferIcon from "../../assets/icons/Magnifer-icon.svg";
import MagniferBoldIcon from "../../assets/icons/Magnifer-Bold.svg";
import SidebarIcon from "../../assets/icons/Siderbar-icon.svg";
import SidebarBoldIcon from "../../assets/icons/SiderbarBold-icon.svg";
import UsersGroupIcon from "../../assets/icons/UsersGroup-icon.svg";
import UsersGroupBoldIcon from "../../assets/icons/UsersGroup-Bold-icon.svg";
import VendorsIcon from "../../assets/icons/Vendors-icon.svg";
import VendorsBoldIcon from "../../assets/icons/Vendors-Bold.svg";
import LogoutIcon from "../../assets/icons/Logout-icons.svg";
import HelpIcon from "../../assets/icons/Help-icon.svg";
import TaukLogoMain from "../../assets/icons/TaukLogoMain.svg";
import DefaultUser from "../../assets/icons/DefaultUser.svg";
import NotepadIcon from "../../assets/icons/notepad-icon.svg";
import DocumentBoldIcon from "../../assets/icons/Note-Bold.svg";
import ExitRightIcon from "../../assets/icons/exit-right-icon.svg";
import GraphIcon from "../../assets/icons/graph-icons.svg";
import RediusIcon from "../../assets/icons/Radius-icon.svg";
import ActiveCampaigns from "../../assets/icons/active-campaigns.svg";
import ActiveCampaignsBold from "../../assets/icons/active-campaigns-bold.svg";

// 👇 aa toggle mate navi SVG import karo (path tame tamara project pramane adjust karjo)
import SidebarToggleIcon from "../../assets/icons/sidebar-toggle.svg";

import { Link, Outlet, useLocation } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  ChevronsLeftRight,
  Bell,
  Search,
  ChevronRight,
} from "lucide-react";
import CustomPopupModel from "../CustomPopupModel";
import { useSelector } from "react-redux";
import { getAuth } from "../../auth/authStorage.js";

const sidebarItems = [
  {
    name: "Dashboard",
    type: "tab",
    icon: <img src={DashboardIcon} alt="Dashboard" className="w-5 h-5" />,
    boldIcon: (
      <img src={DashboardBoldIcon} alt="Dashboard" className="w-5 h-5" />
    ),
    Link: "/dashboard",
    keywords: ["dashboard"],
  },
  {
    name: "Vendors",
    type: "tab",
    icon: <img src={VendorsIcon} alt="Vendors" className="w-5 h-5" />,
    boldIcon: <img src={VendorsBoldIcon} alt="Vendors" className="w-5 h-5" />,
    Link: "/vendors",
    keywords: ["vendor", "vendors"],
  },
  {
    name: "Platforms",
    type: "tab",
    icon: <img src={UsersGroupIcon} alt="Platforms" className="w-5 h-5" />,
    boldIcon: (
      <img src={UsersGroupBoldIcon} alt="Platforms" className="w-5 h-5" />
    ),
    Link: "/platforms",
    keywords: ["platform", "platforms"],
  },
  {
    name: "Outgoing Post",
    type: "tab",
    icon: <img src={SidebarIcon} alt="Outgoing Post" className="w-5 h-5" />,
    boldIcon: (
      <img
        src={SidebarBoldIcon}
        alt="Outgoing Post"
        className="w-5 h-5 font-bold"
      />
    ),
    Link: "/outgoing-post",
    keywords: ["outgoing-post"],
  },
  {
    name: "Reports",
    type: "dropdown",
    icon: <img src={DocumentIcon} alt="Reports" className="w-5 h-5" />,
    boldIcon: (
      <img src={DocumentBoldIcon} alt="Reports" className="w-5 h-5 font-bold" />
    ),
    submenu: [
      { name: "List Import Stats", link: "/report/list-import-status" },
      { name: "Lead Delivery Report", link: "/report/lead-delivery-report" },
      { name: "Scrub Report", link: "/report/scrub-report" },
      { name: "Send Report", link: "/report/send-report" },
    ],
    Link: "/report",
    keywords: ["reports", "report", "list-import-stats"],
  },
  {
    name: "Search Records",
    type: "tab",
    icon: <img src={MagniferIcon} alt="Search records" className="w-5 h-5" />,
    boldIcon: (
      <img src={MagniferBoldIcon} alt="Search records" className="w-5 h-5" />
    ),
    Link: "/search-records",
    keywords: ["search-records", "search-record", "search"],
  },
  {
    name: "Active Campaigns",
    type: "tab",
    icon: (
      <img src={ActiveCampaigns} alt="Active Campaigns" className="w-5 h-5" />
    ),
    boldIcon: (
      <img
        src={ActiveCampaignsBold}
        alt="Active Campaigns"
        className="w-5 h-5"
      />
    ),
    Link: "/active-campaigns",
    keywords: ["active-campaigns", "active-campaign"],
  },
];

export default function AdminPanel() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();
  const [showLogout, setShowLogout] = useState(false);
  const location = useLocation();
  const breadcrumbs = useSelector((state) => state.breadcrumbs);
  
  // Get current user from auth storage
  const { user } = getAuth();
  const userName = user?.name || user?.user_name || "User";
  const userEmail = user?.email || "";

  useEffect(() => {
    const currentPath = location.pathname.toLowerCase();

    const tabIndex = sidebarItems.findIndex((item) => {
      if (item.keywords && item.keywords.length > 0) {
        return item.keywords.some((keyword) => currentPath.includes(keyword));
      }
      return currentPath.startsWith(item.Link.toLowerCase());
    });

    setSelectedTab(tabIndex !== -1 ? tabIndex : null);
  }, [location.pathname]);

  const handleLogout = () => {
    setShowLogout(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-toggle sidebar based on screen size (tablet and below)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  return (
    <div className="flex h-screen bg-gray-100 relative overflow-hidden">
      {/* Mobile + Tablet Sidebar Toggle — Custom SVG */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-40 rounded-xl border border-gray-200 p-1 lg:hidden"
      >
        <img
          src={SidebarToggleIcon}
          alt="Toggle sidebar"
          className="w-8 h-8"
        />
      </button>

      {/* Desktop Sidebar Toggle (Fixed Position) — ChevronsLeftRight only on laptop/desktop */}
      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:block px-2 h-[40px] rounded-xl cursor-pointer bg-white shadow-sm 
                    border border-gray-200 hover:shadow-md transition-all duration-300 absolute top-5 
                    left-[235px] z-50"
        >
          <span className="text-lg text-black-900">
            <ChevronsLeftRight />
          </span>
        </button>
      )}

      {/* Desktop Menu Button - Show when sidebar is closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:block fixed top-4 left-4 z-40 rounded-xl border border-gray-200 p-1 bg-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
        >
          <img
            src={SidebarToggleIcon}
            alt="Toggle sidebar"
            className="w-8 h-8"
          />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`bg-white shadow-md flex flex-col fixed md:static z-40 h-full transition-all duration-300
          ${
            sidebarOpen ? "left-0 w-64 md:w-64" : "-left-64 w-0 md:w-0"
          } md:left-0`}
        style={{ overflow: sidebarOpen ? "visible" : "hidden" }}
      >
        <div className="p-6 font-bold text-xl flex items-center justify-between">
          <img src={TaukLogoMain} alt="Logo" />
          {/* Inside sidebar toggle — mobile + tablet only */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden ml- rounded-xl bg-white border border-gray-200 p-1 shadow-sm"
          >
            <img
              src={SidebarToggleIcon}
              alt="Toggle sidebar"
              className="w-7 h-7"
            />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ul className="mt-4 mx-4 space-y-1">
            {sidebarItems.map((item, index) => (
              <li key={index} className="text-gray-700">
                {item.type === "tab" ? (
                  <Link
                    to={item.Link}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-md ${
                      selectedTab === index
                        ? "bg-neutral text-black"
                        : "hover:bg-[#F5F7F9]"
                    }`}
                    style={{ textDecoration: "none" }}
                  >
                    {selectedTab === index ? item.boldIcon : item.icon}
                    <span
                      className={
                        selectedTab === index
                          ? "text-primary-dark transition-all duration-150"
                          : "text-[#646E88]"
                      }
                    >
                      {item.name}
                    </span>
                  </Link>
                ) : (
                  <div>
                    <button
                      onClick={() => {
                        toggleDropdown(index);
                        setSelectedTab(index);
                      }}
                      className={`w-full flex justify-between items-center px-3 py-3 rounded-md transition-all duration-200 cursor-pointer
                        ${
                          selectedTab === index
                            ? "bg-neutral text-black"
                            : "hover:bg-[#F5F7F9] text-[#646E88]"
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        {selectedTab === index ? item.boldIcon : item.icon}
                        <span
                          className={
                            selectedTab === index
                              ? "text-primary-dark"
                              : "text-[#646E88]"
                          }
                        >
                          {item.name}
                        </span>
                      </div>
                      <ChevronDown
                        className={`transition-transform duration-200 cursor-pointer
                          ${
                            selectedTab === index
                              ? "text-primary-dark"
                              : "text-[#646E88]"
                          } 
                          ${
                            activeDropdown === index
                              ? "rotate-180"
                              : ""
                          }`}
                      />
                    </button>

                    {/* Submenu */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out
                        ${
                          activeDropdown === index
                            ? "max-h-96 opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                    >
                      <div className="relative mt-2">
                        {/* Vertical Line */}
                        <div className="absolute left-6 top-0 bottom-[20.8px] w-[2px] bg-[#E2E8F0]"></div>

                        <ul className="space-y-1 ml-6">
                          {item.submenu.map((sub, i) => {
                            const path = sub.link;
                            const isActive = location.pathname === path;
                            return (
                              <li key={i} className="relative">
                                <img
                                  src={RediusIcon}
                                  alt=""
                                  className="absolute left-0 top-[45%] -translate-y-1/2 w-3 h-3"
                                />
                                <Link
                                  to={path}
                                  className={`block py-2 pl-5 pr-3 ml-3 rounded-md text-sm transition-all duration-150
                                    ${
                                      isActive
                                        ? "bg-neutral text-primary-dark font-medium"
                                        : "text-[#646E88] hover:bg-gray-100 hover:text-primary-dark"
                                    }`}
                                  style={{ textDecoration: "none" }}
                                >
                                  {sub.name}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom buttons */}
        <div className="mt-auto mb-6 px-4 space-y-2">
          <button className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-[#F5F7F9] rounded-md cursor-pointer">
            <img src={HelpIcon} alt="Help" className="w-5 h-5" />
            <span className="text-[#646E88]">Help</span>
          </button>
          <button
            onClick={() => setShowLogout(true)}
            className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-[#F5F7F9] rounded-md"
          >
            <img src={LogoutIcon} alt="Logout" className="w-5 h-5" />
            <span className="text-[#FF383C] cursor-pointer">
              Logout Account
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col transition-all duration-300 ml-0">
        {/* Topbar */}
        <header className="flex justify-between items-center bg-white shadow p-4">
          <div className={sidebarOpen ? "ml-7" : "ml-15"}>
            <nav className="hidden sm:flex items-center space-x-2 text-sm overflow-x-auto whitespace-nowrap">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <span key={crumb.path} className="flex items-center">
                    {index > 0 && (
                      <ChevronRight
                        size={16}
                        className="mr-2 text-gray-400"
                      />
                    )}
                    {isLast ? (
                      <span className="font-bold text-gray-800">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        to={crumb.path}
                        className="text-secondary hover:underline"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </span>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative hidden lg:block">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={22}
              />
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-[8px] rounded-xl focus:outline-none focus:ring focus:ring-indigo-200"
                style={{ border: "2px solid #DBDFE9" }}
              />
            </div>
            <Bell className="text-gray-600 cursor-pointer" size={20} />
            <div className="relative inline-block text-left" ref={dropdownRef}>
              <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <img
                  src={DefaultUser}
                  alt="User Avatar"
                  className="rounded-full object-cover"
                  style={{ width: 44, height: 44 }}
                />
              </div>

              {isOpen && (
                <div className="absolute right-0 z-20 mt-6 w-56 origin-top-right rounded-xl bg-white shadow-lg focus:outline-none">
                  <div className="flex items-center px-4 py-3 border-b border-b-[#D6DAE6]">
                    <img
                      src={DefaultUser}
                      alt="User Avatar"
                      className="rounded-full object-cover mr-3"
                      style={{ width: 44, height: 44 }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {userName}
                      </p>
                      <p className="text-xs bg-secondary-light">
                        {userEmail || "No email"}
                      </p>
                    </div>
                  </div>
                  <div className="py-1">
                    <Link to="/edit-profile" style={{ textDecoration: "none" }}>
                      <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        <img
                          src={NotepadIcon}
                          alt="Edit Icon"
                          className="w-4 h-4 mr-3"
                        />
                        Edit Profile
                      </button>
                    </Link>
                    <button
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setShowLogout(true);
                        setIsOpen(!isOpen);
                      }}
                    >
                      <img
                        src={ExitRightIcon}
                        alt="Logout Icon"
                        className="w-4 h-4 mr-3"
                      />
                      Logout Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 flex-1 overflow-auto bg-neutral">
          <div className="grid">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Logout Popup */}
      <CustomPopupModel
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={handleLogout}
        isLogoutPopup={true}
      />
    </div>
  );
}
