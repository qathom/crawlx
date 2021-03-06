<template>
  <div>
    <!-- Amazon sites -->
    <b-form @submit.prevent="addAmazonSite">
      <label for="inputUrl">Amazon sites:</label>
      <div class="px-3">
        <b-alert variant="warning" show v-show="sites.length === 0">No sites.</b-alert>
        <b-input-group>
          <b-form-input id="inputUrl"
                        type="text"
                        v-model="form.url"
                        @input="onInput"
                        required
                        :state="form.urlValid"
                        placeholder="amazon.com"
                        :disabled="form.checking">
          </b-form-input>
        
          <b-input-group-append>
            <b-button variant="primary" type="submit" :disabled="form.checking || form.siteExists">
              <span v-show="!form.checking">Add</span>
              <vue-simple-spinner v-if="form.checking" :size="22" class="d-inline-block align-middle"></vue-simple-spinner>
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </div>
    </b-form>

    <b-list-group class="mt-3 px-3">
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
                      @input="editInputReseller"
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
import log from 'electron-log';

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
    editInputReseller(inputValue) {
      const value = inputValue.trim();
      this.editReseller(value);
    },
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
        this.form.checking = false;
        this.form.urlValid = false;

        log.error(`Error while adding a site: ${error.message}`);
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
