import { useState } from "react";
import axios from "axios";
import { useMockData } from "./mockData";

const emptyForm = { name: "", email: "", message: "" };

export const useContactForm = () => {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("");

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("sending");

    if (useMockData) {
      setStatus("sent");
      setForm(emptyForm);
      return;
    }

    try {
      const backendUrl = String(import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");
      await axios.post(`${backendUrl}/api/contact`, form);
      setStatus("sent");
      setForm(emptyForm);
    } catch (_) {
      setStatus("error");
    }
  };

  return {
    form,
    status,
    handleChange,
    handleSubmit,
  };
};
