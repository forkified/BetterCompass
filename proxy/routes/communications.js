const express = require("express")
const router = express.Router()
const Errors = require("../lib/errors.js")
const auth = require("../lib/authorize.js")
const { User, Chat, ChatAssociation, Message, Friend } = require("../models")
const { Op } = require("sequelize")
const rateLimit = require("express-rate-limit")
const limiter = rateLimit({
  windowMs: 10 * 1000,
  max: 8,
  message: Errors.rateLimit,
  standardHeaders: true,
  legacyHeaders: false
})
router.get("/", auth, async (req, res, next) => {
  try {
    let chats = await ChatAssociation.findAll({
      where: {
        userId: req.user.id
      },
      include: [
        {
          model: Chat,
          as: "chat",
          include: [
            {
              model: Message,
              as: "lastMessages",
              limit: 50,
              order: [["id", "DESC"]],
              attributes: ["id", "content", "createdAt", "updatedAt"]
            },
            {
              model: User,
              as: "users",
              attributes: [
                "sussiId",
                "discussionsFirstName",
                "discussionsLastName",
                "discussionsImage",
                "avatar",
                "id",
                "createdAt",
                "updatedAt",
                "instance",
                "status"
              ]
            }
          ]
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "sussiId", "createdAt", "updatedAt"]
        }
      ]
    })
    res.json(
      chats.sort((a, b) => {
        if (a.chat.lastMessages.length > 0 && b.chat.lastMessages.length > 0) {
          return b.chat.lastMessages[0].id - a.chat.lastMessages[0].id
        } else if (a.chat.lastMessages.length > 0) {
          return -1
        } else if (b.chat.lastMessages.length > 0) {
          return 1
        } else {
          return b.chat.id - a.chat.id
        }
      })
    )
  } catch (err) {
    next(err)
  }
})

router.post("/association/:id", auth, async (req, res, next) => {
  try {
    const io = req.app.get("io")
    const chat = await ChatAssociation.findOne({
      where: {
        userId: req.user.id,
        chatId: req.params.id,
        rank: "admin"
      },
      include: [
        {
          model: Chat,
          as: "chat",
          include: [
            {
              model: User,
              as: "users",
              attributes: ["id", "sussiId", "createdAt", "updatedAt"]
            }
          ]
        }
      ]
    })
    if (chat) {
      if (req.body.users.length > 10) {
        throw Errors.invalidParameter(
          "User",
          "The maximum number of users is 10"
        )
      }
      if (!req.body.users.length) {
        throw Errors.invalidParameter(
          "User",
          "You need at least 1 user to create a chat"
        )
      }
      if (req.body.users.includes(req.user.id)) {
        throw Errors.invalidParameter(
          "User",
          "You cannot create a DM with yourself"
        )
      }
      const friends = await Friend.findAll({
        where: {
          userId: req.user.id,
          friendId: req.body.users,
          status: "accepted"
        }
      })
      if (friends.length !== req.body.users.length) {
        throw Errors.invalidParameter(
          "User",
          "You are not friends with this user"
        )
      }
      const users = await ChatAssociation.findAll({
        where: {
          userId: req.body.users,
          chatId: req.params.id
        }
      })
      if (users.length > 0) {
        throw Errors.invalidParameter(
          "User",
          "One or more users are already in this chat"
        )
      }
      for (let i = 0; i < req.body.users.length; i++) {
        const c1 = await ChatAssociation.create({
          chatId: chat.chat.id,
          userId: req.body.users[i],
          rank: "member"
        })
        const association = await ChatAssociation.findOne({
          where: {
            id: c1.id
          },
          include: [
            {
              model: Chat,
              as: "chat",
              include: [
                {
                  model: User,
                  as: "users",
                  attributes: [
                    "sussiId",
                    "discussionsFirstName",
                    "discussionsLastName",
                    "discussionsImage",
                    "avatar",
                    "id",
                    "createdAt",
                    "updatedAt",
                    "instance",
                    "status"
                  ]
                }
              ]
            },
            {
              model: User,
              as: "user",
              attributes: ["id", "sussiId", "createdAt", "updatedAt"]
            }
          ]
        })
        io.to(req.body.users[i]).emit("chatAdded", association)
      }
      res.sendStatus(204)
    } else {
      throw Errors.chatNotFoundOrNotAdmin
    }
  } catch (err) {
    next(err)
  }
})

