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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(territorySchema),
  });

  useEffect(() => {
    fetchTerritories();
  }, []);

  const fetchTerritories = async () => {
    const res = await axios.get("/api/territories");
    setTerritories(res.data);
  };

  const onSubmit = async (data) => {
    try {
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
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Territories</h2>

      <Card className="mb-6">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Territory List</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  reset();
                  setEditingTerritory(null);
                }}
              >
                + Add Territory
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTerritory ? "Edit Territory" : "Add Territory"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Input
                    placeholder="Territory Name"
                    {...register("territoryName")}
                  />
                  {errors.territoryName && (
                    <p className="text-red-500 text-sm">
                      {errors.territoryName.message}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingTerritory ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {territories.length === 0 ? (
            <p className="text-gray-500">No territories yet.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
             
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {territories.map((t) => (
                  <tr key={t.territoryId} className="hover:bg-gray-50">
                 
                    <td className="p-2 border">{t.territoryName}</td>
                    <td className="p-2 border text-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(t)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(t.territoryId)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
