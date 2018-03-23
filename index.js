const ws = require('ws')
const NO_WORK = '2497f9db0a3e8a3f424642dcbb000daf39c935ec-distri'

class Distri extends ws.Server {
    constructor(args, file, strength) {
        super(args)

        this.session = new Map()
        this.available = new Set()
        this.waiting = new Set()
        this.strength = strength

        this.on('connection', socket => {
            socket.work = NO_WORK

            socket.send(JSON.stringify({ file }));
            socket.on('message', message => {
                const temp = this.session.get(socket.work) 
                // if the user has no work, there's no point
                // checking their result
                if (socket.work !== NO_WORK) {
                    const solution = JSON.decode(message)
                    temp.workers--
                    temp.solutions(solution)
                    if (temp.solutions.length === strength) {
                        this.emit('workgroup_complete', socket.work, temp.solutions)
                        this.session.delete(socket.work)
                        if (this.session.size === 0) {
                            this.emit('all_work_complete')
                        }
                    } else {
                        this.session.set(socket.work, temp)
                    }
                }
               
                 
                this.serveSocket(socket)
            })

            socket.on('close', _ => {
                this.waiting.delete(socket)
                if (current_work !== NO_WORK) {
                    const temp = this.session.get(current_work)
                    temp.workers--
                    this.session.set(current_work, temp)
                    this.available.add(current_work)
                }
                this.serveTheHungry()
            })
        })
    }

    addWork(work) {
        work.map(entry => {
            this.session.set(entry, { workers: 0, solutions: [] })
            this.available.add(entry)
        })
        this.serveTheHungry()
    }

    serveSocket(socket) {
        if (this.available.size > 0) {
            const last_work = socket.work
            socket.work = Array.from(this.available)[Math.floor(Math.random() * this.available.size)]
            socket.send(JSON.stringify(current_work))
            if (last_work !== NO_WORK) {
                const temp = this.session.get(last_work)
                if (( temp.workers + temp.solutions.length) === this.strength) {
                    this.available.delete(socket.work)
                }
                temp.workers++
                this.session.set(current_work, temp)
            }
        } else {
            socket.work = NO_WORK
            this.waiting.add(socket)
        }
    }

    serveTheHungry() {
        for (x in this.waiting) {
            serveSocket(x)
        }
    }
    
}

new Distri({ port: 3000 }, 'console.log("sup")', 1)
