import React from "react";

export default function Burnouts({ user, userProfile }) {
  const categories = ["Arms", "Legs", "Core", "Full Body"];

  return (
    <div>
      {/* Burnouts Mode - Ready for custom implementation */}
      {categories.map((category) => (
        <div key={category}>
          {category}
        </div>
      ))}
    </div>
  );
}
