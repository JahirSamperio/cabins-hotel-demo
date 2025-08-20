import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import LazyImage from '../ui/LazyImage'
import { useLazyLoad } from '../../hooks/useLazyLoad'
import './Galeria.css'

const Galeria = () => {
  const { ref, inView } = useLazyLoad()
  const [selectedImage, setSelectedImage] = useState(null)

  const images = [
    {
      src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&q=80',
      alt: 'Cabaña rústica con vista panorámica al bosque',
      width: 600,
      height: 400
    },
    {
      src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
      alt: 'Interior acogedor de cabaña con chimenea',
      width: 600,
      height: 400
    },
    {
      src: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80',
      alt: 'Alberca privada rodeada de naturaleza',
      width: 600,
      height: 400
    },
    {
      src: 'https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=600&q=80',
      alt: 'Prismas basálticos de Huasca de Ocampo',
      width: 600,
      height: 400
    }
  ]

  const openModal = (image) => setSelectedImage(image)
  const closeModal = () => setSelectedImage(null)

  return (
    <section id="galeria" className="galeria section" ref={ref}>
      <div className="container">
        <div className="section-header text-center">
          <h2>Galería</h2>
          <p>Descubre la belleza de nuestras cabañas y los paisajes de Huasca</p>
        </div>

        {inView && (
          <div className="gallery-grid">
            {images.map((image, index) => (
              <div 
                key={index} 
                className="gallery-item"
                onClick={() => openModal(image)}
                role="button"
                tabIndex={0}
                aria-label={`Ver imagen: ${image.alt}`}
              >
                <LazyImage
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  className="gallery-image"
                />
                <div className="gallery-overlay">
                  <span>Ver imagen</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedImage && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button 
                className="modal-close"
                onClick={closeModal}
                aria-label="Cerrar imagen"
              >
                <X size={24} />
              </button>
              <img 
                src={selectedImage.src} 
                alt={selectedImage.alt}
                width={selectedImage.width}
                height={selectedImage.height}
                className="modal-image"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Galeria