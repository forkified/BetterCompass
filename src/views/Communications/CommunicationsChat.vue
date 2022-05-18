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
              <v-card-title> {{ getDirectRecipient.sussiId }} </v-card-title>
              <v-card-text class="flex-grow-1 overflow-y-auto">
                <v-list two-line color="card">
                  <v-list-item
                    v-for="(message, index) in messages"
                    :key="index"
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
                      </v-list-item-subtitle>
                      <p style="white-space: pre-line; overflow-wrap: anywhere">
                        {{ message.content }}
                      </p>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-list-item-subtitle>
                        {{
                          $date(message.createdAt).format("DD/MM/YYYY hh:mm A")
                        }}
                      </v-list-item-subtitle>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </v-card-text>
              <v-card-text class="flex-shrink-1">
                <v-text-field
                  v-model="message"
                  autofocus
                  label="Type a message"
                  placeholder="Type a message"
                  type="text"
                  ref="message-input"
                  outlined
                  append-outer-icon="mdi-send"
                  @keyup.enter="sendMessage"
                  @click:append-outer="sendMessage"
                />
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
  props: ["chat", "loading"],
  data: () => ({
    messages: [],
    message: ""
  }),
  computed: {
    scrollTop() {
      const chatEnvironment = document.querySelector("#chat-environment")
      return chatEnvironment.offsetTop
    },
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
    autoScroll() {
      try {
        this.$nextTick(() => {
          const lastIndex = this.messages.length - 1
          const lastMessage = document.querySelector(`#message-${lastIndex}`)
          lastMessage.scrollIntoView({
            behavior: "smooth"
          })
        })
      } catch {
        //
      }
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
          this.autoScroll()
        })
        .catch((e) => {
          AjaxErrorHandler(this.$store)(e)
        })
    },
    sendMessage() {
      this.axios
        .post("/api/v1/communications/" + this.$route.params.id + "/message", {
          message: this.message
        })
        .then((res) => {
          this.messages.push(res.data)
          this.message = ""
          this.autoScroll()
        })
        .catch((e) => {
          AjaxErrorHandler(this.$store)(e)
        })
    }
  },
  mounted() {
    this.getMessages()
    this.$socket.on("message", (message) => {
      if (message.chatId === this.chat.chat.id) {
        this.messages.push(message)
        this.autoScroll()
      }
    })
  },
  watch: {
    "$route.params.id"() {
      this.$refs["message-input"].$refs.input.focus()
      this.message = ""
      this.messages = []
      this.getMessages()
    }
  }
}
</script>
