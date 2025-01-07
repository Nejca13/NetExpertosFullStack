import MultiImageForm from '@/components/MultiImageForm/MultiImageForm'
import styles from './CargarTrabajos.module.css'
import NavBar from '@/components/Navbar/NavBar'
import ButtonSubmit from '@/components/Buttons/ButtonSubmit/ButtonSubmit'
import { useRouter } from 'next/navigation'

const CargarTrabajos = ({ user, setCargarTrabajos }) => {
  const { fotos_trabajos } = user
  const router = useRouter()

  return (
    <div className={styles.container}>
      <NavBar onClick={() => router.back()} />
      <div className={styles.form}>
        <MultiImageForm trabajos={fotos_trabajos} />
        <ButtonSubmit />
      </div>
    </div>
  )
}

export default CargarTrabajos
