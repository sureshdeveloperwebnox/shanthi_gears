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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Employees</h2>

      <Card className="mb-6">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Employee List</CardTitle>
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
          {employees.length === 0 ? (
            <p className="text-gray-500">No employees yet.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.employeeId} className="hover:bg-gray-50">
                    <td className="p-2 border">{emp.fullName}</td>
                    <td className="p-2 border">{emp.email}</td>
                    <td className="p-2 border text-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(emp)}>
                        Edit
                      </Button>
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
