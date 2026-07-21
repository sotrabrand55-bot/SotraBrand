# SotraBrand Progress Notes

Last updated: 2026-07-20

## Core Direction

- SotraBrand is being built from the existing Nancy ecommerce project.
- Keep Nancy's working functionality available for reuse:
  - login/logout
  - admin panel
  - product management
  - categories/subcategories
  - cart drawer
  - checkout/order flow
  - favorites
  - reviews/ratings
  - ImageKit-backed media controls
  - backend APIs
- Do not delete Nancy components/features yet.
- The current work is customer-facing storefront polish first.
- Work mock-first before reconnecting the backend.
- Scandi Beirut is the visual reference for the SotraBrand storefront:
  - clean Shopify-style fashion layout
  - white background
  - simple announcement bars
  - minimal header/navigation
  - large hero image sections
  - simple black buttons
  - collection tile grid
  - minimal footer
- Collection page filters and search should stay available even while matching Scandi.
- Protected Scandi image assets are not copied directly. Current imagery is mock/placeholder and should be replaced later with SotraBrand assets.

## Current Setup

- Frontend mock mode is enabled:
  - `Frontend/.env`
  - `VITE_USE_MOCK_DATA=true`
- Backend calls are paused by the existing mock-mode guards in:
  - `Frontend/src/main.jsx`
  - `Frontend/src/context/ShopContext.jsx`
  - `Frontend/src/App.jsx`
- The existing Nancy backend/admin remain in the repo for later reconnection.

## New Sotra Mock Data

- Replaced the old Nancy perfume mock data with Sotra fashion mock data in:
  - `Frontend/src/lib/mockData.js`
- Current Sotra categories:
  - Blazers
  - Dresses
  - Outerwear
  - Pants
  - Sets
  - Shorts
  - Skirts
  - Tops
- Current Sotra collection labels:
  - SS26
  - FW25
  - SS25
  - FW24
  - SS24
  - FW23
  - SS23
- Current announcement text:
  - `Welcome to our store`
  - `Cash On Delivery`
  - `Free Delivery Over 100$`
- Mock products now use clothing-style data:
  - product names
  - fashion categories
  - collection labels stored in `concentration`
  - sizes `XS`, `S`, `M`, `L`
  - stock values
  - sale/new flags
  - placeholder fashion imagery

## Category/Menu Changes

- Updated:
  - `Frontend/src/lib/subcategoryCatalog.js`
- Nancy perfume menu groups were replaced with Sotra groups:
  - `Shop`
  - `Collections`
- `productMatchesSubcategory` now also checks product collection labels through `product.concentration`.
- Category pages work again because the old Nancy redirect from `/subcategory/...` back to `/` was removed from:
  - `Frontend/src/App.jsx`

## New Storefront Components

- Added:
  - `Frontend/src/componens/SotraNavbar.jsx`
  - `Frontend/src/pages/SotraHome.jsx`
  - `Frontend/src/componens/ScandiFooter.jsx`
- Existing Nancy components remain in the repo for reuse.
- `Frontend/src/componens/SotraFooter.jsx` was created during the first pass but is currently unused. It can be removed later after the Sotra direction is stable.

## App Wiring

- Updated:
  - `Frontend/src/App.jsx`
- Current customer storefront wiring:
  - `SotraNavbar` replaces the visible Nancy navbar.
  - `SotraHome` replaces the visible Nancy homepage.
  - `ScandiFooter` replaces the visible Nancy footer.
  - WhatsApp popup is hidden for this Scandi-style mock pass.
- Kept existing working routes:
  - `/collection`
  - `/Product/:productId`
  - `/favorites`
  - `/ratings`
  - `/login`
  - `/orders`
  - `/place-order`
  - `/cart`
  - `/about`
  - `/contact`
  - `/shippingpolicy`
  - `/terms`
  - `/privacy-policy`
  - `/subcategory/:slug`

## Header / Navbar State

- Header was revised closer to Scandi/Dawn:
  - white background
  - non-sticky
  - three announcement cells
  - simple laptop navigation
  - dropdowns for `Shop` and `Collections`
  - laptop actions show text labels:
    - Search
    - Log in
    - Cart
  - visible header favorite icon was removed from the clone pass, but favorites route/function remains available.
- Mobile keeps a simple drawer menu.
- Shop menu currently shows:
  - Blazers
  - Dresses
  - Outwear
  - Pants
  - Sets
  - Shorts
  - Skirts
  - Tops

## Homepage State

- Current homepage structure matches the Scandi reference flow:
  - hero image
  - title `SS26 Out Now`
  - button `Discover More`
  - sale image
  - title `Shop Sale Pieces`
  - button `On Sale`
  - `Collections` heading
  - collection tile grid
  - footer
- Removed the extra `New In` row from homepage because it was not in the captured Scandi page.

## Footer State

- Added and wired:
  - `Frontend/src/componens/ScandiFooter.jsx`
- Footer currently includes:
  - Exchange Policy
  - Contact Us
  - Privacy Policy
  - About Us
  - Instagram icon/link
  - Payment methods text
  - copyright

## Collection Page

- Updated:
  - `Frontend/src/pages/Collection.jsx`
- Kept filters and search as requested.
- Collection page language was changed from Nancy/perfume to Sotra/fashion:
  - brand text changed to `SotraBrand`
  - description changed to fashion wording
  - filter section formerly called `Concentration` now shows as `Collections`
  - collection filter options are SS/FW labels

## Subcategory Pages

- Rebuilt:
  - `Frontend/src/pages/SubcategoryProducts.jsx`
- Old Nancy detailed advice/review/media layout was replaced with a clean Sotra category grid page.
- Category grid uses the existing `CollectionProductCard`, so cart/favorite/product routing behavior remains available.

## Typography / Styling

- Updated:
  - `Frontend/src/index.css`
  - `Frontend/tailwind.config.js`
- Storefront font moved to:
  - `Assistant`
  - fallback `Arial`
- This is closer to a Shopify/Scandi plain fashion storefront than the older Nancy `Outfit/Poppins/Prata` direction.

## Metadata / Loader

- Updated:
  - `Frontend/index.html`
  - `Frontend/src/componens/NancyPreviewLoader.jsx`
- Browser title and SEO metadata now reference SotraBrand.
- Opening loader text now says SotraBrand.
- Loader file name still includes Nancy for now; rename later after the Sotra direction is stable.

## Verification

- Frontend production build passed after the first Sotra pass.
- Frontend production build passed after the closer Scandi-matching pass.
- Local frontend returned HTTP 200 at:
  - `http://localhost:5173/`

## Known Current State / Next Work

- This is still a mock-first clone/polish pass.
- Deeper pages still need Scandi/Sotra visual polish:
  - product detail
  - login/signup
  - cart drawer
  - checkout
  - orders
  - favorites
  - ratings
  - about/contact/legal pages
- Keep Nancy features available until the user confirms what to migrate, reuse, or remove.
- Later backend reconnection should happen only after the mock Sotra storefront direction is approved.

## Screenshot-Matching Header/Hero Pass

- User supplied mobile screenshots comparing the current Sotra mock against Scandi Beirut.
- Required corrections:
  - announcement bar should be black, one message at a time, with left/right arrows.
  - header should use the Scandi-style centered logo/wordmark.
  - header should use icon-only hamburger/search/bag controls like the screenshots.
  - hero should not show text below the image; text and CTA belong over the image.
  - hero/header media should be limited to 3 pictures and switch smoothly.
  - keep the Nancy fade behavior idea for the image switching.
- Updated:
  - `Frontend/src/componens/SotraNavbar.jsx`
  - `Frontend/src/pages/SotraHome.jsx`
  - `Frontend/src/lib/mockData.js`
  - `Frontend/src/index.css`
- Header changes:
  - replaced white stacked announcement rows with a black rotating announcement carousel.
  - announcement messages are capped visually to the first 3 messages.
  - added left/right arrow controls.
  - centered wordmark now visually matches Scandi style:
    - large serif `Scandi`
    - small `Beirut`
    - thin side lines.
  - mobile/laptop header actions now use icon-style search and shopping bag.
  - hamburger icon size/stroke adjusted closer to reference.
- Hero changes:
  - added `sotraHeroSlides` with exactly 3 mock slides.
  - homepage now uses one smooth fading hero carousel instead of separate stacked hero/sale image sections.
  - hero text and CTA are overlaid on the image:
    - `SS26 Out Now`
    - `Shop Sale Pieces`
    - `New Season Edit`
  - CTA uses the Scandi-style large rounded white button with dark border.
  - image fade duration set to 1400ms.
- Collections changes:
  - Collections heading is now left-aligned and serif like the screenshot.
  - collection tiles are wider landscape cards instead of tall portrait cards.
  - `Outerwear` displays as `Outwear` in the visible clone UI to match the screenshot spelling.
- Verification passed after this checkpoint:
  - Frontend production build.

## Hero Height And Header Micro-Animations

- User liked the previous changes and requested:
  - make the hero picture taller again.
  - add smoother animation for announcement messages such as `Cash On Delivery` and `Welcome to our store`.
  - add click animation for the menu icon.
  - add click animation for the search icon.
- Updated:
  - `Frontend/src/pages/SotraHome.jsx`
  - `Frontend/src/componens/SotraNavbar.jsx`
  - `Frontend/src/index.css`
- Hero changes:
  - mobile hero height increased from `410px` to `475px`.
  - tablet/desktop hero height also slightly increased.
- Announcement animation changes:
  - announcement message now uses a keyed `sotra-announcement-message` animation.
  - message enters smoothly with opacity/vertical movement.
  - still renders only one current message, so the previous overlap issue stays fixed.
- Menu/search interaction changes:
  - menu icon now plays a rotate/scale click animation before opening the drawer.
  - search icon now plays a scale/rotate click animation when clicked.
  - search still routes to `/collection` and opens the existing search UI.
- Verification passed after this checkpoint:
  - Frontend production build.

## Additional 100% Mobile Zoom-Out Tuning

- User confirmed the direction but requested the 100% mobile view to feel a little more zoomed out like Scandi.
- Updated:
  - `Frontend/src/componens/SotraNavbar.jsx`
  - `Frontend/src/pages/SotraHome.jsx`
- Header scale adjustments:
  - mobile announcement bar reduced from `45px` to `42px`.
  - mobile announcement text reduced from `17px` to `16px`.
  - mobile wordmark reduced.
  - mobile Beirut subtitle/line marks reduced.
  - mobile header vertical padding reduced slightly.
  - mobile hamburger/search/bag icons reduced slightly.
- Hero scale adjustments:
  - mobile hero height tuned from `475px` to `450px`, still taller than the earlier `410px`.
  - mobile hero title reduced from `43px` to `37px`.
  - mobile CTA reduced from `184px` min width / `22px` text to `170px` min width / `20px` text.
  - hero overlay content moved slightly lower with `top-[51%]`.
  - Collections section top spacing reduced slightly.
- Verification passed after this checkpoint:
  - Frontend production build.

## Collections Tile Matching Pass

- User supplied Scandi Collections screenshot and requested:
  - smaller announcement font for `Cash On Delivery`.
  - Collections section should match Scandi more closely.
  - collection item font size/style should match Scandi.
- Updated:
  - `Frontend/src/componens/SotraNavbar.jsx`
  - `Frontend/src/pages/SotraHome.jsx`
