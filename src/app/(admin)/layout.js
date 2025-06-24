import { Provider } from '@/components/ChakraUi/provider'

export const metadata = {
  title: 'NetExpertos - Dashboard',
  description: 'Dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning className='chakra-scope'>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}
