const express = require("express")
const router = express.Router()
const Errors = require("../lib/errors.js")
const auth = require("../lib/authorize.js")
const axios = require("axios")
const { User, Chat, ChatAssociation, Message } = require("../models")
const cryptoRandomString = require("crypto-random-string")
const { Op } = require("sequelize")

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

router.get("/search", auth, async (req, res, next) => {
  try {
    const users = await User.findAll({
      where: {
        [Op.or]: [
          {
            privacy: {
              communications: {
                enabled: true
              }
            },
            instance: req.user.instance,
            sussiId: {
              [Op.like]: `%${req.query.query}%`
            }
          },
          {
            privacy: {
              communications: {
                outsideTenant: true,
                enabled: true
              }
            },
            sussiId: {
              [Op.like]: `%${req.query.query}%`
            }
          }
        ]
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
    // exclude current user
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

router.post("/:id/message", auth, async (req, res, next) => {
  try {
    const io = req.app.get("io")
    if (!req.body.message) {
      throw Errors.invalidParameter("message")
    }
    if (!req.body.message.length) {
      throw Errors.invalidParameter("message")
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
        limit: 50,
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
