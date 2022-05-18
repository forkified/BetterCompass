const express = require("express")
const router = express.Router()
const Errors = require("../lib/errors.js")
const auth = require("../lib/authorize.js")
const axios = require("axios")
const { User, Chat, ChatAssociation, Message, Friend } = require("../models")
const cryptoRandomString = require("crypto-random-string")
const { Op } = require("sequelize")
const rateLimit = require("express-rate-limit")
const limiter = rateLimit({
  windowMs: 10 * 1000,
  max: 12,
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
              model: User,
              as: "users",
              attributes: [
                "sussiId",
                "discussionsFirstName",
                "discussionsLastName",
                "discussionsImage",
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
    res.json(chats)
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
              "id",
              "createdAt",
              "updatedAt",
              "instance"
            ]
          }
        ]
      })
      const userIds = chat.chat.users.map((user) => user.id)
      const userIdsWithoutCurrentUser = userIds.filter(
        (userId) => userId !== req.user.id
      )
      userIdsWithoutCurrentUser.forEach((userId) => {
        console.log(userId)
        io.to(userId).emit("message", messageLookup)
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
              "id",
              "createdAt",
              "updatedAt",
              "instance"
            ]
          }
        ],
        offset: req.query.offset || 0
      })
      res.json(messages)
    } else {
      throw Errors.invalidParameter("chat association id")
    }
  } catch (err) {
    next(err)
  }
})

router.post("/create", auth, async (req, res, next) => {
  try {
    let name
    let type
    if (req.body.users.length <= 1) {
      name = "Direct Message"
      type = "direct"
    } else {
      name = "Unnamed Group"
      type = "group"
    }
    if (req.body.users.includes(req.user.id)) {
      throw Errors.invalidParameter(
        "User",
        "You cannot create a DM with yourself"
      )
    }
    let chat = await Chat.create({
      name,
      userId: req.user.id,
      type
    })
    await ChatAssociation.create({
      chatId: chat.id,
      userId: req.user.id
    })
    for (let i = 0; i < req.body.users.length; i++) {
      await ChatAssociation.create({
        chatId: chat.id,
        userId: req.body.users[i]
      })
    }
    res.json(chat)
  } catch (err) {
    next(err)
  }
})

module.exports = router
