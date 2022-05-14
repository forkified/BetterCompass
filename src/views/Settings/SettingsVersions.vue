<template>
  <div>
    <v-container>
      <v-card
        class="mb-3"
        v-for="version in versions"
        :key="version.version"
        @click="loadVersion(version)"
      >
        <v-card-title>
          {{ version.versionNumber }}
        </v-card-title>
        <v-card-subtitle>
          {{ version.versionBuildDate }}<br />
          {{ version.version }}
        </v-card-subtitle>
      </v-card>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "SettingsVersions",
  data() {
    return {
      versions: []
    }
  },
  methods: {
    loadVersion(version) {
      this.axios.get(version.url).then((res) => {
        const parsed = JSON.parse(
          res.data
            .split("(self.__precacheManifest || []).concat(")[1]
            .split(");")[0]
        )
        document.open()
        document.write("<head><title>BetterCompass</title></head><body></body>")
        parsed.forEach((asset) => {
          if (asset.url.endsWith(".js")) {
            const script = document.createElement("script")
            script.src = asset.url
            document.body.appendChild(script)
          } else if (asset.url.endsWith(".css")) {
            const link = document.createElement("link")
            link.rel = "stylesheet"
            link.href = asset.url
            document.head.appendChild(link)
          }
        })
      })
    },
    getVersions() {
      this.axios.get("/api/v1/user/versions").then((res) => {
        this.versions = res.data.sort((a, b) => {
          return a.versionNumber.localeCompare(b.versionNumber)
        })
      })
    }
  },
  mounted() {
    this.getVersions()
  }
}
</script>

<style scoped></style>
