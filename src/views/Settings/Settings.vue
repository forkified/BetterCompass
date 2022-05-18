<template>
  <div id="settings">
    <v-container v-if="$store.state.user?.bcUser">
      <v-card color="card" elevation="7" class="rounded-xl">
        <v-toolbar color="toolbar">
          <v-toolbar-title
            >{{ $route.name }} - BetterCompass Settings
          </v-toolbar-title>
        </v-toolbar>
        <v-tabs background-color="transparent">
          <v-tab to="/settings/site"> General </v-tab>
          <v-tab to="/settings/appearance"> Appearance </v-tab>
          <v-tab
            to="/settings/communications"
            v-if="$store.state.user.bcUser.privacy.communications.enabled"
          >
            Communications
            <v-chip disabled style="opacity: 1" color="transparent"
              ><v-icon>mdi-ab-testing</v-icon></v-chip
            >
          </v-tab>
          <v-tab
            to="/settings/security"
            v-if="
              $store.state.user.bcUser.bcSessions ||
              $store.state.site.release === 'dev'
            "
          >
            Security
            <v-chip disabled style="opacity: 1" color="transparent"
              ><v-icon>mdi-ab-testing</v-icon></v-chip
            >
          </v-tab>
          <v-tab
            to="/settings/sessions"
            v-if="
              $store.state.user.bcUser.bcSessions ||
              $store.state.site.release === 'dev'
            "
          >
            Sessions
            <v-chip disabled style="opacity: 1" color="transparent"
              ><v-icon>mdi-ab-testing</v-icon></v-chip
            >
          </v-tab>
          <v-tab
            to="/settings/versions"
            v-if="$store.state.site.release === 'dev'"
          >
            Versions
            <v-chip disabled style="opacity: 1" color="transparent"
              ><v-icon>mdi-ab-testing</v-icon></v-chip
            >
          </v-tab>
          <v-tab
            to="/settings/developer"
            v-if="$store.state.site.release === 'dev'"
          >
            Developer Options
            <v-chip disabled style="opacity: 1" color="transparent"
              ><v-icon>mdi-ab-testing</v-icon></v-chip
            >
          </v-tab>
        </v-tabs>
        <router-view> </router-view>
        <div class="mx-4">
          <small
            >BetterCompass version {{ $store.state.versioning.version }}, built
            on {{ $store.state.versioning.date }}</small
          >
        </div>
      </v-card>
    </v-container>
  </div>
</template>
<script>
export default {
  name: "Settings"
}
</script>

<style scoped></style>
