"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  employeeId: z.string().min(1, "Select an employee"),
  territoryId: z.string().min(1, "Select a territory"),
});

export default function EmployeeTerritoriesPage() {
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedTerritory, setSelectedTerritory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      employeeId: "",
      territoryId: "",
    },
  });

  useEffect(() => {
    fetchAssignments();
    fetchEmployees();
    fetchTerritories();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await axios.get("/api/employee-territories");
      console.log("Fetched assignments:", res.data); // Debug log
      setAssignments(res.data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setAssignments([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("/api/employees");
      console.log("Fetched employees:", res.data); // Debug log
      setEmployees(res.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    }
  };

  const fetchTerritories = async () => {
    try {
      const res = await axios.get("/api/territories");
      console.log("Fetched territories:", res.data); // Debug log
      setTerritories(res.data);
    } catch (error) {
      console.error("Error fetching territories:", error);
      setTerritories([]);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    
    try {
      console.log("Submitting data:", data); // Debug log
      
      let response;
      if (editing) {
        response = await axios.put("/api/employee-territories", { id: editing.id, ...data });
      } else {
        response = await axios.post("/api/employee-territories", data);
      }
      
      console.log("Response:", response.data); // Debug log
      
      // Refresh the assignments list
      await fetchAssignments();
      
      // Reset form and close dialog
      reset({
        employeeId: "",
        territoryId: "",
      });
      setSelectedEmployee("");
      setSelectedTerritory("");
      setEditing(null);
      setOpen(false);
      
    } catch (error) {
      console.error("Error saving assignment:", error);
      
      // Handle specific error messages
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Failed to save assignment. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormReset = () => {
    reset({
      employeeId: "",
      territoryId: "",
    });
    setSelectedEmployee("");
    setSelectedTerritory("");
    setEditing(null);
    setError("");
    if (!open) setOpen(true); // Only set to true if currently closed
  };

  const handleEdit = (assignment) => {
    setEditing(assignment);
    setSelectedEmployee(assignment.employeeId);
    setSelectedTerritory(assignment.territoryId.toString());
    setValue("employeeId", assignment.employeeId);
    setValue("territoryId", assignment.territoryId.toString());
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete("/api/employee-territories", { data: { id } });
      fetchAssignments();
    } catch (error) {
      console.error("Error deleting assignment:", error);
    }
  };

  return (
    <Card className="m-6 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Employee Territories</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleFormReset()}>Add Assignment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Assignment" : "New Assignment"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm">Employee</label>
                  <Select
                    value={selectedEmployee}
                    onValueChange={(val) => {
                      console.log("Selected employee:", val); // Debug log
                      setSelectedEmployee(val);
                      setValue("employeeId", val, { shouldValidate: true });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.employeeId} value={emp.employeeId}>
                          {emp.fullName} - {emp.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.employeeId && (
                    <p className="text-red-500 text-sm">{errors.employeeId.message}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-1 text-sm">Territory</label>
                  <Select
                    value={selectedTerritory}
                    onValueChange={(val) => {
                      console.log("Selected territory:", val); // Debug log
                      setSelectedTerritory(val);
                      setValue("territoryId", val, { shouldValidate: true });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select territory" />
                    </SelectTrigger>
                    <SelectContent>
                      {territories.map((t) => (
                        <SelectItem key={t.territoryId} value={t.territoryId.toString()}>
                          {t.territoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.territoryId && (
                    <p className="text-red-500 text-sm">{errors.territoryId.message}</p>
                  )}
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : (editing ? "Update" : "Save")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <table className="w-full border-collapse border rounded-md overflow-hidden">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Employee Name</th>
              <th className="border p-2 text-left">Email</th>
              <th className="border p-2 text-left">Territory Name</th>
              <th className="border p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length > 0 ? (
              assignments.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="border p-2">{a.employee?.fullName || 'N/A'}</td>
                  <td className="border p-2">{a.employee?.email || 'N/A'}</td>
                  <td className="border p-2">{a.territory?.territoryName || 'N/A'}</td>
                  <td className="border p-2 text-center space-x-2">
                    <Button size="sm" onClick={() => handleEdit(a)}>Edit</Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(a.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="border p-4 text-center text-gray-500">
                  No employee territory assignments found. Click "Add Assignment" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
