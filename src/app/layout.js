import "./globals.css";
import Providers from "./providers";
export const metadata = {
  title: "Shanthi Gears",
  description: "Admin Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-50 text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
