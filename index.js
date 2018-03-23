const ws = require('ws')

class Distri extends ws.Server {
    constructor(args, file, strength) {
        super(args)
        this.work = []
        this.available = []

        this.on('connection', socket => {
            socket.send(JSON.stringify({ file }));
            socket.on('message', message => {
                   
                // 1 states the user is ready to receive work
                // so they obviously do not have any results
                if (message !== 1) {

                }
                
                const work = this.getWork()
                if (work !== -1) {

                }
                
            })
        })
    }
    addWork(work) {

    }
}

new Distri({ port: 3000 })
