import dynamic from 'next/dynamic'

const IsAuth = dynamic(() => import('./IsAuth'), {
  ssr: false,
})

export default IsAuth
