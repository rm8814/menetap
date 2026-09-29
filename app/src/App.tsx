import { useEffect, useRef, useState } from "react";
import * as React from "react";
import type { FormEvent, ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { GuestScreen, SearchState } from "./types";
import { AuthPanel } from "./auth";
import { ProtectedScreen } from "./ProtectedScreen";
import { CityDestinationLanding } from "./cityDestinations";
import { isProductionEnv } from "./seoEnv";
import { applyGlobalStructuredData, applySeo, propertyPath } from "./seo";
import { track } from "./analytics";
import { ExperiencesV2 } from "./ExperiencesV2";
import { ExperiencesLanding } from "./ExperiencesLanding";
import { RentalConfirmation, RentalAdmin, RentalTripsSection } from "./RentalMarketplace";
import { RentalsV2 } from "./RentalsV2";
import { Button } from "./components/Button";
import { SupplierCatalog, SupplierCheckout, SupplierConfirmation, SupplierOrders, VendorProducts, SupplierAdmin } from "./SupplierMarketplace";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import {
  ArrowUp,
  Award,
  BadgePercent,
  Bed,
  Car,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Gift,
  Globe2,
  MapPin,
  MapPinOff,
  Menu,
  RefreshCcw,
  Search,
  Sparkles,
  ShieldCheck,
  Star,
  Truck,
  UserCheck,
  UserPlus,
  Wallet,
  Clock,
  Users,
  Waves,
  Wifi,
  Wind,
  X,
  Zap,
  Upload,
  Phone,
  MessageCircle,
  ShoppingCart,
  Package,
  Receipt,
  Compass,
} from "lucide-react";

const formatLocalDate = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const formatDisplayDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(new Date(`${value}T00:00:00`))
    .replace(/ /g, "-");
const today = formatLocalDate(new Date());
const nextDay = (date: string) => {
  const value = new Date(`${date}T00:00:00`);
  value.setDate(value.getDate() + 1);
  return formatLocalDate(value);
};
const initialSearch: SearchState = {
  destination: "",
  checkIn: today,
  checkOut: nextDay(today),
  guests: 2,
  adults: 2,
  children: 0,
  childAges: [],
};

export function App() {
  const [screen, setScreen] = useState<GuestScreen>("home");
  const [search, setSearch] = useState(initialSearch);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [bookingCode, setBookingCode] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signIn" | "signUp" | "reset">("signIn");
  const [language, setLanguage] = useState<"EN" | "ID">("EN");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const destination = params.get("destination");
    const checkIn = params.get("checkIn");
    const checkOut = params.get("checkOut");
    const adults = Number(params.get("adults") ?? 2);
    const children = Number(params.get("children") ?? 0);
    const childAges = (params.get("childAges") ?? "").split(",").filter(Boolean).map(Number).filter((age) => age >= 0 && age <= 17).slice(0, children);
    const path = window.location.pathname;
    const propertyPathMatch = path.match(/\/stays\/property\/([^/]+)(?:\/[^/]+)?$/);
    const pathLanguage = path.startsWith("/id") ? "ID" : "EN";
    setLanguage(pathLanguage);
    if (path.endsWith("/login") || path.endsWith("/signup") || path.endsWith("/reset-password")) {
      setAuthMode(path.endsWith("/signup") ? "signUp" : path.endsWith("/reset-password") ? "reset" : "signIn");
      setAuthOpen(true);
    } else if (path.endsWith("/404-notfound")) setScreen("notFound" as GuestScreen);
    else if (path.endsWith("/about")) setScreen("about");
    else if (path.endsWith("/careers")) setScreen("careers");
    else if (path.endsWith("/cancellation")) setScreen("cancellation");
    else if (path.endsWith("/privacy")) setScreen("privacy");
    else if (path.endsWith("/terms")) setScreen("terms");
    else if (path.endsWith("/help")) setScreen("help");
    else if (path.endsWith("/my-trips")) setScreen("myTrips");
    else if (path.endsWith("/saved-stays")) setScreen("saved");
    else if (path.endsWith("/payment-methods")) setScreen("paymentMethods");
    else if (path.endsWith("/settings")) setScreen("settings");
    else if (path.endsWith("/booking-issue")) setScreen("bookingIssue");
    else if (path.endsWith("/during-stay")) setScreen("duringStay");
    else if (path.endsWith("/experiences/" ) || path.endsWith("/experiences")) setScreen("experiences");
    else if (path.endsWith("/experiences/detail")) setScreen("experienceDetail");
    else if (path.endsWith("/rentals")) setScreen("rentalsLanding" as GuestScreen);
    else if (path.endsWith("/rentals/search")) setScreen("rentalSearch" as GuestScreen);
    else if (path.endsWith("/rentals/confirmation")) setScreen("rentalConfirmation" as GuestScreen);
    else if (path.endsWith("/admin/rentals")) setScreen("adminRentals" as GuestScreen);
    else if (path.endsWith("/supply/checkout")) setScreen("supplyCheckout");
    else if (path.endsWith("/supply/confirmation")) setScreen("supplyConfirmation");
    else if (path.endsWith("/supply/catalog")) setScreen("supplyCatalog");
    else if (path.endsWith("/supply")) setScreen("supplyLanding");
    else if (path.endsWith("/supply/orders")) setScreen("supplyOrders" as GuestScreen);
    else if (path.endsWith("/vendor/products")) setScreen("vendorProducts" as GuestScreen);
    else if (path.endsWith("/guest-details")) setScreen("guestDetails");
    else if (path === "/partners" || path.endsWith("/partners")) setScreen("partnerLanding");
    else if (path.endsWith("/partner-onboarding")) setScreen("partnerOnboarding");
    else if (path.endsWith("/partner-dashboard")) setScreen("partnerDashboard");
    else if (path.endsWith("/partner-room-detail")) setScreen("partnerRoom");
    else if (path.endsWith("/partner-services")) setScreen("partnerServices");
    else if (path.endsWith("/partner-login")) setScreen("partnerLogin");
    else if (path.endsWith("/partner-properties")) setScreen("partnerProperties");
    else if (path.endsWith("/partner-inventory")) setScreen("partnerInventory");
    else if (path.endsWith("/partner-bookings")) setScreen("partnerBookings");
    else if (path.endsWith("/partner-payouts")) setScreen("partnerPayouts");
    else if (path.endsWith("/partner-support")) setScreen("partnerSupport");
    else if (path.endsWith("/partner-announcements")) setScreen("partnerAnnouncements");
    else if (path === "/admin/login" || path.endsWith("/admin/login")) setScreen("adminLogin");
    else if (path === "/admin" || path.endsWith("/admin/")) setScreen("adminConsole");
    else if (path.endsWith("/admin/properties")) setScreen("adminProperties");
    else if (path.endsWith("/admin/property-detail")) setScreen("adminPropertyDetail");
    else if (path.endsWith("/admin/supplier")) setScreen("adminSupplier" as GuestScreen);
    else if (path.endsWith("/admin/partner-detail")) setScreen("adminPartnerDetail");
    else if (path.endsWith("/admin/guest-detail")) setScreen("adminGuestDetail");
    else if (path.endsWith("/admin/users")) setScreen("adminUsers");
    else if (path.endsWith("/admin/team")) setScreen("adminTeam");
    else if (path.endsWith("/admin/finance")) setScreen("adminFinance");
    else if (path.endsWith("/admin/payouts")) setScreen("adminPayouts");
    else if (path.endsWith("/admin/payments")) setScreen("adminPayments" as GuestScreen);
    else if (path.endsWith("/admin/reports")) setScreen("adminReports");
    else if (path.endsWith("/admin/disputes")) setScreen("adminDisputes");
    else if (path.endsWith("/admin/moderation")) setScreen("adminModeration");
    else if (path.endsWith("/admin/risk")) setScreen("adminRisk");
    else if (path.endsWith("/admin/support")) setScreen("adminSupport");
    else if (path.endsWith("/admin/announcements")) setScreen("adminAnnouncements");
    else if (path.endsWith("/admin/settings")) setScreen("adminSettings");
    else if (path.endsWith("/admin/system")) setScreen("adminSystem");
    else if (path.endsWith("/admin/access-denied")) setScreen("adminAccessDenied");
    else if (path.endsWith("/rewards/dashboard")) setScreen("rewards");
    else if (path.endsWith("/rewards")) setScreen("rewardsLanding");
    else if (propertyPathMatch) {
      setSelectedProperty(decodeURIComponent(propertyPathMatch[1]));
      setScreen("hotel");
    } else if (path.endsWith("/destinations/all")) setScreen("destinations");
    else if (path.endsWith("/destinations/yogyakarta"))
      setScreen("destination");
    else if (path.endsWith("/destinations/bantul")) setScreen("bantul");
    else if (path.endsWith("/destinations/sleman")) setScreen("sleman");
    else if (path.endsWith("/destinations/bandung")) setScreen("bandung");
    else if (path.endsWith("/destinations/solo")) setScreen("solo");
    else if (path.endsWith("/destinations/malang")) setScreen("malang");
    else if (path.endsWith("/destinations/surabaya")) setScreen("surabaya");
    else if (path.endsWith("/destinations/denpasar")) setScreen("denpasar");
    else if (path.endsWith("/destinations/semarang")) setScreen("semarang");
    else if (path.endsWith("/destinations/jakarta")) setScreen("jakarta");
    else if (
      path === "/stays" ||
      path.endsWith("/stays") ||
      destination ||
      checkIn ||
      checkOut
    ) {
      setSearch({
        destination: destination ?? initialSearch.destination,
        checkIn: checkIn || initialSearch.checkIn,
        checkOut: checkOut || initialSearch.checkOut,
        adults,
        children,
        childAges: Array.from({ length: children }, (_, index) => childAges[index] ?? 5),
        guests: adults + children,
      });
      setScreen("search");
    } else if (path !== "/" && path !== "/en" && path !== "/en/" && path !== "/id" && path !== "/id/") {
      setScreen("notFound" as GuestScreen);
    }
  }, []);
  useEffect(() => {
    applyGlobalStructuredData();
    if (screen === "home") track('landing_page_view', { page_type: 'home', language });
  }, [screen, language]);
  useEffect(() => {
    // Screens with their own dynamic title/description (property, destination) manage
    // document.title themselves; this covers static public guest screens only.
    const meta: Partial<Record<GuestScreen, { title: string; description: string }>> = {
      home: {
        title: "Menetap — Stay better",
        description: "Search hotels, villas, and stays across Indonesia with transparent pricing and no hidden fees.",
      },
      search: {
        title: "Search stays | Menetap",
        description: "Compare available hotels, villas, and stays in Indonesia by date, guests, and price.",
      },
      destinations: {
        title: "All destinations | Menetap",
        description: "Explore Menetap destinations across Indonesia, including Yogyakarta, Bandung, Solo, and more.",
      },
      destination: {
        title: "Stays in Yogyakarta | Menetap",
        description: "Explore areas, properties, and travel tips for staying in Yogyakarta.",
      },
      bantul: {
        title: "Stays in Bantul | Menetap",
        description: "Explore areas, properties, and travel tips for staying in Bantul.",
      },
      sleman: {
        title: "Stays in Sleman | Menetap",
        description: "Explore areas, properties, and travel tips for staying in Sleman.",
      },
      bandung: {
        title: "Stays in Bandung | Menetap",
        description: "Explore areas, properties, and travel tips for staying in Bandung.",
      },
      solo: {
        title: "Stays in Solo | Menetap",
        description: "Explore areas, properties, and travel tips for staying in Solo.",
      },
      help: {
        title: "Help center | Menetap",
        description: "Find answers about bookings, payments, cancellations, and using Menetap.",
      },
      privacy: {
        title: "Privacy policy | Menetap",
        description: "How Menetap collects, uses, and protects guest information.",
      },
      terms: {
        title: "Terms of service | Menetap",
        description: "The terms that govern using Menetap to search and book stays.",
      },
      about: {
        title: "About Menetap",
        description: "Learn about Menetap and its mission to make booking stays in Indonesia simple and transparent.",
      },
      careers: {
        title: "Careers | Menetap",
        description: "Open roles at Menetap.",
      },
      cancellation: {
        title: "Cancellation policy | Menetap",
        description: "Understand cancellation windows, refund timing, and policy types on Menetap.",
      },
      rewardsLanding: {
        title: "Menetap Rewards",
        description: "Earn and redeem Menetap Rewards on eligible stays.",
      },
      experiences: {
        title: "Experiences | Menetap",
        description: "Browse local experiences and activities to add to your stay.",
      },
      supplyLanding: {
        title: "Hospitality supplies | Menetap",
        description: "Order linen, housekeeping, and guest amenity supplies for your property.",
      },
      supplyCatalog: {
        title: "Supply catalog | Menetap",
        description: "Browse hospitality supplies available to order on Menetap.",
      },
    };
    const indonesianMeta: Partial<Record<GuestScreen, { title: string; description: string }>> = {
      home: { title: "Menetap — Menginap lebih baik", description: "Cari hotel, vila, dan akomodasi di Indonesia dengan harga transparan tanpa biaya tersembunyi." },
      search: { title: "Cari penginapan | Menetap", description: "Bandingkan hotel, vila, dan akomodasi di Indonesia berdasarkan tanggal, tamu, dan harga." },
      destinations: { title: "Semua destinasi | Menetap", description: "Jelajahi destinasi Menetap di Indonesia, termasuk Yogyakarta, Bandung, Solo, dan lainnya." },
      help: { title: "Pusat bantuan | Menetap", description: "Temukan jawaban tentang pemesanan, pembayaran, pembatalan, dan penggunaan Menetap." },
      privacy: { title: "Kebijakan privasi | Menetap", description: "Cara Menetap mengumpulkan, menggunakan, dan melindungi informasi tamu." },
      terms: { title: "Ketentuan layanan | Menetap", description: "Ketentuan yang berlaku saat menggunakan Menetap untuk mencari dan memesan akomodasi." },
      cancellation: { title: "Kebijakan pembatalan | Menetap", description: "Pahami batas waktu pembatalan, waktu pengembalian dana, dan jenis kebijakan di Menetap." },
    };
    const entry = language === "ID" ? (indonesianMeta[screen] ?? meta[screen]) : meta[screen];
    if (!entry) return;
    document.title = entry.title;
    applySeo({ title: entry.title, description: entry.description, language });
    const setMeta = (attrName: "name" | "property", attrValue: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[${attrName}="${attrValue}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta("name", "description", entry.description);
    setMeta("property", "og:title", entry.title);
    setMeta("property", "og:description", entry.description);
  }, [screen]);
  if (authOpen)
    return (
      <div className={screen === "notFound" ? "app-shell not-found-shell" : "app-shell"}>
        <AuthPanel initialMode={authMode} onClose={() => setAuthOpen(false)} />
      </div>
    );
  const goToSearch = () => {
    track('search_start', { source: screen === 'home' ? 'homepage' : 'navigation', language });
    window.history.pushState({}, "", `/${language.toLowerCase()}/stays`);
    setScreen("search");
  };
  return (
    <div className={screen === "notFound" ? "app-shell not-found-shell" : "app-shell"}>
      {!screen.startsWith("partner") && !screen.startsWith("admin") && screen !== "notFound" && <Header
        language={language}
        setLanguage={setLanguage}
        onHome={() => {
          window.history.pushState({}, "", `/${language.toLowerCase()}`);
          setScreen("home");
        }}
          onAuth={() => { setAuthMode("signIn"); setAuthOpen(true); }}
        onSearch={goToSearch}
      />}
      {screen === "partnerLanding" && <PartnerLanding />}
      {screen === "partnerOnboarding" && <PartnerOnboarding />}
      {screen === "partnerDashboard" && <ProtectedScreen allowedRoles={["partner", "operations", "admin"]}><PartnerDashboard /></ProtectedScreen>}
      {screen === "partnerRoom" && <ProtectedScreen allowedRoles={["partner", "operations", "admin"]}><PartnerRoomDetail /></ProtectedScreen>}
      {screen === "partnerServices" && <ProtectedScreen allowedRoles={["partner", "operations", "admin"]}><PartnerServices /></ProtectedScreen>}
      {screen === "partnerLogin" && <PartnerLogin />}
      {screen === "partnerProperties" && <ProtectedScreen allowedRoles={["partner", "operations", "admin"]}><PartnerProperties /></ProtectedScreen>}
      {screen === "partnerInventory" && <ProtectedScreen allowedRoles={["partner", "operations", "admin"]}><PartnerInventory /></ProtectedScreen>}
      {screen === "partnerBookings" && <ProtectedScreen allowedRoles={["partner", "support", "operations", "admin"]}><PartnerBookings /></ProtectedScreen>}
      {screen === "partnerPayouts" && <ProtectedScreen allowedRoles={["partner", "finance", "operations", "admin"]}><PartnerPayouts /></ProtectedScreen>}
      {screen === "partnerSupport" && <ProtectedScreen allowedRoles={["partner", "support", "operations", "admin"]}><PartnerSupport /></ProtectedScreen>}
      {screen === "partnerAnnouncements" && <ProtectedScreen allowedRoles={["partner", "operations", "admin"]}><PartnerAnnouncements /></ProtectedScreen>}
      {screen === "adminLogin" && <AdminLogin />}
      {screen === "adminConsole" && <ProtectedScreen allowedRoles={["admin"]}><AdminUnavailable title="Commission & placements" /></ProtectedScreen>}
      {screen === "adminProperties" && <ProtectedScreen allowedRoles={["admin", "operations"]}><AdminProperties /></ProtectedScreen>}
      {screen === "adminPropertyDetail" && <ProtectedScreen allowedRoles={["admin", "operations"]}><AdminPropertyDetail /></ProtectedScreen>}
      {screen === "adminPartnerDetail" && <ProtectedScreen allowedRoles={["admin"]}><AdminPartnerDetail /></ProtectedScreen>}
      {screen === "adminGuestDetail" && <ProtectedScreen allowedRoles={["admin"]}><AdminUnavailable title="Guest detail" /></ProtectedScreen>}
      {screen === "adminUsers" && <ProtectedScreen allowedRoles={["admin"]}><AdminUnavailable title="Users" /></ProtectedScreen>}
      {screen === "adminTeam" && <ProtectedScreen allowedRoles={["admin"]}><AdminUnavailable title="Team & permissions" /></ProtectedScreen>}
      {screen === "adminFinance" && <ProtectedScreen allowedRoles={["admin", "finance"]}><AdminUnavailable title="Finance" /></ProtectedScreen>}
      {screen === "adminPayouts" && <ProtectedScreen allowedRoles={["admin", "finance"]}><AdminUnavailable title="Payouts" /></ProtectedScreen>}
      {screen === ("adminPayments" as GuestScreen) && <ProtectedScreen allowedRoles={["admin", "finance", "operations"]}><AdminPaymentsPage /></ProtectedScreen>}
      {screen === "adminReports" && <ProtectedScreen allowedRoles={["admin", "finance", "operations"]}><AdminUnavailable title="Reports" /></ProtectedScreen>}
      {screen === "adminDisputes" && <ProtectedScreen allowedRoles={["admin", "finance", "operations"]}><AdminDisputesPage /></ProtectedScreen>}
      {screen === "adminModeration" && <ProtectedScreen allowedRoles={["admin", "operations"]}><AdminQuickOpsPage kind="moderation" /></ProtectedScreen>}
      {screen === "adminRisk" && <ProtectedScreen allowedRoles={["admin", "finance"]}><AdminUnavailable title="Risk & fraud" /></ProtectedScreen>}
      {screen === "adminSupport" && <ProtectedScreen allowedRoles={["admin", "support", "operations"]}><AdminQuickOpsPage kind="support" /></ProtectedScreen>}
      {screen === "adminAnnouncements" && <ProtectedScreen allowedRoles={["admin"]}><AdminUnavailable title="Announcements" /></ProtectedScreen>}
      {screen === "adminSettings" && <ProtectedScreen allowedRoles={["admin"]}><AdminUnavailable title="Settings" /></ProtectedScreen>}
      {screen === "adminSystem" && <ProtectedScreen allowedRoles={["admin"]}><AdminUnavailable title="System health" /></ProtectedScreen>}
      {screen === "adminAccessDenied" && <AdminAccessDenied />}
      {screen === "home" && (
        <Home
          search={search}
          setSearch={setSearch}
          onSearch={goToSearch}
          onPropertySelect={(id) => {
            track('property_view', { source: 'homepage', property_type: 'accommodation' });
            setSelectedProperty(id);
            window.history.pushState(
              {},
              "",
              "/" +
                language.toLowerCase() +
                propertyPath(id, "stay"),
            );
            setScreen("hotel");
          }}
          language={language}
          setLanguage={setLanguage}
        />
      )}
      {screen === "notFound" && (
        <>
          <header className="not-found-dc-header"><div className="not-found-dc-wrap"><a className="wordmark not-found-wordmark" href={`/${language.toLowerCase()}`} aria-label="Menetap home">menetap<span>.</span></a><a className="not-found-login" href={`/${language.toLowerCase()}/login`}>Log in</a></div></header>
          <main className="not-found-dc not-found-dc-shared">
            <div className="not-found-card"><div className="not-found-illustration"><svg viewBox="0 0 520 63" aria-hidden="true"><path d="M10 45 Q 140 -10, 260 40 T 510 20" className="not-found-route-base"/><path d="M10 45 Q 140 -10, 260 40 T 510 20" className="not-found-route-dash"/></svg><div className="not-found-ticket"><MapPinOff size={26}/></div></div><h1 className="not-found-number" style={{ fontFamily: "'Plus Jakarta Sans', Arial, sans-serif", fontSize: 160, fontWeight: 800, lineHeight: 1 }}>404</h1><h2 style={{ fontFamily: "'Plus Jakarta Sans', Arial, sans-serif", fontSize: 26, fontWeight: 800, lineHeight: 1.25 }}>Looks like this trip got cancelled.</h2><p style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 14, fontWeight: 400, lineHeight: 1.7 }}>The page you were headed to isn't on the map<br/>anymore. Maybe try one of these instead?</p><div className="not-found-actions"><Button href={`/${language.toLowerCase()}`} variant="primary">Go home</Button><Button href={`/${language.toLowerCase()}/stays`} variant="secondary">Search stays</Button></div><div className="not-found-jump"><span>Or jump to:</span><a href={`/${language.toLowerCase()}/rentals`}><Car size={12}/> Rentals</a><a href={`/${language.toLowerCase()}/experiences`}><Compass size={12}/> Experiences</a><a href={`/${language.toLowerCase()}/rewards`}><Gift size={12}/> Rewards</a><a href={`/${language.toLowerCase()}/destinations/all`}><MapPin size={12}/> All destinations</a></div></div>
          </main>
          <footer className="not-found-dc-footer"><div className="not-found-dc-wrap"><span>© 2026 Menetap. All rights reserved.</span><span className="not-found-managed">Managed by <a href="https://upscale.asia" target="_blank" rel="noreferrer">UPSCALE</a></span></div></footer>
        </>
      )}
      {screen === "search" && (
        <SearchResults
          search={search}
          setSearch={setSearch}
          onBack={() => setScreen("home")}
          onSelect={(id) => {
            track('property_view', { source: 'search', property_type: 'accommodation' });
            setSelectedProperty(id);
            window.history.pushState(
              {},
              "",
              "/" +
                language.toLowerCase() +
                propertyPath(id, "stay"),
            );
            setScreen("hotel");
          }}
          language={language}
          setLanguage={setLanguage}
        />
      )}
      {screen === "destinations" && (
        <AllDestinations language={language} setLanguage={setLanguage} />
      )}
      {screen === "destination" && (
        <DestinationLanding
          onExplore={goToSearch}
          language={language}
          setLanguage={setLanguage}
        />
      )}
      {screen === "bantul" && (
        <BantulLanding language={language} setLanguage={setLanguage} />
      )}
      {screen === "sleman" && (
        <SlemanLanding language={language} setLanguage={setLanguage} />
      )}
      {screen === "bandung" && (
        <BandungLanding language={language} setLanguage={setLanguage} />
      )}
      {screen === "solo" && (
        <SoloLanding language={language} setLanguage={setLanguage} />
      )}{" "}
      {screen === "malang" && (
        <CityDestinationLanding
          slug="malang"
          language={language}
          setLanguage={setLanguage}
          Footer={Footer}
        />
      )}{" "}
      {screen === "surabaya" && (
        <CityDestinationLanding
          slug="surabaya"
          language={language}
          setLanguage={setLanguage}
          Footer={Footer}
        />
      )}{" "}
      {screen === "denpasar" && (
        <CityDestinationLanding
          slug="denpasar"
          language={language}
          setLanguage={setLanguage}
          Footer={Footer}
        />
      )}{" "}
      {screen === "semarang" && (
        <CityDestinationLanding
          slug="semarang"
          language={language}
          setLanguage={setLanguage}
          Footer={Footer}
        />
      )}{" "}
      {screen === "jakarta" && (
        <CityDestinationLanding
          slug="jakarta"
          language={language}
          setLanguage={setLanguage}
          Footer={Footer}
        />
      )}
      {screen === "hotel" && (
        <HotelDetail
          propertyId={selectedProperty}
          onBack={() => {
            window.history.pushState(
              {},
              "",
              "/" + language.toLowerCase() + "/stays",
            );
            setScreen("search");
          }}
          onRooms={() => setScreen("rooms")}
        />
      )}
      {screen === "rooms" && (
        <RoomSelection
          propertyId={selectedProperty}
          search={search}
          setSearch={setSearch}
          onBack={() => setScreen("hotel")}
          onContinue={(id) => {
            setSelectedRoom(id);
            setScreen("checkout");
          }}
        />
      )}
      {screen === "checkout" && (
        <Checkout
          propertyId={selectedProperty}
          roomTypeId={selectedRoom}
          search={search}
          onBack={() => setScreen("rooms")}
          onComplete={(code) => {
            setBookingCode(code);
            setScreen("confirmation");
          }}
        />
      )}
      {screen === "guestDetails" && <ProtectedScreen allowedRoles={["guest", "partner", "vendor", "support", "operations", "finance", "admin"]}><GuestDetails /></ProtectedScreen>}
      {screen === "myTrips" && <ProtectedScreen allowedRoles={["guest", "partner", "vendor", "support", "operations", "finance", "admin"]}><MyTrips /><RentalTripsSection /></ProtectedScreen>}
      {screen === "saved" && <ProtectedScreen allowedRoles={["guest", "partner", "vendor", "support", "operations", "finance", "admin"]}><SavedStays /></ProtectedScreen>}
      {screen === "paymentMethods" && <ProtectedScreen allowedRoles={["guest", "partner", "vendor", "support", "operations", "finance", "admin"]}><PaymentMethods /></ProtectedScreen>}
      {screen === "settings" && <ProtectedScreen allowedRoles={["guest", "partner", "vendor", "support", "operations", "finance", "admin"]}><GuestSettings /></ProtectedScreen>}
      {screen === "bookingIssue" && <BookingIssue />}
      {screen === "duringStay" && <DuringStay />}
      {screen === "experiences" && <><ExperiencesLanding /><Footer language={language} setLanguage={setLanguage} /></>}
      {screen === "rentalsLanding" && <><RentalsV2 /><Footer language={language} setLanguage={setLanguage} /></>}
      {screen === "rentalSearch" && <RentalSearch />}
      {screen === ("rentalConfirmation" as GuestScreen) && <RentalConfirmation />}
      {screen === ("adminRentals" as GuestScreen) && <ProtectedScreen allowedRoles={["admin", "operations", "finance"]}><RentalAdmin /></ProtectedScreen>}
      {screen === "experienceDetail" && <ExperienceDetail />}
      {screen === "supplyLanding" && <ProtectedScreen allowedRoles={["partner", "operations", "admin"]}><SupplyLanding /></ProtectedScreen>}
      {screen === "supplyCatalog" && <ProtectedScreen allowedRoles={["partner", "operations", "admin"]}><SupplierCatalog /></ProtectedScreen>}
      {screen === "supplyCheckout" && <ProtectedScreen allowedRoles={["partner", "operations", "admin"]}><SupplierCheckout /></ProtectedScreen>}
      {screen === "supplyConfirmation" && <ProtectedScreen allowedRoles={["partner", "operations", "admin"]}><SupplierConfirmation /></ProtectedScreen>}
      {screen === ("supplyOrders" as GuestScreen) && <ProtectedScreen allowedRoles={["partner", "operations", "admin"]}><SupplierOrders /></ProtectedScreen>}
      {screen === ("vendorProducts" as GuestScreen) && <ProtectedScreen allowedRoles={["vendor"]}><VendorProducts /></ProtectedScreen>}
      {screen === ("adminSupplier" as GuestScreen) && <ProtectedScreen allowedRoles={["operations", "admin", "finance"]}><SupplierAdmin /></ProtectedScreen>}
      {screen === "confirmation" && (
        <Confirmation code={bookingCode} onHome={() => setScreen("home")} />
      )}
      {screen === "rewardsLanding" && <RewardsLanding />}
      {screen === "rewards" && <ProtectedScreen allowedRoles={["guest", "partner", "vendor", "support", "operations", "finance", "admin"]}><LiveRewardsPage /></ProtectedScreen>}
      {screen === "help" && <HelpCenter />}
      {screen === "privacy" && <LegalPage kind="privacy" />}
      {screen === "terms" && <LegalPage kind="terms" />}
      {screen === "about" && <CompanyPage kind="about" />}
      {screen === "careers" && <CompanyPage kind="careers" />}
      {screen === "cancellation" && <CancellationPolicy />}
    </div>
  );
}

