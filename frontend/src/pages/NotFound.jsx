import React from "react";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="hero min-h-[60vh]">
      <div className="hero-content text-center">
        <div>
          <p className="text-7xl font-extrabold text-primary">404</p>
          <p className="text-xl my-4">This page doesn't exist.</p>
          <Link to="/" className="btn btn-primary">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
