import React, { createContext, useState } from "react";

export const JobDataContext = createContext();

export const JobDataProvider = ({ children }) => {
  const [jobData, setJobData] = useState(null);
  const [jobDataTable, setJobDataTable] = useState();

  return (
    <JobDataContext.Provider
      value={{ jobData, setJobData, jobDataTable, setJobDataTable }}
    >
      {children}
    </JobDataContext.Provider>
  );
};
