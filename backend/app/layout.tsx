import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SaaS Platform API",
  description: "REST API for the Mini SaaS Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
