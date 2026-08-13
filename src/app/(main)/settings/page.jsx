"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    // Always fetch users when component mounts
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      console.log("Fetching users...");
      const res = await axios.get("/api/users");
      console.log("Users fetched:", res.data);
      console.log("Number of users:", res.data.length);
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setUsersLoading(false);
    }
  };


  // Show loading state while session is being fetched
  if (status === "loading") {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if no session
  if (status === "unauthenticated" || !session) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <p className="text-red-500">Please log in to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Settings</h2>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <Button
          variant={activeTab === "profile" ? "default" : "outline"}
          onClick={() => setActiveTab("profile")}
        >
          My Profile
        </Button>
        <Button
          variant={activeTab === "users" ? "default" : "outline"}
          onClick={() => setActiveTab("users")}
        >
          User Management
        </Button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <p className="p-2 bg-gray-100 rounded">{session?.user?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <p className="p-2 bg-gray-100 rounded">{session?.user?.email || 'N/A'}</p>
              </div>
              {/* <div>
                <label className="block text-sm font-medium mb-1">User ID</label>
                <p className="p-2 bg-gray-100 rounded">{session?.user?.id || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role ID</label>
                <p className="p-2 bg-gray-100 rounded">{session?.user?.roleId || 'N/A'}</p>
              </div> */}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <Card className="shadow-lg">
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">
              User Management {users.length > 0 && `(${users.length} users)`}
            </CardTitle>
            <Button
              variant="outline"
              onClick={fetchUsers}
              disabled={usersLoading}
            >
              {usersLoading ? "Refreshing..." : "Refresh"}
            </Button>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-500">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <p className="text-gray-500">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-3 border">User ID</th>
                      <th className="p-3 border">Username</th>
                      <th className="p-3 border">Email</th>
                      <th className="p-3 border">Role</th>
                      <th className="p-3 border">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.userId} className="hover:bg-gray-50">
                        <td className="p-3 border">{user.userId}</td>
                        <td className="p-3 border">{user.username}</td>
                        <td className="p-3 border">{user.email}</td>
                        <td className="p-3 border">{user.role?.roleName || 'N/A'}</td>
                        <td className="p-3 border">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
