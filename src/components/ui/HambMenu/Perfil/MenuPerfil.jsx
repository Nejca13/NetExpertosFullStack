import Image from 'next/image'
import styles from './MenuPerfil.module.css'
import { useState } from 'react'
import {
  InputPerfil,
  SelectPerfil,
  TextAreaPerfil,
} from './InputPerfil/InputPerfil'
import rubros from '@/constants/rubros'
import profesionesPorRubro from '@/constants/profesionesPorRubro'
import { saveCompressedImageToLocalStorage } from '@/utils/minificadorDeImagenes'
import Button from '@/components/Buttons/Button/Button'
import ButtonSubmit from '@/components/Buttons/ButtonSubmit/ButtonSubmit'
import crossBlanca from '@/assets/images/cross-blanca.png'
import { parsearHorarios } from './parsearHorarios'
import { handleSubmit } from './FormUtils'
import CargarTrabajos from './CargarTrabajos/CargarTrabajos'
import { useRouter } from 'next/navigation'
import Pencil from '@/assets/icon/Pencil'
import Camera from '@/assets/icon/Camera'

const MenuPerfil = ({ setMenuComponent, user }) => {
  const [newProfileImage, setNewProfileImage] = useState(null)
  const [rubroSeleccionado, setRubroSeleccionado] = useState(user.rubro_nombre)
  const [editMode, setEditMode] = useState(false)
  const [cargarTrabajos, setCargarTrabajos] = useState(false)
  const router = useRouter()

  const handleChangeImage = (files) => {
    const file = files[0]
    saveCompressedImageToLocalStorage(file, (compressedImage) => {
      setNewProfileImage(compressedImage)
    })
  }

  console.log(user)

  return (
    <div className={styles.container}>
      <div className={styles.edit_and_close_button}>
        <button
          className={styles.edit_button}
          onClick={(e) => {
            e.preventDefault()
            setEditMode(!editMode)
          }}
        >
          {editMode ? (
            'Cancelar'
          ) : (
            <Pencil color='#b2b2b2' width='28px' height='28px' />
          )}
        </button>
        <span>Editar perfil</span>
        <button
          className={styles.botonCerrar}
          onClick={() => setMenuComponent(null)}
        >
          <Image
            src={crossBlanca}
            width={18}
            height={18}
            alt='boton de cerrar'
          />
        </button>
      </div>
      <form
        disabled
        className={styles.form}
        onSubmit={(e) => handleSubmit(e, user, newProfileImage)}
      >
        <fieldset className={styles.fieldset} disabled={!editMode}>
          <div className={styles.containerFile}>
            <label htmlFor='foto_perfil'>
              <Image
                src={
                  newProfileImage
                    ? newProfileImage
                    : user.rol === 'Profesional'
                    ? user.foto_perfil
                    : user.foto_perfil
                }
                width={130}
                height={130}
                className={[editMode ? styles.image : styles.imageDisabled]}
                alt='Foto de perfil'
              />
              <input
                type='file'
                name='foto_perfil'
                id='foto_perfil'
                accept='image/*'
                onChange={(e) => handleChangeImage(e.target.files)}
                hidden
              />
              {editMode && (
                <div className={styles.icon_camera}>
                  <i>
                    <Camera color='black' width='20px' height='20px' />
                  </i>
                </div>
              )}
            </label>
          </div>
          <div className={styles.containerInputs}>
            <InputPerfil
              defaultValue={`${user.nombre} ${user.apellido}`}
              label={'Nombre'}
              id={'nombre_apellido'}
              name={'nombre_apellido'}
              type={'text'}
            />
            {user.rol === 'Profesional' && (
              <InputPerfil
                defaultValue={user.nacimiento}
                label={'Fecha de nacimiento'}
                id={'nacimiento'}
                name={'nacimiento'}
                type={'date'}
              />
            )}

            {user.rol === 'Profesional' && (
              <SelectPerfil
                data={rubros}
                id={'rubro_nombre'}
                name={'rubro_nombre'}
                text={'Rubro'}
                defaultValue={user.rubro_nombre}
                func={(e) => setRubroSeleccionado(e.target.value)}
              />
            )}
            {rubroSeleccionado && (
              <SelectPerfil
                data={profesionesPorRubro[rubroSeleccionado]}
                defaultValue={user.profesion_nombre}
                id={'profesion'}
                name={'profesion_nombre'}
                text={'Profesión'}
              />
            )}
            {user.rol === 'Profesional' && (
              <div className={styles.divHorariosDeAtencion}>
                <InputPerfil
                  type={'time'}
                  label={'Horario apertura'}
                  defaultValue={`${parsearHorarios(user.horarios_atencion)[0]}`}
                  id={'horarios_apertura'}
                  name={'horarios_apertura'}
                />
                <InputPerfil
                  type={'time'}
                  label={'Horario cierre'}
                  defaultValue={`${parsearHorarios(user.horarios_atencion)[1]}`}
                  id={'horarios_cierre'}
                  name={'horarios_cierre'}
                />
              </div>
            )}
            {user.rol === 'Profesional' && (
              <TextAreaPerfil
                defaultValue={user.acerca_de_mi}
                id={'acerca_de_mi'}
                label={'Acerca de mí'}
                name={'acerca_de_mi'}
                type={'text'}
              />
            )}
          </div>
        </fieldset>
        <div className={styles.containerButtons}>
          {editMode ? (
            <ButtonSubmit
              backgroundColor={'white'}
              textColor={'var(--color-gris-medio)'}
              text={'Guardar cambios'}
            />
          ) : (
            <Button
              backgroundColor={'var(--color-amarillo)'}
              textColor={'var(--color-gris-medio)'}
              text={'Cargar trabajos'}
              func={(e) => {
                e.preventDefault()
                router.push('/profile/profesional/charge-works')
              }}
            />
          )}

          {cargarTrabajos ? (
            <CargarTrabajos setCargarTrabajos={setCargarTrabajos} user={user} />
          ) : null}
        </div>
      </form>
    </div>
  )
}

export default MenuPerfil
