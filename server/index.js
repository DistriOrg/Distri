const ws = require('ws')
const NO_WORK = '2497f9db0a3e8a3f424642dcbb000daf39c935ec-distri'

class Distri extends ws.Server {
    constructor(args, file) {
        super(args)

        this.session = new Set()
        this.waiting = new Set()

        this.on('connection', socket => {
            socket.work = NO_WORK

            socket.send(JSON.stringify({ file }));
            socket.on('message', message => {
                
                if (this.session.has(socket.work)) {
                    const work = socket.work
                    let solution
                    try {
                        solution = JSON.parse(solution)
                        this.emit('workgroup_complete', work, solution)
                        if (this.session.size === 0) this.emit('all_work_complete')
                    } catch (e) {
                        
                    }
                }
                this.serveSocket(socket)
            })

            socket.on('close', _ => {
                this.waiting.delete(socket)
                if (socket.work !== NO_WORK) {
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
            socket.send(JSON.stringify(socket.work))
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
