import React from "react";
import { Link } from "react-router-dom";

const MAROON = "#5b0a30";

// Shown for any URL that has no page yet (menu placeholders, mistyped links).
export default function ComingSoon() {
  return (
    <div className="min-h-[60vh] px-4 py-20 text-center" style={{ background: "#f4f3f1" }}>
      <h1 className="text-3xl text-gray-900" style={{ fontFamily: "Georgia, serif" }}>
        This page is not ready yet
      </h1>
      <p className="mx-auto mt-3 max-w-md text-gray-600">
        We are still building this section. Please check back soon, or head back to the home page.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-block px-6 py-2.5 font-semibold text-white"
        style={{ background: MAROON }}
      >
        Go to home
      </Link>
    </div>
  );
}
