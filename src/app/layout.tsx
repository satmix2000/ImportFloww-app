import "./globals.css";

export const metadata = {
  title: 'ImportFlow - Calculadora de Importaciones',
  description: 'Simula aranceles, flete, impuestos y margen de venta en Mercado Libre. Herramienta profesional con asistente IA.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className="bg-slate-950">{children}</body>
    </html>
  )
}
