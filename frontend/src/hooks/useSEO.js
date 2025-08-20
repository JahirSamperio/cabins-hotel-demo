import { useEffect } from 'react'

export const useSEO = ({ 
  title, 
  description, 
  keywords, 
  ogImage, 
  canonical 
}) => {
  useEffect(() => {
    // Actualizar título
    if (title) {
      document.title = title
    }

    // Actualizar meta description
    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', description)
      }
    }

    // Actualizar keywords
    if (keywords) {
      const metaKeywords = document.querySelector('meta[name="keywords"]')
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keywords)
      }
    }

    // Actualizar Open Graph
    if (title) {
      const ogTitle = document.querySelector('meta[property="og:title"]')
      if (ogTitle) {
        ogTitle.setAttribute('content', title)
      }
    }

    if (description) {
      const ogDescription = document.querySelector('meta[property="og:description"]')
      if (ogDescription) {
        ogDescription.setAttribute('content', description)
      }
    }

    if (ogImage) {
      const ogImageMeta = document.querySelector('meta[property="og:image"]')
      if (ogImageMeta) {
        ogImageMeta.setAttribute('content', ogImage)
      }
    }

    // Actualizar canonical
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]')
      if (!canonicalLink) {
        canonicalLink = document.createElement('link')
        canonicalLink.rel = 'canonical'
        document.head.appendChild(canonicalLink)
      }
      canonicalLink.href = canonical
    }
  }, [title, description, keywords, ogImage, canonical])
}