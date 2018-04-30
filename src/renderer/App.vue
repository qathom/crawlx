<template>
  <div id="app">
    <b-navbar class="main-navbar" toggleable="false" type="dark" variant="primary">
      <div class="d-flex align-items-cente justify-content-between w-100">
        <b-button size="lg" class="btn-toggle-sidebar" variant="primary" @click.prevent="setExpandSidebar(!expandSideBar)">
          <icon name="bars" />
        </b-button>
        <b-navbar-brand class="pt-2">
          <img src="./assets/icons/icon-reversed.svg" width="90" alt="Icon">
        </b-navbar-brand>
        
        <b-button
          id="exit"
          class="px-3"
          variant="primary"
          size="sm"
          @click.prevent="quit">
          <icon name="window-close"></icon>
        </b-button>
        <b-tooltip target="exit" placement="left" title="Exit" />
      </div>
    </b-navbar>
    <div class="wrapper">
      <aside class="main-sidebar" :class="{expand: expandSideBar}">
        <b-nav vertical class="nav-sidebar">
          <b-nav-item :class="{working: jobInProgress}" :to="{name: 'scan'}" exact>
            <icon :name="jobInProgress ? 'search' : 'bolt'"></icon>
            <span class="item-name ml-3">Scan</span>
          </b-nav-item>
          <b-nav-item :to="{name: 'report'}" :disabled="jobInProgress">
            <icon name="database"></icon>
            <span class="item-name ml-3">Report</span>
          </b-nav-item>
          <b-nav-item :to="{name: 'insights'}" :disabled="jobInProgress">
            <icon name="chart-bar"></icon>
            <span class="item-name ml-3">Insights</span>
          </b-nav-item>
          <b-nav-item :to="{name: 'settings'}" :disabled="jobInProgress">
            <icon name="cog"></icon>
            <span class="item-name ml-3">Settings</span>
          </b-nav-item>
        </b-nav>

        <b-nav vertical class="nav-sidebar about">
          <b-nav-item :to="{name: 'about'}" :disabled="jobInProgress">
            <icon name="code"></icon>
            <span class="item-name ml-3">About</span>
          </b-nav-item>
        </b-nav>
      </aside>
      <div class="secondary-wrapper" :class="{expand: !expandSideBar}">
        <div class="content-wrapper px-3 py-3">
          <router-view />
        </div>
      </div>
    </div>

    <unhandle-exception />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import UnhandleException from '@/components/UnhandleException';
const { app } = require('electron').remote;

export default {
  name: 'app',
  data() {
    return {
      jobInProgress: false,
    };
  },
  methods: {
    ...mapActions([
      'setExpandSidebar',
    ]),
    quit() {
      app.quit();
    },
    startJobInProgress() {
      this.jobInProgress = true;
    },
    endJobInProgress() {
      this.jobInProgress = false;
    },
    getJobInProgress() {
      return this.jobInProgress;
    },
  },
  computed: {
    ...mapGetters([
      'expandSideBar',
    ]),
  },
  components: {
    UnhandleException,
  },
};
</script>

<style lang="scss">
@import "assets/scss/variables.scss";

// Bootstrap
@import "../../node_modules/bootstrap/scss/functions.scss";
@import "../../node_modules/bootstrap/scss/variables.scss";
@import "../../node_modules/bootstrap/scss/mixins.scss";
@import "../../node_modules/bootstrap/scss/root.scss";
@import "../../node_modules/bootstrap/scss/reboot.scss";
@import "../../node_modules/bootstrap/scss/type.scss";
@import "../../node_modules/bootstrap/scss/grid.scss";
@import "../../node_modules/bootstrap/scss/tables.scss";
@import "../../node_modules/bootstrap/scss/forms.scss";
@import "../../node_modules/bootstrap/scss/buttons.scss";
@import "../../node_modules/bootstrap/scss/transitions.scss";
@import "../../node_modules/bootstrap/scss/button-group.scss";
@import "../../node_modules/bootstrap/scss/input-group.scss";
@import "../../node_modules/bootstrap/scss/custom-forms.scss";
@import "../../node_modules/bootstrap/scss/nav.scss";
@import "../../node_modules/bootstrap/scss/navbar.scss";
@import "../../node_modules/bootstrap/scss/badge.scss";
@import "../../node_modules/bootstrap/scss/alert.scss";
@import "../../node_modules/bootstrap/scss/progress.scss";
@import "../../node_modules/bootstrap/scss/media.scss";
@import "../../node_modules/bootstrap/scss/list-group.scss";
@import "../../node_modules/bootstrap/scss/close.scss";
@import "../../node_modules/bootstrap/scss/modal.scss";
@import "../../node_modules/bootstrap/scss/tooltip.scss";
@import "../../node_modules/bootstrap/scss/utilities.scss";
@import "../../node_modules/bootstrap/scss/print.scss";

// Bootstrap Vue
@import '../../node_modules/bootstrap-vue/dist/bootstrap-vue.css';

// Custom Style
@import "assets/scss/app.scss";
</style>

