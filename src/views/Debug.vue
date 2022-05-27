<template>
  <v-container>
    <v-btn @click="getTokenInfo"> (DBG) View Token </v-btn>
    <p v-if="token">
      ASP.NET_SessionId: {{ token }}
      <br />
      BetterCompass Session Token: {{ bcToken }}
    </p>
  </v-container>
</template>

<script>
export default {
  name: "Debug",
  data() {
    return {
      token: "",
      bcToken: ""
    }
  },
  methods: {
    getTokenInfo() {
      this.axios.post("/api/v1/user/getToken").then((res) => {
        this.token = res.data.token
        this.bcToken = res.data.bcToken
      })
    }
  }
}
</script>

<style scoped></style>
