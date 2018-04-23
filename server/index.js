const ws = require('ws')
const NO_WORK = '2497f9db0a3e8a3f424642dcbb000daf39c935ec-distri'

class Distri extends ws.Server {
    constructor(args, file) {
        super(args)

        this.session = new Set()
        this.waiting = new Set()
        this.workers = 0

        this.on('connection', socket => {
            socket.work = NO_WORK
            
            socket.send(file)
            this.workers++
            socket.on('message', message => {
                this.workers--
                if (socket.work !== NO_WORK) {
                    this.emit('workgroup_complete', socket.work, message)
                    if (this.session.size === 0 && this.workers === 0) this.emit('all_work_complete')
                }
                this.serveSocket(socket)
            })

            socket.on('close', _ => {
                this.waiting.delete(socket)
                if (socket.work !== NO_WORK) {
                    this.workers--
                    this.session.add(socket.work)
                }
                this.serveTheHungry()
            })
        })
    }

    addWork(work) {
        work.map(entry => this.session.add(entry))
        this.serveTheHungry()
    }

    serveSocket(socket) {
        if (this.session.size > 0) {
            socket.work = Array.from(this.session)[Math.floor(Math.random() * this.session.size)]
            this.session.delete(socket.work)
            socket.send(socket.work)
            this.workers++
        } else {
            socket.work = NO_WORK
            this.waiting.add(socket)
        }
    }

    serveTheHungry() {
        for (x in this.waiting) {
            this.serveSocket(x)
        }
    }
    
}

module.exports = Distri
