import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle, X, Upload } from 'lucide-react';
import useDataStore from '../store/dataStore';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { postFindEnquiryApi } from '../redux/api/findEnquiryApi';
import {  enquiryDetails, indentForEnquiry } from '../redux/slice/findEnquirySlice';
import supabase from '../SupabaseClient';

const FindEnquiry = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [indentData, setIndentData] = useState([]);
  const [enquiryData, setEnquiryData] = useState([]);
  const [generatingEnquiryNo, setGeneratingEnquiryNo] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [generatedCandidateNo, setGeneratedCandidateNo] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

const [formData, setFormData] = useState({
  candidateName: '',
  candidateDOB: '',
  candidatePhone: '',
  candidateEmail: '',
  previousCompany: '',
  jobExperience: '',
  previousPosition: '',
  maritalStatus: '',
  candidatePhoto: null,
  candidateResume: null,
  presentAddress: '',
  aadharNo: '',
  status: 'NeedMore'
});

const{indentEnquiry,loading,enquiry}=useSelector((state)=>state.enquiry);
const dispatch=useDispatch()
useEffect(()=>{
  dispatch(indentForEnquiry())
  dispatch(enquiryDetails())
},[])

  // Google Drive folder ID for file uploads
  const GOOGLE_DRIVE_FOLDER_ID = '173O0ARBt4AmRDFfKwkxrwBsFLK8lTG6r';

  // Fetch all necessary data
  const fetchAllData = async () => {
    // setLoading(true);
    // setTableLoading(true);
    setError(null);
    
    try {
      // Fetch INDENT data
      const indentResponse = await fetch(
        'https://script.google.com/macros/s/AKfycbwfGaiHaPhexcE9i-A7q9m81IX6zWqpr4lZBe4AkhlTjVl4wCl0v_ltvBibfduNArBVoA/exec?sheet=INDENT&action=fetch'
      );
      
      if (!indentResponse.ok) {
        throw new Error(`HTTP error! status: ${indentResponse.status}`);
      }
      
      const indentResult = await indentResponse.json();
      
      if (indentResult.success && indentResult.data && indentResult.data.length >= 7) {
        const headers = indentResult.data[5].map(h => h.trim());
        const dataFromRow7 = indentResult.data.slice(6);
        
        const getIndex = (headerName) => headers.findIndex(h => h === headerName);
        
        const processedData = dataFromRow7
          .filter(row => {
            const status = row[getIndex('Status')];
            const planned2 = row[getIndex('Planned 2')];
            const actual2 = row[getIndex('Actual 2')];
            
            return status === 'NeedMore' && 
                   planned2 && 
                   (!actual2 || actual2 === '');
          })
          .map(row => ({
            id: row[getIndex('Timestamp')],
            indentNo: row[getIndex('Indent Number')],
            post: row[getIndex('Post')],
            gender: row[getIndex('Gender')],
            prefer: row[getIndex('Prefer')],
            numberOfPost: row[getIndex('Number Of Posts')],
            competitionDate: row[getIndex('Completion Date')],
            socialSite: row[getIndex('Social Site')],
            status: row[getIndex('Status')],
            plannedDate: row[getIndex('Planned 2')],
            actual: row[getIndex('Actual 2')],
            experience : row[getIndex('Experience')],
          }));
         const pendingTasks = processedData.filter(
        task => task.plannedDate && !task.actual
      );
      
        setIndentData(pendingTasks);
      } else {
        throw new Error(indentResult.error || 'Not enough rows in INDENT sheet data');
      }

      // Fetch ENQUIRY data
      const enquiryResponse = await fetch(
        'https://script.google.com/macros/s/AKfycbwfGaiHaPhexcE9i-A7q9m81IX6zWqpr4lZBe4AkhlTjVl4wCl0v_ltvBibfduNArBVoA/exec?sheet=ENQUIRY&action=fetch'
      );
      
      if (!enquiryResponse.ok) {
        throw new Error(`HTTP error! status: ${enquiryResponse.status}`);
      }
      
      const enquiryResult = await enquiryResponse.json();
      
      if (enquiryResult.success && enquiryResult.data && enquiryResult.data.length > 0) {
        // First row contains headers (row 6 in your sheet)
        const headers = enquiryResult.data[5].map(h => h ? h.trim() : '');
        const enquiryRows = enquiryResult.data.slice(6);
        
        const getEnquiryIndex = (headerName) => headers.findIndex(h => h === headerName);
        
        const processedEnquiryData = enquiryRows
          .filter(row => row[getEnquiryIndex('Timestamp')]) // Filter out empty rows
          .map(row => ({
            id: row[getEnquiryIndex('Timestamp')],
            indentNo: row[getEnquiryIndex('Indent Number')],
            candidateEnquiryNo: row[getEnquiryIndex('Candidate Enquiry Number')],
            applyingForPost: row[getEnquiryIndex('Applying For the Post')],
            candidateName: row[getEnquiryIndex('Candidate Name')],
            candidateDOB: row[getEnquiryIndex('DCB')], // DCB appears to be DOB in your sheet
            candidatePhone: row[getEnquiryIndex('Candidate Phone Number')],
            candidateEmail: row[getEnquiryIndex('Candidate Email')],
            previousCompany: row[getEnquiryIndex('Previous Company Name')],
            jobExperience: row[getEnquiryIndex('Job Experience')] || '',
            lastSalary: row[getEnquiryIndex('Last Salary')] || '',
            previousPosition: row[getEnquiryIndex('Previous Position')] || '',
            reasonForLeaving: row[getEnquiryIndex('Reason For Leaving')] || '',
            maritalStatus: row[getEnquiryIndex('Marital Status')] || '',
            lastEmployerMobile: row[getEnquiryIndex('Last Employer Mobile')] || '',
            candidatePhoto: row[getEnquiryIndex('Candidate Photo')] || '',
            candidateResume: row[19] || '',
            referenceBy: row[getEnquiryIndex('Reference By')] || '',
            presentAddress: row[getEnquiryIndex('Present Address')] || '',
            aadharNo: row[getEnquiryIndex('Aadhar No')] || ''
          }));
        
        setEnquiryData(processedEnquiryData);
       // addEnquiry(processedEnquiryData);
      } else {
        throw new Error(enquiryResult.error || 'Not enough rows in ENQUIRY sheet data');
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
      toast.error('Failed to fetch data');
    } finally {
     // setLoading(false);
      setTableLoading(false);
    }
  };

  const getNextEnquiryNumber = async () => {
  setGeneratingEnquiryNo(true);
  try {
    // 1️⃣ Get the highest enquiry number
    const { data, error } = await supabase
      .from("enquiry")
      .select("candidate_enquiry_no")
      .order("candidate_enquiry_no", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching enquiry number:", error);
      throw error;
    }

    let nextNumber = 1;

    if (data && data.length > 0 && data[0].candidate_enquiry_no) {
      const lastNumber = data[0].candidate_enquiry_no;

      // Extract numeric part (works for ENQ-1, ENQ-01, ENQ-099, etc.)
      const match = lastNumber.match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0], 10) + 1;
      }
    }

    // 2️⃣ Format: pad to 2 digits until >= 100
    let enquiryNo = "";
    if (nextNumber < 100) {
      enquiryNo = `ENQ-${String(nextNumber).padStart(2, "0")}`;
    } else {
      enquiryNo = `ENQ-${nextNumber}`;
    }

    setGeneratedCandidateNo(enquiryNo);
    return enquiryNo;
  } catch (error) {
    console.error("Error getting next enquiry number:", error);

    // 3️⃣ Fallback: timestamp-based
    const timestamp = new Date().getTime();
    const enquiryNo = `ENQ-${timestamp.toString().slice(-6)}`;
    setGeneratedCandidateNo(enquiryNo);
    toast.error(
      "Could not generate enquiry number from database. Using fallback."
    );
    return enquiryNo;
  } finally {
    setGeneratingEnquiryNo(false);
  }
};



 // Function to generate enquiry number from Supabase
