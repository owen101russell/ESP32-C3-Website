import { supabase } from './supabase.js'
import { requireAuth, logout } from './auth.js'

await requireAuth()

const container = document.getElementById("devices")

async function loadDevices() {
  const { data } = await supabase
    .from('device_full')
    .select('*')

  container.innerHTML = ""

  data.forEach(device => {
    const card = document.createElement("div")
    card.className = "glass device-card"

    let tasksHTML = ""

    Object.keys(device.state).forEach(key => {
      const active = device.state[key].value

      tasksHTML += `
        <div class="task">
          <div class="task-info">
            <h3>${key}</h3>
            <p>Pin ${device.config[key]?.pin || '?'}</p>
          </div>

          <div class="toggle ${active ? 'active' : ''}" data-device="${device.device_id}" data-key="${key}">
            <div class="toggle-circle"></div>
          </div>
        </div>
      `
    })

    card.innerHTML = `
      <div class="device-header">
        <div>
          <div class="device-title">${device.name}</div>
        </div>

        <div class="device-status">Online</div>
      </div>

      <div class="tasks">
        ${tasksHTML}
      </div>

      <div class="card-actions">
        <button class="secondary-btn small-btn edit-btn">
          Edit
        </button>
      </div>
    `

    card.querySelector('.edit-btn').onclick = () => {
      localStorage.setItem("device_id", device.device_id)
      window.location.href = "edit.html"
    }

    container.appendChild(card)
  })

  setupToggles(data)
}

function setupToggles(devices) {
  document.querySelectorAll('.toggle').forEach(toggle => {
    toggle.onclick = async () => {
      const deviceId = toggle.dataset.device
      const key = toggle.dataset.key

      const device = devices.find(d => d.device_id === deviceId)

      if (!device) return

      const current = device.state[key].value

      device.state[key].value = !current

      toggle.classList.toggle('active')

      await supabase
        .from('device_state')
        .update({ state: device.state })
        .eq('device_id', deviceId)
    }
  })
}

window.logoutUser = logout

loadDevices()

supabase
  .channel('devices')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'device_state'
    },
    () => {
      loadDevices()
    }
  )
  .subscribe()