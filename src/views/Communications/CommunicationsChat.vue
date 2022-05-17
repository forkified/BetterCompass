<template>
  <div
    v-if="$store.state.site.release === 'dev'"
    id="communications-chat"
  ></div>
</template>

<script>
export default {
  name: "CommunicationsChat",
  methods: {}
}
</script>

<style scoped></style>
