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
        const parsed =
          JSON.parse(
            res.data
              .split("(self.__precacheManifest||[]).concat(")[1]
              .split(");")[0]
          ) ||
          JSON.parse(
            res.data
              .split("(self.__precacheManifest || []).concat(")[1]
              .split(");")[0]
          )
        document.open()
        document.write(
          `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><meta http-equiv="X-UA-Compatible" content="IE=edge" /><meta name="viewport" content="width=device-width,initial-scale=1" /><link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900" /><title>BetterCompass</title></head><body><noscript><strong>We're sorry but BetterCompass doesn't work properly without JavaScript enabled. Please enable it to continue.</strong></noscript><div id="app"></div></body></html>`
        )
        parsed.forEach((asset) => {
          if (asset.url.endsWith(".js")) {
            if (
              asset.url.startsWith("/js/app") ||
              asset.url.startsWith("/js/chunk-vendors") ||
              asset.url.startsWith("/app") ||
              asset.url.startsWith("/chunk-vendors")
            ) {
              const script = document.createElement("script")
              script.src = asset.url
              document.body.appendChild(script)
            }
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
