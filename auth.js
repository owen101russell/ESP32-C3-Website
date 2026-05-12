import { supabase } from './supabase.js'

// LOGIN
export async function login(email, password) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    showError(error.message)
    return
  }

  window.location.href = "home.html"
}

// LOGOUT
export async function logout() {
  await supabase.auth.signOut()
  window.location.href = "index.html"
}

// PROTECT PAGES
export async function requireAuth() {
  const { data } = await supabase.auth.getSession()

  if (!data.session) {
    window.location.href = "index.html"
  }
}

// UI ERROR HELPER
function showError(message) {
  const errorBox = document.getElementById("error")

  if (!errorBox) {
    alert(message)
    return
  }

  errorBox.textContent = message
  errorBox.style.display = "block"
}