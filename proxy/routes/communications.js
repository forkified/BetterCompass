const express = require("express")
const router = express.Router()
const Errors = require("../lib/errors.js")
const auth = require("../lib/authorize.js")
const axios = require("axios")
const { User, Chat, ChatAssociation } = require("../models")
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
              attributes: {
                include: ["id", "sussiId", "createdAt"]
              }
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
    res.json(users)
  } catch (err) {
    next(err)
  }
})

module.exports = router