- Announcement changes:
  - mobile announcement font reduced from `16px` to `14px`.
  - tracking adjusted slightly to keep the Scandi serif feel.
- Collections changes:
  - Collections heading reduced from `46px` to `42px` on mobile.
  - collection cards changed from wide landscape to more square/tall image cards using `aspect-[1/0.96]`.
  - item labels changed from centered underlined text to left-aligned serif labels with arrow:
    - `Blazers →`
    - `Dresses →`
    - `Outwear →`
    - `Pants →`
  - item label mobile size increased to `28px`, matching the visual weight in the screenshot better.
  - grid spacing tightened to match the screenshot density.
- Verification passed after this checkpoint:
  - Frontend production build.

## Collections Scale Correction

- User showed the current Collections section still did not match Scandi:
  - heading was too large.
  - labels were too large.
  - cards were too square/tall and looked zoomed in.
  - one Pants image was broken.
- Updated:
  - `Frontend/src/pages/SotraHome.jsx`
  - `Frontend/src/lib/mockData.js`
- Collection image/source changes:
  - replaced several placeholder Unsplash IDs with more stable fashion image IDs.
  - replaced the broken Pants image source.
- Collections layout changes:
  - mobile Collections heading reduced from `42px` to `36px`.
  - mobile collection label reduced from `28px` to `22px`.
  - arrow size reduced from `30px` to `24px`.
  - cards changed back toward Scandi landscape proportion with `aspect-[1.45/1]`.
  - top gap reduced from `mt-9` to `mt-8`.
  - column gap tightened to `gap-x-1.5`.
- Verification passed after this checkpoint:
  - Frontend production build.

## Collections Final Size Tuning

- User approved the proposed Scandi-like collection adjustments.
- Updated:
  - `Frontend/src/pages/SotraHome.jsx`
- Applied values:
  - Collections heading mobile size `36px` to `34px`.
  - collection card aspect `1.45/1` to `1.28/1`.
  - collection label mobile size `22px` to `20px`.
  - label/arrow gap `gap-2` to `gap-1.5`.
  - grid top margin `mt-8` to `mt-7`.
  - row gap `gap-y-8` to `gap-y-6`.
- Verification passed after this checkpoint:
  - Frontend production build.

## Sticky Navbar And Logo Shrink

- User requested:
  - navbar should be sticky while scrolling.
  - logo should smoothly become a little smaller after scrolling down.
  - logo should return to original size when back at the top.
- Updated:
  - `Frontend/src/componens/SotraNavbar.jsx`
- Changes:
  - header changed from `relative` to `sticky top-0 z-50`.
  - added `scrolled` state using `window.scrollY > 20`.
  - logo component now accepts `compact`.
  - Scandi wordmark, Beirut subtitle, and side lines shrink smoothly in compact mode.
  - navbar vertical padding also reduces slightly when scrolled.
  - transitions use `duration-300 ease-out`.
- Verification passed after this checkpoint:
  - Frontend production build.

## Sticky White Header Only

- User clarified:
  - the header should remain fixed while scrolling.
  - the black announcement bar should not stay fixed; it should scroll away.
  - only the white logo/nav row should stay visible.
- Updated:
  - `Frontend/src/componens/SotraNavbar.jsx`
- Changes:
  - removed `sticky` from the outer `<header>`.
  - kept the black announcement bar inside the normal page flow.
  - moved `sticky top-0 z-50` to the white nav/logo row only.
  - logo shrink behavior remains based on scroll state.
  - white nav row keeps subtle bottom shadow/border while sticky.
- Verification passed after this checkpoint:
  - Frontend production build.

## Mobile 100% Zoom Correction

- User supplied new screenshots showing:
  - Scandi at mobile 100% zoom.
  - Sotra mock at mobile 100% zoom.
  - Sotra looked acceptable around 80% but too large/tall at 100%.
  - announcement text overlapped/wrapped during transition.
  - hero image fade was acceptable, but title/button needed to fade at the same time as the image.
- Updated:
  - `Frontend/src/componens/SotraNavbar.jsx`
  - `Frontend/src/pages/SotraHome.jsx`
- Header/announcement fixes:
  - mobile announcement bar height reduced from `72px` to `45px`.
  - announcement center column now renders only the current message, not three fading absolute messages, preventing overlap.
  - announcement text is forced to stay on one line with `whitespace-nowrap`.
  - mobile header vertical padding reduced.
  - mobile logo size reduced.
  - mobile hamburger/search/bag icon sizes reduced.
- Hero fixes:
  - mobile hero height reduced from `560px` to `410px` so Collections appears at 100% zoom more like Scandi.
  - each hero slide now contains its image, overlay, title, and button inside one fading layer.
  - title/button now fade at the exact same time as the image.
  - hidden slides have `pointer-events-none`, so only the visible slide CTA can be clicked.
  - mobile hero title and CTA button sizes reduced to better match Scandi at 100% zoom.
- Verification passed after this checkpoint:
  - Frontend production build.

## Full-Page Sticky White Header

- User reported:
  - the white navbar row was not staying visible when scrolling down.
- Updated:
  - `Frontend/src/componens/SotraNavbar.jsx`
- Changes:
  - split the black announcement bar and white logo/nav row into separate sibling elements.
  - black announcement bar remains in normal flow and scrolls away.
  - white logo/nav row is now the actual `sticky top-0` element, so it stays visible for the full page scroll.
  - existing logo shrink animation remains tied to scroll state.
- Verification passed after this checkpoint:
  - Frontend production build.

## Scandi-Style Fixed White Header

- User clarified with Scandi collection screenshot:
  - after scrolling down, the white logo/nav row must still be visible at the top of the screen.
- Updated:
  - `Frontend/src/componens/SotraNavbar.jsx`
- Changes:
  - changed the white logo/nav row from `sticky` to `fixed` for stronger Scandi-style behavior.
  - added measured top offset so the white row starts below the black announcement bar at page top.
  - as the page scrolls, the offset reduces until the white row locks to `top: 0`.
  - added a measured spacer so page content still starts below the fixed white nav.
  - kept the black announcement row in normal flow so it scrolls away.
  - kept the logo shrink animation while scrolling.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/collection` route returned 200.

## Scandi Header Icon Tuning

- User supplied comparison screenshots showing:
  - the fixed white header behavior is now correct.
  - mobile header icons and logo still needed slightly smaller Scandi-style proportions.
- Updated:
  - `Frontend/src/componens/SotraNavbar.jsx`
- Changes:
  - reduced mobile hamburger, search, and bag icon sizes.
  - reduced mobile icon button boxes and tightened action spacing.
  - softened mobile icon stroke width.
  - reduced mobile Scandi wordmark and Beirut subtitle slightly while keeping desktop sizing unchanged.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local homepage returned 200.

## Scandi Collection Image Proportions

- User supplied comparison screenshots showing:
  - Sotra collection images were shorter landscape tiles.
  - Scandi collection images are close to square and taller on mobile.
- Updated:
  - `Frontend/src/pages/SotraHome.jsx`
- Changes:
  - changed homepage collection category tiles from `aspect-[1.28/1]` to `aspect-square`.
  - keeps the same two-column Scandi-style mobile grid while increasing image height.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local homepage returned 200.

## Scandi Collection Mobile Width

- User supplied screenshot showing:
  - collection tiles still had larger left/right margins than Scandi.
- Updated:
  - `Frontend/src/pages/SotraHome.jsx`
- Changes:
  - reduced mobile Collections section horizontal padding from `px-6` to `px-4`.
  - kept tablet and desktop spacing unchanged.
  - collection tiles now render wider on mobile, closer to Scandi.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local homepage returned 200.

## Scandi Collection Text Size Tuning

- User requested:
  - make the Collections title a little smaller.
  - make category words like Blazers, Dresses, and Outwear a little smaller.
- Updated:
  - `Frontend/src/pages/SotraHome.jsx`
- Changes:
  - reduced mobile Collections heading from `34px` to `31px`.
  - reduced mobile category label text from `20px` to `18px`.
  - reduced mobile arrow size from `24px` to `22px`.
  - tablet and desktop text sizes remain unchanged.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local homepage returned 200.

## Hero Starts Below Fixed White Navbar

- User reported:
  - the hero/header image looked like it started inside or behind the white navbar.
- Updated:
  - `Frontend/src/componens/SotraNavbar.jsx`
- Changes:
  - added a fallback reserved navbar height so content is not placed under the fixed white row during first render.
  - added `ResizeObserver` tracking for the announcement row and white navbar row.
  - re-measures after web fonts finish loading, preventing the logo/font height from leaving the spacer too small.
  - hero content now starts after the white navbar instead of being covered by it.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local homepage returned 200.

## Persistent Menu Icon Rotation

- User requested:
  - when clicking the menu icon, it should smoothly stay vertical.
  - when closing/unclicking, it should return to normal.
- Updated:
  - `Frontend/src/componens/SotraNavbar.jsx`
- Changes:
  - replaced the temporary one-shot hamburger animation with a menu open-state animation.
  - hamburger now rotates to `90deg` while the menu is open.
  - hamburger rotates back to normal when the menu is closed.
  - added `aria-expanded` and dynamic open/close label on the menu button.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local homepage returned 200.

## Scandi Mobile Menu And WhatsApp Popup

- User requested:
  - only the menu panel should scroll while the menu is open.
  - tapping the website/backdrop side should close the menu.
  - mobile menu should look closer to Scandi.
  - remove the seasonal SS26/FW25-style entries from the mobile menu.
  - add category links like Pants, Sets, Shorts, Skirts, and Tops.
  - add Collections, On Sale, Shop The Look, About, Contact Us, and bottom login.
  - add Instagram, TikTok, and WhatsApp icons.
  - add a Nancy-style popup, but branded Scandi and saying `Contact Us On WhatsApp`.
- Updated:
  - `Frontend/src/componens/SotraNavbar.jsx`
  - `Frontend/src/componens/SotraWhatsAppPopup.jsx`
  - `Frontend/src/App.jsx`
  - `Frontend/src/lib/mockData.js`
- Changes:
  - mobile drawer now uses a Scandi-style top bar with close, logo, search, and bag.
  - menu body has internal scrolling with page/body scroll locked.
  - backdrop remains clickable and closes the drawer.
  - Shop expands to show category links from mock category tiles.
  - Collections links directly to the collection page.
  - On Sale, Shop The Look, About, and Contact Us are top-level mobile menu links.
  - bottom panel includes Log in plus Instagram, TikTok, and WhatsApp icons.
  - added Sotra/Scandi WhatsApp popup with Scandi wordmark and WhatsApp CTA.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local homepage returned 200.

## Global Saira Extra Condensed Font

- User requested:
  - apply `Saira Extra Condensed` font family to literally everything.
- Updated:
  - `Frontend/src/index.css`
  - `Frontend/tailwind.config.js`
  - `Frontend/src/componens/ComingSoon.jsx`
- Changes:
  - replaced Google font import with `Saira Extra Condensed`.
  - mapped both Tailwind `font-serif` and `font-sans` to `Saira Extra Condensed`.
  - added a global base font override for all elements and form controls.
  - replaced hard-coded inline Coming Soon fonts with `Saira Extra Condensed`.
  - removed old Prata/Assistant font usage.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local homepage returned 200.

## Fashion Font Revision

- User requested:
  - replace `Saira Extra Condensed` because the style did not feel right.
  - choose a better recommended font for fashion clothing.
- Decision:
  - selected `Cormorant Garamond` for an editorial boutique fashion feel closer to Scandi.
- Updated:
  - `Frontend/src/index.css`
  - `Frontend/tailwind.config.js`
  - `Frontend/src/componens/ComingSoon.jsx`
- Changes:
  - replaced Google font import with `Cormorant Garamond`.
  - mapped Tailwind `font-serif` and `font-sans` to `Cormorant Garamond`.
  - updated the global font override for all elements and form controls.
  - replaced inline Coming Soon font styles with `Cormorant Garamond`.
  - confirmed old Saira/Prata/Assistant font references are removed.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local homepage returned 200.

## Removed Collections From Filter UI

- User requested:
  - remove `Collections` from the filter panel.
- Updated:
  - `Frontend/src/pages/Collection.jsx`
- Changes:
  - removed the top-level `Collections` category group from rendered filter categories.
  - removed the seasonal `Collections` filter section with SS26/FW25/SS25 options.
  - kept collection URL/query filtering support intact for links from homepage/menu.
  - kept Special and Availability filters unchanged.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/collection` route returned 200.

