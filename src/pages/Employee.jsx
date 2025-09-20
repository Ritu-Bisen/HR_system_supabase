import React, { useEffect, useState } from "react";
import { Filter, Search, Clock, CheckCircle, ImageIcon } from "lucide-react";
import useDataStore from "../store/dataStore";
import supabase from "../SupabaseClient";

const Employee = () => {
  const [activeTab, setActiveTab] = useState("joining");
  const [searchTerm, setSearchTerm] = useState("");
  const [joiningData, setJoiningData] = useState([]);
  const [leavingData, setLeavingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const formatDOB = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return as-is if not a valid date
    }

    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };


// ✅ Fetch JOINING data
const fetchJoiningData = async () => {
  setLoading(true);
  setTableLoading(true);
  setError(null);

  try {
    const { data, error } = await supabase
      .from("joining") // 👈 your Supabase table name
      .select("*");

    if (error) throw error;
    if (!Array.isArray(data)) throw new Error("Expected array data not received");

    // Process each row to match your frontend structure
    const processedData = data.map((row) => ({
      employeeId: row.joining_no || "",
      candidateName: row.name_as_per_aadhar || "",
      fatherName: row.father_name || "",
      dateOfJoining: row.date_of_joining || "",
      designation: row.designation || "",
      aadharPhoto: row.aadhar_frontside_photo || "",
      candidatePhoto: row.candidate_photo || "",
      address: row.current_address || "",
      dateOfBirth: row.date_of_birth || "",
      gender: row.gender || "",
      mobileNo: row.mobile_no || "",
      familyNo: row.family_mobile_no|| "",
      relationshipWithFamily: row.relationship_with_family_person || "",
      accountNo: row.current_bank_account_no|| "",
      ifsc: row.ifsc_code || "",
      branch: row.branch_name || "",
      passbook: row.bank_passbook_url || "",
      emailId: row.candidate_email || "",
      department: row.department || "",
      equipment: row.equipment || "",
      aadharNo: row.aadhar_no || "",
      columnAA: row.planned_date || "",
      columnY: row.leaving_date || "",
    }));

    // Filter logic: columnAA has value AND columnY is empty
    const activeEmployees = processedData.filter(
      (employee) => employee.columnAA && !employee.columnY
    );

    setJoiningData(activeEmployees);
  } catch (error) {
    console.error("Error fetching joining data:", error);
    setError(error.message);
    toast.error(`Failed to load joining data: ${error.message}`);
  } finally {
    setLoading(false);
    setTableLoading(false);
  }
};

