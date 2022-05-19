<template>
  <div>
    <v-container>
      <v-card color="card">
        <v-container>
          <h1>Help test new features?</h1>
          <p>You can enable or disable new and experimental features here.</p>
          <v-row>
            <v-col
              v-for="experiment in experiments"
              :key="experiment.id"
              sm="4"
            >
              <v-card @click="toggleExperiment(experiment)">
                <v-card-title>{{ experiment.name }}</v-card-title>
                <v-card-text>
                  {{ experiment.description }}
                </v-card-text>
                <v-card-text>
                  Status:
                  {{
                    userExperiments.includes(experiment.internalName)
                      ? "Enabled"
                      : "Disabled"
                  }}</v-card-text
                >
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "EarlyAccess",
  data() {
    return {
      userExperiments: [],
      experiments: [
        {
          name: "Communications",
          description:
            "A quick and easy way to communicate with BetterCompass users.",
          internalName: "communications"
        }
      ]
    }
  },
  methods: {
    toggleExperiment(experiment) {
      console.log(this.$store.state.user.bcUser.experiments)
      if (
        !this.$store.state.user.bcUser.experiments.includes(
          experiment.internalName
        )
      ) {
        console.log(2)
        this.$store.state.user.bcUser.experiments.push(experiment.internalName)
      } else {
        this.$store.state.user.bcUser.experiments.splice(
          this.$store.state.user.bcUser.experiments.indexOf(
            experiment.internalName
          ),
          1
        )
      }
    }
  },
  async mounted() {
    await this.$store.dispatch("getUserInfo")
    if (this.$store.state.user?.bcUser?.experiments) {
      this.userExperiments = this.$store.state.user.bcUser.experiments
    } else {
      this.$store.state.user.bcUser.experiments = []
      this.userExperiments = []
    }
  },
  watch: {
    userExperiments(newValue) {
      this.$store.state.user.bcUser.experiments = newValue
      this.$store.dispatch("saveOnlineSettings")
    }
  }
}
</script>

<style scoped></style>
