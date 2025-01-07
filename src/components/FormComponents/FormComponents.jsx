'use client'

import { useState } from 'react'
import styles from './FormComponents.module.css'
import Image from 'next/image'
import openEye from '@/assets/images/openEye.svg'
import closeEye from '@/assets/images/closeEye.svg'

export const Inputs = ({
  type,
  name,
  id,
  text,
  placeholder,
  value,
  errorMessage,
  minLength,
  readOnly,
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [isType, setIsType] = useState(type)
  let pattern = null

  if (type === 'email') {
    pattern = '^[^@]+@[^@]+.[a-zA-Z]{2,}$'
  }
  if (type === 'password') {
    pattern =
      '^(?=.*\\d)(?=.*[\\u0021-\\u002b\\u003c-\\u0040])(?=.*[A-Z])(?=.*[a-z])\\S{8,16}$'
  }
  if (type === 'tel') {
    pattern = '[0-9]+'
  }

  const togglePasswordVisibility = (e) => {
    e.preventDefault()
    setPasswordVisible(!passwordVisible)
    if (isType === 'password') {
      setIsType('text')
    }
    if (isType === 'text') {
      setIsType('password')
    }
  }

  return (
    <div
      className={styles.inputs}
      style={type === 'hidden' ? { display: 'none' } : {}}
    >
      <label htmlFor={id} className={styles.label}>
        {text ? text : <p></p>}
        <input
          className={styles.input}
          type={type === 'password' ? isType : type}
          id={id}
          name={name}
          placeholder={placeholder ? placeholder : null}
          defaultValue={value ? value : null}
          pattern={pattern}
          required
          onInvalid={(e) => {
            e.target.setCustomValidity(errorMessage)
          }}
          minLength={minLength ? minLength : null}
          maxLength={32}
          onInput={(e) => e.target.setCustomValidity('')}
          readOnly={readOnly && readOnly}
        />
      </label>
      {type === 'password' && (
        <button
          className={styles.revelarPassword}
          onClick={(e) => {
            togglePasswordVisibility(e)
          }}
        >
          {passwordVisible ? (
            <Image
              alt='icono de un ojo, mostrar o no mostrar contraseña'
              src={openEye}
              height={20}
            />
          ) : (
            <Image
              alt='icono de un ojo, mostrar o no mostrar contraseña'
              src={closeEye}
              height={20}
            />
          )}
        </button>
      )}
    </div>
  )
}

export const TextArea = ({ name, id, text, placeholder, value }) => {
  return (
    <div className={styles.inputs}>
      <label htmlFor={id} className={styles.label}>
        {text ? text : <p></p>}
        <textarea
          className={styles.textarea}
          name={name}
          id={id}
          cols='30'
          rows='5'
          required
          maxLength={200}
          placeholder={placeholder}
        ></textarea>
      </label>
    </div>
  )
}

export const Select = ({ text, data, id, name, func }) => {
  return (
    <div className={styles.inputs}>
      <label htmlFor={id} className={styles.label}>
        {text ? text : <p></p>}
        <select
          id={id}
          name={name}
          className={styles.select}
          onChange={func}
          defaultValue={() => document.getElementsByName(name)[0]}
        >
          {data.map((item, index) => (
            <option key={index} value={item} className={styles.option}>
              {item}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

export const InputTypeFile = ({
  handleFileChange,
  text,
  multiple,
  name,
  id,
}) => {
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  return (
    <>
      <label htmlFor={id} className={styles.inputFileLabel}>
        {text}
        <input
          className={styles.inputFile}
          type='file'
          accept='image/*'
          onChange={handleFileChange}
          name={name}
          id={id}
          required
          multiple={multiple}
          onInvalid={(e) => {
            setError(true)
            setErrorMessage(e.target.validationMessage)
          }}
          onInput={(e) => setError(false)}
        />
      </label>

      {error ? <p className={styles.errorMessage}>{errorMessage}</p> : <p></p>}
    </>
  )
}
