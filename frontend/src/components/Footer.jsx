import React from "react";
import { Link } from "react-router";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-base-200 text-base-content no-print mt-16">
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h4 className="footer-title">AI Resume Maker</h4>
          <p className="text-sm opacity-80">
            Build, tailor and ATS-check your resume with AI. Your resumes stay in your browser.
          </p>
          <div className="flex gap-3 mt-4 text-xl">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
            <Link to="/contact" aria-label="Contact"><FaEnvelope /></Link>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          <h4 className="footer-title">Product</h4>
          <Link to="/generate-resume" className="link link-hover">Resume Builder</Link>
          <Link to="/job-match" className="link link-hover">ATS Score & Tailoring</Link>
          <Link to="/cover-letter" className="link link-hover">Cover Letter</Link>
          <Link to="/my-resumes" className="link link-hover">My Resumes</Link>
        </nav>
        <nav className="flex flex-col gap-2">
          <h4 className="footer-title">Company</h4>
          <Link to="/about" className="link link-hover">About Us</Link>
          <Link to="/services" className="link link-hover">Services</Link>
          <Link to="/contact" className="link link-hover">Contact</Link>
        </nav>
        <nav className="flex flex-col gap-2">
          <h4 className="footer-title">Legal</h4>
          <Link to="/privacy" className="link link-hover">Privacy Policy</Link>
          <Link to="/terms" className="link link-hover">Terms of Service</Link>
        </nav>
      </div>
      <div className="text-center text-sm py-4 border-t border-base-300 opacity-70">
        © {new Date().getFullYear()} AI Resume Maker. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
