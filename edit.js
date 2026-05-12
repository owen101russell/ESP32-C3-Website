import { supabase } from './supabase.js'

const device_id = localStorage.getItem("device_id")
const container = document.getElementById("editor")

async function load() {
  const { data } = await supabase
    .from('device_full')
    .select('*')
    .eq('device_id', device_id)
    .single()

  container.innerHTML = `<h2>${data.name}</h2>`

  Object.keys(data.state).forEach(key => {
    const div = document.createElement("div")

    div.innerHTML = `
      <b>${key}</b>
      <input value="${data.config[key].pin}" id="pin-${key}">
    `

    container.appendChild(div)
  })

  const addBtn = document.createElement("button")
  addBtn.textContent = "Add Component"

  addBtn.onclick = async () => {
    const name = prompt("Name:")
    const pin = parseInt(prompt("Pin:"))

    data.state[name] = { value: false }
    data.config[name] = { pin: pin, type: "digital" }

    await supabase
      .from('device_state')
      .update({
        state: data.state,
        config: data.config
      })
      .eq('device_id', device_id)

    load()
  }

  container.appendChild(addBtn)
}

load()