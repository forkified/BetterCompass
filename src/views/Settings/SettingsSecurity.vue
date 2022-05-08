<template>
  <div>
    <v-card-text>
      <v-alert :type="totp.stage === 3 ? 'success' : 'info'">
        <template v-if="totp.stage === 1">
          <p class="text-h6">Enable 2 Factor Authentication</p>
          <p>
            2FA will only protect your BetterCompass account, not your regular
            Compass account.
          </p>
          <p>
            2 Factor Authentication is a security feature that will require you
            to enter a 6 digit code from your chosen authenticator app such as
            Authy, Bitwarden, or Google Authenticator on login.
            <br />
            Ensure that your authenticator app is safely secured, cannot be
            accessed by anyone else, and that you don't loose it.
          </p>
          <v-text-field
            type="password"
            label="Password"
            v-model="totp.password"
            color="white"
          >
          </v-text-field>
          <v-btn @click="totpEnable" text>Proceed</v-btn>
        </template>
        <template v-else-if="totp.stage === 2">
          <p class="text-h6">Enable 2 Factor Authentication</p>
          <p>Your 2FA secret is:</p>
          <code>{{ totp.secret }}</code>
          <p>Please enter the 6 digit code from your authenticator app.</p>
          <v-text-field
            type="number"
            label="Code"
            v-model="totp.code"
            color="white"
          >
          </v-text-field>
          <v-btn @click="totpConfirm" text>Enable</v-btn>
        </template>
        <template v-else-if="totp.stage === 3">
          <p class="text-h6">2 Factor Authentication Enabled</p>
          <p>You have successfully enabled 2 Factor Authentication.</p>
          <v-text-field
            type="password"
            label="2FA Code"
            v-model="totp.code"
            color="white"
          >
          </v-text-field>
          <v-btn @click="totpDisable" text>Disable</v-btn>
        </template>
      </v-alert>
      <v-alert type="success" v-if="$store.state.user.bcUser.bcSessions">
        <v-row>
          <v-col>
            <p class="text-h6">BetterCompass Sessions</p>
            <p>You have enabled BetterCompass Sessions.</p>
          </v-col>
        </v-row>
      </v-alert>
      <v-alert type="info">
        <v-row>
          <v-col>
            <p class="text-h6">Change Password</p>
            <p>
              You may set a custom password for login to BetterCompass here.
            </p>
            <v-text-field
              label="Current Password"
              v-model="password.current"
              type="password"
              color="white"
            ></v-text-field>
            <v-text-field
              label="New Password"
              v-model="password.new"
              type="password"
              color="white"
            ></v-text-field>
            <v-text-field
              label="Confirm New Password"
              v-model="password.confirm"
              type="password"
              color="white"
            ></v-text-field>
            <v-btn @click="passwordChange" text>Change</v-btn>
          </v-col>
        </v-row>
      </v-alert>
      <v-alert type="info" v-if="!$store.state.user.bcUser.bcSessions">
        <v-row>
          <v-col>
            <p class="text-h6">BetterCompass Sessions</p>
            <p>
              Enabling BetterCompass Sessions allows BetterCompass to handle
              sessions, and authentication.
              <br />
              The BetterCompass server will store a single Compass session, and
              map it to custom sessions that get generated when logging in,
              meaning that the BetterCompass instance owner will technically
              have access to your account.
              <br />
              <br />
              This will allow for precise session management, login logs, a
              custom password, 2FA, and multiple linked users.
              <br /><br />
              <strong
                >It is not recommend to enable this feature unless you are using
                a trusted BetterCompass instance, or you are hosting your
                own.</strong
              >
            </p>
          </v-col>
          <v-col>
            <p class="text-h6">How it works:</p>
            <ul>
              <li>
                Enabling BetterCompass sessions will have the backend server
                retrieve a Compass session token.
              </li>
              <li>This token will be stored in the database.</li>
              <li>
                Logging into BetterCompass on any device in the future will
                generate a custom token which will have access to your main
                account (this one), and any other accounts you link to your main
                account (eg. accounts for multiple schools).
              </li>
              <li>
                This token will resolve to a standard Compass token in the
                backend to make requests to the Compass API depending on the
                selected account.
              </li>
            </ul>
          </v-col>
        </v-row>
        <v-btn @click="bcSessionsEnable" text
          >Enable BetterCompass Sessions</v-btn
        >
      </v-alert>
    </v-card-text>
  </div>
</template>

<script>
import AjaxErrorHandler from "@/lib/errorHandler"

export default {
  name: "SettingsSecurity",
  data() {
    return {
      password: {
        current: "",
        new: "",
        confirm: "",
        loading: false
      },
      totp: {
        secret: "",
        code: "",
        dialog: false,
        dialogType: "enable",
        loading: false,
        enabled: false,
        password: "",
        stage: 1
      }
    }
  },
  methods: {
    passwordChange() {
      if (this.password.new === this.password.confirm) {
        this.password.loading = true
        this.axios
          .put("/api/v1/user/settings/password", {
            current: this.password.current,
            new: this.password.new
          })
          .then(() => {
            this.password.loading = false
            this.password.current = ""
            this.password.new = ""
            this.password.confirm = ""
            this.$toast.success("Password changed successfully.")
          })
          .catch((e) => {
            this.password.loading = false
            AjaxErrorHandler(this.$store)(e)
          })
      } else {
        this.$toast.error("Passwords do not match.")
      }
    },
    bcSessionsEnable() {},
    totpEnable() {
      this.axios
        .put("/api/v1/user/settings/totp", {
          password: this.totp.password,
          schoolId: this.$store.state.school.id,
          username: this.$store.state.user.username
        })
        .then((res) => {
          this.totp.secret = res.data.secret
          this.totp.stage = 2
        })
        .catch((e) => {
          AjaxErrorHandler(this.$store)(e)
        })
    },
    totpDisable() {
      this.axios
        .put("/api/v1/user/settings/totp", {
          code: this.totp.code,
          schoolId: this.$store.state.school.id,
          username: this.$store.state.user.username
        })
        .then(() => {
          this.totp.stage = 1
        })
        .catch((e) => {
          AjaxErrorHandler(this.$store)(e)
        })
    },
    totpConfirm() {
      this.axios
        .put("/api/v1/user/settings/totpConfirm", {
          code: this.totp.code,
          schoolId: this.$store.state.school.id,
          username: this.$store.state.user.username
        })
        .then(() => {
          this.totp.stage = 3
          this.$store.dispatch("getUserInfo")
        })
        .catch((e) => {
          AjaxErrorHandler(this.$store)(e)
        })
    }
  },
  mounted() {
    this.$store.state.user.bcUser.totpEnabled
      ? (this.totp.stage = 3)
      : (this.totp.stage = 1)
  }
}
</script>

<style scoped></style>
