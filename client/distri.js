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

const ret = []
let x = 0
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


const main = document.createElement('div')
main.id = 'distri-main'
main.innerHTML = `
<div id="distri-inside" class="modal fade">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h4>Distri Menu</h4>
            </div>
            <div class="modal-body">
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
                                        document.getElementById("distri-workers-${item.link}").innerText = x.workers
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
            </div>
        </div>
    </div>
</div>
`

document.body.appendChild(main)
$('#distri-inside').modal()

})()
