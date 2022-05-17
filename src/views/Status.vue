<template>
  <div id="service-status">
    <v-container>
      <v-card color="card" class="rounded-xl mb-2" elevation="7">
        <v-overlay :value="loading" absolute>
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
        <v-toolbar color="toolbar">
          <v-toolbar-title> Service Status </v-toolbar-title>
        </v-toolbar>
        <v-container>
          This data is not pulled from status.compass.education.<br />
          Your Compass Environment: {{ $store.state.compassEnvironment }}
          <div v-for="status in statuses" :key="status.name">
            {{ status.name }}:
            <v-icon color="green" v-if="status.status"
              >mdi-check-circle-outline</v-icon
            >
            <v-icon color="red" v-if="!status.status"
              >mdi-alert-circle-outline</v-icon
            >
          </div>
        </v-container>
      </v-card>
      <v-card color="card" class="rounded-xl" elevation="7">
        <v-overlay :value="loadingIncidents" absolute>
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
        <v-toolbar color="toolbar">
          <v-toolbar-title> Incidents </v-toolbar-title>
        </v-toolbar>
        <v-container>
          <v-list color="card">
            <v-list-item
              v-for="incident in incidents.data"
              :key="incident.id"
              color="card"
            >
              <v-list-item-content>
                <v-list-item-subtitle>
                  {{
                    $date(incident.created_at).format("MMMM Do YYYY, h:mm:ss a")
                  }}
                </v-list-item-subtitle>
                <v-list-item-title>
                  {{ incident.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ incident.message }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-container>
      </v-card>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "Status",
  data() {
    return {
      statuses: [],
      incidents: [],
      loading: true,
      loadingIncidents: true
    }
  },
  methods: {
    getIncidents() {
      this.axios
        .get("/api/v1/status/incidents")
        .then((res) => {
          this.incidents = res.data
          this.incidents.data = res.data.data.sort((a, b) => b.id - a.id)
          this.loadingIncidents = false
        })
        .catch(() => {
          this.loadingIncidents = false
        })
    },
    getStatus() {
      this.axios
        .get("/api/v1/status", {
          timeout: 7000
        })
        .then((res) => {
          this.loading = false
          this.statuses = res.data
        })
        .catch(() => {
          this.loading = false
          this.statuses = [
            {
              name: "BetterCompass",
              status: false
            }
          ]
        })
    }
  },
  mounted() {
    this.getStatus()
    this.getIncidents()
  }
}
</script>

<style scoped></style>
