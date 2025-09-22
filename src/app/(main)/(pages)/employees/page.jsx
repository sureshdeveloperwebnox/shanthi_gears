"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// validation schema
const employeeSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
});

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, ACTIVE, INACTIVE
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // All hooks must be at the top, before any conditional logic
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employeeSchema),
  });
  
  // Authentication is handled by the server-side layout

  // Fetch employees
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/employees");
      setEmployees(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch employees");
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setError(null);
      if (editingEmployee) {
        // Update
        await axios.put("/api/employees", { ...data, employeeId: editingEmployee.employeeId });
        fetchEmployees();
      } else {
        // Create
        await axios.post("/api/employees", data);
        fetchEmployees();
      }
      reset();
      setEditingEmployee(null);
      setOpen(false);
    } catch (error) {
      console.error("Error saving employee:", error);
      setError(error.response?.data?.error || "Failed to save employee");
    }
  };

  const handleEdit = (emp) => {
    setEditingEmployee(emp);
    reset({ fullName: emp.fullName, email: emp.email });
    setOpen(true);
  };

  const handleDelete = async (empId) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
      await axios.delete("/api/employees", { data: { employeeId: empId } });
      fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      setError(error.response?.data?.error || "Failed to delete employee");
    }
  };

  const handleStatusChange = async (empId, newStatus) => {
    try {
      await axios.put("/api/employees", { 
        employeeId: empId, 
        status: newStatus 
      });
      fetchEmployees();
    } catch (error) {
      console.error("Error updating employee status:", error);
      setError(error.response?.data?.error || "Failed to update employee status");
    }
  };

  // Filter employees based on active tab and search term
  const filteredEmployees = employees.filter(emp => {
    const matchesTab = activeTab === 'ALL' || emp.status === activeTab;
    const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Get counts for each status
  const statusCounts = employees.reduce((acc, emp) => {
    acc[emp.status] = (acc[emp.status] || 0) + 1;
    return acc;
  }, { ACTIVE: 0, INACTIVE: 0, SUSPENDED: 0 });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  // Authentication is handled by the server-side layout

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="bg-green-500 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
              <span className="text-xl sm:text-2xl">👥</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Employees</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage your team members and their status</p>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
                activeTab === 'ALL'
                  ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md'
              }`}
            >
              <span className="mr-2">📊</span>
              All ({employees.length})
            </button>
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
                activeTab === 'ACTIVE'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-green-50 shadow-md'
              }`}
            >
              <span className="mr-2">✅</span>
              Active ({statusCounts.ACTIVE})
            </button>
            <button
              onClick={() => setActiveTab('INACTIVE')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
                activeTab === 'INACTIVE'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-red-50 shadow-md'
              }`}
            >
              <span className="mr-2">❌</span>
              Inactive ({statusCounts.INACTIVE})
            </button>
            <button
              onClick={() => setActiveTab('SUSPENDED')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
                activeTab === 'SUSPENDED'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-yellow-50 shadow-md'
              }`}
            >
              <span className="mr-2">⏸️</span>
              Suspended ({statusCounts.SUSPENDED})
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex items-center">
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                  <span className="mr-3">👤</span>
                  Employee Management
                  {activeTab !== 'ALL' && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      - {activeTab.toLowerCase()} employees
                    </span>
                  )}
                </CardTitle>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">🔍</span>
                  </div>
                  <Input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full sm:w-64 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>

                {/* Add Employee Button */}
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        reset();
                        setEditingEmployee(null);
                        setError(null);
                      }}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <span className="mr-2">➕</span>
                      Add Employee
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold flex items-center">
                        <span className="mr-2">{editingEmployee ? "✏️" : "👤"}</span>
                        {editingEmployee ? "Edit Employee" : "Add New Employee"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <Input
                          placeholder="Enter full name..."
                          {...register("fullName")}
                          className="border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                        />
                        {errors.fullName && (
                          <p className="text-red-500 text-sm flex items-center">
                            <span className="mr-1">⚠️</span>
                            {errors.fullName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <Input
                          placeholder="Enter email address..."
                          {...register("email")}
                          className="border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm flex items-center">
                            <span className="mr-1">⚠️</span>
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setOpen(false)}
                          className="mr-2"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        >
                          <span className="mr-2">{editingEmployee ? "💾" : "➕"}</span>
                          {editingEmployee ? "Update" : "Create"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {searchTerm ? "No employees found" : employees.length === 0 ? "No employees yet" : `No ${activeTab.toLowerCase()} employees`}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? `No employees match "${searchTerm}"`
                    : employees.length === 0 
                    ? "Start by adding your first team member"
                    : `No employees with ${activeTab.toLowerCase()} status`
                  }
                </p>
                {!searchTerm && employees.length === 0 && (
                  <Button
                    onClick={() => {
                      reset();
                      setEditingEmployee(null);
                      setOpen(true);
                    }}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <span className="mr-2">➕</span>
                    Add Your First Employee
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full min-w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                          Employee
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                          Email
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                          Status
                        </th>
                        <th className="px-4 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEmployees.map((employee, index) => (
                        <tr 
                          key={employee.employeeId} 
                          className="hover:bg-green-50 transition-colors duration-200"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center min-w-0">
                              <div className="bg-green-100 p-2 rounded-full mr-3 flex-shrink-0">
                                <span className="text-green-600">👤</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-gray-900 truncate" title={employee.fullName}>
                                  {employee.fullName}
                                </div>
                                <div className="text-xs text-gray-500 truncate" title={`ID: ${employee.employeeId}`}>
                                  ID: {employee.employeeId.slice(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-500 truncate" title={employee.email}>
                              {employee.email}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                employee.status === 'ACTIVE'
                                  ? 'bg-green-100 text-green-800'
                                  : employee.status === 'INACTIVE'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {employee.status === 'ACTIVE' && '✅'}
                              {employee.status === 'INACTIVE' && '❌'}
                              {employee.status === 'SUSPENDED' && '⏸️'}
                              <span className="ml-1">{employee.status}</span>
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-center space-x-1 flex-wrap gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(employee)}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-xs"
                                title="Edit Employee"
                              >
                                <span className="mr-1">✏️</span>
                                Edit
                              </Button>
                              
                              {/* Status Toggle Button */}
                              {employee.status === 'ACTIVE' ? (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200 text-xs"
                                  onClick={() => handleStatusChange(employee.employeeId, 'INACTIVE')}
                                  title="Deactivate Employee"
                                >
                                  <span className="mr-1">❌</span>
                                  Deactivate
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200 text-xs"
                                  onClick={() => handleStatusChange(employee.employeeId, 'ACTIVE')}
                                  title="Activate Employee"
                                >
                                  <span className="mr-1">✅</span>
                                  Activate
                                </Button>
                              )}

                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDelete(employee.employeeId)}
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200 text-xs"
                                title="Delete Employee"
                              >
                                <span className="mr-1">🗑️</span>
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tablet View (md to lg) */}
                <div className="hidden md:block lg:hidden space-y-4 p-4">
                  {filteredEmployees.map((employee, index) => (
                    <Card 
                      key={employee.employeeId} 
                      className="shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-green-500"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center min-w-0 flex-1">
                            <div className="bg-green-100 p-2 rounded-full mr-3 flex-shrink-0">
                              <span className="text-green-600">👤</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-gray-900 truncate" title={employee.fullName}>
                                {employee.fullName}
                              </h3>
                              <p className="text-sm text-gray-500 truncate" title={employee.email}>
                                {employee.email}
                              </p>
                              <p className="text-xs text-gray-400 truncate" title={`ID: ${employee.employeeId}`}>
                                ID: {employee.employeeId}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
                              employee.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : employee.status === 'INACTIVE'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {employee.status === 'ACTIVE' && '✅'}
                            {employee.status === 'INACTIVE' && '❌'}
                            {employee.status === 'SUSPENDED' && '⏸️'}
                            <span className="ml-1">{employee.status}</span>
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(employee)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <span className="mr-1">✏️</span>
                            Edit
                          </Button>
                          {employee.status === 'ACTIVE' ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleStatusChange(employee.employeeId, 'INACTIVE')}
                            >
                              <span className="mr-1">❌</span>
                              Deactivate
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => handleStatusChange(employee.employeeId, 'ACTIVE')}
                            >
                              <span className="mr-1">✅</span>
                              Activate
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(employee.employeeId)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <span className="mr-1">🗑️</span>
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4 p-4">
                  {filteredEmployees.map((employee, index) => (
                    <Card 
                      key={employee.employeeId} 
                      className="shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-green-500"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center">
                            <div className="bg-green-100 p-2 rounded-full mr-3">
                              <span className="text-green-600">👤</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{employee.fullName}</h3>
                              <p className="text-sm text-gray-500">{employee.email}</p>
                              <p className="text-xs text-gray-400">ID: {employee.employeeId}</p>
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              employee.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : employee.status === 'INACTIVE'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {employee.status === 'ACTIVE' && '✅'}
                            {employee.status === 'INACTIVE' && '❌'}
                            {employee.status === 'SUSPENDED' && '⏸️'}
                            <span className="ml-1">{employee.status}</span>
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(employee)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            ✏️
                          </Button>
                          {employee.status === 'ACTIVE' ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleStatusChange(employee.employeeId, 'INACTIVE')}
                            >
                              ❌
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => handleStatusChange(employee.employeeId, 'ACTIVE')}
                            >
                              ✅
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(employee.employeeId)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            🗑️
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}