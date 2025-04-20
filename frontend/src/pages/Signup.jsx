/**
 * Author      : Yash Lalage
 * Description : [Brief Description of the Component]
 * Created On  : April 20, 2025
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
  });

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/api/signup", form);
      navigate("/");
    } catch (err) {
      if (
        err.response &&
        err.response.status === 400 &&
        err.response.data.message === "User already exists"
      ) {
        alert("Email already taken");
      } else {
        alert("Signup failed");
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Left Side: Signup Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100 p-6">
        <form
          onSubmit={handleSignup}
          className="bg-white w-full max-w-md p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Signup
          </h2>
          <input
            className="w-full border border-gray-300 rounded px-4 py-2 mb-4 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Name"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="w-full border border-gray-300 rounded px-4 py-2 mb-4 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="email"
            placeholder="Email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="w-full border border-gray-300 rounded px-4 py-2 mb-4 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="password"
            placeholder="Password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <select
            className="w-full border border-gray-300 rounded px-4 py-2 mb-6 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
          </select>
          <button className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition duration-200">
            Signup
          </button>
        </form>
      </div>

      {/* Right Side: Info Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white p-10">
        <div className="text-center max-w-xl">
          <h1 className="text-4xl font-bold mb-4">Welcome to AIResource360</h1>
          <p className="text-lg leading-relaxed text-gray-300">
            Empower your team with AI-driven resources, clear task assignments,
            live progress updates, and seamless collaboration between managers
            and employees.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
