import { supabase } from './supabase.js'
import { requireAuth } from './auth.js'

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
            <p>
              Pin ${device.config[key]?.pin || "?"}
            </p>
          </div>

          <div
            class="toggle ${active ? 'active' : ''}"
            data-key="${key}"
          >
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

        <div class="device-status">
          Online
        </div>

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

    card.querySelectorAll('.toggle').forEach(toggle => {
      toggle.onclick = async () => {
        const key = toggle.dataset.key

        device.state[key].value = !device.state[key].value

        await supabase
          .from('device_state')
          .update({ state: device.state })
          .eq('device_id', device.device_id)
      }
    })

    card.querySelector('.edit-btn').onclick = () => {
      localStorage.setItem("device_id", device.device_id)
      window.location.href = "edit.html"
    }

    container.appendChild(card)
  })
}

loadDevices()

// 🔥 REALTIME
supabase
  .channel('devices')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'device_state' }, loadDevices)
  .subscribe()