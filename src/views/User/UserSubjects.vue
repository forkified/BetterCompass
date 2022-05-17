<template>
  <div id="user-subjects">
    <v-card class="rounded-xl" color="card">
      <v-toolbar color="toolbar">
        <v-toolbar-title> Classes </v-toolbar-title>
      </v-toolbar>
      <v-overlay :value="loading" absolute>
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>
      <v-data-table
        :items="subjects"
        :headers="headers"
        @click:row="handleClick"
        style="cursor: pointer"
        :style="
          'background-color: ' +
          $vuetify.theme.themes[$vuetify.theme.dark ? 'dark' : 'light'].card
        "
        :sort-desc="true"
        :items-per-page="$store.state.user.bcUser.rowsPerPage"
        sort-by="ActivityId"
      >
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "UserSubjects",
  props: ["user"],
  data() {
    return {
      subjects: [],
      headers: [
        {
          text: "ID",
          value: "ActivityId"
        },
        {
          text: "Name",
          value: "ActivityName"
        },
        {
          text: "Subject ID",
          value: "SubjectId",
          sortable: false
        }
      ],
      loading: true
    }
  },
  methods: {
    handleClick(item) {
      this.$router.push("/activity/activity/" + item.ActivityId)
    },
    getSubjects() {
      this.loading = true
      this.axios
        .get("/Services/ReferenceDataCache.svc/GetAllAcademicGroups")
        .then(async (res) => {
          for (let i = 0; i < res.data.d.length; i++) {
            this.axios
              .post("/Services/Gpa.svc/GetActivitiesOverviewConfig", {
                userId: this.user.userId || this.$store.state.user.userId,
                academicGroupId: res.data.d[i].id
              })
              .then((res) => {
                this.subjects.push(...res.data.d.Activities)
              })
          }
          this.loading = false
        })
    },
    getReports() {
      this.axios.post("/Services/Gpa.svc/GetOverviewGraphDataForActivities", {
        activityIds: this.subjects.Activities.map((s) => s.ActivityId),
        userId: this.user.userId || this.$store.state.user.userId,
        cycleIds: [23]
      })
    }
  },
  mounted() {
    this.getSubjects()
  }
}
</script>

<style scoped></style>