//   const generateEnquiryNumber = async () => {
//     setGeneratingEnquiryNo(true);
//     try {
//       // Call a Supabase function to generate the next enquiry number
//       const { data, error } = await supabase
//         .rpc('generate_next_enquiry_number');
      
//       if (error) {
//         console.error('Error generating enquiry number:', error);
//         // Fallback: Generate a simple number if the function fails
//         const { data: lastEnquiry } = await supabase
//           .from('enquiry')
//           .select('candidate_enquiry_no')
//           .order('created_at', { ascending: false })
//           .limit(1)
//           .single();
        
//         let nextNumber = 1;
//         if (lastEnquiry && lastEnquiry.candidate_enquiry_no) {
//           const match = lastEnquiry.candidate_enquiry_no.match(/\d+/);
//           if (match) {
//             nextNumber = parseInt(match[0]) + 1;
//           }
//         }
        
//         const enquiryNo = `ENQ-${String(nextNumber).padStart(4, '0')}`;
//         setGeneratedCandidateNo(enquiryNo);
//         return enquiryNo;
//       }
      
//       setGeneratedCandidateNo(data);
//       return data;
//     } catch (error) {
//       console.error('Error generating enquiry number:', error);
//       // Final fallback: Use timestamp-based number
//       const timestamp = new Date().getTime();
//       const enquiryNo = `ENQ-${timestamp.toString().slice(-6)}`;
//       setGeneratedCandidateNo(enquiryNo);
//       console.log(enquiryNo);
      
