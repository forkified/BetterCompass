<template>
  <div v-if="$store.state.site.release === 'dev'" id="communications">
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
              <template v-if="typeof data.item !== 'object'">
                <v-list-item-content v-text="data.item"></v-list-item-content>
              </template>
              <template v-else>
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
            </template>
          </v-autocomplete>
          <small
            >If the person you want to add doesn't appear, ensure they have
            BetterCompass Communications enabled.</small
          >
        </v-container>
      </v-card>
    </v-dialog>
    <v-container
      fluid
      v-if="$store.state.user?.bcUser?.privacy.communications.enabled"
    >
      <v-row>
        <v-col cols="12" sm="3">
          <v-app-bar flat color="rgba(0,0,0,0)">
            <v-btn class="rounded-xl" x-large block @click="dialogs.new = true">
              New Conversation
            </v-btn>
          </v-app-bar>
          <v-app-bar flat color="card">
            <v-toolbar-title class="title"> Communications </v-toolbar-title>

            <v-spacer></v-spacer>
            <v-btn icon>
              <v-icon>fas fa-ellipsis-h</v-icon>
            </v-btn>
          </v-app-bar>

          <v-text-field
            filled
            label="Search..."
            append-icon="mdi-magnify"
            color="grey"
          ></v-text-field>

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
                    color="green"
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
                      <v-icon v-if="item.chat.type === 'direct'">
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
                        {{ item.chat.name }}
                      </v-list-item-title>
                      <v-list-item-title v-else>
                        {{ item.chat.name }}
                      </v-list-item-title>

                      <v-list-item-subtitle v-if="item.chat.type === 'group'">
                        {{ item.chat.users.length }} Members
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </template>
                </v-list-item>

                <v-divider
                  v-if="index < items.length - 1"
                  :key="index"
                ></v-divider>
              </template>
            </v-list-item-group>
          </v-list>
        </v-col>
      </v-row>
      <router-view></router-view>
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
      selected: [2],
      items: [],
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
    viewport() {
      let height = window.innerHeight
      return (height -= document.querySelector("#navbar").clientHeight + 24)
    }
  },
  methods: {
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
    },
    getChats() {
      this.axios.get("/api/v1/communications").then((res) => {
        this.items = res.data
      })
    }
  },
  mounted() {
    this.getChats()
  },
  watch: {
    "newConversation.name"() {
      this.searchUsers()
    }
  }
}
</script>

<style scoped></style>
