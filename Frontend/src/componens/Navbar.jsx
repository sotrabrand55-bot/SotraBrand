/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import axios from 'axios'
import { ShopContext } from '../context/ShopContext'
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa'
import { FiChevronDown, FiGlobe, FiHeart, FiLogOut, FiMenu, FiSearch, FiShoppingBag, FiUser, FiX } from 'react-icons/fi'
import { useMockData } from '../lib/mockData'
import { customerPreviewLocked } from '../lib/customerPreview'
import { subcategoryGroups as fallbackMenuCategories } from '../lib/subcategoryCatalog'

const BrandMark = ({ compact = false }) => (
  <span className="flex flex-col items-center leading-none text-white">
    <span
      className={`nancy-brand-title font-serif font-semibold tracking-[0.08em] ${
        compact ? 'text-2xl' : 'text-[1.08rem] min-[380px]:text-[1.18rem] min-[430px]:text-[1.45rem] sm:text-[2.35rem]'
      }`}
    >
      BE RADIANT
    </span>
    <span className="nancy-brand-subtitle mt-1 flex items-center gap-1 text-[10px] font-light normal-case tracking-[0.08em] text-[#f1d4dc] min-[380px]:text-[11px] sm:gap-2 sm:text-base">
      <span className="nancy-brand-line h-px w-7 bg-[#cf8a9c] min-[430px]:w-9 sm:w-16" />
      by Nancy
      <span className="nancy-brand-line h-px w-7 bg-[#cf8a9c] min-[430px]:w-9 sm:w-16" />
    </span>
  </span>
)

