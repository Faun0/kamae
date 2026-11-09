import { Outlet, ScrollRestoration, useNavigation } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

export default function Layout({ children }) {
  const navegando = useNavigation().state === 'loading'

  return (
    <div className="flex min-h-svh flex-col">
      <div
        className={`fixed inset-x-0 top-0 z-20 h-0.5 origin-left bg-shu transition-transform duration-500 ${
          navegando ? 'scale-x-75' : 'scale-x-0'
        }`}
        aria-hidden="true"
      />
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children ?? <Outlet />}
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  )
}
