<template>
  <div>
    <v-container>
      <v-card color="card" elevation="7" class="rounded-xl">
        <v-toolbar color="toolbar">
          <v-toolbar-title> Classes ({{ results.length }}) </v-toolbar-title>
        </v-toolbar>
        <v-container>
          <v-text-field
            v-model="search"
            label="Search"
            placeholder="10ENG11"
            class="mx-6"
          ></v-text-field>
          <v-overlay :value="loading" absolute>
            <v-progress-circular indeterminate size="64"></v-progress-circular>
          </v-overlay>
          <v-card
            v-for="(subject, index) in results"
            :key="subject.id"
            class="mb-3"
            @click="$router.push('/activity/activity/' + subject.id)"
            color="card"
          >
            <v-container>
              <v-card-title>
                <v-toolbar-title>
                  {{ subject.name }}
                  <div class="subheading subtitle-1">
                    ID: {{ subject.id }} - {{ $store.state.school.name }} -
                    Index: {{ index }}
                  </div>
                </v-toolbar-title>
              </v-card-title>
            </v-container>
          </v-card>
        </v-container>
      </v-card>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "SchoolSubjects",
  data() {
    return {
      subjects: [],
      loading: true,
      search: ""
    }
  },
  computed: {
    results() {
      if (this.search) {
        return this.subjects.filter((subject) => {
          return subject.name.toLowerCase().includes(this.search.toLowerCase())
        })
      } else {
        return this.subjects
      }
    }
  },
  methods: {
    getSubjects() {
      this.loading = true
      this.axios
        .post("/Services/UserInclusion.svc/GetThinClasses", {})
        .then((res) => {
          this.subjects = res.data.d
          this.loading = false
        })
    }
  },
  mounted() {
    this.getSubjects()
  }
}
</script>

<style scoped></style>
