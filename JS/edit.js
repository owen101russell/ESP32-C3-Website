import { supabase } from './supabase.js'
import { requireAuth } from './auth.js'

await requireAuth()

const device_id = localStorage.getItem("device_id")

if (!device_id) {
  window.location.href = "home.html"
}

const container = document.getElementById("editor")

let deviceData = null

async function load() {
  const { data, error } = await supabase
    .from('device_full')
    .select('*')
    .eq('device_id', device_id)
    .single()

  if (error || !data) {
    alert("Failed to load device")
    return
  }

  deviceData = data

  render()
}

function render() {
  container.innerHTML = ""

  // TITLE
  const title = document.createElement("div")
  title.className = "glass editor-panel"

  title.innerHTML = `
    <h1>Edit Device</h1>

    <br>

    <label>Device Name</label>
    <input id="deviceName" value="${deviceData.name}">

    <br><br>

    <div id="components"></div>

    <br>

    <button id="addComponentBtn" class="primary-btn">
      + Add Component
    </button>

    <br><br>

    <button id="saveBtn" class="primary-btn">
      Save Changes
    </button>
  `

  container.appendChild(title)

  const components = document.getElementById("components")

  Object.keys(deviceData.state).forEach(key => {
    const state = deviceData.state[key]
    const config = deviceData.config[key]

    const row = document.createElement("div")
    row.className = "glass task"
    row.style.marginBottom = "16px"

    row.innerHTML = `
      <div style="width:100%">

        <input 
          value="${key}"
          id="name-${key}"
          placeholder="Component Name"
        >

        <br>

        <div class="component-row">

          <input
            type="number"
            value="${config.pin}"
            id="pin-${key}"
            placeholder="Pin"
          >

          <select id="type-${key}">
            <option value="digital" ${config.type === "digital" ? "selected" : ""}>
              digital
            </option>

            <option value="pwm" ${config.type === "pwm" ? "selected" : ""}>
              pwm
            </option>
          </select>

        </div>

        <div class="component-row">

          <label style="display:flex;gap:10px;align-items:center;">
            Inverted
            <input
              type="checkbox"
              id="invert-${key}"
              ${config.inverted ? "checked" : ""}
            >
          </label>

          <button class="secondary-btn delete-btn" data-key="${key}">
            Delete
          </button>

        </div>

      </div>
    `

    components.appendChild(row)
  })

  setupButtons()
}

function setupButtons() {

  // ADD COMPONENT
  document.getElementById("addComponentBtn").onclick = () => {

    const name = prompt("Component name")

    if (!name) return

    if (deviceData.state[name]) {
      alert("Component already exists")
      return
    }

    deviceData.state[name] = {
      value: false
    }

    deviceData.config[name] = {
      pin: 2,
      type: "digital",
      inverted: false
    }

    render()
  }

  // DELETE
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = () => {

      const key = btn.dataset.key

      delete deviceData.state[key]
      delete deviceData.config[key]

      render()
    }
  })

  // SAVE
  document.getElementById("saveBtn").onclick = save
}

async function save() {

  const newState = {}
  const newConfig = {}

  Object.keys(deviceData.state).forEach(oldKey => {

    const newName = document
      .getElementById(`name-${oldKey}`)
      .value
      .trim()

    if (!newName) return

    newState[newName] = {
      value: deviceData.state[oldKey].value
    }

    newConfig[newName] = {
      pin: parseInt(
        document.getElementById(`pin-${oldKey}`).value
      ),

      type: document.getElementById(`type-${oldKey}`).value,

      inverted: document.getElementById(`invert-${oldKey}`).checked
    }
  })

  const newName = document.getElementById("deviceName").value

  const { error } = await supabase
    .from('device_state')
    .update({
      name: newName,
      state: newState,
      config: newConfig
    })
    .eq('device_id', device_id)

  if (error) {
    alert(error.message)
    return
  }

  alert("Saved!")

  load()
}

load()