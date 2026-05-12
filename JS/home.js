import { supabase } from './supabase.js'
import { requireAuth } from './auth.js'

await requireAuth()

const container = document.getElementById("devices")

async function loadDevices() {
  const { data } = await supabase.from('device_full').select('*')

  container.innerHTML = ""

  data.forEach(device => {
    const div = document.createElement("div")
    div.className = "card"

    div.innerHTML = `<h2>${device.name}</h2>`

    Object.keys(device.state).forEach(key => {
      const val = device.state[key].value

      const btn = document.createElement("button")
      btn.textContent = `${key}: ${val ? "ON" : "OFF"}`

      btn.onclick = async () => {
        device.state[key].value = !val

        await supabase
          .from('device_state')
          .update({ state: device.state })
          .eq('device_id', device.device_id)

        loadDevices()
      }

      div.appendChild(btn)
    })

    const editBtn = document.createElement("button")
    editBtn.textContent = "Edit"
    editBtn.onclick = () => {
      localStorage.setItem("device_id", device.device_id)
      window.location.href = "edit.html"
    }

    div.appendChild(editBtn)

    container.appendChild(div)
  })
}

window.addDevice = async () => {
  const name = prompt("Device name:")
  const id = crypto.randomUUID()

  await supabase.from('devices').insert([{ id, name }])
  await supabase.from('device_state').insert([{
    device_id: id,
    state: {},
    config: {}
  }])

  loadDevices()
}

loadDevices()

// 🔥 REALTIME
supabase
  .channel('devices')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'device_state' }, loadDevices)
  .subscribe()