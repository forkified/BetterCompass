<template>
  <div id="communications">
    <v-dialog
      v-model="settings.addMembers.dialog"
      max-width="400px"
      v-if="settings.item"
    >
      <v-card color="card">
        <v-toolbar color="toolbar">
          <v-toolbar-title
            >Add User to {{ settings.item.chat.name }}</v-toolbar-title
          >
          <v-spacer></v-spacer>
          <v-btn icon @click.native="settings.addMembers.dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-container>
          <v-autocomplete
            v-model="settings.addMembers.users"
            :items="settings.addMembers.results"
            :search-input.sync="settings.addMembers.name"
            filled
            chips
            color="blue-grey lighten-2"
            label="Select"
            item-text="sussiId"
            item-value="id"
            multiple
          >
            <template v-slot:selection="data">
              <v-chip
                v-bind="data.attrs"
                :input-value="data.selected"
                close
                @click="data.select"
                @click:close="remove(data.item)"
              >
                <v-avatar left v-if="data.item.discussionsImage">
                  <v-img :src="data.item.discussionsImage"></v-img>
                </v-avatar>
                @{{ data.item.sussiId }}:{{ data.item.instance }}
              </v-chip>
            </template>
            <template v-slot:item="data">
              <v-avatar
                left
                v-if="data.item.discussionsImage"
                class="mr-3 mb-2 mt-2"
              >
                <v-img :src="data.item.discussionsImage"></v-img>
              </v-avatar>
              <v-avatar left v-else class="mr-3 mb-2 mt-2">
                <v-icon>mdi-account</v-icon>
              </v-avatar>
              <v-list-item-content>
                @{{ data.item.sussiId }}:{{ data.item.instance }}
              </v-list-item-content>
            </template>
          </v-autocomplete>
        </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="settings.addMembers.dialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            text
            @click="addMembersToGroup"
            :disabled="!settings.addMembers.users.length"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="settings.dialog" max-width="500px" v-if="settings.item">
      <v-card color="card">
        <v-toolbar color="toolbar">
          <v-toolbar-title>Group Settings</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click.native="settings.dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-container>
          <v-card-title v-if="settings.item.rank === 'admin'"
            >General</v-card-title
          >
          <v-text-field
            label="Group Name"
            v-if="
              settings.item.chat.type === 'group' &&
              settings.item.rank === 'admin'
            "
            v-model="settings.item.chat.name"
          ></v-text-field>
          <v-card-title
            >Members
            <v-btn
              icon
              @click.native="settings.addMembers.dialog = true"
              v-if="settings.item.rank === 'admin'"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-card-title>
          <v-list>
            <v-list-item
              v-for="user in settings.item.chat.users"
              :key="user.id"
            >
              <v-list-item-avatar> </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{ user.sussiId }}</v-list-item-title>
              </v-list-item-content>
              <v-list-item-action v-if="settings.item.rank === 'admin'">
                <v-btn icon @click.native="$toast.info('TODO')">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-container>
      </v-card>
    </v-dialog>
    <v-dialog v-model="leave.dialog" max-width="400px">
      <v-card color="card">
        <v-toolbar color="toolbar">
          <v-toolbar-title>Are you sure you want to leave?</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            icon
            @click.native="
              leave.dialog = false
              leave.item = null
            "
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-container>
          <p>
            You will not be able to rejoin this group unless you are added back
            manually.
          </p>
        </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click.native="leave.dialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" text @click.native="leaveGroup()"> Leave </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogs.new" max-width="500px">
      <v-card color="card">
        <v-toolbar color="toolbar">
          <v-toolbar-title>New Communication</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click.native="dialogs.new = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-container>
          <v-autocomplete
            v-model="newConversation.users"
            :items="newConversation.results"
            :search-input.sync="newConversation.name"
            filled
            chips
            color="blue-grey lighten-2"
            label="Select"
            item-text="sussiId"
            item-value="id"
            multiple
          >
            <template v-slot:selection="data">
              <v-chip
                v-bind="data.attrs"
                :input-value="data.selected"
                close
                @click="data.select"
                @click:close="remove(data.item)"
              >
                <v-avatar left v-if="data.item.discussionsImage">
                  <v-img :src="data.item.discussionsImage"></v-img>
                </v-avatar>
                @{{ data.item.sussiId }}:{{ data.item.instance }}
              </v-chip>
            </template>
            <template v-slot:item="data">
              <v-avatar
                left
                v-if="data.item.discussionsImage"
                class="mr-3 mb-2 mt-2"
              >
                <v-img :src="data.item.discussionsImage"></v-img>
              </v-avatar>
              <v-avatar left v-else class="mr-3 mb-2 mt-2">
                <v-icon>mdi-account</v-icon>
              </v-avatar>
              <v-list-item-content>
                @{{ data.item.sussiId }}:{{ data.item.instance }}
              </v-list-item-content>
            </template>
          </v-autocomplete>
          <small
            >If the person you want to add doesn't appear, ensure they have
            BetterCompass Communications enabled.</small
          >
        </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="dialogs.new = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="newConversation.loading"
            text
            @click="createConversation"
            :disabled="!newConversation.users.length"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-container
      fluid
      v-if="$store.state.user?.bcUser?.privacy.communications.enabled"
    >
      <v-row>
        <v-col cols="12" sm="3" height="20%">
          <v-btn
            color="card"
            to="/communications/friends"
            dark
            block
            class="mb-3"
          >
            <v-icon left>mdi-account-multiple</v-icon>
            Friends
          </v-btn>
          <v-text-field
            filled
            label="Search..."
            append-icon="mdi-magnify"
            color="grey"
          ></v-text-field>
          <v-toolbar color="card" class="rounded-xl">
            <v-toolbar-subtitle>
              CHATS ({{ items.length }})
            </v-toolbar-subtitle>
            <v-spacer></v-spacer>
            <v-btn icon @click="dialogs.new = true">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-toolbar>

          <v-card :height="viewport - 204" color="bg" class="mt-2">
            <v-list two-line color="card">
              <v-list-item-group v-model="selected" class="rounded-xl">
                <template v-for="(item, index) in items">
                  <v-list-item
                    :key="item.title"
                    :to="'/communications/' + item.id"
                  >
                    <v-badge
                      bordered
                      bottom
                      :color="getStatus(item)"
                      v-if="item.chat.type === 'direct'"
                      dot
                      offset-x="24"
                      offset-y="26"
                    >
                      <v-list-item-avatar
                        :color="$vuetify.theme.themes.dark.primary"
                      >
                        <v-icon v-if="item.chat.type === 'group'">
                          mdi-account-group
                        </v-icon>
                        <img
                          v-else-if="
                            item.chat.type === 'direct' &&
                            getDirectRecipient(item).discussionsImage
                          "
                          :src="getDirectRecipient(item).discussionsImage"
                        />
                        <v-icon v-else-if="item.chat.type === 'direct'">
                          mdi-account
                        </v-icon>
                      </v-list-item-avatar>
                    </v-badge>
                    <v-badge dot color="none" v-else>
                      <v-list-item-avatar
                        :color="$vuetify.theme.themes.dark.primary"
                      >
                        <v-icon v-if="item.chat.type === 'group'">
                          mdi-account-group
                        </v-icon>
                      </v-list-item-avatar>
                    </v-badge>
                    <template>
                      <v-list-item-content>
                        <v-list-item-title v-if="item.chat.type === 'direct'">
                          {{ getDirectRecipient(item).sussiId }}:{{
                            getDirectRecipient(item).instance
                          }}
                          <v-badge
                            v-if="
                              getLastRead(item).count >= 1 &&
                              $route.params.id !== item.id.toString()
                            "
                            color="red"
                            class="ml-2"
                            :content="getLastRead(item).count"
                          >
                          </v-badge>
                        </v-list-item-title>
                        <v-list-item-title v-else>
                          {{ item.chat.name }}
                          <v-badge
                            v-if="
                              getLastRead(item).count >= 1 &&
                              $route.params.id !== item.id.toString()
                            "
                            color="red"
                            class="ml-2"
                            :content="getLastRead(item).count"
                          >
                          </v-badge>
                        </v-list-item-title>

                        <v-list-item-subtitle v-if="item.chat.type === 'group'">
                          {{ item.chat.users.length }} Members
                        </v-list-item-subtitle>
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-icon
                          @click="
                            leave.item = item
                            leave.dialog = true
                          "
                        >
                          mdi-exit-to-app
                        </v-icon>
                      </v-list-item-action>
                      <v-list-item-action>
                        <v-icon
                          @click="
                            settings.item = item
                            settings.dialog = true
                          "
                        >
                          mdi-cog
                        </v-icon>
                      </v-list-item-action>
                    </template>
                  </v-list-item>

                  <v-divider
                    v-if="index < items.length - 1"
                    :key="index"
                  ></v-divider>
                </template>
              </v-list-item-group>
            </v-list>
          </v-card>
        </v-col>
        <v-col>
          <router-view
            v-if="$route.params.id !== 'home'"
            :chat="selectedChat"
            :loading="loading"
            :items="items"
          ></router-view>
        </v-col>
      </v-row>
    </v-container>
    <v-container v-else>
      <v-card
        class="d-flex align-center justify-center"
        flat
        color="bg"
        :height="viewport"
        tile
      >
        <v-card
          color="card"
          class="rounded-xl justify-center text-center"
          elevation="12"
        >
          <v-container>
            <h1 class="troplo-title">BetterCompass Communications</h1>
            <h3>
              A quick and easy way to communicate with BetterCompass users.
            </h3>
            <p>
              BetterCompass Communications is an opt-in feature, you will be
              able to deactivate, and modify privacy settings at any time.
            </p>
            <v-btn text color="primary" @click="enableCommunications">
              Enable
            </v-btn>
          </v-container>
        </v-card>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import AjaxErrorHandler from "@/lib/errorHandler"

