export const metadata = {
  title: "Mi Wara",
  description: "Cuenta corriente y comisiones — proveedores y clientes",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mi Wara",
  },
};

export const viewport = {
  themeColor: "#2E9E5B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
