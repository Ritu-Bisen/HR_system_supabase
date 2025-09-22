import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Users, 
  UserCheck, 
  UserX, 
  UserPlus,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import supabase from '../SupabaseClient';

const Dashboard = () => {
  const [totalEmployee, setTotalEmployee] = useState(0);
  const [activeEmployee, setActiveEmployee] = useState(0);
  const [leftEmployee, setLeftEmployee] = useState(0);
  const [leaveThisMonth, setLeaveThisMonth] = useState(0);
  const [monthlyHiringData, setMonthlyHiringData] = useState([]);
  const [designationData, setDesignationData] = useState([]);
  const [postRequiredData, setPostRequiredData] = useState([]);
  
  // Mock data for other charts
  const employeeStatusData = [
    { name: 'Active', value: activeEmployee, color: '#10B981' },
    { name: 'Resigned', value: leftEmployee, color: '#EF4444' }
  ];

  const performanceData = [
    { month: 'Jan', productivity: 85, satisfaction: 78 },
    { month: 'Feb', productivity: 88, satisfaction: 82 },
    { month: 'Mar', productivity: 92, satisfaction: 85 },
    { month: 'Apr', productivity: 89, satisfaction: 88 },
    { month: 'May', productivity: 94, satisfaction: 90 },
    { month: 'Jun', productivity: 96, satisfaction: 92 }
  ];



const fetchPostRequiredData = async () => {
  try {
    // Fetch only necessary columns
    const { data, error } = await supabase
      .from("indent")
      .select("post, number_of_posts, status");

    if (error) throw error;

    if (!Array.isArray(data)) {
      throw new Error("Expected array data not received");
    }

    // Filter rows where status = "Need More"
    const needMoreData = data.filter(
      (row) => row.status?.toString().trim().toLowerCase() === "needmore"
    );


    // Prepare chart data
    const postData = needMoreData.map((row) => ({
      postName: row.post,
      numberOfPosts: parseInt(row.number_of_posts) || 0,
    }));

    console.log("✅ Post Required Data (Supabase):", postData);
    setPostRequiredData(postData);

  } catch (error) {
    console.error("Error fetching post required data from Supabase:", error);
    setPostRequiredData([]);
  }
};


  const parseSheetDate = (dateStr) => {
    if (!dateStr) return null;
    
    // Already a Date object
    if (dateStr instanceof Date) return dateStr;
    
    // Try ISO / normal parse
    const iso = Date.parse(dateStr);
    if (!isNaN(iso)) return new Date(iso);
    
    // Try dd/mm/yyyy or d/m/yyyy
    const parts = dateStr.toString().split(/[\/\-]/); // split by "/" or "-"
    if (parts.length === 3) {
      let [day, month, year] = parts.map(p => parseInt(p, 10));
      if (year < 100) year += 2000; // handle yy
      return new Date(year, month - 1, day);
    }
    
    return null;
  };

  

const fetchJoiningCount = async () => {
  try {
    const { data, error } = await supabase
      .from("joining")
      .select("id, date_of_joining, designation, actual_date, leaving_date");

    if (error) throw error;

    let activeCount = 0;
    const monthlyHiring = {};
    const designationCounts = {};

    // Month labels
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const now = new Date();

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthYear = `${months[month.getMonth()]} ${month.getFullYear()}`;
      monthlyHiring[monthYear] = { hired: 0 };
    }

  data.forEach(row => {
  // Active employee condition
 
  console.log("Row check:", {
    actual_date: row.actual_date,
    leaving_date: row.leaving_date,
  });

  if (row.actual_date && !row.leaving_date) {
    activeCount++;
  }



  // Monthly hiring
  if (row.date_of_joining) {
    const date = new Date(row.date_of_joining);
    const monthYear = `${months[date.getMonth()]} ${date.getFullYear()}`;
    if (monthlyHiring[monthYear]) {
      monthlyHiring[monthYear].hired += 1;
    } else {
      monthlyHiring[monthYear] = { hired: 1 };
    }
  }

  // Designation count
  if (row.designation) {
    designationCounts[row.designation] =
      (designationCounts[row.designation] || 0) + 1;
  }
});

    // Convert designation counts to array (for charts)
    const designationArray = Object.entries(designationCounts).map(
      ([designation, employees]) => ({ designation, employees })
    );
    setDesignationData(designationArray);

    // ✅ Set active employees properly
    setActiveEmployee(activeCount);

    return {
      total: data.length,
      active: activeCount,
      monthlyHiring,
    };
  } catch (error) {
    console.error("Error fetching joining count:", error);
    return { total: 0, active: 0, monthlyHiring: {} };
  }
};


