'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function DashboardPage() {
  const router = useRouter();
  
  // Debug function to test navigation
  const handleNavigation = (path) => {
    console.log(`Attempting to navigate to: ${path}`);
    console.log('Router object:', router);
    try {
      router.push(path);
      console.log(`Navigation to ${path} initiated successfully`);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation
      window.location.href = path;
    }
  };
  const [stats, setStats] = useState({
    totalComplaints: 0,
    totalTerritories: 0,
    totalEmployees: 0,
    activeEmployees: 0,
    recentComplaints: [],
    territoryDistribution: [],
    employeeStats: [],
    complaintTrends: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Function to process complaint trends data
  const processComplaintTrends = (complaints) => {
    if (!Array.isArray(complaints) || complaints.length === 0) {
      return [];
    }

    // Get the last 6 months
    const now = new Date();
    const monthsData = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      
      // Count complaints for this month
      const count = complaints.filter(complaint => {
        if (!complaint.complaintDate) return false;
        const complaintDate = new Date(complaint.complaintDate);
        return complaintDate.getMonth() === date.getMonth() && 
               complaintDate.getFullYear() === date.getFullYear();
      }).length;
      
      monthsData.push({
        month: monthName,
        year: year,
        count: count,
        label: `${monthName} ${year}`
      });
    }
    
    return monthsData;
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [complaintsRes, territoriesRes, employeesRes, assignmentsRes] = await Promise.all([
        fetch('/api/complaints'),
        fetch('/api/territories'),
        fetch('/api/employees'),
        fetch('/api/employee-territories')
      ]);

      const complaints = await complaintsRes.json();
      const territories = await territoriesRes.json();
      const employees = await employeesRes.json();
      const assignments = await assignmentsRes.json();

      console.log('Fetched complaints for trends:', complaints);

      // Process data for dashboard
      const activeEmployees = employees.filter(emp => emp.status === 'ACTIVE').length;
      
      // Get recent complaints (last 9 for better grid layout)
      const recentComplaints = Array.isArray(complaints) 
        ? complaints.slice(0, 9)
        : [];

      // Territory distribution
      const territoryDistribution = territories.map(territory => {
        const assignmentCount = assignments.filter(a => a.territoryId === territory.territoryId).length;
        return {
          name: territory.territoryName,
          count: assignmentCount
        };
      });

      // Process complaint trends
      const complaintTrends = processComplaintTrends(complaints);
      console.log('Processed complaint trends:', complaintTrends);

      setStats({
        totalComplaints: Array.isArray(complaints) ? complaints.length : 0,
        totalTerritories: territories.length,
        totalEmployees: employees.length,
        activeEmployees,
        recentComplaints,
        territoryDistribution,
        employeeStats: [
          { status: 'Active', count: activeEmployees },
          { status: 'Inactive', count: employees.filter(emp => emp.status === 'INACTIVE').length },
          { status: 'Suspended', count: employees.filter(emp => emp.status === 'SUSPENDED').length }
        ],
        complaintTrends
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const territoryChartData = {
    labels: stats.territoryDistribution.map(t => t.name),
    datasets: [
      {
        label: 'Employees per Territory',
        data: stats.territoryDistribution.map(t => t.count),
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
          '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const employeeChartData = {
    labels: stats.employeeStats.map(s => s.status),
    datasets: [
      {
        label: 'Employee Status',
        data: stats.employeeStats.map(s => s.count),
        backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  // Real complaint trends data
  const trendData = {
    labels: stats.complaintTrends.map(trend => trend.label),
    datasets: [
      {
        label: 'Complaints per Month',
        data: stats.complaintTrends.map(trend => trend.count),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    maintainAspectRatio: false,
  };

  const trendChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            const count = context.parsed.y;
            return `${context.dataset.label}: ${count} complaint${count !== 1 ? 's' : ''}`;
          }
        }
      },
    },
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            return Math.floor(value) === value ? value : '';
          }
        },
        title: {
          display: true,
          text: 'Number of Complaints'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome to Shanthi Gears Management System</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            onClick={() => handleNavigation('/complaints')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Complaints</CardTitle>
              <div className="h-8 w-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                📋
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalComplaints}</div>
              <p className="text-xs text-blue-100 mt-1">
                {stats.totalComplaints > 0 ? 'Click to view details' : 'No complaints yet'}
              </p>
            </CardContent>
          </Card>

          <Card 
            onClick={() => handleNavigation('/employees')}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Active Employees</CardTitle>
              <div className="h-8 w-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                👥
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeEmployees}</div>
              <p className="text-xs text-green-100 mt-1">
                {stats.totalEmployees > 0 ? 'Click to manage employees' : 'No employees yet'}
              </p>
            </CardContent>
          </Card>

          <Card 
            onClick={() => handleNavigation('/territories')}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Territories</CardTitle>
              <div className="h-8 w-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                🗺️
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalTerritories}</div>
              <p className="text-xs text-purple-100 mt-1">
                Click to view territories
              </p>
            </CardContent>
          </Card>

          <Card 
            onClick={() => handleNavigation('/employee-territories')}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">Assignments</CardTitle>
              <div className="h-8 w-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                🎯
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.territoryDistribution.reduce((sum, t) => sum + t.count, 0)}
              </div>
              <p className="text-xs text-orange-100 mt-1">
                Click to manage assignments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Recent Data */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Territory Distribution Chart */}
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Territory Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {stats.territoryDistribution.length > 0 ? (
                  <Doughnut data={territoryChartData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No territory data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Employee Status Chart */}
          <Card className="shadow-xl border-0">
          <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Employee Status</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="h-64">
                {stats.employeeStats.some(s => s.count > 0) ? (
                  <Doughnut data={employeeChartData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No employee data available
                  </div>
                )}
              </div>
          </CardContent>
        </Card>

          {/* Trends Chart */}
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="mr-2">📈</span>
                Complaint Trends
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (Last 6 Months)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {stats.complaintTrends.length > 0 && stats.complaintTrends.some(trend => trend.count > 0) ? (
                  <Line data={trendData} options={trendChartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📊</div>
                      <p className="font-medium">No complaint trends data</p>
                      <p className="text-sm">Submit complaints to see trends</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          {/* Recent Complaints - Full Width */}
          <Card className="shadow-xl border-0">
          <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="mr-2">📋</span>
                  Recent Complaints
                  {stats.recentComplaints.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({stats.recentComplaints.length} recent)
                    </span>
                  )}
                </CardTitle>
                {stats.recentComplaints.length > 0 && (
                  <button
                    onClick={() => handleNavigation('/complaints')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    View All →
                  </button>
                )}
              </div>
          </CardHeader>
          <CardContent className="p-0">
              {stats.recentComplaints.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact Person
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Territory
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Serial Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.recentComplaints.map((complaint, index) => (
                        <tr 
                          key={complaint.complaintId || index} 
                          className="hover:bg-gray-50 transition-colors duration-200"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-blue-100 p-2 rounded-full mr-3 flex-shrink-0">
                                <span className="text-blue-600 text-sm">👤</span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {complaint.contactPersonName || 'Unknown'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {complaint.mailId || 'No email'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {complaint.companyName || 'No company'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="mr-1">📍</span>
                              {complaint.territory?.territoryName || 'Unknown'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {complaint.gearboxSerialNumber || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {complaint.complaintDate ? 
                                new Date(complaint.complaintDate).toLocaleDateString() : 'No date'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <span className="mr-1">🆕</span>
                              New
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No complaints yet</h3>
                  <p className="text-gray-600 mb-4">Complaints will appear here when submitted through your forms</p>
                  <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Tip:</span> Recent complaints from your WordPress form submissions will be displayed here.
                    </p>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}