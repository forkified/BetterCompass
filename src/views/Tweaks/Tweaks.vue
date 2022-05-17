<template>
  <div id="tweaks">
    <v-container>
      <v-card color="card" class="rounded-xl">
        <v-toolbar color="toolbar">
          <v-toolbar-title>Tweaks</v-toolbar-title>
        </v-toolbar>
        <v-container>
          <v-row>
            <v-col v-for="tweak in tweaks" :key="tweak.id"> </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import AjaxErrorHandler from "@/lib/errorHandler"

export default {
  name: "Tweaks",
  data() {
    return {
      tweaks: []
    }
  },
  methods: {
    getTweaks() {
      this.axios
        .get("/api/v1/tweaks")
        .then((res) => {
          this.tweaks = res.data
        })
        .catch((e) => {
          AjaxErrorHandler(this.$store)(e)
        })
    }
  },
  mounted() {
    this.getTweaks()
  }
}
</script>

<style scoped></style>
