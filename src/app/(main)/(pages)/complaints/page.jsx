'use client';

import { useEffect, useState } from 'react';
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  FileText, 
  Calendar,
  MapPin,
  User,
  Building,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    territory: '',
    status: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const itemsPerPage = 10; // Number of rows per page

  // Fetch complaints from API
  const fetchComplaints = async () => {
    try {
      console.log('Starting to fetch complaints from /api/complaints...');
      const res = await fetch('/api/complaints');
      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('API returned error:', errorText);
        throw new Error(`API Error ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      console.log('Fetched complaints data:', data);
      console.log('Data type:', typeof data, 'Is array:', Array.isArray(data));
      console.log('Data content:', JSON.stringify(data, null, 2));
      
      if (Array.isArray(data)) {
        setComplaints(data);
        console.log(`Successfully set ${data.length} complaints to state`);
        console.log('Current complaints state after setting:', data);
      } else {
        console.warn('Data is not an array, setting empty array');
        setComplaints([]);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError(`Failed to fetch complaints: ${err.message}`);
    }
  };

  // Fetch territories from API
  const fetchTerritories = async () => {
    try {
      const res = await fetch('/api/territories');
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      console.log('Fetched territories:', data); // Debug log
      setTerritories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching territories:', err);
      // Don't set error state for territories, just log it
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null); // Clear any previous errors
      await Promise.all([
        fetchComplaints(),
        fetchTerritories()
      ]);
      setLoading(false);
    };
    
    fetchData();
  }, []);

  // Add debugging for complaints state changes
  useEffect(() => {
    console.log('Complaints state changed:', complaints);
    console.log('Number of complaints:', complaints.length);
    console.log('Complaints details:', JSON.stringify(complaints, null, 2));
  }, [complaints]);

  // Helper function to format date for comparison
  const formatDateForComparison = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };

  // Filtered complaints based on search and filters
  const filteredComplaints = complaints.filter(c => {
    // Text search
    const matchesSearch = !searchTerm || 
      (c.contactPersonName && c.contactPersonName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.gearboxSerialNumber && c.gearboxSerialNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    // Date range filter
    const complaintDate = formatDateForComparison(c.complaintDate);
    const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
    
    const matchesDateRange = (!fromDate || !complaintDate || complaintDate >= fromDate) &&
                            (!toDate || !complaintDate || complaintDate <= toDate);

    // Territory filter
    const matchesTerritory = !filters.territory || 
      (c.territory && c.territory.territoryName && c.territory.territoryName.toLowerCase().includes(filters.territory.toLowerCase()));

    return matchesSearch && matchesDateRange && matchesTerritory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setFilters({ dateFrom: '', dateTo: '', territory: '', status: '' });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Handle viewing complaint details
  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setViewModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setViewModalOpen(false);
    setSelectedComplaint(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="bg-orange-500 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Complaints</h1>
              <p className="text-sm sm:text-base text-gray-600">Track and manage customer complaints and service requests</p>
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

        {/* Filters Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center">
              <Search className="mr-3 w-5 h-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search by contact person, company, or gearbox serial..."
                  value={searchTerm}
                  onChange={(e) => { 
                    setSearchTerm(e.target.value); 
                    setCurrentPage(1); 
                  }}
                  className="pl-10 pr-4 py-3 w-full border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">From Date</label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, dateFrom: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">To Date</label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, dateTo: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Territory</label>
                <select
                  value={filters.territory}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, territory: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                >
                  <option value="">All Territories</option>
                  {territories.map(territory => (
                    <option key={territory.territoryId} value={territory.territoryName}>
                      {territory.territoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="w-full text-gray-600 border-gray-300 hover:bg-gray-50"
                >
                  <Trash2 className="mr-2 w-4 h-4" />
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600 flex items-center">
                <Filter className="mr-2 w-4 h-4" />
                Showing {filteredComplaints.length} of {complaints.length} complaints
              </div>
              {(searchTerm || filters.dateFrom || filters.dateTo || filters.territory) && (
                <div className="text-sm text-orange-600 font-medium flex items-center">
                  <Search className="mr-1 w-4 h-4" />
                  Filters active
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <FileText className="mr-3 w-6 h-6" />
                Complaints List
                {filteredComplaints.length > 0 && (
                  <span className="ml-3 text-sm font-normal text-gray-500">
                    ({filteredComplaints.length} records)
                  </span>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Total: {complaints.length} complaints
                </span>
                {complaints.length === 0 && (
                  <Button
                    onClick={async () => {
                      console.log('Creating test data...');
                      try {
                        const res = await fetch('/api/complaints/test', {
                          method: 'POST'
                        });
                        const result = await res.json();
                        if (result.success) {
                          console.log('Test data created successfully');
                          await fetchComplaints();
                        } else {
                          console.error('Failed to create test data:', result.error);
                        }
                      } catch (err) {
                        console.error('Error creating test data:', err);
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                  >
                    <span className="mr-1">➕</span>
                    Add Test Data
                  </Button>
                )}
                <Button
                  onClick={async () => {
                    console.log('Manual refresh clicked');
                    setLoading(true);
                    setError(null);
                    await fetchComplaints();
                    setLoading(false);
                  }}
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <span className="mr-1">🔄</span>
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {searchTerm || filters.dateFrom || filters.dateTo || filters.territory ? 
                    "No complaints found" : "No complaints yet"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filters.dateFrom || filters.dateTo || filters.territory ?
                    "No complaints match your current filters" :
                    "Complaints will appear here when submitted through your forms"
                  }
                </p>
                {(searchTerm || filters.dateFrom || filters.dateTo || filters.territory) && (
                  <Button
                    onClick={clearFilters}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  >
                    <Trash2 className="mr-2 w-4 h-4" />
                    Clear All Filters
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
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact Info
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company & Territory
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Gearbox Details
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dates
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Complaint Details
                        </th>
                        <th className="px-4 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedComplaints.map((complaint, index) => (
                        <tr 
                          key={complaint.complaintId} 
                          className="hover:bg-orange-50 transition-colors duration-200"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center min-w-0">
                              <div className="bg-orange-100 p-2 rounded-full mr-3 flex-shrink-0">
                                <User className="w-4 h-4 text-orange-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-gray-900 truncate" 
                                     title={complaint.contactPersonName}>
                                  {complaint.contactPersonName || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-500 truncate" title={complaint.mailId}>
                                  {complaint.mailId || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {complaint.mobileNumber || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900 truncate" 
                                 title={complaint.companyName}>
                              {complaint.companyName || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <MapPin className="mr-1 w-3 h-3" />
                              {complaint.territory?.territoryName || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              <span className="text-gray-500 text-xs">Serial:</span>
                              <div className="truncate" title={complaint.gearboxSerialNumber}>
                                {complaint.gearboxSerialNumber || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-xs text-gray-500">
                              <div className="mb-1">
                                <span className="font-medium">Commissioned:</span>
                                <div>
                                  {complaint.dateOfCommissioning ? 
                                    new Date(complaint.dateOfCommissioning).toLocaleDateString() : 'N/A'}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium">Complaint:</span>
                                <div>
                                  {complaint.complaintDate ? 
                                    new Date(complaint.complaintDate).toLocaleDateString() : 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="max-w-xs">
                              <div className="text-xs text-gray-500 mb-1">
                                <span className="font-medium">Application:</span>
                                <div className="truncate" title={complaint.applicationDetails}>
                                  {complaint.applicationDetails || 'N/A'}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">Nature:</span>
                                <div className="truncate" title={complaint.natureOfComplaintWithPhotos}>
                                  {complaint.natureOfComplaintWithPhotos || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Button
                              onClick={() => handleViewComplaint(complaint)}
                              variant="outline"
                              size="sm"
                              className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                            >
                              <span className="text-lg">👁️</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile & Tablet Card View */}
                <div className="lg:hidden space-y-4 p-4">
                  {paginatedComplaints.map((complaint, index) => (
                    <Card 
                      key={complaint.complaintId} 
                      className="shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-orange-500"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center min-w-0 flex-1">
                              <div className="bg-orange-100 p-2 rounded-full mr-3 flex-shrink-0">
                                <User className="w-4 h-4 text-orange-600" />
                              </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-gray-900 truncate" 
                                  title={complaint.contactPersonName}>
                                {complaint.contactPersonName || 'N/A'}
                              </h3>
                              <p className="text-sm text-gray-500 truncate" title={complaint.mailId}>
                                {complaint.mailId || 'N/A'}
                              </p>
                              <p className="text-xs text-gray-400">
                                {complaint.mobileNumber || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <div className="text-xs text-gray-500">
                              {complaint.complaintDate ? 
                                new Date(complaint.complaintDate).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-700 w-20">Company:</span>
                            <span className="text-gray-600 truncate" title={complaint.companyName}>
                              {complaint.companyName || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-700 w-20">Territory:</span>
                            <span className="text-gray-600 flex items-center">
                              <MapPin className="mr-1 w-4 h-4" />
                              {complaint.territory?.territoryName || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-700 w-20">Serial:</span>
                            <span className="text-gray-600 truncate" title={complaint.gearboxSerialNumber}>
                              {complaint.gearboxSerialNumber || 'N/A'}
                            </span>
                          </div>
                          {(complaint.applicationDetails || complaint.natureOfComplaintWithPhotos) && (
                            <div className="pt-2 border-t border-gray-100">
                              {complaint.applicationDetails && (
                                <div className="text-xs text-gray-500 mb-1">
                                  <span className="font-medium">Application:</span>
                                  <div className="truncate" title={complaint.applicationDetails}>
                                    {complaint.applicationDetails}
                                  </div>
                                </div>
                              )}
                              {complaint.natureOfComplaintWithPhotos && (
                                <div className="text-xs text-gray-500">
                                  <span className="font-medium">Complaint:</span>
                                  <div className="truncate" title={complaint.natureOfComplaintWithPhotos}>
                                    {complaint.natureOfComplaintWithPhotos}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Action Button for Mobile */}
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <Button
                            onClick={() => handleViewComplaint(complaint)}
                            variant="outline"
                            size="sm"
                            className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                          >
                            <span className="mr-2">👁️</span>
                            View Details
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

        {/* Pagination */}
        {filteredComplaints.length > 0 && totalPages > 1 && (
          <Card className="mt-6 shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex justify-center items-center space-x-2">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="mr-1 w-4 h-4" />
                  Previous
                </Button>

                <div className="flex space-x-1">
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else {
                      const start = Math.max(1, currentPage - 2);
                      const end = Math.min(totalPages, start + 4);
                      pageNum = start + i;
                      if (pageNum > end) return null;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className={currentPage === pageNum ? 
                          'bg-orange-500 hover:bg-orange-600 text-white' : 
                          'hover:bg-orange-50 text-gray-600'
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
              </div>
              
              <div className="text-center mt-3 text-sm text-gray-500">
                Page {currentPage} of {totalPages} • {filteredComplaints.length} total complaints
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed View Modal */}
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center">
                <FileText className="mr-2 w-5 h-5" />
                Complaint Details
                {selectedComplaint && (
                  <span className="ml-3 text-sm font-normal text-gray-500">
                    ID: {selectedComplaint.complaintId}
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>
            
            {selectedComplaint && (
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <User className="mr-2 w-5 h-5" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Contact Person Name:</label>
                      <p className="text-sm text-gray-900">{selectedComplaint.contactPersonName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email ID:</label>
                      <p className="text-sm text-gray-900">{selectedComplaint.mailId || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Mobile Number:</label>
                      <p className="text-sm text-gray-900">{selectedComplaint.mobileNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Company Name:</label>
                      <p className="text-sm text-gray-900">{selectedComplaint.companyName || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Territory & Gearbox Information */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <MapPin className="mr-2 w-5 h-5" />
                    Territory & Gearbox Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Territory:</label>
                      <p className="text-sm text-gray-900">{selectedComplaint.territory?.territoryName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Gearbox Serial Number:</label>
                      <p className="text-sm text-gray-900">{selectedComplaint.gearboxSerialNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date of Commissioning:</label>
                      <p className="text-sm text-gray-900">
                        {selectedComplaint.dateOfCommissioning ? 
                          new Date(selectedComplaint.dateOfCommissioning).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Complaint Date:</label>
                      <p className="text-sm text-gray-900">
                        {selectedComplaint.complaintDate ? 
                          new Date(selectedComplaint.complaintDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Application & Complaint Details */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <FileText className="mr-2 w-5 h-5" />
                    Application & Complaint Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Application Details:</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedComplaint.applicationDetails || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nature of Complaint (with Photos):</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedComplaint.natureOfComplaintWithPhotos || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Motor & Connection Details */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="mr-2">⚡</span>
                    Motor & Connection Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Input Motor Details (KW):</label>
                      <p className="text-sm text-gray-900">{selectedComplaint.inputMotorDetailsKw || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Input/Output Connection Details:</label>
                      <p className="text-sm text-gray-900">{selectedComplaint.inputOutputConnectionDetails || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Oil & Lubrication Details */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="mr-2">🛢️</span>
                    Oil & Lubrication Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Oil Level Details:</label>
                      <p className="text-sm text-gray-900">{selectedComplaint.oilLevelDetails || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Grade of Oil Used:</label>
                      <p className="text-sm text-gray-900">{selectedComplaint.gradeOfOilUsed || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Condition of Oil:</label>
                      <p className="text-sm text-gray-900">{selectedComplaint.conditionOfOil || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Condition of Breather:</label>
                      <p className="text-sm text-gray-900">{selectedComplaint.conditionOfBreather || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Sediment in Oil Bottom:</label>
                      <p className="text-sm text-gray-900">{selectedComplaint.sedimentInOilBottom || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Lubrication Check Details:</label>
                      <p className="text-sm text-gray-900">{selectedComplaint.lubricationCheckDetails || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Operational Details */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="mr-2">⚙️</span>
                    Operational Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Alignment – Input & Output:</label>
                      <p className="text-sm text-gray-900">{selectedComplaint.alignmentInputOutput || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Running Hours Per Day:</label>
                      <p className="text-sm text-gray-900">{selectedComplaint.runningHoursPerDay || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Start-Stop Per Day:</label>
                      <p className="text-sm text-gray-900">{selectedComplaint.startStopPerDay || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Input Speed Details:</label>
                      <p className="text-sm text-gray-900">{selectedComplaint.inputSpeedDetails || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Environmental & Failure Details */}
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="mr-2">🌡️</span>
                    Environmental & Failure Details
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Gearbox Dismantled Before Failure:</label>
                        <p className="text-sm text-gray-900">{selectedComplaint.dismantledBeforeFailure || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Forced Lubrication Photos:</label>
                        <p className="text-sm text-gray-900">{selectedComplaint.forcedLubricationPhotos || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Ambient Conditions:</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedComplaint.ambientConditions || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Load Spectrum:</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedComplaint.loadSpectrum || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Condition of Other Parts:</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedComplaint.conditionOfOtherParts || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Failure History Details:</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedComplaint.failureHistoryDetails || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* System Information */}
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="mr-2">🗃️</span>
                    System Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Created At:</label>
                      <p className="text-sm text-gray-900">
                        {selectedComplaint.createdAt ? 
                          new Date(selectedComplaint.createdAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Updated At:</label>
                      <p className="text-sm text-gray-900">
                        {selectedComplaint.updatedAt ? 
                          new Date(selectedComplaint.updatedAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={handleCloseModal}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}