export default {
  name: "Communications",
  data() {
    return {
      settings: {
        dialog: false,
        addMembers: {
          dialog: false,
          users: [],
          results: [],
          name: ""
        },
        item: null
      },
      selected: [2],
      items: [],
      loading: true,
      leave: {
        item: null,
        dialog: false
      },
      newConversation: {
        name: "",
        users: [],
        loading: false,
        results: []
      },
      dialogs: {
        new: false
      }
    }
  },
  computed: {
    selectedChat() {
      try {
        return this.items.find(
          (item) => item.id === JSON.parse(this.$route.params.id)
        )
      } catch {
        return null
      }
    },
    viewport() {
      let height = window.innerHeight
      return (height -= document.querySelector("#navbar").clientHeight + 26)
    }
  },
  methods: {
    addMembersToGroup() {
      this.axios
        .post(
          "/api/v1/communications/association/" + this.settings.item.chat.id,
          {
            users: this.settings.addMembers.users
          }
        )
        .then(() => {
          this.settings.item.chat.users = this.settings.item.chat.users.concat(
            this.settings.addMembers.users
          )
          this.settings.addMembers.dialog = false
          this.settings.addMembers.users = []
          this.settings.addMembers.results = []
        })
        .catch((e) => {
          AjaxErrorHandler(this.$store)(e)
        })
    },
    leaveGroup() {
      this.axios
        .delete("/api/v1/communications/association/" + this.leave.item.id)
        .then(() => {
          this.leave.dialog = false
          this.leave.item = null
          this.getChats()
          this.$router.push("/communications/home")
        })
        .catch((e) => {
          AjaxErrorHandler(this.$store)(e)
        })
    },
    getLastRead(item) {
      const message = item.chat.lastMessages.find(
        (message) => message.id === item.lastRead
      )
      const lastMessage = item.chat.lastMessages[0]
      if (message) {
        const index = item.chat.lastMessages.indexOf(message)
        const indexLast = item.chat.lastMessages.indexOf(lastMessage)
        return {
          count: index - indexLast,
          lastMessageTimestamp: lastMessage.createdAt
        }
      } else {
        return {
          count: item.chat.lastMessages.length,
          lastMessageTimestamp: lastMessage?.createdAt
        }
      }
    },
    getStatus(item) {
      if (this.getDirectRecipient(item).status === "online") {
        return "green"
      } else if (this.getDirectRecipient(item).status === "offline") {
        return "grey"
      } else {
        return "grey"
      }
    },
    getDirectRecipient(item) {
      const user = item.chat.users.find(
        (user) => user.id !== this.$store.state.user.bcUser.id
      )
      if (user) {
        return user
      } else {
        return item.chat.users[0]
      }
    },
    createConversation() {
      this.newConversation.loading = true
      this.axios
        .post("/api/v1/communications/create", {
          users: this.newConversation.users
        })
        .then(() => {
          this.getChats()
          this.newConversation.name = ""
          this.newConversation.users = []
          this.newConversation.loading = false
          this.newConversation.results = []
        })
        .catch((e) => {
          this.newConversation.loading = false
          AjaxErrorHandler(this.$store)(e)
        })
    },
    enableCommunications() {
      this.axios
        .put("/api/v1/user/settings/communications", {
          enabled: true,
          outsideTenant: false,
          directMessages: "friendsOnly",
          friendRequests: true
        })
        .then(() => {
          this.$store.dispatch("getUserInfo")
        })
        .catch((e) => {
          AjaxErrorHandler(this.$store)(e)
        })
    },
    remove(item) {
      const index = this.newConversation.users.indexOf(item.id)
      if (index >= 0) this.newConversation.users.splice(index, 1)
    },
    searchUsers() {
      this.newConversation.loading = true
      this.axios
        .get("/api/v1/communications/search?query=" + this.newConversation.name)
        .then((res) => {
          this.newConversation.loading = false
          this.newConversation.results.push(...res.data)
        })
        .catch(() => {
          this.newConversation.loading = false
        })
    },
    searchUsersForGroupAdmin() {
      this.axios
        .get(
          "/api/v1/communications/search?query=" + this.settings.addMembers.name
        )
        .then((res) => {
          if (this.settings.item) {
            this.settings.addMembers.results.push(...res.data)
            this.settings.addMembers.results =
              this.settings.addMembers.results.filter(
                (user) =>
                  !this.settings.item.chat.users.find((u) => u.id === user.id)
              )
          }
        })
        .catch(() => {})
    },
    getChats() {
      this.loading = true
      this.axios.get("/api/v1/communications").then((res) => {
        this.items = res.data
        this.loading = false
      })
    }
  },
  mounted() {
    this.getChats()
    this.$socket.on("chatAdded", (chat) => {
      this.items.push(chat)
    })
    this.$socket.on("userStatus", (event) => {
      this.items.forEach((item) => {
        item.chat.users.forEach((u) => {
          if (u.id === event.userId) {
            u.status = event.status
          }
        })
      })
    })
    this.$socket.on("message", (message) => {
      const chat = this.items.find((item) => item.chatId === message.chatId)
      if (chat) {
        const index = this.items.indexOf(chat)
        this.items[index].chat.lastMessages.unshift(message)
        this.items.splice(index, 1)
        this.items.unshift(chat)
      }
    })
    this.$socket.on("readChat", (chat) => {
      const item = this.items.find((item) => item.chatId === chat.id)
      if (item) {
        const index = this.items.indexOf(item)
        console.log(this.items[index].lastRead)
        this.items[index].lastRead = chat.lastRead
      }
    })
  },
  watch: {
    "settings.addMembers.name"() {
      this.searchUsersForGroupAdmin()
    },
    "newConversation.name"() {
      this.searchUsers()
    }
  }
}
</script>

<style scoped></style>