const LebanonSelector = ({ dark = true }) => {
  const [open, setOpen] = useState(false)
  const textColor = dark ? 'text-white/90' : 'text-black'
  const panelClass = dark
    ? 'border-white/15 bg-black text-white shadow-[0_18px_40px_rgba(0,0,0,0.25)]'
    : 'border-black/15 bg-white text-black shadow-[0_18px_40px_rgba(0,0,0,0.12)]'

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex items-center gap-3 text-xs font-light uppercase tracking-[0.18em] ${textColor}`}
        aria-expanded={open}
      >
        <FiGlobe className="h-5 w-5" />
        Lebanon
        <FiChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`absolute left-0 top-full z-[80] mt-3 min-w-48 border p-2 transition-all duration-200 ${panelClass} ${
          open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0'
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex w-full items-center justify-between px-3 py-3 text-left text-[10px] font-bold uppercase tracking-[0.16em]"
        >
          Lebanon (USD $)
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
        </button>
      </div>
    </div>
  )
}

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const [openCategory, setOpenCategory] = useState('')
  const [desktopOpenCategory, setDesktopOpenCategory] = useState('')
  const [desktopSelectedCategory, setDesktopSelectedCategory] = useState('')
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const { backendUrl, setShowSearch, getCartCount, getFavoriteCount, navigate, token, setToken, setCartItems, openCart, categoryGroups, siteSettings } =
    useContext(ShopContext)
  const [bump, setBump] = useState(false)
  const location = useLocation()
  const rawMenuCategories = categoryGroups?.length ? categoryGroups : fallbackMenuCategories
  const previewCategoryLabels = new Set(['Pheromone Touch', 'Mystique Set'])
  const menuCategories = customerPreviewLocked
    ? rawMenuCategories.filter((category) => previewCategoryLabels.has(category.label))
    : rawMenuCategories
  const announcementItems =
    siteSettings?.announcementEnabled === false
      ? []
      : (Array.isArray(siteSettings?.announcementItems) && siteSettings.announcementItems.length
          ? siteSettings.announcementItems
          : ['FREE 10 mL Tester With Every Purchase', siteSettings?.freeShippingText || 'Free Shipping On All Orders'])
  const socialLinks = siteSettings?.socialLinks || {}
  const brandSocialLinks = [
    {
      label: 'Be Radiant by Nancy on Instagram',
      href: socialLinks.instagram || 'https://www.instagram.com/radiant_bynancy?igsh=MWY3YmwxcjNyYTNjcg==',
      icon: FaInstagram,
    },
    {
      label: 'Be Radiant by Nancy on Facebook',
      href: socialLinks.facebook || 'https://www.facebook.com/share/18oAYDyvZt/',
      icon: FaFacebookF,
    },
    {
      label: 'Be Radiant by Nancy on TikTok',
      href: socialLinks.tiktok || 'https://www.tiktok.com/@radiant.nancy?_r=1&_t=ZS-96qoZYlR9xF',
      icon: FaTiktok,
    },
  ].filter((item) => item.href)

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  useEffect(() => {
    setDesktopOpenCategory('')
    setDesktopSelectedCategory('')
    setAccountMenuOpen(false)
  }, [location.pathname, location.search])

  const closeMenu = () => {
    setOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const stopPreviewNavigation = (event, allowed = false) => {
    if (!customerPreviewLocked || allowed) return false
    event?.preventDefault()
    return true
  }

  const handleMobileMenuLink = (event, allowed = false) => {
    if (stopPreviewNavigation(event, allowed)) return
    closeMenu()
  }

  const desktopLinkClass = ({ isActive }) =>
    `group relative flex h-full items-center whitespace-nowrap px-1 text-[11px] font-light uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:text-white ${
      isActive ? 'text-white' : 'text-white/85'
    }`

  const handleOrdersNavigation = (event) => {
    event?.preventDefault()

    if (customerPreviewLocked) return

    navigate('/orders')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAccountNavigation = () => {
    if (customerPreviewLocked) return
    if (!token) {
      navigate('/login?mode=login')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setAccountMenuOpen((current) => !current)
  }

  const logout = async () => {
    if (!useMockData) {
      try {
        await axios.post(`${backendUrl}/api/user/logout`)
      } catch {
        // local logout still clears the current session state
      }
    }
    navigate('/login?mode=login')
    localStorage.removeItem('token')
    setToken('')
    setCartItems({})
    setOpen(false)
    setAccountMenuOpen(false)
  }

  const handleCart = () => {
    if (customerPreviewLocked) return
    setBump(true)
    setTimeout(() => {
      setBump(false)
      openCart()
    }, 180)
  }

  const handleSearch = () => {
    if (customerPreviewLocked) return
    navigate('/collection')
    setShowSearch(true)
  }

  const handleFavorites = () => {
    navigate('/favorites')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const darkIconButton =
    'grid place-items-center text-white transition hover:text-[#f1c6d1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white'
  const headerIconButton =
    `relative h-9 w-8 place-items-center text-white transition hover:text-[#f1c6d1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:h-11 sm:w-10 lg:h-12 lg:w-11`
  const headerIconClass = 'h-5 w-5 stroke-[1.8] sm:h-6 sm:w-6 lg:h-7 lg:w-7'

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-black font-sans text-white">
        {announcementItems.length > 0 && (
          <div className="h-8 overflow-hidden border-b border-white/10 text-white/90 sm:h-9">
            <div className="nancy-announcement-marquee flex h-full w-max items-center gap-8 text-[10px] font-medium tracking-[0.04em] sm:text-sm">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex shrink-0 items-center gap-8">
                  {announcementItems.map((item) => {
                    const text = String(item)
                    const shippingIndex = text.toLowerCase().indexOf('shipping')
                    return (
                      <span key={`${text}-${index}`} className="whitespace-nowrap">
                        {shippingIndex >= 0 ? (
                          <>
                            {text.slice(0, shippingIndex)}
                            <Link
                              to="/shippingpolicy"
                              className="underline underline-offset-2 transition hover:text-white"
                            >
                              {text.slice(shippingIndex, shippingIndex + 8)}
                            </Link>
                            {text.slice(shippingIndex + 8)}
                          </>
                        ) : (
                          text
                        )}
                      </span>
                    )
                  })}
                  <span className="h-4 w-px shrink-0 bg-white/55" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative mx-auto flex h-[4.55rem] w-full max-w-[1500px] items-center justify-center px-4 sm:h-[5.7rem] sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => {
              setOpen(true)
            }}
            aria-label="Open menu"
            className={`nancy-menu-action ${darkIconButton} absolute left-4 h-11 w-11 sm:left-6 sm:h-12 sm:w-12 lg:hidden`}
          >
            <FiMenu className="nancy-menu-icon h-8 w-8 sm:h-9 sm:w-9" />
          </button>

          <div className="absolute left-8 hidden lg:block">
            <LebanonSelector />
          </div>

          <Link to="/" aria-label="Be Radiant by Nancy home" className="absolute left-1/2 -translate-x-1/2">
            <BrandMark />
          </Link>

          <div className="nancy-nav-actions absolute right-3 flex items-center gap-2 sm:right-6 sm:gap-5 lg:right-8 lg:gap-7">
            <button
              type="button"
              onClick={handleFavorites}
              aria-label="Favorites"
              className={`grid ${headerIconButton}`}
            >
              <FiHeart className={headerIconClass} />
              {getFavoriteCount() > 0 && (
                <span className="absolute -right-0.5 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#d47f96] px-1 text-[9px] font-semibold text-white ring-2 ring-black sm:h-5 sm:min-w-5 sm:text-[10px]">
                  {getFavoriteCount()}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleSearch}
              disabled={customerPreviewLocked}
              aria-label="Search"
              className={`nancy-search-action grid ${headerIconButton}`}
            >
              <FiSearch className={headerIconClass} />
            </button>

            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={handleAccountNavigation}
                disabled={customerPreviewLocked}
                aria-label="Account"
                className={`nancy-account-action grid ${headerIconButton}`}
              >
                <FiUser className={headerIconClass} />
              </button>

              {token && accountMenuOpen && (
                <div className="absolute right-0 top-full z-[70] mt-3 w-44 border border-white/20 bg-black p-2 text-white shadow-[0_18px_44px_rgba(0,0,0,0.35)]">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(false)
                      navigate('/orders')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="flex w-full items-center justify-between px-3 py-3 text-left text-[10px] font-bold uppercase tracking-[0.16em] transition hover:bg-white hover:text-black"
                  >
                    My Orders
                    <FiUser className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center justify-between px-3 py-3 text-left text-[10px] font-bold uppercase tracking-[0.16em] transition hover:bg-white hover:text-black"
                  >
                    Logout
                    <FiLogOut className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleCart}
              disabled={customerPreviewLocked}
              aria-label="Cart"
              className={`nancy-cart-action grid ${headerIconButton} transition-transform ${bump ? 'scale-110' : ''}`}
            >
              <FiShoppingBag className={headerIconClass} />
              {getCartCount() > 0 && (
                <span className="absolute -right-0.5 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#d47f96] px-1 text-[9px] font-semibold text-white ring-2 ring-black sm:h-5 sm:min-w-5 sm:text-[10px]">
                  {getCartCount()}
                </span>
              )}
            </button>
          </div>
        </div>

        <nav
          className="relative hidden h-[4.1rem] items-stretch justify-center border-t border-white/5 bg-black px-7 lg:flex"
          onMouseLeave={() => setDesktopOpenCategory('')}
          aria-label="Desktop navigation"
        >
          <div className="grid h-full w-full max-w-[1180px] grid-cols-[1fr_auto_1fr] items-stretch gap-7 xl:gap-10">
            <div className="flex h-full min-w-0 items-stretch justify-end gap-3 xl:gap-6">
              {!customerPreviewLocked && (
                <NavLink
                  to="/collection"
                  end
                  onClick={(event) => {
                    if (stopPreviewNavigation(event)) return
                    setDesktopSelectedCategory('Collection')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className={desktopLinkClass}
                >
                  {({ isActive }) => (
                    <>
                      Collection
                      <span
                        className={`absolute inset-x-0 bottom-[0.9rem] h-px origin-center bg-white transition-transform duration-300 ${
                          isActive || desktopSelectedCategory === 'Collection' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              )}

              {menuCategories.map((category) => {
                const openOnDesktop = desktopOpenCategory === category.label
                const activeChild = category.children.some(
                  (child) =>
                    child.to.toLowerCase() === `${location.pathname}${location.search}`.toLowerCase()
                )
                const underlined =
                  openOnDesktop || activeChild || desktopSelectedCategory === category.label

                return (
                  <div
                    key={category.label}
                    className="relative flex h-full items-stretch"
                    onMouseEnter={() => setDesktopOpenCategory(category.label)}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setDesktopSelectedCategory(category.label)
                        setDesktopOpenCategory(openOnDesktop ? '' : category.label)
                      }}
                      className="group relative flex h-full items-center whitespace-nowrap px-1 text-[10px] font-light uppercase tracking-[0.15em] text-white/85 transition-colors duration-300 hover:text-white xl:text-[11px] xl:tracking-[0.18em]"
                      aria-expanded={openOnDesktop}
                    >
                      {category.label}
                      <span
                        className={`absolute inset-x-0 bottom-[0.9rem] h-px origin-center bg-white transition-transform duration-300 ${
                          underlined ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                        }`}
                      />
                    </button>

                    <div
                      className={`absolute left-1/2 top-full z-50 w-[290px] -translate-x-1/2 bg-black px-8 py-5 shadow-[0_16px_32px_rgba(0,0,0,0.28)] transition-all duration-300 ${
                        openOnDesktop
                          ? 'pointer-events-auto translate-y-0 opacity-100'
                          : 'pointer-events-none -translate-y-2 opacity-0'
                      }`}
                    >
                      <div className="space-y-3.5">
                        {category.children.map((child) => (
                          <Link
                            key={child.label}
                            to={child.to}
                            onClick={(event) => {
                              if (stopPreviewNavigation(event, true)) return
                              setDesktopSelectedCategory(category.label)
                              setDesktopOpenCategory('')
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                            className="block text-sm font-light text-white/90 transition-colors hover:text-[#f1c6d1]"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <NavLink
              to="/"
              end
              onClick={(event) => {
                if (stopPreviewNavigation(event, true)) return
                setDesktopSelectedCategory('Home')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className={desktopLinkClass}
            >
              {({ isActive }) => (
                <>
                  Home
                  <span
                    className={`absolute inset-x-0 bottom-[0.9rem] h-px origin-center bg-white transition-transform duration-300 ${
                      isActive || desktopSelectedCategory === 'Home' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </>
              )}
            </NavLink>

            <div className="flex h-full min-w-0 items-stretch justify-start gap-5 xl:gap-8">
              {(!customerPreviewLocked
                ? [
                    { label: 'Contact', to: '/contact' },
                    { label: 'Orders', to: '/orders', requiresLogin: true },
                    { label: 'About', to: '/about' },
                    { label: 'Shipping Policy', to: '/shippingpolicy' },
                  ]
                : []
              ).map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  onClick={(event) => {
                    if (stopPreviewNavigation(event)) return
                    if (item.requiresLogin) {
                      handleOrdersNavigation(event)
                      return
                    }
                    setDesktopSelectedCategory(item.label)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className={desktopLinkClass}
                >
                  {({ isActive }) => (
                    <>
                      {item.label === 'Shipping Policy' ? (
                        <>
                          <span className="underline underline-offset-4">Shipping</span> Policy
                        </>
                      ) : (
                        item.label
                      )}
                      <span
                        className={`absolute inset-x-0 bottom-[0.9rem] h-px origin-center bg-white transition-transform duration-300 ${
                          isActive || desktopSelectedCategory === item.label ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      </header>

      <div className={`fixed inset-0 z-[999] ${open ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/55 transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setOpen(false)}
        />
        <aside
          className={`absolute bottom-0 left-0 top-0 flex h-full w-[89vw] max-w-[410px] flex-col overflow-hidden bg-white text-black shadow-[0_24px_70px_rgba(0,0,0,0.28)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-hidden={!open}
        >
          <div className="flex min-h-[122px] items-start border-b border-black px-6 py-5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className={`grid h-14 w-14 place-items-center rounded-full bg-[#f1f1f1] text-black transition-all duration-500 hover:bg-black hover:text-white ${
                open ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-75 opacity-0'
              }`}
            >
              <FiX className="h-8 w-8 stroke-[1.5]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain">
            <nav>
              {[
                { label: 'Home', to: '/', allowed: true },
                ...(!customerPreviewLocked ? [{ label: 'Collection', to: '/collection' }] : []),
              ].map((item, index) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={(event) => handleMobileMenuLink(event, item.allowed)}
                  style={{ transitionDelay: open ? `${80 + index * 45}ms` : '0ms' }}
                  className={`flex min-h-[86px] items-center border-b border-black px-7 text-[1.35rem] font-light uppercase transition-all duration-500 ${
                    open ? 'translate-x-0 opacity-100' : '-translate-x-6 opacity-0'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {menuCategories.map((category, index) => {
                const categoryOpen = openCategory === category.label
                const animationIndex = index + 2

                return (
                  <div
                    key={category.label}
                    style={{ transitionDelay: open ? `${80 + animationIndex * 45}ms` : '0ms' }}
                    className={`border-b border-black transition-all duration-500 ${
                      open ? 'translate-x-0 opacity-100' : '-translate-x-6 opacity-0'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenCategory(categoryOpen ? '' : category.label)}
                      className="flex min-h-[86px] w-full items-center justify-between px-7 text-left text-[1.35rem] font-light uppercase"
                      aria-expanded={categoryOpen}
                    >
                      {category.label}
                      <FiChevronDown
                        className={`h-6 w-6 shrink-0 transition-transform duration-500 ${
                          categoryOpen ? 'rotate-180' : '-rotate-90'
                        }`}
                      />
                    </button>

                    <div
                      className={`grid bg-[#f4f4f4] transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        categoryOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        {category.children.map((child) => (
                          <Link
                            key={child.label}
                            to={child.to}
                            onClick={(event) => handleMobileMenuLink(event, true)}
                            className="flex min-h-[58px] items-center border-t border-black/15 px-9 text-sm font-light uppercase tracking-[0.04em] transition-colors hover:bg-black hover:text-white"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}

              {(!customerPreviewLocked
                ? [
                    { label: 'About', to: '/about' },
                    { label: 'Contact', to: '/contact' },
                    { label: 'Orders', to: '/orders', requiresLogin: true },
                  ]
                : []
              ).map((item, index) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={(event) => {
                    if (stopPreviewNavigation(event)) return
                    if (item.requiresLogin) {
                      setOpen(false)
                      handleOrdersNavigation(event)
                      return
                    }
                    closeMenu()
                  }}
                  style={{ transitionDelay: open ? `${305 + index * 45}ms` : '0ms' }}
                  className={`flex min-h-[86px] items-center border-b border-black px-7 text-[1.35rem] font-light uppercase transition-all duration-500 ${
                    open ? 'translate-x-0 opacity-100' : '-translate-x-6 opacity-0'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="border-b border-black px-7 py-7">
              <LebanonSelector dark={false} />
            </div>

            <div className="flex items-center gap-9 px-7 py-7">
              {brandSocialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-2xl transition-transform duration-300 hover:scale-110"
                >
                  <Icon />
                </a>
              ))}
            </div>

            {token && (
              <div className="px-7 pb-7">
                <button
                  type="button"
                  onClick={logout}
                  className="border-b border-black pb-1 text-sm font-light uppercase tracking-[0.16em]"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  )
}

export default Navbar
