'use client'

export default function LogoutButton() {
  const handleLogout = () => {
    document.cookie = 'auth_token=; path=/; max-age=0'
    window.location.href = '/admin/login'
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-red-600 hover:text-red-700 transition"
    >
      Déconnexion
    </button>
  )
}
