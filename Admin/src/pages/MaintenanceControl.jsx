import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { AdminPanelSkeleton } from "../components/AdminSkeletons";

const MaintenanceControl = ({ token }) => {
  const [maintenance, setMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);

  // fetch current maintenance state
  useEffect(() => {
    axios
      .get(`${backendUrl}/api/maintenance`, {
        headers: { token },
      })
      .then((res) => {
        setMaintenance(res.data.maintenance);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || err.message);
        setLoading(false);
      });
  }, [token]);

  const handleToggle = async () => {
    try {
      // send a proper boolean, not string
      const res = await axios.post(
        `${backendUrl}/api/maintenance`,
        { active: !maintenance }, // toggle
        { headers: { token } }
      );

      setMaintenance(res.data.maintenance);
      toast.success(
        `Maintenance ${res.data.maintenance ? "enabled" : "disabled"}`
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  if (loading) return <AdminPanelSkeleton />;

  return (
    <div className="flex flex-col gap-4 max-w-md border p-4 rounded">
      <h2 className="text-lg font-bold">Maintenance Mode</h2>
      <p>
        Current status: <b>{maintenance ? "ON" : "OFF"}</b>
      </p>
      <button
        onClick={handleToggle}
        className={`px-4 py-2 text-white ${
          maintenance ? "bg-red-600" : "bg-green-600"
        }`}
      >
        {maintenance ? "Disable Maintenance" : "Enable Maintenance"}
      </button>
    </div>
  );
};

export default MaintenanceControl;
