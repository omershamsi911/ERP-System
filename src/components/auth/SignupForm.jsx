// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../hooks/useAuth';
// import { authService } from '../../services/auth.service';
// import { LoadingSpinner } from '../shared/LoadingSpinner';
// import { Navigate } from 'react-router-dom';

// export const SignupForm = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     confirmPassword: '',
//     full_name: '',
//     contact: '',
//     role: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [roles, setRoles] = useState([]);

//   const { isAuthenticated, signUp } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     loadRoles();
//   }, []);

//   const loadRoles = async () => {
//     try {
//       const availableRoles = await authService.getRoles();
//       setRoles(availableRoles);
//     } catch (error) {
//       console.error('Error loading roles:', error);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
    
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//   };

//   if (isAuthenticated) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!formData.email) {
//       newErrors.email = 'Email is required';
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Please enter a valid email address';
//     }
    
//     if (!formData.password) {
//       newErrors.password = 'Password is required';
//     } else if (formData.password.length < 6) {
//       newErrors.password = 'Password must be at least 6 characters';
//     }
    
//     if (formData.password !== formData.confirmPassword) {
//       newErrors.confirmPassword = 'Passwords do not match';
//     }
    
//     if (!formData.full_name) {
//       newErrors.full_name = 'Full name is required';
//     }
    
//     if (!formData.contact) {
//       newErrors.contact = 'Contact number is required';
//     }
    
//     if (!formData.role) {
//       newErrors.role = 'Role is required';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);
    
//     try {
//       const userData = {
//         email: formData.email,
//         password: formData.password,
//         full_name: formData.full_name,
//         contact: formData.contact,
//         role: formData.role
//       };

//       await signUp(userData);
//       navigate('/dashboard');
//     } catch (error) {
//       setErrors({ general: error.message || 'Signup failed' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Create your account
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Join the School ERP System
//           </p>
//         </div>
        
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           {errors.general && (
//             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
//               {errors.general}
//             </div>
//           )}

//           <div className="space-y-4">
//             <div>
//               <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
//                 Full Name
//               </label>
//               <input
//                 id="full_name"
//                 name="full_name"
//                 type="text"
//                 required
//                 className={`mt-1 block w-full px-3 py-2 border ${
//                   errors.full_name ? 'border-red-300' : 'border-gray-300'
//                 } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                 placeholder="Enter your full name"
//                 value={formData.full_name}
//                 onChange={handleChange}
//               />
//               {errors.full_name && (
//                 <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
//               )}
//             </div>

//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//                 Email Address
//               </label>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 required
//                 className={`mt-1 block w-full px-3 py-2 border ${
//                   errors.email ? 'border-red-300' : 'border-gray-300'
//                 } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                 placeholder="Enter your email"
//                 value={formData.email}
//                 onChange={handleChange}
//               />
//               {errors.email && (
//                 <p className="mt-1 text-sm text-red-600">{errors.email}</p>
//               )}
//             </div>

//             <div>
//               <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
//                 Contact Number
//               </label>
//               <input
//                 id="contact"
//                 name="contact"
//                 type="tel"
//                 required
//                 className={`mt-1 block w-full px-3 py-2 border ${
//                   errors.contact ? 'border-red-300' : 'border-gray-300'
//                 } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                 placeholder="Enter your contact number"
//                 value={formData.contact}
//                 onChange={handleChange}
//               />
//               {errors.contact && (
//                 <p className="mt-1 text-sm text-red-600">{errors.contact}</p>
//               )}
//             </div>

//             <div>
//               <label htmlFor="role" className="block text-sm font-medium text-gray-700">
//                 Role
//               </label>
//               <select
//                 id="role"
//                 name="role"
//                 required
//                 className={`mt-1 block w-full px-3 py-2 border ${
//                   errors.role ? 'border-red-300' : 'border-gray-300'
//                 } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                 value={formData.role}
//                 onChange={handleChange}
//               >
//                 <option value="">Select a role</option>
//                 {roles.map(role => (
//                   <option key={role.id} value={role.name}>
//                     {role.name}
//                   </option>
//                 ))}
//               </select>
//               {errors.role && (
//                 <p className="mt-1 text-sm text-red-600">{errors.role}</p>
//               )}
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 autoComplete="new-password"
//                 required
//                 className={`mt-1 block w-full px-3 py-2 border ${
//                   errors.password ? 'border-red-300' : 'border-gray-300'
//                 } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                 placeholder="Enter your password"
//                 value={formData.password}
//                 onChange={handleChange}
//               />
//               {errors.password && (
//                 <p className="mt-1 text-sm text-red-600">{errors.password}</p>
//               )}
//             </div>

//             <div>
//               <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
//                 Confirm Password
//               </label>
//               <input
//                 id="confirmPassword"
//                 name="confirmPassword"
//                 type="password"
//                 autoComplete="new-password"
//                 required
//                 className={`mt-1 block w-full px-3 py-2 border ${
//                   errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
//                 } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                 placeholder="Confirm your password"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//               />
//               {errors.confirmPassword && (
//                 <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
//               )}
//             </div>
//           </div>

//           <div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? (
//                 <LoadingSpinner size="small" className="mr-2" />
//               ) : (
//                 <svg
//                   className="w-5 h-5 text-blue-500 group-hover:text-blue-400"
//                   xmlns="http://www.w3.org/2000/svg"
//                   viewBox="0 0 20 20"
//                   fill="currentColor"
//                   aria-hidden="true"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//               )}
//               {loading ? 'Creating account...' : 'Create account'}
//             </button>
//           </div>

//           <div className="text-center">
//             <p className="text-sm text-gray-600">
//               Already have an account?{' '}
//               <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
//                 Sign in
//               </a>
//             </p>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default SignupForm;