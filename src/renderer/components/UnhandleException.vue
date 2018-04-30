<template>
  <b-modal ref="exceptionModal" hide-footer title="An error occurred!">
    <div class="d-block text-center">
      <samp v-text="error" />
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'UnhandleException',
  mounted() {
    window.addEventListener('error', this.onError);
  },
  data() {
    return {
      error: '',
    };
  },
  methods: {
    onError(event) {
      this.error = `${event.type}:${event.name}. Line: ${event.lineno}. Message: ${event.message}`;
      this.$refs.exceptionModal.show();
    },
  },
};
</script>