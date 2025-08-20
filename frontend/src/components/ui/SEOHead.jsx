import { useSEO } from '../../hooks/useSEO'

const SEOHead = ({ 
  title = 'Cabañas Huasca - Pueblo Mágico | Descanso en la Naturaleza México',
  description = 'Renta de cabañas en Huasca de Ocampo, pueblo mágico de México. Descanso, naturaleza y turismo familiar. Reserva tu cabaña ahora.',
  keywords = 'cabañas, pueblo mágico, descanso, naturaleza, turismo México, Huasca, hospedaje, vacaciones',
  ogImage = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200',
  canonical = 'https://cabanashuasca.com'
}) => {
  useSEO({ title, description, keywords, ogImage, canonical })
  return null
}

export default SEOHead