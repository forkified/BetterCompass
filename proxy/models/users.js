"use strict"
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsTo(models.Theme, {
        as: "themeObject",
        foreignKey: "themeId"
      })
      User.hasMany(models.Friend, {
        as: "friends",
        foreignKey: "userId"
      })
    }
  }
  User.init(
    {
      sussiId: DataTypes.STRING,
      compassUserId: DataTypes.BIGINT,
      displayCode: DataTypes.STRING,
      instance: DataTypes.STRING,
      compassUserHash: DataTypes.UUID,
      theme: {
        type: DataTypes.STRING,
        defaultValue: "dark"
      },
      settings: {
        type: DataTypes.JSON,
        defaultValue: {
          dark: true,
          learningTaskNotification: true,
          weather: true,
          minimizeHeaderEvents: false
        }
      },
      weather: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      learningTaskNotification: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      minimizeHeaderEvents: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      settingsSync: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      cache: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      themeId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 1
      },
      accentColor: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      guidedWizard: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      calendarAutoJump: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      privacy: {
        type: DataTypes.JSON,
        defaultValue: {
          communications: {
            enabled: false,
            outsideTenant: false,
            directMessages: "friendsOnly",
            friendRequests: true
          }
        }
      },
      discussionsFirstName: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      discussionsLastName: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      // deprecated
      discussionsImage: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      rowsPerPage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 15
      },
      hideIrrelevantTasks: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      homeGrids: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [
          {
            items: [
              {
                id: 7,
                itemId: 11,
                name: "home.overdueLearningTasks",
                friendlyName: "Overdue Learning Tasks Warning Widget",
                invisible: true
              },
              {
                itemId: 0,
                id: 0,
                name: "home.calendar",
                friendlyName: "Calendar Widget"
              },
              {
                itemId: 1,
                id: 1,
                name: "home.tasks",
                friendlyName: "Tasks Widget"
              },
              {
                itemId: 2,
                id: 2,
                name: "home.events",
                friendlyName: "Events Widget"
              }
            ]
          },
          {
            items: [
              {
                id: 6,
                itemId: 10,
                name: "home.notifications",
                friendlyName: "Warnings/Notifications Widget",
                invisible: true
              },
              {
                itemId: 3,
                id: 3,
                name: "home.news",
                friendlyName: "News Widget"
              },
              {
                itemId: 4,
                id: 4,
                name: "home.weather",
                friendlyName: "Weather Widget",
                invisible: true
              },
              {
                itemId: 5,
                id: 5,
                name: "home.features",
                friendlyName: "Features Widget"
              }
            ]
          }
        ]
      },
      calendars: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
      },
      bookmarks: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      },
      admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      totp: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      totpEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      emailDirectLogin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true
      },
      bcSessions: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      lastSeenAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      // Used for users opted into BetterCompass session handling, will be null for all other users, no sessions are explicitly stored for users without consent.
      compassSession: {
        type: DataTypes.STRING,
        allowNull: true
      },
      // Used for users opted into BetterCompass session handling, uses argon2 to hash the password.
      password: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      font: {
        type: DataTypes.STRING,
        defaultValue: "Roboto",
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM([
          "online",
          "busy",
          "away",
          "offline",
          "invisible"
        ]),
        allowNull: false,
        defaultValue: "offline"
      },
      storedStatus: {
        type: DataTypes.ENUM(["online", "busy", "away", "invisible"]),
        allowNull: false,
        defaultValue: "online"
      },
      experiments: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true
      },
      compact: {
        type: DataTypes.ENUM(["enabled", "lowRes", "disabled", "nagPending"]),
        allowNull: false,
        defaultValue: "nagPending"
      }
    },
    {
      sequelize,
      modelName: "User"
    }
  )
  return User
}
