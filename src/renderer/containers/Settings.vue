<template>
  <div>
    <!-- Amazon sites -->
    <label for="inputUrl">Amazon sites:</label>

    <div class="px-3">
      <b-alert variant="warning" show v-show="sites.length === 0">No sites.</b-alert>

      <b-form class="bg-light">
        <b-input-group>
          <b-form-input id="inputUrl"
                        type="email"
                        v-model="form.url"
                        @input="onInput"
                        required
                        :state="form.urlValid"
                        placeholder="amazon.com"
                        :disabled="form.checking">
          </b-form-input>

          <b-input-group-append>
            <b-button variant="primary" @click="addAmazonSite" :disabled="form.checking || form.siteExists">
              Add
              <vue-simple-spinner v-if="form.checking" class="d-inline-block align-middle"></vue-simple-spinner>
            </b-button>
          </b-input-group-append>
        </b-input-group>

        <b-form-invalid-feedback v-show="form.urlValid === false">
          Invalid URL!
        </b-form-invalid-feedback>
      </b-form>

      <b-list-group class="mt-3">
        <b-list-group-item class="d-flex justify-content-between align-items-center" v-for="(site, index) in sites" :key="index">
          <div>
            <span v-text="site.hostName"></span>
            <b-badge variant="primary" pill v-text="site.isoCountry"></b-badge>
          </div>
          <b-button class="d-inline-block float-right" variant="danger" size="sm" @click.prevent="removeSite(site.url)">
            <icon name="trash" class="sm" />
          </b-button>
        </b-list-group-item>
      </b-list-group>
    </div>

    <!-- Buy box -->
    <b-form class="mt-4">
      <label for="inputReseller">Buy box owner:</label>
      <b-form-group
        id="inputResellerLabel"
        class="px-3"
        description="Specify which reseller should offer the best price on Amazon (buy box owner). By default, it is Amazon.">
        <b-form-input id="inputReseller"
                      type="text"
                      :value="reseller"
                      @input="editReseller"
                      required>
        </b-form-input>
      </b-form-group>
    </b-form>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import VueSimpleSpinner from 'vue-simple-spinner';
import { getHostName } from '@/utils';

export default {
  data() {
    return {
      form: {
        checking: false,
        siteExists: false,
        url: '',
        urlValid: undefined,
        reseller: '',
      },
    };
  },
  methods: {
    ...mapActions([
      'addSite',
      'removeSite',
      'editReseller',
    ]),
    getFullUrl() {
      let fullUrl = '';

      if (this.form.url.indexOf('http') === -1) {
        fullUrl = `https://${this.form.url}`;
      }

      return fullUrl;
    },
    onInput() {
      // reset
      this.form.urlValid = undefined;

      this.form.siteExists = this.sites
        .findIndex(s => s.hostName === getHostName(this.getFullUrl())) > -1;
    },
    addAmazonSite() {
      this.form.checking = true;

      this.addSite(this.getFullUrl()).then(() => {
        this.form.checking = false;
        this.form.url = '';
      }).catch((error) => {
        /* eslint no-console: ["error", { allow: ["warn", "error"] }] */
        console.error(error);
        this.form.checking = false;
        this.form.urlValid = false;
      });
    },
  },
  computed: {
    ...mapGetters([
      'sites',
      'reseller',
    ]),
  },
  components: {
    VueSimpleSpinner,
  },
};
</script>
