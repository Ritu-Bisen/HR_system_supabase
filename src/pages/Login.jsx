import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, User, Lock, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from '../redux/Slice/loginSlice';

const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbwfGaiHaPhexcE9i-A7q9m81IX6zWqpr4lZBe4AkhlTjVl4wCl0v_ltvBibfduNArBVoA/exec?sheet=USER&action=fetch';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const {userData} = useSelector((state) => state.login);
  const navigate = useNavigate();
  const dispatch = useDispatch();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);

//     try {
//       // const res = await fetch(SHEET_API_URL);
//       // const json = await res.json();

//       // if (!json.success) {
//       //   toast.error('Error fetching data');
//        // setSubmitting(false);
//       //   return;
//       // }

//       // const rows = json.data;
//       // const headers = rows[0];
//       // const users = rows.slice(1).map(row => {
//       //   let obj = {};
//       //   headers.forEach((h, i) => obj[h] = row[i]);
//       //   return obj;
//       // });
// dispatch(loginUser())
//       // const matchedUser = users.find(
//       //   (u) => u.Username === username && u.Password === password
//       // );
      
//       if (matchedUser) {
//         toast.success('Login successful!');
//         localStorage.setItem('user', JSON.stringify(matchedUser));
//         login(matchedUser); // Update auth store
        
//         const adminStatus = matchedUser.Admin ? matchedUser.Admin.trim().toLowerCase() : 'no';
        
//         if (adminStatus === "yes") {
//           navigate("/", { replace: true });
//         } else {
//           navigate("/my-profile", { replace: true });
//         }
//       } else {
//         toast.error('Invalid credentials');
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error('Network error');
//     } finally {
//       setSubmitting(false);
//     }
//   };

// Login.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    // Dispatch async thunk with credentials
    const resultAction = await dispatch(loginUser({ username, password }));

    if (loginUser.fulfilled.match(resultAction)) {
      // ✅ Login success
      const matchedUser = resultAction.payload; // Supabase user row

      toast.success('Login successful!');
      localStorage.setItem('user', JSON.stringify(matchedUser));
      console.log(matchedUser);
      
    const adminStatus = matchedUser.Admin?.trim().toLowerCase() || 'no';
if (adminStatus === "yes") {
  navigate("/", { replace: true });
} else {
  navigate("/my-profile", { replace: true });
}

    } else {
      // ❌ Login failed
      toast.error(resultAction.payload || "Invalid credentials");
    }
  } catch (err) {
    console.error(err);
    toast.error('Unexpected error');
  } finally {
    setSubmitting(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">HR FMS</h2>
          <p className="text-sm text-gray-500">
            Human Resource & File Management System
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-blue-600 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                  placeholder="Enter your username"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-blue-600 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                  placeholder="Enter your password"
                />
              </div>
            </div>
          </div>

          <div>
             <button
                  type="submit"
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                    submitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center">
                      <svg 
                        className="animate-spin h-4 w-4 text-white mr-2" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sign in....</span>
                    </div>
                  ) : 'Sign in'}
                </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;