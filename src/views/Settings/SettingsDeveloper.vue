<template>
  <div id="settings-developer" v-if="$store.state.site.release === 'dev'">
    <v-container>
      <v-btn @click="disableDevMode">Disable Developer Mode</v-btn>
      <v-btn @click="enableStagingMode" class="ml-2">Enable Staging Mode</v-btn>
      <v-btn @click="enableAdminMode" class="ml-2">Enable Admin Mode</v-btn>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "SettingsDeveloper",
  methods: {
    disableDevMode() {
      localStorage.removeItem("debugModeEnabled")
      this.$store.state.site.release = "stable"
    },
    enableStagingMode() {
      this.$store.state.site.release = "beta"
    },
    enableAdminMode() {
      this.$store.state.user.bcUser.admin = true
    }
  }
}
</script>

<style scoped></style>