//       return enquiryNo;
//     } finally {
//       setGeneratingEnquiryNo(false);
//     }
//   };
// useEffect(() => {
// generateEnquiryNumber()
// }, [])



  // const getNextEnquiryNumber = async () => {
  //   try {
  //     // Get the highest existing enquiry number
  //     const { data, error } = await supabase
  //       .from('enquiry')
  //       .select('candidate_enquiry_no')
  //       .order('candidate_enquiry_no', { ascending: false })
  //       .limit(1);
      
  //     if (error) throw error;
      
  //     let nextNumber = 1;
      
  //     if (data && data.length > 0 && data[0].candidate_enquiry_no) {
  //       const lastNumber = data[0].candidate_enquiry_no;
  //       const match = lastNumber.match(/\d+/);
  //       if (match) {
  //         nextNumber = parseInt(match[0]) + 1;
  //       }
  //     }
      
  //     const enquiryNo = `ENQ-${String(nextNumber).padStart(4, '0')}`;
  //     setGeneratedCandidateNo(enquiryNo);
  //     return enquiryNo;
  //   } catch (error) {
  //     console.error('Error getting next enquiry number:', error);
  //     // Fallback to timestamp-based number
  //     const timestamp = new Date().getTime();
  //     const enquiryNo = `ENQ-${timestamp.toString().slice(-6)}`;
  //     setGeneratedCandidateNo(enquiryNo);
  //     return enquiryNo;
  //   }
  // };


  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Upload file to Google Drive
  const uploadFileToGoogleDrive = async (file, type) => {
    try {
      const base64Data = await fileToBase64(file);
      
      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbwfGaiHaPhexcE9i-A7q9m81IX6zWqpr4lZBe4AkhlTjVl4wCl0v_ltvBibfduNArBVoA/exec',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            action: 'uploadFile',
            base64Data: base64Data,
            fileName: `${generatedCandidateNo}_${type}_${file.name}`,
            mimeType: file.type,
            folderId: GOOGLE_DRIVE_FOLDER_ID
          }),
        }
      );

      const result = await response.json();
      
      if (result.success) {
        return result.fileUrl;
      } else {
        throw new Error(result.error || 'File upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // const pendingData = indentData.filter(item => 
  //   !enquiryData.some(enquiry => enquiry.indentNo === item.indentNo)
  // );

  const historyData = enquiryData;

  const handleEnquiryClick = (item) => {
    setSelectedItem(item);
    const candidateNo = getNextEnquiryNumber();
    setGeneratedCandidateNo(candidateNo);
    setFormData({
      candidateName: '',
      candidateDOB: '',
      candidatePhone: '',
      candidateEmail: '',
      previousCompany: '',
      jobExperience: '',
      lastSalary: '',
      previousPosition: '',
      reasonForLeaving: '',
      maritalStatus: '',
      lastEmployerMobile: '',
      candidatePhoto: null,
      candidateResume: null,
      referenceBy: '',
      presentAddress: '',
      aadharNo: '',
      status: 'NeedMore',
    });
    setShowModal(true);
  };

  const formatDOB = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return as-is if not a valid date
    }
    
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear().toString().slice(-2);
    
    return `${day}-${month}-${year}`;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    let photoUrl = "";
    let resumeUrl = "";

    // If you want uploads, handle them here (optional)
    // Example:
    // if (formData.candidatePhoto) {
    //   photoUrl = await uploadFileToGoogleDrive(formData.candidatePhoto, "photo");
    // }
    // if (formData.candidateResume) {
    //   resumeUrl = await uploadFileToGoogleDrive(formData.candidateResume, "resume");
    // }

    const rowData = {
      indentNo: selectedItem.indent_no,
      applyingForPost: selectedItem.post,
      candidateName: formData.candidateName,
      candidateDOB: formatDOB(formData.candidateDOB),
      candidatePhone: formData.candidatePhone,
      candidateEmail: formData.candidateEmail,
      previousCompany: formData.previousCompany,
      jobExperience: formData.jobExperience,
      lastSalary: formData.lastSalary,
      previousPosition: formData.previousPosition,
      reasonForLeaving: formData.reasonForLeaving,
      maritalStatus: formData.maritalStatus,
      lastEmployerMobile: formData.lastEmployerMobile,
      candidatePhoto: formData.candidatePhoto,
      referenceBy: formData.referenceBy,
      presentAddress: formData.presentAddress,
      aadharNo: formData.aadharNo,
      resumeCopy: formData.candidateResume,
      planned: new Date().toISOString().split("T")[0], // planned as today’s date
      actual: null,
      status: formData.status, // ✅ important for indent update
    };

    console.log("Submitting enquiry:", rowData);

    const response = await postFindEnquiryApi(rowData);

    if (!response) {
      toast.error("Failed to submit enquiry");
      return;
    }

    if (formData.status === "Complete") {
      toast.success("Enquiry submitted and Indent marked Complete!");
    } else {
      toast.success("Enquiry submitted successfully!");
    }

    setShowModal(false);
    await dispatch(indentForEnquiry());

  } catch (error) {
    console.error("Submission error:", error);
    toast.error(`Error: ${error.message}`);
  } finally {
    setSubmitting(false);
    setUploadingPhoto(false);
    setUploadingResume(false);
  }
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        [field]: file
      }));
    }
  };

  const filteredPendingData = indentEnquiry.filter(item => {
    const matchesSearch = item.post?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.indent_no?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredHistoryData = enquiry.filter(item => {
    const matchesSearch = item.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.candidate_enquiry_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.indent_no?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Find Enquiry</h1>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-400 border-opacity-30 rounded-lg focus:outline-none focus:ring-2  bg-white bg-opacity-10 focus:ring-indigo-500 text-gray-600  "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 opacity-60" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-300 border-opacity-20">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'pending'
                  ?'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('pending')}
            >
              <Clock size={16} className="inline mr-2" />
              Pending ({filteredPendingData.length})
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('history')}
            >
              <CheckCircle size={16} className="inline mr-2" />
              History ({filteredHistoryData.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'pending' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 ">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium  text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium  text-gray-500 uppercase tracking-wider">Indent No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium  text-gray-500 uppercase tracking-wider">Post</th>
                    <th className="px-6 py-3 text-left text-xs font-medium  text-gray-500 uppercase tracking-wider">Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium  text-gray-500 uppercase tracking-wider">Prefer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium  text-gray-500 uppercase tracking-wider">Number Of Post</th>
                    <th className="px-6 py-3 text-left text-xs font-medium  text-gray-500 uppercase tracking-wider">Competition Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex justify-center flex-col items-center">
                          <div className="w-6 h-6 border-4 border-indigo-500 border-dashed rounded-full animate-spin mb-2"></div>
                          <span className="text-gray-600 text-sm">Loading pending enquiries...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPendingData.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <p className="text-gray-500">No pending enquiries found.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPendingData.map((item,index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleEnquiryClick(item)}
                            className="px-3 py-1 text-white bg-indigo-700 rounded-md hover:bg-opacity-90 text-sm"
                          >
                            Enquiry
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.indent_no}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.post}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.gender}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.prefer || '-'} {item.experience}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.number_of_posts}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.competition_date ? new Date(item.competition_date).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indent No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enquiry No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Post</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resume</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center">
                        <div className="flex justify-center flex-col items-center">
                          <div className="w-6 h-6 border-4 border-indigo-500 border-dashed rounded-full animate-spin mb-2"></div>
                          <span className="text-gray-600 text-sm">Loading enquiry history...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredHistoryData.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center">
                        <p className="text-gray-500">No enquiry history found.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredHistoryData.map((item,index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.indent_no}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.candidate_enquiry_no}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.applying_for_the_post}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.candidate_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.candidate_phone_no}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.candidate_email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.job_experience}</td>
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
                          ) : '-'}
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
                          ) : '-'}
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

      {/* Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-300 border-opacity-20">
              <h3 className="text-lg font-medium text-gray-500">Candidate Enquiry Form</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-opacity-80">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Indent No.</label>
                  <input
                    type="text"
                    value={selectedItem.indent_no}
                    disabled
                    className="w-full border border-gray-300 border-opacity-30 rounded-md px-3 py-2 bg-white bg-opacity-5 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Candidate Enquiry No.</label>
                  <input
                    type="text"
                    value={generatedCandidateNo}
                    disabled
                    className="w-full border border-gray-300 border-opacity-30 rounded-md px-3 py-2 bg-white bg-opacity-5 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Applying For Post</label>
                  <input
                    type="text"
                    value={selectedItem.post}
                    disabled
                    className="w-full border border-gray-300 border-opacity-30 rounded-md px-3 py-2 bg-white bg-opacity-5 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Candidate Name *</label>
                  <input
                    type="text"
                    name="candidateName"
                    value={formData.candidateName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 border-opacity-30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white bg-white bg-opacity-10 text-gray-500 placeholder-white placeholder-opacity-60"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Candidate DOB</label>
                  <input
                    type="date"
                    name="candidateDOB"
                    value={formData.candidateDOB}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 border-opacity-30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white bg-white bg-opacity-10 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Candidate Phone *</label>
                  <input
                    type="tel"
                    name="candidatePhone"
                    value={formData.candidatePhone}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 border-opacity-30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white bg-white bg-opacity-10 text-gray-500 placeholder-white placeholder-opacity-60"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Candidate Email</label>
                  <input
                    type="email"
                    name="candidateEmail"
                    value={formData.candidateEmail}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 border-opacity-30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white bg-white bg-opacity-10 text-gray-500 placeholder-white placeholder-opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Previous Company</label>
                  <input
                    type="text"
                    name="previousCompany"
                    value={formData.previousCompany}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 border-opacity-30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white bg-white bg-opacity-10 text-gray-500 placeholder-white placeholder-opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Job Experience</label>
                  <input
                    type="text"
                    name="jobExperience"
                    value={formData.jobExperience}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 border-opacity-30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white bg-white bg-opacity-10 text-gray-500 placeholder-white placeholder-opacity-60"
                  />
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Last Salary Drawn</label>
                  <input
                    type="number"
                    name="lastSalary"
                    value={formData.lastSalary}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 border-opacity-30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white bg-white bg-opacity-10 text-gray-500 placeholder-white placeholder-opacity-60"
                  />
                </div> */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Previous Position</label>
                  <input
                    type="text"
                    name="previousPosition"
                    value={formData.previousPosition}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 border-opacity-30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white bg-white bg-opacity-10 text-gray-500 placeholder-white placeholder-opacity-60"
                  />
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Reason for Leaving</label>
                  <input
                    type="text"
                    name="reasonForLeaving"
                    value={formData.reasonForLeaving}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 border-opacity-30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white bg-white bg-opacity-10 text-gray-500 placeholder-white placeholder-opacity-60"
                  />
                </div> */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Marital Status</label>
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 border-opacity-30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white bg-white bg-opacity-10 text-gray-500"
                  >
                    <option value="">Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Last Employer Mobile</label>
                  <input
                    type="tel"
                    name="lastEmployerMobile"
                    value={formData.lastEmployerMobile}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 border-opacity-30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white bg-white bg-opacity-10 text-gray-500 placeholder-white placeholder-opacity-60"
                  />
                </div> */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Reference By</label>
                  <input
                    type="text"
                    name="referenceBy"
                    value={formData.referenceBy}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 border-opacity-30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white bg-white bg-opacity-10 text-gray-500 placeholder-white placeholder-opacity-60"
                  />
                </div> */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Aadhar No.*</label>
                  <input
                    type="text"
                    name="aadharNo"
                    value={formData.aadharNo}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 border-opacity-30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white bg-white bg-opacity-10 text-gray-500 placeholder-white placeholder-opacity-60"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Current Address</label>
                <textarea
                  name="presentAddress"
                  value={formData.presentAddress}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-gray-300 border-opacity-30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white bg-white bg-opacity-10 text-gray-500 placeholder-white placeholder-opacity-60"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Candidate Photo</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, 'candidatePhoto')}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="flex items-center px-4 py-2 border border-gray-300 border-opacity-30 rounded-md cursor-pointer hover:bg-white hover:bg-opacity-10 text-gray-500"
                    >
                      <Upload size={16} className="mr-2" />
                      {uploadingPhoto ? 'Uploading...' : 'Upload File'}
                    </label>
                    {formData.candidatePhoto && !uploadingPhoto && (
                      <span className="text-sm text-gray-500 opacity-80">{formData.candidatePhoto.name}</span>
                    )}
                    {uploadingPhoto && (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-indigo-500 border-dashed rounded-full animate-spin mr-2"></div>
                        <span className="text-sm text-gray-500">Uploading photo...</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Max 10MB. Supports: JPG, JPEG, PNG, PDF, DOC, DOCX</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Candidate Resume</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'candidateResume')}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="flex items-center px-4 py-2 border border-gray-300 border-opacity-30 rounded-md cursor-pointer hover:bg-white hover:bg-opacity-10 text-gray-500"
                    >
                      <Upload size={16} className="mr-2" />
                      {uploadingResume ? 'Uploading...' : 'Upload File'}
                    </label>
                    {formData.candidateResume && !uploadingResume && (
                      <span className="text-sm text-gray-500 opacity-80">{formData.candidateResume.name}</span>
                    )}
                    {uploadingResume && (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-indigo-500 border-dashed rounded-full animate-spin mr-2"></div>
                        <span className="text-sm text-gray-500">Uploading resume...</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Max 10MB. Supports: PDF, DOC, DOCX, JPG, JPEG, PNG</p>
                </div>
                
              </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 border-opacity-30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white bg-white bg-opacity-10 text-gray-500"
                    required
                  >
                    <option value="NeedMore">Need More </option>
                    <option value="Complete">Complete</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 border-opacity-30 rounded-md text-gray-500 hover:bg-white hover:bg-opacity-10"
                  disabled={submitting || uploadingPhoto || uploadingResume}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-indigo-700 rounded-md hover:bg-opacity-90 flex items-center justify-center"
                  disabled={submitting || uploadingPhoto || uploadingResume}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindEnquiry;