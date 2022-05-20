<template>
  <div v-if="!loading">
    <v-container class="fill-height pa-0">
      <v-row class="no-gutters elevation-4">
        <v-col cols="auto" class="flex-grow-1 flex-shrink-0">
          <v-responsive
            :height="viewport"
            id="chat-environment"
            ref="chatEnvironment"
          >
            <v-card flat class="d-flex flex-column fill-height" color="card">
              <v-card-title>
                {{
                  chat.chat.type === "direct"
                    ? getDirectRecipient.sussiId
                    : chat.chat.name
                }}
              </v-card-title>
              <v-card-text class="flex-grow-1 overflow-y-auto">
                <v-list two-line color="card">
                  <v-list-item
                    v-for="(message, index) in messages"
                    :key="message.keyId"
                    :class="{
                      'text-xs-right':
                        message.userId === $store.state.user.bcUser.id,
                      'text-xs-left':
                        message.userId !== $store.state.user.bcUser.id
                    }"
                    :id="'message-' + index"
                  >
                    <v-avatar size="48" class="mr-2">
                      <img
                        :src="message.user.discussionsImage"
                        v-if="message.user.discussionsImage"
                        class="elevation-1"
                      />
                      <v-icon v-else class="elevation-1"> mdi-account </v-icon>
                    </v-avatar>
                    <v-list-item-content>
                      <v-list-item-subtitle>
                        {{ message.user.sussiId }}
                        <v-tooltip top v-if="message.edited">
                          <template v-slot:activator="{ on, attrs }">
                            <span v-on="on" v-bind="attrs">
                              <v-icon
                                color="grey"
                                small
                                style="
                                  margin-bottom: 2px;
                                  margin-left: 4px;
                                  position: absolute;
                                "
                              >
                                mdi-pencil
                              </v-icon>
                            </span>
                          </template>
                          <span>
                            {{
                              $date(message.editedAt).format(
                                "DD/MM/YYYY hh:mm:ss A"
                              )
                            }}
                          </span>
                        </v-tooltip>
                      </v-list-item-subtitle>
                      <p v-if="edit.id !== message.id" v-markdown>
                        {{ message.content }}
                      </p>
                      <v-text-field
                        v-model="edit.content"
                        v-if="edit.editing && edit.id === message.id"
                        autofocus
                        :value="message.content"
                        label="Type a message"
                        placeholder="Type a message"
                        type="text"
                        ref="edit-input"
                        outlined
                        append-outer-icon="mdi-send"
                        @keyup.enter="editMessage(message)"
                        @keydown.esc="
                          edit.content = ''
                          edit.editing = false
                          edit.id = null
                          focusInput()
                        "
                        @click:append-outer="editMessage(message)"
                      />
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-list-item-subtitle>
                        {{
                          $date(message.createdAt).format("DD/MM/YYYY hh:mm A")
                        }}
                      </v-list-item-subtitle>
                      <v-list-item-subtitle>
                        <v-btn
                          icon
                          v-if="message.userId === $store.state.user.bcUser.id"
                        >
                          <v-icon> mdi-delete </v-icon>
                        </v-btn>
                        <v-btn
                          icon
                          @click="
                            edit.content = message.content
                            edit.editing = true
                            edit.id = message.id
                          "
                          v-if="
                            message.userId === $store.state.user.bcUser.id &&
                            edit.id !== message.id
                          "
                        >
                          <v-icon> mdi-pencil </v-icon>
                        </v-btn>
                        <v-btn
                          icon
                          @click="
                            edit.content = ''
                            edit.editing = false
                            edit.id = null
                          "
                          v-if="
                            message.userId === $store.state.user.bcUser.id &&
                            edit.id === message.id
                          "
                        >
                          <v-icon> mdi-close </v-icon>
                        </v-btn>
                      </v-list-item-subtitle>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </v-card-text>
              <v-card-text>
                <v-text-field
                  v-model="message"
                  autofocus
                  label="Type a message"
                  placeholder="Type a message"
                  type="text"
                  ref="message-input"
                  outlined
                  append-outer-icon="mdi-send"
                  auto-grow
                  single-line
                  @keyup.enter="sendMessage"
                  @keyup.up="editLastMessage"
                  @click:append-outer="sendMessage"
                />
                <p
                  style="margin-top: -17px; position: absolute"
                  v-if="usersTyping.length"
                >
                  {{ usersTyping.map((user) => user.sussiId).join(", ") }}
                  {{ usersTyping.length > 1 ? " are" : " is" }} typing...
                </p>
              </v-card-text>
            </v-card>
          </v-responsive>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script>
import AjaxErrorHandler from "@/lib/errorHandler"

