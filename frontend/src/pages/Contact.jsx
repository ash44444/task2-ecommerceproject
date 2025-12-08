// src/pages/Contact.jsx
import { contactInfo } from "../api/data";

export default function Contact() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Contact</h2>
      <p className="mb-1">
        <span className="font-semibold">Email:</span> {contactInfo.email}
      </p>
      <p className="mb-1">
        <span className="font-semibold">Phone:</span> {contactInfo.phone}
      </p>
      <p>
        <span className="font-semibold">Address:</span> {contactInfo.address}
      </p>
    </div>
  );
}
