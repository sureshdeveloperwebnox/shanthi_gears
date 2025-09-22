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
const territorySchema = z.object({
  territoryName: z.string().min(2, "Name must be at least 2 characters"),
});

export default function TerritoriesPage() {
  const [territories, setTerritories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingTerritory, setEditingTerritory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Authentication is handled by the server-side layout
  
  // All hooks must be at the top, before any conditional logic
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(territorySchema),
  });

  // Authentication is handled by the server-side layout

  useEffect(() => {
    fetchTerritories();
  }, []);

  const fetchTerritories = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/territories");
      setTerritories(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch territories");
      console.error("Error fetching territories:", err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setError(null);
      if (editingTerritory) {
        await axios.put("/api/territories", {
          ...data,
          territoryId: editingTerritory.territoryId,
        });
      } else {
        await axios.post("/api/territories", data);
      }
      fetchTerritories();
      reset();
      setEditingTerritory(null);
      setOpen(false);
    } catch (error) {
      console.error("Error saving territory:", error);
      setError(error.response?.data?.error || "Failed to save territory");
    }
  };

  const handleEdit = (territory) => {
    setEditingTerritory(territory);
    reset({ territoryName: territory.territoryName });
    setOpen(true);
  };

  const handleDelete = async (territoryId) => {
    if (!confirm("Are you sure you want to delete this territory?")) return;
    try {
      await axios.delete("/api/territories", { data: { territoryId } });
      fetchTerritories();
    } catch (error) {
      console.error("Error deleting territory:", error);
      setError(error.response?.data?.error || "Failed to delete territory");
    }
  };

  // Filter territories based on search term
  const filteredTerritories = territories.filter(territory =>
    territory.territoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading territories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
              <span className="text-xl sm:text-2xl">🗺️</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Territories</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage and organize your coverage areas</p>
            </div>
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
                  <span className="mr-3">📋</span>
                  Territory Management
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
                    placeholder="Search territories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full sm:w-64 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Add Territory Button */}
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        reset();
                        setEditingTerritory(null);
                        setError(null);
                      }}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <span className="mr-2">✨</span>
                      Add Territory
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold flex items-center">
                        <span className="mr-2">{editingTerritory ? "✏️" : "➕"}</span>
                        {editingTerritory ? "Edit Territory" : "Add New Territory"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Territory Name
                        </label>
                        <Input
                          placeholder="Enter territory name..."
                          {...register("territoryName")}
                          className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                        {errors.territoryName && (
                          <p className="text-red-500 text-sm flex items-center">
                            <span className="mr-1">⚠️</span>
                            {errors.territoryName.message}
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
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        >
                          <span className="mr-2">{editingTerritory ? "💾" : "✨"}</span>
                          {editingTerritory ? "Update" : "Create"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredTerritories.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {searchTerm ? "No territories found" : "No territories yet"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? `No territories match "${searchTerm}"`
                    : "Start by adding your first territory to organize your coverage areas"
                  }
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => {
                      reset();
                      setEditingTerritory(null);
                      setOpen(true);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    <span className="mr-2">✨</span>
                    Add Your First Territory
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Territory
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTerritories.map((territory, index) => (
                        <tr 
                          key={territory.territoryId} 
                          className="hover:bg-blue-50 transition-colors duration-200"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-blue-100 p-2 rounded-full mr-3">
                                <span className="text-blue-600">📍</span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {territory.territoryName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {territory.territoryId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {territory.createdAt ? 
                              new Date(territory.createdAt).toLocaleDateString() : 
                              'N/A'
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <div className="flex justify-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(territory)}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                              >
                                <span className="mr-1">✏️</span>
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(territory.territoryId)}
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
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

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4 p-4">
                  {filteredTerritories.map((territory, index) => (
                    <Card 
                      key={territory.territoryId} 
                      className="shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                              <span className="text-blue-600">📍</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{territory.territoryName}</h3>
                              <p className="text-sm text-gray-500">ID: {territory.territoryId}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            Created: {territory.createdAt ? 
                              new Date(territory.createdAt).toLocaleDateString() : 
                              'N/A'
                            }
                          </span>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(territory)}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              ✏️
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(territory.territoryId)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              🗑️
                            </Button>
                          </div>
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