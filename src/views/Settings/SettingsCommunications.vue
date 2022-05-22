<template>
  <div>
    <v-container>
      <v-switch
        inset
        v-model="messageAudio"
        label="Play sound effect on new message"
      >
      </v-switch>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "SettingsCommunications",
  data() {
    return {
      messageAudio: true
    }
  },
  mounted() {
    if (localStorage.getItem("messageAudio")) {
      this.messageAudio = JSON.parse(localStorage.getItem("messageAudio"))
    }
  },
  watch: {
    messageAudio() {
      localStorage.setItem("messageAudio", this.messageAudio)
    }
  }
}
</script>

<style scoped></style>
