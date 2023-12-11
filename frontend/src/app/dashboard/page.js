"use client";

import Navbar from "../../components/Navbar";
import CreatedGPTs from "../../components/CreatedGPTs";
import React from "react";

const Dashboard = () => {
  return (
    <div>
      <Navbar />
      <CreatedGPTs />
    </div>
  );
};

export default Dashboard;
