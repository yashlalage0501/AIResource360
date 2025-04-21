/**
 * Author      : Yash Lalage
 * Description : [Brief Description of the Component]
 * Created On  : April 20, 2025
 */
import { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Dot } from "lucide-react";
import ailogo from '../assets/ailogo.png'; 
import headlogo from '../assets/head.avif'; 


function ManagerDashboard() {
  const [tasks, setTasks] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    assignedTo: "",
    difficulty: "easy", // New field for difficulty level
  });

  const [selectedEmployeeTasks, setSelectedEmployeeTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatbotResponse, setChatbotResponse] = useState(""); // Chatbot response state
  const fetchAllEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/employees");
      // Filter employees based on the desired role
      const filteredEmployees = res.data.filter(
        (emp) => emp.role.toLowerCase() === "employee"
      );
      setAllEmployees(filteredEmployees);
    } catch (error) {
      console.error("Error fetching all employees:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/tasks");
      console.log("all tasks" + res);
      const sortedTasks = res.data
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((task) => ({
          ...task,
          employee:
            allEmployees.find((emp) => emp.id === task.assignedTo) || null,
        }));
      setTasks(sortedTasks);
      console.log(sortedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleAddTask = async () => {
    const { title, description, dueDate, assignedTo, difficulty } = newTask;
    if (!title || !description || !dueDate || !assignedTo || !difficulty) {
      alert("All fields are required.");
      return;
    }
    try {
      const res = await axios.post("http://localhost:3000/api/tasks", {
        title,
        description,
        dueDate,
        assignedTo,
        difficulty,
      });
      const newTaskWithEmployee = {
        ...res.data,
        employee: allEmployees.find((emp) => emp.id === res.data.assignedTo),
      };
      setTasks((prev) => [newTaskWithEmployee, ...prev]);
      setNewTask({ title: "", description: "", dueDate: "", assignedTo: "" });
      toast.success("Task assigned successfully");
    } catch (error) {
      alert("Error adding task");
    }
  };

  const getTaskStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-red-500";
      case "in progress":
        return "text-blue-500";
      case "complete":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const calculateStatsPerEmployee = () => {
    const stats = {};
    allEmployees.forEach((emp) => {
      stats[emp.id] = {
        name: emp.name,
        email: emp.email,
        pending: 0,
        inProgress: 0,
        complete: 0,
        skillScore: 0,
      };
    });
    tasks.forEach((task) => {
      const empStat = stats[task.assignedTo];
      if (empStat) {
        const status = task.status?.toLowerCase();
        if (status === "pending") empStat.pending++;
        else if (status === "in progress") empStat.inProgress++;
        else if (status === "complete") empStat.complete++;
      }
    });
    Object.values(stats).forEach((emp) => {
      emp.skillScore = emp.complete * 10; // GenAI scoring logic
    });
    return stats;
  };

  const handleShowTasks = (status, email) => {
    console.log(
      "Filtering tasks for status:",
      status,
      "and employee ID:",
      email
    );
    console.log(tasks);
    const filteredTasks = tasks.filter((task) => {
      console.log(task);
      return (
        task.employee?.email === email &&
        task.status.toLowerCase() === status.toLowerCase()
      );
    });
    console.log("Filtered tasks:", filteredTasks);
    setSelectedEmployeeTasks(filteredTasks);
    setIsModalOpen(true);
  };

  const employeeStats = calculateStatsPerEmployee();

  useEffect(() => {
    fetchAllEmployees();
  }, []);

  // Handle chatbot action

  const handleChatbotAction = async (action) => {
    setChatbotResponse("Fetching data...");
    setTimeout(async () => {
      let response = "";
      // const employeeData = allEmployees.map((emp) => {
      //   // Get tasks assigned to each employee
      //   const employeeTasks = tasks.filter(
      //     (task) => task.assignedTo === emp.id
      //   );
      //   return {
      //     name: emp.name,
      //     skills: emp.skills, // Assuming you have skills info in the employee object
      //     availability: emp.availability, // Assuming availability is part of the employee object
      //     tasks: employeeTasks, // Add tasks assigned to the employee
      //   };
      // });

      const payload = {
        task: action,
        employee_data: tasks,
      };

      try {
        const apiResponse = await axios.post(
          "https://c19c-34-125-53-39.ngrok-free.app/analyze",
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              // Optionally, include authentication headers if needed
              // 'Authorization': `Bearer ${yourAuthToken}`
            },
          }
        );
        console.log(apiResponse);
        response = apiResponse.data.result; 
        console.log("apiResponse.data.result" + apiResponse.data.result);
        setChatbotResponse(response);
      } catch (error) {
        console.error("Error during API request:", error);
        setChatbotResponse("❌ Error fetching data. Please try again.");
      }
    }, 1000); 
  };

  useEffect(() => {
    if (allEmployees.length > 0) {
      fetchTasks();
    }
  }, [allEmployees]);

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white py-6 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />

      {/* New Horizontal Panel */}
      <div className="w-full bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="flex flex-col items-center text-white relative z-10">
          <div className="flex items-center space-x-4 mb-4">
            {/* AI Logo */}
            <img
              src={ailogo} 
              alt="AI Logo"
              className="w-12 h-12 rounded-full border-2 border-white"
            />
            <h2 className="text-2xl font-semibold">Quick Insights</h2>
          </div>
          <div className="flex flex-wrap gap-4 mb-4 justify-center">
            <button
              onClick={() => handleChatbotAction("performance")}
              className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-lg text-white font-semibold transform transition duration-300 ease-in-out hover:scale-105"
            >
              Analyze Performance
            </button>
            <button
              onClick={() => handleChatbotAction("availability")}
              className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg text-white font-semibold transform transition duration-300 ease-in-out hover:scale-105"
            >
              Employee Availability
            </button>
            <button
              onClick={() => handleChatbotAction("staff_utilization")}
              className="bg-rose-500 hover:bg-rose-600 px-4 py-2 rounded-lg text-white font-semibold transform transition duration-300 ease-in-out hover:scale-105"
            >
              Staff Utilization
            </button>
          </div>
          {chatbotResponse && (
            <div className="bg-gray-700 p-4 rounded-lg mt-2 shadow-inner text-white whitespace-pre-wrap max-w-full break-words">
              {chatbotResponse}
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-white opacity-20 blur-sm"></div>
      </div>

      <div className="flex flex-col lg:flex-row w-full space-y-6 lg:space-y-0 lg:space-x-6">
        {/* Assign Task Section */}
        <div className="w-full lg:w-1/2 bg-gray-800 p-4 rounded-lg shadow-md flex flex-col space-y-6 h-[36rem]">
          <h1 className="text-3xl font-bold text-center">Manager Dashboard</h1>
          <div className="flex flex-col space-y-4 overflow-y-auto flex-grow">
            <h2 className="text-2xl font-semibold">Assign New Task</h2>
            <input
              className="w-full p-3 bg-gray-700 text-white rounded-lg"
              placeholder="Task Title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
            />
            <textarea
              className="w-full p-3 bg-gray-700 text-white rounded-lg"
              placeholder="Task Description"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
            />
            <select
              className="w-full p-3 bg-gray-700 text-white rounded-lg"
              value={newTask.difficulty}
              onChange={(e) =>
                setNewTask({ ...newTask, difficulty: e.target.value })
              }
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <input
              type="date"
              className="w-full p-3 bg-gray-700 text-white rounded-lg"
              value={newTask.dueDate}
              onChange={(e) =>
                setNewTask({ ...newTask, dueDate: e.target.value })
              }
            />
            <select
              className="w-full p-3 bg-gray-700 text-white rounded-lg"
              value={newTask.assignedTo}
              onChange={(e) =>
                setNewTask({ ...newTask, assignedTo: e.target.value })
              }
            >
              <option value="">Select Employee</option>
              {allEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} - {emp.email}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddTask}
              className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg"
            >
              Add Task
            </button>
          </div>
        </div>

        {/* Task List Section */}
        <div className="w-full lg:w-1/2 bg-gray-800 p-6 rounded-lg shadow-md h-[36rem] overflow-y-auto">
          <h2 className="text-2xl font-semibold mb-4">Assigned Tasks</h2>
          {tasks.length === 0 ? (
            <p className="text-gray-400">No tasks assigned yet.</p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-gray-700 p-4 rounded-lg relative"
                >
                  <p className="text-sm text-gray-400">
                    Difficulty:{" "}
                    <span
                      className={
                        task.difficulty === "easy"
                          ? "text-green-500"
                          : task.difficulty === "medium"
                          ? "text-yellow-500"
                          : "text-red-500"
                      }
                    >
                      {task.difficulty}
                    </span>
                  </p>
                  <h3 className="text-xl font-semibold">{task.title}</h3>
                  <p>{task.description}</p>
                  <p className="text-sm text-gray-400">
                    Due: {new Date(task.dueDate).toDateString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    Assigned To:{" "}
                    {task.employee ? task.employee.name : "Unknown"}
                  </p>
                  <div className="flex items-center space-x-2 mb-3">
                    <Dot
                      className={`${getTaskStatusColor(task.status)} w-8 h-8`}
                    />
                    <p className="text-sm text-gray-400 capitalize">
                      {task.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Stats Panel */}
      <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">
          Employee Task Stats & Skill Score
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(employeeStats).map((emp) => (
            <div
              key={emp.email}
              className="bg-gray-700 p-4 rounded-lg relative"
            >
              <h3 className="text-lg font-semibold">{emp.name}</h3>
              <p className="text-sm text-gray-400">Email: {emp.email}</p>
              {/* Task Status Counts with Colors */}
              <div className="flex space-x-4">
                <p
                  onClick={() => handleShowTasks("pending", emp.email)}
                  className="cursor-pointer"
                >
                  Pending:{" "}
                  <span className="font-semibold text-red-500">
                    {emp.pending}
                  </span>
                </p>
                <p
                  onClick={() => handleShowTasks("in progress", emp.email)}
                  className="cursor-pointer"
                >
                  In Progress:{" "}
                  <span className="font-semibold text-blue-500">
                    {emp.inProgress}
                  </span>
                </p>
                <p
                  onClick={() => handleShowTasks("complete", emp.email)}
                  className="cursor-pointer"
                >
                  Completed:{" "}
                  <span className="font-semibold text-green-500">
                    {emp.complete}
                  </span>
                </p>
              </div>
              {/* Skill Score */}
              <div className="absolute top-2 right-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-xl transform transition duration-300 ease-in-out hover:scale-105 hover:shadow-2xl">
                Skill: {emp.skillScore}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Employee Tasks</h3>
            {selectedEmployeeTasks.length === 0 ? (
              <p>No tasks found.</p>
            ) : (
              <>
                <h1 className="text-sm font-semibold text-gray-300 mb-4">
                  Status: {selectedEmployeeTasks[0].status}
                </h1>
                <div
                  className="space-y-4 overflow-y-auto max-h-72" // Add max-height and scroll
                >
                  {selectedEmployeeTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-gray-700 p-4 rounded-lg shadow-md"
                    >
                      <p className="text-sm text-gray-400">
                        Difficulty:{" "}
                        <span
                          className={
                            task.difficulty === "easy"
                              ? "text-green-500"
                              : task.difficulty === "medium"
                              ? "text-yellow-500"
                              : "text-red-500"
                          }
                        >
                          {task.difficulty}
                        </span>
                      </p>
                      <h2 className="font-semibold text-lg text-gray-200">
                        {task.title}
                      </h2>
                      <p className="text-sm text-gray-400">
                        {task.description}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full bg-red-600 hover:bg-red-700 p-3 rounded-lg mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagerDashboard;
