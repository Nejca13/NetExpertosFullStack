'use client'
import styles from './ConvertiteEnExperto.module.css'
import NavBar from '@/components/Navbar/NavBar'
import { useEffect, useState } from 'react'
import SeccionPerfil from '@/components/FormComponents/SeccionPerfil'
import ModalForm from '@/components/ui/Modals/ModalForm/ModalForm'
import SeccionTrabajos from '@/components/FormComponents/SeccionTrabajos'
import separarDatos from '@/utils/separarDatosForm'
import TerminosYCondiciones from '@/components/TerminosYCondiciones/TerminosYCondiciones'
import ModalError from '@/components/ui/Modals/ModalError/ModalError'
import ModalLoading from '@/components/ui/Modals/ModalLoading/ModalLoading'
import { useParams, useRouter } from 'next/navigation'
import SeccionDatosIndependiente from './Formulario/ProfesionalesIndependientes/SeccionDatosIndependiente'
import { converToProfesional } from '@/services/api/clientes'
import Empresas from './Formulario/Empresas/Empresas'
import LogoNetExpertos from '../../Logo/LogoNetExpertos'
import { clearUsers, getUser } from '@/utils/indexedDataBase'
import useStore from '@/store/store'

/**
 * Componente ConvertiteEnExperto
 * Este componente gestiona el proceso de conversión de un usuario en un profesional,
 * mostrando diferentes secciones del formulario y manejando la lógica de envío de datos.
 *
 * @param {Object} props - Las propiedades del componente.
 * @param {Object} props.user - Los datos del usuario actual.
 * @param {Function} props.setMenuComponent - Función para establecer el componente del menú.
 */
const ConvertiteEnExperto = ({ user, setMenuComponent }) => {
  const [formSection, setFormSection] = useState(0) // Sección actual del formulario
  const [formDataValues, setFormDataValues] = useState(user) // Valores del formulario
  const [accountType, setAccountType] = useState(null) // Tipo de cuenta seleccionado (empresa o independiente)
  const [errorMessage, setErrorMessage] = useState(null) // Mensaje de error
  const [isLoading, setIsLoading] = useState(false) // Estado de carga
  const { _id } = useParams()
  const [activeUser, setActiveUser] = useState(null)

  const router = useRouter()

  //Zustand store
  const { currentUser, setCurrentUser } = useStore()

  useEffect(() => {
    // IndexDB <--- BORRAR DESPUES
    getUser(_id).then(
      (response) => {
        setActiveUser(response)
        console.log(response)
      },
      (error) => {
        console.log(error)
      }
    )
    // Zustand
    if (currentUser) {
      setActiveUser(currentUser)
    }
  }, [_id])

  /**
   * Maneja la presentación del formulario, separa los datos y convierte la imagen de trabajos realizados a base64 si es necesario.
   * @param {Event} e - El evento de presentación del formulario.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = Object.fromEntries(new FormData(e.target))
    const jobs = separarDatos(formData)

    if (jobs.foto_perfil instanceof File) {
      const reader = new FileReader()
      reader.onload = () => {
        jobs.foto_perfil = reader.result
        setFormDataValues((prevValues) => ({ ...prevValues, ...jobs }))
      }
      reader.readAsDataURL(jobs.foto_perfil)
    } else {
      setFormDataValues((prevValues) => ({ ...prevValues, ...jobs }))
    }
  }

  /**
   * Avanza a la siguiente sección del formulario.
   * @param {Event} e - El evento de clic.
   */
  const handleNext = async (e) => {
    e.preventDefault()
    await handleSubmit(e)
    setFormSection((prevSection) => prevSection + 1)
  }

  /**
   * Retrocede a la sección anterior del formulario.
   * @param {Event} e - El evento de clic.
   */
  const handleBack = (e) => {
    e.preventDefault()
    setFormSection((prevSection) => prevSection - 1)
  }

  /**
   * Maneja la conversión del usuario a profesional, llamando a la API correspondiente.
   */
  const handleConvertToProfesional = async () => {
    // setIsLoading(true)
    // Convertir formDataValues a formdata
    const formData = new FormData()
    for (const key in formDataValues) {
      formData.append(key, formDataValues[key])
    }
    console.log(formData)
    formData.append('rol', 'Profesional')
    formData.append('numero', formDataValues.telefono)
    formData.append(
      'horarios_atencion',
      `${formDataValues.horario_apertura} - a ${formDataValues.horario_cierre}`
    )
    const fotosMeta = formDataValues.fotos_trabajos.map((item) => ({
      titulo: item.titulo,
      lugar: item.lugar,
      fecha: item.fecha,
    }))

    formData.append('fotos_trabajos_meta', JSON.stringify(fotosMeta))
    formData.delete('fotos_trabajos')
    formDataValues.fotos_trabajos.map((item) => {
      formData.append('fotos_trabajos', item.foto)
    })
    try {
      const res = await converToProfesional(
        formData,
        setIsLoading,
        setErrorMessage,
        setCurrentUser
      )
      if (res === true) {
        console.log(res)
        setIsLoading(false)
        // logout y borrar datos del usuario
        localStorage.removeItem('user')
        await clearUsers()
        router.push('/')
      } else {
        setIsLoading(false) // Asegúrate de que el loading se detenga si no hay recarga
      }
    } catch (error) {
      console.log(error)
      setErrorMessage('Ocurrió un error al convertir a profesional')
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <NavBar
        onClick={() => {
          formSection === 0
            ? setMenuComponent(null)
            : setFormSection((prevSection) => prevSection - 1)
        }}
      />
      <LogoNetExpertos width={200} />
      {(() => {
        switch (formSection) {
          case 0:
            return (
              <ModalForm
                setAccountType={setAccountType}
                setFormSection={setFormSection}
                formSection={formSection}
              />
            )
          case 1:
            return accountType === 'empresa' ? (
              <Empresas
                defaultProfilePhoto={user.foto_perfil}
                onNext={handleNext}
                onBack={handleBack}
              />
            ) : (
              <SeccionDatosIndependiente
                onNext={handleNext}
                onBack={handleBack}
              />
            )
          case 2:
            return (
              <SeccionPerfil
                activeUser={activeUser}
                onNext={handleNext}
                onBack={handleBack}
              />
            )
          case 3:
            return <SeccionTrabajos onNext={handleNext} onBack={handleBack} />
          case 4:
            return <TerminosYCondiciones onClick={handleConvertToProfesional} />
          default:
            return null
        }
      })()}

      {errorMessage && (
        <ModalError
          errorMessage={errorMessage}
          setShowModalError={setErrorMessage}
        />
      )}

      {isLoading && (
        <ModalLoading
          message={'Creando profesional, enviando código de verificación'}
        />
      )}
    </div>
  )
}

export default ConvertiteEnExperto
