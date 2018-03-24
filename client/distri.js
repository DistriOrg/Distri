const storage = window.localStorage
const thing = []
for (let x = 0; x < storage.length; x++) {
    thing[x] = `<b>${storage.key(x)}</b>`
}

const main = `
<div class="modal fade" id="distri-main">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h4>Distri Menu</h4>
            </div>
            <div class="modal-body">
                <p>${thing.join()}</p>
            </div>
        </div>
    </div>
</div>
`

document.body.innerHTML = main
$("#distri-main").modal()
