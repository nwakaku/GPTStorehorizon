import './globals.css'
import { Inter } from 'next/font/google'
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from './Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'GPT Store ',
  description: 'Built with love at chainlink constellation 2023',
}

function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

export default RootLayout;