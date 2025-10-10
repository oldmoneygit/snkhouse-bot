export const metadata = {
  title: 'SNKHOUSE WhatsApp Service',
  description: 'WhatsApp Business Cloud API Integration',
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
