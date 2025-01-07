'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/userContext'

const ButtonSignInWithGoogle = () => {
  const [auth, setAuth] = useAuth()
  const router = useRouter()
  useEffect(() => {
    '4e7921ab61fa598a'
    window.handleCredentialResponse = (response) => {
      const responsePayload = jwtDecode(response.credential)
      if (responsePayload.sub) {
        setAuth(responsePayload)
        router.push('/GoogleAuth')
      }
    }
  }, [])

  return (
    <>
      <Script src='https://accounts.google.com/gsi/client' async defer />
      <div
        id='g_id_onload'
        data-client_id='738129296063-ieoasm43scmsgin6lrh1462l9r6631rb.apps.googleusercontent.com'
        data-context='signup'
        data-ux_mode='popup'
        data-callback='handleCredentialResponse'
        /* data-auto_select='true' */
        data-itp_support='true'
      ></div>
      <div
        className='g_id_signin'
        data-type='standard'
        data-shape='pill'
        data-theme='outline'
        data-text='signin_with'
        data-size='large'
        data-locale='es'
        data-logo_alignment='left'
      ></div>
    </>
  )
}

export default ButtonSignInWithGoogle
