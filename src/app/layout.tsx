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
      <body>{children}</body>
    </html>
  )
}
