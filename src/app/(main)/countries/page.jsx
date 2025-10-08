"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CountriesPage() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [editFormData, setEditFormData] = useState({ countryName: "" });
  const [isCreateMode, setIsCreateMode] = useState(false);

  // Fetch countries
  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/countries");
      if (!response.ok) {
        throw new Error("Failed to fetch countries");
      }
      const data = await response.json();
      setCountries(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching countries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  // Handle edit country
  const handleEditCountry = (country) => {
    setEditingCountry(country);
    setEditFormData({ countryName: country.countryName });
    setIsCreateMode(false);
    setIsEditDialogOpen(true);
  };

  // Handle create country button
  const handleCreateClick = () => {
    setEditingCountry(null);
    setEditFormData({ countryName: "" });
    setIsCreateMode(true);
    setIsEditDialogOpen(true);
  };

  // Handle update country
  const handleUpdateCountry = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/countries", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          countryId: editingCountry.countryId,
          countryName: editFormData.countryName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update country");
      }

      const updatedCountry = await response.json();
      setCountries(countries.map(country => 
        country.countryId === updatedCountry.countryId ? updatedCountry : country
      ));
      setIsEditDialogOpen(false);
      setEditingCountry(null);
      setEditFormData({ countryName: "" });
      setIsCreateMode(false);
    } catch (err) {
      setError(err.message);
      console.error("Error updating country:", err);
    }
  };

  // Handle create country
  const handleCreateCountry = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/countries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          countryName: editFormData.countryName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create country");
      }

      const newCountry = await response.json();
      setCountries([...countries, newCountry]);
      setIsEditDialogOpen(false);
      setEditingCountry(null);
      setEditFormData({ countryName: "" });
      setIsCreateMode(false);
    } catch (err) {
      setError(err.message);
      console.error("Error creating country:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading countries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Countries</h1>
          <p className="text-gray-600 mt-2">Manage countries and their information</p>
        </div>
        <Button onClick={handleCreateClick} className="bg-orange-500 hover:bg-orange-600">
          Add New Country
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Countries List</CardTitle>
          <CardDescription>
            View and manage all countries. Click edit to modify country information or add new countries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {countries.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No countries found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new country.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Country Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {countries.map((country) => (
                    <TableRow key={country.countryId}>
                      <TableCell className="font-medium">{country.countryId}</TableCell>
                      <TableCell>{country.countryName}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCountry(country)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Country Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isCreateMode ? "Add New Country" : "Edit Country"}</DialogTitle>
            <DialogDescription>
              {isCreateMode ? "Enter the country information below." : "Update the country information below."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={isCreateMode ? handleCreateCountry : handleUpdateCountry}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="countryName" className="text-right text-sm font-medium">
                  Country Name
                </label>
                <Input
                  id="countryName"
                  value={editFormData.countryName}
                  onChange={(e) => setEditFormData({ ...editFormData, countryName: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingCountry(null);
                  setEditFormData({ countryName: "" });
                  setIsCreateMode(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isCreateMode ? "Add Country" : "Update Country"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