// ✅ Fetch LEAVING data
const fetchLeavingData = async () => {
  setLoading(true);
  setTableLoading(true);
  setError(null);

  try {
    const { data, error } = await supabase
      .from("leaving") // 👈 your Supabase table name
      .select("*");

    if (error) throw error;
    if (!Array.isArray(data)) throw new Error("Expected array data not received");

    const processedData = data.map((row) => ({
      timestamp: row.timestamp || "",
      employeeId: row.employee_id || "",
      name: row.employee_name || "",
      dateOfLeaving: row.date_of_leaving || "",
      mobileNo: row.mobile_no || "",
      reasonOfLeaving: row.reason_of_leaving || "",
      firmName: row.firm_name || "",
      fatherName: row.father_name || "",
      dateOfJoining: row.date_of_joining || "",
      workingLocation: row.working_location || "",
      designation: row.designation || "",
      salary: row.salary || "",
      plannedDate: row.planned_date || "",
      actual: row.actual_date || "",
      department:row.department||"",
    }));

    // Filter logic: plannedDate is not null/empty
    const leavingEmployees = processedData.filter(
      (employee) => employee.plannedDate
    );

    setLeavingData(leavingEmployees);
  } catch (error) {
    console.error("Error fetching leaving data:", error);
    setError(error.message);
    toast.error(`Failed to load leaving data: ${error.message}`);
  } finally {
    setLoading(false);
    setTableLoading(false);
  }
};


  useEffect(() => {
    fetchJoiningData();
    fetchLeavingData();
  }, []);

  const filteredJoiningData = joiningData.filter((item) => {
    const matchesSearch =
      item.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fatherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.emailId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mobileNo?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredLeavingData = leavingData.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.designation?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold ">Employee</h1>
      </div>

      {/* Filter and Search - This section won't scroll */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by name, employee ID, or designation..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300   rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white  text-gray-500 "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 "
            />
          </div>
        </div>
      </div>

      {/* Tabs - This section won't scroll */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-300 ">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === "joining"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("joining")}
            >
              <CheckCircle size={16} className="inline mr-2" />
              Joining ({filteredJoiningData.length})
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === "leaving"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("leaving")}
            >
              <Clock size={16} className="inline mr-2" />
              Leaving ({filteredLeavingData.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "joining" && (
            <div className="overflow-x-auto">
              <div className="max-h-96 overflow-y-auto">
                {" "}
                {/* Added scroll container */}
                <table className="min-w-full divide-y divide-white">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    {" "}
                    {/* Made header sticky */}
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Father Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Of Joining
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Designation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aadhar Photo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Candidate Photo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date of Birth
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mobile No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Family No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Relationship
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IFSC
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Branch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Passbook
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email Id
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Equipment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aadhar No
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white ">
                    {tableLoading ? (
                      <tr>
                        <td colSpan="21" className="px-6 py-12 text-center">
                          <div className="flex justify-center flex-col items-center">
                            <div className="w-6 h-6 border-4 border-indigo-500 border-dashed rounded-full animate-spin mb-2"></div>
                            <span className="text-gray-600 text-sm">
                              Loading employees...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="21" className="px-6 py-12 text-center">
                          <p className="text-red-500">Error: {error}</p>
                          <button
                            onClick={fetchJoiningData}
                            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          >
                            Retry
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredJoiningData.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-white hover:bg-opacity-5"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.employeeId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.candidateName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.fatherName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.dateOfJoining
                              ? formatDOB(item.dateOfJoining)
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.designation}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.aadharPhoto ? (
                              <a
                                href={item.aadharPhoto}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800"
                              >
                                <ImageIcon size={20} />
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.candidatePhoto ? (
                              <a
                                href={item.candidatePhoto}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800"
                              >
                                <ImageIcon size={20} />
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.address || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.dateOfBirth
                              ? formatDOB(item.dateOfBirth)
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.gender || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.mobileNo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.familyNo || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.relationshipWithFamily || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.accountNo || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.ifsc || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.branch || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.passbook ? (
                              <a
                                href={item.passbook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800"
                              ><ImageIcon size={20}/></a>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.emailId || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.equipment || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.aadharNo || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {!tableLoading && filteredJoiningData.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <p className="text-gray-500 ">
                      No joining employees found.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "leaving" && (
            <div className="overflow-x-auto">
              <div className="max-h-96 overflow-y-auto">
                {" "}
                {/* Added scroll container */}
                <table className="min-w-full divide-y divide-white ">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    {" "}
                    {/* Made header sticky */}
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Of Joining
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Of Leaving
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mobile Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Father Name
                      </th>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Location</th> */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Designation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason Of Leaving
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white ">
                    {tableLoading ? (
                      <tr>
                        <td colSpan="10" className="px-6 py-12 text-center">
                          <div className="flex justify-center flex-col items-center">
                            <div className="w-6 h-6 border-4 border-indigo-500 border-dashed rounded-full animate-spin mb-2"></div>
                            <span className="text-gray-600 text-sm">
                              Loading leaving employees...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="10" className="px-6 py-12 text-center">
                          <p className="text-red-500">Error: {error}</p>
                          <button
                            onClick={fetchLeavingData}
                            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          >
                            Retry
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredLeavingData.map((item, index) => (
                        <tr key={index} className="hover:bg-white ">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.employeeId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.dateOfJoining
                              ? formatDOB(item.dateOfJoining)
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.dateOfLeaving
                              ? formatDOB(item.dateOfLeaving)
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.mobileNo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.fatherName}
                          </td>
                          {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.workingLocation || '-'}</td> */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.designation}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.reasonOfLeaving}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {!tableLoading && filteredLeavingData.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <p className="text-gray-500 ">
                      No leaving employees found.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Employee;
