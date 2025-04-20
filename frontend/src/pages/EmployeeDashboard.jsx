/**
 * Author      : Yash Lalage
 * Description : [Brief Description of the Component]
 * Created On  : April 20, 2025
 */
import { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Dot } from "lucide-react";

function EmployeeDashboard() {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:3000/api/tasks/my-tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(res.data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      toast.error("Failed to fetch tasks");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const changeTaskStatus = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:3000/api/tasks/${taskId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(`Task marked as ${newStatus}`);
      fetchTasks(); // Refresh tasks after update
    } catch (error) {
      console.error("Failed to change task status:", error);
      toast.error("Failed to update task");
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

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white py-10 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold mb-8 text-center">Employee Dashboard</h1>

      {tasks.length === 0 ? (
        <p className="text-center text-gray-400">No tasks assigned yet.</p>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-gray-800 p-3 rounded-lg shadow-md border border-gray-700"
            >
              <h2 className="text-lg font-semibold mb-1">{task.title}</h2>
              <p className="text-gray-300 text-sm mb-1">{task.description}</p>
              <p className="text-xs text-gray-500 mb-2">
                Due: {new Date(task.dueDate).toDateString()}
              </p>

              <div className="flex items-center space-x-2 mb-3">
                <Dot className={`${getTaskStatusColor(task.status)} w-5 h-5`} />
                <p className="text-sm text-gray-400 capitalize">{task.status}</p>
              </div>

              {task.status === "complete" ? (
                <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded-full">
                  Completed
                </span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {task.status !== "in progress" && (
                    <button
                      onClick={() => changeTaskStatus(task.id, "in progress")}
                      className="bg-yellow-600 text-white px-3 py-1 text-sm rounded hover:bg-yellow-700 transition duration-200"
                    >
                      In Progress
                    </button>
                  )}
                  <button
                    onClick={() => changeTaskStatus(task.id, "complete")}
                    className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700 transition duration-200"
                  >
                    Complete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EmployeeDashboard;
