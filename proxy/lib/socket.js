const setStatus = require("../socket_routes/status.js")
const auth = require("../lib/authorize_socket.js")
const { User, Friend } = require("../models")
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
      const friends = await Friend.findAll({
        where: {
          userId: user.id,
          status: "accepted"
        }
      })
      await user.update({
        status: user.storedStatus
      })
      friends.forEach((friend) => {
        io.to(friend.friendId).emit("userStatus", {
          userId: user.id,
          status: user.storedStatus
        })
      })
      console.log("test, user " + socket.user.sussiId)
      socket.on("disconnect", async function () {
        friends.forEach((friend) => {
          io.to(friend.friendId).emit("userStatus", {
            userId: user.id,
            status: "offline"
          })
        })
        console.log("test, user " + socket.user.sussiId + " disconnected")
        await user.update({
          status: "offline"
        })
      })
    })
    console.log("WS OK")
    app.set("io", io)
  }
}
