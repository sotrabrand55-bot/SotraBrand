import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FiArrowRight, FiLock, FiLogOut, FiMail, FiPackage, FiUser } from "react-icons/fi";
import { ShopContext } from "../context/ShopContext";

const fieldClass =
  "mt-2 w-full border border-black/20 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-black";

const labelClass =
  "text-[10px] font-bold uppercase tracking-[0.18em] text-black/55";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);
  const location = useLocation();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isLogin = currentState === "Login";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setCurrentState(params.get("mode") === "signup" ? "Sign Up" : "Login");
  }, [location.search]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      if (currentState === "Sign Up") {
        const response = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          email,
          password,
        });

        if (response.data.success) {
          toast("Your account has been created.");
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(`${backendUrl}/api/user/login`, {
          email,
          password,
        });

        if (response.data.success) {
          toast("Welcome back to Be Radiant.");
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error("Something went wrong:", error);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    const params = new URLSearchParams(location.search);
    const redirect = params.get("redirect");
    if (redirect) navigate(redirect);
  }, [location.search, navigate, token]);

  const logout = async () => {
    try {
      await axios.post(`${backendUrl}/api/user/logout`);
    } catch {
      // Local logout should still work if the API is unavailable.
    }
    localStorage.removeItem("token");
    setToken("");
    toast.info("Logged out.");
  };

  if (token) {
    return (
      <main className="min-h-screen bg-white px-4 py-10 text-black sm:px-6 lg:px-10">
        <section className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-[760px] items-center justify-center border border-black/15 bg-white px-5 py-12 text-center sm:px-10">
          <div className="w-full max-w-md">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-black/45">
              Be Radiant Account
            </p>
            <h1 className="mt-3 text-5xl font-black uppercase leading-none text-black">
              You Are Signed In
            </h1>
            <p className="mx-auto mt-5 max-w-sm text-sm leading-7 text-black/55">
              Manage your orders or safely end this session.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="inline-flex h-14 items-center justify-center gap-3 bg-black px-7 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#222]"
              >
                <FiPackage className="h-4 w-4" />
                Orders
              </button>
              <button
                type="button"
                onClick={logout}
                className="inline-flex h-14 items-center justify-center gap-3 border border-black px-7 text-xs font-bold uppercase tracking-[0.18em] text-black transition hover:bg-black hover:text-white"
              >
                <FiLogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-black sm:px-6 lg:px-10">
      <section className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-[1180px] border border-black/15 bg-white lg:grid-cols-[0.92fr_1.08fr]">
        <div className="hidden border-r border-black/15 bg-black p-8 text-white lg:flex lg:flex-col lg:justify-between xl:p-10">
          <div>
            <div className="grid h-14 w-14 place-items-center border border-white/40 font-serif text-2xl">
              R
            </div>
            <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.28em] text-white/60">
              Be Radiant Account
            </p>
            <h1 className="mt-4 max-w-xl text-5xl font-black uppercase leading-tight">
              Keep your Nancy rituals close.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/65">
              Save favorites, follow orders, and return to the products you love.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {["Favorites", "Orders", "Rituals"].map((item) => (
              <div key={item} className="border border-white/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                  {item}
                </p>
                <div className="mt-4 h-px bg-white/25" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-10">
          <div className="w-full max-w-md">
            <div className="text-center lg:text-left">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-black/45">
                {isLogin ? "Welcome Back" : "Create Account"}
              </p>
              <h2 className="mt-3 text-5xl font-black uppercase leading-none text-black">
                {isLogin ? "Sign In" : "Join Nancy"}
              </h2>
              <p className="mt-4 text-sm leading-7 text-black/55">
                {isLogin
                  ? "Access your orders, saved products, and Be Radiant favorites."
                  : "Create your account and begin your Be Radiant ritual."}
              </p>
            </div>

            <form onSubmit={onSubmitHandler} className="mt-8 space-y-4">
              {!isLogin && (
                <label className="block">
                  <span className={labelClass}>Name</span>
                  <div className="relative">
                    <FiUser className="pointer-events-none absolute left-4 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-black/45" />
                    <input
                      onChange={(event) => setName(event.target.value)}
                      value={name}
                      className={`${fieldClass} pl-11`}
                      type="text"
                      placeholder="Your name"
                      required
                    />
                  </div>
                </label>
              )}

              <label className="block">
                <span className={labelClass}>Email</span>
                <div className="relative">
                  <FiMail className="pointer-events-none absolute left-4 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-black/45" />
                  <input
                    onChange={(event) => setEmail(event.target.value)}
                    value={email}
                    className={`${fieldClass} pl-11`}
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className={labelClass}>Password</span>
                <div className="relative">
                  <FiLock className="pointer-events-none absolute left-4 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-black/45" />
                  <input
                    onChange={(event) => setPassword(event.target.value)}
                    value={password}
                    className={`${fieldClass} pl-11`}
                    type="password"
                    placeholder="Password"
                    required
                  />
                </div>
              </label>

              <div className="flex flex-col gap-3 pt-1 text-sm text-black/55 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" className="w-fit transition hover:text-black">
                  Forgot Your Password
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentState(isLogin ? "Sign Up" : "Login")}
                  className="w-fit font-semibold text-black transition hover:text-black/55"
                >
                  {isLogin ? "Create account" : "Login here"}
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-14 w-full items-center justify-center gap-3 bg-black px-7 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#222] disabled:cursor-wait disabled:bg-black/50"
              >
                {submitting ? "Please Wait..." : isLogin ? "Sign In" : "Sign Up"}
                <FiArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
