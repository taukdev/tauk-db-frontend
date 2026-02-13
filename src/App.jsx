import './App.css'
// import './assets/fonts/fonts.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

// Public components
import LoginComponent from './components/authentication/loginComponent';
import CheckEmailComponent from './components/authentication/checkEmailComponent';
import ForgetPassComponent from './components/authentication/forgetPassComponent';
import ResetPassComponent from './components/authentication/resetPassComponent';
import AddVendor from './components/vendors/AddVendor';

// Profile components
import EditProfile from './components/userProfile/EditProfile';
import AddPlatform from './components/platForms/AddPlatform';
import PlatFormDetail from "./components/platForms/PlatFormDetail";
import OrderDetail from "./components/platForms/orders/OrderDetail";
import LeadDeliveryReport from "./components/platForms/orders/LeadDeliveryReport";

// Private components
import AdminPanelDrawer from './components/adminDrawer/AdminPanelDrawer';
import DashboardPage from './pages/DashboardPage';
import PlatformPage from './pages/PlatformPage';
import VendorsPage from './pages/VendorsPage';
import SearchRecordPage from './pages/SearchRecordPage';
import VendorDetail from './components/vendors/VendorDetail';
import VendorListAdd from './components/vendors/detail/VendorListAdd';
import ApiIntegrationPage from './components/platForms/apiIntegrations/ApiIntegrationPage';
import VendorListDetail from './components/vendors/detail/VendorListDetail';
import ApiPostingInstruction from './components/vendors/detail/ApiPostingInstruction';
import NewApiIntegrationPage from './components/platForms/apiIntegrations/NewApiIntegrationPage';
import EditApiIntegrationsPage from './components/platForms/apiIntegrations/EditApiIntegrationsPage';
import SendLeadsForm from './components/platForms/detail/SendLeadsForm';
import ReportLeadDelivery from './components/reports/LeadDeliveryReport';
import SendReport from './components/reports/SendReport';

import ListImportState from './components/reports/ListImportState';
import ModifyPosts from './components/outGoingPost/ModifyPosts';
import OutGoingPost from './pages/OutGoingPost';
import ScrubReport from './components/reports/ScrubReport';
import ReportPage from './pages/ReportPage';
import ActiveCampaignsPage from './pages/ActiveCampaignsPage';
import AddNewCampaign from './components/activeCampaigns/AddNewCampaign';
import UploadRecords from './components/vendors/UploadRecords';
import WebhookStatistics from './components/vendors/detail/WebhookStatistics';
import WebhookHistoryReport from './components/reports/WebhookHistoryReport';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginComponent />} />
        <Route path="/check-email" element={<CheckEmailComponent />} />
        <Route path="/forgot-password" element={<ForgetPassComponent />} />
        <Route path="/reset-password" element={<ResetPassComponent />} />

        {/* Private route */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminPanelDrawer />} >
            <Route path="/dashboard" element={<DashboardPage />} />

            // platform route
            <Route path="/platforms" element={<PlatformPage />} />
            <Route path="/platforms/add" element={<AddPlatform />} />
            <Route path="/platforms/:id" element={<PlatFormDetail />} />
            <Route path="/platforms/:id/api-integrations" element={<ApiIntegrationPage />} />
            <Route path="/platforms/:id/new-api-integration" element={<NewApiIntegrationPage />} />
            <Route path="/platforms/:id/edit-api-integration/:integrationId" element={<EditApiIntegrationsPage />} />
            <Route path="/platforms/:id/send-leads" element={<SendLeadsForm />} />
            <Route path="/platform/:platformId/orders/:id" element={<OrderDetail />} />
            <Route path="/platform/:platformId/orders/:id/lead-delivery-report" element={<LeadDeliveryReport />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/vendors/add" element={<AddVendor />} />
            <Route path="/vendor/list/:id/api-posting-instruction" element={<ApiPostingInstruction />} />
            <Route path="/vendor/list/:id/webhook" element={<WebhookStatistics />} />
            <Route path="/vendor/list/:listId/upload" element={<UploadRecords />} />
            <Route path="/vendor/list-add/:id" element={<VendorListAdd />} />
            <Route path="/vendor/:vendorId/list/:id" element={<VendorListDetail />} />
            <Route path="/vendor/:id" element={<VendorDetail />} />
            <Route path="/search-records" element={<SearchRecordPage />} />

            //report route
            {/* <Route path='/report/list-import-status' element={<ListImportState />} /> */}
            <Route path="/outgoing-post/:id/modify" element={<ModifyPosts />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/report/scrub-report" element={<ScrubReport />} />
            <Route path='/report/list-import-status' element={<ListImportState />} />
            <Route path='/report/lead-delivery-report' element={<ReportLeadDelivery />} />
            <Route path="/report/webhook-history-report" element={<WebhookHistoryReport />} />
            <Route path="/report/send-report" element={<SendReport />} />

            <Route path="/outgoing-post" element={<OutGoingPost />} />
            <Route path="/active-campaigns" element={<ActiveCampaignsPage />} />
            <Route path="/active-campaigns/add" element={<AddNewCampaign />} />

            {/* Profile Route */}
            <Route path="/edit-profile" element={<EditProfile />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App