router.get("/friends", auth, async (req, res, next) => {
  try {
    let friends = await Friend.findAll({
      where: {
        userId: req.user.id
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "id",
            "sussiId",
            "discussionsImage",
            "avatar",
            "createdAt",
            "updatedAt"
          ]
        },
        {
          model: User,
          as: "user2",
          attributes: [
            "id",
            "sussiId",
            "discussionsImage",
            "avatar",
            "createdAt",
            "updatedAt"
          ]
        }
      ]
    })
    res.json(friends)
  } catch (err) {
    next(err)
  }
})

router.post("/friends", auth, async (req, res, next) => {
  try {
    const io = req.app.get("io")
    let friendRes
    try {
      friendRes = req.body.friend.split(":")
    } catch {
      friendRes = req.body.friend
    }
    const user = await User.findOne({
      where: {
        sussiId: friendRes[0] || friendRes,
        instance: friendRes[1] || req.user.instance
      }
    })
    if (user) {
      const friend = await Friend.findOne({
        where: {
          userId: req.user.id,
          friendId: user.id
        }
      })
      if (friend) {
        throw Errors.friendAlreadyFriends
      } else {
        if (!user.privacy.communications.enabled) {
          throw Errors.communicationsUserNotOptedIn
        } else {
          const newFriend = await Friend.create({
            userId: req.user.id,
            friendId: user.id
          })
          const remoteFriend = await Friend.create({
            userId: user.id,
            friendId: req.user.id,
            status: "pendingCanAccept"
          })
          io.to(user.id).emit("friendRequest", {
            ...remoteFriend.dataValues,
            user: {
              sussiId: req.user.sussiId,
              discussionsImage: req.user.discussionsImage,
              avatar: req.user.avatar,
              id: req.user.id
            }
          })
          res.json(newFriend)
        }
      }
    } else {
      throw Errors.communicationsUserNotFound
    }
  } catch (err) {
    next(err)
  }
})

router.delete("/friends/:id", auth, async (req, res, next) => {
  try {
    const friend = await Friend.findOne({
      where: {
        userId: req.user.id,
        id: req.params.id
      }
    })
    if (friend) {
      await friend.destroy()
      await Friend.destroy({
        where: {
          userId: friend.friendId,
          friendId: req.user.id
        }
      })
      res.sendStatus(204)
    } else {
      throw Errors.friendNotFound
    }
  } catch (err) {
    next(err)
  }
})

router.put("/friends/:id", auth, async (req, res, next) => {
  try {
    const io = req.app.get("io")
    const friend = await Friend.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
        status: "pendingCanAccept"
      }
    })
    if (friend) {
      await friend.update({
        status: "accepted"
      })
      const remoteFriend = await Friend.findOne({
        where: {
          userId: friend.friendId,
          friendId: friend.userId
        },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "sussiId", "createdAt", "updatedAt"]
          },
          {
            model: User,
            as: "user2",
            attributes: ["id", "sussiId", "createdAt", "updatedAt"]
          }
        ]
      })
      await remoteFriend.update({
        status: "accepted"
      })
      io.to(req.user.id).emit("friendAccepted", {
        ...friend.dataValues
      })
      io.to(remoteFriend.userId).emit("friendAccepted", {
        ...remoteFriend.dataValues
      })
      res.json(friend)
    } else {
      throw Errors.friendNotFound
    }
  } catch (err) {
    next(err)
  }
})

