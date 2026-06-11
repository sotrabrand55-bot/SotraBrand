import React, { useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const inputClass =
  "mt-2 w-full rounded-none border border-black/20 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-black focus:ring-2 focus:ring-black/10";

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const response = await axios.post(`${backendUrl}/api/user/admin`, {
        email,
        password,
      });

      if (response.data.success) {
        setToken(response.data.token);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
        <section className="hidden border-r border-black/10 bg-black p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="grid h-14 w-14 place-items-center border border-white/25 bg-white font-serif text-2xl text-black">
              R
            </div>
            <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.28em] text-[#f1c6d1]">
              Be Radiant by Nancy
            </p>
            <h1 className="mt-4 max-w-xl font-serif text-6xl leading-none">
              Control the radiant experience.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/68">
              Manage products, orders, homepage media, category dropdowns,
              announcements, and live storefront images from one polished workspace.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {["Products", "Orders", "Content"].map((item) => (
              <div key={item} className="rounded-md border border-white/12 bg-white/6 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f1c6d1]">
                  {item}
                </p>
                <div className="mt-4 h-px bg-white/18" />
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-7 text-center lg:text-left">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center bg-black font-serif text-xl text-white lg:mx-0">
                R
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#c47b92]">
                Secure Admin
              </p>
              <h2 className="mt-3 font-serif text-4xl leading-none text-black">
                Welcome Back
              </h2>
              <p className="mt-3 text-sm leading-6 text-black/55">
                Sign in to manage the Be Radiant storefront.
              </p>
            </div>

            <form
              className="border border-black/15 bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.08)] sm:p-6"
              onSubmit={handleSubmit}
            >
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/55">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className={inputClass}
                  required
                />
              </label>

              <label className="mt-4 block">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/55">
                  Password
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className={inputClass}
                  required
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full bg-black px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#222] disabled:cursor-wait disabled:bg-black/45"
              >
                {submitting ? "Signing In..." : "Login"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;
