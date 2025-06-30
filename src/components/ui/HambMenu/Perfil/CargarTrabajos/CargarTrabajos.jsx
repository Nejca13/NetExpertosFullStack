// FRONTEND - CargarTrabajos.js
'use client'
import MultiImageForm from '@/components/MultiImageForm/MultiImageForm'
import styles from './CargarTrabajos.module.css'
import NavBar from '@/components/Navbar/NavBar'
import ButtonSubmit from '@/components/Buttons/ButtonSubmit/ButtonSubmit'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import FormContainer from '@/components/Containers/FormContainer'
import ImagenPlus from '@/assets/images/SignoMas.png'
import Eliminar from '@/assets/images/Eliminar.png'
import Image from 'next/image'
import useStore from '@/store/store'
import { getProfessionalById } from '@/services/api/profesionales'

const CargarTrabajos = () => {
  const { currentUser, setCurrentUser } = useStore()
  const router = useRouter()
  const [firstLoad, setFirstLoad] = useState(true)

  const [trabajos, setTrabajos] = useState([])

  const reloadUser = async () => {
    getProfessionalById(currentUser.user_data._id).then((data) => {
      console.log('Profesional cargado:', data)
      const newCurrentUser = {
        token: currentUser.token,
        user_data: data,
      }
      setCurrentUser(newCurrentUser)
      setTrabajos(
        data.fotos_trabajos?.length > 0
          ? data.fotos_trabajos.map((t) => ({
              ...t,
              eliminar: false,
            }))
          : [{}]
      )
      setFirstLoad(false)
    })
  }

  useEffect(() => {
    console.log(currentUser?.user_data)
    if (currentUser && firstLoad) {
      reloadUser()
    }
  }, [currentUser])

  const agregarTrabajo = () => {
    if (trabajos.length >= 6) return console.log('Máximo 6 trabajos')
    setTrabajos([...trabajos, {}])
  }

  const eliminarTrabajo = (index) => {
    const nuevos = [...trabajos]
    nuevos.splice(index, 1)
    setTrabajos(nuevos)
  }

  const toggleEliminar = (index) => {
    const nuevos = [...trabajos]
    nuevos[index].eliminar = !nuevos[index].eliminar
    setTrabajos(nuevos)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const metaArray = []
    const fotos_a_eliminar = []

    trabajos.forEach((t, index) => {
      const titulo = formData.get(`trabajos_realizados_titulo_${index}`)
      const lugar = formData.get(`trabajos_realizados_lugar_${index}`)
      const fecha = formData.get(`trabajos_realizados_fecha_${index}`)
      const file = formData.get(`trabajos_realizados_foto_${index}`)

      if (t.eliminar && t.foto) {
        fotos_a_eliminar.push(t.foto)
        return // skip
      }

      if (file && file.size > 0) {
        formData.append('fotos_trabajos', file)
        metaArray.push({ titulo, lugar, fecha })
      } else if (t.foto) {
        metaArray.push({ titulo, lugar, fecha, foto: t.foto })
      }

      formData.delete(`trabajos_realizados_titulo_${index}`)
      formData.delete(`trabajos_realizados_lugar_${index}`)
      formData.delete(`trabajos_realizados_fecha_${index}`)
      formData.delete(`trabajos_realizados_foto_${index}`)
    })

    formData.append('correo', currentUser?.user_data?.correo)
    formData.append('fotos_trabajos_meta', JSON.stringify(metaArray))
    formData.append(
      'fotos_trabajos_a_eliminar',
      JSON.stringify(fotos_a_eliminar)
    )

    try {
      const res = await fetch('/api/profesionales', {
        method: 'PUT',
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        console.log('Trabajos actualizados correctamente')
        console.log('Trabajos actualizados:', data)
        reloadUser()
      } else {
        console.log(data.detail || 'Error al actualizar')
      }
    } catch (err) {
      console.error(err)
      console.log('Error en la solicitud')
    }
  }

  return (
    <div className={styles.container}>
      <NavBar onClick={() => router.back()} />
      <div className={styles.form}>
        <FormContainer onSubmit={handleSubmit}>
          <p className={styles.title}>Carga fotos de tus últimos trabajos</p>
          <div className={styles.carrusel}>
            {trabajos.map((item, index) => (
              <div key={index} className={styles.itemWrap}>
                <MultiImageForm index={index} trabajos={trabajos} />
                {item.foto && (
                  <label>
                    <input
                      type='checkbox'
                      checked={item.eliminar || false}
                      onChange={() => toggleEliminar(index)}
                    />
                    Marcar para eliminar
                  </label>
                )}
                {trabajos.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      eliminarTrabajo(index)
                    }}
                  >
                    Eliminar entrada
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className={styles.botonesMasMenos}>
            <button
              onClick={(e) => {
                e.preventDefault()
                agregarTrabajo()
              }}
            >
              <Image src={ImagenPlus} width={25} height={25} alt='Agregar' />
            </button>
          </div>
          <ButtonSubmit text='Guardar cambios' />
        </FormContainer>
      </div>
    </div>
  )
}

export default CargarTrabajos
