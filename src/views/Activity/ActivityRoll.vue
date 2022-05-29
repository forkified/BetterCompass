<template>
  <div id="activity-roll">
    <v-container>
      <v-card color="card" class="rounded-xl" elevation="7">
        <v-overlay :value="loading" absolute>
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
        <v-toolbar color="toolbar">
          <v-toolbar-title
            >Class Roll ({{ betterCompassPercentage }}% use
            BetterCompass)</v-toolbar-title
          >
          <v-spacer></v-spacer>
          <v-btn icon @click="viewAll = !viewAll">
            <v-icon>{{ viewAll ? "mdi-view-list" : "mdi-view-module" }}</v-icon>
          </v-btn>
        </v-toolbar>
        <v-data-table
          :headers="headers"
          :items="usersView()"
          :items-per-page="-1"
          :style="
            'background-color: ' +
            $vuetify.theme.themes[$vuetify.theme.dark ? 'dark' : 'light'].card
          "
          style="cursor: pointer"
          @click:row="handleClick"
        >
          <template v-slot:item.name="{ item }">
            {{ item.name }}
            <v-tooltip bottom v-if="item.user.usesBetterCompass">
              <template v-slot:activator="{ on }">
                <v-chip small color="bg" v-on="on">BC</v-chip>
              </template>
              <span>Uses BetterCompass</span>
            </v-tooltip>
            <v-tooltip bottom v-if="item.user.communicationsEnabled">
              <template v-slot:activator="{ on }">
                <v-chip class="ml-2" small color="bg" v-on="on"
                  ><v-icon small>mdi-android-messages</v-icon></v-chip
                >
              </template>
              <span>Opted into BetterCompass Communications</span>
            </v-tooltip>
          </template>
          <template v-slot:item.fs="{ item }">
            {{ $date(item.fs).format("YYYY/MM/DD") }}
          </template>
          <template v-slot:item.ss="{ item }">
            {{ $date(item.ss).format("YYYY/MM/DD") }}
          </template>
        </v-data-table>
      </v-card>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "ActivityRoll",
  props: ["activity"],
  data() {
    return {
      loading: true,
      users: [],
      viewAll: false,
      headers: [
        {
          text: "Name",
          align: "left",
          value: "name"
        },
        {
          text: "Code",
          align: "left",
          value: "ii"
        },
        {
          text: "Year Level",
          align: "left",
          value: "yl"
        },
        {
          text: "Form Group",
          align: "left",
          value: "f"
        },
        {
          text: "User ID",
          align: "left",
          value: "uid"
        },
        {
          text: "Enrollment Date",
          align: "left",
          value: "ss"
        },
        {
          text: "Enrollment Expiration",
          align: "left",
          value: "fs"
        },
        {
          text: "Enrollment Count",
          align: "left",
          value: "rc"
        }
      ]
    }
  },
  computed: {
    betterCompassPercentage() {
      return (
        Math.round(
          (this.users.filter((u) => u.user.usesBetterCompass).length /
            this.users.length) *
            100
        ) || 0
      )
    }
  },
  methods: {
    usersView() {
      if (this.viewAll) {
        return this.users.map((user) => {
          return {
            name: user.n.split(", ")[1] + " " + user.n.split(", ")[0],
            rc: 1,
            ...user
          }
        })
      } else {
        let users = []
        this.users.forEach((user) => {
          if (users.findIndex((u) => u.uid === user.uid) === -1) {
            users.push({
              name: user.n.split(", ")[1] + " " + user.n.split(", ")[0],
              rc: 1,
              ...user
            })
          } else {
            users.find((u) => u.uid === user.uid).rc++
          }
        })
        return users
      }
    },
    handleClick(item) {
      this.$router.push("/user/" + item.uid)
    },
    getUsers() {
      this.loading = true
      this.axios
        .get("/api/v1/activity/enrollments/" + this.activity.ActivityId)
        .then((res) => {
          this.users = res.data
          this.loading = false
        })
    }
  },
  mounted() {
    this.getUsers()
  }
}
</script>

<style scoped></style>