## Category Pages Filter And Sort Row

- User requested:
  - category pages like Dresses should show `Filter and sort`.
  - category pages should show how many products exist.
  - apply this to each existing category page.
- Updated:
  - `Frontend/src/pages/SubcategoryProducts.jsx`
- Changes:
  - added Scandi-style category header and control row.
  - added `Filter and sort` button with slider icon.
  - added visible product count on each category page.
  - added sort options: newest, price low to high, price high to low.
  - added Special filters: New Arrival and On Sale.
  - added Availability filters: In Stock, Low Stock, Out of Stock.
  - added empty-state behavior for categories with no matching products.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/subcategory/dresses` route returned 200.
  - Local `/subcategory/pants` route returned 200.

## Category Page Scandi Refinement And No Favorites

- User reported:
  - category page still did not look close enough to Scandi.
  - add-to-favorites/heart is not included in this project and should be removed.
- Updated:
  - `Frontend/src/pages/SubcategoryProducts.jsx`
  - `Frontend/src/componens/CollectionProductCard.jsx`
- Changes:
  - removed heart/favorites button from collection/category product cards.
  - removed favorite context usage from the Scandi product card.
  - tightened category page top spacing.
  - adjusted category title size and line-height.
  - adjusted `Filter and sort` row sizing, separator, icon size, and product count alignment.
  - tightened mobile product grid horizontal spacing.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/subcategory/blazers` route returned 200.
  - Local `/collection` route returned 200.

## Product Card Image Ratio Match

- User supplied Scandi comparison screenshot showing:
  - Sotra product card images were too short/wide.
  - Scandi product photos use taller portrait cards.
- Updated:
  - `Frontend/src/componens/CollectionProductCard.jsx`
  - `Frontend/src/componens/Skeletons.jsx`
- Changes:
  - changed Scandi product card image frame from `aspect-[3/4]` to `aspect-[4/5]`.
  - changed product image rendering from `object-contain` to `object-cover object-center`.
  - updated collection grid skeleton cards to the same `aspect-[4/5]` ratio.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/subcategory/blazers` route returned 200.
  - Local `/collection` route returned 200.

## Expanded Mock Product Catalog

- User requested:
  - add more products for each category.
- Updated:
  - `Frontend/src/lib/mockData.js`
- Changes:
  - expanded mock fashion catalog from a small seed list to 8 products per category.
  - categories now include fuller mock product sets for Blazers, Dresses, Outerwear, Pants, Sets, Shorts, Skirts, and Tops.
  - total mock catalog now contains 64 products.
  - added more product names, prices, sale prices, collections, and mock fashion imagery.
  - kept this mock-data only; backend behavior remains untouched.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/subcategory/blazers` route returned 200.
  - Local `/subcategory/dresses` route returned 200.
  - Local `/subcategory/skirts` route returned 200.

## Removed Review Sections

- User requested:
  - remove review sections from all projects.
- Updated:
  - `Backend/models/productModel.js`
  - `Backend/routes/productRoute.js`
  - `Backend/controllers/productController.js`
  - `Backend/scripts/seedNancyMockData.js`
  - `Frontend/src/componens/CollectionProductCard.jsx`
  - `Frontend/src/componens/FeaturedProducts.jsx`
  - `Frontend/src/componens/SubcategoryProductResults.jsx`
  - `Frontend/src/componens/Footer.jsx`
  - `Frontend/src/componens/Navbar.jsx`
  - `Frontend/src/App.jsx`
  - `Frontend/src/lib/mockData.js`
- Removed:
  - star/review count UI from collection and category product cards.
  - review modal wiring from product cards and featured product details.
  - product detail social-proof review block.
  - `/ratings` route and ratings navigation links.
  - footer `Total Reviews` sections.
  - mock `rating` and `reviewCount` fields.
  - unused review page and review panel files.
  - backend product review schema fields.
  - backend `/api/product/:id/reviews` route and controller handler.
  - Nancy seed rating/review count fields.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Review-specific source scan returned no app/backend code matches, only progress notes.
  - Backend changed files passed `node --check`.
  - Local `/subcategory/blazers` route returned 200.
  - Local `/collection` route returned 200.
  - Local `/Product/sotra-blazers-1` route returned 200.

## Sotra Product Icons And Category Labels

- User requested:
  - add small product icon images like the previous Nancy product options.
  - update product categories so category/product pages match real categories like Dresses instead of showing season labels such as SS25.
- Updated:
  - `Frontend/src/lib/mockData.js`
  - `Frontend/src/componens/CollectionProductCard.jsx`
  - `Frontend/src/componens/SubcategoryProductResults.jsx`
  - `Frontend/src/componens/FeaturedProducts.jsx`
  - `Frontend/src/lib/subcategoryCatalog.js`
  - `Frontend/src/pages/Collection.jsx`
- Changes:
  - added 3 mock `shadeOptions` image icons for every Sotra mock product.
  - added `brand` and `collection` fields to Sotra mock products.
  - kept `concentration` as the hidden/query season value for collection filtering.
  - stopped displaying season labels as product option/type metadata.
  - product cards now show `SOTRA BRAND` instead of `SS25` / `SS26`.
  - category page matching now uses product `category` and `subCategory`, not season collection values.
  - collection page quick filter row now excludes the `Collections` season group.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/collection` route returned 200.
  - Local `/subcategory/dresses` route returned 200.
  - Local `/Product/sotra-dresses-1` route returned 200.

## Small Product Icon Click Behavior

- User reported:
  - small product images were visible but did not work like Nancy when clicked.
- Updated:
  - `Frontend/src/componens/CollectionProductCard.jsx`
  - `Frontend/src/componens/SubcategoryProductResults.jsx`
  - `Frontend/src/componens/FeaturedProducts.jsx`
- Changes:
  - converted small product thumbnails on collection cards from static icons to clickable image selectors.
  - added selected-ring styling for the active small image.
  - clicking a small icon now updates the main product card image.
  - fixed product detail shade-image mapping so clicking a small option jumps to the matching gallery image.
  - kept duplicate image filtering, but now shade images keep their selector IDs before standalone gallery images are deduplicated.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/collection` route returned 200.
  - Local `/subcategory/dresses` route returned 200.
  - Local `/Product/sotra-dresses-1` route returned 200.

## Small Product Icon Progress Bar Smoothness

- User reported:
  - the small-image progress bar could move twice or feel stuck when switching between product option images.
- Updated:
  - `Frontend/src/componens/FeaturedProducts.jsx`
  - `Frontend/src/index.css`
- Changes:
  - changed product option selection from nullable toggle state to a stable active image index.
  - clicking the already-selected small image now keeps the current selection instead of jumping back to the first image.
  - product changes reset the active option and gallery target consistently.
  - progress bar now uses `translate3d` and a smoother cubic-bezier transition.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/Product/sotra-dresses-1` route returned 200.
  - Local `/collection` route returned 200.

## Main Product Progress Bar Match

- User requested:
  - remove the progress bar under the small product images.
  - make the bar under the main product/gallery image move with the same smooth behavior.
- Updated:
  - `Frontend/src/componens/FeaturedProducts.jsx`
  - `Frontend/src/index.css`
- Changes:
  - removed the small-image option progress bar from the product details controls.
  - removed unused small-image progress CSS.
  - updated the main product image/gallery progress bar to use `translate3d`.
  - applied the same smooth cubic-bezier transition to the main product image/gallery bar.
  - ignored intermediate scroll events during programmatic small-image switching so the bar moves once per click.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/Product/sotra-dresses-1` route returned 200.
  - Local `/collection` route returned 200.

## Product Descriptions And Color Label

- User requested:
  - add bigger descriptions for each product.
  - keep the description behavior close to Nancy.
  - add `Choose A Color` before the small product image icons.
- Updated:
  - `Frontend/src/lib/mockData.js`
  - `Frontend/src/componens/FeaturedProducts.jsx`
- Changes:
  - added category-specific long mock descriptions for every Sotra product.
  - added detailed option descriptions for each small color/image option.
  - changed option labels from generic product numbers to color names: Black, Ivory, Sand.
  - changed the product detail selector label to `Choose A Color`.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/Product/sotra-dresses-1` route returned 200.
  - Local `/subcategory/dresses` route returned 200.
  - Local `/collection` route returned 200.

## Product Color Label Placement

- User requested:
  - move `Choose A Color` after the shipping calculated at checkout line.
- Updated:
  - `Frontend/src/componens/FeaturedProducts.jsx`
- Changes:
  - moved the color selector label directly below the shipping checkout note.
  - kept the small color image icons below the product description area.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/Product/sotra-dresses-1` route returned 200.

## Product Color Icons Placement

- User requested:
  - move the small color image icons directly under `Choose A Color`.
- Updated:
  - `Frontend/src/componens/FeaturedProducts.jsx`
- Changes:
  - moved the small color/image selector block directly below the `Choose A Color` label.
  - kept the product description below the color selector area.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/Product/sotra-dresses-1` route returned 200.

## Selected Color Sent To Orders

- User requested:
  - customer should choose one of the small product images as the color.
  - selected color and its image should be sent with the order.
  - admin/owner should see which color and picture were chosen.
- Updated:
  - `Frontend/src/pages/Placeorder.jsx`
  - `Frontend/src/componens/CartDrawer.jsx`
  - `Backend/controllers/orderController.js`
  - `Backend/controllers/notifyController.js`
  - `Admin/src/pages/Orders.jsx`
- Changes:
  - checkout now resolves selected cart color against product `shadeOptions`.
  - order items now include `colorLabel`, `colorImage`, `selectedColor`, and `selectedColorImage`.
  - checkout/cart preview images use the selected color image when available.
  - backend validates selected color against product shade options.
  - backend saves selected color label/image on each order item.
  - admin order list and detail views display selected color text and selected color image.
  - order notification email displays selected color and selected color thumbnail.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Admin production build.
  - Backend `orderController.js` syntax check.
  - Backend `notifyController.js` syntax check.
  - Local `/Product/sotra-dresses-1` route returned 200.
  - Local `/place-order` route returned 200.
  - Local `/collection` route returned 200.

## Category Page Header And Filter Sizing

- User requested:
  - center the category title such as `Dresses`.
  - apply the same behavior to all categories.
  - make the filter row much smaller.
  - keep filter on the left and product count on the right.
  - let product cards use the available right-side width cleanly.
- Updated:
  - `Frontend/src/pages/SubcategoryProducts.jsx`
  - `Frontend/src/componens/CollectionProductCard.jsx`
- Changes:
  - centered subcategory page titles.
  - reduced mobile category title size slightly.
  - reduced filter row vertical padding.
  - reduced filter icon, label, and product count typography.
  - tightened mobile product card title, price, and small image icon sizing.
  - adjusted product grid horizontal gaps for a cleaner two-column mobile layout.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/subcategory/dresses` route returned 200.
  - Local `/subcategory/blazers` route returned 200.

