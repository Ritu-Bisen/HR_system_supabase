import React, { useState, useEffect } from 'react';
import { Search, Users, Clock, CheckCircle, Eye, X, Download, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { enquiryDataForJoining, joiningDataSlice } from '../redux/slice/joiningSlice';

const Joining = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showJoiningModal, setShowJoiningModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  // const [loading, setLoading] = useState(false);
//  const [tableLoading, setTableLoading] = useState(false);
  // const [joiningData, setJoiningData] = useState([]);
  // const [error, setError] = useState(null);
  const [followUpData, setFollowUpData] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    candidateSays: '',
    status: '',
    nextDate: ''
  });
  const [joiningFormData, setJoiningFormData] = useState({
    nameAsPerAadhar: '',
    fatherName: '',
    dateOfJoining: '',
    joiningPlace: '',
    designation: '',
    salary: '',
    aadharFrontPhoto: null,
    aadharBackPhoto: null,
    panCard: null,
    candidatePhoto: null,
    currentAddress: '',
    addressAsPerAadhar: '',
    dobAsPerAadhar: '',
    gender: '',
    mobileNo: '',
    familyMobileNo: '',
    relationshipWithFamily: '',
    pastPfId: '',
    currentBankAc: '',
    ifscCode: '',
    branchName: '',
    bankPassbookPhoto: null,
    personalEmail: '',
    esicNo: '',
    highestQualification: '',
    pfEligible: '',
    esicEligible: '',
    joiningCompanyName: '',
    emailToBeIssue: '',
    issueMobile: '',
    issueLaptop: '',
    aadharCardNo: '',
    modeOfAttendance: '',
    qualificationPhoto: null,
    paymentMode: '',
    salarySlip: null,
    resumeCopy: null,
    department: '',
    equipment: ''
  });

const{joiningData,loading,error}=useSelector((state)=>state.joining)
const dispatch =useDispatch();
useEffect(()=>{
  dispatch(enquiryDataForJoining())
},[dispatch])

