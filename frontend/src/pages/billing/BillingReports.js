import React, { useState } from "react";
import PlaceholderChart from "../../components/PlaceholderChart";

const BillingReports = () => {
  const [loading, setLoading] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);

  return (
    <div className="billing-reports">
      <div className="report-header">
        <h3 className="text-lg font-semibold">
          {currentReport ? currentReport.title : "Select a report"}
        </h3>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <PlaceholderChart title={currentReport?.title} type={currentReport?.chartType} />
        )}
      </div>
    </div>
  );
};

export default BillingReports;