## Collection Page Quick Filter Label

- User requested:
  - remove the separate `All Products` quick filter chip.
  - keep all products showing automatically by default.
  - replace the visible `Collections`/category group label with `All Products`.
- Updated:
  - `Frontend/src/pages/Collection.jsx`
- Changes:
  - removed the standalone `All Products` chip from the collection page hero.
  - relabeled the `Shop` quick filter chip to `All Products`.
  - clicking the relabeled `All Products` chip clears filters and returns to the full product list.
  - default collection page behavior still shows all products automatically.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/collection` route returned 200.

## Outside Product Card Simplification

- User requested:
  - remove the small image selectors from category and collection product cards.
  - remove outside add-to-cart buttons from category and collection product cards.
  - keep product selection behavior inside the product details page.
- Updated:
  - `Frontend/src/componens/CollectionProductCard.jsx`
  - `Frontend/src/componens/SubcategoryProductResults.jsx`
- Changes:
  - removed outside small color/image thumbnail selectors from collection/category cards.
  - removed outside quick add-to-cart floating buttons from collection/category cards.
  - product cards now act as view-only cards that open the product detail page.
  - kept size/stock/brand metadata visible on cards.
  - preserved product-detail color selection and add-to-cart behavior.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Outside card quick-add/thumbnail scan returned no matches.
  - Local `/collection` route returned 200.
  - Local `/subcategory/dresses` route returned 200.

## Collection Hero Cleanup

- User requested:
  - remove the remaining `All Products` button from the collection page hero.
  - remove the subtitle `Discover the latest SotraBrand pieces, sale edits, and collection drops.`
- Updated:
  - `Frontend/src/pages/Collection.jsx`
- Changes:
  - removed the hero quick filter button row.
  - removed the collection hero subtitle.
  - removed the now-unused `chooseFamily` helper.
  - kept the collection page default behavior showing all products automatically.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/collection` route returned 200.
  - Source scan confirmed the removed subtitle and `chooseFamily` helper are gone.

## Collection Title And Search Placement

- User requested:
  - name the collection page `All Products`.
  - make the search bar open smoothly on the collection page.
  - show the search bar under the mobile `Filters` and `Newest` row.
- Updated:
  - `Frontend/src/pages/Collection.jsx`
  - `Frontend/src/componens/SearchBar.jsx`
- Changes:
  - changed the collection hero title from `The Collection` to `All Products`.
  - removed search from the hero area.
  - placed search below the mobile filter/sort row and below the desktop product sort row.
  - added smooth height, opacity, and vertical motion for opening/closing search.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/collection` route returned 200.

## Custom Mobile Sort Menu

- User requested:
  - improve the mobile sort dropdown shown on the collection page.
- Updated:
  - `Frontend/src/pages/Collection.jsx`
- Changes:
  - replaced the Android/browser native sort dropdown with a custom Sotra/Scandi-style white sort panel.
  - added smooth open/close motion for the sort menu.
  - added selected-state radio styling and outside-tap close behavior.
  - kept desktop sorting behavior unchanged.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/collection` route returned 200.

## Bold Price Typography

- User requested:
  - make prices bold.
- Updated:
  - `Frontend/src/componens/CollectionProductCard.jsx`
  - `Frontend/src/componens/SubcategoryProductResults.jsx`
  - `Frontend/src/componens/FeaturedProducts.jsx`
  - `Frontend/src/componens/CartDrawer.jsx`
  - `Frontend/src/pages/Placeorder.jsx`
- Changes:
  - made active product prices bold on collection/category cards.
  - made product-detail prices bold.
  - made cart item, suggested item, subtotal, checkout item, subtotal, delivery, discount, and total prices bold.
  - kept crossed-out original prices lighter for sale contrast.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/collection` route returned 200.
  - Local `/Product/sotra-dresses-1` route returned 200.

## Price Font And Discount Clarity

- User requested:
  - make discount pricing clearer.
  - use a recommended price font for fashion clothing.
- Updated:
  - `Frontend/src/index.css`
  - `Frontend/src/componens/CollectionProductCard.jsx`
  - `Frontend/src/componens/SubcategoryProductResults.jsx`
  - `Frontend/src/componens/FeaturedProducts.jsx`
  - `Frontend/src/componens/CartDrawer.jsx`
  - `Frontend/src/pages/Placeorder.jsx`
  - `Frontend/src/pages/Orders.jsx`
  - `Frontend/src/componens/ProductItem.jsx`
  - `Admin/src/index.css`
  - `Admin/src/pages/Orders.jsx`
  - `Admin/src/pages/ProductsList.jsx`
  - `Admin/src/components/NancyProductLivePreview.jsx`
- Changes:
  - added `Inter Tight` as the dedicated price font.
  - added shared `sotra-price`, `sotra-sale-price`, and `sotra-old-price` classes.
  - applied the price font to storefront product cards, product detail prices, cart prices, checkout prices, and order totals.
  - applied the same price treatment to admin product/order price displays.
  - made sale prices heavier and original crossed-out prices clearer with stronger line-through styling.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Admin production build.
  - Local `/collection` route returned 200.
  - Local `/Product/sotra-dresses-1` route returned 200.
  - Local `/place-order` route returned 200.

## Scandi Product Grid And Price Matching

- User requested:
  - make prices use the same style/family as Scandi.
  - make collection/category product images taller.
  - reduce the left/right and center spacing differences in the mobile product grid.
- Updated:
  - `Frontend/src/index.css`
  - `Frontend/src/componens/CollectionProductCard.jsx`
  - `Frontend/src/componens/SubcategoryProductResults.jsx`
  - `Frontend/src/pages/Collection.jsx`
  - `Frontend/src/pages/SubcategoryProducts.jsx`
  - `Admin/src/index.css`
- Changes:
  - changed `sotra-price` and `sotra-old-price` from `Inter Tight` back to the Scandi-style serif family.
  - made product card pricing stack like Scandi: crossed-out original price above, current price below.
  - changed storefront product image cards to a taller `2 / 3` aspect ratio.
  - tightened the mobile two-column grid gap to better match Scandi spacing.
  - kept a subtle `5px` image corner radius matching the Scandi product cards.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Admin production build.
  - Local `/collection` route returned 200.
  - Local `/subcategory/dresses` route returned 200.
  - Local `/Product/sotra-dresses-1` route returned 200.

## Empty Cart Account Prompt

- User requested:
  - add the Scandi-style empty cart idea: `Have an account? Log in to check out faster.`
- Updated:
  - `Frontend/src/componens/CartDrawer.jsx`
  - `Frontend/src/pages/Placeorder.jsx`
- Changes:
  - added a Scandi-style empty cart prompt below `Continue shopping`.
  - linked `Log in` to `/login?mode=login`.
  - hides the prompt when the customer is already logged in.
  - added the same account prompt to the checkout empty-cart summary.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/cart` route returned 200.
  - Local `/place-order` route returned 200.
  - Local `/login?mode=login` route returned 200.

## Checkout SotraBrand Copy Cleanup

- User requested:
  - remove remaining Nancy/RadiantByNancy wording from the proceed-to-checkout page.
- Updated:
  - `Frontend/src/pages/Placeorder.jsx`
  - `Frontend/src/componens/CartDrawer.jsx`
- Changes:
  - changed checkout eyebrow from `Be Radiant By Nancy` to `SotraBrand`.
  - changed checkout intro copy from radiance wording to SotraBrand pieces wording.
  - changed order note placeholder from Nancy wording to SotraBrand wording.
  - changed Wish Money payment helper labels from Nancy to SotraBrand.
  - renamed the saved order-note key to `sotra_order_note` while still reading the old `nancy_order_note` key for existing customers.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/place-order` route returned 200.
  - Local `/cart` route returned 200.
  - Source scan confirmed no customer-visible Nancy/Radiant text remains in checkout/cart files.

## Contact SotraBrand Copy Cleanup

- User requested:
  - fix Contact Us so it is named by SotraBrand, not Stora/Nancy/Radiant.
- Updated:
  - `Frontend/src/pages/Contact.jsx`
  - `Frontend/src/componens/Footer.jsx`
  - `Backend/controllers/contactController.js`
  - `Backend/controllers/pageImagesController.js`
  - `Backend/models/pageImagesModel.js`
  - `Admin/src/pages/PageImagesManager.jsx`
- Changes:
  - changed contact page eyebrow to `SotraBrand`.
  - changed contact image alt fallback to `SotraBrand contact`.
  - removed hardcoded Nancy email/social labels from the contact page.
  - changed contact form email subject/header to SotraBrand in the backend.
  - changed footer contact/social fallback text from Be Radiant/Nancy to SotraBrand.
  - changed backend/admin page image alt defaults to SotraBrand.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Admin production build.
  - Backend contact/page-image syntax checks.
  - Local `/contact` route returned 200.
  - Focused source scan found no old Nancy/Radiant contact text in updated contact files.

## Login And Account SotraBrand Branding

- User requested:
  - rename sign-in and create-account screens to SotraBrand.
- Updated:
  - `Frontend/src/pages/Login.jsx`
  - `Admin/src/components/Login.jsx`
- Changes:
  - changed customer login/signup toast messages to SotraBrand.
  - changed customer signed-in screen eyebrow to `SotraBrand Account`.
  - changed customer login side-panel mark from `R` to `S`.
  - changed `Be Radiant Account`, `Join Nancy`, and ritual/favorites wording to SotraBrand account/order wording.
  - changed admin login branding from Be Radiant/Nancy to SotraBrand.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Admin production build.
  - Local `/login?mode=login` route returned 200.
  - Local `/login?mode=signup` route returned 200.
  - Focused auth source scan found no old Nancy/Radiant text in the updated auth files.

## Shipping Policy Footer Link And Branding

- User requested:
  - add the shipping page to the footer named `Shipping Policy`.
- Updated:
  - `Frontend/src/componens/ScandiFooter.jsx`
  - `Frontend/src/componens/ShippingPolicy.jsx`
- Changes:
  - added `Shipping Policy` link to the Scandi footer.
  - changed shipping page title from `Shipping Info` to `Shipping Policy`.
  - changed shipping page brand/copy from Be Radiant/Nancy to SotraBrand.
  - changed shipping page social fallback links/labels to SotraBrand.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/shippingpolicy` route returned 200.
  - Local `/` route returned 200.
  - Focused shipping/footer scan confirmed no old customer-visible Nancy/Radiant shipping text remains.

