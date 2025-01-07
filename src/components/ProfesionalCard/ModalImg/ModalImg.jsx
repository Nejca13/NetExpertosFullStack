import NextImage from 'next/image'
import styles from './ModalImg.module.css'
import { useEffect, useState } from 'react'

const ModalImg = ({ image, setShowModalImg }) => {
  const [width, setWidth] = useState(10)
  const [height, setHeigth] = useState(10)

  function escalarImagenParaAncho(
    anchoImagenOriginal,
    altoImagenOriginal,
    anchoPantallaDeseado
  ) {
    // Calcula el factor de escala
    var factorEscala = anchoPantallaDeseado / anchoImagenOriginal

    // Calcula el nuevo ancho y alto de la imagen
    var nuevoAncho = anchoImagenOriginal * factorEscala
    var nuevoAlto = altoImagenOriginal * factorEscala

    // Retorna un objeto con las nuevas dimensiones
    setHeigth(nuevoAlto)
    setWidth(nuevoAncho)

    return {
      ancho: nuevoAncho,
      alto: nuevoAlto,
    }
  }

  useEffect(() => {
    var imagen = new Image()
    imagen.src = image
    imagen.onload = function () {
      var ancho = this.naturalWidth
      var alto = this.naturalHeight
      escalarImagenParaAncho(ancho, alto, window.innerWidth - 20)
    }
  }, [])
  return (
    <div className={styles.container}>
      <NextImage
        src={image}
        width={width ? width : 100}
        height={height ? height : 100}
        onClick={() => setShowModalImg(false)}
        alt='Imagen de trabajo realizado'
        className={styles.image}
      />
    </div>
  )
}

export default ModalImg
