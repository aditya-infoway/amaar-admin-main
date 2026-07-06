import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Page } from "@/components/shared/Page";
import { Button } from "@/components/ui";
import { useAuthContext } from "@/app/contexts/auth/context";
import { APP_LOGO } from "@/constants/app";
import { CreateCompanyForm } from "./CreateCompany";
import {
  COMPANIES_STORAGE_KEY,
  formatCompanyDateRange,
  getCompanies,
  setSelectedCompany,
  StoredCompany,
} from "@/utils/companyStorage";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function SelectCompany() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [companies, setCompanies] = useLocalStorage<StoredCompany[]>(
    COMPANIES_STORAGE_KEY,
    [],
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    setCompanies(getCompanies());
  }, [setCompanies]);

  const handleCompanySelect = (company: StoredCompany) => {
    setSelectedRowId(company.id);
    setSelectedCompany(company);
    navigate("/otp");
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    setCompanies(getCompanies());
  };

  return (
    <Page title="Select Company">
      <main className="min-h-screen bg-white">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden min-h-screen">
            {/* Left Side */}
            <div className="flex flex-col bg-white justify-between min-h-screen relative">
              {/* Top Section: Logo, Title, and Table */}
              <div className="w-full">
                {/* Logo Area */}
                <div className="py-6 bg-white flex flex-col items-center justify-center pt-40">
                  <img
                    src={APP_LOGO}
                    alt="Autobook ERP"
                    className="h-11 w-auto object-contain"
                  />

                </div>

                {showCreateForm ? (
                  <div className="p-6">
                    <CreateCompanyForm
                      onCancel={() => setShowCreateForm(false)}
                      onSuccess={handleCreateSuccess}
                    />
                  </div>
                ) : (
                  <div className="px-6 sm:px-10 py-4 w-full">
                    {/* Header Banner */}
                    <div
                      className="px-4 py-3 text-left text-white font-bold text-lg tracking-wide rounded-t-sm"
                      style={{ backgroundColor: "#1a2fa8" }}
                    >
                      Select Company
                    </div>

                    {/* Table Container */}
                    <div className="w-full border border-t-0 border-gray-300 rounded-b-sm shadow-sm overflow-hidden">
                      {/* Table Header */}
                      <div className="grid grid-cols-2 bg-gray-100 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-300">
                        <span>COMPANY NAME</span>
                        <span className="text-right">DATE</span>
                      </div>

                      {/* Fixed Height Scrollable Rows */}
                      <div className="h-[320px] overflow-y-auto bg-white divide-y divide-gray-200">
                        {companies.length === 0 ? (
                          <div className="px-4 py-12 text-center text-sm text-gray-400 bg-white">
                            No companies found. Create a new company to continue.
                          </div>
                        ) : (
                          companies.map((company, index) => (
                            <button
                              key={company.id}
                              type="button"
                              onClick={() => handleCompanySelect(company)}
                              className={`grid w-full grid-cols-2 px-4 py-3.5 text-left text-xs font-medium transition-colors ${selectedRowId === company.id
                                  ? "bg-blue-50 text-blue-900 font-bold ring-1 ring-inset ring-blue-300"
                                  : index % 2 === 0
                                    ? "bg-white text-gray-800 hover:bg-gray-50"
                                    : "bg-gray-50 text-gray-800 hover:bg-gray-100/70"
                                }`}
                            >
                              <span className="truncate pr-4 font-semibold text-gray-700">
                                {company.companyName}
                              </span>
                              <span className="text-right text-gray-500 font-medium whitespace-nowrap">
                                {formatCompanyDateRange(
                                  company.startDate,
                                  company.endDate,
                                )}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pinned Action Button at Bottom - Only 1 Button */}
              {/* {!showCreateForm && (
                <div className="w-full border-t pt-4 bg-white sticky bottom-2 z-10 px-10 rounded-lg">
                  <Button
                    type="button"
                    onClick={() => setShowCreateForm(true)}
                    className="w-full py-4"
                    color="primary"
                  >
                    Create Company
                  </Button>
                </div>
              )} */}
            </div>

            {/* Right Side - Branding Banner Image */}
            <div className="relative hidden lg:flex items-center justify-center bg-[#b81d24]">
              <img
                src="images/ammar/login.jpeg"
                alt="Select Company"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </main>
    </Page>
  );
}