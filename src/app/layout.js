import { WebSocketProvider } from './WebSocketContext'
import './globals.css'
import { ProfesionalCardProvider } from './profesionalCardContext'
import { AuthProvider } from './userContext'

export const metadata = {
  title: 'NetExpertos',
  description: 'Descripción',
}

export default function RootLayout({ children }) {
  return (
    <html lang='es'>
      <body>
        <AuthProvider>
          <WebSocketProvider>
            <ProfesionalCardProvider>{children}</ProfesionalCardProvider>
          </WebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
