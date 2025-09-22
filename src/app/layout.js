import "./globals.css";

export const metadata = {
  title: "Shanthi Gears",
  description: "Admin Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
