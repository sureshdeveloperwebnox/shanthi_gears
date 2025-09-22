'use client';

import { useEffect, useState } from 'react';
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
  const [stats, setStats] = useState({
    totalComplaints: 0,
    totalTerritories: 0,
    totalEmployees: 0,
    activeEmployees: 0,
    recentComplaints: [],
    territoryDistribution: [],
    employeeStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

      // Process data for dashboard
      const activeEmployees = employees.filter(emp => emp.status === 'ACTIVE').length;
      
      // Get recent complaints (last 5)
      const recentComplaints = Array.isArray(complaints) 
        ? complaints.slice(0, 5)
        : [];

      // Territory distribution
      const territoryDistribution = territories.map(territory => {
        const assignmentCount = assignments.filter(a => a.territoryId === territory.territoryId).length;
        return {
          name: territory.territoryName,
          count: assignmentCount
        };
      });

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
        ]
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

  // Trend data (mock data for demonstration)
  const trendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Complaints Trend',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
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
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Complaints</CardTitle>
              <div className="h-8 w-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                📋
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalComplaints}</div>
              <p className="text-xs text-blue-100 mt-1">
                {stats.totalComplaints > 0 ? '+2 from last week' : 'No complaints yet'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Active Employees</CardTitle>
              <div className="h-8 w-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                👥
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeEmployees}</div>
              <p className="text-xs text-green-100 mt-1">
                {stats.totalEmployees > 0 ? `${stats.totalEmployees} total employees` : 'No employees yet'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Territories</CardTitle>
              <div className="h-8 w-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                🗺️
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalTerritories}</div>
              <p className="text-xs text-purple-100 mt-1">
                Coverage areas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
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
                Employee-Territory assignments
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
              <CardTitle className="text-lg font-semibold text-gray-800">Complaint Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Line data={trendData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Complaints */}
          <Card className="shadow-xl border-0">
          <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="mr-2">📋</span>
                Recent Complaints
              </CardTitle>
          </CardHeader>
          <CardContent>
              {stats.recentComplaints.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentComplaints.map((complaint, index) => (
                    <div key={complaint.complaintId || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{complaint.contactPersonName || 'Unknown'}</p>
                        <p className="text-sm text-gray-600">{complaint.companyName || 'No company'}</p>
                        <p className="text-xs text-gray-500">
                          {complaint.territory?.territoryName || 'Unknown territory'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {complaint.complaintDate ? new Date(complaint.complaintDate).toLocaleDateString() : 'No date'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📝</div>
                  <p>No complaints yet</p>
                  <p className="text-sm">Complaints will appear here when submitted</p>
                </div>
              )}
          </CardContent>
        </Card>

          {/* Quick Actions */}
          <Card className="shadow-xl border-0">
          <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="mr-2">⚡</span>
                Quick Actions
              </CardTitle>
          </CardHeader>
          <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg cursor-pointer transition-colors group">
                  <div className="text-center">
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">👥</div>
                    <p className="text-sm font-medium text-blue-800">Manage Employees</p>
                  </div>
                </div>
                
                <div className="bg-green-50 hover:bg-green-100 p-4 rounded-lg cursor-pointer transition-colors group">
                  <div className="text-center">
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🗺️</div>
                    <p className="text-sm font-medium text-green-800">View Territories</p>
                  </div>
                </div>
                
                <div className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg cursor-pointer transition-colors group">
                  <div className="text-center">
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📋</div>
                    <p className="text-sm font-medium text-purple-800">View Complaints</p>
                  </div>
                </div>
                
                <div className="bg-orange-50 hover:bg-orange-100 p-4 rounded-lg cursor-pointer transition-colors group">
                  <div className="text-center">
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🎯</div>
                    <p className="text-sm font-medium text-orange-800">Assignments</p>
                  </div>
                </div>
              </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}