"use client";
import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);

  const upload = async () => {
    const form = new FormData();
    if (file) form.append("file", file);

    await fetch("http://localhost:8000/api/admin/upload", {
      method: "POST",
      body: form,
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-2">Upload Data</h1>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button onClick={upload} className="block mt-2 bg-black text-white px-4 py-2">
        Upload
      </button>
    </div>
  );
}
