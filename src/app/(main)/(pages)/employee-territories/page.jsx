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
  territoryIds: z.array(z.number()).min(1, "Select at least one territory"),
});

export default function EmployeeTerritoriesPage() {
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedTerritories, setSelectedTerritories] = useState([]);
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
      territoryIds: [],
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
      
      // Validate that employee doesn't already have assignments for selected territories (for new assignments)
      if (!editing) {
        const existingAssignments = assignments.filter(a => 
          a.employeeId === data.employeeId && data.territoryIds.includes(a.territoryId)
        );
        
        if (existingAssignments.length > 0) {
          const duplicateTerritories = existingAssignments
            .map(a => territories.find(t => t.territoryId === a.territoryId)?.territoryName)
            .filter(Boolean);
          
          setError(`Employee already assigned to: ${duplicateTerritories.join(', ')}`);
          setLoading(false);
          return;
        }
      }
      
      if (editing) {
        // For editing, we need to handle multiple territories
        // 1. Get current assignments for this employee
        const currentAssignments = assignments.filter(a => a.employeeId === data.employeeId);
        const currentTerritoryIds = currentAssignments.map(a => a.territoryId);
        
        // 2. Find territories to add and remove
        const territoriesToAdd = data.territoryIds.filter(id => !currentTerritoryIds.includes(id));
        const territoriesToRemove = currentTerritoryIds.filter(id => !data.territoryIds.includes(id));
        
        // 3. Remove territories that are no longer selected
        for (const territoryId of territoriesToRemove) {
          const assignmentToRemove = currentAssignments.find(a => a.territoryId === territoryId);
          if (assignmentToRemove) {
            await axios.delete("/api/employee-territories", { data: { id: assignmentToRemove.id } });
          }
        }
        
        // 4. Add new territories
        for (const territoryId of territoriesToAdd) {
          await axios.post("/api/employee-territories", {
            employeeId: data.employeeId,
            territoryId: territoryId
          });
        }
        
        console.log("Updated assignments for employee");
      } else {
        // For new assignments, create multiple assignments for selected territories
        const promises = data.territoryIds.map(territoryId => 
          axios.post("/api/employee-territories", {
            employeeId: data.employeeId,
            territoryId: territoryId
          })
        );
        
        const responses = await Promise.all(promises);
        console.log("Multiple assignment responses:", responses.map(r => r.data));
      }
      
      // Refresh the assignments list
      await fetchAssignments();
      
      // Reset form and close dialog
      reset({
        employeeId: "",
        territoryIds: [],
      });
      setSelectedEmployee("");
      setSelectedTerritories([]);
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
      territoryIds: [],
    });
    setSelectedEmployee("");
    setSelectedTerritories([]);
    setEditing(null);
    setError("");
    if (!open) setOpen(true); // Only set to true if currently closed
  };

  const handleEdit = (assignment) => {
    // When editing, we want to show all territories for this employee
    // and allow adding/removing territories
    const employeeAssignments = assignments.filter(a => a.employeeId === assignment.employeeId);
    const employeeTerritories = employeeAssignments.map(a => a.territoryId);
    
    setEditing(assignment);
    setSelectedEmployee(assignment.employeeId);
    setSelectedTerritories(employeeTerritories);
    setValue("employeeId", assignment.employeeId);
    setValue("territoryIds", employeeTerritories);
    setOpen(true);
  };

  const handleTerritoryToggle = (territoryId) => {
    const newSelected = selectedTerritories.includes(territoryId)
      ? selectedTerritories.filter(id => id !== territoryId)
      : [...selectedTerritories, territoryId];
    
    setSelectedTerritories(newSelected);
    setValue("territoryIds", newSelected, { shouldValidate: true });
  };

  const handleDelete = async (employeeId) => {
    if (!confirm("Are you sure you want to delete all territory assignments for this employee?")) return;
    
    try {
      // Delete all assignments for this employee
      const employeeAssignments = assignments.filter(a => a.employeeId === employeeId);
      
      for (const assignment of employeeAssignments) {
        await axios.delete("/api/employee-territories", { data: { id: assignment.id } });
      }
      
      fetchAssignments();
    } catch (error) {
      console.error("Error deleting assignments:", error);
    }
  };

  // Group assignments by employee
  const groupedAssignments = assignments.reduce((groups, assignment) => {
    const employeeId = assignment.employeeId;
    if (!groups[employeeId]) {
      groups[employeeId] = {
        employee: assignment.employee,
        territories: [],
        assignments: []
      };
    }
    groups[employeeId].territories.push(assignment.territory);
    groups[employeeId].assignments.push(assignment);
    return groups;
  }, {});

  const employeeGroups = Object.values(groupedAssignments);

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
                <DialogTitle>
                  {editing ? "Edit Employee Territories" : "New Assignment"}
                </DialogTitle>
                {editing && (
                  <p className="text-sm text-gray-600 mt-1">
                    Modify all territory assignments for this employee
                  </p>
                )}
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
                    disabled={editing} // Disable during editing
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
                  <label className="block mb-2 text-sm">
                    Territories <span className="text-gray-500">(Select multiple)</span>
                    {editing && (
                      <span className="text-blue-600 text-xs ml-2">
                        - Editing all territories for this employee
                      </span>
                    )}
                  </label>
                  
                  {/* Multi-select checkboxes for both new and editing assignments */}
                  <div className="border rounded-md p-3 max-h-48 overflow-y-auto bg-white">
                    {territories.length === 0 ? (
                      <p className="text-gray-500 text-sm">No territories available</p>
                    ) : (
                      <div className="space-y-2">
                        {territories.map((territory) => (
                          <label
                            key={territory.territoryId}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={selectedTerritories.includes(territory.territoryId)}
                              onChange={() => handleTerritoryToggle(territory.territoryId)}
                              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                            <span className="text-sm">{territory.territoryName}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {errors.territoryIds && (
                    <p className="text-red-500 text-sm">{errors.territoryIds.message}</p>
                  )}
                  
                  {selectedTerritories.length > 0 && (
                    <p className="text-sm text-blue-600 mt-1">
                      {selectedTerritories.length} territories selected
                      {editing && (
                        <span className="text-gray-500"> (will update all assignments for this employee)</span>
                      )}
                    </p>
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
              <th className="border p-2 text-left">Assigned Territories</th>
              <th className="border p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employeeGroups.length > 0 ? (
              employeeGroups.map((group) => (
                <tr key={group.employee?.employeeId || 'unknown'} className="hover:bg-gray-50">
                  <td className="border p-2">{group.employee?.fullName || 'N/A'}</td>
                  <td className="border p-2">{group.employee?.email || 'N/A'}</td>
                  <td className="border p-2">
                    <div className="flex flex-wrap gap-1">
                      {group.territories.map((territory, index) => (
                        <span
                          key={territory?.territoryId || index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {territory?.territoryName || 'Unknown'}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {group.territories.length} territory{group.territories.length !== 1 ? 'ies' : ''}
                    </div>
                  </td>
                  <td className="border p-2 text-center space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleEdit(group.assignments[0])}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(group.employee?.employeeId)}
                    >
                      Delete All
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
