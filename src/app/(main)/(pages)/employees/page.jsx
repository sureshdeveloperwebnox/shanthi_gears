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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employeeSchema),
  });

  // Fetch employees
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const res = await axios.get("/api/employees");
    setEmployees(res.data);
  };

  const onSubmit = async (data) => {
    try {
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
    }
  };

  // Filter employees based on active tab
  const filteredEmployees = employees.filter(emp => {
    if (activeTab === 'ALL') return true;
    return emp.status === activeTab;
  });

  // Get counts for each status
  const statusCounts = employees.reduce((acc, emp) => {
    acc[emp.status] = (acc[emp.status] || 0) + 1;
    return acc;
  }, { ACTIVE: 0, INACTIVE: 0, SUSPENDED: 0 });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Employees</h2>

      {/* Status Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'ALL'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'ACTIVE'
                ? 'bg-green-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active ({statusCounts.ACTIVE})
          </button>
          <button
            onClick={() => setActiveTab('INACTIVE')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'INACTIVE'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Inactive ({statusCounts.INACTIVE})
          </button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>
            Employee List 
            {activeTab !== 'ALL' && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                - {activeTab.toLowerCase()} employees
              </span>
            )}
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  reset();
                  setEditingEmployee(null);
                }}
              >
                + Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingEmployee ? "Edit Employee" : "Add Employee"}</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Input placeholder="Full Name" {...register("fullName")} />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm">{errors.fullName.message}</p>
                  )}
                </div>
                <div>
                  <Input placeholder="Email" {...register("email")} />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email.message}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit">{editingEmployee ? "Update" : "Create"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {filteredEmployees.length === 0 ? (
            <p className="text-gray-500">
              {employees.length === 0 
                ? "No employees yet." 
                : `No ${activeTab.toLowerCase()} employees.`
              }
            </p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.employeeId} className="hover:bg-gray-50">
                    <td className="p-2 border">{emp.fullName}</td>
                    <td className="p-2 border">{emp.email}</td>
                    <td className="p-2 border">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          emp.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : emp.status === 'INACTIVE'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-2 border text-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(emp)}>
                        Edit
                      </Button>
                      
                      {/* Status Toggle Button */}
                      {emp.status === 'ACTIVE' ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleStatusChange(emp.employeeId, 'INACTIVE')}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleStatusChange(emp.employeeId, 'ACTIVE')}
                        >
                          Activate
                        </Button>
                      )}

                      <Button variant="destructive" size="sm" onClick={() => handleDelete(emp.employeeId)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
