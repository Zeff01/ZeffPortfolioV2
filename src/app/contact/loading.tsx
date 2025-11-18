import React from "react";
import PuffLoader from "react-spinners/PuffLoader";

export default function ContactLoading() {
  return (
    <div className="min-h-screen bg-blackBackground flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <PuffLoader color="#F6AE2A" size={60} />
        <p className="text-textColor text-lg font-tech">Loading Contact...</p>
      </div>
    </div>
  );
}
