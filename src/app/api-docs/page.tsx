"use client";

import { useEffect, useState } from "react";
import FlowHeader from "@/frontend/components/FlowHeader";

export default function ApiDocsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Dynamically load Swagger UI CSS and JS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js";
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      window.ui = window.SwaggerUIBundle({
        url: "/api/swagger-spec",
        dom_id: "#swagger-ui",
        deepLinking: true,
        presets: [
          // @ts-ignore
          window.SwaggerUIBundle.presets.apis,
          // @ts-ignore
          window.SwaggerUIStandalonePreset
        ],
        plugins: [
          // @ts-ignore
          window.SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "BaseLayout",
        docExpansion: "list",
        defaultModelsExpandDepth: -1,
      });
    };
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black">
        <FlowHeader title="API Documentation" />
      </div>
      <main className="pt-[100px] w-full max-w-7xl mx-auto pb-20">
        <div id="swagger-ui" />
      </main>
    </div>
  );
}
