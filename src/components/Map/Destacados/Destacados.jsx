import styles from './Destacados.module.css'
import { usuariosPremium } from '@/constants/usuariosPremium'
import InfiniteLooper from '@/components/InfinityLooper/InfinityLooper'
import DestacadosCard from './Card/DestacadosCard'

const Destacados = ({ setIsShowPopup }) => {
  return (
    <div className={styles.destacados}>
      <p className={styles.title}>
        Expertos <span className={styles.span}>plus!</span>
      </p>
      <ul className={styles.destacadosUl}>
        <InfiniteLooper speed={60} direction='left'>
          {usuariosPremium.map((item, index) => (
            <DestacadosCard
              key={index}
              item={item}
              index={index}
              setIsShowPopup={setIsShowPopup}
            />
          ))}
        </InfiniteLooper>
      </ul>
    </div>
  )
}

export default Destacados
