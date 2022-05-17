<template>
  <div id="settings-site">
    <v-card-text>
      <v-text-field
        v-model="$store.state.user.bcUser.discussionsImage"
        label="Avatar URL (override, only visible to you)"
        append-outer-icon="mdi-content-save"
        @click:append-outer="saveSettings"
        @keyup.enter="saveSettings"
      ></v-text-field>
    </v-card-text>
    <v-card-text>
      <v-switch
        @change="saveSettings"
        v-model="$store.state.user.bcUser.learningTaskNotification"
        inset
        label="Show overdue learning task warning"
        color="warning"
        :loading="loading"
      ></v-switch>
    </v-card-text>
    <v-card-text>
      <v-switch
        @change="saveSettings"
        v-model="$store.state.user.bcUser.weather"
        inset
        label="Show weather widget"
        :loading="loading"
      ></v-switch>
    </v-card-text>
    <v-card-text v-if="debugModeEnabled">
      <v-alert type="error" text> Seizure warning. </v-alert>
      <v-slider v-model="slider" hint="Speed" max="2000" min="10"></v-slider>
      <v-btn class="mr-2" @click="randomColorTheme()"> Set </v-btn>
      <v-btn @click="stopColorTheme()"> Stop </v-btn>
    </v-card-text>
    <v-card-text>
      <p>
        Minimize header events has been replaced.<br />You can now disable
        individual calendars via Calendar Settings on the homepage.
      </p>
    </v-card-text>
    <v-card-text v-if="this.$store.state.site.release === 'dev'">
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <div v-on="on" v-bind="attrs">
            <v-switch
              @change="saveSettings"
              v-model="$store.state.user.bcUser.cache"
              inset
              label="Offline caching"
            ></v-switch>
          </div>
        </template>
        <span>
          This will cache your calendar events, and user information for offline
          usage that is relevant for 2 weeks. (This may pose a privacy/security
          risk, as it is stored in your browser's local storage.)
        </span>
      </v-tooltip>
    </v-card-text>
    <v-card-text>
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <div v-on="on" v-bind="attrs">
            <v-switch
              @change="saveSettings"
              v-model="$store.state.user.bcUser.calendarAutoJump"
              inset
              label="Calendar Auto Jump"
              :loading="loading"
            ></v-switch>
          </div>
        </template>
        <span> This will skip to Monday on Saturday and Sunday. </span>
      </v-tooltip>
    </v-card-text>
  </div>
</template>

<script>
import AjaxErrorHandler from "@/lib/errorHandler"

export default {
  name: "SettingsSite",
  data() {
    return {
      loading: false,
      interval: null,
      slider: 300
    }
  },
  computed: {
    debugModeEnabled() {
      if (localStorage.getItem("debugModeEnabled")) {
        return JSON.parse(localStorage.getItem("debugModeEnabled"))
      } else {
        return false
      }
    }
  },
  methods: {
    stopColorTheme() {
      clearInterval(this.interval)
    },
    randomColorTheme() {
      clearInterval(this.interval)
      this.interval = setInterval(() => {
        this.$vuetify.theme.themes.light = {
          primary: "#" + Math.floor(Math.random() * 16777215).toString(16),
          secondary: "#" + Math.floor(Math.random() * 16777215).toString(16),
          accent: "#" + Math.floor(Math.random() * 16777215).toString(16),
          error: "#" + Math.floor(Math.random() * 16777215).toString(16),
          info: "#" + Math.floor(Math.random() * 16777215).toString(16),
          success: "#" + Math.floor(Math.random() * 16777215).toString(16),
          warning: "#" + Math.floor(Math.random() * 16777215).toString(16),
          card: "#" + Math.floor(Math.random() * 16777215).toString(16),
          toolbar: "#" + Math.floor(Math.random() * 16777215).toString(16),
          sheet: "#" + Math.floor(Math.random() * 16777215).toString(16),
          text: "#" + Math.floor(Math.random() * 16777215).toString(16),
          dark: "#" + Math.floor(Math.random() * 16777215).toString(16),
          bg: "#" + Math.floor(Math.random() * 16777215).toString(16),
          calendarNormalActivity:
            "#" + Math.floor(Math.random() * 16777215).toString(16),
          calendarActivityType7:
            "#" + Math.floor(Math.random() * 16777215).toString(16),
          calendarActivityType8:
            "#" + Math.floor(Math.random() * 16777215).toString(16),
          calendarActivityType10:
            "#" + Math.floor(Math.random() * 16777215).toString(16),
          calendarExternalActivity: Math.floor(
            Math.random() * 16777215
          ).toString(16)
        }
        this.$vuetify.theme.themes.dark = {
          primary: "#" + Math.floor(Math.random() * 16777215).toString(16),
          secondary: "#" + Math.floor(Math.random() * 16777215).toString(16),
          accent: "#" + Math.floor(Math.random() * 16777215).toString(16),
          error: "#" + Math.floor(Math.random() * 16777215).toString(16),
          info: "#" + Math.floor(Math.random() * 16777215).toString(16),
          success: "#" + Math.floor(Math.random() * 16777215).toString(16),
          warning: "#" + Math.floor(Math.random() * 16777215).toString(16),
          card: "#" + Math.floor(Math.random() * 16777215).toString(16),
          toolbar: "#" + Math.floor(Math.random() * 16777215).toString(16),
          sheet: "#" + Math.floor(Math.random() * 16777215).toString(16),
          text: "#" + Math.floor(Math.random() * 16777215).toString(16),
          dark: "#" + Math.floor(Math.random() * 16777215).toString(16),
          bg: "#" + Math.floor(Math.random() * 16777215).toString(16),
          calendarNormalActivity:
            "#" + Math.floor(Math.random() * 16777215).toString(16),
          calendarActivityType7:
            "#" + Math.floor(Math.random() * 16777215).toString(16),
          calendarActivityType8:
            "#" + Math.floor(Math.random() * 16777215).toString(16),
          calendarActivityType10:
            "#" + Math.floor(Math.random() * 16777215).toString(16),
          calendarExternalActivity: Math.floor(
            Math.random() * 16777215
          ).toString(16)
        }
      }, this.slider)
    },
    saveSettings() {
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
    }
  }
}
</script>

<style scoped></style>
