import styles from './InputPerfil.module.css'

export const InputPerfil = ({ label, name, id, type, defaultValue }) => {
  return (
    <div className={styles.containerInputs}>
      <label className={styles.formLabel} htmlFor={id}>
        {label}
        <input
          className={styles.input}
          type={type}
          name={name}
          id={id}
          defaultValue={defaultValue}
        />
      </label>
    </div>
  )
}

export const SelectPerfil = ({ text, data, id, name, func, defaultValue }) => {
  return (
    <div className={styles.containerInputs}>
      <label htmlFor={id} className={styles.formLabel}>
        {text ? text : <p></p>}
        <select
          id={id}
          name={name}
          className={styles.select}
          onChange={func}
          defaultValue={defaultValue}
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

export const TextAreaPerfil = ({ label, name, id, type, defaultValue }) => {
  return (
    <div className={styles.containerInputs}>
      <label className={styles.formLabel} htmlFor={id}>
        {label}
        <textarea
          className={styles.textarea}
          type={type}
          name={name}
          id={id}
          defaultValue={defaultValue}
        />
      </label>
    </div>
  )
}
