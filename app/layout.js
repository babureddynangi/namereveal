import './globals.css'

export const metadata = {
  title: 'A Special Reveal',
  description: 'A name reveal for our beloved daughter',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