## Related Products Card Matching

- User requested:
  - fix the `You May Also Like` products so they match the rest of the product cards.
- Updated:
  - `Frontend/src/componens/RelatedProducts.jsx`
  - `Frontend/src/pages/Product.jsx`
- Changes:
  - replaced the old `ProductItem` related-product card with `CollectionProductCard`.
  - related products now use the same image ratio, price styling, sale labels, stock text, sizes, and grid spacing as collection/category products.
  - tightened the related-products grid to match the collection mobile spacing.
  - changed the product-not-found eyebrow from Be Radiant/Nancy to SotraBrand.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/Product/sotra-dresses-1` route returned 200.
  - Focused source scan confirmed `RelatedProducts` now uses `CollectionProductCard`.

## Remove Shop The Look Navigation

- User requested:
  - remove `Shop The Look` from the shop/menu navigation.
- Updated:
  - `Frontend/src/componens/SotraNavbar.jsx`
- Changes:
  - removed `Shop The Look` from the desktop navigation.
  - removed `Shop The Look` from the mobile drawer menu.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/` route returned 200.
  - Local `/collection` route returned 200.
  - Source scan confirmed `Shop The Look` no longer appears in UI source.

## Remove Footer Payment Methods Text

- User requested:
  - remove the `Payment methods` words from the footer.
- Updated:
  - `Frontend/src/componens/ScandiFooter.jsx`
  - `Frontend/src/componens/SotraFooter.jsx`
- Changes:
  - removed the `Payment methods` text from the active Scandi footer.
  - removed the same text from the older Sotra footer copy for consistency.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/` route returned 200.
  - Source scan confirmed `Payment methods` no longer appears in UI source.

## About Page SotraBrand Branding

- User requested:
  - fix the About Us page because it still used RadiantByNancy wording.
- Updated:
  - `Frontend/src/pages/About.jsx`
- Changes:
  - changed About page eyebrow from Be Radiant/Nancy to SotraBrand.
  - changed About image alt fallback to `SotraBrand story`.
  - rewrote body-care/fragrance copy into SotraBrand fashion/clothing copy.
  - changed `Contact Nancy` to `Contact Us`.
  - changed `The Nancy Way` to `The SotraBrand Way`.
  - updated values/principles from beauty ritual language to fashion styling language.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/about` route returned 200.
  - Focused About source scan confirmed no old Nancy/Radiant text remains.

## Scandi Left Filter Drawer Styling

- User requested:
  - make `Filter and sort` look like Scandi.
  - keep the drawer opening from the left.
- Updated:
  - `Frontend/src/pages/Collection.jsx`
  - `Frontend/src/pages/SubcategoryProducts.jsx`
- Changes:
  - kept the mobile filter drawer sliding from the left.
  - changed the drawer header to centered `Filter and sort` with the product count underneath.
  - changed the close control to a large square Scandi-style X button.
  - moved collection sorting into the mobile filter drawer.
  - changed the collection mobile toolbar to show `Filter and sort` on the left and product count on the right.
  - changed drawer footer actions to `Remove all` and a rounded black `Apply` button.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/collection` route returned 200.
  - Local `/subcategory/dresses` route returned 200.

## Filter Drawer Apply Button And Motion

- User requested:
  - show the missing `Apply` button.
  - make filter drawer opening and closing smoother.
- Updated:
  - `Frontend/src/pages/Collection.jsx`
  - `Frontend/src/pages/SubcategoryProducts.jsx`
- Changes:
  - changed the drawer height to use the visible mobile viewport.
  - made the drawer footer non-scrolling so `Remove all` and `Apply` stay visible.
  - added mobile safe-area bottom padding for phones with browser/navigation bars.
  - softened overlay fade and drawer slide open/close animation timing.
  - added a small press animation to the `Apply` button.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/collection` route returned 200.
  - Local `/subcategory/dresses` route returned 200.

## Lightweight Filter Drawer Motion

- User requested:
  - make the filter drawer feel less heavy.
  - make it behave smoothly like the navbar mobile menu.
  - keep the drawer clean and light on mobile.
- Updated:
  - `Frontend/src/pages/Collection.jsx`
  - `Frontend/src/pages/SubcategoryProducts.jsx`
- Changes:
  - replaced the filter drawer mount/unmount animation with a lightweight CSS transform transition like the navbar menu.
  - raised the drawer above the sticky navbar so the title and close button are not hidden behind the header.
  - reduced overlay darkness from heavy black to a lighter backdrop.
  - reduced the close button and footer button sizes so the drawer looks lighter.
  - prevented `Remove all` from wrapping into multiple lines.
  - removed the extra Framer Motion drawer dependency from subcategory pages.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/collection` route returned 200.
  - Local `/subcategory/dresses` route returned 200.

## Filter Drawer Fixed Position Correction

- User showed:
  - the `Remove all` and `Apply` bar floating under the navbar while products were visible behind it.
- Root cause:
  - the app route wrapper used `translate-y-*` during page fade transitions.
  - that transform made fixed-position page drawers behave relative to the scrolled route wrapper instead of the viewport.
- Updated:
  - `Frontend/src/App.jsx`
  - `Frontend/src/pages/Collection.jsx`
  - `Frontend/src/pages/SubcategoryProducts.jsx`
- Changes:
  - changed the page transition wrapper from transform-based animation to opacity-only animation.
  - kept filter drawers fixed to the real viewport.
  - cleaned up drawer markup indentation after the lightweight transition rewrite.
  - preserved the bottom-pinned filter action footer.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/` route returned 200.
  - Local `/collection` route returned 200.
  - Local `/subcategory/dresses` route returned 200.

## Collection Filter Scope Correction

- User clarified:
  - the Scandi-style `Filter and sort` drawer should only be used on category pages like Dresses, Blazers, Pants, etc.
  - the main `/collection` page should keep the older collection filter style.
- Updated:
  - `Frontend/src/pages/Collection.jsx`
- Changes:
  - restored the mobile collection controls to separate `Filters` and sort dropdown areas.
  - moved sorting back out of the collection drawer so it works from the top control.
  - restored the collection drawer title/copy to `Refine the collection` and `Filters`.
  - restored collection drawer actions to `Reset`, selected count, and `Apply Filters`.
  - kept the newer Scandi-like `Filter and sort` drawer unchanged on category pages.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/collection` route returned 200.
  - Local `/subcategory/dresses` route returned 200.

## On Sale Separate Product Page

- User requested:
  - make the `On Sale` button in the header and mobile menu open a separate page like category pages.
  - keep `On Sale` available inside the main `/collection` filters.
- Updated:
  - `Frontend/src/pages/OnSaleProducts.jsx`
  - `Frontend/src/App.jsx`
  - `Frontend/src/componens/SotraNavbar.jsx`
  - `Frontend/src/lib/mockData.js`
- Changes:
  - added a dedicated `/on-sale` page for sale products.
  - added `/sale` as an alias route.
  - reused the category-page style product grid and Scandi-like `Filter and sort` drawer.
  - header desktop `On Sale` now links to `/on-sale`.
  - mobile menu `On Sale` now links to `/on-sale`.
  - sale hero/slide buttons now link to `/on-sale`.
  - left the `/collection` `On Sale` filter behavior unchanged.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/on-sale` route returned 200.
  - Local `/sale` route returned 200.
  - Local `/collection` route returned 200.
  - Local `/subcategory/dresses` route returned 200.

## Home Nancy-Style Video Section

- User requested:
  - add the Nancy-style horizontal video section after the `Collections` section on the SotraBrand home page.
- Updated:
  - `Frontend/src/pages/SotraHome.jsx`
- Changes:
  - imported the existing `LuxuryVideoGallery` component into the Sotra home page.
  - placed the video gallery directly after the home `Collections` grid.
  - added a matching uppercase section callout above the gallery.
  - used SotraBrand wording: `SotraBrand Edit` and `See Full Collections`.
  - linked the callout to `/collection`.
  - reused the existing Nancy video gallery behavior, horizontal scroll, autoplay/pause handling, and progress bar.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/` route returned 200.
  - Local `/collection` route returned 200.

## Home Video Gallery Mock Fallback Fix

- User showed:
  - the `SotraBrand Edit` header appeared on the home page, but the video gallery did not render.
- Root cause:
  - mock mode had no `luxury-gallery` homepage section items.
  - `LuxuryVideoGallery` used the empty mock section directly instead of falling back to the existing bundled Nancy video gallery assets.
- Updated:
  - `Frontend/src/componens/LuxuryVideoGallery.jsx`
- Changes:
  - when mock mode has no `luxury-gallery` items, the component now falls back to `nancyVideoGallery`.
  - the video rail should now render directly under `SotraBrand Edit`.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/` route returned 200.
  - Local `/collection` route returned 200.

## Home Service Cards And Promise Section

- User requested:
  - add the service/promise cards after the home video section.
  - add an `About Our Store` block using the provided `Our Promise` copy.
  - keep the same reference design direction with colors matching SotraBrand.
- Updated:
  - `Frontend/src/pages/SotraHome.jsx`
- Changes:
  - added four service cards after the video gallery:
    - `Support 24/7`
    - `Premium Quality`
    - `Worldwide Shipping`
    - `Modest Clothes`
  - used a warm beige/taupe section background with white cards and soft taupe icons.
  - added the `About Our Store` / `Our Promise` content block.
  - added the provided modest fashion promise copy with SOTRA branding.
  - added simple stats matching the reference style:
    - `3` years of serving modest fashion.
    - `2000` satisfied customers.
  - added a `Learn More` link to `/about`.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/` route returned 200.
  - Local `/about` route returned 200.
  - Local `/collection` route returned 200.

## Home Promise Section White Background

- User requested:
  - keep the new service/promise section backgrounds white.
- Updated:
  - `Frontend/src/pages/SotraHome.jsx`
- Changes:
  - changed the promise/service section background from warm beige to white.
  - kept taupe accent colors on icons, headings, dividers, and stats.
  - added a light border to the white service cards so they remain separated on the white page.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/` route returned 200.
  - Local `/about` route returned 200.

## Announcement Bar Baby Pink Trial

- User requested:
  - try baby pink for the `Cash On Delivery` announcement/header bar background.
- Updated:
  - `Frontend/src/componens/SotraNavbar.jsx`
- Changes:
  - changed the announcement bar background from black to baby pink `#f9dfe7`.
  - changed announcement text and arrow icons to dark text for readability.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/` route returned 200.
  - Local `/collection` route returned 200.

## Announcement Bar Back To Black

- User requested:
  - revert the baby pink announcement bar because it was not preferred.
- Updated:
  - `Frontend/src/componens/SotraNavbar.jsx`
- Changes:
  - restored the announcement bar background to black `#111111`.
  - restored announcement text and arrow icons to white.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/` route returned 200.
  - Local `/collection` route returned 200.

## Home Hero Modesty Headline

- User requested:
  - add the same headline text over all three home header carousel images.
  - keep the existing buttons such as `On Sale` and `Discover More`.
- Updated:
  - `Frontend/src/lib/mockData.js`
- Changes:
  - changed all three `sotraHeroSlides` titles to `We Bring Modesty To Lebanon`.
  - kept the existing slide buttons and links unchanged.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/` route returned 200.
  - Local `/on-sale` route returned 200.

