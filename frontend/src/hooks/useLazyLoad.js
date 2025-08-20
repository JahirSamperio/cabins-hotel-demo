import { useInView } from 'react-intersection-observer'

export const useLazyLoad = (options = {}) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    ...options
  })

  return { ref, inView }
}