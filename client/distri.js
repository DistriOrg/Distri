(function(){
const storage = window.localStorage
const max = window.navigator.hardwareConcurrency
window.Distri = window.Distri ? window.Distri : {}
let avail = window.Distri.avail = max
let stored = storage.getItem('distri-saved')

if (!stored) {
    window.Distri.saved = {}
} else {
    window.Distri.saved = JSON.parse(stored)
}

saved = window.Distri.saved



const main = document.createElement('div')
main.id = 'distri-main'
main.innerHTML = `
<div id="distri-inside" class="modal fade">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h4>Distri Menu</h4>
            </div>
            <div class="modal-body" id="distri-body">
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" data-dismiss="modal" onClick="window.Distri.start()">Start</button>
                <button class="btn btn-dark" onClick="$('#distri-inside').modal('toggle'); $('#distri-add').modal();">Add</button>
                <button class="btn btn-danger">Reset</button>
                <button class="btn btn-success" onClick="window.localStorage.setItem('distri-saved', JSON.stringify(window.Distri.saved))">Save</button>
            </div>
        </div>
    </div>
</div>
<div id="distri-add" class="modal fade">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h4>Add Server</h4>
            </div>
            <div class="modal-body">
                <input id="distri-server-title" type="text" placeholder="Server Title" style="width: 100%;"/><br>
                <input id="distri-server-link" type="text" placeholder="Server Link (do not prepend w[s]://)" style="width: 100%;"/>
            </div>
            <div class="modal-footer">
                <button class="btn btn-danger" onClick="$('#distri-add').modal('toggle'); $('#distri-inside').modal('toggle');">Cancel</button>
                <button class="btn btn-success" onClick="
                const link = document.getElementById('distri-server-link').value
                const title = document.getElementById('distri-server-title').value
                window.Distri.saved[link] = { title, workers: 0 }
                $('#distri-add').modal('toggle')
                window.Distri.update()
                $('#distri-inside').modal('toggle')
                ">Add</button>
            </div>
        </div>
    </div>
</div>
`

window.Distri.update = _ => {
const ret = []
let x = 0
saved = window.Distri.saved
for (const key in saved) {
    const x_floor = Math.floor(x/3)
    if(!ret[x_floor]) ret[x_floor] = []
    if ((avail - saved[key].workers) > 0) {
        avail -= saved[key].workers
    } else {
        saved[key].workers = 0
    }
    const temp = { ...saved[key], link: key }
    ret[x_floor].push(temp) 
    x++  
}
document.getElementById('distri-body').innerHTML = `
${ret.map(row => 
    `<div class="row">
        ${row.map(item => 
            `<div class="col-sm-${12/row.length}">
             <center>
                <h5>${item.title}</h5>
                <h6 id='distri-workers-${item.link}'>${item.workers}</h6>
                <button class="btn btn-danger" onClick='
                    let x = window.Distri.saved[${JSON.stringify(item.link)}]
                    if (x.workers > 0) {
                        x.workers--
                        window.Distri.avail++
                        document.getElementById("distri-workers-${item.link}").innerText = x.workers
                    } else {
                        delete window.Distri.saved[${JSON.stringify(item.link)}]
                        window.Distri.update()
                    }
                    '>-</button>
                <button class="btn btn-success" onClick='
                    let x = window.Distri.saved[${JSON.stringify(item.link)}]
                    if (window.Distri.avail > 0) {
                        x.workers++
                        window.Distri.avail--
                        document.getElementById("distri-workers-${item.link}").innerText = x.workers
                    }
                '>+</button>
                <center>
            </div>`
        ).join('')}
    </div>`
).join('')}
`
}

window.Distri.start = _ => {
    const protocol = window.location.protocol === "https:" ? "wss://" : "ws://" 
    for (key in window.Distri.saved) {
        for (let x = 0; x < window.Distri.saved[key].workers; x++) {
            const socket = new WebSocket(`${protocol}${key}`)
            let worker
            socket.onmessage = m => {
                worker = new Worker(URL.createObjectURL(new Blob([m.data])))
                socket.send('ready')
                socket.onmessage = m => {
                    worker.postMessage(m.data)
                }
                worker.onmessage = res => {
                    socket.send(res.data)
                }
                worker.onerror = _ => {
                    worker.terminate()
                    socket.close()
                }
            }
        }
    }
}

document.body.appendChild(main)
window.Distri.update()
$('#distri-inside').modal()

})()
