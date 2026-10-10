export default function Icon({ name, size = 18 }) {
  const shapes = {
    logo: <><path d="M6 5 12 2l6 3v6c0 5-3 8-6 9-3-1-6-4-6-9z" /><path d="m9 11 2 2 4-4" /></>,
    moon: <path d="M20 14A8 8 0 0 1 10 4 8 8 0 1 0 20 14Z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M19 5l-1.5 1.5m-11 11L5 19" /></>,
    upload: <><path d="M12 16V4m-4 4 4-4 4 4M4 16v4h16v-4" /></>,
    file: <><path d="M14 2H6v20h12V8zM14 2v6h6M8 13h8m-8 4h8" /></>,
    x: <path d="m18 6-12 12M6 6l12 12" />,
    users: <><circle cx="9" cy="8" r="4" /><path d="M2 21v-2a7 7 0 0 1 14 0v2m2-13a4 4 0 0 1 0 8m2 2a5 5 0 0 1 2 4" /></>,
    chart: <><path d="M3 3v18h18M7 14l4-4 4 4 6-7" /></>,
    award: <><circle cx="12" cy="8" r="6" /><path d="m8 13-1 9 5-3 5 3-1-9" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    download: <><path d="M21 15v4H3v-4m4-5 5 5 5-5m-5 5V3" /></>,
    rotate: <><path d="M3 12a9 9 0 1 0 3-7m-3-2v5h5" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    alert: <><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></>,
    spinner: <path d="M12 3a9 9 0 1 0 9 9" />,
    csv: <><path d="M6 2h8l4 4v16H6zM14 2v5h5M9 12h6m-6 4h6" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name]}</svg>
}