## SotraBrand Logo, Assets, Categories, And Contact Pass

- User added real SotraBrand assets in `Frontend/src/assets/sotraBrand`.
- User requested:
  - use the SotraBrand logo.
  - replace old mock categories with:
    - Abaya
    - Dresses
    - Hijabs
    - Islamic Essentials
    - Blouses
  - update the header title to `SOTRA` / `Bringing Modesty to Every Wardrobe.`
  - use the real SotraBrand phone, email, TikTok, Instagram, Facebook, and WhatsApp links.
  - add those links to the footer, menu, and contact page.
  - use the Sotra logo in the WhatsApp popup.
  - update favicon, title, description, and keywords for SotraBrand modest fashion.
- Updated:
  - `Frontend/src/lib/mockData.js`
  - `Frontend/src/lib/subcategoryCatalog.js`
  - `Frontend/src/pages/SotraHome.jsx`
  - `Frontend/src/componens/SotraNavbar.jsx`
  - `Frontend/src/componens/ScandiFooter.jsx`
  - `Frontend/src/pages/Contact.jsx`
  - `Frontend/src/componens/SotraWhatsAppPopup.jsx`
  - `Frontend/src/componens/WhatsAppOrderPopup.jsx`
  - `Frontend/src/componens/ShippingPolicy.jsx`
  - `Frontend/src/componens/LuxuryVideoGallery.jsx`
  - `Frontend/src/lib/videoGalleryData.js`
  - `Frontend/src/componens/LegalPolicy.jsx`
  - `Frontend/src/pages/Orders.jsx`
  - `Frontend/src/pages/Favorites.jsx`
  - `Frontend/index.html`
  - `Frontend/.env`
  - `Frontend/public/sotra-logo.jpeg`
- Changes:
  - navbar and footer now use the uploaded `Logo_Sotra.jpeg`.
  - home hero now uses the uploaded `Header_1`, `Header_2`, and `Header_3` images.
  - all three hero slides show:
    - `SOTRA`
    - `Bringing Modesty to Every Wardrobe.`
  - mock products now use SotraBrand modest fashion product names, descriptions, prices, sale flags, sizes, color options, and uploaded category images.
  - category routes now support:
    - `/subcategory/abaya`
    - `/subcategory/dresses`
    - `/subcategory/hijabs`
    - `/subcategory/islamic-essentials`
    - `/subcategory/blouses`
  - footer now includes phone, email, Instagram, TikTok, Facebook, and WhatsApp icons/links.
  - mobile menu social icons now include Instagram, TikTok, Facebook, and WhatsApp.
  - contact page now uses real SotraBrand email, phone, and social links.
  - WhatsApp popup uses the SotraBrand logo and the new WhatsApp number.
  - favicon and SEO/social metadata now target SotraBrand modest fashion keywords.
  - home video gallery fallback now uses SotraBrand video/images instead of bundled Nancy videos, reducing leftover Nancy media in the build.
  - active Orders, Favorites, Legal, and Shipping page copy was cleaned to SotraBrand wording.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/` route returned 200.
  - Local `/collection` route returned 200.
  - Local `/subcategory/abaya` route returned 200.
  - Local `/subcategory/islamic-essentials` route returned 200.
  - Local `/contact` route returned 200.
  - Local `/shippingpolicy` route returned 200.

## Branded First-Load Screen And Navbar Logo Scale

- User requested:
  - make the first page loader more special using the SotraBrand logo.
  - use the same kind of smooth animation already used in loader sections.
  - make the navbar logo bigger and a little wider.
- Updated:
  - `Frontend/src/componens/NancyPreviewLoader.jsx`
  - `Frontend/src/componens/SotraNavbar.jsx`
  - `Frontend/src/index.css`
  - `Frontend/src/App.jsx`
- Changes:
  - loader now shows the uploaded SotraBrand logo inside soft animated rings.
  - added a subtle logo rise/breathe animation and a thin moving loading line.
  - changed the loader subtitle from generic `Loading` to `Modesty`.
  - slightly extended the first-load display duration from `900ms` to `1250ms` so the branded animation is visible.
  - navbar logo now uses a controlled crop/zoom frame to remove the logo image's built-in white padding.
  - navbar logo frame is larger and wider on both normal and compact sticky states.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/` route returned 200.
  - Local `/collection` route returned 200.

## Navbar Logo Centering And Hero Text Contrast

- User showed:
  - the navbar logo crop looked off in the white header.
  - the hero title became hard to read on bright/white header images.
- Updated:
  - `Frontend/src/componens/SotraNavbar.jsx`
  - `Frontend/src/pages/SotraHome.jsx`
  - `Frontend/src/index.css`
- Changes:
  - widened the navbar logo frame so the logo fills the centered header area better.
  - changed the navbar logo crop to target the horizontal SOTRA wordmark area instead of only the large monogram.
  - split the hero title into a main `SOTRA` line and subtitle line for better mobile wrapping.
  - increased the hero image overlay from `black/28` to `black/40`.
  - added a dedicated hero title text shadow so white text stays readable on bright image backgrounds.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/` route returned 200.
  - Local `/collection` route returned 200.

## About Page SotraBrand Image

- User requested:
  - add a real SotraBrand picture to the About Us page.
- Updated:
  - `Frontend/src/pages/About.jsx`
- Changes:
  - replaced the old About image fallback with `Frontend/src/assets/sotraBrand/Header_1.jpeg`.
  - backend page-image fallback now also returns the SotraBrand image if no backend image is configured.
  - removed the unused old `assests.About_us` import from the About page.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/about` route returned 200.
  - Local `/` route returned 200.

## Hero Header Image And Off-White Title Adjustment

- User requested:
  - keep the existing header pictures looking as they were.
  - make the hero title less pure white by using an off-white tone.
- Updated:
  - `Frontend/src/pages/SotraHome.jsx`
  - `Frontend/src/index.css`
- Changes:
  - restored the hero image overlay from `black/40` to the lighter `black/28`.
  - changed the hero title color from pure white to off-white `#f4efe8`.
  - softened the hero title shadow so the image stays lighter while the title remains readable.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/` route returned 200.
  - Local `/collection` route returned 200.

## Navbar Logo Cropping Fix

- User showed:
  - the navbar logo was clipped and zoomed too far into the `SB` monogram.
- Updated:
  - `Frontend/src/assets/sotraBrand/Logo_Sotra_cropped.png`
  - `Frontend/src/assets/sotraBrand/Logo_Sotra_wordmark.png`
  - `Frontend/src/componens/SotraNavbar.jsx`
  - `Frontend/src/index.css`
- Changes:
  - generated a clean crop of the original SotraBrand logo.
  - generated a horizontal `SOTRA MODESTY` wordmark crop for the navbar.
  - changed the navbar to use the wordmark crop instead of the padded square logo.
  - removed the aggressive CSS scale/translate logo crop that caused clipping.
  - navbar logo now uses normal `object-fit: contain` centering inside a stable frame.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/` route returned 200.
  - Local `/collection` route returned 200.

## Loader Logo Cropping Fix

- User showed:
  - the first-load logo still looked weak and incorrectly cropped.
- Updated:
  - `Frontend/src/componens/NancyPreviewLoader.jsx`
  - `Frontend/src/index.css`
- Changes:
  - changed the loader to use the clean full cropped logo asset instead of the padded original square logo.
  - removed the duplicate large `SotraBrand` and `Modesty` text under the mark because the official logo already contains `SOTRA MODESTY`.
  - changed the loader logo frame from circular to rectangular so the official logo is not clipped.
  - adjusted the loader animation to breathe the full logo gently without translate-based cropping.
  - kept the thin animated loading line below the logo.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/` route returned 200.
  - Local `/collection` route returned 200.

## Hero Title Period Removal

- User requested:
  - remove the period at the end of the home header title.
- Updated:
  - `Frontend/src/lib/mockData.js`
- Changes:
  - changed `Bringing Modesty to Every Wardrobe.` to `Bringing Modesty to Every Wardrobe`.
  - this applies to all three home hero slides because they share the same `heroTitle` source.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/` route returned 200.
  - Local `/collection` route returned 200.

## Exact Category Product Matching

- User clarified:
  - category pages must not mix products or images from other categories.
  - Abaya should show only Abaya.
  - Hijabs should show only Hijabs.
  - Dresses should show only Dresses.
  - Islamic Essentials should show only Islamic Essentials.
  - Blouses should show only Blouses.
- Updated:
  - `Frontend/src/lib/mockData.js`
  - `Frontend/src/lib/subcategoryCatalog.js`
- Changes:
  - removed broad description/text matching from category routes.
  - category pages now match only exact `category` or `subCategory` values.
  - restricted mock image pools so Abaya, Hijabs, Dresses, and Blouses use only their own uploaded assets.
  - because no dedicated Islamic Essentials product photos are currently present in `assets/sotraBrand`, Islamic Essentials now uses the neutral SotraBrand logo placeholder instead of borrowing Abaya/Hijab photos.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/subcategory/abaya` route returned 200.
  - Local `/subcategory/dresses` route returned 200.
  - Local `/subcategory/hijabs` route returned 200.
  - Local `/subcategory/islamic-essentials` route returned 200.
  - Local `/subcategory/blouses` route returned 200.
  - Local `/collection` route returned 200.

## Dresses Image De-Duplication

- User requested:
  - do not duplicate the same Dresses photo.
  - search for similar dress-style imagery.
  - keep 6 products for each category.
- Updated:
  - `Frontend/src/lib/mockData.js`
- Changes:
  - kept 6 products in the Dresses category.
  - added 5 separate external dress-focused mock images beside the uploaded SotraBrand dress image.
  - Dresses products now rotate through 6 different dress-only images instead of repeating one image.
  - other category image pools remain category-specific.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/subcategory/dresses` route returned 200.
  - Local `/collection` route returned 200.

## Homepage Collection Tile Height

- User requested:
  - make the homepage collection/category pictures a little higher.
- Updated:
  - `Frontend/src/pages/SotraHome.jsx`
- Changes:
  - changed homepage category tiles from square to a slightly taller portrait ratio.
  - kept the existing two-column mobile grid and labels unchanged.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/` route returned 200.
  - Local `/collection` route returned 200.

## Homepage Category Face Crop Adjustment

- User requested:
  - make the homepage category pictures higher until faces show up.
- Updated:
  - `Frontend/src/pages/SotraHome.jsx`
- Changes:
  - increased the category tile height again using a taller portrait ratio.
  - changed clothing category images to top-focused cropping so faces/upper bodies are visible.
  - kept the Islamic Essentials logo tile contained so the logo is not cropped.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/` route returned 200.
  - Local `/collection` route returned 200.

## Real Abaya And Dresses Assets With Color Options

- User requested:
  - use the newly added Abaya and Dresses assets.
  - replace fake/external dress images.
  - keep 6 products for each category.
  - group same-style different-color photos inside the same product as color choices.
  - single-color styles should keep only one color choice.
  - Abaya, Dresses, and Blouses should not use standard sizes; they should show a kg fit range from 50 kg to 110 kg.
  - Hijabs and Islamic Essentials should have no sizes, only colors.
- Updated:
  - `Frontend/src/lib/mockData.js`
  - `Frontend/src/componens/FeaturedProducts.jsx`
  - `Frontend/src/componens/CollectionProductCard.jsx`
