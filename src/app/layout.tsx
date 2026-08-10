import "./globals.css"; // <-- ESTO ES LO QUE "ENCIENDE" EL DISEÑO
export const metadata = {
  title: 'ImportFlow',
  description: 'Calculadora de Importaciones',
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
      </head>
      <body>{children}</body>
    </html>
  )
}
