// resources/js/nav/navItems.jsx

export function getNavItems(role = "user") {
  const nav = [
    {
      section: "General",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: "dashboard", match: "exact" },
        { label: "UI Test", href: "/ui-test", icon: "spark", match: "exact" },
        { label: "FAQ", href: "/faq", icon: "help", match: "exact" },
      ],
    },
    {
      section: "Bookings",
      items: [
        { label: "Übersicht", href: "/bookings", icon: "calendar", match: "prefix" },
        { label: "Neue Buchung", href: "/bookings/new", icon: "plus", disabled: true, badge: "Soon" },
        { label: "Archiv", href: "/bookings/archive", icon: "archive", disabled: true, badge: "Soon" },
      ],
    },
  ];

  if (role === "host" || role === "admin") {
    nav.push({
      section: "Host",
      items: [
        { label: "Events", href: "/host/events", icon: "events", disabled: true, badge: "Soon" },
        { label: "Event erstellen", href: "/host/events/create", icon: "plus", disabled: true, badge: "Soon" },
        { label: "Event verwalten", href: "/host/events/manage", icon: "settings", disabled: true, badge: "Soon" },
        { label: "Invoicing", href: "/host/invoicing", icon: "invoice", disabled: true, badge: "Soon" },
        { label: "Locations", href: "/host/locations", icon: "pin", disabled: true, badge: "Soon" },
        { label: "Location anfragen", href: "/host/locations/request", icon: "mail", disabled: true, badge: "Soon" },
      ],
    });
  }

  if (role === "admin") {
    nav.push({
      section: "Admin",
      items: [
        { label: "Location hinzufügen", href: "/admin/locations/add", icon: "plus", disabled: true, badge: "Soon" },
        { label: "Location zuweisen", href: "/admin/locations/assign", icon: "link", disabled: true, badge: "Soon" },
        { label: "Reporting", href: "/admin/reporting", icon: "chart", disabled: true, badge: "Soon" },
      ],
    });
  }

  return nav;
}