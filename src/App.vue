<template>
  <v-app
    :style="
      'background-color: ' +
      $vuetify.theme.themes[$vuetify.theme.dark ? 'dark' : 'light'].bg
    "
  >
    <v-overlay :value="$store.state.site.loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <!-- theme engine editors -->
    <vue-final-modal
      v-model="$store.state.themeEngine.editor"
      classes="modal-container"
      content-class="modal-content"
      :drag="true"
      :hide-overlay="true"
      :resize="false"
      :click-to-close="false"
      drag-selector=".editor__toolbar"
      :prevent-click="true"
      :lock-scroll="true"
    >
      <v-card
        color="card lighten-1"
        class="rounded-xl"
        elevation="12"
        max-width="900px"
        max-height="700px"
      >
        <v-card-title color="toolbar" class="editor__toolbar v-toolbar">
          <v-toolbar-title>
            Theme
            {{
              $store.state.themeEngine.type === "create" ? "Creator" : "Editor"
            }}
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <span v-on="on" v-bind="attrs">
                  <v-btn
                    fab
                    small
                    text
                    @click="$store.dispatch('randomizeTheme')"
                  >
                    <v-icon>mdi-dice-multiple</v-icon>
                  </v-btn>
                </span>
              </template>
              <span> Randomize theme </span>
            </v-tooltip>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="$store.state.themeEngine.editor = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-container>
          <v-alert type="info" text>
            You can now view your changes in real time by navigating anywhere
            throughout BetterCompass with the editor open.
          </v-alert>
          <v-card-actions>
            <v-btn
              color="primary"
              text
              @click="
                $store.dispatch('saveTheme', { theme: null, type: null })
                $store.state.themeEngine.editor = false
              "
              >{{
                $store.state.themeEngine.type === "create"
                  ? "Create & Apply"
                  : "Save Edits"
              }}</v-btn
            >
            <v-btn
              color="primary"
              text
              @click="
                $store.dispatch('saveTheme', { theme: null, type: 'copy' })
              "
              v-if="$store.state.themeEngine.type === 'edit'"
              >Save a Copy</v-btn
            >
            <v-btn
              color="error darken-1"
              text
              @click="$store.dispatch('discardTheme')"
              >Discard</v-btn
            >
          </v-card-actions>
          <v-form>
            <v-text-field
              v-model="$store.state.themeEngine.theme.name"
              class="mx-3"
              label="Theme Name"
              required
            ></v-text-field>
            <v-select
              :items="intendedFor"
              label="Intended for"
              class="mx-3"
              v-model="$store.state.themeEngine.theme.primaryType"
            >
            </v-select>
            <v-text-field
              v-model="creatorJSON"
              label="JSON"
              class="mx-3"
            ></v-text-field>
            <v-btn @click="$store.state.themeEngine.cssEditor = true">
              Custom CSS
            </v-btn>
            <h2
              class="ml-2 mt-2 mb-3"
              v-if="
                $store.state.themeEngine.theme.primaryType === 'dark' ||
                $store.state.themeEngine.theme.primaryType === 'all'
              "
            >
              Dark:
            </h2>
            <v-row
              v-if="
                $store.state.themeEngine.theme.primaryType === 'dark' ||
                $store.state.themeEngine.theme.primaryType === 'all'
              "
            >
              <v-col
                sm="3"
                v-for="(item, index) in $store.state.themeEngine.theme.dark"
                :key="index + '-dark-card'"
              >
                <v-card color="card">
                  <h3 class="ml-2 mt-2 mb-2">
                    {{ friendlyName(index) }}
                  </h3>
                  <v-menu offset-y>
                    <template v-slot:activator="{ on }">
                      <v-card
                        class="mb-2 mx-2"
                        :color="$store.state.themeEngine.theme.dark[index]"
                        v-on="on"
                      >
                        <v-container></v-container>
                      </v-card>
                    </template>
                    <v-color-picker
                      v-model="$store.state.themeEngine.theme.dark[index]"
                      show-swatches
                      hide-inputs
                    ></v-color-picker>
                  </v-menu>
                  <v-text-field
                    class="mx-2"
                    label="#HEX"
                    v-model="$store.state.themeEngine.theme.dark[index]"
                  ></v-text-field>
                </v-card>
              </v-col>
            </v-row>
            <h2
              class="ml-2 mt-2 mb-3"
              v-if="
                $store.state.themeEngine.theme.primaryType === 'light' ||
                $store.state.themeEngine.theme.primaryType === 'all'
              "
            >
              Light:
            </h2>
            <v-row
              v-if="
                $store.state.themeEngine.theme.primaryType === 'light' ||
                $store.state.themeEngine.theme.primaryType === 'all'
              "
            >
              <v-col
                sm="3"
                v-for="(item, index) in $store.state.themeEngine.theme.light"
                :key="index + '-light-card'"
              >
                <v-card color="card">
                  <h3 class="ml-2 mt-2 mb-2">
                    {{ friendlyName(index) }}
                  </h3>
                  <v-menu offset-y>
                    <template v-slot:activator="{ on }">
                      <v-card
                        class="mb-2 mx-2"
                        :color="$store.state.themeEngine.theme.light[index]"
                        v-on="on"
                      >
                        <v-container></v-container>
                      </v-card>
                    </template>
                    <v-color-picker
                      v-model="$store.state.themeEngine.theme.light[index]"
                      show-swatches
                      hide-inputs
                    ></v-color-picker>
                  </v-menu>
                  <v-text-field
                    class="mx-2"
                    label="#HEX"
                    v-model="$store.state.themeEngine.theme.light[index]"
                  ></v-text-field>
                </v-card>
              </v-col>
            </v-row>
          </v-form>
          <v-card-actions>
            <v-btn
              color="primary"
              text
              @click="
                $store.dispatch('saveTheme', { theme: null, type: null })
                $store.state.themeEngine.editor = false
              "
              >{{
                $store.state.themeEngine.type === "create"
                  ? "Create & Apply"
                  : "Save Edits"
              }}</v-btn
            >
            <v-btn
              color="primary"
              text
              @click="
                $store.dispatch('saveTheme', { theme: null, type: 'copy' })
              "
              v-if="$store.state.themeEngine.type === 'edit'"
              >Save a Copy</v-btn
            >
            <v-btn
              color="error darken-1"
              text
              @click="$store.dispatch('discardTheme')"
              >Discard</v-btn
            >
          </v-card-actions>
        </v-container>
      </v-card>
    </vue-final-modal>
    <vue-final-modal
      ref="editor-modal"
      v-model="$store.state.themeEngine.cssEditor"
      classes="modal-container"
      content-class="modal-content"
      :drag="true"
      :hide-overlay="true"
      :resize="true"
      :resize-directions="['r', 'l']"
      :min-width="400"
      :focus-retain="true"
      :click-to-close="false"
      drag-selector=".editor__toolbar"
      :prevent-click="true"
      :lock-scroll="false"
    >
      <v-card
        min-width="100%"
        color="card lighten-1"
        class="rounded-xl"
        elevation="7"
        style="border-radius: 0; padding: 0"
      >
        <v-card-title color="toolbar" class="editor__toolbar v-toolbar">
          <v-toolbar-title>CSS Editor</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="$store.state.themeEngine.cssEditor = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-container>
          <v-row>
            <v-col>
              <v-alert type="info" text class="editor__toolbar">
                CTRL + ALT + D / F9 will toggle all custom CSS styling, works
                anywhere, even outside the editor.</v-alert
              >
              <v-switch
                inset
                label="Live update"
                v-model="$store.state.themeEngine.autoCSS"
              ></v-switch>
              <v-btn
                icon
                class="mb-2"
                @click="
                  $store.dispatch('saveTheme', { theme: null, type: null })
                  $store.dispatch('applyCSS', null)
                "
              >
                <v-icon>mdi-content-save</v-icon>
              </v-btn>
              <v-btn
                icon
                class="mb-2"
                @click="$store.dispatch('applyCSS', null)"
              >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
              <editor
                class="editor"
                v-model="$store.state.themeEngine.theme.css"
                @init="editorInit"
                lang="css"
                :theme="$vuetify.theme.dark ? 'monokai' : 'chrome'"
                height="350"
              ></editor>
            </v-col>
            <v-col v-if="cssTips">
              <v-card-title>
                Tips
                <v-spacer></v-spacer>
                <v-btn icon @click="cssTips = false">
                  <v-icon>mdi-close</v-icon>
                </v-btn></v-card-title
              >
              <v-alert type="error" text>
                This is an alert.<br />
                Try to style it with .v-alert</v-alert
              >
              Here's an example:<br />
              <code class="block"
                >.v-alert {<br />
                background-color: blue !important; <br />}
              </code>
              <v-btn
                class="mt-2 mr-2"
                @click="$toast.success('I have been pressed.')"
                >Here's a button</v-btn
              >
              <v-btn
                class="mt-2"
                text
                color="info"
                @click="$toast.info('This is the second button\'s action.')"
                >Here's another one</v-btn
              >
              <v-card-title> Fonts </v-card-title>
              <code
                class="block"
                style="white-space: pre-line; overflow-wrap: anywhere"
              >
                /* Stop from font breaking CSS code editor */<br />
                .ace_editor div {<br />
                &nbsp;font-family: "JetBrains Mono" !important; <br />}<br />
                div {<br />
                &nbsp;font-family: "Inter", sans-serif;
                <br />}
              </code>
              There are little pre-loaded fonts you can use, they include:
              <ul>
                <li>Roboto (Default)</li>
                <li>Inter</li>
                <li>JetBrains Mono</li>
              </ul>
              You may import your own fonts using
              <code>@import</code>, or use system fonts.
            </v-col>
          </v-row>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="blue darken-1"
              text
              @click="
                $store.dispatch('saveTheme', { theme: null, type: null })
                $store.dispatch('applyCSS', null)
                $store.state.themeEngine.cssEditor = false
              "
            >
              Save Changes
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>
    </vue-final-modal>
    <!-- end theme engine editors -->
    <v-dialog
      v-if="$store.state.user.bcUser"
      v-model="$store.state.user.bcUser.guidedWizard"
      max-width="600px"
    >
      <v-card color="card" class="text-center justify-center">
        <div v-if="guidedWizard.step === 1">
          <v-card-title class="text-center justify-center">
            <span class="headline">Welcome to BetterCompass.</span>
          </v-card-title>
          <v-container>
            <p>
              BetterCompass is an enhanced version of Compass that resolves the
              long standing problems of Compass.
            </p>
            <p>
              Some major improvements that can be seen throughout BetterCompass
              are:
            </p>
            <ul style="list-style-type: none">
              <li>Themes & Customization</li>
              <li>Quick Route Switching</li>
              <li>Significantly Faster</li>
              <li>Consistent and modern UI</li>
              <li>Exclusive Features</li>
              <li>Mobile compatibility & Responsiveness</li>
              <li>Enhanced calendar</li>
            </ul>

            <v-btn
              color="red"
              class="mt-5 mr-3"
              @click="completeGuidedWizard()"
              :loading="loadingGuidedWizard"
            >
              <v-icon left>mdi-arrow-left</v-icon>
              Skip
            </v-btn>

            <v-btn color="primary" class="mt-5" @click="guidedWizard.step = 2">
              Continue
              <v-icon right>mdi-arrow-right</v-icon>
            </v-btn>
          </v-container>
        </div>
        <div v-if="guidedWizard.step === 2">
          <v-card-title class="text-center justify-center">
            <span class="headline">BetterCompass, your way.</span>
          </v-card-title>
          <v-card-subtitle class="text-center justify-center">
            <span class="subtitle-1">Let's choose a theme.</span>
          </v-card-subtitle>
          <v-container class="text-center justify-center">
            <v-flex>
              <v-layout column align-center>
                <v-switch
                  inset
                  v-model="$store.state.user.bcUser.theme"
                  @change="saveSettings"
                  true-value="dark"
                  false-value="light"
                  label="Dark Mode"
                  color="primary"
                  class="mt-5"
                ></v-switch>
              </v-layout>
            </v-flex>
            <v-card-text>
              <v-card
                class="my-2"
                @click="setTheme(theme)"
                elevation="7"
                v-for="(theme, index) in computeThemes"
                :key="index"
              >
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title class="font-weight-bold">
                      {{ theme.name }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ theme.public ? "Public" : "Private" }}, created by
                      {{ theme.user.sussiId }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-avatar
                      color="success"
                      size="30"
                      v-if="name === theme.id"
                    >
                      <v-icon>mdi-check</v-icon>
                    </v-avatar>
                  </v-list-item-action>
                </v-list-item>
              </v-card>
            </v-card-text>
            <v-btn
              color="primary"
              class="mt-5 mr-3"
              @click="guidedWizard.step = 1"
            >
              <v-icon left>mdi-arrow-left</v-icon>
              Previous
            </v-btn>
            <v-btn color="primary" class="mt-5" @click="guidedWizard.step = 3">
              Continue
              <v-icon right>mdi-arrow-right</v-icon>
            </v-btn>
          </v-container>
        </div>
        <div v-if="guidedWizard.step === 3">
          <v-card-title class="text-center justify-center">
            <span class="headline">Other Preferences</span>
          </v-card-title>
          <v-card-subtitle class="text-center justify-center">
            <span class="subtitle-1"
              >If you wish, you may modify some additional settings.</span
            >
          </v-card-subtitle>
          <v-container class="text-center justify-center">
            <v-flex>
              <v-layout column align-center>
                <v-switch
                  @change="saveSettings"
                  v-model="$store.state.user.bcUser.learningTaskNotification"
                  inset
                  label="Show overdue learning task warning"
                  color="warning"
                ></v-switch>
                <v-switch
                  @change="saveSettings"
                  v-model="$store.state.user.bcUser.weather"
                  inset
                  label="Show weather widget"
                ></v-switch>
                <v-switch
                  @change="saveSettings"
                  v-model="$store.state.user.bcUser.minimizeHeaderEvents"
                  inset
                  label="Minimize header events"
                ></v-switch>
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <div v-on="on" v-bind="attrs">
                      <v-switch
                        @change="saveSettings"
                        v-model="$store.state.user.bcUser.calendarAutoJump"
                        inset
                        label="Calendar Auto Jump"
                      ></v-switch>
                    </div>
                  </template>
                  <span>
                    This will skip to Monday on Saturday and Sunday.
                  </span>
                </v-tooltip>
              </v-layout>
            </v-flex>
            <v-btn
              color="primary"
              class="mt-5 mr-3"
              @click="guidedWizard.step = 2"
            >
              <v-icon left>mdi-arrow-left</v-icon>
              Previous
            </v-btn>
            <v-btn
              color="primary"
              class="mt-5"
              @click="completeGuidedWizard()"
              :loading="loadingGuidedWizard"
            >
              Finish
            </v-btn>
          </v-container>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="$store.state.modals.search" max-width="600px">
      <v-card color="card">
        <v-toolbar color="toolbar">
          <v-toolbar-title> BetterCompass QuickSwitcher </v-toolbar-title>
        </v-toolbar>
        <v-container>
          <v-autocomplete
            auto-select-first
            v-model="search"
            :items="$store.state.quickSwitchCache"
            item-text="subjectLongName"
            label="Search"
            outlined
            autofocus
            return-object
            :search-input.sync="searchInput"
          >
          </v-autocomplete>
        </v-container>
      </v-card>
    </v-dialog>
    <Header></Header>
    <v-main>
      <v-container
        v-if="
          $store.state.user?.bcUser?.compact === 'nagPending' &&
          $vuetify.breakpoint.lgAndDown &&
          !$vuetify.breakpoint.mobile
        "
      >
        <v-alert dense text color="info" dismissible v-model="compactModeNag">
          Introducing <strong>Compact Mode</strong>, a better experience for
          lower resolution devices.
          <v-btn
            to="/settings/appearance"
            text
            color="primary"
            outlined
            class="ml-1"
          >
            Settings
          </v-btn>
        </v-alert>
      </v-container>
      <v-container
        v-if="$store.state.site.latestVersion > $store.state.versioning.version"
        id="update-notify-banner"
      >
        <v-alert class="mx-4 rounded-xl" type="info" text dismissible>
          BetterCompass just got better. Please CTRL+R / ⌘+R to update. (You are
          on version {{ $store.state.versioning.version }}, and the latest
          version is {{ $store.state.site.latestVersion }})
        </v-alert>
      </v-container>
      <v-container
        v-if="$store.state.site.notification && $store.state.user.bcUser"
        id="notification-banner"
      >
        <v-alert
          text
          class="mx-4 rounded-xl"
          dismissible
          :type="$store.state.site.notificationType"
        >
          {{ $store.state.site.notification }}
        </v-alert>
      </v-container>
      <v-container v-if="!$store.state.online" id="offline-notify-banner">
        <v-alert text class="mx-4" type="warning">
          You are currently offline. BetterCompass functionality is limited.
        </v-alert>
      </v-container>
      <v-container
        v-if="baseRole() !== 'Student' && baseRole() !== 'Not Authenticated'"
        id="account-notify-banner"
      >
        <v-alert class="mx-4 rounded-xl" dismissible type="info">
          {{ baseRole() }} accounts are not officially supported by
          BetterCompass yet.
        </v-alert>
      </v-container>
      <router-view
        :style="
          'background-color: ' +
          $vuetify.theme.themes[$vuetify.theme.dark ? 'dark' : 'light'].bg
        "
      />
    </v-main>
  </v-app>
</template>
<style></style>
<script>
import Header from "./components/Header.vue"
import AjaxErrorHandler from "@/lib/errorHandler"
import Vue from "vue"
import Vuetify from "@/plugins/vuetify"
import { VueFinalModal } from "vue-final-modal"

export default {
  name: "App",
  components: {
    Header,
    VueFinalModal,
    editor: require("vue2-ace-editor")
  },
  data: () => ({
    compactModeNag: true,
    intendedFor: [
      { text: "All base themes", value: "all" },
      { text: "Dark theme", value: "dark" },
      { text: "Light theme", value: "light" }
    ],
    fakeEvents: [
      {
        name: "English",
        content: "English",
        color: "#dce6f4",
        start: new Date().setHours(9, 0, 0, 0),
        end: new Date().setHours(10, 0, 0, 0),
        timed: true,
        activityType: 1,
        activityId: 0,
        calendarId: 0
      },
      {
        name: "Maths",
        content: "Maths",
        color: "#f4dcdc",
        start: new Date().setHours(10, 0, 0, 0),
        end: new Date().setHours(11, 0, 0, 0),
        timed: true,
        activityType: 1,
        activityId: 0,
        instanceId: 0,
        calendarId: 0
      },
      {
        name: "Lunch Break",
        content: "Lunch Break",
        color: "#dce6f4",
        start: new Date().setHours(11, 0, 0, 0),
        end: new Date().setHours(11, 30, 0, 0),
        timed: true,
        activityType: 1,
        activityId: 0,
        instanceId: 0,
        calendarId: 0
      },
      {
        name: "Excursion",
        content: "Excursion",
        color: "#dce6f4",
        start: new Date().setHours(11, 0, 0, 0),
        end: new Date().setHours(13, 30, 0, 0),
        timed: true,
        activityType: 1,
        activityId: 0,
        instanceId: 0,
        calendarId: 0
      }
    ],
    loading: false,
    defineAccent: false,
    accent: "#0179f3",
    loadingGuidedWizard: false,
    guidedWizard: {
      step: 1
    },
    connectionLoading: false,
    update: false,
    search: "",
    results: [],
    searchInput: null,
    themes: [],
    cssTips: true
  }),
  computed: {
    creatorJSON: {
      get() {
        return JSON.stringify(this.$store.state.themeEngine.theme)
      },
      set(value) {
        this.$store.state.themeEngine.theme = JSON.parse(value)
      }
    },
    today() {
      return this.$date().format("YYYY-MM-DD")
    },
    computeThemes() {
      let array = []
      if (this.$vuetify.theme.dark) {
        array = this.themes.filter(
          (theme) => theme.primaryType === "dark" || theme.primaryType === "all"
        )
        return array
      } else {
        array = this.themes.filter(
          (theme) =>
            theme.primaryType === "light" || theme.primaryType === "all"
        )
        return array
      }
    }
  },
  methods: {
    communicationsIdleCheck() {
      let time
      let idle = false
      window.onload = resetTimer
      document.onmousemove = resetTimer
      document.onkeydown = resetTimer
      document.onmousedown = resetTimer
      let self = this
      function setIdle() {
        if (!idle) {
          self.$socket.emit("idle")
          idle = true
          console.log("idle")
        } else {
          self.$socket.emit("online")
          idle = false
          console.log("online")
        }
      }

      function resetTimer() {
        clearTimeout(time)
        if (idle) {
          setIdle()
        }
        time = setTimeout(
          function () {
            setIdle()
          }.bind(this.$socket),
          300000
        )
      }
    },
    friendlyName(index) {
      if (index === "calendarNormalActivity") {
        return "Standard Class"
      } else if (index === "calendarActivityType7") {
        return "Relief Event"
      } else if (index === "calendarActivityType8") {
        return "Generic Type 8"
      } else if (index === "calendarActivityType10") {
        return "Learning Task"
      } else if (index === "calendarExternalActivity") {
        return "External Activity"
      } else if (index === "bg") {
        return "Background"
      } else if (index === "dark") {
        return "Sidebar & Header"
      } else {
        return index.charAt(0).toUpperCase() + index.slice(1)
      }
    },
    computeColor(event) {
      if (this.$vuetify?.theme?.themes) {
        if (event.color === "#003300") {
          return this.$vuetify.theme.themes[
            this.$store.state.user.bcUser.theme || "dark"
          ].calendarActivityType8
        } else if (event.color === "#133897") {
          return this.$vuetify.theme.themes[
            this.$store.state.user.bcUser.theme || "dark"
          ].calendarExternalActivity
        } else if (event.activityType === 7 || event.color === "#f4dcdc") {
          return this.$vuetify.theme.themes[
            this.$store.state.user.bcUser.theme || "dark"
          ].calendarActivityType7
        } else if (event.color === "#dce6f4") {
          return this.$vuetify.theme.themes[
            this.$store.state.user.bcUser.theme || "dark"
          ].calendarNormalActivity
        } else if (event.activityType === 10) {
          return this.$vuetify.theme.themes[
            this.$store.state.user.bcUser.theme || "dark"
          ].calendarActivityType10
        } else {
          return this.$vuetify.theme.themes[
            this.$store.state.user.bcUser.theme || "dark"
          ].calendarNormalActivity
        }
      }
    },
    editorInit() {
      require("brace/ext/language_tools")
      require("brace/mode/css")
      require("brace/mode/less")
      require("brace/theme/monokai")
      require("brace/theme/chrome")
      require("brace/snippets/css")
    },
    baseRole() {
      if (this.$store.state.user?.baseRole) {
        return (
          this.$store.state.user.baseRole
            .toLowerCase()
            .charAt(0)
            .toUpperCase() +
          this.$store.state.user.baseRole.toLowerCase().slice(1)
        )
      } else {
        return "Not Authenticated"
      }
    },
    saveSettings() {
      this.loading = true
      this.$vuetify.theme.dark = this.$store.state.user.bcUser?.theme === "dark"
      this.$store
        .dispatch("saveOnlineSettings")
        .then(() => {
          this.loading = false
        })
        .catch((e) => {
          this.loading = false
          AjaxErrorHandler(this.$store)(e)
        })
    },
    completeGuidedWizard() {
      this.loadingGuidedWizard = true
      this.$store.dispatch("saveOnlineSettings", {
        guidedWizard: false
      })
      this.$store.dispatch("getUserInfo").then(() => {
        this.loadingGuidedWizard = false
      })
    },
    getThemes() {
      this.axios.get("/api/v1/themes").then((res) => {
        this.themes = res.data.map((theme) => {
          return {
            id: theme.id,
            name: theme.name,
            primaryType: theme.theme.primaryType,
            dark: theme.theme.dark,
            light: theme.theme.light,
            public: theme.public,
            user: theme.user,
            userId: theme.userId
          }
        })
      })
    },
    setTheme(theme) {
      const name = theme.id
      const dark = theme.dark
      const light = theme.light
      this.$vuetify.theme.themes.dark = dark
      this.$vuetify.theme.themes.light = light
      this.$vuetify.theme.themes.name = name
      this.$vuetify.theme.themes.primaryType = theme.primaryType
      if (this.accent && this.defineAccent) {
        this.$vuetify.theme.themes.light.primary = this.accent
        this.$vuetify.theme.themes.dark.primary = this.accent
        this.$store.state.user.bcUser.accentColor = this.accent
      } else {
        this.$store.state.user.bcUser.accentColor = null
      }
      this.name = name
      this.axios
        .put("/api/v1/user/settings/theme", {
          id: name,
          accent: this.defineAccent ? this.accent : null
        })
        .catch((e) => {
          AjaxErrorHandler(this.$store)(e)
        })
    },
    retryConnection() {
      this.connectionLoading = true
      this.$store.dispatch("getState").finally(() => {
        this.connectionLoading = false
      })
    },
    validate(value, defaultValue) {
      if (value === undefined || value === null) {
        return defaultValue
      } else {
        return value
      }
    }
  },
  mounted() {
    if (localStorage.getItem("cssTipsDismissed")) {
      this.cssTips = false
    }
    window.addEventListener("offline", () => {
      this.$store.commit("setOnline", false)
      this.$store.dispatch("getState")
    })
    window.addEventListener("online", () => {
      this.$store.commit("setOnline", true)
      this.$store.dispatch("getState")
      this.$store.dispatch("getUserInfo")
    })
    Vue.axios.defaults.headers.common["CompassAPIKey"] =
      localStorage.getItem("apiKey")
    Vue.axios.defaults.headers.common["Authorization"] =
      localStorage.getItem("bcToken")
    document.title = this.$route.name
      ? this.$route.name + " - BetterCompass"
      : "BetterCompass"
    this.$store.commit("setLoading", true)
    this.$vuetify.theme.dark =
      this.$store.state.user.bcUser?.theme === "dark" || true
    this.$store.commit("setSchool", {
      name: localStorage.getItem("schoolName"),
      id: localStorage.getItem("schoolId"),
      fqdn: localStorage.getItem("schoolFqdn"),
      instance: localStorage.getItem("schoolInstance")
    })
    this.axios.defaults.headers.common["compassInstance"] =
      localStorage.getItem("schoolInstance")
    this.axios.defaults.headers.common["compassSchoolId"] =
      localStorage.getItem("schoolId")
    if (JSON.parse(localStorage.getItem("userCache"))?.bcUser?.id) {
      const user = JSON.parse(localStorage.getItem("userCache"))
      const name = user.bcUser.themeObject.id
      const dark = user.bcUser.themeObject.theme.dark
      const light = user.bcUser.themeObject.theme.light
      if (user.bcUser.accentColor) {
        user.bcUser.themeObject.theme.dark.primary = user.bcUser.accentColor
        user.bcUser.themeObject.theme.light.primary = user.bcUser.accentColor
      }
      if (JSON.parse(localStorage.getItem("subjectsCache"))) {
        this.$store.commit(
          "setSubjects",
          JSON.parse(localStorage.getItem("subjectsCache"))
        )
      }
      Vuetify.framework.theme.themes.dark = dark
      Vuetify.framework.theme.themes.light = light
      Vuetify.framework.theme.themes.name = name
      Vuetify.framework.theme.themes.primaryType =
        user.bcUser.themeObject.theme.primaryType
      this.$store.commit(
        "setUser",
        JSON.parse(localStorage.getItem("userCache"))
      )
    }
    if (localStorage.getItem("calendarCache")?.length) {
      this.$store.commit(
        "setCalendar",
        JSON.parse(localStorage.getItem("calendarCache")).map((event) => {
          return {
            ...event,
            start: new Date(event.start),
            end: new Date(event.finish)
          }
        })
      )
    }
    this.getThemes()
    this.$store.dispatch("getState")
    this.$store.dispatch("checkAuth").catch(() => {
      this.$store.dispatch("logout")
      this.$router.push("/login")
    })
    this.$store
      .dispatch("getUserInfo")
      .then(() => {
        this.communicationsIdleCheck()
        this.$store.dispatch("getCommunicationsUnread")
        this.$socket.on("message", (message) => {
          this.$store.state.communicationNotifications += 1
          if (
            (this.$route.name !== "Communications" &&
              this.$store.state.user.bcUser.storedStatus !== "busy") ||
            (this.$route.name === "Communications" &&
              !document.hasFocus() &&
              this.$store.state.user.bcUser.storedStatus !== "busy")
          ) {
            if (localStorage.getItem("messageAudio")) {
              if (JSON.parse(localStorage.getItem("messageAudio"))) {
                new Audio(require("@/assets/audio/message.wav")).play()
              }
            } else {
              new Audio(require("@/assets/audio/message.wav")).play()
            }
            this.$notification.show(
              message.user.sussiId + " (" + message.chat.name + ")",
              {
                body: message.content,
                icon: message.user.avatar
                  ? "/usercontent/" + message.user.avatar
                  : null
              },
              {}
            )
            this.$toast.info(
              "Message: " +
                message.content +
                "\n\n" +
                "From: " +
                message.user.sussiId +
                "\n" +
                "Sent in: " +
                message.chat.name,
              {
                onClick: () => {
                  this.$router.push("/communications/" + message.associationId)
                }
              }
            )
          }
        })
        if (this.$store.state.user.bcUser.storedStatus !== "busy") {
          this.$socket.on("friendRequest", (message) => {
            this.$notification.show(
              message.user.sussiId,
              {
                body: message.user.sussiId + " has sent a friend request",
                icon: message.user.avatar
                  ? "/usercontent/" + message.user.avatar
                  : null
              },
              {}
            )
            new Audio(require("@/assets/audio/message.wav")).play()
            this.$toast.info("Friend request sent by " + message.user.sussiId)
          })
        }
        this.$store.commit("setWSConnected", true)
        this.$socket.on("disconnect", () => {
          this.$store.commit("setWSConnected", false)
        })
        this.$socket.on("connect", () => {
          this.$store.commit("setWSConnected", true)
        })
        this.$socket.on("siteState", (state) => {
          this.$store.state.site.latestVersion = state.latestVersion
          this.$store.state.site.notification = state.notification
          this.$store.state.site.notificationType = state.notificationType
        })
        setInterval(() => {
          this.$socket.emit("ping")
        }, 10000)
        // eslint-disable-next-line no-undef
        if (JSON.parse(process.env.VUE_APP_MATOMO_ENABLED)) {
          // eslint-disable-next-line no-undef
          _paq.push(["setUserId", this.$store.state.user.bcUser.id])
          // eslint-disable-next-line no-undef
          _paq.push(["trackPageView"])
        }
        this.$store.dispatch("updateQuickSwitch")
      })
      .catch((e) => {
        console.log(e)
        this.$router.push("/login")
      })
  },
  watch: {
    compactModeNag(val) {
      if (!val) {
        this.$store.state.user.bcUser.compact = "disabled"
        this.$store.dispatch("saveOnlineSettings")
      }
    },
    cssTips(val) {
      localStorage.setItem("cssTipsDismissed", !val)
    },
    "$store.state.themeEngine.theme": {
      handler() {
        this.$vuetify.theme.themes.dark =
          this.$store.state.themeEngine.theme.dark
        this.$vuetify.theme.themes.light =
          this.$store.state.themeEngine.theme.light
        this.$vuetify.theme.themes.name = this.$store.state.themeEngine.theme.id
      },
      deep: true
    },
    "$store.state.themeEngine.theme.css"() {
      if (this.$store.state.themeEngine.autoCSS) {
        this.$store.dispatch("applyCSS", null)
      }
    },
    "$store.state.user.bcUser.theme": {
      handler() {
        if (this.$store.state.user?.bcUser?.theme) {
          this.$vuetify.theme.dark =
            this.$store.state.user.bcUser.theme === "dark"
        }
      },
      deep: true
    },
    $route(to) {
      document.title = to.name + " - BetterCompass"
    },
    search() {
      if (this.search) {
        if (this.search.id) {
          this.$router.push("/activity/activity/" + this.search.id)
          this.$store.commit("setSearch", false)
          this.search = null
          this.$nextTick(() => {
            this.searchInput = null
          })
        } else if (this.search.customType === 1) {
          this.$router.push(this.search.route)
          this.$store.commit("setSearch", false)
          this.search = null
          this.$nextTick(() => {
            this.searchInput = null
          })
        }
      }
    }
  }
}
</script>

<style scoped>
::v-deep .modal-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
::v-deep .modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: 90%;
  margin: 0 1rem;
  padding: 1rem;
  border-radius: 0.25rem;
}
.editor__toolbar {
}
.editor {
  height: 100%;
  width: 100%;
  border-radius: inherit !important;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1) !important;
  padding: 20px !important;
  overflow: hidden !important;
  background: inherit;
  font-family: "JetBrains Mono", monospace !important;
}
.ace_gutter {
  background: inherit !important;
}
.block {
  display: block;
  background: none;
  white-space: pre;
  -webkit-overflow-scrolling: touch;
  overflow-x: scroll;
  max-width: 100%;
  min-width: 100px;
  padding: 0;
}
</style>