- Changes:
  - Abaya mock products now use only the newly added real Abaya photos.
  - Dresses mock products now use only the uploaded SotraBrand dress photos; searched placeholder dress images were removed.
  - same-style color variants are attached as product color thumbnails using `shadeOptions`.
  - all mock products now keep `sizes: []`, so no size selector is required.
  - Abaya, Dresses, and Blouses display `Fits 50 kg - 110 kg`.
  - Hijabs and Islamic Essentials keep color options only.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/subcategory/abaya` route returned 200.
  - Local `/subcategory/dresses` route returned 200.
  - Local `/subcategory/hijabs` route returned 200.
  - Local `/subcategory/islamic-essentials` route returned 200.
  - Local `/subcategory/blouses` route returned 200.
  - Local `/Product/sotra-dresses-1` route returned 200.

## Required KG Fit Selection

- User clarified:
  - the `Fits 50 kg - 110 kg` value should not be display-only.
  - for Abaya, Dresses, and Blouses, the customer must choose her kg before ordering.
  - this replaces standard size selection.
- Updated:
  - `Frontend/src/lib/mockData.js`
  - `Frontend/src/componens/FeaturedProducts.jsx`
  - `Frontend/src/componens/CartDrawer.jsx`
  - `Frontend/src/pages/Placeorder.jsx`
- Changes:
  - added structured fit data to fit-based products:
    - `fitMin: 50`
    - `fitMax: 110`
    - `fitUnit: kg`
  - product detail now shows a required `Her KG` number input for fit-based products.
  - Add to Cart and Cash on Delivery now require a valid kg between 50 and 110.
  - the selected kg is saved into the existing order variant field, so cart/checkout/admin order details can show values like `72 kg`.
  - cart suggestions now open the product page instead of bypassing the fit selection for fit-based products.
  - checkout validation now treats missing kg fit like a missing required variant.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/Product/sotra-abaya-1` route returned 200.
  - Local `/Product/sotra-dresses-1` route returned 200.
  - Local `/Product/sotra-blouses-1` route returned 200.
  - Local `/cart` route returned 200.
  - Local `/place-order` route returned 200.
  - Local `/subcategory/abaya` route returned 200.

## Clear Fit Selector Wording

- User requested:
  - make the kg fit choice clearer for customers.
  - avoid requiring typed number input.
  - keep the visible range from 50 kg to 110 kg.
- Updated:
  - `Frontend/src/componens/FeaturedProducts.jsx`
- Changes:
  - replaced the typed kg number field with a dropdown selector.
  - changed the label to `Choose Your Fit (KG)`.
  - added helper copy: customers should select the approximate weight for the best fit, available from 50 kg to 110 kg.
  - changed missing-fit button text from `Enter KG` to `Choose Fit`.
  - changed validation wording to `Please choose her fit between 50 kg and 110 kg.`
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/Product/sotra-abaya-1` route returned 200.
  - Local `/Product/sotra-dresses-1` route returned 200.
  - Local `/Product/sotra-blouses-1` route returned 200.
  - Local `/place-order` route returned 200.

## Custom Sotra Fit Picker Design

- User showed:
  - the native phone dropdown looked heavy/dark and did not match SotraBrand.
- Updated:
  - `Frontend/src/componens/FeaturedProducts.jsx`
- Changes:
  - replaced the native browser select dropdown with a custom inline Sotra-style picker.
  - added a soft white/taupe bordered panel matching the current product page style.
  - kept the label `Choose Your Fit`.
  - kept the visible range badge `50-110 kg`.
  - added a smooth expand/collapse animation for the kg options.
  - rendered kg choices as clean selectable chips with a check icon on the selected value.
  - kept order validation unchanged: fit-based products still require a selected kg before ordering.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/Product/sotra-abaya-1` route returned 200.
  - Local `/Product/sotra-dresses-1` route returned 200.
  - Local `/Product/sotra-blouses-1` route returned 200.
  - Local `/place-order` route returned 200.

## Simplified Fit Picker Layout

- User showed:
  - the custom fit picker looked too busy inside the product page.
- Updated:
  - `Frontend/src/componens/FeaturedProducts.jsx`
- Changes:
  - removed the heavy boxed picker panel.
  - removed the long helper paragraph.
  - kept a simpler `Choose Your Fit` label.
  - kept a clear `Weight range: 50-110 kg` line.
  - reduced the picker button height, borders, and option chip size.
  - kept the custom chip dropdown behavior so the native phone select UI does not appear.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/Product/sotra-abaya-1` route returned 200.
  - Local `/Product/sotra-dresses-1` route returned 200.
  - Local `/Product/sotra-blouses-1` route returned 200.

## Product Quantity Control Placement

- User requested:
  - add the increase/decrease item quantity control below the price.
- Updated:
  - `Frontend/src/componens/FeaturedProducts.jsx`
- Changes:
  - moved the existing quantity decrease/increase control directly below the product price.
  - removed the lower duplicated quantity area near the Add to Cart buttons.
  - kept the quantity tied to the displayed total price, Add to Cart quantity, and Cash on Delivery quantity.
  - changed the control to a compact bordered Sotra-style stepper.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/Product/sotra-abaya-1` route returned 200.
  - Local `/Product/sotra-dresses-1` route returned 200.
  - Local `/Product/sotra-hijabs-1` route returned 200.

## Price Row Quantity Stepper

- User clarified:
  - quantity increase/decrease should be beside the price directly.
  - `Choose A Color` should remain below the price area as before.
- Updated:
  - `Frontend/src/componens/FeaturedProducts.jsx`
- Changes:
  - moved the quantity stepper onto the same row as the product price.
  - kept the price on the left and the quantity stepper on the right.
  - kept shipping text and `Choose A Color` below the price row.
  - kept quantity tied to total displayed price and cart/order quantity.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/Product/sotra-abaya-1` route returned 200.
  - Local `/Product/sotra-dresses-1` route returned 200.
  - Local `/Product/sotra-hijabs-1` route returned 200.

## About Page Copy And Home Stats Update

- User requested:
  - update the About page with `ABOUT SOTRA`, `Where Modesty Meets Elegance`, and the new modest fashion brand copy.
  - update the homepage end stats to `2` years and `1200` customers.
- Updated:
  - `Frontend/src/pages/About.jsx`
  - `Frontend/src/pages/SotraHome.jsx`
- Changes:
  - replaced the older Nancy/SotraBrand generic About text with SOTRA modest fashion wording.
  - adjusted About page headings, value cards, and promise copy to match the SotraBrand visual style.
  - changed homepage promise counters from `3` years and `2000` customers to `2` years and `1200` customers.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/` route returned 200.
  - Local `/about` route returned 200.

## Lebanon And Tripoli Delivery Pricing

- User requested:
  - delivery should be `$5` across Lebanon.
  - delivery inside Tripoli should be `$2`.
  - top announcement should show that Tripoli delivery is only `$2`.
  - checkout should reduce delivery automatically when the customer chooses Tripoli.
- Updated:
  - `Frontend/src/pages/Placeorder.jsx`
  - `Frontend/src/componens/SotraNavbar.jsx`
  - `Frontend/src/lib/mockData.js`
  - `Frontend/src/context/ShopContext.jsx`
  - `Frontend/src/componens/ShippingPolicy.jsx`
  - `Backend/models/siteSettingsModel.js`
  - `Backend/scripts/seedNancyMockData.js`
  - `Admin/src/pages/NancyHomeControl.jsx`
- Changes:
  - set default delivery to `$5`.
  - added Tripoli city detection in checkout.
  - checkout delivery changes to `$2` when city is `Tripoli`.
  - checkout keeps `$5` for other Lebanon cities.
  - order totals and admin notification totals use the same calculated delivery value.
  - added a checkout delivery note explaining `$5` Lebanon / `$2` Tripoli.
  - updated announcement text to `Tripoli Delivery Only $2`.
  - updated Shipping Policy copy with the same delivery prices.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/` route returned 200.
  - Local `/place-order` route returned 200.
  - Local `/shippingpolicy` route returned 200.

## Optional Tripoli Delivery Selector And Checkout Simplification

- User requested:
  - add an optional choice after the city field.
  - the customer can select or unselect Tripoli delivery.
  - delivery price should change based on that choice.
  - simplify the Place Order page style so it is cleaner and matches SotraBrand.
- Updated:
  - `Frontend/src/pages/Placeorder.jsx`
- Changes:
  - added an `Optional Delivery Choice` selector directly after the City field.
  - selecting the option applies Tripoli delivery at `$2`.
  - unselecting the option returns delivery to the standard Lebanon delivery price of `$5`.
  - if the customer selects Tripoli while City is empty, checkout fills City with `Tripoli`.
  - order totals and admin notification metadata use the selected delivery zone.
  - softened checkout styling with rounded sections, lighter borders, serif section headings, smaller icons, and less dense spacing.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/place-order` route returned 200.

## Product Quantity Old Style Restore

- User requested:
  - keep the quantity increase/decrease control in the same place beside the product price.
  - restore the older visual style for the decrease/increase buttons.
- Updated:
  - `Frontend/src/componens/FeaturedProducts.jsx`
- Changes:
  - replaced the compact bordered stepper with separated soft circular `-` and `+` controls.
  - kept the quantity number between the buttons.
  - kept the control on the same row as the product price.
  - preserved quantity behavior for displayed total price, Add to Cart, and Cash on Delivery.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/Product/sotra-abaya-1` route returned 200.

## Shipping Policy Delivery Wording

- User requested:
  - Shipping Policy should clearly show delivery all across Lebanon is `$5`.
  - Shipping Policy should clearly show delivery inside Tripoli is `$2`.
- Updated:
  - `Frontend/src/componens/ShippingPolicy.jsx`
- Changes:
  - changed the first delivery card to `Inside Tripoli` with `$2`.
  - changed the second delivery card to `All Across Lebanon` with `$5`.
  - updated the Tripoli copy to match the checkout selector behavior.
  - kept the same clean SotraBrand card style.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/shippingpolicy` route returned 200.

## Mobile Menu About Label

- User requested:
  - update the menu bar About label.
- Updated:
  - `Frontend/src/componens/SotraNavbar.jsx`
- Changes:
  - changed the mobile menu label from `About` to `About Us`.
  - kept the existing About page route.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/` route returned 200.

## Product Page Exchange Policy Link

- User requested:
  - add a simple way on the product page to click and see the Exchange Policy.
  - keep it clean and not busy.
- Updated:
  - `Frontend/src/componens/FeaturedProducts.jsx`
- Changes:
  - added an inline `Exchange Policy` link beside the `Shipping calculated at checkout` line.
  - linked it to the existing policy route used by the footer.
  - avoided adding another control near the Share area to keep the product page simple.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/Product/sotra-abaya-1` route returned 200.
  - Local `/terms` route returned 200.

## Bilingual Exchange Policy Content

- User provided:
  - English exchange-only policy text.
  - Arabic exchange-only policy text.
- Updated:
  - `Frontend/src/componens/LegalPolicy.jsx`
