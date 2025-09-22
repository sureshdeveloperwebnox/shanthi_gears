'use client';

import { useEffect, useState } from 'react';

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
      
      if (Array.isArray(data)) {
        setComplaints(data);
        console.log(`Successfully set ${data.length} complaints`);
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
      await Promise.all([
        fetchComplaints(),
        fetchTerritories()
      ]);
      setLoading(false);
    };
    
    fetchData();
  }, []);

  // Helper function to format date for comparison
  const formatDateForComparison = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };

  // Filtered complaints based on search and filters
  const filteredComplaints = complaints.filter(c => {
    // Text search
    const matchesSearch = !search || 
      (c.contactPersonName && c.contactPersonName.toLowerCase().includes(search.toLowerCase())) ||
      (c.companyName && c.companyName.toLowerCase().includes(search.toLowerCase())) ||
      (c.gearboxSerialNumber && c.gearboxSerialNumber.toLowerCase().includes(search.toLowerCase()));

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

  if (loading) return <p className="text-center mt-10">Loading complaints...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Complaints List</h1>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search by contact person, company, or gearbox serial..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="border p-2 rounded w-full md:w-1/2"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">From Date:</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, dateFrom: e.target.value }));
                setCurrentPage(1);
              }}
              className="border p-2 rounded w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">To Date:</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, dateTo: e.target.value }));
                setCurrentPage(1);
              }}
              className="border p-2 rounded w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Territory:</label>
            <select
              value={filters.territory}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, territory: e.target.value }));
                setCurrentPage(1);
              }}
              className="border p-2 rounded w-full"
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
            <button
              onClick={() => {
                setFilters({ dateFrom: '', dateTo: '', territory: '', status: '' });
                setSearch('');
                setCurrentPage(1);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results summary */}
        <div className="text-sm text-gray-600">
          Showing {filteredComplaints.length} of {complaints.length} complaints
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Contact Person</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Mobile</th>
              <th className="border px-2 py-1">Company</th>
              <th className="border px-2 py-1">Territory</th>
              <th className="border px-2 py-1">Gearbox Serial</th>
              <th className="border px-2 py-1">Commissioning Date</th>
              <th className="border px-2 py-1">Complaint Date</th>
              <th className="border px-2 py-1">Application Details</th>
              <th className="border px-2 py-1">Nature of Complaint</th>
            </tr>
          </thead>
          <tbody>
            {paginatedComplaints.length === 0 ? (
              <tr>
                <td colSpan="11" className="border px-2 py-4 text-center text-gray-500">
                  No complaints found matching your criteria
                </td>
              </tr>
            ) : (
              paginatedComplaints.map((c) => (
                <tr key={c.complaintId} className="hover:bg-gray-50">
                  <td className="border px-2 py-1">{c.complaintId}</td>
                  <td className="border px-2 py-1">{c.contactPersonName || 'N/A'}</td>
                  <td className="border px-2 py-1">{c.mailId || 'N/A'}</td>
                  <td className="border px-2 py-1">{c.mobileNumber || 'N/A'}</td>
                  <td className="border px-2 py-1">{c.companyName || 'N/A'}</td>
                  <td className="border px-2 py-1">{c.territory?.territoryName || 'N/A'}</td>
                  <td className="border px-2 py-1">{c.gearboxSerialNumber || 'N/A'}</td>
                  <td className="border px-2 py-1">
                    {c.dateOfCommissioning ? 
                      new Date(c.dateOfCommissioning).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="border px-2 py-1">
                    {c.complaintDate ? 
                      new Date(c.complaintDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="border px-2 py-1 max-w-xs truncate" title={c.applicationDetails}>
                    {c.applicationDetails || 'N/A'}
                  </td>
                  <td className="border px-2 py-1 max-w-xs truncate" title={c.natureOfComplaintWithPhotos}>
                    {c.natureOfComplaintWithPhotos || 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredComplaints.length > 0 && (
        <div className="mt-4 flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prev
          </button>

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
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 border rounded ${
                  currentPage === pageNum ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
