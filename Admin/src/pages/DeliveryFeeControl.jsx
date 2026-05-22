import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const DeliveryFeeControl = ({ token }) => {
  const [fee, setFee] = useState(0);

  useEffect(() => {
    axios.get(`${backendUrl}/api/settings/delivery-fee`)
      .then(res => setFee(res.data.delivery_fee))
      .catch(() => toast.error("Failed to load delivery fee"));
  }, []);

  const saveFee = async () => {
    try {
      // eslint-disable-next-line no-unused-vars
      const res = await axios.post(
        `${backendUrl}/api/settings/delivery-fee`,
        { delivery_fee: Number(fee) },
        { headers: { token } }
      );

      toast.success("Delivery fee updated");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="max-w-sm border p-4 rounded flex flex-col gap-3">
      <h2 className="font-bold text-lg">Delivery Fee</h2>
      <input
        type="number"
        value={fee}
        onChange={(e) => setFee(Number(e.target.value))}
        className="border px-3 py-2"
      />
      <button
        onClick={saveFee}
        className="bg-black text-white py-2"
      >
        Save
      </button>
    </div>
  );
};

export default DeliveryFeeControl;
