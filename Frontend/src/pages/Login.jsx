import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiArrowRight, FiLock, FiMail, FiUser } from "react-icons/fi";
import { ShopContext } from "../context/ShopContext";

const fieldClass =
  "mt-2 w-full rounded-md border border-[#dfd1c1] bg-[#fffdf9] px-4 py-3 text-sm text-[#1f1b17] outline-none transition placeholder:text-[#a49181] focus:border-[#c49a5e] focus:ring-2 focus:ring-[#c49a5e]/18";

const labelClass =
  "text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7d6756]";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isLogin = currentState === "Login";

  const onSubmitHandler = async (e) => {
    e.preventDefault();
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
          toast("Welcome back to Levon.");
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
    if (token) navigate("/");
  }, [token, navigate]);

  return (
    <main className="min-h-screen bg-[#fffaf4] px-4 py-10 text-[#1f1b17] sm:px-[5vw] md:px-[7vw] lg:px-[3vw]">
      <section className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-[1180px] overflow-hidden rounded-md border border-[#eadfd2] bg-[#fffdf9] shadow-[0_28px_70px_rgba(62,45,28,0.12)] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="hidden bg-[#1f1b17] p-8 text-white lg:flex lg:flex-col lg:justify-between xl:p-10">
          <div>
            <div className="grid h-14 w-14 place-items-center rounded-md border border-[#d8b778]/35 bg-[#d8b778] font-serif text-2xl text-[#1f1b17]">
              L
            </div>
            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#d8b778]">
              Levon Account
            </p>
            <h1 className="mt-4 max-w-xl font-serif text-6xl leading-none">
              A quieter way to keep your scents close.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/68">
              Save favorites, follow your orders, and return to the perfume
              rituals you love.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {["Favorites", "Orders", "Rituals"].map((item) => (
              <div key={item} className="rounded-md border border-white/12 bg-white/6 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d8b778]">
                  {item}
                </p>
                <div className="mt-4 h-px bg-white/18" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-10">
          <div className="w-full max-w-md">
            <div className="text-center lg:text-left">
              <div className="mx-auto mb-4 flex w-fit items-center gap-3 text-[#c49a5e] lg:mx-0">
                <span className="h-px w-10 bg-current" />
                <span className="h-2.5 w-2.5 rotate-45 bg-current" />
                <span className="h-px w-10 bg-current" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b9945d]">
                {isLogin ? "Welcome Back" : "Create Account"}
              </p>
              <h2 className="mt-3 font-serif text-5xl leading-none text-[#1f1b17]">
                {isLogin ? "Sign In" : "Join Levon"}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#7d6756]">
                {isLogin
                  ? "Access your orders, saved scents, and Levon favorites."
                  : "Create your account and begin your Levon scent wardrobe."}
              </p>
            </div>

            <form onSubmit={onSubmitHandler} className="mt-8 space-y-4">
              {!isLogin && (
                <label className="block">
                  <span className={labelClass}>Name</span>
                  <div className="relative">
                    <FiUser className="pointer-events-none absolute left-4 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-[#c49a5e]" />
                    <input
                      onChange={(e) => setName(e.target.value)}
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
                  <FiMail className="pointer-events-none absolute left-4 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-[#c49a5e]" />
                  <input
                    onChange={(e) => setEmail(e.target.value)}
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
                  <FiLock className="pointer-events-none absolute left-4 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-[#c49a5e]" />
                  <input
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    className={`${fieldClass} pl-11`}
                    type="password"
                    placeholder="Password"
                    required
                  />
                </div>
              </label>

              <div className="flex flex-col gap-3 pt-1 text-sm text-[#7d6756] sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  className="w-fit font-medium transition hover:text-[#1f1b17]"
                >
                  Forgot Your Password
                </button>
                {isLogin ? (
                  <button
                    type="button"
                    onClick={() => setCurrentState("Sign Up")}
                    className="w-fit font-semibold text-[#1f1b17] transition hover:text-[#c49a5e]"
                  >
                    Create account
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentState("Login")}
                    className="w-fit font-semibold text-[#1f1b17] transition hover:text-[#c49a5e]"
                  >
                    Login here
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#1f1b17] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#c49a5e] disabled:cursor-wait disabled:bg-[#7d6756]"
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