const fetchJoiningData = async () => {
//  setLoading(true);
//  setTableLoading(true);
//  setError(null);

  try {
    const [enquiryResponse, followUpResponse] = await Promise.all([
      fetch(
        "https://script.google.com/macros/s/AKfycbwfGaiHaPhexcE9i-A7q9m81IX6zWqpr4lZBe4AkhlTjVl4wCl0v_ltvBibfduNArBVoA/exec?sheet=ENQUIRY&action=fetch"
      ),
      fetch(
        "https://script.google.com/macros/s/AKfycbwfGaiHaPhexcE9i-A7q9m81IX6zWqpr4lZBe4AkhlTjVl4wCl0v_ltvBibfduNArBVoA/exec?sheet=Follow - Up&action=fetch"
      ),
    ]);

    if (!enquiryResponse.ok || !followUpResponse.ok) {
      throw new Error(
        `HTTP error! status: ${enquiryResponse.status} or ${followUpResponse.status}`
      );
    }

    const [enquiryResult, followUpResult] = await Promise.all([
      enquiryResponse.json(),
      followUpResponse.json(),
    ]);

    if (
      !enquiryResult.success ||
      !enquiryResult.data ||
      enquiryResult.data.length < 7
    ) {
      throw new Error(
        enquiryResult.error || "Not enough rows in enquiry sheet data"
      );
    }

    // Process enquiry data
    const enquiryHeaders = enquiryResult.data[5].map((h) => h.trim());
    const enquiryDataFromRow7 = enquiryResult.data.slice(6);
    

    const getIndex = (headerName) =>
      enquiryHeaders.findIndex((h) => h === headerName);

     const abIndex = 27;

    const processedEnquiryData = enquiryDataFromRow7
      .map((row) => ({
        id: row[getIndex("Timestamp")],
        indentNo: row[getIndex("Indent Number")],
        candidateEnquiryNo: row[getIndex("Candidate Enquiry Number")],
        applyingForPost: row[getIndex("Applying For the Post")],
        candidateName: row[getIndex("Candidate Name")],
        candidateDOB: row[getIndex("DOB")],
        candidatePhone: row[getIndex("Candidate Phone Number")],
        candidateEmail: row[getIndex("Candidate Email")],
        previousCompany: row[getIndex("Previous Company Name")],
        jobExperience: row[getIndex("Job Experience")] || "",
        lastSalary: row[getIndex("Last Salary Drawn")] || "",
        previousPosition: row[getIndex("Previous Position")] || "",
        reasonForLeaving:
          row[getIndex("Reason Of Leaving Previous Company")] || "",
        maritalStatus: row[getIndex("Marital Status")] || "",
        lastEmployerMobile: row[getIndex("Last Employer Mobile Number")] || "",
        candidatePhoto: row[getIndex("Candidate Photo")] || "",
        candidateResume: row[19] || "",
        referenceBy: row[getIndex("Reference By")] || "",
        presentAddress: row[getIndex("Present Address")] || "",
        aadharNo: row[getIndex("Aadhar Number")] || "",
        designation: row[getIndex("Applying For the Post")] || "",
        actualDate: row[26] || "", // Column AA (index 26) - Actual date
         joiningDate: row[abIndex] || ""
      }))
      // Filter out items with null/empty values in Column AA
      .filter(item => item.actualDate && item.actualDate.trim() !== "");
      
      

    // Process follow-up data for filtering
    if (followUpResult.success && followUpResult.data) {
      const rawFollowUpData = followUpResult.data || followUpResult;
      const followUpRows = Array.isArray(rawFollowUpData[0])
        ? rawFollowUpData.slice(1)
        : rawFollowUpData;

      const processedFollowUpData = followUpRows.map((row) => ({
        enquiryNo: row[1] || "", // Column B (index 1) - Enquiry No
        status: row[2] || "", // Column C (index 2) - Status
      }));

      setFollowUpData(processedFollowUpData);
      
      // Filter data to show only items with "Joining" status in follow-up sheet
      const joiningItems = processedEnquiryData.filter(item => {
        const hasJoiningStatus = processedFollowUpData.some(followUp => 
          followUp.enquiryNo === item.candidateEnquiryNo && 
          followUp.status === 'Joining'
        );
        return hasJoiningStatus;
      });
      
     // setJoiningData(joiningItems);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
   // setError(error.message);
    toast.error("Failed to fetch data");
  } finally {
   // setLoading(false);
   // setTableLoading(false);
  }
};

  useEffect(() => {
    fetchJoiningData();
  }, []);

  const handleViewClick = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleJoiningClick = (item) => {
    setSelectedItem(item);
    setJoiningFormData({
      nameAsPerAadhar: item.candidateName || '',
      fatherName: '',
      dateOfJoining: '',
      joiningPlace: '',
      designation: item.designation || '',
      salary: '',
      aadharFrontPhoto: null,
      aadharBackPhoto: null,
      panCard: null,
      candidatePhoto: null,
      currentAddress: item.presentAddress || '',
      addressAsPerAadhar: '',
      dobAsPerAadhar: formatDOB(item.candidateDOB) || '',
      gender: '',
      mobileNo: item.candidatePhone || '',
      familyMobileNo: '',
      relationshipWithFamily: '',
      pastPfId: '',
      currentBankAc: '',
      ifscCode: '',
      branchName: '',
      bankPassbookPhoto: null,
      personalEmail: item.candidateEmail || '',
      esicNo: '',
      highestQualification: '',
      pfEligible: '',
      esicEligible: '',
      joiningCompanyName: '',
      emailToBeIssue: '',
      issueMobile: '',
      issueLaptop: '',
      aadharCardNo: item.aadharNo || '',
      modeOfAttendance: '',
      qualificationPhoto: null,
      paymentMode: '',
      salarySlip: null,
      resumeCopy: null,
      department: '',
      equipment: ''
    });
    setShowJoiningModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    let date;
    
    if (dateString instanceof Date) {
      date = dateString;
    } else if (typeof dateString === 'string') {
      if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          date = new Date(parts[2], parts[1] - 1, parts[0]);
        }
      } else {
        date = new Date(dateString);
      }
    }
    
    if (!date || isNaN(date.getTime())) {
      return dateString || '';
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const formatDOB = (dateString) => {
    if (!dateString) return '';
    
    let date;
    
    if (dateString instanceof Date) {
      date = dateString;
    } else if (typeof dateString === 'string' && dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        if (parseInt(parts[0]) > 12) {
          date = new Date(parts[2], parts[1] - 1, parts[0]);
        } else {
          date = new Date(parts[2], parts[0] - 1, parts[1]);
        }
      }
    } else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const handleJoiningInputChange = (e) => {
    const { name, value } = e.target;
    setJoiningFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setJoiningFormData(prev => ({
        ...prev,
        [fieldName]: file
      }));
    }
  };

  const postToJoiningSheet = async (rowData) => {
    const URL = 'https://script.google.com/macros/s/AKfycbwfGaiHaPhexcE9i-A7q9m81IX6zWqpr4lZBe4AkhlTjVl4wCl0v_ltvBibfduNArBVoA/exec';

    try {
      console.log('Attempting to post:', {
        sheetName: 'JOINING',
        rowData: rowData
      });

      const params = new URLSearchParams();
      params.append('sheetName', 'JOINING');
      params.append('action', 'insert');
      params.append('rowData', JSON.stringify(rowData));

      const response = await fetch(URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Server response:', data);

      if (!data.success) {
        throw new Error(data.error || 'Server returned unsuccessful response');
      }

      return data;
    } catch (error) {
      console.error('Full error details:', {
        error: error.message,
        stack: error.stack,
        rowData: rowData,
        timestamp: new Date().toISOString()
      });
      throw new Error(`Failed to update sheet: ${error.message}`);
    }
  };

  const uploadFileToDrive = async (file, folderId = '1Jk4XQKvq4QQRC7COAcajUReoX7zbQtW0') => {
    try {
      const reader = new FileReader();
      const base64Data = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const params = new URLSearchParams();
      params.append('action', 'uploadFile');
      params.append('base64Data', base64Data);
      params.append('fileName', file.name);
      params.append('mimeType', file.type);
      params.append('folderId', folderId);

      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbwfGaiHaPhexcE9i-A7q9m81IX6zWqpr4lZBe4AkhlTjVl4wCl0v_ltvBibfduNArBVoA/exec',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'File upload failed');
      }

      return data.fileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(`Failed to upload file: ${error.message}`);
      throw error;
    }
  };

  const updateEnquirySheet = async (enquiryNo, timestamp) => {
  const URL = 'https://script.google.com/macros/s/AKfycbwfGaiHaPhexcE9i-A7q9m81IX6zWqpr4lZBe4AkhlTjVl4wCl0v_ltvBibfduNArBVoA/exec';

  try {
    const params = new URLSearchParams();
    params.append('sheetName', 'ENQUIRY');
    params.append('action', 'updateCell');
    params.append('searchColumn', 'Candidate Enquiry Number');
    params.append('searchValue', enquiryNo);
    params.append('updateColumn', 'AB'); // Column AB
    params.append('updateValue', timestamp);

    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error updating enquiry sheet:', error);
    throw new Error(`Failed to update enquiry sheet: ${error.message}`);
  }
};


const handleJoiningSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    // Current timestamp
    const now = new Date();
    const formattedTimestamp = now.toISOString(); // Supabase TIMESTAMP format

    // ✅ Build rowData directly with existing image values
    const rowData = {
      timestamp: formattedTimestamp,
      candidate_enquiry_no: selectedItem.candidate_enquiry_no, // link to enquiry
      candidate_name: selectedItem.candidate_name,
      father_name: joiningFormData.fatherName,
      date_of_joining: joiningFormData.dateOfJoining
        ? new Date(joiningFormData.dateOfJoining).toISOString().split("T")[0]
        : null, // YYYY-MM-DD
      designation: selectedItem.designation || selectedItem.applying_for_the_post,
      aadhar_card_url: joiningFormData.aadharFrontPhoto || "", // directly from form
      candidate_photo: selectedItem.candidate_photo || "",
      present_address: selectedItem.present_address,
      candidate_dob: selectedItem.candidate_dob
        ? new Date(selectedItem.candidate_dob).toISOString().split("T")[0]
        : null,
      gender: joiningFormData.gender,
      candidate_phone: selectedItem.candidate_phone_no,
      family_mobile_no: joiningFormData.familyMobileNo,
      relationship_with_family: joiningFormData.relationshipWithFamily,
      bank_account_no: joiningFormData.currentBankAc,
      ifsc_code: joiningFormData.ifscCode,
      branch_name: joiningFormData.branchName,
      bank_passbook_url: joiningFormData.bankPassbookPhoto || "", // directly from form
      candidate_email: selectedItem.candidate_email,
      highest_qualification: joiningFormData.highestQualification,
      department: joiningFormData.department,
      equipment: joiningFormData.equipment,
      aadhar_no: selectedItem.aadhar_no,
      candidate_resume_url: selectedItem.resume_copy || "",
      actual_date: selectedItem.actual || now.toISOString().split("T")[0],
    };

    // Dispatch to Redux → API call
    dispatch(joiningDataSlice(rowData));

    console.log("Joining rowData to post:", rowData);

    toast.success("Employee added successfully!");

    setShowJoiningModal(false);
    setSelectedItem(null);
  await dispatch(enquiryDataForJoining())
  } catch (error) {
    console.error("Error submitting joining form:", error);
    toast.error(`Failed to submit joining form: ${error.message}`);
  } finally {
    setSubmitting(false);
  }
};



  const filteredJoiningData = joiningData.filter(item => {
    const matchesSearch = item.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.applying_for_the_post?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.candidate_phone_no?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Joining Management</h1>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by name, post or phone number..."
              className="w-full pl-10 pr-4 py-2 border border-gray-400 border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 opacity-60"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-300 border-opacity-20">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === "pending"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("pending")}
            >
              <Clock size={16} className="inline mr-2" />
              Pending Joinings ({filteredJoiningData.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "pending" && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Indent No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate Enquiry No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applying For Post
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Photo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resume
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-12 text-center">
                        <div className="flex justify-center flex-col items-center">
                          <div className="w-6 h-6 border-4 border-indigo-500 border-dashed rounded-full animate-spin mb-2"></div>
                          <span className="text-gray-600 text-sm">
                            Loading pending joinings...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-12 text-center">
                        <p className="text-red-500">Error: ${error}</p>
                        <button
                          onClick={fetchJoiningData}
                          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                          Retry
                        </button>
                      </td>
                    </tr>
                  ) : filteredJoiningData.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-12 text-center">
                        <p className="text-gray-500">No pending joinings found.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredJoiningData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleJoiningClick(item)}
                              className="px-3 py-1 text-white bg-green-600 rounded-md hover:bg-opacity-90 text-sm"
                            >
                              Joining
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.indent_no || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.candidate_enquiry_no || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.applying_for_the_post || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.candidate_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.candidate_phone_no || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.candidate_email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.candidate_photo ? (
                            <a
                              href={item.candidate_photo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800"
                            >
                              View
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.resume_copy ? (
                            <a
                              href={item.resume_copy}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800"
                            >
                              View
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            Pending Joining
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Joining Modal */}
      {showJoiningModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-300">
              <h3 className="text-lg font-medium text-gray-900">
                Employee Joining Form
              </h3>
              <button
                onClick={() => setShowJoiningModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleJoiningSubmit} className="p-6 space-y-6">
              {/* Section 1: Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name As Per Aadhar *
                  </label>
                  <input
                    type="text"
                    disabled
                    value={selectedItem.candidate_name}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father Name
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={joiningFormData.fatherName}
                    onChange={handleJoiningInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Of Birth As per Aadhar *
                  </label>
                  <input
                    type="text"
                    disabled
                    value={formatDOB(selectedItem.candidate_dob)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={joiningFormData.gender}
                    onChange={handleJoiningInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    name="department"
                    value={joiningFormData.department}
                    onChange={handleJoiningInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Dispatch">Dispatch</option>
                    <option value="Office">Office</option>
                    <option value="Sales">Sales</option>
                    <option value="Admin">Admin</option>
                    <option value="Sms">Sms</option>
                    <option value="Store">Store</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment
                  </label>
                  <input
                    type="text"
                    name="equipment"
                    value={joiningFormData.equipment}
                    onChange={handleJoiningInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  />
                </div>
              </div>

              {/* Section 2: Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile No. *
                  </label>
                  <input
                    type="tel"
                    disabled
                    value={selectedItem.candidate_phone_no}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pre Email *
                  </label>
                  <input
                    type="email"
                    disabled
                    value={selectedItem.candidate_email}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Family Mobile Number *
                  </label>
                  <input
                    name="familyMobileNo"
                    value={joiningFormData.familyMobileNo}
                    onChange={handleJoiningInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship With Family *
                  </label>
                  <input
                    name="relationshipWithFamily"
                    value={joiningFormData.relationshipWithFamily}
                    onChange={handleJoiningInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  />
                </div>
              </div>

              {/* Section 3: Address Information */}  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Address *
                  </label>
                  <textarea
                    disabled
                    value={selectedItem.present_address}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  />
                </div>
              </div>

              {/* Section 4: Employment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Of Joining *
                  </label>
                  <input
                    type="date"
                    name="dateOfJoining"
                    value={joiningFormData.dateOfJoining}
                    onChange={handleJoiningInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    disabled
                    value={selectedItem.designation||selectedItem.applying_for_the_post}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Highest Qualification
                  </label>
                  <input
                    name="highestQualification"
                    value={joiningFormData.highestQualification}
                    onChange={handleJoiningInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  />
                </div>
              </div>

              {/* Section 5: Bank & Financial Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aadhar Card Number *
                  </label>
                  <input
                    disabled
                    value={selectedItem.aadhar_no}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Bank Account No*
                  </label>
                  <input
                    name="currentBankAc"
                    value={joiningFormData.currentBankAc}
                    onChange={handleJoiningInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IFSC Code*
                  </label>
                  <input
                    name="ifscCode"
                    value={joiningFormData.ifscCode}
                    onChange={handleJoiningInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch Name*
                  </label>
                  <input
                    name="branchName"
                    value={joiningFormData.branchName}
                    onChange={handleJoiningInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  />
                </div>
              </div>

              {/* Section 6: Document Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aadhar Card
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "aadharFrontPhoto")}
                      className="hidden"
                      id="aadhar-front-upload"
                    />
                    <label
                      htmlFor="aadhar-front-upload"
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-gray-700"
                    >
                      <Upload size={16} className="mr-2" />
                      Upload Photo
                    </label>
                    {joiningFormData.aadharFrontPhoto && (
                      <span className="text-sm text-gray-700">
                        {joiningFormData.aadharFrontPhoto.name}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photo Of Front Bank Passbook
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "bankPassbookPhoto")}
                      className="hidden"
                      id="bank-passbook-upload"
                    />
                    <label
                      htmlFor="bank-passbook-upload"
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-gray-700"
                    >
                      <Upload size={16} className="mr-2" />
                      Upload Photo
                    </label>
                    {joiningFormData.bankPassbookPhoto && (
                      <span className="text-sm text-gray-700">
                        {joiningFormData.bankPassbookPhoto.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowJoiningModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white bg-indigo-700 rounded-md hover:bg-indigo-800 flex items-center justify-center min-h-[42px] ${
                    submitting ? "opacity-90 cursor-not-allowed" : ""
                  }`}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Joining;