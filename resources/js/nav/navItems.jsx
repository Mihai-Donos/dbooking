// resources/js/nav/navItems.jsx
import {
  LayoutDashboard,
  Calendar,
  MapPin,
  Tag,
  ClipboardList,
  HelpCircle,
  User,
  Wrench,
  BarChart3,
  PlusCircle,
  Eye,
  Users,
  Compass,
  Receipt, // ✅ neu
} from "lucide-react";

export function getNavItems(role = "user") {
  const isAdmin = role === "admin";
  const isHost = role === "host";

  const sections = [];

  // ✅ Public Discovery: Veranstaltungen (für alle Rollen)
  sections.push({
    section: "Entdecken",
    items: [
      {
        label: "Veranstaltungen",
        href: "/veranstaltungen",
        icon: Compass,
        match: ["/veranstaltungen"],
      },
    ],
  });

  // Buchungen (nur wenn diese URLs existieren)
  sections.push({
    section: "Übersicht",
    items: [
      { label: "Anmeldungen", href: "/anmeldungen/uebersicht", icon: ClipboardList, match: ["/anmeldungen", "/bookings"] },
      { label: "Rechnungen", href: "/bookings/archive", icon: Receipt, match: ["/bookings/archive"], badge: "Soon"},

       { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, match: ["/dashboard"], badge: "Fake" },
       { label: "Profil", href: "/profile", icon: User, match: ["/profile"] },
       { label: "FAQ", href: "/faq", icon: HelpCircle, match: ["/faq"], badge: "Soon" },
    ],
  });

  // Host
  if (isHost) {
    sections.push({
      section: "Host",
      items: [
        {
          label: "Events",
          href: "/host/events",
          icon: Calendar,
          match: ["/host/events"],
          children: [
            {
              label: "Übersicht",
              href: "/host/events",
              match: ["/host/events"],
              exact: true,
            },
            {
              label: "Anmeldungen",
              href: "/host/events/bookings",
              match: ["/host/events/bookings"],
            },
            {
              label: "Zimmerplanung",
              href: "/host/events/rooms",
              match: ["/host/events/rooms"],
            },
            {
              label: "Verpflegung",
              href: "/host/events/catering",
              match: ["/host/events/catering"],
              badge: "Soon",
            },
            {
              label: "Aktivitäten & Aufgaben",
              href: "/host/events/activities",
              match: ["/host/events/activities"],
              badge: "Soon",
            },
            {
              label: "Abrechnung",
              href: "/host/events/billing",
              match: ["/host/events/billing"],
              badge: "Soon",
            },
            {
              label: "Event anlegen",
              href: "/host/events/create",
              match: ["/host/events/create"],
            },
            {
              label: "Archiv",
              href: "/host/events/archive",
              match: ["/host/events/archive"],
            },
          ],
        },
        {
          label: "Locations",
          href: "/host/locations",
          icon: MapPin,
          match: ["/host/locations"],
          children: [
            { label: "Übersicht", href: "/host/locations", match: ["/host/locations"], exact: true },
            { label: "Location anfragen", href: "/host/locations/request", match: ["/host/locations/request"] },
          ],
        },
        {
          label: "Invoicing",
          href: "/host/invoicing",
          icon: BarChart3,
          match: ["/host/invoicing"],
        },
      ],
    });
  }

  // Admin
  if (isAdmin) {
    sections.push({
      section: "Admin",
      items: [
        { label: "Admin Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, match: ["/admin/dashboard"] },

        {
          label: "Events",
          href: "/admin/events",
          icon: Calendar,
          match: ["/admin/events"],
          children: [
            {
              label: "Übersicht",
              href: "/host/events",
              match: ["/host/events"],
              exact: true,
            },
            {
              label: "Anmeldungen",
              href: "/host/events/bookings",
              match: ["/host/events/bookings"],
            },
            {
              label: "Zimmerplanung",
              href: "/host/events/rooms",
              match: ["/host/events/rooms"],
            },
            {
              label: "Verpflegung",
              href: "/host/events/catering",
              match: ["/host/events/catering"],
              badge: "Soon",
            },
            {
              label: "Aktivitäten & Aufgaben",
              href: "/host/events/activities",
              match: ["/host/events/activities"],
              badge: "Soon",
            },
            {
              label: "Abrechnung",
              href: "/host/events/billing",
              match: ["/host/events/billing"],
              badge: "Soon",
            },
            {
              label: "Event anlegen",
              href: "/host/events/create",
              match: ["/host/events/create"],
            },
            {
              label: "Archiv",
              href: "/host/events/archive",
              match: ["/host/events/archive"],
            },
          ],
        },

        {
          label: "Offers",
          href: "/admin/offers",
          icon: Tag,
          match: ["/admin/offers"],
          children: [
            { label: "Übersicht", href: "/admin/offers", match: ["/admin/offers"], exact: true },
            { label: "Offer anlegen", href: "/admin/offers/create", match: ["/admin/offers/create"] },
          ],
        },

        {
          label: "Locations",
          href: "/admin/locations",
          icon: MapPin,
          match: ["/admin/locations"],
          children: [
            { label: "Übersicht", href: "/admin/locations", match: ["/admin/locations"], exact: true },
            { label: "Location anlegen", href: "/admin/locations/add", match: ["/admin/locations/add"] },
            { label: "Locations zuweisen", href: "/admin/locations/assign", match: ["/admin/locations/assign"] },
          ],
        },

        { label: "Users", href: "/admin/users", icon: Users, match: ["/admin/users"] },

        { label: "Reporting", href: "/admin/reporting", icon: BarChart3, match: ["/admin/reporting"] },
      ],
    });

    sections.push({
      section: "Dev",
      items: [
        { label: "UI Test", href: "/ui-test", icon: Wrench, match: ["/ui-test"] },
        { label: "Dashboard UI", href: "/dashboard-ui", icon: Wrench, match: ["/dashboard-ui"] },
      ],
    });
  }

  return sections;
}

export default getNavItems;