function Header({
  language,
  setLanguage,
  onHome,
  onAuth,
  onSearch,
}: {
  language: "EN" | "ID";
  setLanguage: (language: "EN" | "ID") => void;
  onHome: () => void;
  onAuth: () => void;
  onSearch: () => void;
}) {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  return (
    <header className="nav dc-topbar">
      <div className="dc-topbar-inner">
        <button className="wordmark nav-button" onClick={onHome}>
          menetap<span>.</span>
        </button>
        <nav className="dc-navlinks">
          <button onClick={onSearch}>Stays</button>
          <button onClick={() => window.location.assign(`/${language.toLowerCase()}/rentals`)}>Rentals <span className="nav-beta">BETA</span></button>
          <button onClick={() => window.location.assign(`/${language.toLowerCase()}/experiences`)}>Experiences <span className="nav-beta">BETA</span></button>
        </nav>
        <div className="nav-actions dc-nav-actions">
          <div className="desktop-language-toggle">
            <LanguageToggle language={language} setLanguage={setLanguage} />
          </div>
          {isAuthenticated ? (
            <button onClick={() => void signOut()}>Log out</button>
          ) : (
            <>
              <button onClick={onAuth}>Log in</button>
              <button className="outline-button" onClick={onAuth}>
                Sign up
              </button>
            </>
          )}
          <button
            type="button"
            className="mobile-menu-button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="mobile-menu-panel">
          <button
            onClick={() => {
              onSearch();
              closeMenu();
            }}
          >
            Stays
          </button>
          <button
            onClick={() => {
              window.location.assign(`/${language.toLowerCase()}/rentals`);
              closeMenu();
            }}
          >
            Rentals <span className="nav-beta">BETA</span>
          </button>
          <button
            onClick={() => {
              window.location.assign(`/${language.toLowerCase()}/experiences`);
              closeMenu();
            }}
          >
            Experiences <span className="nav-beta">BETA</span>
          </button>
          <LanguageToggle language={language} setLanguage={setLanguage} />
        </div>
      )}
    </header>
  );
}
function Home({
  search,
  setSearch,
  onSearch,
  onPropertySelect,
  language,
  setLanguage,
}: {
  search: SearchState;
  setSearch: (value: SearchState) => void;
  onSearch: () => void;
  onPropertySelect: (id: string) => void;
  language: "EN" | "ID";
  setLanguage: (language: "EN" | "ID") => void;
}) {
  const [selectedCity, setSelectedCity] = useState("Yogyakarta");
  const [searchError, setSearchError] = useState("");
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsSearchSticky(window.scrollY > 180);
      setShowBackToTop(window.scrollY > 420);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const cities = [
    "Yogyakarta",
    "Bandung",
    "Semarang",
    "Malang",
    "Solo",
    "Surabaya",
  ];
  const cityProperties = useQuery(api.properties.listPublished, {
    area: selectedCity,
  });
  const runSearch = () => {
    if (!search.destination.trim())
      return setSearchError("Choose a destination.");
    if (
      !search.checkIn ||
      !search.checkOut ||
      search.checkOut <= search.checkIn
    )
      return setSearchError("Choose a valid check-in and check-out date.");
    setSearchError("");
    const params = new URLSearchParams({
      destination: search.destination,
      checkIn: search.checkIn,
      checkOut: search.checkOut,
      adults: String(search.adults),
      children: String(search.children),
      childAges: search.childAges.join(","),
    });
    window.history.replaceState(
      {},
      "",
      `/${language.toLowerCase()}/stays?${params}`,
    );
    onSearch();
  };
  return (
    <main>
      <button
        type="button"
        className={`back-to-top ${showBackToTop ? "is-visible" : ""}`}
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowUp size={18} />
      </button>
      <section className="hero dc-hero">
        <div className="hero-badge">
          <Zap size={14} /> Priced by UPSCALE&apos;s revenue engine — no
          guesswork
        </div>
        <h1>
          Find your stay anywhere in Indonesia. <em>See the real price.</em>
        </h1>
        <p className="hero-copy">
          No inflated rack rates, no fake discounts, no surprise fees at
          checkout. What you see is what you pay.
        </p>
        <div
          className={`homepage-search-shell ${isSearchSticky ? "is-sticky" : ""}`}
        >
          <SearchBar
            search={search}
            setSearch={setSearch}
            onSearch={runSearch}
            onPropertySelect={onPropertySelect}
            compact={isSearchSticky && window.innerWidth > 760}
            error={searchError}
          />
        </div>
        <div className="hero-assurances">
          <span>
            <RefreshCcw size={13} /> Free cancellation on most stays
          </span>
          <span>
            <ShieldCheck size={13} /> Secure payment
          </span>
          <span>
            <Gift size={13} /> Earn Menetap Rewards on this booking
          </span>
        </div>
      </section>
      <section className="section destination-section">
        <div className="section-heading centered-heading">
          <h2>Popular across Indonesia right now</h2>
        </div>
        <div className="destination-pills">
          {cities.map((city) => (
            <button
              key={city}
              className={`pill ${selectedCity === city ? "selected" : ""}`}
              onClick={() => setSelectedCity(city)}
            >
              {city}
            </button>
          ))}
        </div>
        <div className="section-heading stays-heading">
          <h3>Stays in {selectedCity}</h3>
          <span className="muted">See all →</span>
        </div>
        <div className="stay-grid compact-stay-grid">
          {cityProperties === undefined ? (
            <LoadingState label={`Finding stays in ${selectedCity}…`} />
          ) : cityProperties.length ? (
            cityProperties.slice(0, 3).map((property) => (
              <PropertyCard
                key={property._id}
                name={property.name}
                type={property.type}
                area={property.area}
                city={property.city}
                price={
                  property.lowestPrice
                    ? "Rp " + property.lowestPrice.toLocaleString("en-US")
                    : "Price on request"
                }
                amenities={
                  property.amenities?.length
                    ? property.amenities.slice(0, 2)
                    : []
                }
                onSelect={() => onPropertySelect(property._id)}
              />
            ))
          ) : (
            <EmptyState
              title={`No published stays in ${selectedCity} yet`}
              text="Check back soon, or search another city."
            />
          )}
        </div>
      </section>
      <TrustStrip />
      <FeaturedSection onSelect={onPropertySelect} />
      <PricingSection />
      <RecommendedSection onSelect={onPropertySelect} />
      <PriceAlert />
      <PopularDestinations language={language} />
      <ExperienceSection />
      <Footer language={language} setLanguage={setLanguage} />
    </main>
  );
}

function LanguageToggle({
  language,
  setLanguage,
}: {
  language: "EN" | "ID";
  setLanguage: (language: "EN" | "ID") => void;
}) {
  const switchLanguage = (nextLanguage: "EN" | "ID") => {
    const path = window.location.pathname;
    const localizedPath =
      path.replace(/^\/(en|id)(?=\/|$)/, `/${nextLanguage.toLowerCase()}`) ||
      `/${nextLanguage.toLowerCase()}`;
    window.history.replaceState(
      {},
      "",
      `${localizedPath}${window.location.search}`,
    );
    setLanguage(nextLanguage);
  };
  return (
    <div className="language-toggle">
      <button
        className={language === "EN" ? "active" : ""}
        onClick={() => switchLanguage("EN")}
      >
        EN
      </button>
      <button
        className={language === "ID" ? "active" : ""}
        onClick={() => switchLanguage("ID")}
      >
        ID
      </button>
    </div>
  );
}

function TrustStrip() {
  return (
    <section className="trust-strip">
      <span>
        <ShieldCheck size={16} /> Secure payment
      </span>
      <span>
        <CheckCircle2 size={16} /> Instant confirmation
      </span>
      <span>
        <RefreshCcw size={16} /> Flexible cancellation
      </span>
      <span>
        <Award size={16} /> Menetap Rewards on every stay
      </span>
    </section>
  );
}
function DestinationLanding({
  onExplore,
  language,
  setLanguage,
}: {
  onExplore: () => void;
  language: "EN" | "ID";
  setLanguage: (language: "EN" | "ID") => void;
}) {
  const prefix = `/${language.toLowerCase()}`;
  return (
    <>
      <main className="destination-landing page">
        <p className="eyebrow">Explore Yogyakarta</p>
        <h1>Find a stay in the city’s most distinctive neighborhoods.</h1>
        <p className="destination-intro">
          Stay close to Malioboro’s city pulse, settle into Prawirotaman’s café
          streets, or choose a quieter base around Kotabaru and Mantrijeron.
        </p>
        <div className="destination-actions">
          <button onClick={onExplore}>Explore Yogyakarta stays</button>
          <a href="#destination-areas">Choose an area</a>
        </div>
        <section id="destination-areas" className="destination-area-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Stay by neighborhood</p>
              <h2>Find your part of the city</h2>
            </div>
          </div>
          <div className="destination-area-grid">
            <a
              className="destination-area-card"
              href={`${prefix}/stays?destination=Prawirotaman`}
            >
              <strong>Prawirotaman</strong>
              <p>
                Cafés, galleries, local restaurants, and an easygoing
                neighborhood rhythm.
              </p>
              <span>Browse Prawirotaman stays →</span>
            </a>
            <a
              className="destination-area-card"
              href={`${prefix}/stays?destination=Malioboro`}
            >
              <strong>Malioboro</strong>
              <p>
                Central, lively, and close to the station, markets, and city
                landmarks.
              </p>
              <span>Browse Malioboro stays →</span>
            </a>
            <a
              className="destination-area-card"
              href={`${prefix}/stays?destination=Kotabaru`}
            >
              <strong>Kotabaru</strong>
              <p>
                Leafy streets, heritage homes, and a calmer central-Yogyakarta
                base.
              </p>
              <span>Browse Kotabaru stays →</span>
            </a>
            <a
              className="destination-area-card"
              href={`${prefix}/stays?destination=Mantrijeron`}
            >
              <strong>Mantrijeron</strong>
              <p>
                Creative spaces, traditional neighborhoods, and a slower
                southern-city feel.
              </p>
              <span>Browse Mantrijeron stays →</span>
            </a>
          </div>
        </section>
        <section className="destination-properties">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A few places to start</p>
              <h2>Properties guests can compare</h2>
            </div>
            <a href={`${prefix}/stays?destination=Yogyakarta`}>
              See all Yogyakarta stays →
            </a>
          </div>
          <div className="destination-property-grid">
            <article>
              <div className="property-image">Boutique hotel</div>
              <div>
                <h3>Prawirotaman Boutique</h3>
                <p>Prawirotaman · cafés nearby</p>
                <a href={`${prefix}/stays?destination=Prawirotaman`}>
                  View availability →
                </a>
              </div>
            </article>
            <article>
              <div className="property-image">City suites</div>
              <div>
                <h3>Malioboro Skyline Suites</h3>
                <p>Malioboro · central location</p>
                <a href={`${prefix}/stays?destination=Malioboro`}>
                  View availability →
                </a>
              </div>
            </article>
            <article>
              <div className="property-image">Heritage stay</div>
              <div>
                <h3>Kotabaru Heritage House</h3>
                <p>Kotabaru · quiet central base</p>
                <a href={`${prefix}/stays?destination=Kotabaru`}>
                  View availability →
                </a>
              </div>
            </article>
          </div>
        </section>
        <section className="destination-faq">
          <p className="eyebrow">Yogyakarta travel questions</p>
          <h2>Plan the practical details</h2>
          <details>
            <summary>Which neighborhood is best for a first visit?</summary>
            <p>
              Malioboro is central and convenient; Prawirotaman is a better fit
              for cafés, restaurants, and a slower evening atmosphere.
            </p>
          </details>
          <details>
            <summary>Where can I stay for a quieter city break?</summary>
            <p>
              Kotabaru and Mantrijeron offer a calmer city base while keeping
              Yogyakarta’s main sights within reach.
            </p>
          </details>
          <details>
            <summary>Can I search Yogyakarta stays by dates?</summary>
            <p>
              Yes. Use the stays search to set your dates and guest count, then
              compare live availability and prices across the city.
            </p>
          </details>
        </section>
        <nav
          className="destination-internal-links"
          aria-label="Yogyakarta travel links"
        >
          <a href={`${prefix}/destinations/all`}>All destinations</a>
          <a href={`${prefix}/stays?destination=Yogyakarta`}>
            All Yogyakarta stays
          </a>
          <a href={`${prefix}/stays?destination=Prawirotaman`}>
            Prawirotaman hotels
          </a>
          <a href={`${prefix}/stays?destination=Malioboro`}>Malioboro stays</a>
          <a href={`${prefix}/stays?destination=Kotabaru`}>Kotabaru stays</a>
          <a href={`${prefix}/stays?destination=Mantrijeron`}>
            Mantrijeron stays
          </a>
        </nav>
      </main>
      <Footer language={language} setLanguage={setLanguage} />
    </>
  );
}
function PropertyCard({
  name,
  type = "hotel",
  area,
  city,
  price,
  rating,
  reviewCount,
  amenities = ["Free cancellation"],
  badge,
  scarcity,
  onSelect,
}: {
  name: string;
  type?: string;
  area: string;
  city?: string;
  price: string;
  rating?: string;
  reviewCount?: string;
  amenities?: string[];
  badge?: string;
  scarcity?: string;
  onSelect?: () => void;
}) {
  const content = (
    <>
      <div className="property-card-media">
        <div className="property-image">{type}</div>
        {badge && <span className="featured-badge">{badge}</span>}
        {scarcity && <span className="scarcity-badge">{scarcity}</span>}
      </div>
      <div className="property-card-body">
        <div className="property-card-heading">
          <div>
            <span className="eyebrow">{type}</span>
            <h3>{name}</h3>
            <p>
              {area}
              {city ? ` · ${city}` : ""}
            </p>
          </div>
          {rating && (
            <span className="rating">
              <Star size={11} /> {rating}
              {reviewCount ? ` · ${reviewCount}` : ""}
            </span>
          )}
        </div>
        <div className="tags">
          {amenities.map((amenity) => (
            <span className="amenity-pill" key={amenity}>
              {amenity}
            </span>
          ))}
        </div>
        <div className="property-card-footer">
          <strong>
            {price}
            <small>/night</small>
          </strong>
          {onSelect && (
            <span className="property-card-action">View rooms →</span>
          )}
        </div>
      </div>
    </>
  );
  return (
    <article
      className={`property-card ${onSelect ? "is-clickable" : ""}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (onSelect && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onSelect();
        }
      }}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      {content}
    </article>
  );
}
function FeaturedSection({ onSelect }: { onSelect: (id: string) => void }) {
  const properties = useQuery(api.properties.listPublished, {
    area: "Yogyakarta",
  });
  if (properties !== undefined && !properties.length) return null;
  return (
    <section className="section featured-section">
      <div className="section-heading">
        <h2>Featured in Yogyakarta</h2>
        <span className="muted">See all stays →</span>
      </div>
      <div className="stay-grid">
        {properties === undefined ? (
          <LoadingState label="Finding featured stays…" />
        ) : (
          properties.slice(0, 3).map((property) => (
            <PropertyCard
              key={property._id}
              name={property.name}
              type={property.type}
              area={property.area}
              city={property.city}
              price={
                property.lowestPrice
                  ? "Rp " + property.lowestPrice.toLocaleString("en-US")
                  : "Price on request"
              }
              amenities={
                property.amenities?.length
                  ? property.amenities.slice(0, 2)
                  : []
              }
              onSelect={() => onSelect(property._id)}
            />
          ))
        )}
      </div>
    </section>
  );
}
function PricingSection() {
  return (
    <section className="pricing-section">
      <div>
        <p className="eyebrow">Why Menetap</p>
        <h2>The price you see is the price you pay.</h2>
        <p className="muted">
          Every rate is checked against real market data. No hidden service
          fees—the total you see at search is your total at checkout.
        </p>
        <a href="#pricing">Learn how pricing works →</a>
      </div>
      <div className="rate-card">
        <div className="rate-heading">
          <span>Rate breakdown</span>
          <b>Live pricing</b>
        </div>
        <div className="rate-row">
          <span>Market comparison</span>
          <strong>Shown at search</strong>
        </div>
        <div className="rate-row">
          <span>Your stay rate</span>
          <strong className="violet">Based on your stay</strong>
        </div>
        <div className="rate-total">
          <span>Total before checkout</span>
          <strong>Shown before checkout</strong>
        </div>
        <div className="rate-bar">
          <i />
        </div>
        <small>
          Compare live room rates and see the full total before you book — no hidden fees.
        </small>
      </div>
    </section>
  );
}
function RecommendedSection({ onSelect }: { onSelect: (id: string) => void }) {
  const properties = useQuery(api.properties.listPublished, {});
  const otherProperties = properties?.filter(
    (property) => property.area !== "Greater Yogyakarta",
  );
  if (otherProperties !== undefined && !otherProperties.length) return null;
  return (
    <section className="section recommended-section">
      <div className="section-heading">
        <h2>More stays to explore</h2>
        <span className="muted">Across Menetap destinations</span>
      </div>
      <div className="stay-grid">
        {otherProperties === undefined ? (
          <LoadingState label="Finding more stays…" />
        ) : (
          otherProperties.slice(0, 3).map((property) => (
            <PropertyCard
              key={property._id}
              name={property.name}
              type={property.type}
              area={property.area}
              city={property.city}
              price={
                property.lowestPrice
                  ? "Rp " + property.lowestPrice.toLocaleString("en-US")
                  : "Price on request"
              }
              amenities={
                property.amenities?.length
                  ? property.amenities.slice(0, 2)
                  : []
              }
              onSelect={() => onSelect(property._id)}
            />
          ))
        )}
      </div>
    </section>
  );
}
function PriceAlert() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  return (
    <section className="price-alert">
      <div>
        <h3>Get a nudge when hotel prices drop</h3>
        <p>
          We&apos;ll email you the moment rates for your dates fall below
          today&apos;s price.
        </p>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (email) setSubmitted(true);
        }}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@email.com"
        />
        <Button type="submit">
          {submitted ? "You&apos;re on the list" : "Alert me"}
        </Button>
      </form>
    </section>
  );
}
function PopularDestinations({ language }: { language: "EN" | "ID" }) {
  const prefix = "/" + language.toLowerCase();
  return (
    <section className="section popular-destinations">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Explore more</p>
          <h2>Popular destinations</h2>
        </div>
        <a className="muted" href={`${prefix}/destinations/all`}>
          Go beyond the city →
        </a>
      </div>
      <div className="popular-destination-grid">
        <a href={prefix + "/destinations/yogyakarta"}>
          <div className="destination-card-image">
            <img
              src="/images/destinations/yogyakarta.webp"
              alt="Yogyakarta heritage street with traditional Javanese architecture"
              width="1600"
              height="1200"
              loading="lazy"
            />
          </div>
          <div>
            <h3>Yogyakarta</h3>
            <p>City stays, café streets, and heritage neighborhoods.</p>
            <span>Explore destination →</span>
          </div>
        </a>
        <a href={prefix + "/destinations/bantul"}>
          <div className="destination-card-image">
            <img
              src="/images/destinations/bantul.webp"
              alt="Bantul pottery artisan working in a traditional Javanese craft studio"
              width="1600"
              height="1200"
              loading="lazy"
            />
          </div>
          <div>
            <h3>Bantul</h3>
            <p>Craft villages, open landscapes, and slower southern stays.</p>
            <span>Explore destination →</span>
          </div>
        </a>
        <a href={prefix + "/destinations/bandung"}>
          <div className="destination-card-image">
            <img
              src="/images/destinations/bandung.webp"
              alt="Gedung Sate landmark in Bandung"
              width="1600"
              height="1200"
              loading="lazy"
            />
          </div>
          <div>
            <h3>Bandung</h3>
            <p>Cool mornings, creative corners, and neighborhood stays.</p>
            <span>Explore destination →</span>
          </div>
        </a>
        <a href={prefix + "/destinations/solo"}>
          <div className="destination-card-image">
            <img
              src="/images/destinations/solo.webp"
              alt="Pura Mangkunegaran palace in Solo"
              width="1600"
              height="1200"
              loading="lazy"
            />
          </div>
          <div>
            <h3>Solo</h3>
            <p>Royal heritage, batik, and an easy city rhythm.</p>
            <span>Explore destination →</span>
          </div>
        </a>
      </div>
    </section>
  );
}
function ExperienceSection() {
  const experiences = [
    ["Borobudur sunrise tour", "Rp 350,000/person", "sunrise"],
    ["Merapi jeep adventure", "Rp 275,000/person", "mountain"],
    ["Batik-making class", "Rp 180,000/person", "craft"],
    ["Ratu Boko sunset walk", "Rp 150,000/person", "sunset"],
  ];
  return (
    <section className="section">
      <div className="section-heading">
        <h2>Add local experiences</h2>
        <span className="muted">See all →</span>
      </div>
      <div className="experience-grid">
        {experiences.map(([name, price, tone]) => (
          <article
            className={`experience-card experience-card-${tone}`}
            key={name}
          >
            <div
              className="experience-photo"
              role="img"
              aria-label={`${name} experience photo`}
            >
              <span>Photo</span>
            </div>
            <div className="experience-card-content">
              <strong>{name}</strong>
              <small>From {price}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
function BandungLanding({
  language,
  setLanguage,
}: {
  language: "EN" | "ID";
  setLanguage: (language: "EN" | "ID") => void;
}) {
  const prefix = "/" + language.toLowerCase();
  return (
    <>
      <main className="destination-landing page">
        <p className="eyebrow">Explore Bandung</p>
        <h1>Cool mornings, creative corners, and a city made for wandering.</h1>
        <p className="destination-intro">
          Bandung brings together design, food, green escapes, and neighborhoods
          with their own distinct rhythm.
        </p>
        <div className="destination-actions">
          <a href={`${prefix}/stays?destination=Bandung`}>
            Explore Bandung stays
          </a>
          <a href="#bandung-areas">Choose an area</a>
        </div>
        <section id="bandung-areas" className="destination-area-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Stay by neighborhood</p>
              <h2>Find your Bandung base</h2>
            </div>
          </div>
          <div className="destination-area-grid">
            <a
              className="destination-area-card"
              href={`${prefix}/stays?destination=Dago`}
            >
              <strong>Dago</strong>
              <p>Hill air, creative cafés, galleries, and leafy city views.</p>
              <span>Browse Dago stays →</span>
            </a>
            <a
              className="destination-area-card"
              href={`${prefix}/stays?destination=Braga`}
            >
              <strong>Braga</strong>
              <p>
                Heritage architecture, restaurants, and Bandung’s classic city
                energy.
              </p>
              <span>Browse Braga stays →</span>
            </a>
            <a
              className="destination-area-card"
              href={`${prefix}/stays?destination=Setiabudi`}
            >
              <strong>Setiabudi</strong>
              <p>
                Cooler northern streets, family-friendly stays, and easy access
                to green escapes.
              </p>
              <span>Browse Setiabudi stays →</span>
            </a>
          </div>
        </section>
        <section className="destination-properties">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Places to start</p>
              <h2>Properties to compare</h2>
            </div>
            <a href={`${prefix}/stays?destination=Bandung`}>
              See all Bandung stays →
            </a>
          </div>
          <div className="destination-property-grid">
            <article>
              <div className="property-image">Design hotel</div>
              <div>
                <h3>Braga House Hotel</h3>
                <p>Braga · heritage city center</p>
                <a href={`${prefix}/stays?destination=Braga`}>
                  View availability →
                </a>
              </div>
            </article>
            <article>
              <div className="property-image">Hill stay</div>
              <div>
                <h3>Dago Hillside Stay</h3>
                <p>Dago · cafés and cooler air</p>
                <a href={`${prefix}/stays?destination=Dago`}>
                  View availability →
                </a>
              </div>
            </article>
            <article>
              <div className="property-image">Garden hotel</div>
              <div>
                <h3>Setiabudi Garden Suites</h3>
                <p>Setiabudi · northern Bandung</p>
                <a href={`${prefix}/stays?destination=Setiabudi`}>
                  View availability →
                </a>
              </div>
            </article>
          </div>
        </section>
        <section className="destination-faq">
          <p className="eyebrow">Bandung travel questions</p>
          <h2>Plan the practical details</h2>
          <details>
            <summary>Which Bandung area is best for a first visit?</summary>
            <p>
              Braga is central and heritage-rich, while Dago is a good fit for
              cafés, views, and a cooler hill atmosphere.
            </p>
          </details>
          <details>
            <summary>Where can I stay for a quieter Bandung trip?</summary>
            <p>
              Setiabudi and the northern neighborhoods offer more space and
              easier access to green escapes.
            </p>
          </details>
          <details>
            <summary>Can I compare Bandung stays by dates?</summary>
            <p>
              Yes. Set your dates and guest count in the stays search to compare
              live availability and prices.
            </p>
          </details>
        </section>
        <nav
          className="destination-internal-links"
          aria-label="Bandung travel links"
        >
          <a href={`${prefix}/destinations/all`}>All destinations</a>
          <a href={`${prefix}/stays?destination=Bandung`}>All Bandung stays</a>
          <a href={`${prefix}/stays?destination=Dago`}>Dago stays</a>
          <a href={`${prefix}/stays?destination=Braga`}>Braga hotels</a>
          <a href={`${prefix}/stays?destination=Setiabudi`}>Setiabudi stays</a>
        </nav>
      </main>
      <Footer language={language} setLanguage={setLanguage} />
    </>
  );
}
function SoloLanding({
  language,
  setLanguage,
}: {
  language: "EN" | "ID";
  setLanguage: (language: "EN" | "ID") => void;
}) {
  const prefix = "/" + language.toLowerCase();
  return (
    <>
      <main className="destination-landing page">
        <p className="eyebrow">Explore Solo</p>
        <h1>Royal heritage, riverside evenings, and an easy city rhythm.</h1>
        <p className="destination-intro">
          Solo is compact, welcoming, and rich with culture—from palace
          neighborhoods and batik workshops to food streets made for lingering.
        </p>
        <div className="destination-actions">
          <a href={`${prefix}/stays?destination=Solo`}>Explore Solo stays</a>
          <a href="#solo-areas">Choose an area</a>
        </div>
        <section id="solo-areas" className="destination-area-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Stay by neighborhood</p>
              <h2>Find your Solo base</h2>
            </div>
          </div>
          <div className="destination-area-grid">
            <a
              className="destination-area-card"
              href={`${prefix}/stays?destination=Laweyan`}
            >
              <strong>Laweyan</strong>
              <p>
                Batik heritage, quiet lanes, and historic kampung character.
              </p>
              <span>Browse Laweyan stays →</span>
            </a>
            <a
              className="destination-area-card"
              href={`${prefix}/stays?destination=Pasar Gede`}
            >
              <strong>Pasar Gede</strong>
              <p>
                Food stalls, market mornings, and the city’s everyday energy.
              </p>
              <span>Browse Pasar Gede stays →</span>
            </a>
            <a
              className="destination-area-card"
              href={`${prefix}/stays?destination=Manahan`}
            >
              <strong>Manahan</strong>
              <p>Open green space, local cafés, and a relaxed central base.</p>
              <span>Browse Manahan stays →</span>
            </a>
          </div>
        </section>
        <section className="destination-properties">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Places to start</p>
              <h2>Properties to compare</h2>
            </div>
            <a href={`${prefix}/stays?destination=Solo`}>
              See all Solo stays →
            </a>
          </div>
          <div className="destination-property-grid">
            <article>
              <div className="property-image">Batik house</div>
              <div>
                <h3>Laweyan Heritage House</h3>
                <p>Laweyan · batik quarter</p>
                <a href={`${prefix}/stays?destination=Laweyan`}>
                  View availability →
                </a>
              </div>
            </article>
            <article>
              <div className="property-image">City hotel</div>
              <div>
                <h3>Pasar Gede City Hotel</h3>
                <p>Pasar Gede · market nearby</p>
                <a href={`${prefix}/stays?destination=Pasar%20Gede`}>
                  View availability →
                </a>
              </div>
            </article>
            <article>
              <div className="property-image">Garden stay</div>
              <div>
                <h3>Manahan Garden Stay</h3>
                <p>Manahan · quiet central base</p>
                <a href={`${prefix}/stays?destination=Manahan`}>
                  View availability →
                </a>
              </div>
            </article>
          </div>
        </section>
        <section className="destination-faq">
          <p className="eyebrow">Solo travel questions</p>
          <h2>Plan the practical details</h2>
          <details>
            <summary>What is Solo best known for?</summary>
            <p>
              Solo is known for palace heritage, batik, traditional performance,
              and a food culture that rewards slow exploration.
            </p>
          </details>
          <details>
            <summary>Which area is best for a first visit?</summary>
            <p>
              Laweyan is ideal for heritage and batik; Pasar Gede is better for
              market energy and local food.
            </p>
          </details>
          <details>
            <summary>Can I compare Solo stays by dates?</summary>
            <p>
              Yes. Set your dates and guest count in the stays search to compare
              live availability and prices.
            </p>
          </details>
        </section>
        <nav
          className="destination-internal-links"
          aria-label="Solo travel links"
        >
          <a href={`${prefix}/destinations/all`}>All destinations</a>
          <a href={`${prefix}/stays?destination=Solo`}>All Solo stays</a>
          <a href={`${prefix}/stays?destination=Laweyan`}>Laweyan stays</a>
          <a href={`${prefix}/stays?destination=Pasar%20Gede`}>
            Pasar Gede stays
          </a>
          <a href={`${prefix}/stays?destination=Manahan`}>Manahan stays</a>
        </nav>
      </main>
      <Footer language={language} setLanguage={setLanguage} />
    </>
  );
}
function SlemanLanding({
  language,
  setLanguage,
}: {
  language: "EN" | "ID";
  setLanguage: (language: "EN" | "ID") => void;
}) {
  const prefix = `/${language.toLowerCase()}`;
  return (
    <>
      <main className="destination-landing page">
        <p className="eyebrow">Explore Sleman</p>
        <h1>Volcanic landscapes, art spaces, and a greener Yogyakarta base.</h1>
        <p className="destination-intro">
          Sleman brings together Merapi views, cool northern air, creative
          campuses, and stays that feel close to nature without losing city
          access.
        </p>
        <div className="destination-actions">
          <a href={`${prefix}/stays?destination=Sleman`}>
            Explore Sleman stays
          </a>
          <a href="#sleman-areas">Choose an area</a>
        </div>
        <section id="sleman-areas" className="destination-area-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Stay by area</p>
              <h2>Find your Sleman base</h2>
            </div>
          </div>
          <div className="destination-area-grid">
            <a
              className="destination-area-card"
              href={`${prefix}/stays?destination=Kaliurang`}
            >
              <strong>Kaliurang</strong>
              <p>
                Cooler mountain air, Merapi views, and easy access to outdoor
                escapes.
              </p>
              <span>Browse Kaliurang stays →</span>
            </a>
            <a
              className="destination-area-card"
              href={`${prefix}/stays?destination=Ngaglik`}
            >
              <strong>Ngaglik</strong>
              <p>
                Leafy residential streets, cafés, and a calm northern-city
                rhythm.
              </p>
              <span>Browse Ngaglik stays →</span>
            </a>
            <a
              className="destination-area-card"
              href={`${prefix}/stays?destination=Depok`}
            >
              <strong>Depok</strong>
              <p>
                Universities, restaurants, and a practical base between the city
                and the hills.
              </p>
              <span>Browse Depok stays →</span>
            </a>
          </div>
        </section>
        <section className="destination-properties">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Places to start</p>
              <h2>Properties for a greener stay</h2>
            </div>
            <a href={`${prefix}/stays?destination=Sleman`}>
              See all Sleman stays →
            </a>
          </div>
          <div className="destination-property-grid">
            <article>
              <div className="property-image">Mountain villa</div>
              <div>
                <h3>Kaliurang Merapi Villa</h3>
                <p>Kaliurang · mountain air and views</p>
                <a href={`${prefix}/stays?destination=Kaliurang`}>
                  View availability →
                </a>
              </div>
            </article>
            <article>
              <div className="property-image">Garden stay</div>
              <div>
                <h3>Ngaglik Garden House</h3>
                <p>Ngaglik · leafy northern base</p>
                <a href={`${prefix}/stays?destination=Ngaglik`}>
                  View availability →
                </a>
              </div>
            </article>
            <article>
              <div className="property-image">City apartment</div>
              <div>
                <h3>Depok Campus Suites</h3>
                <p>Depok · cafés and everyday convenience</p>
                <a href={`${prefix}/stays?destination=Depok`}>
                  View availability →
                </a>
              </div>
            </article>
          </div>
        </section>
        <section className="destination-faq">
          <p className="eyebrow">Sleman travel questions</p>
          <h2>Plan the practical details</h2>
          <details>
            <summary>What is Sleman best known for?</summary>
            <p>
              Sleman is known for Mount Merapi, cooler northern neighborhoods,
              university life, and easy access to Yogyakarta’s cultural sights.
            </p>
          </details>
          <details>
            <summary>Which area is best for a nature-led stay?</summary>
            <p>
              Kaliurang is the strongest fit for mountain air and outdoor
              access, while Ngaglik offers a quieter base closer to the city.
            </p>
          </details>
          <details>
            <summary>Can I compare Sleman stays by dates?</summary>
            <p>
              Yes. Set your dates and guest count in the stays search to compare
              live availability and prices.
            </p>
          </details>
        </section>
        <nav
          className="destination-internal-links"
          aria-label="Sleman travel links"
        >
          <a href={`${prefix}/destinations/all`}>All destinations</a>
          <a href={`${prefix}/stays?destination=Sleman`}>All Sleman stays</a>
          <a href={`${prefix}/stays?destination=Kaliurang`}>Kaliurang stays</a>
          <a href={`${prefix}/stays?destination=Ngaglik`}>Ngaglik stays</a>
          <a href={`${prefix}/stays?destination=Depok`}>Depok stays</a>
        </nav>
      </main>
      <Footer language={language} setLanguage={setLanguage} />
    </>
  );
}
function AllDestinations({
  language,
  setLanguage,
}: {
  language: "EN" | "ID";
  setLanguage: (language: "EN" | "ID") => void;
}) {
  const prefix = "/" + language.toLowerCase();
  const destinations = [
    [
      "Yogyakarta",
      "City stays, café streets, and heritage neighborhoods.",
      "yogyakarta",
    ],
    [
      "Bantul",
      "Craft villages, open landscapes, and slower southern stays.",
      "bantul",
    ],
    [
      "Sleman",
      "Merapi views, greener neighborhoods, and a cooler northern base.",
      "sleman",
    ],
    [
      "Bandung",
      "Cool mornings, creative corners, and neighborhood stays.",
      "bandung",
    ],
    ["Solo", "Royal heritage, batik, and an easy city rhythm.", "solo"],
    [
      "Malang",
      "Cooler days, creative cafés, and a gentle city pace.",
      "malang",
    ],
    [
      "Surabaya",
      "Big-city energy, heritage quarters, and food worth travelling for.",
      "surabaya",
    ],
    [
      "Denpasar",
      "Local Bali, market mornings, and a gateway to the island.",
      "denpasar",
    ],
    [
      "Semarang",
      "Old-town character, hillside views, and a generous food scene.",
      "semarang",
    ],
    [
      "Jakarta",
      "City energy, neighborhood character, and stays close to what matters.",
      "jakarta",
    ],
  ];
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://menetap.com/en" },
      { "@type": "ListItem", position: 2, name: "All destinations" },
    ],
  };
  const itemListData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: destinations.map(([name, , slug], index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      url: `https://menetap.com${prefix}/destinations/${slug}`,
    })),
  };
  return (
    <>
      <main className="destination-landing page">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListData) }}
        />
        <p className="eyebrow">Explore Indonesia</p>
        <h1>Find your next destination.</h1>
        <p className="destination-intro">
          Browse places with distinctive neighborhoods, local character, and
          stays worth comparing.
        </p>
        <section className="destination-area-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Destination guide</p>
              <h2>Start exploring</h2>
            </div>
          </div>
          <div className="destination-area-grid destination-directory-grid">
            {destinations.map(([name, description, slug]) => (
              <a
                className="destination-area-card destination-directory-card"
                href={`${prefix}/destinations/${slug}`}
                key={slug}
              >
                {slug === "yogyakarta" ? (
                  <div className="destination-card-image">
                    <img
                      src="/images/destinations/yogyakarta.webp"
                      alt="Yogyakarta heritage street with traditional Javanese architecture"
                      width="1600"
                      height="1200"
                      loading="lazy"
                    />
                  </div>
                ) : slug === "bandung" ? (
                  <div className="destination-card-image">
                    <img
                      src="/images/destinations/bandung.webp"
                      alt="Gedung Sate landmark in Bandung"
                      width="1600"
                      height="1200"
                      loading="lazy"
                    />
                  </div>
                ) : slug === "solo" ? (
                  <div className="destination-card-image">
                    <img
                      src="/images/destinations/solo.webp"
                      alt="Pura Mangkunegaran palace in Solo"
                      width="1600"
                      height="1200"
                      loading="lazy"
                    />
                  </div>
                ) : slug === "denpasar" ? (
                  <div className="destination-card-image">
                    <img
                      src="/images/destinations/denpasar.webp"
                      alt="Balinese civic landmark in central Denpasar"
                      width="1600"
                      height="1200"
                      loading="lazy"
                    />
                  </div>
                ) : slug === "surabaya" ? (
                  <div className="destination-card-image">
                    <img
                      src="/images/destinations/surabaya.webp"
                      alt="Tugu Pahlawan monument in Surabaya"
                      width="1600"
                      height="1200"
                      loading="lazy"
                    />
                  </div>
                ) : slug === "jakarta" ? (
                  <div className="destination-card-image">
                    <img
                      src="/images/destinations/jakarta.webp"
                      alt="Jakarta skyline and Bundaran HI at golden hour"
                      width="1600"
                      height="1200"
                      loading="lazy"
                    />
                  </div>
                ) : slug === "semarang" ? (
                  <div className="destination-card-image">
                    <img
                      src="/images/destinations/semarang.webp"
                      alt="Lawang Sewu colonial architecture in Semarang"
                      width="1600"
                      height="1200"
                      loading="lazy"
                    />
                  </div>
                ) : slug === "malang" ? (
                  <div className="destination-card-image">
                    <img
                      src="/images/destinations/malang.webp"
                      alt="Colorful Jodipan village in Malang"
                      width="1600"
                      height="1200"
                      loading="lazy"
                    />
                  </div>
                ) : slug === "bantul" ? (
                  <div className="destination-card-image">
                    <img
                      src="/images/destinations/bantul.webp"
                      alt="Bantul pottery artisan working in a traditional Javanese craft studio"
                      width="1600"
                      height="1200"
                      loading="lazy"
                    />
                  </div>
                ) : slug === "sleman" ? (
                  <div className="destination-card-image">
                    <img
                      src="/images/destinations/sleman.webp"
                      alt="Mount Merapi and northern Yogyakarta landscape in Sleman"
                      width="1600"
                      height="1200"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="destination-card-image">{name}</div>
                )}
                <strong>{name}</strong>
                <p>{description}</p>
                <span>Explore {name} →</span>
              </a>
            ))}
          </div>
        </section>
        <nav
          className="destination-internal-links"
          aria-label="All destinations links"
        >
          <a href={`${prefix}/stays`}>Search all stays</a>
        </nav>
      </main>
      <Footer language={language} setLanguage={setLanguage} />
    </>
  );
}
function RentalSearch() {
  const [type, setType] = useState<"all" | "scooter" | "car">("all");
  const [driver, setDriver] = useState(false);
  const [delivery, setDelivery] = useState(false);
  const allVehicles = useQuery(api.vehicles.listActive, {}) || [];
  const bookings = useQuery(api.bookings.listMine, {}) || [];
  const createReservation = useMutation(api.rentalReservations.create);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [bookingId, setBookingId] = useState<any>(undefined);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [message, setMessage] = useState("");
  const vehicles = allVehicles.filter((vehicle) => type === "all" || vehicle.type === type);
  const qualifyingBookings = bookings.filter((booking) => booking.status === "confirmed" && booking.checkOut >= new Date().toISOString().slice(0, 10));
  const selectedBooking = bookings.find((booking) => booking._id === bookingId);
  const days = selectedBooking ? Math.max(1, Math.ceil((Date.parse(`${selectedBooking.checkOut}T00:00:00Z`) - Date.parse(`${selectedBooking.checkIn}T00:00:00Z`)) / 86400000)) : 1;
  const reserve = async () => {
    if (!selectedVehicle || !bookingId || !deliveryDate || !returnDate) { setMessage("Choose a confirmed stay and rental dates before reserving."); return; }
    try {
      const result = await createReservation({ bookingId, vehicleId: selectedVehicle._id, deliveryDate, returnDate, driverIncluded: driver, deliveryIncluded: delivery });
      localStorage.setItem("rentalReservationId", String(result.reservationId));
      window.location.assign("/en/rentals/confirmation");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to reserve this vehicle."); }
  };
  return (
    <main className="rental-search-page">
      <div className="rentals-wrap rental-search-context">
        <strong>Yogyakarta</strong>
        <span>12-Oct-2026 → 15-Oct-2026 · {days} days · 1 passenger</span>
      </div>
      <div className="rentals-wrap rental-results-layout">
        <aside className="rental-filter-panel">
          <h3>Vehicle type</h3>
          <label>
            <input
              type="radio"
              checked={type === "all"}
              onChange={() => setType("all")}
            />{" "}
            All vehicles
          </label>
          <label>
            <input
              type="radio"
              checked={type === "scooter"}
              onChange={() => setType("scooter")}
            />{" "}
            Motorbike / scooter
          </label>
          <label>
            <input
              type="radio"
              checked={type === "car"}
              onChange={() => setType("car")}
            />{" "}
            Car
          </label>
          <h3>Extras</h3>
          <label>
            <input
              type="checkbox"
              checked={driver}
              onChange={(event) => setDriver(event.target.checked)}
            />{" "}
            Driver included
          </label>
          <label>
            <input
              type="checkbox"
              checked={delivery}
              onChange={(event) => setDelivery(event.target.checked)}
            />{" "}
            Delivery to hotel
          </label>
        </aside>
        <section className="rental-results">
          <div className="rental-results-heading">
            <div>
              <p className="eyebrow">Exact pricing</p>
              <h1>{vehicles.length} vehicles available</h1>
            </div>
            <span>All costs shown upfront</span>
          </div>
          {vehicles.map((vehicle) => {
            const daily = vehicle.dailyRate + (driver ? vehicle.driverSurcharge ?? 0 : 0) + (delivery ? vehicle.deliverySurcharge ?? 0 : 0);
            return (
              <article className="rental-result-card" key={vehicle._id}>
                <div className={`rental-result-image ${vehicle.type === "car" ? "rental-car" : "rental-scooter"}`}>
                  <span>
                    {vehicle.type === "car" ? (
                      <Car size={28} />
                    ) : (
                      <span className="rental-bike-mark">●</span>
                    )}
                  </span>
                </div>
                <div className="rental-result-content">
                  <div className="rental-result-top">
                    <div>
                      <h2>{vehicle.name}</h2>
                      <p>{vehicle.specs}</p>
                    </div>
                    <strong>
                      Rp {daily.toLocaleString("en-US")}
                      <small>/day</small>
                    </strong>
                  </div>
                  <div className="rental-tags">
                    <span>
                      {vehicle.type === "car"
                        ? "Insurance included"
                        : "Helmet included"}
                    </span>
                    {driver && <span>Driver included</span>}
                    {delivery && <span>Delivery included</span>}
                  </div>
                  <div className="rental-result-bottom">
                    <div className="rental-result-price">
                      <span>Rental · {days} days</span>
                      <b>Rp {(daily * days).toLocaleString("en-US")}</b>
                      <small>Deposit: Rp 0</small>
                    </div>
                    <button onClick={() => { setSelectedVehicle(vehicle); setBookingId(qualifyingBookings[0]?._id); setMessage(""); }}>Select vehicle</button>
                  </div>
                </div>
              </article>
            );
          })}
          {selectedVehicle && <aside className="rental-filter-panel">
            <h3>Reserve {selectedVehicle.name}</h3>
            {qualifyingBookings.length ? <label>Confirmed stay<select value={bookingId || ""} onChange={(event) => setBookingId(event.target.value)}>{qualifyingBookings.map((booking) => <option key={booking._id} value={booking._id}>{booking.reference} · {booking.checkIn} → {booking.checkOut}</option>)}</select></label> : <p>No confirmed upcoming stay is available. Book a stay first, then return here.</p>}
            <label>Delivery date<input type="date" value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} /></label>
            <label>Return date<input type="date" value={returnDate} onChange={(event) => setReturnDate(event.target.value)} /></label>
            {message && <p className="error-text">{message}</p>}
            <button disabled={!qualifyingBookings.length} onClick={reserve}>Reserve vehicle</button>
          </aside>}
        </section>
      </div>
    </main>
  );
}


function RewardsLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    [
      "How do I earn points?",
      "You earn 10 points per Rp 10,000 spent on any completed stay booked through Menetap. Points post to your account after checkout.",
    ],
    [
      "Do points expire?",
      "Your full remaining balance resets on your account’s 12-month membership anniversary.",
    ],
    [
      "How much is a point worth?",
      "Each point is worth Rp 100 in stay credit when redeemed at checkout.",
    ],
    [
      "Is there a fee to join?",
      "No. Menetap Rewards is completely free to join and free to keep — there is no annual fee.",
    ],
  ];
  const tiers = [
    [
      "Silver",
      "0 – 3,000 points",
      [
        "10 points per Rp 10,000 spent",
        "Member-only rates",
        "Free cancellation on most stays",
      ],
    ],
    [
      "Gold",
      "3,000 – 8,000 points",
      [
        "1.5x points on every stay",
        "Priority check-in",
        "Free room upgrades when available",
      ],
    ],
    [
      "Platinum",
      "8,000+ points",
      [
        "2x points on every stay",
        "Guaranteed late checkout",
        "Dedicated support line",
      ],
    ],
  ] as const;
  return (
    <>
      <main className="rewards-landing-page">
        <section className="rewards-landing-hero">
          <div className="rewards-landing-wrap">
              <div className="hero-badge">
              <Gift size={14} /> Free to join, earn 1 point per Rp 1,000
            </div>
            <h1>Earn points on every stay. Redeem for your next one.</h1>
            <p>
              Menetap Rewards is free to join. Every booking earns points toward
              stay credit, upgrades, and priority perks — no annual fee, no fine
              print.
            </p>
            <div className="rewards-landing-actions">
              <Button>Join Rewards free</Button>
              <Button variant="outline">Already a member</Button>
            </div>
          </div>
        </section>
        <section className="rewards-landing-wrap rewards-how">
          <h2>How it works</h2>
          <div className="rewards-how-grid">
            {[
              [
                UserPlus,
                "1. Join for free",
                "Create a Menetap account in under a minute — no fee, no minimum spend.",
              ],
              [
                Bed,
                "2. Book & stay",
                "Earn points automatically on every completed stay — 10 points per Rp 10,000 spent.",
              ],
              [
                Sparkles,
                "3. Redeem anytime",
                "Use points as stay credit at checkout, with no cap beyond your balance.",
              ],
            ].map(([Icon, title, text]) => (
              <article key={String(title)}>
                <div className="rewards-step-icon">
                  <Icon size={18} />
                </div>
                <strong>{String(title)}</strong>
                <p>{String(text)}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="rewards-landing-wrap rewards-landing-section">
          <h2>Membership tiers</h2>
          <p className="section-intro">
            Tiers are based on points earned in a rolling 12 months — no cost,
            just book and stay.
          </p>
          <div className="rewards-landing-tier-grid">
            {tiers.map(([name, threshold, perks]) => (
              <article className={name === "Gold" ? "popular" : ""} key={name}>
                <div>
                  <strong>{name}</strong>
                  {name === "Gold" && <b>Most popular</b>}
                </div>
                <small>{threshold}</small>
                <ul>
                  {perks.map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
        <section className="rewards-landing-wrap rewards-landing-section">
          <h2>Every member gets</h2>
          <div className="rewards-perk-grid">
            {[
              [Wallet, "Points as stay credit", "1 point = Rp 100 in stay credit"],
              [
                Clock,
                "12-month expiry",
                "Your balance resets on your membership anniversary",
              ],
              [
                BadgePercent,
                "Member-only rates",
                "Extra discounts on select stays",
              ],
              [ShieldCheck, "No fees, ever", "Free to join and free to keep"],
            ].map(([Icon, title, text]) => (
              <article key={String(title)}>
                <Icon size={20} />
                <strong>{String(title)}</strong>
                <small>{String(text)}</small>
              </article>
            ))}
          </div>
        </section>
        <section className="rewards-landing-wrap rewards-faq">
          <h2>Frequently asked</h2>
          {faqs.map(([question, answer], index) => (
            <article key={question}>
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span>{question}</span>
                <b>{openFaq === index ? "−" : "+"}</b>
              </button>
              {openFaq === index && <p>{answer}</p>}
            </article>
          ))}
        </section>
        <section className="site-cta rewards-landing-wrap rewards-landing-cta">
          <div>
            <h3>Start earning on your next stay</h3>
            <p>Joining takes under a minute and costs nothing.</p>
          </div>
          <Button>Join Rewards free</Button>
        </section>
      </main>
      <Footer language="EN" setLanguage={() => undefined} />
    </>
  );
}

function LiveRewardsPage() {
  const account = useQuery(api.rewards.getAccount, {});
  if (account === undefined) return <main className="page narrow"><LoadingState label="Loading your Rewards account…" /></main>;
  const balance = account.account?.pointsBalance ?? 0;
  return <main className="page narrow"><p className="eyebrow">Menetap Rewards</p><h1>Your Rewards balance</h1><section className="guest-account-card"><h2>{balance.toLocaleString("en-US")} points</h2><p>Worth Rp {(balance * account.config.redeemValueIdrPerPoint).toLocaleString("en-US")} at checkout.</p><p className="muted">{account.account ? `Your balance resets on ${new Date(account.account.nextExpiryAt).toLocaleDateString()}.` : "Your Rewards account will be created when you earn or redeem points."}</p></section><p className="muted">Earn {account.config.earnRatePointsPerIdr} points per Rp 1 spent on completed stays.</p></main>;
}

function RewardsPage() {
  const [points, setPoints] = useState(1963);
  const [toast, setToast] = useState("");
  const redeem = (cost: number, label: string) => {
    if (points < cost) {
      setToast("Not enough points for this reward");
      return;
    }
    setPoints((value) => value - cost);
    setToast(`Redeemed: ${label}`);
    window.setTimeout(() => setToast(""), 2200);
  };
  const tiers = [
    [
      "Silver",
      "0 – 3,000 pts/yr",
      ["Earn 1x points per stay", "Member-only rates"],
      true,
    ],
    [
      "Gold",
      "3,000 – 8,000 pts/yr",
      [
        "1.5x points per stay",
        "Priority check-in",
        "Free room upgrade when available",
      ],
      false,
    ],
    [
      "Platinum",
      "8,000+ pts/yr",
      [
        "2x points per stay",
        "Guaranteed late checkout",
        "Dedicated support line",
      ],
      false,
    ],
  ] as const;
  return (
    <>
      <main className="rewards-page">
        <div className="rewards-wrap">
          <h1>Menetap Rewards</h1>
          <div className="rewards-mobile-tabs">
            <span>Trips</span>
            <span>Favorites</span>
            <strong>Rewards</strong>
            <span>Payment</span>
            <span>Settings</span>
          </div>
          <div className="rewards-layout">
            <aside className="rewards-sidebar">
              <a>▣ Trips</a>
              <a>♡ Favorites</a>
              <a className="active">
                <Gift size={16} /> Rewards
              </a>
              <a href="/en/payment-methods">▣ Payment methods</a>
              <a href="/en/settings">⚙ Settings</a>
              <hr />
              <a className="muted">↪ Log out</a>
            </aside>
            <div className="rewards-content">
              <section className="rewards-balance">
                <div>
                  <small>Silver member</small>
                  <strong>{points.toLocaleString()} points</strong>
                  <span>≈ Rp 19,630 in stay credit</span>
                </div>
                <button onClick={() => redeem(1000, "Rp 10,000 stay credit")}>
                  Redeem points
                </button>
              </section>
              <section>
                <h2>Membership tiers</h2>
                <div className="rewards-tier-grid">
                  {tiers.map(([name, threshold, perks, current]) => (
                    <article className={current ? "current" : ""} key={name}>
                      <div>
                        <strong>{name}</strong>
                        {current && <b>Current</b>}
                      </div>
                      <small>{threshold}</small>
                      <ul>
                        {perks.map((perk) => (
                          <li key={perk}>{perk}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </section>
              <section className="rewards-progress">
                <div>
                  <strong>1,037 points to Gold</strong>
                  <span>3,000 pts</span>
                </div>
                <div className="progress-track">
                  <i />
                </div>
                <small>
                  Gold members get priority check-in, free room upgrades when
                  available, and 1.5x points on every stay.
                </small>
              </section>
              <section>
                <h2>Redeem your points</h2>
                <div className="rewards-redeem-grid">
                  {[
                    [
                      "Rp 10,000 stay credit",
                      "Apply at checkout on any stay",
                      1000,
                    ],
                    [
                      "Rp 50,000 stay credit",
                      "Apply at checkout on any stay",
                      4500,
                    ],
                    [
                      "Free breakfast add-on",
                      "Redeemable on your next confirmed stay",
                      1200,
                    ],
                  ].map(([title, subtitle, cost]) => (
                    <article key={String(title)}>
                      <div>
                        <strong>{title}</strong>
                        <small>{subtitle}</small>
                      </div>
                      <button
                        onClick={() => redeem(Number(cost), String(title))}
                      >
                        {Number(cost).toLocaleString()} pts
                      </button>
                    </article>
                  ))}
                </div>
              </section>
              <section>
                <h2>Points activity</h2>
                <div className="rewards-activity">
                  <div>
                    <span>
                      <strong>Kaliurang Heritage Villa</strong>
                      <small>Booking MTP-7X9K2Q · Oct 12, 2026</small>
                    </span>
                    <b>+696</b>
                  </div>
                  <div>
                    <span>
                      <strong>Malioboro Skyline Suites</strong>
                      <small>Booking MTP-2R6V9C · Jul 4, 2026</small>
                    </span>
                    <b>+220</b>
                  </div>
                  <div>
                    <span>
                      <strong>Redeemed: Rp 10,000 stay credit</strong>
                      <small>May 20, 2026</small>
                    </span>
                    <b className="negative">−1,000</b>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      {toast && (
        <div className="rewards-toast">
          <CheckCircle2 size={16} />
          {toast}
        </div>
      )}
      <Footer language="EN" setLanguage={() => undefined} />
    </>
  );
}

function HelpCenter() {
  const createSupportRequest = useMutation(api.support.create);
  const [open, setOpen] = useState<number | null>(null);
  const [topic, setTopic] = useState("All");
  const [language, setLanguage] = useState<"EN" | "ID">("EN");
  const [contactOpen, setContactOpen] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    reference: "",
    message: "",
  });
  useEffect(() => { setTopic("All"); setOpen(null); }, [language]);
  const content =
    language === "EN"
      ? {
          title: "Help center",
          intro: "Common questions about bookings, payments, and your account.",
          back: "← Back to Menetap",
          contact: "Contact support",
          still: "Still need help?",
          response: "Our support team responds within a few hours.",
          submit: "Send support request",
          sent: "Your support request has been sent. We’ll get back to you within a few hours.",
          name: "Full name",
          email: "Email",
          reference: "Booking reference (optional)",
          message: "How can we help?",
          required: "Please provide your name, email, and message.",
          faqs: [
            [
              "How do I cancel or change a booking?",
              "Go to My Trips, open the booking, and choose Cancel booking or Modify dates. Refund amount depends on the property's cancellation policy.",
            ],
            [
              "When will I be charged?",
              "Most bookings are charged in full at the time of booking. Some rate plans charge a deposit now and the balance closer to check-in — this is shown at checkout.",
            ],
            [
              "How do Menetap Rewards points work?",
              "You earn points on every completed stay. Points can be redeemed for stay credit at checkout once you have enough saved up.",
            ],
            [
              "Is the price I see the final price?",
              "Yes. Menetap shows the real price up front — no hidden fees appear at checkout.",
            ],
            [
              "How do I contact my host?",
              "Open your booking in My Trips and use Message host, or reach out from the property page before booking.",
            ],
            [
              "I want to list my property — where do I start?",
              "Head to menetap.com/partners and click List your property to start onboarding.",
            ],
          ],
        }
      : {
          title: "Pusat bantuan",
          intro:
            "Pertanyaan umum tentang pemesanan, pembayaran, dan akun Anda.",
          back: "← Kembali ke Menetap",
          contact: "Hubungi dukungan",
          still: "Masih butuh bantuan?",
          response: "Tim dukungan kami akan merespons dalam beberapa jam.",
          submit: "Kirim permintaan bantuan",
          sent: "Permintaan bantuan Anda telah dikirim. Kami akan segera menghubungi Anda.",
          name: "Nama lengkap",
          email: "Email",
          reference: "Referensi pemesanan (opsional)",
          message: "Bagaimana kami dapat membantu?",
          required: "Isi nama, email, dan pesan Anda.",
          faqs: [
            [
              "Bagaimana cara membatalkan atau mengubah pemesanan?",
              "Buka Perjalanan Saya, pilih pemesanan, lalu pilih Batalkan pemesanan atau Ubah tanggal.",
            ],
            [
              "Kapan saya akan dikenakan biaya?",
              "Sebagian besar pemesanan dibayar penuh saat pemesanan. Detail pembayaran ditampilkan saat checkout.",
            ],
            [
              "Bagaimana cara kerja poin Menetap Rewards?",
              "Anda mendapatkan poin dari setiap masa inap yang selesai dan dapat menukarkannya sebagai kredit menginap.",
            ],
            [
              "Apakah harga yang terlihat adalah harga akhir?",
              "Ya. Menetap menampilkan harga sebenarnya di awal tanpa biaya tersembunyi.",
            ],
            [
              "Bagaimana cara menghubungi host?",
              "Buka pemesanan di Perjalanan Saya dan gunakan fitur Pesan host.",
            ],
            [
              "Saya ingin mendaftarkan properti. Mulai dari mana?",
              "Kunjungi halaman partner Menetap untuk memulai proses onboarding.",
            ],
          ],
        };
  const categories = language === "EN" ? ["All", "Bookings", "Payments", "Rewards", "Account", "Partners"] : ["Semua", "Pemesanan", "Pembayaran", "Rewards", "Akun", "Partner"];
  const categoryMap = language === "EN" ? ["Bookings", "Payments", "Rewards", "Payments", "Bookings", "Partners", "Account", "Bookings", "Payments", "Account"] : ["Pemesanan", "Pembayaran", "Rewards", "Pembayaran", "Pemesanan", "Partner", "Akun", "Pemesanan", "Pembayaran", "Akun"];
  const additionalFaqs = language === "EN" ? [["How do I update my account details?", "Open Settings from your account menu, update your details, and save your changes."], ["What happens if a property cancels my booking?", "We’ll notify you promptly and help arrange a suitable alternative or explain the available refund options."], ["Are taxes and fees included in the displayed price?", "Any applicable taxes, service fees, and add-ons are shown in the price breakdown before you confirm."], ["How do I report a safety or stay issue?", "Contact support and include your booking reference so our team can prioritize the case."]] : [["Bagaimana cara memperbarui data akun?", "Buka Pengaturan dari menu akun, perbarui data, lalu simpan perubahan."], ["Apa yang terjadi jika properti membatalkan pemesanan saya?", "Kami akan segera memberi tahu Anda dan membantu menjelaskan pilihan pengembalian dana."], ["Apakah pajak dan biaya sudah termasuk?", "Pajak, biaya layanan, dan add-on yang berlaku ditampilkan sebelum Anda mengonfirmasi."], ["Bagaimana cara melaporkan masalah keamanan atau masa inap?", "Hubungi dukungan dan sertakan referensi pemesanan agar dapat kami prioritaskan."]];
  const allFaqs = [...content.faqs, ...additionalFaqs];
  const submitRequest = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setFormError(content.required);
      return;
    }
    setFormError("");
    try {
      await createSupportRequest({ name: form.name, email: form.email, bookingReference: form.reference || undefined, message: form.message });
      setSubmitted(true);
    } catch {
      setFormError(language === "EN" ? "We could not send your request. Please try again." : "Permintaan tidak dapat dikirim. Silakan coba lagi.");
    }
  };
  return (
    <>
    <main className="help-page">
        <div className="help-header">
          <button onClick={() => { if (window.history.length > 1) window.history.back(); else window.location.assign("/en"); }}>{content.back}</button>
        </div>
        <section className="help-content">
          <h1>{content.title}</h1>
          <p>{content.intro}</p>
          <div className="help-topic-tabs">{categories.map((category) => <button className={topic === (category === "Semua" ? "All" : category) ? "active" : ""} key={category} onClick={() => setTopic(category === "Semua" ? "All" : category)}>{category}</button>)}</div>
          <div className="help-faq-list">
            {allFaqs.map(([question, answer], index) => (topic === "All" || categoryMap[index] === topic) && (
              <article className="help-faq" key={question}>
                <button onClick={() => setOpen(open === index ? null : index)}>
                  <span>{question}</span>
                  <b>{open === index ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</b>
                </button>
                {open === index && <div>{answer}</div>}
              </article>
            ))}
          </div>
          <div className="help-contact">
            <div>
              <strong>{content.still}</strong>
              <span>{content.response}</span>
            </div>
            <button
              onClick={() => {
                setContactOpen(true);
                setSubmitted(false);
              }}
            >
              {content.contact}
            </button>
          </div>
          {contactOpen && (
            <div className="support-form-card">
              <div className="support-form-heading">
                <strong>{content.contact}</strong>
                <button onClick={() => setContactOpen(false)}>×</button>
              </div>
              {submitted ? (
                <p className="support-success">{content.sent}</p>
              ) : (
                <form onSubmit={submitRequest}>
                  {formError && <p className="support-form-error">{formError}</p>}
                  <label>
                    {content.name}
                    <input
                      value={form.name}
                      onChange={(event) =>
                        setForm({ ...form, name: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    {content.email}
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        setForm({ ...form, email: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    {content.reference}
                    <input
                      value={form.reference}
                      onChange={(event) =>
                        setForm({ ...form, reference: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    {content.message}
                    <textarea
                      rows={4}
                      value={form.message}
                      onChange={(event) =>
                        setForm({ ...form, message: event.target.value })
                      }
                    />
                  </label>
                  <button type="submit">{content.submit}</button>
                </form>
              )}
            </div>
          )}
        </section>
      </main>
      <Footer language={language} setLanguage={setLanguage} />
    </>
  );
}

function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  const privacy = kind === "privacy";
  const sections = privacy ? [
    ["Information we collect", "Account details (name, email, phone), booking history, payment method metadata (not full card numbers), and device or usage data when you use the site or app."],
    ["How we use it", "To process bookings, run loyalty rewards, personalize search results, prevent fraud, and communicate booking-related updates."],
    ["Sharing", "We share the minimum booking details needed with the property you book, and with payment processors to complete transactions. We do not sell your personal data."],
    ["Your choices", "You can access, update, or request deletion of your data from Account Settings, or by contacting our support team via the Help Center."],
    ["Data retention", "We retain booking records as required for tax, legal, and dispute-resolution purposes, and delete other account data on request where not legally required to keep it."],
  ] : [
    ["Using Menetap", "You must be 18 or older to create an account or make a booking. You are responsible for the accuracy of the information you provide and for all activity under your account."],
    ["Bookings and payments", "Prices shown at checkout are final and inclusive of applicable taxes and fees unless stated otherwise. Payment is processed at the time of booking or per the payment schedule shown for your rate plan."],
    ["Cancellations", "Each listing sets its own cancellation policy, shown before you book. See our Cancellation Policy for details on refund timing and eligibility."],
    ["Partner listings", "Partners are responsible for the accuracy of their listing content, pricing, and availability. Menetap may remove listings that violate our quality or trust and safety standards."],
    ["Liability", "Menetap facilitates bookings between guests and independent hosts or management companies. We are not the operator of any listed property."],
    ["Changes to these terms", "We may update these terms from time to time. Continued use of Menetap after changes take effect means you accept the revised terms."],
  ];
  return <><main className="legal-page"><div className="legal-header"><button onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/en")}>← Back to Menetap</button></div><article className="legal-content"><small>Last updated: September 1, 2026</small><h1>{privacy ? "Privacy policy" : "Terms of service"}</h1><p className="legal-intro">{privacy ? "This policy explains what information Menetap collects, how we use it, and the choices you have." : "These terms govern your use of Menetap to search, book, and manage stays, and apply to every guest and partner account on the platform."}</p>{sections.map(([title, text], index) => <section key={title}><h2>{index + 1}. {title}</h2><p>{text}</p></section>)}</article></main><Footer language="EN" setLanguage={() => undefined} /></>;
}

function CompanyPage({ kind }: { kind: "about" | "careers" }) {
  const about = kind === "about";
  const paragraphs = about ? ["Menetap started with a simple problem: hotel rates across Indonesia were inflated, inconsistent, and rarely reflected what a room was actually worth on a given night. We set out to fix that.", "We're powered by UPSCALE's revenue engine — the same data-driven pricing infrastructure that hotel chains across Southeast Asia use to run their commercial strategy. That means the price you see on Menetap is the real price: no inflated rack rates, no fake discounts, no surprise fees at checkout.", "Today, hundreds of independent hosts and management companies across Indonesia list on Menetap, reaching guests who book on transparency and fair pricing rather than flash-sale banners.", "We're a small, focused team based in Yogyakarta, building for a country we know well."] : [];
  return <><main className="content-page"><div className="content-page-header"><button onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/en")}>← Back to Menetap</button></div><article className="content-page-body"><span className="content-eyebrow">{about ? "About us" : "Careers"}</span><h1>{about ? "Stays priced by data, not guesswork." : "Build the fair-pricing platform for Java."}</h1>{about ? <div className="content-copy">{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div> : <><p className="content-lead">We're a small team solving pricing transparency for a fast-growing hospitality market. No open roles right now — but we're always glad to hear from people who care about the problem.</p><div className="empty-content-card"><strong>No open positions at the moment</strong><p>We post roles here as soon as they open. In the meantime, feel free to reach out directly with your background — we keep a list for when the right role comes up.</p></div><p className="career-contact">Interested? Write to <a href="mailto:careers@menetap.com">careers@menetap.com</a></p></>}</article></main><Footer language="EN" setLanguage={() => undefined} /></>;
}

function CancellationPolicy() {
  return <><main className="content-page"><div className="content-page-header"><button onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/en")}>← Back to Menetap</button></div><article className="content-page-body cancellation-content"><span className="content-eyebrow">Policy</span><h1>Cancellation policy</h1><p className="content-lead">Each property sets its own cancellation policy, shown before you book and again on your confirmation page. Most listings fall into one of these three tiers:</p><table><thead><tr><th>Policy</th><th>Full refund if cancelled</th><th>After that</th></tr></thead><tbody><tr><td>Flexible</td><td>Up to 24 hours before check-in</td><td>First night charged, remainder refunded</td></tr><tr><td>Moderate</td><td>Up to 5 days before check-in</td><td>50% refund up to 24 hours before, then no refund</td></tr><tr><td>Strict</td><td>Up to 14 days before check-in</td><td>No refund inside 14 days</td></tr></tbody></table><p className="content-copy-single">To cancel or modify a booking, go to <a href="/en/my-trips">My Trips</a>, open the booking, and choose Cancel booking or Modify dates. Refunds are issued to your original payment method within 5–10 business days. Menetap service fees are non-refundable except when a host cancels on you.</p></article></main><Footer language="EN" setLanguage={() => undefined} /></>;
}

function Footer({
  language,
  setLanguage,
}: {
  language: "EN" | "ID";
  setLanguage: (language: "EN" | "ID") => void;
}) {
  return (
    <footer className="dc-footer">
      <div className="dc-footer-grid">
        <div className="footer-brand">
          <span className="wordmark">
            menetap<span>.</span>
          </span>
          <p>
            Stays across Indonesia, priced fairly. Powered by UPSCALE&apos;s
            revenue engine.
          </p>
        </div>
        <FooterColumn
          title="For guests"
          links={[
            "Search stays",
            "Manage booking",
            "Menetap Rewards",
            "Cancellation policy",
            "Help center",
          ]}
        />
        <FooterColumn
          title="For partners"
          links={[
            "List your property",
            "Partner dashboard",
            "Commission & pricing",
            "Services",
            "Partner support",
          ]}
        />
        <FooterColumn
          title="Company"
          links={[
            "About Menetap",
            "Careers",
            "Terms of service",
            "Privacy policy",
          ]}
        />
      </div>
      <div className="dc-footer-bottom">
        <span>© 2026 Menetap. All rights reserved.</span>
        <div className="dc-footer-meta">
          <button
            className="language-chip"
            onClick={() => setLanguage(language === "EN" ? "ID" : "EN")}
          >
            <Globe2 size={12} /> {language}
          </button>
          <span className="managed-chip">
            Managed by{" "}
            <a href="https://upscale.asia" target="_blank" rel="noreferrer">
              UPSCALE
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="footer-column">
      <strong>{title}</strong>
      {links.map((link) => (
        <a
          href={
            footerLinkPaths[link] ?? `#${link.toLowerCase().replaceAll(" ", "-")}`
          }
          key={link}
        >
          {link}
        </a>
      ))}
    </div>
  );
}
const footerLinkPaths: Record<string, string> = {
  "Search stays": "/en/stays",
  "Manage booking": "/en/my-trips",
  "Menetap Rewards": "/en/rewards",
  "Cancellation policy": "/en/cancellation",
  "Help center": "/en/help",
  "List your property": "/en/partner-onboarding",
  "Commission & pricing": "/en/partners",
  "Partner support": "/en/partner-support",
  "About Menetap": "/en/about",
  Careers: "/en/careers",
  "Terms of service": "/en/terms",
  "Privacy policy": "/en/privacy",
};

function SearchBar({
  search,
  setSearch,
  onSearch,
  onPropertySelect,
  compact = false,
  error,
}: {
  search: SearchState;
  setSearch: (value: SearchState) => void;
  onSearch: () => void;
  onPropertySelect?: (id: string) => void;
  compact?: boolean;
  error?: string;
}) {
  const [guestsOpen, setGuestsOpen] = useState(false);
  const guestFieldRef = useRef<HTMLLabelElement>(null);
  const suggestions = useQuery(api.properties.searchSuggestions, {
    query: search.destination,
  });
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (guestsOpen && !guestFieldRef.current?.contains(event.target as Node))
        setGuestsOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [guestsOpen]);
  const updateGuests = (adults: number, children: number) =>
    setSearch({ ...search, adults, children, guests: adults + children, childAges: Array.from({ length: children }, (_, index) => search.childAges[index] ?? 5) });
  const submitSearch = () => {
    const exactProperty = suggestions?.find(
      (suggestion) =>
        suggestion.kind === "property" &&
        suggestion.label.trim().toLowerCase() ===
          search.destination.trim().toLowerCase(),
    );
    if (exactProperty && onPropertySelect) onPropertySelect(exactProperty.id);
    else onSearch();
  };
  return (
    <div className="search-widget-wrap">
      <div className="search-card dc-search-card">
        <label className="destination-field">
          <span>Destination</span>
          <div>
            <MapPin size={16} />
            <input
              aria-label="Destination"
              list="destination-options"
              value={search.destination}
              onChange={(e) =>
                setSearch({ ...search, destination: e.target.value })
              }
              placeholder="Try hotel name, city, keyword…"
            />
          </div>
          {suggestions?.length ? (
            <div
              className="destination-suggestions"
              role="listbox"
              aria-label="Destination suggestions"
            >
              {suggestions.map((suggestion) => (
                <button
                  type="button"
                  role="option"
                  key={`${suggestion.kind}:${suggestion.label}`}
                  onClick={() => {
                    setSearch({ ...search, destination: suggestion.label });
                    if (suggestion.kind === "property" && onPropertySelect)
                      onPropertySelect(suggestion.id);
                  }}
                >
                  {suggestion.label}
                  <small>
                    {suggestion.kind === "property"
                      ? `Property · ${suggestion.detail}`
                      : `Area · ${suggestion.detail}`}
                  </small>
                </button>
              ))}
            </div>
          ) : null}
        </label>
        <label>
          <span>Check-in</span>
          <div>
            <CalendarDays size={16} />
            <input
              aria-label="Check-in date"
              type="date"
              min={today}
              value={search.checkIn || today}
              onClick={(e) => e.currentTarget.showPicker?.()}
              onKeyDown={(e) => e.preventDefault()}
              onChange={(e) =>
                setSearch({
                  ...search,
                  checkIn: e.target.value,
                  checkOut: nextDay(e.target.value),
                })
              }
            />
          </div>
        </label>
        <label>
          <span>Check-out</span>
          <div>
            <CalendarDays size={16} />
            <input
              aria-label="Check-out date"
              type="date"
              min={search.checkIn || today}
              value={search.checkOut}
              onClick={(e) => e.currentTarget.showPicker?.()}
              onKeyDown={(e) => e.preventDefault()}
              onChange={(e) =>
                setSearch({ ...search, checkOut: e.target.value })
              }
            />
          </div>
        </label>
        <label ref={guestFieldRef} className="guest-field">
          <span>Guests</span>
          <button
            type="button"
            className="guest-trigger"
            aria-expanded={guestsOpen}
            aria-haspopup="dialog"
            onClick={() => setGuestsOpen(!guestsOpen)}
          >
            <Users size={16} />
            <span>
              {search.adults} adults
              {search.children ? `, ${search.children} children` : ""}
            </span>
          </button>
          {guestsOpen && (
            <div
              className="guest-popover"
              role="dialog"
              aria-label="Guest selector"
            >
              <GuestCounter
                label="Adults"
                hint="Ages 13+"
                value={search.adults}
                min={1}
                onChange={(value) => updateGuests(value, search.children)}
              />
              <GuestCounter
                label="Children"
                hint="Ages 0–12"
                value={search.children}
                min={0}
                onChange={(value) => updateGuests(search.adults, value)}
              />
              {search.children > 0 && <div className="child-age-list">
                <strong>Children's ages</strong>
                <small>For room eligibility and pricing</small>
                {search.childAges.map((age, index) => <label key={index}>Child {index + 1}
                  <select value={age} onChange={(event) => {
                    const childAges = [...search.childAges];
                    childAges[index] = Number(event.target.value);
                    setSearch({ ...search, childAges });
                  }}>
                    {Array.from({ length: 18 }, (_, childAge) => <option value={childAge} key={childAge}>{childAge} {childAge === 1 ? "year" : "years"}</option>)}
                  </select>
                </label>)}
              </div>}
            </div>
          )}
        </label>
        <button
          type="button"
          className="search-submit"
          aria-label="Search stays"
          title="Search stays"
          onClick={submitSearch}
        >
          {compact ? <Search size={19} strokeWidth={2.5} /> : "Search"}
        </button>
      </div>
      <datalist id="destination-options">
        <option value="Yogyakarta" />
        <option value="Greater Yogyakarta" />
        <option value="Bandung" />
        <option value="Semarang" />
        <option value="Malang" />
        <option value="Solo" />
        <option value="Surabaya" />
      </datalist>
      {error && (
        <p className="search-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
function GuestCounter({
  label,
  hint,
  value,
  min,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="guest-counter">
      <div>
        <strong>{label}</strong>
        <small>{hint}</small>
      </div>
      <div className="counter-actions">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        >
          −
        </button>
        <strong>{value}</strong>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

function SearchResults({
  search,
  setSearch,
  onBack,
  onSelect,
  language,
  setLanguage,
}: {
  search: SearchState;
  setSearch: (value: SearchState) => void;
  onBack: () => void;
  onSelect: (id: string) => void;
  language: "EN" | "ID";
  setLanguage: (language: "EN" | "ID") => void;
}) {
  const properties = useQuery(api.properties.listPublished, {
    area: search.destination,
    checkIn: search.checkIn,
    checkOut: search.checkOut,
    guests: search.guests,
    childAges: search.childAges,
  });
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState("");
  const [sort, setSort] = useState("recommended");
  const [view, setView] = useState<"list" | "map">("list");
  const types = properties
    ? Array.from(new Set(properties.map((property) => property.type))).sort()
    : [];
  const runSearch = () => {
    const params = new URLSearchParams({
      destination: search.destination,
      checkIn: search.checkIn,
      checkOut: search.checkOut,
      adults: String(search.adults),
      children: String(search.children),
      childAges: search.childAges.join(","),
    });
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`,
    );
  };
  const toggleType = (type: string) =>
    setSelectedTypes((current) =>
      current.includes(type)
        ? current.filter((value) => value !== type)
        : [...current, type],
    );
  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedPrice("");
  };
  const togglePrice = (value: string) =>
    setSelectedPrice((current) => (current === value ? "" : value));
  const visibleProperties = properties
    ?.filter((property) => {
      const typeMatches =
        !selectedTypes.length || selectedTypes.includes(property.type);
      const priceMatches =
        !selectedPrice ||
        (selectedPrice === "Under Rp 500,000" &&
          (property.lowestPrice ?? Infinity) < 500000) ||
        (selectedPrice === "Rp 500,000–1,000,000" &&
          (property.lowestPrice ?? 0) >= 500000 &&
          (property.lowestPrice ?? Infinity) <= 1000000) ||
        (selectedPrice === "Over Rp 1,000,000" &&
          (property.lowestPrice ?? 0) > 1000000);
      return typeMatches && priceMatches;
    })
    .sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : sort === "price" ? (a.lowestPrice ?? Infinity) - (b.lowestPrice ?? Infinity) : 0);
  const filterGroup = (
    title: string,
    options: string[],
    selected: string[] = [],
    onToggle?: (value: string) => void,
  ) => (
    <section className="filter-panel">
      <h3>{title}</h3>
      {options.map((option) => (
        <label className="filter-option" key={option}>
          <span>
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onToggle?.(option)}
            />
            {option}
          </span>
          <small>{properties?.length ?? 0}</small>
        </label>
      ))}
    </section>
  );
  return (
    <>
      <main className="page search-results-page">
        <div className="mini-search-widget">
          <SearchBar
            search={search}
            setSearch={setSearch}
            onSearch={runSearch}
            onPropertySelect={onSelect}
            compact
          />
        </div>
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <div className="page-heading">
          <div>
            <p className="eyebrow">Search results</p>
            <h2>
              Found {visibleProperties?.length ?? 0} stays in{" "}
              {search.destination || "Indonesia"}
            </h2>
            <p className="muted">
              {search.checkIn} → {search.checkOut} · {search.guests} guests ·
              rates checked against live market data
            </p>
          </div>
        </div>
        {properties === undefined ? (
          <LoadingState label="Finding available stays…" />
        ) : properties.length ? (
          <>
            <div className="results-toolbar">
              <button
                type="button"
                className="mobile-filter-button"
                onClick={() =>
                  document
                    .querySelector(".search-filter-sidebar")
                    ?.classList.toggle("is-open")
                }
              >
                ☷ Filters
              </button>
              <div className="results-view-toggle">
                <button
                  type="button"
                  className={view === "list" ? "active" : ""}
                  onClick={() => setView("list")}
                >
                  List
                </button>
                <button
                  type="button"
                  className={view === "map" ? "active" : ""}
                  onClick={() => setView("map")}
                >
                  Map
                </button>
              </div>
              <label>
                Sort by
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="recommended">Best value</option>
                  <option value="name">Name A–Z</option>
                  <option value="price">Price: low to high</option>
                </select>
              </label>
            </div>
            <div className="search-results-layout">
              <aside className="search-filter-sidebar">
                <div className="filter-sidebar-header">
                  <strong>Filters</strong>
                  <button type="button" onClick={clearFilters}>
                    Clear all
                  </button>
                </div>
                {filterGroup(
                  "Price per night",
                  [
                    "Under Rp 500,000",
                    "Rp 500,000–1,000,000",
                    "Over Rp 1,000,000",
                  ],
                  selectedPrice ? [selectedPrice] : [],
                  togglePrice,
                )}
                <section className="filter-panel" aria-labelledby="guest-rating-filter">
                  <h3 id="guest-rating-filter">Guest rating</h3>
                  <p className="muted">Ratings will appear when verified guest reviews are available.</p>
                </section>
                {filterGroup("Booking policy", [
                  "Free cancellation",
                  "Instant confirmation",
                  "Breakfast included",
                ])}
                {filterGroup(
                  "Property type",
                  types.length
                    ? types
                    : ["hotel", "villa", "guesthouse", "homestay"],
                  selectedTypes,
                  toggleType,
                )}
                {filterGroup("Facilities", [
                  "Free WiFi",
                  "Swimming pool",
                  "Free parking",
                  "Air conditioning",
                  "Kitchen",
                ])}
              </aside>
              {view === "map" ? (
                <MapPreview
                  properties={visibleProperties ?? []}
                  onSelect={onSelect}
                />
              ) : (
                <div className="property-grid">
                  {visibleProperties?.length ? (
                    visibleProperties.map((property) => (
                      <PropertyCard
                        key={property._id}
                        name={property.name}
                        type={property.type}
                        area={property.area}
                        city={property.city}
                        price={
                          property.lowestPrice
                            ? "From Rp " +
                              property.lowestPrice.toLocaleString("en-US")
                            : "Price on request"
                        }
                        amenities={
                          property.amenities?.length
                            ? property.amenities.slice(0, 3)
                            : []
                        }
                        onSelect={() => onSelect(property._id)}
                      />
                    ))
                  ) : (
                    <EmptyState
                      title="No stays match these filters"
                      text="Try clearing a filter or choosing another property type."
                    />
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <EmptyState
            title="No available stays found"
            text="Try different dates, fewer guests, or another destination."
          />
        )}
      </main>
      <Footer language={language} setLanguage={setLanguage} />
    </>
  );
}

function HotelDetail({
  propertyId,
  onBack,
  onRooms,
}: {
  propertyId: string | null;
  onBack: () => void;
  onRooms: () => void;
}) {
  const property = useQuery(
    api.properties.get,
    propertyId ? { id: propertyId as never } : "skip",
  );
  const rooms = useQuery(
    api.rooms.listForProperty,
    propertyId ? { propertyId: propertyId as never, guests: 2 } : "skip",
  );
  const photos = useQuery(
    api.properties.listPhotos,
    propertyId ? { propertyId: propertyId as never } : "skip",
  );
  const [saved, setSaved] = useState(false);
  const suppressSeo = isProductionEnv() && Boolean(property?.isDemo);
  useEffect(() => {
    if (!property) return;
    const title = `${property.name}, ${property.area} | Menetap`;
    const description = (
      property.description ||
      `${property.name} in ${property.area}, ${property.city}. See real photos, amenities, and transparent pricing on Menetap.`
    ).slice(0, 160);
    document.title = title;
    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        const [, attrName, attrValue] = selector.match(/\[(\w+)="(.+)"\]/) ?? [];
        if (attrName && attrValue) el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };
    // Demo properties still get a helpful tab title for local/staging QA, but never
    // real og:description or a robots override that would make them indexable in production.
    if (suppressSeo) {
      setMeta('meta[name="robots"]', "content", "noindex,follow");
      return;
    }
    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[name="robots"]', "content", "index,follow");
  }, [property, suppressSeo]);
  if (!property)
    return (
      <main className="page">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <EmptyState
          title="Select a property"
          text="Choose a stay from search results to view its details."
        />
      </main>
    );
  const amenities = property.amenities ?? [];
  const approvedPhotos = (photos ?? []).filter(
    (photo) => photo.moderationStatus === "approved",
  );
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: property.name,
    description: property.description || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: property.city,
      addressRegion: property.area,
      addressCountry: property.country,
    },
    amenityFeature: amenities.map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity,
    })),
    image: approvedPhotos.map((photo) => photo.url).filter(Boolean),
  };
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://menetap.com/en" },
      { "@type": "ListItem", position: 2, name: "Stays", item: "https://menetap.com/en/stays" },
      {
        "@type": "ListItem",
        position: 3,
        name: `${property.city} stays`,
        item: `https://menetap.com/en/stays?destination=${encodeURIComponent(property.city)}`,
      },
      { "@type": "ListItem", position: 4, name: property.name },
    ],
  };
  return (
    <>
      <main className="property-detail-page page">
        <button className="back-button" onClick={onBack}>
          ← Search results
        </button>
        <section className="property-detail-heading">
          <div>
            <div className="property-title-row">
              <h1>{property.name}</h1>
            </div>
            <div className="property-meta-row">
              <span className="muted">
                <MapPin size={13} /> {property.area}, {property.city}
              </span>
            </div>
          </div>
          <div className="property-detail-actions">
            <button
              className={saved ? "is-saved" : ""}
              onClick={() => setSaved(!saved)}
            >
              ♡ {saved ? "Saved" : "Save"}
            </button>
            <button>↗ Share</button>
          </div>
        </section>
        {!suppressSeo && (
          <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
            />
          </>
        )}
        <section className="property-gallery">
          {approvedPhotos.length ? (
            <>
              <div className="gallery-main">
                <img src={approvedPhotos[0].url} alt={approvedPhotos[0].altText || `${property.name} accommodation`} width="1200" height="800" loading="eager" decoding="async" />
              </div>
              <div className="gallery-grid">
                {approvedPhotos.slice(1, 4).map((photo) => (
                  <img key={photo._id} src={photo.url} alt={photo.altText || `${property.name} accommodation photo`} width="1200" height="800" loading="lazy" decoding="async" />
                ))}
                {approvedPhotos.length > 4 && (
                  <div className="gallery-more">
                    <span>+{approvedPhotos.length - 4} photos</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="gallery-main gallery-empty">Photos coming soon</div>
              <div className="gallery-grid">
                <div className="gallery-empty" aria-hidden="true" />
                <div className="gallery-empty" aria-hidden="true" />
                <div className="gallery-empty" aria-hidden="true" />
                <div className="gallery-empty" aria-hidden="true" />
              </div>
            </>
          )}
        </section>
        <div className="property-detail-layout">
          <div className="property-detail-content">
            <section className="detail-trust-row">
              <span>
                <RefreshCcw size={15} /> Free cancellation
              </span>
              <span>
                <CheckCircle2 size={15} /> Instant confirmation
              </span>
              <span>
                <ShieldCheck size={15} /> Secure payment
              </span>
            </section>
            <section className="detail-section">
              <h2>About this stay</h2>
              <p>
                {property.description ||
                  "A carefully selected stay with practical amenities, thoughtful hosting, and a comfortable base for exploring the area."}
              </p>
              <a href="#amenities">Show more ↓</a>
            </section>
            <section id="amenities" className="detail-section">
              <h2>What this place offers</h2>
              {amenities.length ? (
                <div className="amenities-grid">
                  {amenities.map((amenity) => (
                    <span key={amenity}>✓ {amenity}</span>
                  ))}
                </div>
              ) : (
                <p className="muted">Amenity details for this stay are being confirmed.</p>
              )}
            </section>
            <section className="pricing-transparency detail-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Transparent pricing</p>
                  <h2>The price you see is the price you pay</h2>
                </div>
                <span className="live-pricing">Live pricing</span>
              </div>
              <div className="price-lines">
                <span>Market average</span>
                <strong>Rp 1,050,000</strong>
                <span>Menetap rate</span>
                <strong className="violet-text">Rp 890,000</strong>
                <hr />
                <b>Total for 3 nights</b>
                <b>Rp 2,670,000</b>
              </div>
              <small>No fees added later.</small>
            </section>
            <section id="rooms-section" className="detail-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Live availability</p>
                  <h2>Choose your room</h2>
                </div>
                <a href="#rooms-section">View dates</a>
              </div>
              {rooms === undefined ? (
                <LoadingState label="Checking room availability…" />
              ) : rooms?.length ? (
                <div className="detail-room-list">
                  {rooms.slice(0, 3).map((room) => (
                    <article className="detail-room-card" key={room._id}>
                      <div className="room-thumb">Photo</div>
                      <div>
                        <h3>{room.name}</h3>
                        <p>
                          {room.maxGuests} guests · {room.amenities.join(" · ")}
                        </p>
                        <span>Free cancellation</span>
                      </div>
                      <div>
                        <strong>Rp 890,000</strong>
                        <small>/night</small>
                        <button onClick={onRooms}>Choose room</button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No rooms available"
                  text="Try different dates to see available rooms."
                />
              )}
            </section>
            <section className="detail-section">
              <h2>Add local experiences</h2>
              <div className="experience-mini-grid">
                <div>
                  <strong>Borobudur sunrise tour</strong>
                  <small>From Rp 350,000/person</small>
                </div>
                <div>
                  <strong>Merapi jeep adventure</strong>
                  <small>From Rp 275,000/person</small>
                </div>
              </div>
            </section>
            <section className="detail-section">
              <div className="section-heading">
                <h2>Reviews</h2>
              </div>
              <p className="muted">
                Guest reviews for this stay aren't available yet.
              </p>
            </section>
            <section className="detail-section">
              <h2>House rules</h2>
              <div className="rules-grid">
                <span>
                  Check-in <b>2:00 PM – 10:00 PM</b>
                </span>
                <span>
                  Check-out <b>Before 12:00 PM</b>
                </span>
                <span>No smoking</span>
                <span>No parties or events</span>
              </div>
            </section>
            <section className="detail-section">
              <h2>Location</h2>
              <div className="detail-map">
                Map view<span>{property.name}</span>
              </div>
              <p className="muted">
                {property.address}, {property.city} · close to local attractions
                and transport.
              </p>
            </section>
          </div>
          <aside className="detail-booking-card">
            <strong>
              Rp 890,000 <small>/night</small>
            </strong>
            <span className="muted">Garden Suite · 2 guests</span>
            <div className="booking-dates">
              <span>
                Check-in
                <br />
                <b>Choose date</b>
              </span>
              <span>
                Check-out
                <br />
                <b>Choose date</b>
              </span>
              <span>
                Guests
                <br />
                <b>2 adults</b>
              </span>
            </div>
            <div className="booking-total">
              <span>3 nights</span>
              <b>Rp 2,670,000</b>
            </div>
            <button onClick={onRooms}>Reserve now</button>
            <small>You won't be charged yet</small>
          </aside>
        </div>
      </main>
      <div className="mobile-detail-cta">
        <div>
          <strong>Rp 890,000</strong>
          <small>/night</small>
        </div>
        <button onClick={onRooms}>Reserve now</button>
      </div>
    </>
  );
}
function RoomSelection({
  propertyId,
  search,
  setSearch,
  onBack,
  onContinue,
}: {
  propertyId: string | null;
  search: SearchState;
  setSearch: (value: SearchState) => void;
  onBack: () => void;
  onContinue: (id: string) => void;
}) {
  const rooms = useQuery(
    api.rooms.listForProperty,
    propertyId
      ? {
          propertyId: propertyId as never,
          checkIn: search.checkIn,
          checkOut: search.checkOut,
          guests: search.guests,
          childAges: search.childAges,
        }
      : "skip",
  );
  const reservationAddOns = useQuery(api.services.listActive);
  const [selectedRooms, setSelectedRooms] = useState<Record<string, number>>(
    {},
  );
  const [selectedPlans, setSelectedPlans] = useState<
    Record<string, "refundable" | "nonref">
  >({});
  const [breakfastRooms, setBreakfastRooms] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedReservationAddOns, setSelectedReservationAddOns] = useState<
    Record<string, boolean>
  >({});
  const [editCheckIn, setEditCheckIn] = useState(search.checkIn);
  const [editCheckOut, setEditCheckOut] = useState(search.checkOut);
  const [editAdults, setEditAdults] = useState(search.adults);
  const [editChildren, setEditChildren] = useState(search.children);
  const [datesOpen, setDatesOpen] = useState(false);
  const dateEditorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!datesOpen) return;
    const handleOutsidePointer = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (
        !dateEditorRef.current?.contains(target) &&
        !target.closest(".change-search-link")
      )
        setDatesOpen(false);
    };
    document.addEventListener("pointerdown", handleOutsidePointer);
    return () =>
      document.removeEventListener("pointerdown", handleOutsidePointer);
  }, [datesOpen]);
  const selectedRoomEntries =
    rooms?.filter((room) => (selectedRooms[room._id] ?? 0) > 0) ?? [];
  const selectedRoom = selectedRoomEntries[0];
  const updateQuantity = (roomId: string, delta: number) =>
    setSelectedRooms((current) => {
      const next = Math.max(0, Math.min(6, (current[roomId] ?? 0) + delta));
      const updated = { ...current };
      if (next) updated[roomId] = next;
      else delete updated[roomId];
      return updated;
    });
  const nights = Math.max(
    1,
    Math.round(
      (new Date(search.checkOut).getTime() -
        new Date(search.checkIn).getTime()) /
        86400000,
    ),
  );
  const roomNightlyRate = (room: any) => {
    const liveRates = "liveNightlyRates" in room ? room.liveNightlyRates : undefined; const liveRate = liveRates?.length ? Math.min(...liveRates.map((night: { rate: number }) => night.rate)) : room.ratePlans?.[0]?.price ?? 0;
    return selectedPlans[room._id] === "nonref" ? Math.round(liveRate * 0.9) : liveRate;
  };
  const childNightlyRate = (room: any) => room.childPolicy?.pricing === "flat" ? (room.childPolicy.flatRate ?? 0) * search.childAges.length : room.childPolicy?.pricing === "age_band" ? search.childAges.reduce((sum: number, age: number) => sum + (room.childPolicy.ageRates?.find((band: { maxAge: number }) => age <= band.maxAge)?.nightlyRate ?? 0), 0) : 0;
  const roomSubtotal = selectedRoomEntries.reduce((sum, room) => sum + roomNightlyRate(room) * nights * (selectedRooms[room._id] ?? 0), 0);
  const childSubtotal = selectedRoomEntries.reduce((sum, room) => sum + childNightlyRate(room) * nights * (selectedRooms[room._id] ?? 0), 0);
  const addonSubtotal = selectedRoomEntries.reduce((sum, room) => sum + (breakfastRooms[room._id] ? 75000 * search.guests * nights * (selectedRooms[room._id] ?? 0) : 0), 0) + (reservationAddOns ?? []).reduce((sum, service) => sum + (selectedReservationAddOns[service._id] ? service.price : 0), 0);
  const total =
    roomSubtotal + childSubtotal + addonSubtotal;
  const selectedRoomCount = Object.values(selectedRooms).reduce(
    (sum, quantity) => sum + quantity,
    0,
  );
  return (
    <main className="room-selection-page page">
      <button className="back-button" onClick={onBack}>
        ← Property details
      </button>
      <section className="room-selection-header">
        <div>
          <h1>Choose your room</h1>
          <span className="instant-badge">Instant confirmation</span>
        </div>
        <a
          className="change-search-link"
          href="#edit-dates"
          onClick={(event) => {
            event.preventDefault();
            setDatesOpen(!datesOpen);
          }}
        >
          Change dates or guests
        </a>
        {datesOpen && (
          <div ref={dateEditorRef} className="date-editor">
            <div className="date-editor-fields">
              <label>
                Check-in
                <input
                  type="date"
                  value={editCheckIn}
                  onChange={(event) => setEditCheckIn(event.target.value)}
                />
              </label>
              <label>
                Check-out
                <input
                  type="date"
                  value={editCheckOut}
                  onChange={(event) => setEditCheckOut(event.target.value)}
                />
              </label>
            </div>
            <div className="date-editor-guests">
              <label>Adults</label>
              <div className="guest-stepper">
                <button
                  type="button"
                  onClick={() => setEditAdults(Math.max(1, editAdults - 1))}
                >
                  −
                </button>
                <strong>{editAdults}</strong>
                <button
                  type="button"
                  onClick={() => setEditAdults(Math.min(10, editAdults + 1))}
                >
                  +
                </button>
              </div>
            </div>
            <div className="date-editor-guests">
              <label>Children</label>
              <div className="guest-stepper">
                <button
                  type="button"
                  onClick={() => setEditChildren(Math.max(0, editChildren - 1))}
                >
                  −
                </button>
                <strong>{editChildren}</strong>
                <button
                  type="button"
                  onClick={() =>
                    setEditChildren(Math.min(10, editChildren + 1))
                  }
                >
                  +
                </button>
              </div>
            </div>
            <div className="date-editor-warning">
              Changing dates will re-check availability and may update room
              prices.
            </div>
            <button
              className="date-editor-submit"
              onClick={() => {
                if (editCheckOut <= editCheckIn) return;
                setSearch({
                  ...search,
                  checkIn: editCheckIn,
                  checkOut: editCheckOut,
                  guests: editAdults + editChildren,
                  adults: editAdults,
                  children: editChildren,
                  childAges: Array.from({ length: editChildren }, (_, index) => search.childAges[index] ?? 5),
                });
                setSelectedRooms({});
                setBreakfastRooms({});
                setDatesOpen(false);
              }}
            >
              Update search
            </button>
          </div>
        )}
      </section>
      <div className="room-selection-layout">
        <div className="room-results">
          {rooms === undefined ? (
            <LoadingState label="Checking room availability…" />
          ) : rooms.length ? (
            rooms.map((room, index) => {
              const selected = (selectedRooms[room._id] ?? 0) > 0;
              const liveRate = room.liveNightlyRates.length ? Math.min(...room.liveNightlyRates.map((night: { rate: number }) => night.rate)) : room.ratePlans?.[0]?.price ?? 0;
              const nonRefundableRate = Math.round(liveRate * 0.9);
              return (
                <article
                  className={`room-option-card ${selected ? "is-selected" : ""}`}
                  key={room._id}
                >
                  <div className="room-option-gallery">
                    <div
                      className={`room-option-photo room-photo-${index % 3} main-room-photo`}
                    >
                      Main room photo
                    </div>
                    <div
                      className={`room-option-photo room-photo-${(index + 1) % 3}`}
                    >
                      Photo
                    </div>
                    <div
                      className={`room-option-photo room-photo-${(index + 2) % 3}`}
                    >
                      Photo
                    </div>
                    <div
                      className={`room-option-photo room-photo-${index % 3}`}
                    >
                      Photo
                    </div>
                  </div>
                  <div className="room-option-content">
                    <h2>{room.name}</h2>
                    <p className="room-specs">
                      28m² · Garden view · 1 double bed · max {room.maxGuests}{" "}
                      guests
                    </p>
                    <div className="room-amenities">
                      {[
                        { label: "Free WiFi", Icon: Wifi },
                        { label: "AC", Icon: Wind },
                        { label: "Pool access", Icon: Waves },
                      ].map(({ label, Icon }) => (
                        <span key={label}>
                          <Icon size={13} /> {label}
                        </span>
                      ))}
                    </div>
                    <div className="rate-plan">
                      <div>
                        <strong className="rate-plan-title">Refundable</strong>
                        <small>
                          Free cancellation before{" "}
                          {formatDisplayDate(search.checkIn)} at 2:00 PM
                        </small>
                      </div>
                      <div className="rate-plan-price">
                        <b>
                          Rp {liveRate.toLocaleString("en-US")}
                          <small className="night-suffix">/night</small>
                        </b>
                      </div>
                      <button
                        className="choose-rate-button"
                        onClick={() => {
                          setSelectedPlans((current) => ({
                            ...current,
                            [room._id]: "refundable",
                          }));
                          if (!(selectedRooms[room._id] ?? 0))
                            updateQuantity(room._id, 1);
                        }}
                      >
                        Choose Rate Plan
                      </button>
                    </div>
                    <div className="rate-plan secondary">
                      <div>
                        <strong className="rate-plan-title">
                          Non-refundable
                        </strong>
                        <small>
                          cancellation is strict ·{" "}
                          <span className="rate-plan-discount">
                            10% cheaper
                          </span>
                        </small>
                      </div>
                      <div className="rate-plan-price">
                        <b>
                          Rp {nonRefundableRate.toLocaleString("en-US")}
                          <small className="night-suffix">/night</small>
                        </b>
                      </div>
                      <button
                        className="choose-rate-button"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Non-refundable bookings cannot be cancelled for a refund. Continue with this 10% cheaper rate?",
                            )
                          ) {
                            setSelectedPlans((current) => ({
                              ...current,
                              [room._id]: "nonref",
                            }));
                            if (!(selectedRooms[room._id] ?? 0))
                              updateQuantity(room._id, 1);
                          }
                        }}
                      >
                        Choose Rate Plan
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <EmptyState
              title="No rooms available for these dates"
              text="Try different dates or fewer guests to see available rooms."
            />
          )}
        </div>
        <aside className="room-selection-summary">
          <div className="summary-label">Your selection</div>
          <div className="cart-stay-summary">
            <strong>Kaliurang Heritage Villa</strong>
            <span>
              {formatDisplayDate(search.checkIn)} →{" "}
              {formatDisplayDate(search.checkOut)} ·<br />
              {nights} {nights === 1 ? "night" : "nights"} · {search.adults}{" "}
              adults + {search.children} children
            </span>
          </div>
          {selectedRoomCount ? (
            <>
              <div className="cart-room-list">
                {selectedRoomEntries.map((room) => (
                  <div className="cart-room-row" key={room._id}>
                    <span>
                      {room.name}
                      <small>
                        {selectedPlans[room._id] === "nonref"
                          ? "Non-refundable"
                          : "Refundable"}
                      </small>
                    </span>
                    <div className="room-quantity-control">
                      <button onClick={() => updateQuantity(room._id, -1)}>
                        −
                      </button>
                      <b>{selectedRooms[room._id] ?? 0}</b>
                      <button onClick={() => updateQuantity(room._id, 1)}>
                        +
                      </button>
                    </div>
                    <label className="cart-addon">
                      <input
                        type="checkbox"
                        checked={breakfastRooms[room._id] ?? false}
                        onChange={(event) =>
                          setBreakfastRooms((current) => ({
                            ...current,
                            [room._id]: event.target.checked,
                          }))
                        }
                      />
                      <span>
                        Add breakfast <small>Rp 75,000/pax/night</small>
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              {reservationAddOns?.length ? (
                <div className="cart-reservation-addons">
                  <div className="cart-addon-heading">Reservation add-ons</div>
                  {reservationAddOns.map((service) => (
                    <label className="cart-addon" key={service._id}>
                      <input
                        type="checkbox"
                        checked={
                          selectedReservationAddOns[service._id] ?? false
                        }
                        onChange={(event) =>
                          setSelectedReservationAddOns((current) => ({
                            ...current,
                            [service._id]: event.target.checked,
                          }))
                        }
                      />
                      <span>
                        {service.name}
                        <small>
                          Rp {service.price.toLocaleString("en-US")} one-time
                        </small>
                      </span>
                    </label>
                  ))}
                </div>
              ) : null}
              <div className="cart-price-breakdown">
                {selectedRoomEntries.map((room) => (
                  <>
                    <div key={`breakdown-${room._id}`}>
                      <span>
                        {room.name} ×{selectedRooms[room._id] ?? 0}
                      </span>
                      <b>
                        Rp{" "}
                        {(
                          roomNightlyRate(room) *
                          nights *
                          (selectedRooms[room._id] ?? 0)
                        ).toLocaleString("en-US")}
                      </b>
                    </div>
                    {breakfastRooms[room._id] && (
                      <div key={`breakfast-breakdown-${room._id}`}>
                        <span>
                          Breakfast ×
                          {search.guests * (selectedRooms[room._id] ?? 0)}
                        </span>
                        <b>
                          Rp{" "}
                          {(
                            75000 *
                            search.guests *
                            nights *
                            (selectedRooms[room._id] ?? 0)
                          ).toLocaleString("en-US")}
                        </b>
                      </div>
                    )}
                  </>
                ))}
                {childSubtotal > 0 && <div><span>Child charges</span><b>Rp {childSubtotal.toLocaleString("en-US")}</b></div>}
                <div className="pricing-note"><span>Taxes & service fees</span><b>Included</b></div>
                {reservationAddOns
                  ?.filter((service) => selectedReservationAddOns[service._id])
                  .map((service) => (
                    <div key={`addon-breakdown-${service._id}`}>
                      <span>{service.name}</span>
                      <b>Rp {service.price.toLocaleString("en-US")}</b>
                    </div>
                  ))}
              </div>
              <hr />
              <div className="summary-total">
                <span>Total</span>
                <b>Rp {total.toLocaleString("en-US")}</b>
              </div>
              <button onClick={() => { localStorage.setItem("menetapBookingCart", JSON.stringify({ rooms: selectedRoomEntries.map((room) => ({ roomTypeId: room._id, name: room.name, quantity: selectedRooms[room._id] ?? 0, ratePlan: selectedPlans[room._id] === "nonref" ? "Non-refundable" : "Refundable", roomTotal: roomNightlyRate(room) * nights * (selectedRooms[room._id] ?? 0), breakfast: breakfastRooms[room._id] ? 75000 * search.guests * nights * (selectedRooms[room._id] ?? 0) : 0 })), childTotal: childSubtotal, addOns: (reservationAddOns ?? []).filter((service) => selectedReservationAddOns[service._id]).map((service) => ({ name: service.name, price: service.price })), total })); onContinue(selectedRoom._id); }}>
                Continue to checkout
              </button>
            </>
          ) : (
            <p>
              Pick a room and rate plan to continue. You can mix room types if
              you need extra space.
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
function AdminAnnouncements(){const [published,setPublished]=useState(false);const [selected,setSelected]=useState("Peak-season readiness");const items=[["Peak-season readiness","Partner","Published · 24-Sep-2026"],["New inventory calendar","Product","Published · 18-Sep-2026"],["Scheduled maintenance","System","Draft · 30-Sep-2026"]];return <AdminFrame title="Announcements" section="Communication"><div className="ops-intro"><div><h2>Announcements</h2><p>Create and manage updates shown to guests, partners, or internal teams.</p></div><button className="save-property" onClick={()=>setPublished(true)}>{published?"Draft created":"New announcement"}</button></div><div className="announcement-admin-grid"><section className="admin-card announcement-admin-list">{items.map(x=><button className={selected===x[0]?"selected":""} onClick={()=>setSelected(x[0])} key={x[0]}><b>{x[0]}</b><small>{x[1]} · {x[2]}</small></button>)}</section><section className="admin-card announcement-editor"><label>Title<input defaultValue={selected}/></label><label>Audience<select><option>Partners</option><option>Guests</option><option>Internal team</option></select></label><label>Message<textarea defaultValue="Share a clear, practical update with the people who need it."/></label><div><button className="outline-button">Save draft</button><button className="save-property">Publish</button></div></section></div></AdminFrame>}
function AdminSettings(){const [saved,setSaved]=useState(false);return <AdminFrame title="Settings" section="Account"><div className="admin-card settings-card"><h2>Platform settings</h2><label>Platform name<input defaultValue="Menetap"/></label><label>Support email<input defaultValue="support@menetap.com"/></label><label>Default language<select defaultValue="EN"><option>EN</option><option>ID</option></select></label><label>Default currency<select defaultValue="IDR"><option>IDR · Indonesian Rupiah</option><option>USD · US Dollar</option></select></label><button className="save-property" onClick={()=>setSaved(true)}>{saved?"Changes saved":"Save settings"}</button></div><div className="detail-two-col"><section className="admin-card settings-card"><h2>Security</h2><label><input type="checkbox" defaultChecked/> Require MFA for admin users</label><label><input type="checkbox" defaultChecked/> Log sensitive changes</label><label>Session timeout<select defaultValue="8 hours"><option>4 hours</option><option>8 hours</option><option>24 hours</option></select></label></section><section className="admin-card settings-card"><h2>Notifications</h2><label><input type="checkbox" defaultChecked/> Risk and fraud alerts</label><label><input type="checkbox" defaultChecked/> Failed payout alerts</label><label><input type="checkbox"/> Daily operations digest</label></section></div></AdminFrame>}
function AdminSystem(){const services=[["Web application","Operational","99.99%"],["Convex database","Operational","99.98%"],["Booking availability","Operational","99.95%"],["Notifications","Degraded — delayed emails","98.60%"],["File storage","Operational","99.99%"]];return <AdminFrame title="System health" section="Account"><div className="ops-intro"><div><h2>System health</h2><p>Monitor platform services, incidents, and recent operational events.</p></div><span className="system-overall">● All systems operational</span></div><section className="admin-card system-services">{services.map(s=><div key={s[0]}><span><i className={s[1].startsWith("Degraded")?"degraded-dot":"healthy-dot"}/><b>{s[0]}</b><small>{s[1]}</small></span><strong>{s[2]}</strong></div>)}</section><section className="admin-card"><h2>Recent incidents</h2><AdminSimpleTable headers={["Incident","Impact","Started","Status"]} rows={[["Email delays","Notification queue backed up ~15 min","2 hours ago","Monitoring"],["—","No other active incidents","—","Operational"]]}/></section></AdminFrame>}
function AdminAccessDenied(){return <div className="admin-denied-page"><div className="admin-denied-card"><div className="denied-icon">!</div><p className="eyebrow">Access restricted</p><h1>You don’t have permission to view this page.</h1><p>This area is limited to users with the required admin role. If you believe this is a mistake, contact your administrator.</p><div><a className="save-property" href="/admin">Back to Admin Console</a><a className="outline-button" href="/en">Go to Menetap</a></div></div></div>}

function AdminOpsPage({kind}:{kind:"payouts"|"reports"|"disputes"|"moderation"|"risk"|"support"}){const config={payouts:{title:"Payouts",section:"Commerce",desc:"Review partner payout queue, settlement status, and exceptions.",stats:[["Queued today","12"],["Processing","Rp 18.4M"],["Paid this month","Rp 710M"],["Exceptions","3"]],headers:["Property","Gross","Commission","Net payout","Status"],rows:[["Malioboro Skyline Suites","Rp 4,120,000","Rp 494,400","Rp 3,625,600","Processing"],["Kaliurang Heritage Villa","Rp 2,670,000","Rp 320,400","Rp 2,349,600","Ready"],["Surabaya City Suites","Rp 2,890,000","Rp 346,800","Rp 2,543,200","Failed"]]},reports:{title:"Reports",section:"Insights",desc:"Download operational and financial reports for the selected period.",stats:[["Bookings","842"],["Gross booking value","Rp 842M"],["Commission revenue","Rp 84.2M"],["Cancellation rate","3.8%"]],headers:["Report","Period","Generated by","Format","Action"],rows:[["Revenue summary","Sep 2026","System","CSV","Download"],["Partner payout ledger","Sep 2026","System","CSV","Download"],["Booking performance","Q3 2026","Anin W.","PDF","Download"]]},disputes:{title:"Disputes & refunds",section:"Trust & Safety",desc:"Review guest and partner disputes, refunds, and resolution history.",stats:[["Open disputes","2"],["Awaiting partner","4"],["Refunds this month","Rp 3.8M"],["Avg. resolution","1.4 days"]],headers:["Case","Booking","Raised by","Amount","Status"],rows:[["DSP-2048","MTP-7X9K2Q","Guest","Rp 890,000","Open"],["DSP-2031","MTP-4H1L8B","Partner","Rp 620,000","Awaiting info"],["DSP-1988","MTP-2R6V9C","Guest","Rp 2,200,000","Resolved"]]},moderation:{title:"Listing moderation",section:"Trust & Safety",desc:"Review property content before it appears to guests.",stats:[["Pending review","3"],["Approved this week","18"],["Needs changes","4"],["Paused listings","2"]],headers:["Property","Partner","Submitted","Quality","Action"],rows:[["Solo Heritage House","Rizky Mahendra","25-Sep-2026","92/100","Review"],["Dieng Highland Cottage","Anin Wida","24-Sep-2026","78/100","Review"],["Bandung Hillside Retreat","Sinta Dewi","23-Sep-2026","Needs photos","Review"]]},risk:{title:"Risk & fraud flags",section:"Trust & Safety",desc:"Monitor unusual booking, payout, and account activity.",stats:[["Open flags","4"],["High severity","1"],["Reviewed today","8"],["Blocked accounts","2"]],headers:["Flag","Entity","Signal","Severity","Status"],rows:[["RSK-448","Guest · anin@example.com","Multiple failed payments","High","Open"],["RSK-447","MTP-4H1L8B","Unusual cancellation pattern","Medium","Reviewing"],["RSK-441","Partner · Raka M.","Payout account change","Low","Cleared"]]},support:{title:"Support inbox",section:"Communication",desc:"Resolve guest, partner, and internal support requests.",stats:[["Open tickets","18"],["Unassigned","5"],["SLA at risk","2"],["Resolved today","24"]],headers:["Ticket","Requester","Topic","Updated","Status"],rows:[["SUP-2048","Anin W.","Room not ready","Today · 09:42","Open"],["SUP-2042","Kaliurang Villa","Payout question","Today · 08:15","In progress"],["SUP-2036","Dimas P.","Change dates","Yesterday","Resolved"]]}}[kind]; const [query,setQuery]=useState(""); const [selected,setSelected]=useState<string|null>(null); const filtered=config.rows.filter(r=>r.join(" ").toLowerCase().includes(query.toLowerCase())); return <AdminFrame title={config.title} section={config.section}><div className="ops-intro"><div><h2>{config.title}</h2><p>{config.desc}</p></div><div className="ops-actions"><label className="admin-search"><Search size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search"/></label><button className="save-property">Export CSV</button></div></div><div className="admin-stats">{config.stats.map(([label,value],i)=><AdminStat label={label} value={value} accent={i===1} key={label}/>)}</div><section className="admin-card ops-table-card"><div className="ops-table-head">{config.headers.map(h=><b key={h}>{h}</b>)}</div>{filtered.map((row,i)=><button className="ops-table-row" onClick={()=>setSelected(row[0])} key={i}>{row.map((v,j)=><span className={j===row.length-1?`ops-status ${v.toLowerCase().replaceAll(" ","-")}`:""} key={j}>{v}</span>)}</button>)}{!filtered.length&&<div className="admin-empty">No records match your search.</div>}</section><section className="admin-card ops-note"><h2>Operational notes</h2><p>Actions on this workspace are auditable. Every approval, refund, status change, and assignment should include a clear reason.</p><button className="outline-button">View audit log</button></section>{selected&&<div className="booking-modal-backdrop" onClick={()=>setSelected(null)}><div className="ops-modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><h2>{selected}</h2><button onClick={()=>setSelected(null)}>×</button></div><p>Review this record and add an internal note before changing its status.</p><textarea placeholder="Internal note"/><div><button className="outline-button" onClick={()=>setSelected(null)}>Close</button><button className="save-property" onClick={()=>setSelected(null)}>Save action</button></div></div></div>}</AdminFrame>}

function AdminFrame({title,section,children}:{title:string;section:string;children:ReactNode}){const navGroups:[string,[string,string][]][]=[['Commerce',[['Commission','/admin'],['Properties','/admin/properties'],['Rentals','/admin/rentals'],['Suppliers','/admin/supplier'],['Payments','/admin/payments'],['Payouts','/admin/payouts'],['Finance','/admin/finance']]],['People',[['Users','/admin/users'],['Team','/admin/team']]],['Trust & safety',[['Moderation','/admin/moderation'],['Disputes & refunds','/admin/disputes'],['Risk & fraud','/admin/risk']]],['Communication',[['Support inbox','/admin/support'],['Announcements','/admin/announcements']]],['Insights',[['Reports','/admin/reports'],['System health','/admin/system']]],['Account',[['Settings','/admin/settings']]]];return <div className="admin-console-page"><header className="admin-console-header"><div className="admin-console-wrap"><a className="admin-console-brand" href="/admin"><span>menetap<span>.</span></span><small>admin</small></a><div className="admin-console-tools"><label><Search size={14}/><input placeholder="Search everything..."/></label><span className="admin-access">Superadmin access · full edit</span><span className="admin-avatar">UP</span></div></div></header><main className="admin-console-wrap admin-main"><div className="admin-breadcrumb"><a href="/admin">Admin</a><span>›</span><span>{section}</span><span>›</span><b>{title}</b></div><h1 className="admin-page-title">{title}</h1><div className="admin-grid"><nav className="admin-sidebar">{navGroups.map(([groupLabel,items])=><div key={groupLabel}><small>{groupLabel.toUpperCase()}</small>{items.map(([label,href])=><button className={label===title||groupLabel===section?"active":""} onClick={()=>window.location.assign(href)} key={label}>{label}</button>)}</div>)}</nav><section className="admin-content">{children}</section></div></main></div>}
function AdminPropertyDetail(){
  const [tab,setTab]=useState("Overview"); const [propertyId]=useState<any>(()=>new URLSearchParams(window.location.search).get("propertyId"));
  const property=useQuery(api.properties.get,propertyId?{id:propertyId}:"skip"); const photos=useQuery(api.properties.listPhotos,propertyId?{propertyId}:"skip"); const rooms=useQuery(api.rooms.listForProperty,propertyId?{propertyId}:"skip");
  const review=useMutation(api.properties.review); const setPublished=useMutation(api.properties.setPublished); const [message,setMessage]=useState(""); const [reason,setReason]=useState(""); const [busy,setBusy]=useState(false);
  const act=async(action:"approve"|"reject"|"suspend"|"publish"|"unpublish")=>{if(reason.trim().length<3){setMessage("Enter a review reason (at least 3 characters).");return;} setBusy(true);setMessage("");try{if(action==="publish"||action==="unpublish")await setPublished({propertyId, published:action==="publish", reason});else await review({propertyId, decision:action, reason});setReason("");setMessage("Action saved.");}catch(error){setMessage(error instanceof Error?error.message:"Unable to save action.");}finally{setBusy(false);}};
  if(!propertyId)return <AdminFrame title="Property detail" section="Properties"><section className="admin-card"><h2>Property not selected</h2><p>Open a property from the admin queue.</p></section></AdminFrame>;
  if(property===undefined)return <AdminFrame title="Property detail" section="Properties"><LoadingState label="Loading property…"/></AdminFrame>;
  if(property===null)return <AdminFrame title="Property detail" section="Properties"><section className="admin-card"><h2>Property not found</h2></section></AdminFrame>;
  const canReview=["verification","approved","published"].includes(property.status); const canPublish=property.status==="approved"; const canUnpublish=property.status==="published";
  return <AdminFrame title={property.name} section="Properties"><div className="detail-header"><div><span className={`property-status ${property.status}`}>{property.status}</span><h2>{property.name}</h2><p>{property.area}, {property.city} · Listed since {new Date(property.createdAt).toLocaleDateString()}</p></div></div><div className="detail-tabs">{["Overview","Bookings","Payouts"].map(t=><button className={tab===t?"active":""} onClick={()=>setTab(t)} key={t}>{t}</button>)}</div>{tab==="Overview"?<><section className="admin-card"><h2>Review actions</h2><label>Reason<input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Required for every decision"/></label><div className="admin-actions">{canReview&&<><button className="save-property" disabled={busy} onClick={()=>act("approve")}>Approve</button><button className="outline-button" disabled={busy} onClick={()=>act("reject")}>Reject</button><button className="outline-button" disabled={busy} onClick={()=>act("suspend")}>Suspend</button></>}{canPublish&&<button className="save-property" disabled={busy} onClick={()=>act("publish")}>Publish</button>}{canUnpublish&&<button className="outline-button" disabled={busy} onClick={()=>act("unpublish")}>Unpublish</button>}</div>{message&&<p className={message==="Action saved."?"success-text":"error-text"}>{message}</p>}</section><div className="detail-two-col"><section className="admin-card"><h2>Property profile</h2><DetailRow label="Property type" value={property.type}/><DetailRow label="Address" value={property.address}/><DetailRow label="Contact" value={property.contactEmail||property.contactName||"—"}/><DetailRow label="Cancellation" value={property.cancellationPolicy || "—"}/></section><section className="admin-card"><h2>Photos</h2>{photos===undefined?<LoadingState label="Loading photos…"/>:photos.length?<p>{photos.length} photos on file.</p>:<p className="muted">No photos uploaded.</p>}</section></div><section className="admin-card"><h2>Rooms & rates</h2>{rooms===undefined?<LoadingState label="Loading rooms…"/>:<AdminSimpleTable headers={["Room type","Units","Max guests","Status"]} rows={rooms.map((room:any)=>[room.name,String(room.totalUnits),String(room.maxGuests),room.active?"Active":"Inactive"])}/>}</section></>:<section className="admin-card"><h2>{tab}</h2><p>This tab remains intentionally out of scope for this approval milestone.</p></section>}</AdminFrame>}
function AdminPartnerDetail(){const applications=useQuery(api.partnerAdmin.listApplications,{})||[];const review=useMutation(api.partnerApplications.review);const setAccountStatus=useMutation(api.partnerAdmin.setAccountStatus);const [message,setMessage]=useState("");const [busy,setBusy]=useState<string|null>(null);const act=async(id:any,action:any)=>{setBusy(id+action);setMessage("");try{if(action==="approve"||action==="reject")await review({applicationId:id,decision:action,rejectionReason:action==="reject"?"Application requires additional review details.":undefined});else await setAccountStatus({userId:id,status:action,reason:action==="suspended"?"Administrative review":"Partner reinstated after review"});setMessage("Action saved.");}catch(err){setMessage(err instanceof Error?err.message:"Unable to save action.");}finally{setBusy(null);}};return <AdminFrame title="Partner review" section="Partners"><div className="ops-intro"><div><h2>Partner applications</h2><p>Review applications, agreement versions, and partner account access.</p></div></div>{message&&<p className={message==="Action saved."?"success-text":"error-text"}>{message}</p>}<section className="admin-card ops-table-card"><div className="ops-table-head"><b>Property / applicant</b><b>Status</b><b>Agreement</b><b>Actions</b></div>{applications.map((a:any)=><div className="ops-table-row" key={a._id}><span><strong>{a.propertyName}</strong><small>{a.userId}</small></span><span className={`ops-status ${a.status}`}>{a.status.replace("_"," ")}</span><span>Recorded on submission</span><span>{a.status==="pending_review"&&<><button className="save-property" disabled={busy===a._id+"approve"} onClick={()=>act(a._id,"approve")}>Approve</button><button className="outline-button" disabled={busy===a._id+"reject"} onClick={()=>act(a._id,"reject")}>Reject</button></>}{a.status==="approved"&&<><button className="outline-button" onClick={()=>act(a.userId,"suspended")}>Suspend</button><button className="save-property" onClick={()=>act(a.userId,"active")}>Reinstate</button></>}</span></div>)}{!applications.length&&<div className="admin-empty">No partner applications found.</div>}</section></AdminFrame>}
function AdminGuestDetail(){return <AdminFrame title="Anin W." section="Guests"><div className="detail-header"><div><span className="property-status live">Active guest</span><h2>Anin W.</h2><p>anin@example.com · Guest since Jul 2026</p></div><button className="outline-button">Reset password</button></div><div className="admin-stats"><AdminStat label="Trips" value="3"/><AdminStat label="Completed stays" value="2"/><AdminStat label="Total spend" value="Rp 8.4M" accent/><AdminStat label="Rewards points" value="840"/></div><div className="detail-two-col"><section className="admin-card"><h2>Guest profile</h2><DetailRow label="Email" value="anin@example.com"/><DetailRow label="Phone" value="+62 812 3456 7890"/><DetailRow label="Home country" value="Indonesia"/><DetailRow label="Joined" value="04-Jul-2026"/></section><section className="admin-card"><h2>Recent activity</h2><DetailRow label="Last sign in" value="26-Sep-2026 · 08:42"/><DetailRow label="Saved stays" value="3"/><DetailRow label="Support tickets" value="1 resolved"/><DetailRow label="Account status" value="Active"/></section></div><section className="admin-card"><h2>Booking history</h2><AdminSimpleTable headers={["Property","Dates","Amount","Status"]} rows={[["Kaliurang Heritage Villa","12–15 Oct 2026","Rp 6,960,000","Confirmed"],["Malioboro Skyline Suites","04–06 Jul 2026","Rp 2,200,000","Completed"]]}/></section></AdminFrame>}
function AdminUsers(){const [tab,setTab]=useState("Guests");return <AdminFrame title="Users" section="People"><div className="detail-header"><div><h2>Users</h2><p>Manage guest and partner accounts, access, and account status.</p></div><button className="save-property">Invite user</button></div><div className="detail-tabs">{["Guests","Partners"].map(t=><button className={tab===t?"active":""} onClick={()=>setTab(t)} key={t}>{t}</button>)}</div><section className="admin-card"><AdminSimpleTable headers={tab==="Guests"?["Guest","Trips","Total spend","Status","Action"]:["Partner","Properties","Commission owed","Status","Action"]} rows={tab==="Guests"?[["Anin W.","3","Rp 8.4M","Active","View"],["Dimas P.","1","Rp 1.7M","Active","View"],["Sinta Dewi","0","Rp 0","Suspended","View"]]:[["Anin Wida","2","Rp 8.4M","Active","View"],["Rizky Mahendra","1","Rp 2.1M","Active","View"]]}/></section></AdminFrame>}
function AdminTeam(){const members=[["Anin W.","Superadmin","All properties","Active"],["Dimas P.","Operations","All properties","Active"],["Sinta Dewi","Finance","All properties","Active"],["Raka M.","Support","Limited","Invited"]];return <AdminFrame title="Team & permissions" section="Account"><div className="detail-header"><div><h2>Team & permissions</h2><p>Control internal access by role and property scope.</p></div><button className="save-property">Invite team member</button></div><section className="admin-card"><AdminSimpleTable headers={["Member","Role","Property access","Status"]} rows={members}/></section><div className="detail-two-col"><section className="admin-card"><h2>Role permissions</h2><DetailRow label="Superadmin" value="Full platform access"/><DetailRow label="Operations" value="Properties, bookings, support"/><DetailRow label="Finance" value="Commission, payouts, reports"/><DetailRow label="Support" value="Guest and partner tickets"/></section><section className="admin-card"><h2>Recent access changes</h2><DetailRow label="Today" value="Raka M. invited"/><DetailRow label="Yesterday" value="Dimas P. role updated"/><DetailRow label="20-Sep" value="Finance scope reviewed"/></section></div></AdminFrame>}
function AdminFinance(){return <AdminFrame title="Finance" section="Commerce"><div className="admin-stats"><AdminStat label="Gross bookings (MTD)" value="Rp 842M"/><AdminStat label="Commission revenue" value="Rp 84.2M" accent/><AdminStat label="Partner payouts" value="Rp 710M"/><AdminStat label="Outstanding" value="Rp 47.8M"/></div><section className="admin-card"><h2>Revenue by stream (this month)</h2><div className="finance-bars">{[["Stays","88%","Rp 74.2M"],["Featured placements","34%","Rp 6.7M"],["Services","22%","Rp 3.3M"]].map(x=><div key={x[0]}><span><b>{x[0]}</b><strong>{x[2]}</strong></span><i style={{width:x[1]}}/></div>)}</div></section><section className="admin-card"><h2>Finance ledger</h2><AdminSimpleTable headers={["Date","Type","Party","Gross","Fee / commission","Net","Status"]} rows={[["24-Sep","Booking","Kaliurang Heritage Villa","Rp 2.67M","Rp 267K","Rp 2.40M","Settled"],["24-Sep","Payout","Malioboro Skyline Suites","Rp 4.12M","Rp 0","Rp 4.12M","Processing"],["21-Aug","Payout","Surabaya City Suites","Rp 2.89M","Rp 0","Rp 2.89M","Failed"]]}/></section></AdminFrame>}
function DetailRow({label,value}:{label:string;value:string}){return <div className="detail-row"><span>{label}</span><b>{value}</b></div>}
function AdminSimpleTable({headers,rows}:{headers:string[];rows:string[][]}){return <div className="admin-simple-table"><div>{headers.map(h=><b key={h}>{h}</b>)}</div>{rows.map((r,i)=><div key={i}>{r.map((v,j)=><span className={j===r.length-1?"table-last":""} key={j}>{v}</span>)}</div>)}</div>}

function AdminProperties() {
  const [query,setQuery]=useState(""); const [filter,setFilter]=useState("Pending review"); const statusMap:any={"All":undefined,"Live":"published","Pending review":"verification","Suspended":"suspended"}; const properties=useQuery(api.properties.listForAdmin,{status:statusMap[filter]}); const filtered=(properties??[]).filter((p:any)=>`${p.name} ${p.area} ${p.city}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="admin-console-page"><header className="admin-console-header"><div className="admin-console-wrap"><a className="admin-console-brand" href="/admin"><span>menetap<span>.</span></span><small>admin</small></a><div className="admin-console-tools"><label><Search size={14}/><input placeholder="Search everything..."/></label><span className="admin-access">Superadmin access · full edit</span><span className="admin-avatar">UP</span></div></div></header><main className="admin-console-wrap admin-main"><div className="admin-breadcrumb"><a href="/admin">Admin</a><span>›</span><span>Commerce</span><span>›</span><b>Properties</b></div><div className="admin-heading"><h1>Properties</h1></div><div className="admin-grid"><nav className="admin-sidebar"><small>COMMERCE</small><button onClick={()=>window.location.assign("/admin")}>% Commission</button><button className="active">▣ Properties</button><button>◈ Payouts</button><button>▤ Finance</button><small>PEOPLE</small><button>♙ Users</button><button>♙ Team</button><small>TRUST & SAFETY</small><button>◆ Moderation</button><button>⚖ Disputes & refunds</button><button>⚠ Risk & fraud</button><small>COMMUNICATION</small><button>▣ Support inbox</button><button>⚑ Announcements</button><small>INSIGHTS</small><button>▤ Reports</button><button>◉ System health</button><small>ACCOUNT</small><button>⚙ Settings</button></nav><section className="admin-content"><div className="property-filter-bar"><label className="admin-search"><Search size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search properties"/></label><div className="status-filter-tabs">{["All","Live","Pending review","Suspended"].map(f=><button className={filter===f?"active":""} onClick={()=>setFilter(f)} key={f}>{f}</button>)}</div></div><section className="admin-card admin-property-list"><div className="admin-property-list-head"><span>Property</span><span>Status</span><span>Rooms</span><span>Bookings (MTD)</span><span>Joined</span><span></span></div>{properties===undefined?<LoadingState label="Loading properties…"/>:filtered.map((p:any)=><a href={`/admin/property-detail?propertyId=${p._id}`} className="admin-property-list-row" key={p._id}><span><strong>{p.name}</strong><small>{p.area}, {p.city}</small></span><span className={`property-status ${p.status}`}>{p.status}</span><span className="muted-dash">—</span><span className="muted-dash">—</span><span className="muted-dash">{new Date(p.createdAt).toLocaleDateString()}</span><b>View →</b></a>)}{properties!==undefined&&!filtered.length&&<div className="admin-empty">No properties match your filters.</div>}</section></section></div></main></div>;
}

function AdminConsole() {
  const [range,setRange]=useState("30 days"); const [commission,setCommission]=useState("10"); const [saved,setSaved]=useState(false); const [query,setQuery]=useState(""); const properties: [string,string,string,boolean][]=[ ["Kaliurang Heritage Villa","Sleman, Yogyakarta","12",true],["Malioboro Skyline Suites","Yogyakarta","12",false],["Borobudur Garden Retreat","Magelang, Central Java","15",false],["Solo Heritage House","Surakarta, Central Java","10",true],["Dieng Highland Cottage","Wonosobo, Central Java","12",false],["Semarang Old Town Loft","Semarang, Central Java","13",false] ]; const filtered=properties.filter(p=>p[0].toLowerCase().includes(query.toLowerCase()));
  return <div className="admin-console-page"><header className="admin-console-header"><div className="admin-console-wrap"><a className="admin-console-brand" href="/admin"><span>menetap<span>.</span></span><small>admin</small></a><div className="admin-console-tools"><label><Search size={14}/><input placeholder="Search everything..."/></label><span className="admin-access">Superadmin access · full edit</span><span className="admin-avatar">UP</span></div></div></header><main className="admin-console-wrap admin-main"><div className="admin-heading"><h1>Commission & placements</h1><div className="range-tabs">{["7 days","30 days","90 days"].map(r=><button className={range===r?"active":""} onClick={()=>setRange(r)} key={r}>{r}</button>)}<button>↓ Export CSV</button></div></div><div className="admin-grid"><nav className="admin-sidebar"><small>COMMERCE</small><button className="active">% Commission</button><button onClick={()=>window.location.assign("/admin/properties")}>▣ Properties</button><button>◈ Payouts</button><button>▤ Finance</button><small>PEOPLE</small><button>♙ Users</button><button>♙ Team</button><small>TRUST & SAFETY</small><button>◆ Moderation</button><button>⚖ Disputes & refunds</button><button>⚠ Risk & fraud</button><small>COMMUNICATION</small><button>▣ Support inbox</button><button>⚑ Announcements</button><small>INSIGHTS</small><button>▤ Reports</button><button>◉ System health</button><small>ACCOUNT</small><button>⚙ Settings</button></nav><section className="admin-content"><div className="admin-stats"><AdminStat label="Commission earned (MTD)" value="Rp 84.2M"/><AdminStat label="Featured slot revenue" value="Rp 6.7M" accent/><AdminStat label="Active properties" value="340"/><AdminStat label="Featured now" value="28" accent/></div><section className="admin-card"><h2>Platform-wide default</h2><p>Applies to all properties unless overridden individually below.</p><div className="admin-inline-input"><input type="number" value={commission} onChange={e=>setCommission(e.target.value)}/><b>%</b><button onClick={()=>setSaved(true)}>{saved?"Saved":"Save"}</button></div></section><section className="admin-card"><h2>“Featured Stay” surcharge</h2><p>Additional commission charged only on bookings attributed to a featured placement.</p><div className="admin-inline-input"><input type="number" defaultValue="2"/><b>%</b><button>Save</button></div></section><section className="admin-card"><div className="admin-card-head"><div><h2>Curated collections</h2><p>Groups of properties surfaced together on the homepage and search.</p></div><button className="admin-link">+ New collection</button></div>{[["Best pools in Yogyakarta","8 properties · Homepage","Active"],["Family-friendly stays","14 properties · Search results","Active"],["Heritage & culture stays","6 properties · Homepage","Inactive"]].map((c: string[])=><div className="collection-row" key={c[0]}><div><b>{c[0]}</b><small>{c[1]}</small></div><span className={c[2]==="Active"?"active-badge":"inactive-badge"}>{c[2]}</span></div>)}</section><section className="admin-card admin-property-card"><div className="admin-card-head"><div><h2>Property-level overrides</h2><p>Manage commission and Featured Stay placement for individual properties.</p></div><label className="admin-search"><Search size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search property"/></label></div><div className="admin-property-table"><div><b>Property</b><b>Commission</b><b>Effective</b><b>Featured Stay</b></div>{filtered.map(p=><div key={p[0]}><span><strong>{p[0]}</strong><small>{p[1]}</small></span><input defaultValue={p[2]}/><span>Property override</span><span className={p[3]?"featured-badge":"muted-dash"}>{p[3]?"Featured":"—"}</span></div>)}</div></section><section className="admin-card"><h2>Change history · {range}</h2>{[["Anin W.","set Kaliurang Heritage Villa commission to 12%","Today, 09:12"],["Anin W.","featured Solo Heritage House","Yesterday, 17:40"],["System","updated platform default to 12%","Sep 20, 2026"]].map((x: string[])=><div className="audit-row" key={x[1]}><span><b>{x[0]}</b> {x[1]}</span><small>{x[2]}</small></div>)}</section></section></div></main></div>;
}
function AdminDisputesPage(){
  const pending = useQuery(api.refunds.listPending, {});
  const [reference, setReference] = useState("");
  const [lookupReference, setLookupReference] = useState("");
  const lookup = useQuery(api.refunds.lookupBooking, lookupReference ? { reference: lookupReference } : "skip");
  const review = useMutation(api.refunds.review);
  const flag = useMutation(api.refunds.flagOverbooking);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const act = async (action: () => Promise<unknown>) => { setMessage(""); try { await action(); setMessage("Action saved."); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save action."); } };
  return <AdminFrame title="Disputes & refunds" section="Trust & Safety"><div className="ops-intro"><div><h2>Booking lookup</h2><p>Review booking history, payments, and refund requests before resolving a dispute.</p></div></div><section className="admin-card"><form onSubmit={(event)=>{event.preventDefault();setLookupReference(reference.trim());}}><label>Booking reference<input value={reference} onChange={(event)=>setReference(event.target.value)} placeholder="MTP-..." /></label><button className="save-property" type="submit">Look up booking</button></form>{lookup === undefined && lookupReference && <LoadingState label="Loading booking…" />}{lookup === null && <p className="error-text">No booking found for that reference.</p>}{lookup && <div className="detail-two-col"><div><h3>{lookup.booking.reference}</h3><p>{lookup.property?.name ?? "Property unavailable"} · {lookup.booking.guestName}</p><h3>Payment history</h3>{lookup.payments.length ? lookup.payments.map((payment)=><p key={payment._id}>{payment.status} · Rp {payment.amount.toLocaleString("en-US")} · {new Date(payment.createdAt).toLocaleString()}</p>) : <p>No payments recorded.</p>}</div><div><h3>Change history</h3>{lookup.history.length ? lookup.history.map((item)=><p key={item._id}>{item.fromStatus ?? "new"} → {item.toStatus}{item.reason ? ` · ${item.reason}` : ""}</p>) : <p>No status history recorded.</p>}<button className="outline-button" type="button" onClick={()=>act(()=>flag({bookingId:lookup.booking._id,note}))}>Flag overbooking</button></div></div>}</section><section className="admin-card"><h2>Reviewer note</h2><textarea value={note} onChange={(event)=>setNote(event.target.value)} placeholder="Explain the document outcome or overbooking concern." /><p className="muted">A meaningful note is required for overbooking flags.</p>{message && <p className={message === "Action saved." ? "success-text" : "error-text"}>{message}</p>}</section><section className="admin-card ops-table-card"><h2>Pending refunds</h2>{pending === undefined ? <LoadingState label="Loading refund requests…" /> : pending.length ? pending.map((refund)=><div className="ops-table-row" key={refund._id}><span><strong>{refund.bookingId}</strong><small>{refund.reason}</small></span><span>Rp {refund.amount.toLocaleString("en-US")}</span><span><button className="save-property" onClick={()=>act(()=>review({refundRequestId:refund._id,decision:"approve",note:note.trim() || undefined}))}>Approve</button><button className="outline-button" onClick={()=>act(()=>review({refundRequestId:refund._id,decision:"reject",note:note.trim() || undefined}))}>Reject</button></span></div>) : <div className="admin-empty">No pending refund requests.</div>}</section></AdminFrame>;
}

function AdminQuickOpsPage({kind}:{kind:"disputes"|"moderation"|"support"}) {
  const refunds = useQuery(api.refunds.listPending, kind === "disputes" ? {} : "skip");
  const decideRefund = useMutation(api.refunds.review);
  const tickets = useQuery(api.support.listForStaff, kind === "support" ? {} : "skip");
  const photos = useQuery(api.properties.listPendingModeration, kind === "moderation" ? {} : "skip");
  const moderate = useMutation(api.properties.updatePhotoModeration);
  const [message, setMessage] = useState("");
  const title = kind === "disputes" ? "Disputes & refunds" : kind === "moderation" ? "Listing moderation" : "Support inbox";
  const act = async (action: () => Promise<unknown>) => { setMessage(""); try { await action(); setMessage("Action saved."); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save action."); } };
  return <AdminFrame title={title} section={kind === "support" ? "Communication" : "Trust & Safety"}><div className="ops-intro"><div><h2>{title}</h2><p>{kind === "support" ? "Guest-submitted support requests from the live support queue." : kind === "moderation" ? "Review property photos awaiting moderation." : "Review pending refund requests."}</p></div></div>{message && <p className={message === "Action saved." ? "success-text" : "error-text"}>{message}</p>}<section className="admin-card ops-table-card">{kind === "disputes" && <>{refunds === undefined ? <LoadingState label="Loading refund requests…" /> : refunds.length ? refunds.map((refund:any)=><div className="ops-table-row" key={refund._id}><span><strong>{refund.bookingId}</strong><small>{refund.reason}</small></span><span>Rp {refund.amount.toLocaleString("en-US")}</span><span className="ops-status pending">Pending</span><span><button className="save-property" onClick={()=>act(()=>decideRefund({refundRequestId:refund._id,decision:"approve",note:"Approved by admin."}))}>Approve</button><button className="outline-button" onClick={()=>act(()=>decideRefund({refundRequestId:refund._id,decision:"reject",note:"Rejected by admin."}))}>Reject</button></span></div>) : <div className="admin-empty">No pending refund requests.</div>}</>}{kind === "moderation" && <>{photos === undefined ? <LoadingState label="Loading photos…" /> : photos.length ? photos.map((item:any)=><div className="ops-table-row" key={item.photo._id}><span><strong>{item.property?.name ?? "Unknown property"}</strong><small>{item.photo.altText}</small></span><span className="ops-status pending">Pending</span><span><button className="save-property" onClick={()=>act(()=>moderate({photoId:item.photo._id,status:"approved"}))}>Approve</button><button className="outline-button" onClick={()=>act(()=>moderate({photoId:item.photo._id,status:"rejected",rejectionReason:"Photo requires changes."}))}>Reject</button></span></div>) : <div className="admin-empty">No photos awaiting moderation.</div>}</>}{kind === "support" && <>{tickets === undefined ? <LoadingState label="Loading support requests…" /> : tickets.length ? tickets.map((ticket:any)=><div className="ops-table-row" key={ticket._id}><span><strong>{ticket.name}</strong><small>{ticket.email}{ticket.bookingReference ? ` · ${ticket.bookingReference}` : ""}</small></span><span>{ticket.message}</span><span className={`ops-status ${ticket.status}`}>{ticket.status}</span></div>) : <div className="admin-empty">No support requests.</div>}</>}</section>{kind === "support" && <p className="muted">This queue represents guest-submitted <code>supportRequests</code>; the broader <code>supportTickets</code> table has a separate workflow and is not combined here.</p>}</AdminFrame>;
}

function AdminStat({label,value,accent=false}:{label:string;value:string;accent?:boolean}){return <div className="admin-stat"><span>{label}</span><strong className={accent?"accent":""}>{value}</strong></div>}
function AdminPaymentsPage(){const rows=useQuery(api.payments.listPendingTransfers,{});const verify=useMutation(api.payments.verifyTransfer);const [message,setMessage]=useState("");const act=async(id:any,decision:"approve"|"reject")=>{try{await verify({transferId:id,decision,note:decision==="approve"?"Verified by finance.":"Transfer proof could not be verified."});setMessage("Action saved.");}catch(error){setMessage(error instanceof Error?error.message:"Unable to save action.");}};return <AdminFrame title="Payment verification" section="Commerce"><div className="ops-intro"><div><h2>Manual transfer verification</h2><p>Review guest-submitted transfer proof before marking bookings paid.</p></div></div>{message&&<p className="success-text">{message}</p>}<section className="admin-card ops-table-card">{rows===undefined?<LoadingState label="Loading transfers…"/>:rows.length?rows.map((row:any)=><div className="ops-table-row" key={row.transfer._id}><span><strong>{row.booking?.reference}</strong><small>{row.booking?.guestEmail}</small></span><span>{row.transfer.reference}</span><span>Rp {row.transfer.amount.toLocaleString("en-US")}</span><span><button className="save-property" onClick={()=>act(row.transfer._id,"approve")}>Verify</button><button className="outline-button" onClick={()=>act(row.transfer._id,"reject")}>Reject</button></span></div>):<div className="admin-empty">No pending transfers.</div>}</section></AdminFrame>}
function AdminUnavailable({title}:{title:string}){return <AdminFrame title={title} section="Admin"><section className="admin-card"><h2>Not yet available</h2><p>This workspace is hidden until a server-backed data source and authorized actions are available.</p></section></AdminFrame>}

function AdminLogin() {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [show,setShow]=useState(false); const [error,setError]=useState(""); const [busy,setBusy]=useState(false); const {signIn}=useAuthActions();
  const submit=async(e:FormEvent)=>{e.preventDefault();setError("");if(!email.endsWith("@menetap.com")&&!email.endsWith("@upscale.asia")){setError("Use your @menetap.com or @upscale.asia work email.");return}if(!password){setError("Enter your password.");return}setBusy(true);try{await signIn("password",new FormData(e.currentTarget as HTMLFormElement));window.location.assign("/admin")}catch(err){setError(err instanceof Error?err.message:"Unable to authenticate.")}finally{setBusy(false)}};
  return <div className="admin-login-page"><div className="admin-login-wrap"><div className="admin-brand">menetap<span>.</span><small>internal</small></div><div className="admin-login-card"><div className="admin-login-title"><ShieldCheck size={17}/><h1>Team login</h1></div><p>For Menetap and UPSCALE staff only. Guest and partner accounts use a separate login.</p><form onSubmit={submit}><label>Work email<input name="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@menetap.com" required/></label><label>Password<div className="admin-password"><input name="password" type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/><button type="button" onClick={()=>setShow(!show)}>{show?"Hide":"Show"}</button></div></label><input name="flow" type="hidden" value="signIn"/>{error&&<div className="admin-error">{error}</div>}<button className="admin-submit" disabled={busy}>{busy?"Signing in…":"Log in to Admin Console"}</button></form></div><div className="admin-login-footer">Not staff? <a href="/en">Go to menetap.com</a> · <a href="/en/partner-login">Partner login</a></div></div></div>;
}

function PartnerAnnouncements() { const items=useQuery(api.partnerOperations.announcements, {})||[]; const read=useMutation(api.partnerOperations.markAnnouncementRead); const [active,setActive]=useState<any>(null); const selected=active||items[0]; return <div className="partner-announcements-page"><header className="partner-header"><div className="partner-wrap"><a href="/en/partner-dashboard" className="partner-back">← Partner dashboard</a></div></header><main className="partner-announcements-wrap"><p className="eyebrow">Partner updates</p><h1>Announcements</h1><div className="announcements-layout"><aside className="announcement-list">{items.map((item:any)=><button className={selected?._id===item._id?"announcement-item active":"announcement-item"} onClick={()=>{setActive(item);if(!item.read)read({announcementId:item._id})}} key={item._id}><b>{item.title}</b><small>{item.read?"Read":"Unread"}</small></button>)}</aside><article className="announcement-detail">{selected?<><h2>{selected.title}</h2><p>{selected.body}</p><small>{selected.publishedAt?new Date(selected.publishedAt).toLocaleDateString():"Draft"}</small></>:<p>No announcements yet.</p>}</article></div></main></div>; }
function PartnerSupport() { const tickets=useQuery(api.partnerOperations.tickets,{})||[]; const create=useMutation(api.partnerOperations.createTicket); const [subject,setSubject]=useState(""); const [description,setDescription]=useState(""); const property=useQuery(api.properties.listMine,{})?.[0]; const submit=async()=>{if(property&&subject&&description){await create({propertyId:property._id,subject,description,priority:"normal"});setSubject("");setDescription("");}}; return <div className="partner-support-page"><header className="partner-header"><div className="partner-wrap"><a href="/en/partner-dashboard" className="partner-back">← Partner dashboard</a></div></header><main className="partner-support-wrap"><p className="eyebrow">Partner support</p><h1>Support tickets</h1><section className="support-layout"><aside className="ticket-list">{tickets.map((ticket:any)=><article className="ticket-item" key={ticket._id}><b>{ticket.subject}</b><small>{ticket.priority} · {ticket.status}</small><small>SLA {ticket.slaDueAt?new Date(ticket.slaDueAt).toLocaleString():"—"}</small></article>)}{!tickets.length&&<p className="muted">No open support tickets.</p>}</aside><section className="ticket-detail"><h2>New support ticket</h2><input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Subject"/><textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe the issue"/><button className="save-property" onClick={submit}>Create ticket</button></section></section></main></div>; }
function PartnerPayouts() { const properties=useQuery(api.properties.listMine,{})||[]; const statements=useQuery(api.partnerOperations.payoutStatements,properties[0]?{propertyId:properties[0]._id}:"skip")||[]; return <div className="partner-payouts-page"><header className="partner-header"><div className="partner-wrap"><a href="/en/partner-dashboard" className="partner-back">← Partner dashboard</a></div></header><main className="partner-payouts-wrap"><p className="eyebrow">Account · Finance</p><h1>Payouts</h1><p>Gross, commission, adjustments, and payable totals from live statements.</p><section className="payout-history">{statements.map((statement:any)=><article key={statement._id}><b>{statement.periodStart} → {statement.periodEnd}</b><span>Gross Rp {statement.grossAmount.toLocaleString("en-US")}</span><span>Commission Rp {statement.commissionAmount.toLocaleString("en-US")}</span><strong>Payable Rp {statement.payableAmount.toLocaleString("en-US")}</strong><small>{statement.status}</small></article>)}{!statements.length&&<p className="muted">No payout statements available.</p>}</section></main></div>; }

function PartnerDashboard() { const [propertyId,setPropertyId]=useState<any>(undefined); const [from,setFrom]=useState("2026-09-01"); const [to,setTo]=useState("2026-10-01"); const properties=useQuery(api.properties.listMine, {}); const overview=useQuery(api.partnerDashboard.overview,{from,to,propertyId}); return <div className="partner-dashboard"><header className="partner-header"><div className="partner-wrap"><a className="partner-brand" href="/en/partners"><span>menetap<span>.</span></span><small>for partners</small></a><button className="partner-avatar">KH</button></div></header><main className="partner-wrap partner-dash-main"><div className="partner-dash-heading"><div><div className="property-switch"><select value={propertyId||"all"} onChange={e=>setPropertyId(e.target.value==="all"?undefined:e.target.value)}><option value="all">All properties</option>{properties?.map((p:any)=><option key={p._id} value={p._id}>{p.name}</option>)}</select><ChevronDown size={17}/></div><p><span className="live-dot"/> Data refreshed {overview?new Date(overview.freshness).toLocaleTimeString():"loading…"}</p></div><div className="dash-date"><input type="date" value={from} onChange={e=>setFrom(e.target.value)}/> → <input type="date" value={to} onChange={e=>setTo(e.target.value)}/></div></div><div className="partner-dash-grid"><aside className="partner-dash-sidebar"><b>Overview</b><button className="partner-dash-nav" onClick={()=>window.location.assign("/en/partner-bookings")}>Bookings</button><button className="partner-dash-nav" onClick={()=>window.location.assign("/en/partner-inventory")}>Inventory & rates</button><button className="partner-dash-nav" onClick={()=>window.location.assign("/en/partner-payouts")}>Payouts</button><button className="partner-dash-nav" onClick={()=>window.location.assign("/en/partner-properties")}>Property settings</button></aside><section className="partner-dash-content">{!overview?<div className="dash-placeholder"><h1>Loading dashboard…</h1><p>Fetching live partner metrics.</p></div>:<><div className="dash-stats"><DashStat label="Booking count" value={String(overview.bookingCount)} change={`${overview.arrivals} arrivals · ${overview.departures} departures`}/><DashStat label="Room nights" value={String(overview.roomNights)} change="Confirmed and active stays"/><DashStat label="Gross booking value" value={`Rp ${overview.grossBookingValue.toLocaleString("en-US")}`} change="Before commission"/><DashStat label="Cancellations" value={String(overview.cancellationCount)} change={overview.dataComplete?`${overview.occupancy}% occupancy`:"Occupancy incomplete"}/></div><section className="dash-card"><h2>Revenue overview</h2><p>Gross booking value is the total guest booking amount before commission. Net payout is calculated in Finance after commission, refunds, and adjustments.</p>{!overview.dataComplete&&<p className="muted">Occupancy is incomplete until every property has a valid availability window.</p>}</section></>}</section></div></main></div>; }
function DashStat({label,value,change}:{label:string;value:string;change:string}){return <div className="dash-stat"><span>{label}</span><strong>{value}</strong><small>{change}</small></div>}

function PartnerOnboarding() {
  const [step, setStep] = useState(1); const [approved, setApproved] = useState(false); const [agreed, setAgreed] = useState(false); const [pin, setPin] = useState(false); const [photos, setPhotos] = useState(0); const [rooms, setRooms] = useState(1); const [feature, setFeature] = useState(false);
  const onboarding = useQuery(api.partnerOnboarding.current); const saveDraft = useMutation(api.partnerOnboarding.saveDraft); const completeOnboarding = useMutation(api.partnerOnboarding.complete); const [saveError, setSaveError] = useState("");
  const [form, setForm] = useState({ first: "", last: "", email: "", phone: "", property: "", address: "", description: "", rules: "", checkin: "2:00 PM", checkout: "12:00 PM" }); const update = (key: keyof typeof form, value: string) => setForm({...form, [key]: value});
  useEffect(() => { if (onboarding?.propertyDraft) { const draft = onboarding.propertyDraft as any; setForm(current => ({...current, property: draft.propertyName || current.property, address: draft.address || current.address, description: draft.description || current.description, city: draft.city || ""} as any)); setStep(onboarding.currentStep || 1); setApproved(onboarding.status === "completed"); } }, [onboarding]);
  const advance = async () => { setSaveError(""); try { const next = Math.min(5, step + 1); await saveDraft({ currentStep: next, completedSteps: Array.from({length: step}, (_, i) => i + 1), propertyDraft: { propertyName: form.property, address: form.address, city: (form as any).city || form.address.split(",").pop()?.trim() || "Yogyakarta", description: form.description } }); if (step === 4) { await completeOnboarding(); setApproved(true); } setStep(next); } catch (err) { setSaveError(err instanceof Error ? err.message : "Unable to save onboarding progress."); } };
  const labels = ["Your details", "Property details", "Rooms & rates", "Commission", "Live"]; const amenities = ["Free WiFi", "Pool", "Parking", "Air conditioning", "Kitchen", "Breakfast"];
  return <div className="partner-onboarding"><header className="partner-header"><div className="partner-onboard-wrap"><a className="partner-brand" href="/en/partners"><span>menetap<span>.</span></span><small>for partners</small></a><div className="onboard-actions"><span>EN</span><button onClick={advance}>Save draft</button></div></div></header><div className="partner-onboard-wrap onboard-progress"><div>{[1,2,3,4,5].map(n => <i className={n <= step ? "done" : ""} key={n}/>)}</div><small>Step {step} of 5 · {labels[step - 1]}</small></div><main className="partner-onboard-wrap onboard-main">{step === 1 && <OnboardSection title="Tell us about you" text="One account — add more properties any time from your dashboard."><div className="onboard-form-grid"><OnboardInput label="First name" value={form.first} onChange={v => update("first",v)}/><OnboardInput label="Last name" value={form.last} onChange={v => update("last",v)}/></div><OnboardInput label="Email" value={form.email} onChange={v => update("email",v)}/><OnboardInput label="Phone" value={form.phone} onChange={v => update("phone",v)} placeholder="+62 812 3456 7890"/></OnboardSection>}{step === 2 && <OnboardSection title="About your property" text="This is what guests will see first."><OnboardInput label="Property name" value={form.property} onChange={v => update("property",v)} placeholder="e.g. Kaliurang Heritage Villa"/><OnboardInput label="Address" value={form.address} onChange={v => update("address",v)} placeholder="Street, city, Java"/><label className="onboard-label">Map location (pin)<button className="map-placeholder" onClick={() => setPin(true)}><MapPin size={18}/>{pin ? "Pin set on map" : "Tap to drop a pin"}</button></label><div className="onboard-form-grid"><OnboardInput label="Check-in from" value={form.checkin} onChange={v => update("checkin",v)}/><OnboardInput label="Check-out before" value={form.checkout} onChange={v => update("checkout",v)}/></div><OnboardTextarea label="Guest rules" value={form.rules} onChange={v => update("rules",v)} placeholder="e.g. No smoking, no pets, quiet hours after 10pm"/><OnboardTextarea label="Description" value={form.description} onChange={v => update("description",v)} placeholder="What makes your property worth booking?"/><label className="onboard-label">Amenities<div className="amenity-picker">{amenities.map(a => <button key={a}>{a}</button>)}</div></label><label className="onboard-label">Photos<div className="photo-picker"><button onClick={() => setPhotos(Math.min(4, photos + 1))}><Upload size={16}/>Upload</button>{Array.from({length: photos}).map((_,i) => <span key={i}>Photo {i+1}</span>)}</div><small>+ Add sample photo</small></label></OnboardSection>}{step === 3 && <OnboardSection title="Rooms & rates" text="You set the price — we'll show it exactly as entered, no markup."><div className="onboard-room-list">{Array.from({length: rooms}).map((_,i) => <div className="onboard-room" key={i}><div className="room-title">Room type {i+1}{rooms > 1 && <button onClick={() => setRooms(rooms-1)}>Remove</button>}</div><div className="onboard-form-grid"><input placeholder="Room name"/><input placeholder="Max guests"/></div><div className="rate-input"><span>Rp</span><input placeholder="Rate per night"/></div></div>)}<button className="add-room" onClick={() => setRooms(rooms+1)}>＋ Add another room type</button></div></OnboardSection>}{step === 4 && <OnboardSection title="Your commission" text="One flat rate. Shown upfront, not buried later."><div className="commission-card"><div><b>Base commission</b><strong>10%</strong></div><hr/><p><span>Example booking</span><span>Rp 1,000,000</span></p><p><span>Menetap commission (10%)</span><span className="red">– Rp 100,000</span></p><hr/><p className="receive"><b>You receive</b><b>Rp 900,000</b></p><small>No listing fees, no payment processing fees on top. Paid out within 3 business days of check-in.</small></div><div className="feature-card"><div><b>✦ Get featured as “Featured Stay”</b><p>Priority placement on search and homepage. Optional — an extra 2% commission only on bookings this earns you.</p></div><button className={feature ? "toggle on" : "toggle"} onClick={() => setFeature(!feature)}><i/></button></div><label className="agree"><input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}/> I agree to Menetap’s <a href="/en/terms">Partner Terms</a> and the commission structure shown above.</label></OnboardSection>}{step === 5 && <div className="onboard-result"><div className={approved ? "result-icon approved" : "result-icon"}>{approved ? "✓" : "◷"}</div><h1>{approved ? "You're live on Menetap!" : "Submitted for review"}</h1><p>{form.property || "Your property"} {approved ? "is now visible to guests searching Java. Commission locked at 10% — no surprises later." : "is being reviewed by our Trust & Safety team — this usually takes under 24 hours. We'll email you once it's approved and live."}</p>{approved ? <div><a className="partner-button" href="/en/partner-dashboard">Go to dashboard</a><button className="outline-button" onClick={() => setStep(1)}>Add another property</button></div> : <button className="outline-button" onClick={() => setApproved(true)}>Simulate approval (demo)</button>}</div>}</main>{saveError&&<p className="error-text">{saveError}</p>}{step < 5 && <footer className="onboard-footer"><div className="partner-onboard-wrap"><button className="back-step" disabled={step === 1} onClick={() => setStep(step-1)}>Back</button><button className="partner-button" disabled={step === 4 && !agreed} onClick={advance}>{step === 4 ? "Confirm and go live" : "Continue"}</button></div></footer>}</div>;
}

function OnboardSection({title,text,children}:{title:string;text:string;children:ReactNode}){return <section className="onboard-section"><h1>{title}</h1><p>{text}</p><div className="onboard-card">{children}</div></section>}
function OnboardInput({label,value,onChange,placeholder}:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string}){return <label className="onboard-label">{label}<input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></label>}
function OnboardTextarea({label,value,onChange,placeholder}:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string}){return <label className="onboard-label">{label}<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></label>}

function PartnerLanding() {
  const values = [
    ["receipt", "One commission, shown upfront", "See your exact take-home rate before you agree to anything — no tiers that change later without notice."],
    ["trending-up", "Get featured, on your terms", "Opt into Featured Stay placement for extra visibility — entirely optional, priced clearly, cancel anytime."],
    ["clock", "Live in minutes", "Self-serve setup — add your property, rooms and rates, and start taking bookings the same day."],
  ];
  const steps = [["01", "Tell us about your property", "Business details and location"], ["02", "Add photos & amenities", "What makes your place worth booking"], ["03", "Set your rooms & rates", "You control pricing, always"], ["04", "Confirm and go live", "Review commission, then publish instantly"]];
  return <div className="partner-landing"><header className="partner-header"><div className="partner-wrap"><a className="partner-brand" href="/en"><span>menetap<span>.</span></span><small>for partners</small></a><div><a className="partner-login" href="/en">Log in</a><a className="partner-button" href="/en/partner-onboarding">List your property</a></div></div></header><main><section className="partner-hero partner-wrap"><div className="partner-pill"><Zap size={14}/>Powered by UPSCALE's revenue engine</div><h1>List on Menetap. Know exactly what you’ll earn.</h1><p>One flat commission, shown upfront before you list. No hidden fees, no surprise deductions at payout.</p><a className="partner-button partner-hero-button" href="/en/partner-onboarding">Start listing — it’s free</a><small>Go live instantly · No setup fees</small></section><section className="partner-stats partner-wrap">{[["10%","Flat base commission"],["340+","Properties across Indonesia"],["2 min","Average setup time"],["Instant","Go live, no waiting"]].map(([a,b]) => <div key={a}><strong>{a}</strong><span>{b}</span></div>)}</section><section className="partner-section partner-wrap"><h2>Built for hosts who want clarity, not surprises</h2><div className="partner-value-grid">{values.map(([icon,title,text]) => <article key={title}><div className="partner-icon"><Sparkles size={20}/></div><h3>{title}</h3><p>{text}</p></article>)}</div></section><section className="partner-section partner-wrap partner-steps"><h2>Four steps to your first booking</h2><div className="partner-step-grid">{steps.map(([n,title,text]) => <div key={n}><strong>{n}</strong><h3>{title}</h3><p>{text}</p></div>)}</div></section><section className="partner-wrap partner-cta"><div><h2>Ready to list your property?</h2><p>Independent hosts and management companies both welcome.</p><a href="/en/partner-onboarding">Start listing</a></div></section></main><footer className="partner-footer"><div className="partner-wrap"><span>© 2026 Menetap. All rights reserved.</span><span>Services · Supply store · Managed by <b>UPSCALE</b></span></div></footer></div>;
}

const accountNav = (label: string, path: string, active = false) => (
  <a className={active ? "account-nav-link active" : "account-nav-link"} href={path}>{label}</a>
);

const experienceData=[{id:"sunrise-borobudur",name:"Sunrise at Borobudur",location:"Magelang · Central Java",category:"Culture",price:"From Rp 650,000 / person",rating:"4.9",duration:"4 hours",intro:"Watch the first light move across one of Java’s most extraordinary landscapes with a local guide.",image:"sunrise"},{id:"merapi-village",name:"Merapi village & kitchen",location:"Sleman · Yogyakarta",category:"Food & culture",price:"From Rp 420,000 / person",rating:"4.8",duration:"5 hours",intro:"Meet a village host, walk the foothills, and cook a generous Javanese lunch together.",image:"merapi"},{id:"batik-workshop",name:"Batik with a local maker",location:"Yogyakarta · Prawirotaman",category:"Creative",price:"From Rp 280,000 / person",rating:"4.9",duration:"3 hours",intro:"Learn the quiet rhythm of hand-drawn batik in a small family workshop.",image:"batik"},{id:"bantul-river",name:"Bantul river morning",location:"Bantul · Yogyakarta",category:"Nature",price:"From Rp 360,000 / person",rating:"4.7",duration:"4 hours",intro:"A slow morning by the river with cycling paths, local breakfast, and open countryside.",image:"river"}];
const supplyProducts=[{id:"towels",name:"Premium bath towels",unit:"Pack of 6",price:480000,category:"Linen",color:"linen"},{id:"sheets",name:"Hotel bed sheet set",unit:"Queen · set of 2",price:620000,category:"Linen",color:"sheets"},{id:"cleaner",name:"Multi-surface cleaner, 5L",unit:"Carton of 4",price:220000,category:"Housekeeping",color:"cleaner"},{id:"disinfectant",name:"Toilet disinfectant, 1L",unit:"Carton of 12",price:280000,category:"Housekeeping",color:"disinfectant"},{id:"amenity",name:"Guest amenity kit",unit:"Box of 50",price:350000,category:"Guest amenities",color:"amenity"},{id:"slippers",name:"Hotel slippers",unit:"Pack of 20 pairs",price:190000,category:"Guest amenities",color:"slippers"}];
function supplyCart(): Record<string, number>{try{const parsed: unknown=JSON.parse(localStorage.getItem("menetapSupplyCart")||"{}");if(!parsed||typeof parsed!=="object")return {};return Object.fromEntries(Object.entries(parsed).filter((entry):entry is [string, number]=>typeof entry[1]==="number"));}catch{return {}}}
function SupplyHeader({count}:{count?:number}){return <header className="supply-header"><a href="/en/supply" className="supply-brand">menetap<span>.</span><small><Package size={11}/> supply</small></a><nav className="supply-nav"><a href="/en/partner-dashboard">Partner dashboard</a><a href="/en/supply/catalog">Browse catalog</a></nav><a href="/en/partner-login" className="supply-login">Log in</a>{count !== undefined && <a href="/en/supply/catalog" className="supply-cart"><ShoppingCart size={16}/> {count} items</a>}</header>}
function SupplyLanding(){const categories=[["Bathroom amenities","Shampoo, soap, and guest-ready basics","amenity","Guest amenities"],["Linens & towels","Sheets, towels, and reliable room essentials","sheets","Linen"],["Cleaning supplies","Reliable supplies for every turnover","cleaner","Housekeeping"],["Slippers & robes","Comfort details guests remember","slippers","Guest amenities"],["Stationery & collateral","Menus, cards, and in-room information","stationery","Guest amenities"]];return <div className="supply-page"><SupplyHeader/><main><section className="supply-hero"><span className="supply-pill"><Package size={14}/> Menetap-fulfilled — one supplier, one invoice</span><h1>Restock your property without chasing five vendors.</h1><p>Bathroom amenities, linens, cleaning supplies, and guest collateral — ordered from your partner dashboard, delivered to your property.</p><a className="supply-primary" href="/en/supply/catalog">Browse catalog</a></section><section className="supply-stats">{[["120+","Products in catalog"],["2–4 days","Delivery across Indonesia"],["1","Consolidated invoice"]].map(x=><div key={x[0]}><strong>{x[0]}</strong><span>{x[1]}</span></div>)}</section><section className="supply-section"><h2>Shop by category</h2><div className="supply-category-grid">{categories.map(([name,description,color,category])=><a href={`/en/supply/catalog?category=${encodeURIComponent(category)}`} key={name}><div className={`supply-category-image ${color}`} aria-label={`${name} category`} /><b>{name}</b><p>{description}</p><span>Browse →</span></a>)}</div></section><section className="supply-benefits"><div><Truck size={16}/>Delivered direct to your property</div><div><Receipt size={16}/>Billed with your monthly Menetap statement</div><div><RefreshCcw size={16}/>Reorder in one click from order history</div></section></main><footer className="supply-footer"><span>© 2026 Menetap. All rights reserved.</span><span>Managed by <a href="https://upscale.asia" target="_blank" rel="noreferrer">UPSCALE</a></span></footer></div>}
function SupplyCatalog(){const [cart,setCart]=useState<Record<string,number>>(supplyCart());const [category,setCategory]=useState(new URLSearchParams(window.location.search).get("category")||"All");const add=(id:string)=>{const next={...cart,[id]:(cart[id]||0)+1};setCart(next);localStorage.setItem("menetapSupplyCart",JSON.stringify(next))};const dec=(id:string)=>{const next={...cart,[id]:Math.max(0,(cart[id]||0)-1)};setCart(next);localStorage.setItem("menetapSupplyCart",JSON.stringify(next))};const list=supplyProducts.filter(p=>category==="All"||p.category===category);const count=Object.values(cart).reduce((a,b)=>a+b,0);const total=supplyProducts.reduce((a,p)=>a+p.price*(cart[p.id]||0),0);return <div className="supply-page"><SupplyHeader count={count}/><main className="supply-catalog-wrap"><p className="eyebrow">Supply catalog</p><h1>Everything your property needs.</h1><div className="supply-catalog-layout"><aside className="supply-categories">{["All","Linen","Housekeeping","Guest amenities"].map(x=><button className={category===x?"active":""} onClick={()=>setCategory(x)} key={x}>{x}</button>)}</aside><section><p className="catalog-count">{list.length} products in {category}</p><div className="supply-products">{list.map(p=><article className="supply-product" key={p.id}><div className={`supply-product-image ${p.color}`}/><h2>{p.name}</h2><p>{p.unit}</p><strong>Rp {p.price.toLocaleString("en-US")}</strong><div className="quantity-control"><button onClick={()=>dec(p.id)}>−</button><span>{cart[p.id]||0}</span><button onClick={()=>add(p.id)}>＋</button></div></article>)}</div></section><aside className="supply-cart-panel"><h2>Your cart</h2>{Object.entries(cart).filter(([,q])=>q>0).map(([id,q])=>{const p=supplyProducts.find(x=>x.id===id)!;return <div className="supply-cart-line" key={id}><span>{p.name} ×{q}</span><b>Rp {(p.price*q).toLocaleString("en-US")}</b></div>})}<div className="supply-cart-total"><span>Subtotal</span><b>Rp {total.toLocaleString("en-US")}</b></div>{count?<a className="supply-primary" href="/en/supply/checkout">Checkout</a>:<p>Your cart is empty — add items from the catalog.</p>}</aside></div></main></div>}
function SupplyCheckout(){const cart=supplyCart();const lines=Object.entries(cart).filter(([,q])=>q>0).map(([id,q])=>({p:supplyProducts.find(x=>x.id===id)!,q}));const subtotal=lines.reduce((a,x)=>a+x.p.price*x.q,0);const [done,setDone]=useState(false);if(done){localStorage.setItem("menetapSupplyOrderTotal",String(subtotal));window.location.assign("/en/supply/confirmation");return null}return <div className="supply-page"><SupplyHeader count={lines.reduce((a,x)=>a+x.q,0)}/><main className="supply-checkout-wrap"><a className="back-button" href="/en/supply/catalog">← Back to catalog</a><p className="eyebrow">Secure checkout</p><h1>Delivery details</h1><div className="supply-checkout-grid"><section><div className="supply-form-card"><h2>Deliver to</h2><label>Property name<input defaultValue="Kaliurang Heritage Villa"/></label><label>Delivery address<textarea defaultValue="Jl. Kaliurang Km 18, Sleman, Yogyakarta"/></label><div className="form-row"><label>Contact name<input defaultValue="Anin Wida"/></label><label>Phone<input defaultValue="+62 812 3456 7890"/></label></div></div><div className="supply-form-card"><h2>Billing</h2><label>Invoice email<input defaultValue="hello@kaliurangvilla.com"/></label><label>Notes<textarea placeholder="Delivery instructions or PO number"/></label></div></section><aside className="supply-order-summary"><h2>Your order</h2>{lines.map(x=><div className="supply-cart-line" key={x.p.id}><span>{x.p.name} ×{x.q}</span><b>Rp {(x.p.price*x.q).toLocaleString("en-US")}</b></div>)}<div className="supply-cart-total"><span>Subtotal</span><b>Rp {subtotal.toLocaleString("en-US")}</b></div><small>Delivery fee will be confirmed based on location before dispatch.</small><button className="supply-primary" onClick={()=>setDone(true)}>Place order</button></aside></div></main></div>}
function SupplyConfirmation(){const total=Number(localStorage.getItem("menetapSupplyOrderTotal")||0);return <div className="supply-page"><SupplyHeader/><main className="supply-confirmation"><div className="supply-success-icon">✓</div><p className="eyebrow">Supply order</p><h1>Order placed</h1><p>Your order for Kaliurang Heritage Villa has been received. We’ll confirm delivery timing with you shortly.</p><div className="supply-order-reference">Order SUP-20260926 · Rp {total.toLocaleString("en-US")}</div><a className="supply-primary" href="/en/supply/catalog">Order more</a><a href="/en/partner-dashboard">Back to partner dashboard</a></main></div>}

function Experiences(){const [category,setCategory]=useState("All");const filtered=experienceData.filter(x=>category==="All"||x.category===category);return <main className="experiences-page"><div className="experiences-wrap"><p className="eyebrow">Menetap experiences</p><h1>Make your stay mean more.</h1><p className="experiences-lead">Small-group experiences hosted by people who know their place deeply.</p><div className="experience-filters">{["All","Culture","Food & culture","Creative","Nature"].map(x=><button className={category===x?"active":""} onClick={()=>setCategory(x)} key={x}>{x}</button>)}</div><div className="experience-grid">{filtered.map(x=><button className="experience-card" onClick={()=>window.location.assign(`/en/experiences/detail?id=${x.id}`)} key={x.id}><div className={`experience-image ${x.image}`}><span>{x.category}</span></div><div className="experience-card-body"><div className="experience-card-heading"><div><h2>{x.name}</h2><p>{x.location}</p></div><strong>★ {x.rating}</strong></div><p className="experience-description">{x.intro}</p><div className="experience-card-meta"><span>{x.duration}</span><b>{x.price}</b></div></div></button>)}</div></div></main>}
function ExperienceDetail(){const params=new URLSearchParams(window.location.search);const item=experienceData.find(x=>x.id===params.get("id"))||experienceData[0];const [sent,setSent]=useState(false);return <main className="experience-detail-page"><div className="experience-detail-wrap"><a className="back-button" href="/en/experiences">← All experiences</a><div className={`experience-detail-image ${item.image}`}><span>{item.category}</span></div><div className="experience-detail-grid"><section><p className="eyebrow">{item.location}</p><h1>{item.name}</h1><div className="experience-detail-rating">★ {item.rating} · Hosted locally · {item.duration}</div><p className="experience-detail-intro">{item.intro}</p><h2>What you’ll do</h2><p>Meet your host, take the experience at an unhurried pace, and leave with a better understanding of this place. Group sizes stay small so there is room for questions and conversation.</p><h2>Good to know</h2><ul><li>Small group experience</li><li>English and Bahasa Indonesia available</li><li>Confirmation within 24 hours</li><li>Free cancellation up to 24 hours before</li></ul></section><aside className="experience-book-card"><span className="eyebrow">Reserve your place</span><strong>{item.price}</strong><label>Date<input type="date" defaultValue="2026-10-03"/></label><label>Guests<select defaultValue="2"><option>1 guest</option><option>2 guests</option><option>3 guests</option><option>4 guests</option></select></label>{sent?<p className="success-text">Request sent. The host will confirm availability shortly.</p>:<button onClick={()=>setSent(true)}>Check availability</button>}<small>You won’t be charged yet. We’ll confirm availability before payment.</small></aside></div></div></main>}

function PaymentMethods(){const [cards,setCards]=useState([{brand:"VISA",last4:"4242",expiry:"08/28",default:true}]);const [add,setAdd]=useState(false);return <AccountFrame active="payment" title="Payment methods" intro="Save a card to book faster next time."><div className="guest-account-card">{cards.map(c=><div className="payment-card" key={c.last4}><div className="card-brand">{c.brand}</div><div><b>•••• •••• •••• {c.last4}</b><small>Expires {c.expiry}</small></div><span>{c.default?"Default":""}</span><button>Remove</button></div>)}{add?<div className="add-payment"><h3>Add a new card</h3><label>Card number<input placeholder="1234 5678 9012 3456"/></label><div className="form-row"><label>Expiry<input placeholder="MM/YY"/></label><label>CVV<input placeholder="•••"/></label></div><div><button className="secondary" onClick={()=>setAdd(false)}>Cancel</button><button onClick={()=>{setCards([...cards,{brand:"VISA",last4:"8899",expiry:"09/29",default:false}]);setAdd(false)}}>Save card</button></div></div>:<button className="add-payment-button" onClick={()=>setAdd(true)}>＋ Add payment method</button>}</div><div className="guest-account-card"><h3>Payment history</h3><DetailRow label="28-Aug-2026 · Tugu Riverside Homestay" value="Rp 540,000 · Under review"/><DetailRow label="04-Jul-2026 · Malioboro Skyline Suites" value="Rp 2,200,000 · Paid"/></div></AccountFrame>}
function GuestSettings(){const [saved,setSaved]=useState(false);return <AccountFrame active="settings" title="Settings" intro="Manage your profile, language, notifications, and security."><div className="guest-settings-grid"><section className="guest-account-card"><h3>Profile</h3><div className="form-row"><label>First name<input defaultValue="Anin"/></label><label>Last name<input defaultValue="Wida"/></label></div><label>Email<input defaultValue="anin@example.com" type="email"/></label><label>Phone<input defaultValue="+62 812 3456 7890"/></label><button onClick={()=>setSaved(true)}>{saved?"Changes saved":"Save profile"}</button></section><section className="guest-account-card"><h3>Language</h3><div className="language-toggle"><button className="active">English</button><button>Bahasa Indonesia</button></div><h3>Notifications</h3><label className="check-row"><input type="checkbox" defaultChecked/> Booking updates</label><label className="check-row"><input type="checkbox" defaultChecked/> Price drop alerts</label><label className="check-row"><input type="checkbox"/> Menetap news and offers</label></section><section className="guest-account-card"><h3>Security</h3><label>Current password<input type="password" placeholder="••••••••"/></label><label>New password<input type="password" placeholder="At least 8 characters"/></label><button>Update password</button></section></div><section className="guest-account-card danger-card"><h3>Delete account</h3><p>This permanently removes your profile, saved stays, and rewards balance. Upcoming bookings must be cancelled first.</p><button className="danger-button">Delete account</button></section></AccountFrame>}
function BookingIssue(){return <main className="guest-simple-page"><div className="guest-simple-card"><div className="issue-icon">!</div><p className="eyebrow">Booking issue</p><h1>We couldn’t complete your booking</h1><p>Something went wrong while confirming this stay. Your card was not charged.</p><div className="reference-pill">Reference MTP-7X9K2Q</div><div className="issue-actions"><a href="/en/stays">Try searching again</a><a href="/en/help">Contact support</a></div><small>If you see a pending charge, it should disappear automatically within 3–5 business days.</small></div></main>}
function DuringStay(){const [issue,setIssue]=useState("");const [sent,setSent]=useState(false);return <main className="during-stay-page"><div className="during-stay-wrap"><a className="back-button" href="/en/my-trips">← Back to my trips</a><p className="eyebrow">During your stay</p><h1>Kaliurang Heritage Villa</h1><p className="muted">12-Oct-2026 → 15-Oct-2026 · 2 guests · MTP-7X9K2Q</p><div className="during-contact-grid"><a href="tel:+622741234567"><Phone size={18}/><b>Call the property</b><small>+62 274 123 4567</small></a><button onClick={()=>setIssue("chat")}><MessageCircle size={18}/><b>Message host</b><small>Usually replies within an hour</small></button></div><section className="guest-account-card"><h2>Report an issue or request assistance</h2>{!sent?<><div className="issue-options">{["Room cleanliness issue","Something is broken","Need help with check-in","Other request"].map(x=><button className={issue===x?"selected":""} onClick={()=>setIssue(x)} key={x}>{x}<span>→</span></button>)}</div>{issue&&<><textarea className="stay-request" placeholder="Describe what you need — the property’s team will follow up."/><button onClick={()=>setSent(true)}>Send request</button></>}</>:<p className="success-text">Sent to the property — they’ll follow up shortly.</p>}</section><section className="guest-account-card"><h2>Extend your stay or add services</h2><a href="/en/stays">Extend checkout date <span>→</span></a><a href="/en/partner-services">Request late checkout or extra amenities <span>→</span></a></section></div></main>}

function AccountFrame({ active, children, title, intro }: { active: string; children: ReactNode; title: string; intro: string }) {
  return <main className="account-page page"><div className="account-layout"><aside className="account-sidebar"><p className="eyebrow">Your account</p><h1>Account</h1><nav>{accountNav("My trips", "/en/my-trips", active === "trips")}{accountNav("Saved stays", "/en/saved-stays", active === "saved")}{accountNav("Rewards", "/en/rewards/dashboard", active === "rewards")}{accountNav("Guest details", "/en/guest-details", active === "guest")}{accountNav("Payment methods", "#")}{accountNav("Settings", "#")}</nav></aside><section className="account-main"><p className="eyebrow">Account</p><h2>{title}</h2><p className="account-intro">{intro}</p>{children}</section></div></main>;
}

function MyTrips() {
  const [tab, setTab] = useState("upcoming"); const [query, setQuery] = useState("");
  const liveBookings = useQuery(api.bookings.listMine, {});
  if (liveBookings === undefined) return <AccountFrame active="trips" title="My trips" intro="Keep track of upcoming stays, past visits, and anything that needs your attention."><LoadingState label="Loading your trips…" /></AccountFrame>;
  const trips = tab === "past" ? [{ name: "Malioboro Skyline Suites", place: "Danurejan, Yogyakarta", dates: "04-Jul-2026 → 06-Jul-2026", meta: "1 room · 2 adults", ref: "MTP-2R6V9C", price: "Rp 2,200,000 paid", status: "Completed" }] : tab === "cancelled" ? [] : [{ name: "Kaliurang Heritage Villa", place: "Sleman, Yogyakarta", dates: "12-Oct-2026 → 15-Oct-2026", meta: "2 rooms · 2 adults", ref: "MTP-7X9K2Q", price: "Rp 6,960,000 paid", status: "Confirmed" }, { name: "Prawirotaman Boutique", place: "Mergangsan, Yogyakarta", dates: "03-Nov-2026 → 05-Nov-2026", meta: "1 room · 2 adults", ref: "MTP-4H1L8B", price: "Rp 1,240,000 due", status: "Pending payment" }];
  const liveTrips = liveBookings?.map((booking: any) => ({ name: booking.propertyName, place: "Indonesia", dates: `${booking.checkIn} → ${booking.checkOut}`, meta: `${booking.guestCount} guests`, ref: booking.reference, price: `Rp ${booking.totalAmount.toLocaleString("en-US")} ${booking.paymentStatus === "paid" ? "paid" : "due"}`, status: booking.status === "completed" ? "Completed" : booking.status === "cancelled" ? "Cancelled" : booking.status === "pending" ? "Pending payment" : "Confirmed" })) ?? [];
  const sourceTrips = liveBookings?.length ? liveTrips : trips;
  const visible = sourceTrips.filter(t => (tab === "past" ? t.status === "Completed" : tab === "cancelled" ? t.status === "Cancelled" : t.status !== "Completed" && t.status !== "Cancelled") && t.name.toLowerCase().includes(query.toLowerCase()));
  return <AccountFrame active="trips" title="My trips" intro="Keep track of upcoming stays, past visits, and anything that needs your attention."><div className="account-alert"><strong>One trip needs your attention</strong><span>Complete payment for Prawirotaman Boutique before 26-Oct-2026.</span></div><div className="account-toolbar"><label className="account-search"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search trips by hotel name"/></label></div><div className="account-tabs">{[["upcoming","Upcoming (2)"],["past","Past (1)"],["cancelled","Cancelled (0)"]].map(([key,label]) => <button className={tab === key ? "active" : ""} onClick={() => setTab(key)} key={key}>{label}</button>)}</div><div className="trip-list">{visible.length ? visible.map((trip, i) => <article className="trip-card" key={trip.ref}><div className="trip-card-top"><div><h3>{trip.name}</h3><p>{trip.place}</p></div><span className={trip.status === "Pending payment" ? "status pending" : "status"}>{trip.status}</span></div><div className="trip-details"><span><CalendarDays size={15}/>{trip.dates}</span><span><Users size={15}/>{trip.meta}</span><span><span className="mono">{trip.ref}</span> · {trip.price}</span></div><div className="trip-actions">{tab === "past" ? <><button>Book again</button><button className="secondary">Leave review</button><button className="text-action">Download invoice</button></> : trip.status === "Pending payment" ? <button>Complete payment</button> : <><button>View details</button><button className="secondary">During stay</button><button className="text-action">Cancel</button></>}</div></article>) : <div className="account-empty"><h3>No {tab} trips</h3><p>{tab === "cancelled" ? "You do not have any cancelled trips." : "Your trips will appear here."}</p><a href="/en/stays">Explore stays</a></div>}</div></AccountFrame>;
}

function SavedStays() {
  const [items, setItems] = useState([{ name: "Kaliurang Heritage Villa", place: "Sleman, Yogyakarta", rating: "4.8", price: "Rp 890,000/night", perk: "Free cancellation", alert: true }, { name: "Prawirotaman Boutique", place: "Mergangsan, Yogyakarta", rating: "4.6", price: "Rp 620,000/night", perk: "Free cancellation", alert: false }, { name: "Riverside Jogja Retreat", place: "Bantul, Yogyakarta", rating: "4.7", price: "Rp 740,000/night", perk: "Breakfast available", alert: false }]);
  const [query, setQuery] = useState("");
  const visible = items.filter(x => x.name.toLowerCase().includes(query.toLowerCase()));
  return <AccountFrame active="saved" title="Saved stays" intro="Save places you love and keep an eye on price changes before you book."><label className="account-search saved-search"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search saved stays"/></label><div className="saved-grid">{visible.map((stay, i) => <article className="saved-card" key={stay.name}><div className="saved-image"><span className="saved-placeholder">{i === 0 ? "Kaliurang" : i === 1 ? "Prawirotaman" : "Riverside"}</span><button aria-label="Remove saved stay" onClick={() => setItems(items.filter(x => x.name !== stay.name))}>♥</button></div><div className="saved-body"><div className="saved-heading"><div><h3>{stay.name}</h3><p>{stay.place}</p></div><span><Star size={14} fill="currentColor"/> {stay.rating}</span></div><div className="saved-meta"><strong>{stay.price}</strong><span>{stay.perk}</span></div><div className="saved-footer"><label><input type="checkbox" checked={stay.alert} onChange={() => setItems(items.map(x => x.name === stay.name ? {...x, alert: !x.alert} : x))}/> Notify on price drop</label><a href="/en/stays">View stay →</a></div></div></article>)}</div>{!visible.length && <div className="account-empty"><h3>No favorites yet</h3><p>Tap the heart icon on any stay to add it here.</p><a href="/en/stays">Explore stays</a></div>}</AccountFrame>;
}

function GuestDetails() {
  const [mode, setMode] = useState<string | null>(null); const [submitted, setSubmitted] = useState(false); const [error, setError] = useState("");
  const [form, setForm] = useState({ first: "", last: "", email: "", phone: "", arrival: "18:00–19:00", requests: "" }); const update = (key: keyof typeof form, value: string) => setForm({...form, [key]: value});
  const submit = () => { if (!form.first || !form.last || !form.email || !form.phone) { setError("Please complete the required guest details."); return; } setError(""); setSubmitted(true); };
  return <main className="guest-details-page page"><div className="checkout-head"><a href="/en/stays">← Back to room selection</a><span>Secure checkout</span></div><div className="checkout-steps"><b>1 Room</b><b className="active">2 Guest details</b><span>3 Payment</span><span>4 Confirm</span></div><div className="guest-grid"><section><p className="eyebrow">Guest details</p><h2>Who’s checking in?</h2>{!mode ? <div className="auth-choice"><h3>How would you like to continue?</h3><p>Save your details for faster bookings, or continue without an account.</p><div><button onClick={() => setMode("signin")}>Sign in</button><button className="secondary" onClick={() => setMode("create")}>Create an account</button><button className="text-action" onClick={() => setMode("guest")}>Continue as guest</button></div></div> : <div className="guest-form"><div className="form-mode">Continuing as {mode === "guest" ? "a guest" : mode === "signin" ? "a signed-in guest" : "a new account"}</div><div className="form-row"><label>First name *<input value={form.first} onChange={e => update("first", e.target.value)}/></label><label>Last name *<input value={form.last} onChange={e => update("last", e.target.value)}/></label></div><div className="form-row"><label>Email *<input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="you@example.com"/></label><label>Phone *<input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+62"/></label></div><label className="check-row"><input type="checkbox"/> I’m booking for someone else</label><h3>Guest names</h3><p className="muted">Add the names of everyone staying in this room.</p><div className="guest-name-row"><span>Primary guest</span><strong>{form.first || "Your name"} {form.last}</strong></div><div className="guest-name-row"><span>Guest 2</span><input placeholder="Full name (optional)"/></div><h3>Arrival & special requests</h3><label>Estimated arrival<select value={form.arrival} onChange={e => update("arrival", e.target.value)}><option>15:00–16:00</option><option>18:00–19:00</option><option>21:00–22:00</option></select></label><label>Special requests<textarea value={form.requests} onChange={e => update("requests", e.target.value)} placeholder="Anything the property should know?"/></label>{error && <p className="error-text">{error}</p>}{submitted && <p className="success-text">Guest details saved. Ready to continue to payment.</p>}<button onClick={submit}>Continue to payment</button></div>}</section><aside className="summary-card guest-summary"><span className="eyebrow">Your stay</span><h3>Kaliurang Heritage Villa</h3><p>26-Sept-2026 → 27-Sept-2026<br/>1 room · 2 adults + 0 children</p><div className="summary-line"><span>Deluxe room ×1</span><strong>Rp 6,960,000</strong></div><div className="summary-line total"><span>Total</span><strong>Rp 6,960,000</strong></div><small><ShieldCheck size={14}/> Your information is encrypted and secure.</small></aside></div></main>;
}

function Checkout({
  propertyId,
  roomTypeId,
  search,
  onBack,
  onComplete,
}: {
  propertyId: string | null;
  roomTypeId: string | null;
  search: SearchState;
  onBack: () => void;
  onComplete: (code: string) => void;
}) {
  const createBooking = useMutation(api.bookings.create);
  const rewards = useQuery(api.rewards.getAccount, {});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"pay_at_hotel" | "manual_bank_transfer">("pay_at_hotel");
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const cart = (() => { try { return JSON.parse(localStorage.getItem("menetapBookingCart") || "null") as { rooms?: Array<{ roomTypeId: string; name: string; quantity: number; ratePlan: string; roomTotal: number; breakfast: number }>; childTotal?: number; addOns?: Array<{ name: string; price: number }>; total?: number } | null; } catch { return null; } })();
  const submit = async () => {
    if (!propertyId || !roomTypeId || !name || !email) {
      setError("Please provide your name and email.");
      return;
    }
    try {
      const result = await createBooking({
        propertyId: propertyId as never,
        roomTypeId: roomTypeId as never,
        checkIn: search.checkIn || new Date().toISOString().slice(0, 10),
        checkOut:
          search.checkOut ||
          new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        guestCount: search.guests,
        childAges: search.childAges,
        roomSelections: cart?.rooms?.map((room) => ({ roomTypeId: room.roomTypeId, roomName: room.name, quantity: room.quantity, ratePlan: room.ratePlan, roomAmount: room.roomTotal, breakfastAmount: room.breakfast })) as never,
        idempotencyKey: `${propertyId}:${roomTypeId}:${search.checkIn}:${search.checkOut}:${name.trim().toLowerCase()}:${email.trim().toLowerCase()}`,
        guestName: name,
        guestEmail: email,
        paymentMethod,
        pointsToRedeem,
      });
      onComplete(result.reference);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create booking.",
      );
    }
  };
  return (
    <main className="page narrow">
      <button className="back-button" onClick={onBack}>
        ← Room selection
      </button>
      <p className="eyebrow">Checkout</p>
      <h2>Complete your booking</h2>
      <div className="checkout-grid">
        <div className="form-card">
          <label>
            Full name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </label>
          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
            />
          </label>
          <label>
            Phone number
            <input placeholder="+62" />
          </label>
          {rewards && <section className="guest-account-card"><h3>Use Rewards points</h3><p>{(rewards.account?.pointsBalance ?? 0).toLocaleString("en-US")} points available · Rp {((rewards.account?.pointsBalance ?? 0) * rewards.config.redeemValueIdrPerPoint).toLocaleString("en-US")} value</p><label>Points to redeem<input type="number" min="0" max={rewards.account?.pointsBalance ?? 0} value={pointsToRedeem} onChange={e=>setPointsToRedeem(Math.min(rewards.account?.pointsBalance ?? 0, Math.max(0, Number(e.target.value))))}/></label><button type="button" className="outline-button" onClick={()=>setPointsToRedeem(rewards.account?.pointsBalance ?? 0)}>Use all points</button></section>}
          <fieldset className="payment-methods"><legend>Payment method</legend><label><input type="radio" name="payment-method" checked={paymentMethod === "pay_at_hotel"} onChange={() => setPaymentMethod("pay_at_hotel")} /> Pay at hotel <small>No payment required now</small></label><label><input type="radio" name="payment-method" checked={paymentMethod === "manual_bank_transfer"} onChange={() => setPaymentMethod("manual_bank_transfer")} /> Manual bank transfer <small>We’ll show transfer instructions after booking</small></label></fieldset>
          {error && <p className="error-text">{error}</p>}
          <button onClick={submit}>Confirm booking</button>
        </div>
        <aside className="summary-card checkout-summary"><span className="eyebrow">Your stay</span><h3>Kaliurang Heritage Villa</h3><p>{search.checkIn} → {search.checkOut}<br />{search.adults} adults + {search.children} children</p>{cart?.rooms?.map((room) => <div className="summary-line" key={room.name}><span>{room.name} ×{room.quantity}<small>{room.ratePlan}</small></span><strong>Rp {(room.roomTotal + room.breakfast).toLocaleString("en-US")}</strong></div>)}{(cart?.childTotal ?? 0) > 0 && <div className="summary-line"><span>Child charges</span><strong>Rp {cart!.childTotal!.toLocaleString("en-US")}</strong></div>}{cart?.addOns?.map((addon) => <div className="summary-line" key={addon.name}><span>{addon.name}</span><strong>Rp {addon.price.toLocaleString("en-US")}</strong></div>)}<div className="summary-line"><span>Taxes & service fees</span><strong>Included</strong></div><div className="summary-line total"><span>Total</span><strong>Rp {(cart?.total ?? 0).toLocaleString("en-US")}</strong></div></aside>
      </div>
    </main>
  );
}

function Confirmation({
  code,
  onHome,
}: {
  code: string | null;
  onHome: () => void;
}) {
  const requestCancellation = useMutation(api.bookings.requestCancellation);
  const requestRefund = useMutation(api.bookings.requestRefund);
  const [contactEmail, setContactEmail] = useState("");
  const [action, setAction] = useState<"cancel" | "refund" | null>(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const booking = useQuery(
    api.bookings.getByReference,
    code ? { reference: code } : "skip",
  );
  const submitTransfer = useMutation(api.payments.submitManualTransfer);
  const transferInstructions = useQuery(api.payments.getInstructions, booking && contactEmail ? { bookingId: booking._id, guestEmail: contactEmail } : "skip");
  const [transferReference, setTransferReference] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferredAt, setTransferredAt] = useState("");
  const [transferMessage, setTransferMessage] = useState("");
  if (!code) return <main className="page narrow centered"><div className="empty-state"><h2>Confirmation not found</h2><p className="muted">Open the confirmation link from your booking email.</p><button onClick={onHome}>Explore stays</button></div></main>;
  if (booking === undefined) return <main className="page narrow centered"><LoadingState label="Loading your confirmation…" /></main>;
  if (!booking) return <main className="page narrow centered"><div className="empty-state"><h2>We couldn’t find that booking</h2><p className="muted">Check the confirmation reference and try again, or contact support.</p><button onClick={onHome}>Explore stays</button></div></main>;
  const nights = Math.max(1, Math.round((new Date(`${booking.checkOut}T00:00:00`).getTime() - new Date(`${booking.checkIn}T00:00:00`).getTime()) / 86400000));
  const childAges = booking.childAges ?? [];
  const paymentLabel = booking.paymentMethod === "pay_at_hotel" ? "Pay at hotel" : "Manual bank transfer";
  const submitAction = async () => {
    setActionError(""); setActionMessage("");
    if (!contactEmail.trim()) { setActionError("Enter the email used for this booking."); return; }
    try {
      if (action === "cancel") { await requestCancellation({ reference: code, guestEmail: contactEmail }); setActionMessage("Your cancellation request has been submitted."); }
      if (action === "refund") { await requestRefund({ reference: code, guestEmail: contactEmail, reason: "Guest requested a refund from confirmation." }); setActionMessage("Your refund request has been sent for review."); }
      setAction(null);
    } catch (err) { setActionError(err instanceof Error ? err.message : "We couldn’t submit that request."); }
  };
  return (
    <main className="page narrow centered">
      <div className="success-icon">✓</div>
      <p className="eyebrow">Booking confirmed</p>
      <h2>Your stay is ready.</h2>
      <p className="muted">
        We have saved your reservation. Your confirmation code is <strong>{code}</strong>.
      </p>
      <div className="confirmation-card">
        <span><b>{booking.guestName}</b><br />{booking.checkIn} → {booking.checkOut} · {nights} {nights === 1 ? "night" : "nights"}</span>
        <span>{booking.guestCount} guests{childAges.length ? ` · ${childAges.length} children (${childAges.join(", ")} years)` : ""}</span>
        <span>Booking status: <strong>{booking.status}</strong></span>
        <span>Payment: <strong>{paymentLabel}</strong> · {booking.paymentStatus}</span>
        <strong>Total · Rp {booking.totalAmount.toLocaleString("en-US")}</strong>
        <small>Free cancellation terms follow the selected rate plan. Menetap support will be here if you need anything.</small>
      </div>
      {booking.paymentMethod === "manual_bank_transfer" && <section className="guest-account-card"><h3>Pay by manual bank transfer</h3>{transferInstructions && <p>Transfer to {transferInstructions.bankName}, account {transferInstructions.bankAccountName} ({transferInstructions.bankAccountNumber}).</p>}{transferMessage ? <p className="success-text">{transferMessage}</p> : <><label>Guest email<input type="email" value={contactEmail} onChange={e=>setContactEmail(e.target.value)} placeholder="Email used for booking"/></label><label>Transfer reference<input value={transferReference} onChange={e=>setTransferReference(e.target.value)} /></label><label>Amount (IDR)<input type="number" value={transferAmount} onChange={e=>setTransferAmount(e.target.value)} /></label><label>Transfer date<input type="date" value={transferredAt} onChange={e=>setTransferredAt(e.target.value)} /></label><button onClick={async()=>{try{await submitTransfer({bookingId:booking._id,guestEmail:contactEmail,reference:transferReference,amount:Number(transferAmount),transferredAt});setTransferMessage("Transfer submitted, awaiting verification.");}catch(error){setActionError(error instanceof Error?error.message:"Unable to submit transfer.");}}}>Submit transfer proof</button></>}</section>}
      {actionMessage && <p className="success-text">{actionMessage}</p>}
      <div className="confirmation-actions"><button onClick={onHome}>Explore more stays</button><a className="outline-button" href={`/en/help?booking=${encodeURIComponent(code)}`}>Get support</a><button className="outline-button" onClick={() => setAction("cancel")}>Request cancellation</button><button className="outline-button" onClick={() => setAction("refund")}>Request refund</button></div>
      {action && <div className="booking-modal-backdrop" onClick={() => setAction(null)}><div className="ops-modal" onClick={(event) => event.stopPropagation()}><h2>{action === "cancel" ? "Request cancellation" : "Request refund"}</h2><p>For security, confirm the email address used for this booking.</p><label>Email<input type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} placeholder="you@example.com" /></label>{actionError && <p className="error-text">{actionError}</p>}<div><button className="outline-button" onClick={() => setAction(null)}>Close</button><button className="save-property" onClick={submitAction}>Submit request</button></div></div></div>}
    </main>
  );
}
function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="info-card">
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
function LoadingState({ label }: { label: string }) {
  return (
    <div className="loading-state" role="status">
      <span className="loading-spinner" />
      {label}
    </div>
  );
}
function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <div className="state-mark">—</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function RetryState({ title = "Something went wrong", text = "We couldn’t load this right now.", onRetry }: { title?: string; text?: string; onRetry: () => void }) {
  return <div className="empty-state error-state" role="alert"><div className="state-mark">!</div><h3>{title}</h3><p>{text}</p><button onClick={onRetry}>Try again</button></div>;
}
function MapPreview({
  properties,
  onSelect,
}: {
  properties: Array<{ _id: string; name: string; lowestPrice?: number }>;
  onSelect: (id: string) => void;
}) {
  const points = properties.slice(0, 30).map((property, index) => ({
    property,
    top: 18 + ((index * 29) % 64),
    left: 18 + ((index * 43) % 68),
  }));
  const clusters = points.reduce<
    Array<{ top: number; left: number; properties: typeof points }>
  >((groups, point) => {
    const group = groups.find(
      (candidate) =>
        Math.abs(candidate.top - point.top) < 9 &&
        Math.abs(candidate.left - point.left) < 9,
    );
    if (group) group.properties.push(point);
    else groups.push({ top: point.top, left: point.left, properties: [point] });
    return groups;
  }, []);
  return (
    <div className="search-map-preview" aria-label="Map view of search results">
      <span className="map-label">Map view · {properties.length} stays</span>
      {clusters.map((cluster) =>
        cluster.properties.length > 1 ? (
          <button
            type="button"
            className="map-cluster"
            style={{ top: `${cluster.top}%`, left: `${cluster.left}%` }}
            key={cluster.properties
              .map((point) => point.property._id)
              .join("-")}
            aria-label={`Show ${cluster.properties.length} stays in this area`}
            onClick={() => onSelect(cluster.properties[0].property._id)}
          >
            {cluster.properties.length}
          </button>
        ) : (
          <button
            type="button"
            className="map-price-marker"
            style={{ top: `${cluster.top}%`, left: `${cluster.left}%` }}
            key={cluster.properties[0].property._id}
            title={cluster.properties[0].property.name}
            aria-label={`Open ${cluster.properties[0].property.name}`}
            onClick={() => onSelect(cluster.properties[0].property._id)}
          >
            {cluster.properties[0].property.lowestPrice
              ? `Rp ${(cluster.properties[0].property.lowestPrice / 1000).toFixed(0)}k`
              : "Price"}
          </button>
        ),
      )}
    </div>
  );
}

function BantulLanding({
  language,
  setLanguage,
}: {
  language: "EN" | "ID";
  setLanguage: (language: "EN" | "ID") => void;
}) {
  const prefix = `/${language.toLowerCase()}`;
  return (
    <>
      <main className="destination-landing page">
        <p className="eyebrow">Explore Bantul</p>
        <h1>Slow days, craft traditions, and southern Yogyakarta.</h1>
        <p className="destination-intro">
          Bantul brings together village landscapes, creative workshops, food
          traditions, and an easygoing base within reach of Yogyakarta city.
        </p>
        <div className="destination-actions">
          <a href={`${prefix}/stays?destination=Bantul`}>
            Explore Bantul stays
          </a>
          <a href="#bantul-areas">Choose an area</a>
        </div>
        <section id="bantul-areas" className="destination-area-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Stay by area</p>
              <h2>Find your Bantul base</h2>
            </div>
          </div>
          <div className="destination-area-grid">
            <a
              className="destination-area-card"
              href={`${prefix}/stays?destination=Kasihan`}
            >
              <strong>Kasihan</strong>
              <p>
                Creative villages, pottery studios, and a relaxed edge-of-city
                pace.
              </p>
              <span>Browse Kasihan stays →</span>
            </a>
            <a
              className="destination-area-card"
              href={`${prefix}/stays?destination=Imogiri`}
            >
              <strong>Imogiri</strong>
              <p>
                Hills, royal heritage, and a quieter route into southern Bantul.
              </p>
              <span>Browse Imogiri stays →</span>
            </a>
            <a
              className="destination-area-card"
              href={`${prefix}/stays?destination=Parangtritis`}
            >
              <strong>Parangtritis</strong>
              <p>
                Coastal air, wide horizons, and stays near the southern beach.
              </p>
              <span>Browse Parangtritis stays →</span>
            </a>
          </div>
        </section>
        <section className="destination-properties">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Places to start</p>
              <h2>Properties for a slower stay</h2>
            </div>
            <a href={`${prefix}/stays?destination=Bantul`}>
              See all Bantul stays →
            </a>
          </div>
          <div className="destination-property-grid">
            <article>
              <div className="property-image">Villa</div>
              <div>
                <h3>Kasihan Garden Villa</h3>
                <p>Kasihan · creative district nearby</p>
                <a href={`${prefix}/stays?destination=Kasihan`}>
                  View availability →
                </a>
              </div>
            </article>
            <article>
              <div className="property-image">Homestay</div>
              <div>
                <h3>Imogiri Hillside Homestay</h3>
                <p>Imogiri · quiet southern hills</p>
                <a href={`${prefix}/stays?destination=Imogiri`}>
                  View availability →
                </a>
              </div>
            </article>
            <article>
              <div className="property-image">Beach stay</div>
              <div>
                <h3>Parangtritis Dune Retreat</h3>
                <p>Parangtritis · coastal escape</p>
                <a href={`${prefix}/stays?destination=Parangtritis`}>
                  View availability →
                </a>
              </div>
            </article>
          </div>
        </section>
        <section className="destination-faq">
          <p className="eyebrow">Bantul travel questions</p>
          <h2>Plan the practical details</h2>
          <details>
            <summary>Is Bantul close to Yogyakarta city?</summary>
            <p>
              Many Bantul areas are within an easy drive of the city, while
              southern areas such as Imogiri and Parangtritis feel more rural
              and destination-led.
            </p>
          </details>
          <details>
            <summary>What is Bantul best for?</summary>
            <p>
              Bantul suits guests looking for craft villages, local food, open
              landscapes, and a slower stay outside the city center.
            </p>
          </details>
          <details>
            <summary>Can I compare Bantul stays by dates?</summary>
            <p>
              Yes. Set your dates and guest count in the stays search to compare
              live availability and prices.
            </p>
          </details>
        </section>
        <nav
          className="destination-internal-links"
          aria-label="Bantul travel links"
        >
          <a href={`${prefix}/destinations/all`}>All destinations</a>
          <a href={`${prefix}/stays?destination=Bantul`}>All Bantul stays</a>
          <a href={`${prefix}/stays?destination=Kasihan`}>Kasihan stays</a>
          <a href={`${prefix}/stays?destination=Imogiri`}>Imogiri stays</a>
          <a href={`${prefix}/stays?destination=Parangtritis`}>
            Parangtritis stays
          </a>
        </nav>
      </main>
      <Footer language={language} setLanguage={setLanguage} />
    </>
  );
}
function PartnerProperties() {
  const liveProperties = useQuery(api.properties.listMine, {}); const updateDetails = useMutation(api.properties.updateDetails); const submitForReview = useMutation(api.properties.submitForReview); const setPublished = useMutation(api.properties.setPublished); const [saved, setSaved] = useState(false); const [policy, setPolicy] = useState("flexible"); const [property, setProperty] = useState({ name: "Kaliurang Heritage Villa", address: "Jl. Kaliurang Km 18, Sleman, Yogyakarta", email: "hello@kaliurangvilla.com", phone: "+62 812 3456 7890", rules: "No smoking · No pets · Quiet hours after 10pm", npwp: "00.000.000.0-000.000", invoice: "Kaliurang Heritage Villa", invoiceAddress: "Sleman, Yogyakarta" }); const update = (key: keyof typeof property, value: string) => setProperty({...property, [key]: value});
  const saveProperty = async () => { const current = liveProperties?.[0]; if (!current) { setSaved(true); return; } try { await updateDetails({ propertyId: current._id, name: property.name, type: current.type, description: current.description || "A Menetap partner property.", address: property.address, area: current.area, city: current.city, country: current.country, contactEmail: property.email, contactPhone: property.phone, timezone: "Asia/Jakarta", amenities: [], houseRules: property.rules.split("·").map(x=>x.trim()).filter(Boolean), cancellationPolicy: policy, checkInFrom: "14:00", checkOutBefore: "12:00" }); setSaved(true); } catch { setSaved(false); } };
  const lifecycleAction = async (action: "review" | "publish" | "unpublish") => { const current = liveProperties?.[0]; if (!current) return; if (action === "review") await submitForReview({ propertyId: current._id }); else await setPublished({ propertyId: current._id, published: action === "publish", reason: action === "publish" ? "Partner made listing ready" : "Partner temporarily paused listing" }); };
  return <div className="partner-properties-page"><header className="partner-header"><div className="partner-wrap"><a href="/en/partner-dashboard" className="partner-back">← Partner dashboard</a><button className="partner-avatar">KH</button></div></header><main className="partner-properties-wrap"><div className="properties-heading"><div><p className="eyebrow">Property management</p><h1>{property.name}</h1><p>Manage the information guests see and the settings used for your bookings.</p></div><button className="save-property" onClick={()=>setSaved(true)}>{saved ? "Changes saved" : "Save changes"}</button></div><div className="properties-grid"><section className="property-settings-card"><h2>Property profile</h2><PropertyField label="Property name" value={property.name} onChange={v=>update("name",v)}/><PropertyField label="Address" value={property.address} onChange={v=>update("address",v)}/><PropertyField label="Contact email" value={property.email} onChange={v=>update("email",v)}/><PropertyField label="Contact phone" value={property.phone} onChange={v=>update("phone",v)}/><label className="property-field">Guest rules<textarea value={property.rules} onChange={e=>update("rules",e.target.value)}/></label></section><section className="property-settings-card"><h2>Booking settings</h2><label className="property-field">Cancellation policy<select value={policy} onChange={e=>setPolicy(e.target.value)}><option value="flexible">Flexible — free cancellation until 24 hours before check-in</option><option value="moderate">Moderate — free until 7 days, 50% within 3–7 days</option><option value="strict">Strict — free until 14 days, no refund after</option></select></label><PropertyField label="Check-in from" value="2:00 PM" onChange={()=>undefined}/><PropertyField label="Check-out before" value="12:00 PM" onChange={()=>undefined}/><div className="setting-note"><ShieldCheck size={16}/><span>These settings are shown clearly to guests before they book.</span></div></section><section className="property-settings-card"><h2>Tax & invoice settings</h2><PropertyField label="Business / tax ID (NPWP)" value={property.npwp} onChange={v=>update("npwp",v)} placeholder="00.000.000.0-000.000"/><PropertyField label="Invoice business name" value={property.invoice} onChange={v=>update("invoice",v)}/><PropertyField label="Invoice address" value={property.invoiceAddress} onChange={v=>update("invoiceAddress",v)}/><label className="property-field">VAT rate<input defaultValue="0%"/></label></section><section className="property-settings-card property-status-card"><h2>Property status</h2><div className="status-line"><span className="live-dot"/> <strong>Live on Menetap</strong></div><p>Your property is visible to guests searching Yogyakarta. Updates to your listing may be reviewed before going live.</p><a href="/en/partner-room-detail">Manage rooms & rates →</a></section></div></main></div>;
}

function PartnerInventory() {
  const properties = useQuery(api.properties.listMine, {});
  const rooms = useQuery(api.roomTypes.listForPartner, properties?.[0] ? { propertyId: properties[0]._id } : "skip") || [];
  const updateDay = useMutation(api.availability.updateDay);
  const bulkUpdate = useMutation(api.availability.bulkUpdate);
  const [roomId, setRoomId] = useState<any>(null);
  const [from, setFrom] = useState("2026-09-26");
  const [to, setTo] = useState("2026-10-10");
  const [message, setMessage] = useState("");
  const selected = rooms.find((room:any) => room._id === roomId) || rooms[0];
  const calendar = useQuery(api.availability.calendar, selected ? { roomTypeId: selected._id, from, to } : "skip") || [];
  const dates = calendar.map((day:any) => day.date);
  const saveDay = async (day:any) => { try { await updateDay({ roomTypeId: selected._id, date: day.date, totalUnits: day.totalUnits, availableUnits: day.availableUnits === 0 ? Math.min(day.totalUnits, 1) : Math.max(0, day.availableUnits - 1), rate: day.rate, status: day.availableUnits <= 1 ? "closed" : "open", expectedUpdatedAt: day.updatedAt }); setMessage("Availability saved"); } catch (error) { setMessage(error instanceof Error ? error.message : "Refresh required"); } };
  const applyRange = async () => { if (!selected) return; try { await bulkUpdate({ roomTypeId: selected._id, from, to, totalUnits: selected.totalUnits, availableUnits: selected.totalUnits, rate: 0, status: "open" }); setMessage("Date range updated"); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to update range"); } };
  return <div className="partner-inventory-page"><header className="partner-header"><div className="partner-wrap"><a href="/en/partner-dashboard" className="partner-back">← Partner dashboard</a><button className="partner-avatar">KH</button></div></header><main className="partner-inventory-wrap"><div className="inventory-heading"><div><p className="eyebrow">Property · Calendar</p><h1>Inventory & rates</h1><p>Live availability for your owned room types.</p></div><button className="save-property" onClick={applyRange}>Open selected range</button></div><div className="inventory-toolbar"><label>Room<select value={selected?._id || ""} onChange={e=>setRoomId(e.target.value)}>{rooms.map((room:any)=><option key={room._id} value={room._id}>{room.name}</option>)}</select></label><label>From<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>To<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label></div>{message&&<p className="success-text">{message}</p>}<section className="inventory-card"><div className="inventory-grid"><div className="inventory-corner"/>{dates.map((date:string)=><div className="inventory-date" key={date}>{date}</div>)}{selected&&<><div className="inventory-room-label"><b>{selected.name}</b><span>{selected.totalUnits} units</span></div>{calendar.map((day:any)=><button className={`inventory-cell ${day.availableUnits===0?"sold":day.availableUnits===1?"limited":"open"}`} key={day._id} onClick={()=>saveDay(day)}><b>{day.availableUnits}</b><small>{day.status === "closed" ? "closed" : "left"}</small></button>)}</>}</div></section><div className="inventory-note"><ShieldCheck size={16}/><span>Click a day to decrement availability. Stale edits are rejected and require a refresh.</span></div></main></div>;
}

function PartnerBookings() {
  const [search, setSearch] = useState(""); const [status, setStatus] = useState<any>(undefined); const [selectedId, setSelectedId] = useState<any>(null); const [note, setNote] = useState(""); const [message, setMessage] = useState("");
  const bookings = useQuery(api.bookings.listForPartner, { search: search || undefined, status }); const detail = useQuery(api.bookings.getForPartner, selectedId ? { bookingId: selectedId } : "skip"); const updateStatus = useMutation(api.bookingStatus.update); const addNote = useMutation(api.bookings.addPartnerNote); const exportBookings = useMutation(api.bookings.exportForPartner);
  const changeStatus = async (next:any) => { if (!selectedId) return; try { await updateStatus({bookingId:selectedId,status:next,reason:"Partner reservation action"}); setMessage("Reservation updated"); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to update reservation"); } };
  const saveNote = async () => { if (!selectedId || !note.trim()) return; try { await addNote({bookingId:selectedId,note}); setNote(""); setMessage("Note saved"); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save note"); } };
  return <div className="partner-bookings-page"><header className="partner-header"><div className="partner-wrap"><a href="/en/partner-dashboard" className="partner-back">← Partner dashboard</a><button className="partner-avatar">KH</button></div></header><main className="partner-bookings-wrap"><div className="bookings-heading"><div><p className="eyebrow">Guests</p><h1>Bookings</h1><p>Live reservations for your authorized properties.</p></div><button className="outline-button" onClick={()=>exportBookings({search:search||undefined,status})}>Export CSV</button></div><div className="booking-toolbar"><label className="booking-search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search reference, guest, or email"/></label><select value={status||""} onChange={e=>setStatus(e.target.value||undefined)}><option value="">All statuses</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="no_show">No-show</option></select></div>{message&&<p className="success-text">{message}</p>}<section className="booking-table-card"><div className="booking-table"><div className="booking-table-head"><span>Reference</span><span>Guest</span><span>Dates</span><span>Amount</span><span>Status</span></div>{bookings?.map((booking:any)=><button className="booking-table-row" key={booking._id} onClick={()=>setSelectedId(booking._id)}><span><b>{booking.reference}</b><small>{booking.guestEmail}</small></span><span>{booking.guestName}</span><span>{booking.checkIn} → {booking.checkOut}</span><strong>Rp {booking.totalAmount.toLocaleString("en-US")}</strong><span className={`booking-status ${booking.status}`}>{booking.status}</span></button>)}{bookings && !bookings.length&&<div className="booking-empty">No reservations match your filters.</div>}{!bookings&&<div className="booking-empty">Loading reservations…</div>}</div></section>{detail&&<div className="booking-modal-backdrop" onClick={()=>setSelectedId(null)}><article className="booking-modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><h2>{detail.booking.reference}</h2><button onClick={()=>setSelectedId(null)}>×</button></div><p>{detail.booking.guestName} · {detail.booking.guestEmail}</p><div className="booking-facts"><div><small>Property</small><b>{detail.property?.name}</b></div><div><small>Room</small><b>{detail.room?.name}</b></div><div><small>Stay</small><b>{detail.booking.checkIn} → {detail.booking.checkOut}</b></div><div><small>Payment</small><b>{detail.payment?.status || detail.booking.paymentStatus}</b></div></div><label className="booking-note">Operational note<textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Add a private note"/></label><div className="booking-actions"><button onClick={saveNote}>Save note</button>{detail.booking.status==="pending"&&<button onClick={()=>changeStatus("confirmed")}>Confirm</button>}{detail.booking.status==="confirmed"&&<button onClick={()=>changeStatus("no_show")}>Mark no-show</button>}</div>{detail.notes?.map((item:any)=><p className="muted" key={item._id}>{item.note}</p>)}</article></div>}</main></div>;
}

function PartnerLogin() {
  const { signIn } = useAuthActions(); const submitApplication = useMutation(api.partnerApplications.submit); const application = useQuery(api.partnerApplications.current); const [mode, setMode] = useState<"login"|"signup">("login"); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const [acceptedTerms, setAcceptedTerms] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setError(""); setBusy(true); const form = new FormData(event.currentTarget); try { if (mode === "signup" && !acceptedTerms) throw new Error("Accept the Partner Terms before continuing."); await signIn("password", form); if (mode === "signup") await submitApplication({ propertyName: String(form.get("propertyName") || ""), contactPhone: String(form.get("phone") || ""), agreementVersion: "partner-terms-2026-09-01", acceptedTerms, businessName: String(form.get("businessName") || ""), businessType: String(form.get("businessType") || "individual") as "individual"|"company", taxIdLast4: String(form.get("taxIdLast4") || ""), payoutBankName: String(form.get("payoutBankName") || ""), payoutAccountName: String(form.get("payoutAccountName") || ""), payoutAccountLast4: String(form.get("payoutAccountLast4") || "") }); window.location.assign(mode === "signup" ? "/en/partner-login" : "/en/partner-dashboard"); } catch (err) { setError(err instanceof Error ? err.message : "Unable to authenticate."); } finally { setBusy(false); } };
  const applicationMessage = application?.status === "pending_email" ? "Check your email and verify your address. Your application will enter review after verification." : application?.status === "pending_review" ? "Application received. Menetap will review your property details before enabling partner access." : application?.status === "rejected" ? `Application not approved${application.rejectionReason ? `: ${application.rejectionReason}` : "."}` : "";
  return <div className="partner-auth-page"><header className="partner-header"><div className="partner-wrap"><a className="partner-brand" href="/en/partners"><span>menetap<span>.</span></span><small>for partners</small></a><a href="/en/partners">← Back to partner page</a></div></header><main className="partner-auth-wrap"><div className="partner-auth-card"><div className="partner-auth-mark">menetap<span>.</span></div><p className="eyebrow">Partner access</p><h1>{mode === "login" ? "Welcome back" : "Create your partner account"}</h1><p className="partner-auth-copy">{mode === "login" ? "Manage your properties, bookings, rates, and services from one place." : "Create an account to apply, verify your email, and list your property after review."}</p>{applicationMessage && <p className="success-text">{applicationMessage}</p>}<form onSubmit={submit}><label>Email<input name="email" type="email" required placeholder="you@yourproperty.com"/></label><label>Password<input name="password" type="password" minLength={8} required placeholder="At least 8 characters"/></label><input name="flow" type="hidden" value={mode === "login" ? "signIn" : "signUp"}/>{mode === "signup" && <><label>Property name<input name="propertyName" required placeholder="Your property name"/></label><label>Contact phone<input name="phone" required placeholder="+62 812 3456 7890"/></label><label>Business name<input name="businessName" required placeholder="Legal or trading name"/></label><label>Business type<select name="businessType" defaultValue="individual"><option value="individual">Individual</option><option value="company">Company</option></select></label><label>Tax ID last four digits<input name="taxIdLast4" inputMode="numeric" maxLength={4} placeholder="Optional"/></label><label>Payout bank<input name="payoutBankName" required placeholder="Bank Central Asia"/></label><label>Payout account name<input name="payoutAccountName" required placeholder="Name on the account"/></label><label>Payout account last four digits<input name="payoutAccountLast4" required inputMode="numeric" maxLength={4} placeholder="4821"/></label><p className="muted">For security, Menetap stores only the last four account digits. Payout verification is completed by finance after approval.</p><label className="check-row"><input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)}/> I agree to the <a href="/en/terms">Partner Terms</a>, version 2026-09-01.</label></>}{error && <p className="error-text">{error}</p>}<button type="submit" disabled={busy}>{busy ? "Signing in…" : mode === "login" ? "Log in to dashboard" : "Create partner account"}</button></form>{mode === "login" && <button className="auth-link">Forgot password?</button>}<div className="partner-auth-switch">{mode === "login" ? "New to Menetap?" : "Already have an account?"}<button onClick={() => setMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "Create an account" : "Log in"}</button></div></div><p className="partner-auth-note"><ShieldCheck size={14}/> Partner accounts are separate from guest accounts and require email verification and approval.</p></main></div>;
}

function PartnerServices() {
  const services = [["sparkles","Cleaning & housekeeping","Scheduled turnover cleaning between guest stays, plus on-demand deep cleans.","From Rp 85,000 / turnover"],["camera","Professional photography","A photographer shoots your property and delivers edited, listing-ready photos.","From Rp 950,000 / shoot"],["phone-call","Central reservation service","A Menetap team handles phone and WhatsApp booking inquiries on your behalf.","Rp 450,000 / month"],["trending-up","Revenue management","UPSCALE analysts set and adjust your pricing weekly based on demand data.","Rp 1,200,000 / month"]]; const [requested,setRequested]=useState<string[]>([]);
  return <div className="partner-services-page"><header className="partner-services-header"><div className="partner-services-wrap"><a className="partner-brand" href="/en/partners"><span>menetap<span>.</span></span><small>for partners</small></a><a href="/en/partner-dashboard">Dashboard</a></div></header><main><section className="services-hero partner-services-wrap"><div className="services-pill"><Sparkles size={14}/>Menetap services</div><h1>Run your property, not your errands.</h1><p>Optional add-on services, run by Menetap and UPSCALE, so you can focus on hosting instead of logistics.</p></section><section className="services-grid partner-services-wrap">{services.map(([icon,name,desc,price])=><article className="service-card" key={name}><div className="service-icon"><Sparkles size={22}/></div><h2>{name}</h2><p>{desc}</p><strong>{requested.includes(name) ? "Request sent" : price}</strong><button className={requested.includes(name) ? "requested" : ""} onClick={()=>setRequested([...requested,name])}>{requested.includes(name) ? "We’ll be in touch" : "Request this service"}</button></article>)}</section><section className="services-cta partner-services-wrap"><div><div><h2>Already listing on Menetap?</h2><p>Request any service directly from your dashboard’s Services tab.</p></div><a href="/en/partner-dashboard">Go to dashboard</a></div></section></main><footer className="partner-services-footer"><div className="partner-services-wrap"><span>© 2026 Menetap. All rights reserved.</span><span>Managed by <b>UPSCALE</b></span></div></footer></div>;
}

function PartnerRoomDetail() {
  const [name, setName] = useState("Garden Suite"); const [desc, setDesc] = useState("A private garden-facing room with direct courtyard access."); const [minStay, setMinStay] = useState("1"); const [photos, setPhotos] = useState(["violet","blue"]); const [deleted, setDeleted] = useState(false); const [saved, setSaved] = useState(false); const [childrenAccepted, setChildrenAccepted] = useState(true); const [maxChildAge, setMaxChildAge] = useState("12"); const [childPricing, setChildPricing] = useState("free"); const amenities = ["Garden view","Air conditioning","Free WiFi","Hot water","Free parking","Pool access","Breakfast included","Kitchen","TV","Washing machine","Hair dryer","Balcony","Mountain view","Non-smoking room","Workspace / desk"];
  if (deleted) return <div className="partner-room-page"><div className="partner-room-wrap room-deleted"><CheckCircle2 size={42}/><h1>Room type removed</h1><p>{name} is no longer bookable.</p><a href="/en/partner-dashboard">Back to dashboard</a></div></div>;
  return <div className="partner-room-page"><header className="partner-header"><div className="partner-room-wrap room-header"><a href="/en/partner-dashboard">← Rooms & rates</a><button className="partner-avatar">KH</button></div></header><main className="partner-room-wrap room-main"><div className="room-top-card"><label>Room name<input value={name} onChange={e => setName(e.target.value)}/></label><label>Description <span>· shown to guests in EN</span><textarea value={desc} onChange={e => setDesc(e.target.value)}/></label><p>2 guests · Rp 890,000/night base rate</p></div><section className="room-panel"><div className="room-panel-head"><b>Bookings for this room</b><a href="/en/partner-dashboard">View all in Bookings →</a></div><div className="room-booking-table"><b>Guest</b><b>Arrival</b><b>Departure</b><b>Rooms</b><b>Guests</b><b>Booked</b><b>Value</b><span>Anin W.</span><span>Oct 12</span><span>Oct 15</span><span>1</span><span>2</span><span>Sep 20</span><strong>Rp 2,670,000</strong><span>Dimas P.</span><span>Oct 8</span><span>Oct 10</span><span>1</span><span>1</span><span>Sep 24</span><strong>Rp 1,780,000</strong></div></section><section className="room-panel"><b>Photos</b><p className="room-help">JPG, PNG, or WEBP · exact size <strong>1600 × 1200px</strong> (4:3), under 3MB per photo. First photo is used as the cover.</p><div className="room-photo-grid"><button className="room-upload" onClick={() => setPhotos([...photos,"pink"])}><Upload size={17}/>Upload</button>{photos.map((color,i) => <div className={`room-photo ${color}`} key={`${color}-${i}`}><span>{i===0 ? "Cover" : ""}</span><button onClick={() => setPhotos(photos.filter((_,idx)=>idx!==i))}>×</button></div>)}</div></section><section className="room-panel"><b>Amenities & facilities</b><div className="room-amenities">{amenities.map((a,i)=><button className={i<4 ? "selected" : ""} key={a}>{a}</button>)}</div></section><section className="room-panel"><b>Minimum stay</b><div className="min-stay"><input type="number" value={minStay} onChange={e=>setMinStay(e.target.value)}/> nights</div></section><section className="room-panel"><b>Day-of-week pricing <span className="room-muted">· base rate Rp 890,000/night</span></b><p className="room-help">Leave blank to use the base rate. Live availability and date-specific overrides are on the Calendar tab.</p><div className="dow-grid">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=><label key={d}>{d}<input placeholder="890,000" defaultValue={d === "Fri" || d === "Sat" ? "1,023,500" : ""}/></label>)}</div></section><section className="remove-room"><div><b>Remove this room type</b><p>Delists it from search. This can't be undone.</p></div><button onClick={()=>setDeleted(true)}>Remove room type</button></section><button className="save-room" onClick={()=>setSaved(true)}>{saved ? "Changes saved" : "Save changes"}</button></main></div>;
}

function PropertyField({label,value,onChange,placeholder}:{label:string;value:string;onChange:(value:string)=>void;placeholder?:string}){return <label className="property-field">{label}<input value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)}/></label>}
