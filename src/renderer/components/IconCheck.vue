<template>
  <div class="icon-container" :class="`bg-${status}`">
    <icon class="text-white sm" v-show="status === 'success'" name="check" />
    <icon class="text-white sm" v-show="status === 'warning'" name="exclamation" />
    <icon class="text-white sm" v-show="status === 'danger'" name="times" />
  </div>
</template>

<script>
export default {
  props: {
    status: String,
  },
};
</script>

<style lang="scss">
.icon-container {
  width: 30px;
  height: 30px;
  line-height: 30px;
  vertical-align: middle;
  text-align: center;
  display: inline-block;
  border-radius: 50%;
}
</style>
