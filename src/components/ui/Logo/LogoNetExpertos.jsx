import Image from 'next/image'
import NetExpertosLOGO from '../../../assets/images/NetExpertosLOGO.png'

const LogoNetExpertos = ({ width, height }) => {
  return (
    <Image
      src={NetExpertosLOGO}
      priority={true}
      width={width}
      height={height}
      alt='NetExpertos Logo'
    />
  )
}

export default LogoNetExpertos
