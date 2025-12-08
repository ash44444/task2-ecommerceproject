// src/pages/About.jsx
import { companyInfo } from "../api/data";

export default function About() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-3">About Us</h2>
      <p className="text-gray-700">{companyInfo.about}</p>
    </div>
  );
}
