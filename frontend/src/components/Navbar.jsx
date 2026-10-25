import React from "react";
import { Link, NavLink } from "react-router";
import { FaFileAlt, FaPalette } from "react-icons/fa";
import useTheme, { THEMES } from "../hooks/useTheme";

const LINKS = [
  { to: "/generate-resume", label: "Build Resume" },
  { to: "/job-match", label: "Job Match & ATS" },
  { to: "/cover-letter", label: "Cover Letter" },
  { to: "/my-resumes", label: "My Resumes" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const linkClass = ({ isActive }) => (isActive ? "active font-semibold" : "");

function Navbar() {
  const [theme, setTheme] = useTheme();

  return (
    <div className="navbar sticky top-0 z-40 bg-base-100/90 backdrop-blur shadow-sm no-print">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden" aria-label="Open menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-56 p-2 shadow">
            {LINKS.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} className={linkClass}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost text-xl gap-2">
          <FaFileAlt className="text-primary" /> AI Resume Maker
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          {LINKS.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="navbar-end gap-2">
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-sm gap-2" aria-label="Change theme">
            <FaPalette /> <span className="hidden sm:inline capitalize">{theme}</span>
          </div>
          <ul tabIndex={0} className="menu dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-40 p-2 shadow">
            {THEMES.map((t) => (
              <li key={t}>
                <button className={`capitalize ${t === theme ? "active" : ""}`} onClick={() => setTheme(t)}>
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <Link to="/generate-resume" className="btn btn-primary btn-sm hidden sm:inline-flex">
          Get Started
        </Link>
      </div>
    </div>
  );
}

export default Navbar;
