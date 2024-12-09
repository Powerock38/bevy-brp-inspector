const ADDR = "http://localhost:15702"

async function send(method, params) {
  return await fetch(ADDR, {
    method: "POST",
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  })
    .then((res) => res.json())
    .then((res) => res.result)
}

const $ = (id) => document.getElementById(id)
const sanatize = (str) => str.replace(/</g, "&lt;").replace(/>/g, "&gt;")
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const C = {
  "name": "bevy_core::name::Name",
  "children": "bevy_hierarchy::components::children::Children",
  "parent": "bevy_hierarchy::components::parent::Parent",
}

const WITHOUT = [
  //"bevy_ecs::system::SystemIdMarker", "bevy_ecs::observer::Observer"
]

const SPECIAL = [C.name, C.children, C.parent]

let ENTITIES = {}

$("list").onclick = async () => {
  const res = await send("bevy/query", {
    data: {
      option: SPECIAL,
    },
    filter: { without: WITHOUT },
  })

  ENTITIES = Object.fromEntries(res.map((ec) =>
    [ec.entity, { name: ec.components[C.name]?.name ?? "", components: [], children: ec.components[C.children], parent: ec.components[C.parent] }]
  ))

  renderEntities()
}

function renderRef(entity) {
  return `<span class="entityRef" onclick="$('entity${entity}').click()">${entity}</span>`
}

function renderEntities(openEntity = null) {
  console.log(ENTITIES)

  const ul = $("entities")
  ul.innerHTML = ""

  for (const [entity, data] of Object.entries(ENTITIES)) {
    const li = document.createElement("li")

    const details = document.createElement("details")
    details.open = openEntity === entity

    const summary = document.createElement("summary")
    summary.id = `entity${entity}`
    summary.title = "Fetch components"
    summary.innerHTML = `<span class="entityRef">${entity}</span> <i>${data.name}</i>`

    summary.onclick = async () => {
      console.log("click", entity)

      if (data.components.length === 0) {
        const components = (await send("bevy/list", { entity: +entity })).filter(c => !SPECIAL.includes(c))
        const res = await send("bevy/get", { entity: +entity, components })
        ENTITIES[entity].components = { ...Object.fromEntries(components.map(c => [c, {}])), ...res.components }
      }

      if (data.children?.length === 0) {
        const res = await send("bevy/get", { entity: +entity, components: [C.children] })
        ENTITIES[entity].children = res.components[C.children]
      }

      renderEntities(entity)
    }

    details.appendChild(summary)

    const components = document.createElement("ul")

    components.innerHTML += Object.entries(data.components).map(([c, v]) => {
      if (Object.keys(v).length) {
        return `<li><details><summary>${sanatize(c)}</summary> <b><pre>${JSON.stringify(v, null, 2)}</pre></b></details></li>`
      } else {
        return `<li>${sanatize(c)}</li>`
      }
    }
    ).join("")

    if (data.parent) {
      components.innerHTML += `<li><b>Parent:</b> ${renderRef(data.parent)}</li>`
    }

    if (data.children) {
      components.innerHTML += `<li><b>Children:</b> ${data.children.map(renderRef).join(", ")}</li>`
    }

    details.appendChild(components)
    li.appendChild(details)
    ul.appendChild(li)
  }
}

async function recursive(entities) {
  for (const entity of entities) {
    const components = await send("bevy/list", { entity })

    if (components.includes(C.children)) {
      const res = await send("bevy/get", {
        entity,
        components: [C.children],
      })

      const children = res.components[C.children]

      await recursive(children)
    }

    const r = { entity, components }
    console.log(r)
  }
}
