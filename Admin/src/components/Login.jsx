import React, { useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const inputClass =
  "mt-2 w-full rounded-md border border-[#dfd1c1] bg-[#fffdf9] px-4 py-3 text-sm text-[#1f1b17] outline-none transition placeholder:text-[#a49181] focus:border-[#c49a5e] focus:ring-2 focus:ring-[#c49a5e]/18";

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
    <main className="min-h-screen bg-[#fffaf4] text-[#1f1b17]">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
        <section className="hidden border-r border-[#eadfd2] bg-[#1f1b17] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="grid h-14 w-14 place-items-center rounded-md border border-[#d8b778]/35 bg-[#d8b778] font-serif text-2xl text-[#1f1b17]">
              L
            </div>
            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#d8b778]">
              Levon Admin
            </p>
            <h1 className="mt-4 max-w-xl font-serif text-6xl leading-none">
              Control the perfume experience.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/68">
              Manage products, orders, homepage stories, gift sets, mood slots,
              and live storefront images from one polished workspace.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {["Products", "Orders", "Content"].map((item) => (
              <div key={item} className="rounded-md border border-white/12 bg-white/6 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d8b778]">
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
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-md bg-[#1f1b17] font-serif text-xl text-[#d8b778] lg:mx-0">
                L
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b9945d]">
                Secure Admin
              </p>
              <h2 className="mt-3 font-serif text-4xl leading-none text-[#1f1b17]">
                Welcome Back
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#7d6756]">
                Sign in to manage the Levon storefront.
              </p>
            </div>

            <form
              className="rounded-md border border-[#eadfd2] bg-[#fffdf9] p-5 shadow-[0_24px_60px_rgba(62,45,28,0.10)] sm:p-6"
              onSubmit={handleSubmit}
            >
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7d6756]">
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
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7d6756]">
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
                className="mt-6 w-full rounded-full bg-[#1f1b17] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#c49a5e] disabled:cursor-wait disabled:bg-[#7d6756]"
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