router.get("/search", auth, async (req, res, next) => {
  try {
    const friends = await Friend.findAll({
      where: {
        userId: req.user.id,
        status: "accepted"
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "sussiId", "createdAt", "updatedAt"]
        },
        {
          model: User,
          as: "user2",
          attributes: ["id", "sussiId", "createdAt", "updatedAt"]
        }
      ]
    })
    console.log(friends)
    const users = await User.findAll({
      where: {
        id: friends.map((friend) => friend.friendId),
        sussiId: {
          [Op.like]: `%${req.query.query}%`
        }
      },
      attributes: [
        "sussiId",
        "discussionsFirstName",
        "discussionsLastName",
        "discussionsImage",
        "avatar",
        "id",
        "createdAt",
        "updatedAt",
        "instance"
      ]
    })
    users.forEach((user) => {
      if (user.id === req.user.id) {
        users.splice(users.indexOf(user), 1)
      }
    })
    res.json(users)
  } catch (err) {
    next(err)
  }
})

router.get("/:id", auth, async (req, res, next) => {
  try {
    let chat = await ChatAssociation.findOne({
      where: {
        userId: req.user.id,
        id: req.params.id
      },
      include: [
        {
          model: Chat,
          as: "chat",
          include: [
            {
              model: User,
              as: "users",
              attributes: [
                "sussiId",
                "discussionsFirstName",
                "discussionsLastName",
                "discussionsImage",
                "avatar",
                "id",
                "createdAt",
                "updatedAt",
                "instance"
              ]
            }
          ]
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "sussiId", "createdAt", "updatedAt"]
        }
      ]
    })
    if (chat) {
      res.json(chat)
    } else {
      throw Errors.invalidParameter("chat association id")
    }
  } catch (err) {
    next(err)
  }
})

router.put("/:id/read", auth, async (req, res, next) => {
  try {
    const io = req.app.get("io")
    const chat = await ChatAssociation.findOne({
      where: {
        userId: req.user.id,
        id: req.params.id
      },
      include: [
        {
          model: Chat,
          as: "chat",
          include: [
            {
              model: Message,
              as: "lastMessages",
              limit: 50,
              order: [["id", "DESC"]],
              attributes: ["id", "content", "createdAt", "updatedAt"]
            }
          ]
        }
      ]
    })
    if (chat) {
      await chat.update({
        lastRead: chat.chat.lastMessages[0]?.id || null
      })
      io.to(req.user.id).emit("readChat", {
        id: chat.id,
        lastRead: chat.chat.lastMessages[0]?.id || null
      })
      res.sendStatus(204)
    } else {
      throw Errors.invalidParameter("chat association id")
    }
  } catch (err) {
    next(err)
  }
})

router.put("/:id/message/edit", auth, async (req, res, next) => {
  try {
    const io = req.app.get("io")
    const chat = await ChatAssociation.findOne({
      where: {
        userId: req.user.id,
        id: req.params.id
      },
      include: [
        {
          model: Chat,
          as: "chat",
          include: [
            {
              model: User,
              as: "users",
              attributes: ["id"]
            },
            {
              model: Message,
              as: "lastMessages",
              limit: 50,
              order: [["id", "DESC"]],
              attributes: ["id", "content", "createdAt", "updatedAt"]
            }
          ]
        }
      ]
    })
    if (chat) {
      const message = await Message.findOne({
        where: {
          id: req.body.id,
          chatId: chat.chat.id,
          userId: req.user.id
        }
      })
      if (message) {
        await message.update({
          content: req.body.content,
          edited: true,
          editedAt: new Date().toISOString()
        })
        chat.chat.users.forEach((user) => {
          io.to(user.id).emit("editMessage", {
            chatId: chat.chat.id,
            id: message.id,
            edited: true,
            editedAt: new Date().toISOString(),
            content: req.body.content
          })
        })
        res.sendStatus(204)
      } else {
        throw Errors.invalidParameter("message id")
      }
    } else {
      throw Errors.invalidParameter("chat association id")
    }
  } catch (err) {
    next(err)
  }
})

router.delete("/association/:id", auth, async (req, res, next) => {
  try {
    const chat = await ChatAssociation.findOne({
      where: {
        userId: req.user.id,
        id: req.params.id
      }
    })
    if (chat) {
      await chat.destroy()
      res.sendStatus(204)
    } else {
      throw Errors.invalidParameter("chat association id")
    }
  } catch (err) {
    next(err)
  }
})

