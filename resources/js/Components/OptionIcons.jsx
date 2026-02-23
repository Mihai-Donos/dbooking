import React from "react";

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function IconVegetarian(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path {...base} d="M6 14c6 1 12-4 12-10C11 4 6 9 6 14z" />
      <path {...base} d="M6 14c0 4 3 7 6 7 3 0 6-3 6-7" />
      <path {...base} d="M9 13c2-2 5-4 9-5" />
    </svg>
  );
}

export function IconGlutenFree(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path {...base} d="M12 4v16" />
      <path {...base} d="M9 7c1.5 1 2 2.5 2 4" />
      <path {...base} d="M15 7c-1.5 1-2 2.5-2 4" />
      <path {...base} d="M9 13c1.5 1 2 2.5 2 4" />
      <path {...base} d="M15 13c-1.5 1-2 2.5-2 4" />
      <path {...base} d="M5 19L19 5" /> {/* Slash */}
    </svg>
  );
}

export function IconLactoseFree(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path {...base} d="M9 3h6l-1 3v2c0 1 1 2 1 3v8H9v-8c0-1 1-2 1-3V6L9 3z" />
      <path {...base} d="M9 10h6" />
      <path {...base} d="M5 19L19 5" /> {/* Slash */}
    </svg>
  );
}

export function IconSingleRoom(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path {...base} d="M4 12V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" />
      <path {...base} d="M4 12h16" />
      <path {...base} d="M6 12v7" />
      <path {...base} d="M18 12v7" />
      <path {...base} d="M7 10h4" />
    </svg>
  );
}

export function IconBabyBed(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path {...base} d="M6 9h12a2 2 0 0 1 2 2v6H4v-6a2 2 0 0 1 2-2z" />
      <path {...base} d="M4 13h16" />
      <path {...base} d="M6 9V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
      <path {...base} d="M7 17v3" />
      <path {...base} d="M17 17v3" />
    </svg>
  );
}