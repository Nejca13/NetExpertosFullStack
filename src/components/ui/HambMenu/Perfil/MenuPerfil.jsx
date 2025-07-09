'use client'
import Image from 'next/image'
import styles from './MenuPerfil.module.css'
import { useState } from 'react'
import rubros from '@/constants/rubros'
import profesionesPorRubro from '@/constants/profesionesPorRubro'
import { saveCompressedImageToLocalStorage } from '@/utils/minificadorDeImagenes'
import crossBlanca from '@/assets/images/cross-blanca.png'
import { parsearHorarios } from './parsearHorarios'
import { handleSubmit } from './FormUtils'
import CargarTrabajos from './CargarTrabajos/CargarTrabajos'
import { useRouter } from 'next/navigation'
import Pencil from '@/assets/icon/Pencil'
import Camera from '@/assets/icon/Camera'
import Verify from '@/assets/icon/Verify'
import UserIcon from '@/assets/icon/UserIcon'
import BriefcaseIcon from '@/assets/icon/BriefcaseIcon'
import ClockIcon from '@/assets/icon/ClockIcon'
import {
  InputPerfil,
  SelectPerfil,
  TextAreaPerfil,
} from '@/components/InputProfile/InputPerfil/InputPerfil'
import useStore from '@/store/store'

const MenuPerfil = ({ setMenuComponent, user }) => {
  const [newProfileImage, setNewProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [rubroSeleccionado, setRubroSeleccionado] = useState(user.rubro_nombre)
  const [editMode, setEditMode] = useState(false)
  const [cargarTrabajos, setCargarTrabajos] = useState(false)
  const { setCurrentUser, currentUser } = useStore()
  const router = useRouter()

  // Verifica si el profesional esta verificado por ahora hasta que tenga lo tenga el backend
  const [verify, setVerify] = useState(true)

  const handleChangeImage = async (files) => {
    const file = files[0]
    await saveCompressedImageToLocalStorage(
      file,
      (compressedImageBase64, compressedImage) => {
        setNewProfileImage(compressedImage)
        setImagePreview(compressedImageBase64)
        console.log(compressedImage)
      }
    )
  }

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
            <Pencil color='#b2b2b2' width='25px' height='25px' />
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
        className={styles.form}
        onSubmit={async (e) =>
          await handleSubmit(
            e,
            user,
            newProfileImage,
            setCurrentUser,
            currentUser
          ).then((res) => {
            if (res.success) {
              setMenuComponent(null)
            }
          })
        }
      >
        <fieldset className={styles.fieldset} disabled={!editMode}>
          <div className={styles.containerFile}>
            <label htmlFor='foto_perfil'>
              <Image
                src={imagePreview ? imagePreview : user.foto_perfil}
                width={130}
                height={130}
                className={[editMode ? styles.image : styles.imageDisabled]}
                style={
                  verify
                    ? { border: '5px solid #319bff' }
                    : { border: '5px solid rgb(211, 211, 211)' }
                }
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
              {!editMode && (
                <i className={styles.icon}>
                  <Verify
                    width='30px'
                    height='30px'
                    color={verify ? '#319bff' : 'rgb(211, 211, 211)'}
                  />
                </i>
              )}
            </label>
          </div>
          <div className={styles.containerInputs}>
            {user.rol === 'Profesional' && (
              <div className={styles.input_group}>
                <span>
                  <UserIcon color='#319bff' size='20px' />
                  Información personal
                </span>
                <InputPerfil
                  defaultValue={`${user.nombre} ${user.apellido}`}
                  label={'Nombre y apellido'}
                  id={'nombre_apellido'}
                  name={'nombre_apellido'}
                  type={'text'}
                />
                <InputPerfil
                  defaultValue={user.nacimiento}
                  label={'Fecha de nacimiento'}
                  id={'nacimiento'}
                  name={'nacimiento'}
                  type={'date'}
                />
                <TextAreaPerfil
                  defaultValue={user.acerca_de_mi}
                  id={'acerca_de_mi'}
                  label={'Acerca de mí'}
                  name={'acerca_de_mi'}
                  type={'text'}
                />
              </div>
            )}

            {user.rol === 'Profesional' && (
              <div className={styles.input_group}>
                <span>
                  <BriefcaseIcon color='rgb(22 163 74)' size='20px' />
                  Información profesional
                </span>
                <SelectPerfil
                  data={rubros}
                  id={'rubro_nombre'}
                  name={'rubro_nombre'}
                  text={'Rubro'}
                  defaultValue={user.rubro_nombre}
                  func={(e) => setRubroSeleccionado(e.target.value)}
                />
                {rubroSeleccionado && (
                  <SelectPerfil
                    data={profesionesPorRubro[rubroSeleccionado]}
                    defaultValue={user.profesion_nombre}
                    id={'profesion'}
                    name={'profesion_nombre'}
                    text={'Profesión'}
                  />
                )}
              </div>
            )}
            {user.rol === 'Profesional' && (
              <div className={styles.input_group}>
                <span>
                  <ClockIcon color='rgb(147 51 234)' size='20px' />
                  Horarios de trabajo
                </span>
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
          </div>
        </fieldset>
        <div className={styles.containerButtons}>
          {editMode && (
            <div className={styles.button_save_cancel}>
              <button type='submit' style={{ background: '#319bff' }}>
                Guardar cambios
              </button>
              <button
                style={{ background: 'var(--color-danger)' }}
                type='button'
                onClick={(e) => {
                  e.preventDefault()
                  setEditMode(!editMode)
                }}
              >
                Cancelar
              </button>
            </div>
          )}
          <button
            className={styles.cargarTrabajos}
            type='button'
            onClick={(e) => {
              e.preventDefault()
              router.push('/profile/profesional/charge-works')
            }}
          >
            Cargar trabajos
          </button>

          {cargarTrabajos ? (
            <CargarTrabajos setCargarTrabajos={setCargarTrabajos} user={user} />
          ) : null}
        </div>
      </form>
    </div>
  )
}

export default MenuPerfil
