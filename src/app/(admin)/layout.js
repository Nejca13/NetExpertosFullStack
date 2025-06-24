import { Provider } from '@/components/ChakraUi/provider'

export const metadata = {
  title: 'NetExpertos - Dashboard',
  description: 'Dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang='es' suppressHydrationWarning>
      <body className='chakra-scope'>
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}