- Changes:
  - replaced the generic terms content on `/terms` with `Exchange Policy`.
  - added English policy:
    - incorrect size received.
    - incorrect color received.
    - manufacturing defect in the item.
    - no refunds, exchange only.
  - added Arabic policy with RTL direction:
    - في حال إرسال مقاس غير صحيح.
    - في حال إرسال لون غير صحيح.
    - في حال وجود عيب مصنعي في القطعة.
    - لا يوجد استرجاع للأموال، والاستبدال فقط.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/terms` route returned 200.

## Islamic Essentials Asset Replacement

- User requested:
  - replace the existing Islamic Essentials placeholder assets with the two newly added Islamic Essentials images.
- Added assets used:
  - `Frontend/src/assets/sotraBrand/islamic (1).jpeg`
  - `Frontend/src/assets/sotraBrand/islamic (2).jpeg`
- Updated:
  - `Frontend/src/lib/mockData.js`
  - `Frontend/src/pages/SotraHome.jsx`
- Changes:
  - imported the two new Islamic Essentials images.
  - replaced the Islamic Essentials category tile image with the new asset.
  - replaced Islamic Essentials product images and color options with the two new assets.
  - renamed mock Islamic Essentials products to match sleeves/gloves products.
  - removed the old logo-specific category tile styling so Islamic Essentials displays like the other product categories.
  - removed the now-unused logo placeholder import from mock data.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/` route returned 200.
  - Local `/subcategory/islamic-essentials` route returned 200.
  - Local `/Product/sotra-islamic-essentials-1` route returned 200.

## Product Exchange Policy Link Placement

- User requested:
  - move the Exchange Policy link after the stock text because it is simpler there.
- Updated:
  - `Frontend/src/componens/FeaturedProducts.jsx`
- Changes:
  - removed `Exchange Policy` from the shipping-calculated line.
  - restored the shipping line to only `Shipping calculated at checkout`.
  - added `Exchange Policy` directly below the stock line, for example below `7 in stock`.
  - kept the link simple and low-visual-weight.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/Product/sotra-abaya-1` route returned 200.
  - Local `/terms` route returned 200.

## Fit Range Hidden From Product Grids

- User requested:
  - remove the `50 kg - 110 kg` fit range from collections and category pages because it made product cards too busy.
- Updated:
  - `Frontend/src/componens/CollectionProductCard.jsx`
- Changes:
  - removed the fit-range text from product grid cards.
  - kept product detail fit selection unchanged so customers can still choose KG before ordering.
  - kept the fit/order data available for cart, checkout, and admin order messages.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/collection` route returned 200.
  - Local `/subcategory/abaya` route returned 200.
  - Local `/Product/sotra-abaya-1` route returned 200.

## Backend SotraBrand Environment Check

- User requested:
  - check the new backend env for SotraBrand.
  - test MongoDB and ImageKit.
  - update order/contact email routing away from the old Nancy recipient.
- Updated:
  - `Backend/.env`
  - `Backend/.env.example`
  - `Backend/controllers/notifyController.js`
  - `Backend/services/mailService.js`
  - `Backend/models/siteSettingsModel.js`
- Changes:
  - set order recipient env to the requested Gmail recipient for now.
  - set contact recipient env to the SotraBrand contact email.
  - changed backend order email sender name, heading, fallback product label, and subject from Be Radiant By Nancy to SotraBrand.
  - changed shared contact mail sender name to SotraBrand.
  - changed backend site settings default email and social links to SotraBrand.
  - corrected MongoDB URI password encoding where an extra unescaped `@` was breaking DNS parsing.
- Verification after this checkpoint:
  - MongoDB ping passed.
  - ImageKit API list check passed.
  - Gmail SMTP verification is pending because the current Gmail/app-password values are being changed.

## Admin Mobile Network Access

- User requested:
  - make Admin open from mobile like the frontend network URL.
  - keep Admin on port `5174`.
- Updated:
  - `Admin/vite.config.js`
  - `Admin/.env`
- Changes:
  - configured Vite Admin dev server with `host: true`, `port: 5174`, and `strictPort: true`.
  - changed Admin backend URL from `http://localhost:4000` to `http://192.168.10.104:4000` so mobile browsers call the PC backend instead of phone localhost.
  - restarted the Admin dev server on `0.0.0.0:5174`.
- Verification passed after this checkpoint:
  - Admin network URL `http://192.168.10.104:5174` returned 200.
  - Backend network URL `http://192.168.10.104:4000/api/test` returned success.
  - Admin production build passed.

## Customer UI Pre-Admin Cleanup

- User requested:
  - fix the remaining customer-visible cleanup items before moving to Admin.
  - keep old Nancy components in the project for now in case parts are needed later.
- Updated:
  - `Frontend/src/componens/ComingSoon.jsx`
  - `Frontend/src/pages/Login.jsx`
  - `Frontend/src/App.jsx`
  - `Frontend/src/componens/ScandiFooter.jsx`
  - `Frontend/src/componens/SotraNavbar.jsx`
- Changes:
  - changed maintenance/coming-soon screen from Be Radiant/Nancy wording to Sotra wording.
  - removed customer-visible `Favorites` and `Rituals` wording from the login/account design.
  - redirected `/favorites` to `/collection` while keeping the old Favorites component in the codebase.
  - changed footer copyright rendering to a safe `&copy;` entity.
  - replaced generic menu/footer social fallbacks with exact SotraBrand Instagram, TikTok, Facebook, and WhatsApp links.
- Verification passed after this checkpoint:
  - Frontend production build.
  - Local `/login` route returned 200.
  - Local `/collection` route returned 200.
  - Local `/contact` route returned 200.
  - Local `/subcategory/abaya` route returned 200.

## Admin Product + Home Studio Cleanup

- User requested:
  - remove featured product placement from Add Product and Edit Product.
  - remove review stars from the add/edit live product preview.
  - add KG fit visibility to admin live product previews.
  - simplify Home Studio to match the live Sotra homepage flow.
- Updated:
  - `Admin/src/pages/Add.jsx`
  - `Admin/src/pages/EditProduct.jsx`
  - `Admin/src/components/NancyProductLivePreview.jsx`
  - `Admin/src/pages/ProductsList.jsx`
  - `Admin/src/pages/NancyHomeControl.jsx`
- Changes:
  - removed the old `Featured Product Placement` selector from product add/edit forms.
  - removed the review-star preview row from live product preview.
  - added a clean `Choose Your Fit` KG range block to add/edit live product preview.
  - added KG range text to Admin product cards when a product has fit range data.
  - removed Home Studio sections for Featured Product 1, Featured Product 4, Featured Collection Picture 1, Featured Collection Picture 2, Single Campaign Video, From The Gram, and the old Nancy note.
  - kept Header editing, automatic Sotra category collection preview, Luxury Video Gallery editing, and footer/announcement controls.
- Verification after this checkpoint:
  - Admin production build passed.

## Admin Editing + Guest Orders + Email Defaults

- User requested:
  - make header slide titles editable from admin.
  - let Category Manager upload a homepage picture for each category and have new categories appear automatically.
  - change admin Home Studio route away from `/nancy-home` while keeping old links working.
  - preserve KG/color/Tripoli delivery details in order save, admin, and email notifications.
  - make orders visible even when the customer is not logged in.
  - keep login optional and show logout options when an already logged-in customer opens Login.
  - make order/contact emails follow the Gmail env by default.
  - replace frontend/admin favicon with a clean Sotra-style `S`.
- Updated:
  - `Backend/models/headerSlideModel.js`
  - `Backend/controllers/headerSlideController.js`
  - `Backend/models/categoryGroupModel.js`
  - `Backend/controllers/categoryGroupController.js`
  - `Backend/routes/categoryGroupRoute.js`
  - `Backend/models/orderModel.js`
  - `Backend/controllers/orderController.js`
  - `Backend/controllers/notifyController.js`
  - `Backend/controllers/contactController.js`
  - `Backend/.env.example`
  - `Admin/index.html`
  - `Admin/src/App.jsx`
  - `Admin/src/components/Navbar.jsx`
  - `Admin/src/components/Sidebar.jsx`
  - `Admin/src/pages/CategoriesManager.jsx`
  - `Admin/src/pages/NancyHomeControl.jsx`
  - `Admin/src/pages/Add.jsx`
  - `Admin/src/pages/EditProduct.jsx`
  - `Admin/src/pages/Orders.jsx`
  - `Frontend/index.html`
  - `Frontend/public/favicon.svg`
  - `Frontend/public/sotra-favicon.svg`
  - `Frontend/src/componens/SotraNavbar.jsx`
  - `Frontend/src/componens/Navbar.jsx`
  - `Frontend/src/lib/mockData.js`
  - `Frontend/src/lib/subcategoryCatalog.js`
  - `Frontend/src/pages/SotraHome.jsx`
  - `Frontend/src/pages/Placeorder.jsx`
  - `Frontend/src/pages/Orders.jsx`
- Changes:
  - added `title`, `buttonLabel`, and `to` fields to backend header slides and admin slide editor.
  - added category image upload/remove support in Category Manager; live Sotra home and admin Home Studio previews use these images.
  - changed Admin Home Studio route to `/sotra-home`; `/nancy-home` redirects to it.
  - added Sotra favicon assets for admin/frontend using a large serif `S`.
  - made Add/Edit Product KG fit optional for every category, with clear min/max fields and no category-switch reset.
  - made Shop menu categories use live Category Manager data, so new categories appear automatically.
  - saved delivery zone/note on orders and displayed delivery, color, and fit details in admin orders and email notifications.
  - changed order/contact email recipients to default to `GMAIL_USER`, so changing Gmail + app password in `.env` is enough.
  - after checkout, customers are sent to `/orders`, the page scrolls to top, and guest orders show using the saved local receipt.
  - changed the live navbar login action so logged-in customers open the account page with Orders and Logout options instead of being sent straight to Orders.
- Verification after this checkpoint:
  - backend changed files passed `node --check`.
  - frontend production build passed.
  - admin production build passed.

## Email + Header Preview Follow-Up

- User requested:
  - make frontend-visible contact email match the SotraBrand order email.
  - make Admin Home Studio header title edits update in the live preview before saving.
- Updated:
  - `Frontend/src/pages/Contact.jsx`
  - `Frontend/src/componens/Footer.jsx`
  - `Frontend/src/componens/ScandiFooter.jsx`
  - `Frontend/src/lib/mockData.js`
  - `Admin/src/pages/NancyHomeControl.jsx`
  - `Backend/models/siteSettingsModel.js`
- Changes:
  - changed SotraBrand frontend/admin/backend fallback contact emails to `sotrabrand7@gmail.com`.
  - Home Studio now merges the current header slide draft into the mini homepage and header live previews, so title/button/link edits preview immediately.
- Verification after this checkpoint:
  - admin production build passed.
  - frontend production build passed.
  - backend email/settings files passed `node --check`.

## Frontend Link Preview Logo

- User requested:
  - make the frontend shared link show the Sotra logo preview like the admin shared link.
- Updated:
  - `Frontend/index.html`
- Changes:
  - changed canonical and Open Graph URL from relative `/` to `https://sotrabrand.onrender.com/`.
  - changed Open Graph and Twitter image URLs from relative `/sotra-logo.jpeg` to absolute `https://sotrabrand.onrender.com/sotra-logo.jpeg`.
  - added Open Graph image metadata for secure URL, type, width, height, and alt text.
- Verification after this checkpoint:
  - frontend production build passed.
