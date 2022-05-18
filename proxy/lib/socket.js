const setStatus = require("../socket_routes/status.js")
const auth = require("../lib/authorize_socket.js")
const { User } = require("../models")
module.exports = {
  init(app, server) {
    const io = require("socket.io")(server, {
      cors: {
        origin: [process.env.CORS_HOSTNAME],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
      }
    })
    io.use(auth)
    io.on("connection", async (socket) => {
      const user = await User.findOne({
        where: {
          id: socket.user.id
        }
      })
      socket.join(user.id)
      await user.update({
        status: user.storedStatus
      })
      console.log("test, user " + socket.user.sussiId)
      socket.on("disconnect", async function () {
        await user.update({
          status: "offline"
        })
        console.log(socket.user.sussiId + " disconnected")
      })
    })
    console.log("WS OK")
    app.set("io", io)
  }
}
