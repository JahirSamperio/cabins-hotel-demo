import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import WhatsAppButton from './components/ui/WhatsAppButton'

export const PublicLayout = ({ children }) => {
  return (
    <div className="public-layout">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}