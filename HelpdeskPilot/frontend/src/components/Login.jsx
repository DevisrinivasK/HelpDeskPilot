import { useState } from 'react';
     import axios from 'axios';
     import { useNavigate } from 'react-router-dom';

     function Login() {
       const [email, setEmail] = useState('');
       const [password, setPassword] = useState('');
       const [error, setError] = useState('');
       const navigate = useNavigate();

       const handleSubmit = async (e) => {
         e.preventDefault();
         try {
           const res = await axios.post('http://localhost:8080/api/auth/login', {
             email,
             password,
           });
           localStorage.setItem('token', res.data.token);
           localStorage.setItem('role', res.data.role);
           navigate('/tickets');
         } catch (err) {
           setError(`Login failed: ${err.response?.data?.message || err.message}`);
         }
       };

       return (
         <div className="min-h-screen flex items-center justify-center bg-gray-100">
           <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
             <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
             {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
             <form onSubmit={handleSubmit} className="space-y-4">
               <input
                 type="email"
                 placeholder="Email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
                 className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
               <input
                 type="password"
                 placeholder="Password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
                 className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
               <button
                 type="submit"
                 className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition"
               >
                 Login
               </button>
             </form>
           </div>
         </div>
       );
     }

     export default Login;