const fetchLeaveCount = async () => {
  try {
    const { data, error } = await supabase
      .from("leaving")
      .select("date_of_leaving");

    if (error) throw error;

    let thisMonthCount = 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthlyLeaving = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthYear = `${months[month.getMonth()]} ${month.getFullYear()}`;
      monthlyLeaving[monthYear] = { left: 0 };
    }

    data.forEach(row => {
      if (row.date_of_leaving) {
        const date = new Date(row.date_of_leaving);

        // Left this month
        if (
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        ) {
          thisMonthCount++;
        }

        // Monthly leaving count
        const monthYear = `${months[date.getMonth()]} ${date.getFullYear()}`;
        if (monthlyLeaving[monthYear]) {
          monthlyLeaving[monthYear].left += 1;
        } else {
          monthlyLeaving[monthYear] = { left: 1 };
        }
      }
    });

    // Update states
    setLeftEmployee(data.length);
    setLeaveThisMonth(thisMonthCount);

    return { total: data.length, monthlyLeaving };
  } catch (error) {
    console.error("Error fetching leave count:", error);
    return { total: 0, monthlyLeaving: {} };
  }
};


  const prepareMonthlyHiringData = (hiringData, leavingData) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const result = [];
    
    // Get data for the last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentDate.getMonth() - i + 12) % 12;
      const monthYear = `${months[monthIndex]} ${currentDate.getFullYear()}`;
      
      result.push({
        month: months[monthIndex],
        hired: hiringData[monthYear]?.hired || 0,
        left: leavingData[monthYear]?.left || 0
      });
    }
    
    return result;
  };

  useEffect(() => {
    const fetchData = async () => {
    try {
      const [joiningResult, leavingResult] = await Promise.all([
        fetchJoiningCount(),
        fetchLeaveCount(),
        fetchPostRequiredData() // Add this line
      ]);
        
        // Calculate total employees (JOINING + LEAVING)
        setTotalEmployee(joiningResult.total );
        
        // Prepare the monthly hiring data for the chart
        const monthlyData = prepareMonthlyHiringData(
          joiningResult.monthlyHiring, 
          leavingResult.monthlyLeaving
        );
        
        setMonthlyHiringData(monthlyData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="space-y-6 page-content p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">HR Dashboard</h1>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border p-6 flex items-start">
          <div className="p-3 rounded-full bg-blue-100 mr-4">
            <Users size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Total Employees</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalEmployee}</h3>
            <p className="text-xs text-green-600 mt-1">+12% from last month</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border p-6 flex items-start">
          <div className="p-3 rounded-full bg-green-100 mr-4">
            <UserCheck size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Active Employees</p>
            <h3 className="text-2xl font-bold text-gray-800">{activeEmployee}</h3>
            <p className="text-xs text-green-600 mt-1">+8% from last month</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border p-6 flex items-start">
          <div className="p-3 rounded-full bg-amber-100 mr-4">
            <Clock size={24} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">On Resigned</p>
            <h3 className="text-2xl font-bold text-gray-800">{leftEmployee}</h3>
            <p className="text-xs text-amber-600 mt-1">2 pending approvals</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border p-6 flex items-start">
          <div className="p-3 rounded-full bg-red-100 mr-4">
            <UserX size={24} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Left This Month</p>
            <h3 className="text-2xl font-bold text-gray-800">{leaveThisMonth}</h3>
            <p className="text-xs text-red-600 mt-1">2 resignations, 1 termination</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <Users size={20} className="mr-2" />
            Employee Status Distribution
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={employeeStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {employeeStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ color: '#374151' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border p-6">
  <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
    <TrendingUp size={20} className="mr-2" />
    Posts Requiring More Candidates
  </h2>
  <div className="h-80">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={postRequiredData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
        <XAxis dataKey="postName" stroke="#374151" />
        <YAxis stroke="#374151" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            color: '#374151'
          }} 
        />
        <Bar dataKey="numberOfPosts" name="Posts Required" fill="#3B82F6" />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

     
      </div>
       <div className="bg-white rounded-xl shadow-lg border p-6">
  <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
    <UserPlus size={20} className="mr-2" />
    Designation-wise Employee Count
  </h2>
  <div className="h-80">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={designationData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
        <XAxis dataKey="designation" stroke="#374151" />
        <YAxis stroke="#374151" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            color: '#374151'
          }} 
        />
        <Bar dataKey="employees" name="Employees">
          {designationData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={index % 3 === 0 ? '#EF4444' : index % 3 === 1 ? '#10B981' : '#3B82F6'} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

      
    </div>
  );
};

export default Dashboard;