router.post("/:id/message", limiter, auth, async (req, res, next) => {
  try {
    const io = req.app.get("io")
    if (!req.body.message) {
      throw Errors.invalidParameter("message")
    }
    if (!req.body.message.length) {
      throw Errors.invalidParameter("message")
    }
    if (req.body.message.length > 999) {
      throw Errors.invalidParameter("message", "Maximum length is 1000")
    }
    const chat = await ChatAssociation.findOne({
      where: {
        userId: req.user.id,
        id: req.params.id
      },
      include: [
        {
          model: Chat,
          as: "chat",
          include: [
            {
              model: User,
              as: "users",
              attributes: [
                "sussiId",
                "discussionsFirstName",
                "discussionsLastName",
                "discussionsImage",
                "avatar",
                "id",
                "createdAt",
                "updatedAt",
                "instance"
              ]
            }
          ]
        },
        {
          model: User,
          as: "user",
          attributes: [
            "sussiId",
            "discussionsFirstName",
            "discussionsLastName",
            "discussionsImage",
            "avatar",
            "id",
            "createdAt",
            "updatedAt",
            "instance"
          ]
        }
      ]
    })
    if (chat) {
      const message = await Message.create({
        content: req.body.message,
        userId: req.user.id,
        chatId: chat.chat.id,
        attachments: [],
        embeds: []
      })
      const messageLookup = await Message.findOne({
        where: {
          id: message.id
        },
        include: [
          {
            model: Chat,
            as: "chat",
            include: [
              {
                model: User,
                as: "users",
                attributes: [
                  "sussiId",
                  "discussionsFirstName",
                  "discussionsLastName",
                  "discussionsImage",
                  "avatar",
                  "id",
                  "createdAt",
                  "updatedAt",
                  "instance"
                ]
              }
            ]
          },
          {
            model: User,
            as: "user",
            attributes: [
              "sussiId",
              "discussionsFirstName",
              "discussionsLastName",
              "discussionsImage",
              "avatar",
              "id",
              "createdAt",
              "updatedAt",
              "instance"
            ]
          }
        ]
      })
      const associations = await ChatAssociation.findAll({
        where: {
          chatId: chat.chat.id,
          userId: {
            [Op.ne]: req.user.id
          }
        },
        include: [
          {
            model: User,
            as: "user",
            attributes: [
              "sussiId",
              "discussionsFirstName",
              "discussionsLastName",
              "discussionsImage",
              "avatar",
              "id",
              "createdAt",
              "updatedAt",
              "instance"
            ]
          }
        ]
      })
      associations.forEach((association) => {
        io.to(association.userId).emit("message", {
          ...messageLookup.dataValues,
          associationId: association.id
        })
      })
      res.json(messageLookup)
    } else {
      throw Errors.invalidParameter("chat association id")
    }
  } catch (err) {
    next(err)
  }
})

router.get("/:id/messages", auth, async (req, res, next) => {
  try {
    const chat = await ChatAssociation.findOne({
      where: {
        userId: req.user.id,
        id: req.params.id
      },
      include: [
        {
          model: Chat,
          as: "chat",
          include: [
            {
              model: User,
              as: "users",
              attributes: [
                "sussiId",
                "discussionsFirstName",
                "discussionsLastName",
                "discussionsImage",
                "avatar",
                "id",
                "createdAt",
                "updatedAt",
                "instance"
              ]
            }
          ]
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "sussiId", "createdAt", "updatedAt"]
        }
      ]
    })
    if (chat) {
      const messages = await Message.findAll({
        where: {
          chatId: chat.chat.id
        },
        include: [
          {
            model: User,
            as: "user",
            attributes: [
              "sussiId",
              "discussionsFirstName",
              "discussionsLastName",
              "discussionsImage",
              "avatar",
              "id",
              "createdAt",
              "updatedAt",
              "instance"
            ]
          }
        ],
        offset: req.query.offset || 0,
        order: [["id", "DESC"]],
        limit: 50
      })
      const messagesWithKeyId = messages.map((message) => {
        return {
          ...message.dataValues,
          keyId: `${message.id}-${message.updatedAt.toISOString()}`
        }
      })
      res.json(messagesWithKeyId.sort((a, b) => a.id - b.id))
    } else {
      throw Errors.invalidParameter("chat association id")
    }
  } catch (err) {
    next(err)
  }
})

