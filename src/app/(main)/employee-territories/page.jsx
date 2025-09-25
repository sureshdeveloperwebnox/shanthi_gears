"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  BarChart3, 
  AlertCircle, 
  CheckCircle, 
  X,
  User,
  MapPin,
  Save,
  Pause,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, employeesRes, territoriesRes] = await Promise.all([
        axios.get("/api/employee-territories"),
        axios.get("/api/employees"),
        axios.get("/api/territories")
      ]);
      
      setAssignments(assignmentsRes.data);
      setEmployees(employeesRes.data);
      setTerritories(territoriesRes.data);
      setError("");
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await axios.get("/api/employee-territories");
      setAssignments(res.data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setAssignments([]);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    
    try {
      // Check if selected employee is active (extra validation)
      const selectedEmployeeData = employees.find(emp => emp.employeeId === data.employeeId);
      if (selectedEmployeeData && selectedEmployeeData.status !== 'ACTIVE') {
        setError(`Cannot assign territories to ${selectedEmployeeData.status.toLowerCase()} employee: ${selectedEmployeeData.fullName}`);
        setSubmitting(false);
        return;
      }
      
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
          setSubmitting(false);
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
        
        // Note: Multiple employees can now be assigned to the same territory
        // This validation has been removed to support many-to-many relationships
        
        // 4. Remove territories that are no longer selected
        for (const territoryId of territoriesToRemove) {
          const assignmentToRemove = currentAssignments.find(a => a.territoryId === territoryId);
          if (assignmentToRemove) {
            await axios.delete("/api/employee-territories", { data: { id: assignmentToRemove.id } });
          }
        }
        
        // 5. Add new territories
        for (const territoryId of territoriesToAdd) {
          await axios.post("/api/employee-territories", {
            employeeId: data.employeeId,
            territoryId: territoryId
          });
        }
      } else {
        // For new assignments, create multiple assignments for selected territories
        const promises = data.territoryIds.map(territoryId => 
          axios.post("/api/employee-territories", {
            employeeId: data.employeeId,
            territoryId: territoryId
          })
        );
        
        await Promise.all(promises);
      }
      
      // Refresh the assignments list
      await fetchAssignments();
      
      // Show success message
      const employeeName = employees.find(emp => emp.employeeId === data.employeeId)?.fullName || 'Employee';
      const territoryNames = data.territoryIds.map(id => 
        territories.find(t => t.territoryId === id)?.territoryName
      ).filter(Boolean);
      
      if (editing) {
        toast.success(`Territories updated for ${employeeName} successfully!`, {
          duration: 4000,
          icon: '✅',
        });
      } else {
        toast.success(`${employeeName} assigned to ${territoryNames.length} territories successfully!`, {
          duration: 4000,
          icon: '🎯',
        });
      }
      
      // Reset form and close dialog
      handleFormReset();
      setOpen(false);
      
    } catch (error) {
      console.error("Error saving assignment:", error);
      
      // Handle specific error messages
      const errorMessage = error.response?.data?.error || "Failed to save assignment. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 5000,
        icon: '❌',
      });
    } finally {
      setSubmitting(false);
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
    const employee = employees.find(emp => emp.employeeId === employeeId);
    const employeeName = employee?.fullName || 'Employee';
    const employeeAssignments = assignments.filter(a => a.employeeId === employeeId);
    
    if (!confirm(`Are you sure you want to delete all territory assignments for ${employeeName}?`)) return;
    
    try {
      // Delete all assignments for this employee
      for (const assignment of employeeAssignments) {
        await axios.delete("/api/employee-territories", { data: { id: assignment.id } });
      }
      
      toast.success(`All territory assignments removed for ${employeeName} successfully!`, {
        duration: 4000,
        icon: '🗑️',
      });
      
      fetchAssignments();
    } catch (error) {
      console.error("Error deleting assignments:", error);
      const errorMessage = error.response?.data?.error || "Failed to delete assignments. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 5000,
        icon: '❌',
      });
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

  // Check for assignments with inactive employees
  const inactiveEmployeeAssignments = employeeGroups.filter(group => 
    group.employee && group.employee.status !== 'ACTIVE'
  );

  // Filter employee groups based on search term
  const filteredEmployeeGroups = employeeGroups.filter(group => {
    const employeeName = group.employee?.fullName?.toLowerCase() || '';
    const employeeEmail = group.employee?.email?.toLowerCase() || '';
    const territoryNames = group.territories.map(t => t?.territoryName?.toLowerCase() || '').join(' ');
    const searchLower = searchTerm.toLowerCase();
    
    return employeeName.includes(searchLower) || 
           employeeEmail.includes(searchLower) || 
           territoryNames.includes(searchLower);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="bg-orange-500 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Employee Territories</h1>
              <p className="text-sm sm:text-base text-gray-600">Assign multiple employees to multiple territories for flexible coverage</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Warning for Inactive Employee Assignments */}
        {inactiveEmployeeAssignments.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Inactive Employee Assignments Found
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {inactiveEmployeeAssignments.length} inactive employee(s) still have territory assignments. 
                  Consider reassigning these territories to active employees.
                </p>
                <div className="mt-2">
                  {inactiveEmployeeAssignments.map((group, index) => (
                    <div key={group.employee?.employeeId || index} className="text-xs text-yellow-600 mt-1">
                      • {group.employee?.fullName} ({group.employee?.status}) - {group.territories.length} territories
                    </div>
                  ))}
                </div>
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
              
                  Territory Assignments
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
                    placeholder="Search assignments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full sm:w-64 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>

                {/* Add Assignment Button */}
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => handleFormReset()}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <Target className="mr-2 w-4 h-4" />
                      Add Assignment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold flex items-center">
                        {editing ? <Edit className="mr-2 w-5 h-5" /> : <Target className="mr-2 w-5 h-5" />}
                        {editing ? "Edit Employee Territories" : "Assign Territories"}
                      </DialogTitle>
                      {editing && (
                        <p className="text-sm text-gray-600 mt-1">
                          Modify all territory assignments for this employee
                        </p>
                      )}
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Employee 
                          <span className="text-xs text-gray-500 ml-2">(Only active employees shown)</span>
                        </label>
                        <Select
                          value={selectedEmployee}
                          onValueChange={(val) => {
                            setSelectedEmployee(val);
                            setValue("employeeId", val, { shouldValidate: true });
                          }}
                          disabled={editing} // Disable during editing
                        >
                          <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200">
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map((emp) => (
                              <SelectItem key={emp.employeeId} value={emp.employeeId}>
                                <div className="flex items-center">
                                  <User className="mr-2 w-4 h-4" />
                                  <div className="flex flex-col">
                                    <span className="font-medium">{emp.fullName}</span>
                                    <span className="text-xs text-gray-500">{emp.email}</span>
                                  </div>
                                  <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                    {emp.status}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.employeeId && (
                          <p className="text-red-500 text-sm flex items-center">
                            <AlertCircle className="mr-1 w-4 h-4" />
                            {errors.employeeId.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Territories <span className="text-gray-500">(Select multiple)</span>
                          {editing && (
                            <span className="text-orange-600 text-xs ml-2">
                              - Editing all territories for this employee
                            </span>
                          )}
                        </label>
                        
                        {/* Multi-select checkboxes for both new and editing assignments */}
                        <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto bg-white">
                          {territories.length === 0 ? (
                            <p className="text-gray-500 text-sm">No territories available</p>
                          ) : (
                            <div className="space-y-2">
                              {territories.map((territory) => {
                                // Check if territory is already assigned to other employees (for information only)
                                const assignedToOthers = assignments.filter(a => 
                                  a.territoryId === territory.territoryId && 
                                  a.employeeId !== selectedEmployee
                                );
                                
                                return (
                                  <label
                                    key={territory.territoryId}
                                    className="flex items-center space-x-3 p-2 rounded transition-colors cursor-pointer hover:bg-orange-50"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedTerritories.includes(territory.territoryId)}
                                      onChange={() => handleTerritoryToggle(territory.territoryId)}
                                      className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                                    />
                                    <div className="flex items-center flex-1">
                                      <MapPin className="text-orange-600 mr-2 w-4 h-4" />
                                      <div className="flex-1">
                                        <span className="text-sm font-medium">{territory.territoryName}</span>
                                        {assignedToOthers.length > 0 && (
                                          <div className="text-xs text-blue-600 mt-1">
                                            Also assigned to {assignedToOthers.length} other employee{assignedToOthers.length !== 1 ? 's' : ''}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        
                        {errors.territoryIds && (
                          <p className="text-red-500 text-sm flex items-center">
                            <AlertCircle className="mr-1 w-4 h-4" />
                            {errors.territoryIds.message}
                          </p>
                        )}
                        
                        {selectedTerritories.length > 0 && (
                          <div className="bg-orange-50 p-3 rounded-lg">
                            <p className="text-sm text-orange-800 font-medium flex items-center">
                              <CheckCircle className="mr-1 w-4 h-4" />
                              {selectedTerritories.length} territories selected
                            </p>
                            {editing && (
                              <p className="text-xs text-orange-600 mt-1">
                                Will update all assignments for this employee
                              </p>
                            )}
                          </div>
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
                          disabled={submitting}
                          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                        >
                          {submitting ? <Clock className="mr-2 w-4 h-4" /> : editing ? <Save className="mr-2 w-4 h-4" /> : <Target className="mr-2 w-4 h-4" />}
                          {submitting ? "Saving..." : (editing ? "Update" : "Save")}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredEmployeeGroups.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {searchTerm ? "No assignments found" : "No territory assignments yet"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? `No assignments match "${searchTerm}"`
                    : "Start by assigning territories to your employees"
                  }
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => {
                      handleFormReset();
                      setOpen(true);
                    }}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  >
                    <Target className="mr-2 w-4 h-4" />
                    Create Your First Assignment
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                          Employee
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                          Assigned Territories
                        </th>
                        <th className="px-4 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEmployeeGroups.map((group, index) => (
                        <tr 
                          key={group.employee?.employeeId || 'unknown'} 
                          className="hover:bg-orange-50 transition-colors duration-200"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-orange-100 p-2 rounded-full mr-3">
                                <User className="w-4 h-4 text-orange-600" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {group.employee?.fullName || 'N/A'}
                                </div>
                              
                              </div>
                          
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {group.employee?.email || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {group.employee?.status && (
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  group.employee.status === 'ACTIVE'
                                    ? 'bg-green-100 text-green-800'
                                    : group.employee.status === 'INACTIVE'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {group.employee.status === 'ACTIVE' && <CheckCircle className="w-3 h-3 mr-1" />}
                                {group.employee.status === 'INACTIVE' && <X className="w-3 h-3 mr-1" />}
                                {/* {group.employee.status === 'SUSPENDED' && <Pause className="w-3 h-3 mr-1" />} */}
                                {group.employee.status}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {group.territories.map((territory, index) => {
                                // Find other employees assigned to this territory
                                const otherAssignments = assignments.filter(a => 
                                  a.territoryId === territory.territoryId && 
                                  a.employeeId !== group.employee?.employeeId
                                );
                                
                                return (
                                  <span
                                    key={territory?.territoryId || index}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                                    title={otherAssignments.length > 0 ? `Also assigned to: ${otherAssignments.map(a => a.employee?.fullName).join(', ')}` : ''}
                                  >
                                    <MapPin className="mr-1 w-3 h-3" />
                                    {territory?.territoryName || 'Unknown'}
                                    {/* {otherAssignments.length > 0 && (
                                      <span className="ml-1 text-orange-600">({otherAssignments.length + 1})</span>
                                    )} */}
                                  </span>
                                );
                              })}
                            </div>
                            {/* <div className="text-xs text-gray-500 mt-1">
                              {group.territories.length} territory{group.territories.length !== 1 ? 'ies' : ''}
                            </div> */}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <div className="flex flex-col space-y-1 min-w-[120px]">
                              <Button 
                                variant="outline"
                                size="sm" 
                                onClick={() => handleEdit(group.assignments[0])}
                                className="w-full text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
                              >
                                <Edit className="mr-1 w-4 h-4" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(group.employee?.employeeId)}
                                className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                              >
                                <Trash2 className="mr-1 w-4 h-4" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4 p-4">
                  {filteredEmployeeGroups.map((group, index) => (
                    <Card 
                      key={group.employee?.employeeId || 'unknown'} 
                      className="shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-purple-500"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center flex-1">
                            <div className="bg-orange-100 p-2 rounded-full mr-3">
                              <User className="w-4 h-4 text-orange-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{group.employee?.fullName || 'N/A'}</h3>
                              <p className="text-sm text-gray-500">{group.employee?.email || 'N/A'}</p>
                              <p className="text-xs text-gray-400">ID: {group.employee?.employeeId || 'N/A'}</p>
                            </div>
                            {group.employee?.status && (
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
                                  group.employee.status === 'ACTIVE'
                                    ? 'bg-green-100 text-green-800'
                                    : group.employee.status === 'INACTIVE'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {group.employee.status === 'ACTIVE' && <CheckCircle className="w-4 h-4" />}
                                {group.employee.status === 'INACTIVE' && <X className="w-4 h-4" />}
                                {group.employee.status === 'SUSPENDED' && <Pause className="w-4 h-4" />}
                                <span className="ml-1">{group.employee.status}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Assigned Territories:</p>
                          <div className="flex flex-wrap gap-1">
                            {group.territories.map((territory, index) => {
                              // Find other employees assigned to this territory
                              const otherAssignments = assignments.filter(a => 
                                a.territoryId === territory.territoryId && 
                                a.employeeId !== group.employee?.employeeId
                              );
                              
                              return (
                                <span
                                  key={territory?.territoryId || index}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                                  title={otherAssignments.length > 0 ? `Also assigned to: ${otherAssignments.map(a => a.employee?.fullName).join(', ')}` : ''}
                                >
                                  <MapPin className="mr-1 w-3 h-3" />
                                  {territory?.territoryName || 'Unknown'}
                                  {otherAssignments.length > 0 && (
                                    <span className="ml-1 text-orange-600">({otherAssignments.length + 1})</span>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {group.territories.length} territory{group.territories.length !== 1 ? 'ies' : ''}
                          </p>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button 
                            variant="outline"
                            size="sm" 
                            onClick={() => handleEdit(group.assignments[0])}
                            className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                          >
                            <Edit className="mr-2 w-4 h-4" />
                            Edit Territories
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(group.employee?.employeeId)}
                            className="w-full text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="mr-2 w-4 h-4" />
                            Delete All
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
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 4000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}