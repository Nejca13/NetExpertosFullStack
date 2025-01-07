'use client'
import Container from '@/components/Containers/Container'
import { useParams, useRouter } from 'next/navigation'
import { usuariosPremium } from '@/constants/usuariosPremium'
import { useState } from 'react'
import NavBar from '@/components/Navbar/NavBar'

const API_URL = '/api/profesionales/buscar'

const Page = () => {
  const [show, setShow] = useState(false)
  const router = useRouter()
  const { correo } = useParams()
  const data = usuariosPremium.filter(
    (user) => user.correo === decodeURIComponent(correo)
  )
  return (
    <Container>
      <NavBar onClick={() => router.back()} />
    </Container>
  )
}

export default Page