router.put("/:id/typing", auth, async (req, res, next) => {
  try {
    const io = req.app.get("io")
    const chat = await ChatAssociation.findOne({
      where: {
        userId: req.user.id,
        id: req.params.id
      },
      include: [
        {
          model: Chat,
          as: "chat",
          include: [
            {
              model: User,
              as: "users",
              attributes: [
                "sussiId",
                "discussionsFirstName",
                "discussionsLastName",
                "discussionsImage",
                "avatar",
                "id",
                "createdAt",
                "updatedAt",
                "instance"
              ]
            }
          ]
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "sussiId", "createdAt", "updatedAt"]
        }
      ]
    })
    if (chat) {
      const userIds = chat.chat.users.map((user) => user.id)
      const userIdsWithoutCurrentUser = userIds.filter(
        (userId) => userId !== req.user.id
      )
      userIdsWithoutCurrentUser.forEach((userId) => {
        const date = new Date()
        io.to(userId).emit("typing", {
          chatId: chat.chat.id,
          userId: req.user.id,
          timeout: new Date(date.getTime() + 5000).toISOString(),
          date: new Date(date).toISOString(),
          sussiId: req.user.sussiId
        })
      })
      res.sendStatus(204)
    } else {
      throw Errors.invalidParameter("chat association id")
    }
  } catch (err) {
    next(err)
  }
})

router.post("/create", auth, async (req, res, next) => {
  try {
    const io = req.app.get("io")
    let name
    let type
    if (req.body.users.length <= 1) {
      name = "Direct Message"
      type = "direct"
    } else {
      name = "Unnamed Group"
      type = "group"
    }
    if (req.body.users.length > 10) {
      throw Errors.invalidParameter("User", "The maximum number of users is 10")
    }
    if (!req.body.users.length) {
      throw Errors.invalidParameter(
        "User",
        "You need at least 1 user to create a chat"
      )
    }
    if (req.body.users.includes(req.user.id)) {
      throw Errors.invalidParameter(
        "User",
        "You cannot create a DM with yourself"
      )
    }
    const friends = await Friend.findAll({
      where: {
        userId: req.user.id,
        friendId: req.body.users,
        status: "accepted"
      }
    })
    if (friends.length !== req.body.users.length) {
      throw Errors.invalidParameter(
        "User",
        "You are not friends with this user"
      )
    }
    const chat = await Chat.create({
      name,
      userId: req.user.id,
      type
    })
    req.body.users.push(req.user.id)
    for (let i = 0; i < req.body.users.length; i++) {
      let rank
      if (type === "group") {
        if (req.body.users[i] === req.user.id) {
          rank = "admin"
        } else {
          rank = "member"
        }
      } else {
        rank = "member"
      }
      const c1 = await ChatAssociation.create({
        chatId: chat.id,
        userId: req.body.users[i],
        rank
      })
      const association = await ChatAssociation.findOne({
        where: {
          id: c1.id
        },
        include: [
          {
            model: Chat,
            as: "chat",
            include: [
              {
                model: User,
                as: "users",
                attributes: [
                  "sussiId",
                  "discussionsFirstName",
                  "discussionsLastName",
                  "discussionsImage",
                  "avatar",
                  "id",
                  "createdAt",
                  "updatedAt",
                  "instance",
                  "status"
                ]
              }
            ]
          },
          {
            model: User,
            as: "user",
            attributes: ["id", "sussiId", "createdAt", "updatedAt"]
          }
        ]
      })
      io.to(req.body.users[i]).emit("chatAdded", association)
    }
    res.json(chat)
  } catch (err) {
    next(err)
  }
})

module.exports = router
