<template>
  <div id="communications-friends">
    <v-tabs centered background-color="card">
      <v-tab> Friends </v-tab>
      <v-tab> Add new friend </v-tab>
      <v-tab-item
        :style="
          'background-color: ' +
          $vuetify.theme.themes[$vuetify.theme.dark ? 'dark' : 'light'].card
        "
      >
        <v-card class="rounded-xl" color="card">
          <v-toolbar color="toolbar">
            <v-toolbar-title> Incoming </v-toolbar-title>
          </v-toolbar>
          <v-card color="card">
            <v-list color="card">
              <v-list-item
                v-for="friend in computePendingIncoming"
                :key="friend.id"
              >
                <v-list-item-avatar>
                  <v-list-item-avatar
                    :color="$vuetify.theme.themes.dark.primary"
                  >
                    <img
                      :src="friend.user2.discussionsImage"
                      v-if="friend.user2.discussionsImage"
                    />
                    <v-icon v-else> mdi-account </v-icon>
                  </v-list-item-avatar>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title>
                    {{ friend.user2.sussiId }}
                  </v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon>
                    <v-icon color="error" @click="removeFriend(friend)"
                      >mdi-close</v-icon
                    >
                  </v-btn>
                </v-list-item-action>
                <v-list-item-action>
                  <v-btn icon>
                    <v-icon color="success" @click="acceptFriend(friend)">
                      mdi-check</v-icon
                    >
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card>
          <v-toolbar color="toolbar">
            <v-toolbar-title> Outgoing </v-toolbar-title>
          </v-toolbar>
          <v-card color="card">
            <v-list color="card">
              <v-list-item
                v-for="friend in computePendingOutgoing"
                :key="friend.id"
              >
                <v-list-item-avatar>
                  <v-list-item-avatar
                    :color="$vuetify.theme.themes.dark.primary"
                  >
                    <img
                      :src="friend.user2.discussionsImage"
                      v-if="friend.user2.discussionsImage"
                    />
                    <v-icon v-else> mdi-account </v-icon>
                  </v-list-item-avatar>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title>
                    {{ friend.user2.sussiId }}
                  </v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon>
                    <v-icon color="error" @click="removeFriend(friend)"
                      >mdi-close</v-icon
                    >
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card>
          <v-toolbar color="toolbar">
            <v-toolbar-title> Friends </v-toolbar-title>
          </v-toolbar>
          <v-card color="card">
            <v-list color="card">
              <v-list-item v-for="friend in computeAccepted" :key="friend.id">
                <v-list-item-avatar>
                  <v-list-item-avatar
                    :color="$vuetify.theme.themes.dark.primary"
                  >
                    <img
                      :src="friend.user2.discussionsImage"
                      v-if="friend.user2.discussionsImage"
                    />
                    <v-icon v-else> mdi-account </v-icon>
                  </v-list-item-avatar>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title>
                    {{ friend.user2.sussiId }}
                  </v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon>
                    <v-icon color="error" @click="removeFriend(friend)"
                      >mdi-close</v-icon
                    >
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card>
        </v-card>
      </v-tab-item>
      <v-tab-item
        :style="
          'background-color: ' +
          $vuetify.theme.themes[$vuetify.theme.dark ? 'dark' : 'light'].card
        "
      >
        <v-card color="card">
          <v-container>
            <b
              >Your username is: {{ $store.state.user.bcUser.sussiId }}:{{
                $store.state.school.instance
              }}</b
            >
            <p>
              To create a conversation with a user, you first need to be friends
              with them. You can add them here, their username will be their
              student code/Compass username, with an optional prefix of
              :school-id if you're adding someone outside of your current
              school.
            </p>
            <v-text-field
              @keyup.enter="addFriend"
              label="Friend username"
              :placeholder="'BTR0001:' + $store.state.school.instance"
              v-model="friend"
            >
            </v-text-field>
          </v-container>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="addFriend">
              Send Request
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import AjaxErrorHandler from "@/lib/errorHandler"

export default {
  name: "CommunicationsFriends",
  data() {
    return {
      friends: [],
      friend: ""
    }
  },
  computed: {
    computeAccepted() {
      return this.friends.filter((friend) => friend.status === "accepted")
    },
    computePendingOutgoing() {
      return this.friends.filter((friend) => friend.status === "pending")
    },
    computePendingIncoming() {
      return this.friends.filter(
        (friend) => friend.status === "pendingCanAccept"
      )
    }
  },
  methods: {
    acceptFriend(friend) {
      this.axios
        .put("/api/v1/communications/friends/" + friend.id, {
          friend: friend.id,
          status: "accepted"
        })
        .then(() => {
          this.getFriends()
        })
        .catch((error) => {
          AjaxErrorHandler(error)
        })
    },
    removeFriend(friend) {
      this.axios
        .delete("/api/v1/communications/friends/" + friend.id)
        .then(() => {
          this.getFriends()
        })
        .catch((error) => {
          AjaxErrorHandler(error)
        })
    },
    addFriend() {
      this.axios
        .post("/api/v1/communications/friends", {
          friend: this.friend
        })
        .then(() => {
          this.getFriends()
          this.$toast.success("Friend request sent!")
        })
        .catch((e) => {
          AjaxErrorHandler(this.$store)(e)
        })
    },
    getFriends() {
      this.axios.get("/api/v1/communications/friends").then((res) => {
        this.friends = res.data
      })
    }
  },
  mounted() {
    this.getFriends()
    this.$socket.on("friendRequest", () => {
      this.getFriends()
    })
  }
}
</script>

<style scoped></style>
