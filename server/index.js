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
                // if the user has no work, there's no point
                // checking their result
                if (this.session.has(socket.work)) {
                    const work = socket.work
                    const temp = this.session.get(work)
                    const solution = JSON.parse(message)
                    temp.workers--
                    temp.solutions.push(solution)
                    if (temp.solutions.length === strength) {
                        this.emit('workgroup_complete', work, temp.solutions)
                        this.session.delete(work)

                        // anticipating edge case where strength is 1
                        this.available.delete(work)
                        if (this.session.size === 0) {
                            this.emit('all_work_complete')
                        }
                    } else {
                        this.session.set(work, temp)
                    }
                }
                this.serveSocket(socket)
            })

            socket.on('close', _ => {
                this.waiting.delete(socket)
                if (this.session.has(socket.work)) {
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
            socket.work = Array.from(this.available)[Math.floor(Math.random() * this.available.size)]
            console.log(socket.work)
            const temp = this.session.get(socket.work)
            if (( temp.workers + temp.solutions.length) === this.strength) {
                this.available.delete(last_work)
            }
            temp.workers++
            this.session.set(socket.work, temp)
            socket.send(JSON.stringify(socket.work))
        } else {
            socket.work = NO_WORK
            this.waiting.add(socket)
            console.log('hih')
        }
    }

    serveTheHungry() {
        for (x in this.waiting) {
            this.serveSocket(x)
        }
    }
    
}

module.exports = Distri