export default {
  name: "CommunicationsChat",
  props: ["chat", "loading", "items"],
  data: () => ({
    emojiPicker: false,
    messages: [],
    typingDate: null,
    message: "",
    edit: {
      content: "",
      editing: false,
      id: null
    },
    usersTyping: []
  }),
  computed: {
    viewport() {
      let height = window.innerHeight
      return (height -= document.querySelector("#navbar").clientHeight + 26)
    },
    getDirectRecipient() {
      const user = this.chat.chat.users.find(
        (user) => user.id !== this.$store.state.user.bcUser.id
      )
      if (user) {
        return user
      } else {
        return this.chat.chat.users[0]
      }
    }
  },
  methods: {
    typing() {
      this.usersTyping = this.usersTyping.filter((user) => {
        return this.$date().isBefore(user.timeout)
      })
    },
    focusInput() {
      this.$refs["message-input"].$refs.input.focus()
    },
    editLastMessage() {
      // find last message sent by current user
      const lastMessage = this.messages
        .slice()
        .reverse()
        .find((message) => message.userId === this.$store.state.user.bcUser.id)
      if (lastMessage) {
        this.edit.content = lastMessage.content
        this.edit.editing = true
        this.edit.id = lastMessage.id
      }
    },
    editMessage() {
      if (this.edit.content.length > 0) {
        this.axios
          .put(
            "/api/v1/communications/" + this.$route.params.id + "/message/edit",
            {
              id: this.edit.id,
              content: this.edit.content
            }
          )
          .then(() => {
            this.edit.editing = false
            this.edit.id = null
            this.edit.content = ""
            this.$refs["message-input"].$refs.input.focus()
            // response will be handled via WebSocket
          })
          .catch((e) => {
            AjaxErrorHandler(this.$store)(e)
          })
      }
    },
    autoScroll() {
      this.$nextTick(() => {
        try {
          const lastIndex = this.messages.length - 1
          const lastMessage = document.querySelector(`#message-${lastIndex}`)
          lastMessage.scrollIntoView({
            behavior: "smooth"
          })
        } catch {
          console.log("Could not auto scroll")
        }
      })
    },
    getMessages() {
      this.axios
        .get(
          "/api/v1/communications/" +
            this.$route.params.id +
            "/messages?limit=50"
        )
        .then((res) => {
          this.messages = res.data
          this.$nextTick(() => {
            this.autoScroll()
          })
        })
        .catch((e) => {
          AjaxErrorHandler(this.$store)(e)
        })
    },
    markRead() {
      this.axios.put(
        "/api/v1/communications/" + this.$route.params.id + "/read"
      )
    },
    sendMessage() {
      if (this.message.length > 0) {
        const emojis = require("../../lib/emojis.json")
        this.message = this.message.replaceAll(
          /:([a-zA-Z0-9_\-+]+):/g,
          (match, group1) => {
            const emoji = emojis.find((emoji) => {
              return emoji.aliases.includes(group1)
            })
            if (emoji) {
              return emoji.emoji
            } else {
              return match
            }
          }
        )
        this.axios
          .post(
            "/api/v1/communications/" + this.$route.params.id + "/message",
            {
              message: this.message
            }
          )
          .then((res) => {
            this.messages.push(res.data)
            this.message = ""
            this.autoScroll()
            const chat = this.items.find(
              (item) => item.chatId === this.chat.chatId
            )
            if (chat) {
              const index = this.items.indexOf(chat)
              this.items.splice(index, 1)
              this.items.unshift(chat)
            }
          })
          .catch((e) => {
            AjaxErrorHandler(this.$store)(e)
          })
      }
    }
  },
  mounted() {
    setInterval(() => {
      this.typing()
    }, 1000)
    this.getMessages()
    this.markRead()
    this.$socket.on("message", (message) => {
      if (message.chatId === this.chat.chat.id) {
        this.messages.push(message)
        this.autoScroll()
        this.markRead()
      }
    })
    this.$socket.on("editMessage", (message) => {
      if (message.chatId === this.chat.chatId) {
        const index = this.messages.findIndex((item) => item.id === message.id)
        this.messages[index].content = message.content
        this.messages[index].edited = message.edited
        this.messages[index].editedAt = message.editedAt
        this.messages[index].keyId = message.id + "-" + message.editedAt
      }
    })
    this.$socket.on("typing", (event) => {
      if (event.chatId === this.chat.chatId) {
        const index = this.usersTyping.findIndex(
          (item) => item.userId === event.userId
        )
        if (index > -1) {
          this.usersTyping.splice(index, 1)
        }
        this.usersTyping.push(event)
      }
    })
  },
  watch: {
    message() {
      if (this.typingDate) {
        const now = new Date()
        if (now - this.typingDate > 5000) {
          this.typingDate = now
          this.axios.put(
            "/api/v1/communications/" + this.$route.params.id + "/typing"
          )
        }
      } else {
        this.typingDate = new Date()
        this.axios.put(
          "/api/v1/communications/" + this.$route.params.id + "/typing"
        )
      }
    },
    "$route.params.id"() {
      this.$refs["message-input"].$refs.input.focus()
      this.message = ""
      this.messages = []
      this.getMessages()
      this.markRead()
    }
  }
}
</script>
