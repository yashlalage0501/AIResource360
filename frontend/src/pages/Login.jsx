/**
 * Author      : Yash Lalage
 * Description : [Brief Description of the Component]
 * Created On  : April 20, 2025
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/api/login", {
        email,
        password,
      });

      const { token, role } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      if (role === "manager") {
        navigate("/manager");
      } else if (role === "employee") {
        navigate("/employee");
      } else {
        alert("Unknown role");
      }
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Left Side: Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100 p-6">
        <form
          onSubmit={handleLogin}
          className="bg-white w-full max-w-md p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Login
          </h2>

          <input
            className="w-full border border-gray-300 rounded px-4 py-2 mb-4 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full border border-gray-300 rounded px-4 py-2 mb-6 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200">
            Login
          </button>

          <div className="text-center mt-4">
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={() => navigate("/signup")}
            >
              Don’t have an account? Signup
            </button>
          </div>
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

export default Login;
