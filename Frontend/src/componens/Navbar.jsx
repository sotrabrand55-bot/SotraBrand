import { useContext, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import axios from 'axios'
import { ShopContext } from '../context/ShopContext'
import { FiHeart, FiMenu, FiPackage, FiSearch, FiShoppingBag, FiUser, FiX } from 'react-icons/fi'

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const { backendUrl, setShowSearch, getCartCount, getFavoriteCount, navigate, token, setToken, setCartItems } =
    useContext(ShopContext)
  const [bump, setBump] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const logout = async () => {
    try {
      await axios.post(`${backendUrl}/api/user/logout`)
    } catch {
      // local logout still clears the current session state
    }
    navigate('/login')
    localStorage.removeItem('token')
    setToken('')
    setCartItems({})
    setProfileOpen(false)
  }

  const handleCart = () => {
    setBump(true)
    setTimeout(() => {
      setBump(false)
      navigate('/cart')
    }, 320)
  }

  const handleSearch = () => {
    navigate('/collection')
    setShowSearch(true)
  }

  const handleFavorites = () => {
    navigate('/favorites')
  }

  const handleOrders = () => {
    navigate(token ? '/orders' : '/login')
  }

  const navLink = ({ isActive }) =>
    `relative px-1 py-2 text-[13px] font-medium uppercase tracking-[0.2em] transition-colors ${
      isActive
        ? 'text-[#191714] after:absolute after:-bottom-1 after:left-1/2 after:h-px after:w-7 after:-translate-x-1/2 after:bg-[#b9945d]'
        : 'text-[#5f5850] hover:text-[#191714]'
    }`

  const mobileNavLink = ({ isActive }) =>
    `rounded-sm px-4 py-3 text-sm font-medium uppercase tracking-[0.16em] transition ${
      isActive ? 'bg-[#191714] text-white' : 'text-[#4f4942] hover:bg-[#f3ece4]'
    }`

  const iconButton =
    'grid h-9 w-9 place-items-center rounded-full border border-[#ded3c6] bg-white/85 text-[#2d2924] shadow-sm shadow-black/5 transition hover:border-[#b9945d] hover:bg-[#f8f2eb] hover:text-[#191714] sm:h-10 sm:w-10'
  const desktopIconButton = iconButton.replace('grid ', 'hidden sm:grid ')

  return (
    <>
    <header className="sticky top-0 z-40 w-full border-b border-[#eadfD2] bg-[#fffaf4]/95 font-sans backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 min-w-0 items-center justify-between gap-2 sm:h-20 sm:gap-3">
          <div className="shrink-0">
            <Link to="/" className="font-serif text-[1.65rem] tracking-[0.24em] text-[#1f1b17] sm:text-3xl sm:tracking-[0.26em]">
              LEVON
            </Link>
          </div>

          <nav className="hidden md:flex flex-1 min-w-0 items-center justify-center ">
            <ul className="flex items-center gap-9">
              <NavLink to="/" className={navLink}>Home</NavLink>
              <NavLink to="/collection" className={navLink}>Collection</NavLink>
              <NavLink to="/gift-sets" className={navLink}>Gift Sets</NavLink>
              <NavLink to="/about" className={navLink}>About</NavLink>
              <NavLink to="/contact" className={navLink}>Contact</NavLink>
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleSearch}
              aria-label="Search"
              className={iconButton}
            >
              <FiSearch className="h-[18px] w-[18px]" />
            </button>

            <div className="relative">
              <button
                type="button"
                aria-label="Profile"
                onClick={() => (token ? setProfileOpen((p) => !p) : navigate('/login'))}
                className={desktopIconButton}
              >
                <FiUser className="h-[18px] w-[18px]" />
              </button>

              {token && profileOpen && (
                <div className="absolute right-0 z-50 mt-3 w-44 rounded-sm bg-white p-3 shadow-xl ring-1 ring-black/10">
                  <button
                    onClick={() => {
                      navigate('/orders')
                      setProfileOpen(false)
                    }}
                    className="hidden w-full rounded px-2 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 lg:block"
                  >
                    Orders
                  </button>
                  <button
                    onClick={logout}
                    className="mt-1 block w-full rounded px-2 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleFavorites}
              aria-label="Favorites"
              className={`relative ${iconButton}`}
            >
              <FiHeart className="h-[18px] w-[18px]" />
              {getFavoriteCount() > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#7b2d2d] px-1 text-[9px] font-semibold text-white ring-2 ring-[#fffaf4] sm:h-5 sm:min-w-5 sm:text-[10px]">
                  {getFavoriteCount()}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleOrders}
              aria-label="Orders"
              className={`${iconButton} hidden lg:grid`}
            >
              <FiPackage className="h-[18px] w-[18px]" />
            </button>

            {/* cart */}
            <button
              type="button"
              onClick={handleCart}
              aria-label="Cart"
              className={`relative ${iconButton} transition-transform ${bump ? 'scale-110' : ''}`}
            >
              <FiShoppingBag className="h-[18px] w-[18px]" />
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#7b2d2d] px-1 text-[9px] font-semibold text-white ring-2 ring-[#fffaf4] sm:h-5 sm:min-w-5 sm:text-[10px]">
                {getCartCount()}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className={`${iconButton} md:hidden`}
            >
              <FiMenu className="h-[19px] w-[19px]" />
            </button>
          </div>
        </div>
      </div>

    </header>

      <div className={`fixed inset-0 z-[999] md:hidden ${open ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-[#1f1b17]/35 backdrop-blur-[2px] transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setOpen(false)}
        />
        <aside
          className={`absolute bottom-0 right-0 top-0 flex h-full w-[88vw] max-w-[22rem] flex-col bg-[#fffaf4] shadow-[0_24px_70px_rgba(31,27,23,0.28)] transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between border-b border-[#eadfd2] px-5 py-4">
            <span className="font-serif text-2xl tracking-[0.24em] text-[#1f1b17]">LEVON</span>
            <button onClick={() => setOpen(false)} aria-label="Close menu" className={iconButton}>
              <FiX className="h-[18px] w-[18px]" />
            </button>
          </div>

          <div className="px-5 pt-8">
            <div className="mb-7 flex w-fit items-center gap-3 text-[#c49a5e]">
              <span className="h-px w-10 bg-current" />
              <span className="h-2.5 w-2.5 rotate-45 bg-current" />
              <span className="h-px w-10 bg-current" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9a8068]">
              Navigation
            </p>
          </div>

          <nav className="mt-4 flex flex-col gap-2 px-5">
            <NavLink to="/" onClick={() => setOpen(false)} className={mobileNavLink}>Home</NavLink>
            <NavLink to="/collection" onClick={() => setOpen(false)} className={mobileNavLink}>Collection</NavLink>
            <NavLink to="/gift-sets" onClick={() => setOpen(false)} className={mobileNavLink}>Gift Sets</NavLink>
            <NavLink to="/about" onClick={() => setOpen(false)} className={mobileNavLink}>About</NavLink>
            <NavLink to="/contact" onClick={() => setOpen(false)} className={mobileNavLink}>Contact</NavLink>
            <NavLink to={token ? "/orders" : "/login"} onClick={() => setOpen(false)} className={mobileNavLink}>
              Orders
            </NavLink>
          </nav>

          <div className="mt-auto border-t border-[#eadfd2] px-5 py-5">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                navigate(token ? '/orders' : '/login')
              }}
              className="flex w-full items-center justify-between rounded-md border border-[#eadfd2] bg-white/65 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#1f1b17] transition hover:border-[#c49a5e]"
            >
              {token ? 'Account' : 'Login'}
              <FiUser className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false)
                handleSearch()
              }}
              className="mt-3 flex w-full items-center justify-between rounded-md border border-[#eadfd2] bg-white/65 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#1f1b17] transition hover:border-[#c49a5e]"
            >
              Search Collection
              <FiSearch className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false)
                handleFavorites()
              }}
              className="mt-3 flex w-full items-center justify-between rounded-md border border-[#eadfd2] bg-white/65 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#1f1b17] transition hover:border-[#c49a5e]"
            >
              Favorites
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#7b2d2d] px-1 text-[10px] text-white">
                {getFavoriteCount()}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                handleCart()
              }}
              className="mt-3 flex w-full items-center justify-between rounded-md bg-[#1f1b17] px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#c49a5e]"
            >
              View Cart
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[10px] text-[#1f1b17]">
                {getCartCount()}
              </span>
            </button>
          </div>
        </aside>
      </div>
    </>
  )
}

export default Navbar
