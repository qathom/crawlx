<template>
  <b-form>
    <b-alert
      variant="primary"
      :show="showScanLabel"
      @dismissed="setShowScanLabel(false)"
      dismissible>
      If you want to skip the scan by importing a file, please go to
      <b-button variant="primary" :to="{name: 'report'}">Report</b-button>
    </b-alert>

    <b-form-group
      class="mb-2"
      id="inputProducts"
      label="Product identifiers:"
      label-for="inputProducts"
      description="Insert ASINs or other model identifiers">
      <b-form-input id="inputReseller"
                    type="text"
                    placeholder="Products"
                    v-model="form.products"
                    :disabled="isWorking()"
                    @input="checkProductIdentifiers"
                    required>
      </b-form-input>
    </b-form-group>

    <div role="tablist" class="mb-3">
      <b-btn href="#" size="sm" :disabled="productIdentifiers.length === 0" v-b-toggle.accordionProducts variant="outline-primary">
        Show products ({{ productIdentifiers.length }})
      </b-btn>
      <b-collapse id="accordionProducts" accordion="products" role="tabpanel">
        <b-list-group class="mt-2">
          <b-list-group-item v-for="(product, index) in productIdentifiers" :key="index">
            {{ product }}
          </b-list-group-item>
        </b-list-group>
      </b-collapse>
    </div>

    <b-btn
      class="float-right"
      variant="outline-primary"
      size="sm"
      :disabled="isWorking()"
      :to="{name: 'settings'}">
      Add site
    </b-btn>

    <b-form-group label="Scan data on Amazon:" class="mb-1">
      <b-form-checkbox-group
        id="countryCheckboxes"
        name="countries"
        v-model="selectedCountries"
        :options="countryOptions">
      </b-form-checkbox-group>
    </b-form-group>
    <small><a href="#" @click.prevent="selectAllCountries">Select all</a></small>
    <div class="text-danger" v-show="selectedCountries.length === 0">Select at least one country.</div>

    <b-button
      class="d-block px-4 py-2 mt-3"
      variant="primary"
      size="lg"
      :disabled="productIdentifiers.length === 0 || isWorking() || selectedCountries.length === 0"
      @click="startScan"
      v-b-tooltip.hover
      :title="`Estimated time: ${estimatedTime}m`">
        <span class="align-middle">{{ isWorking() ? 'Scanning' : 'Scan Now' }}</span>
        <span class="align-middle" v-show="isWorking()" v-text="`${progress}%`"></span>
        <vue-simple-spinner v-if="isWorking()" class="d-inline-block align-middle"></vue-simple-spinner>
    </b-button>

    <b-alert class="mt-2" variant="danger" show v-show="!isWorking() && errors.length > 0">
      <strong>The scan is complete, but there were {{ errors.length }} errors:</strong>
      <div class="mb-1" v-for="(error, index) in errors" :key="index">
        #{{ (index + 1) }} {{ error.id }}: "{{ error.message }}" occurred on {{ error.url }}
      </div>
      <b-btn :to="{name: 'report'}" variant="dark" v-show="results.length > 0">Ignore errors and see the report</b-btn>
    </b-alert>
  </b-form>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import eachSeries from 'async/eachSeries';
import searchProduct from '@/scrap';
import config from '@/config';
import VueSimpleSpinner from 'vue-simple-spinner';
import { setInterval, clearInterval } from 'timers';

/* eslint no-console: 0 */
/* eslint no-new: 0 */
export default {
  name: 'scan',
  data() {
    return {
      form: {
        products: '',
      },
      selectedCountries: [],
      productIdentifiers: [],
      errors: [],
      results: [],
      progress: 0,
      progressTick: null,
      scrappingAverageTime: 28, // per product and site
    };
  },
  methods: {
    ...mapActions([
      'setReport',
      'setShowScanLabel',
    ]),
    isWorking() {
      return this.$parent.getJobInProgress();
    },
    selectAllCountries() {
      this.selectedCountries = this.sites.map(site => site.isoCountry);
    },
    startScan() {
      this.results = [];
      this.errors = [];

      this.$parent.startJobInProgress();

      const totalPages = this.productIdentifiers.length * this.selectedCountries.length;
      const oneRoundProgress = Math.round((1 / totalPages) * 100);
      let current = 0;

      eachSeries(this.productIdentifiers, async (productId, callbackProduct) => {
        eachSeries(this.selectedCountries, async (country, callbackCountry) => {
          const site = this.sites.find(s => s.isoCountry === country);
          this.animateProgress(oneRoundProgress, false);

          current += 1;

          searchProduct(site.url, productId).then((productInfo) => {
            this.results.push(productInfo);
            this.animateProgress(oneRoundProgress, true);
            this.progress = oneRoundProgress * current;
            callbackCountry();
          }).catch((error) => {
            this.animateProgress(oneRoundProgress, true);
            this.errors.push({
              id: productId,
              message: error.toString(),
              url: site.url,
            });

            this.progress = oneRoundProgress * current;
            callbackCountry(error);
          });
        }, (err) => {
          if (err) {
            console.log('A country failed to process.');
          } else {
            console.log('All countries have been processed successfully for the product.');
          }

          callbackProduct();
        });
      }, (err) => {
        if (err) {
          console.log('A product failed to process');
        } else {
          console.log('All products have been processed successfully');
        }

        this.$parent.endJobInProgress();

        this.progress = 0;

        this.setReport(this.results);

        new Notification(config.app.name, {
          body: 'The scan is finished.',
        });

        setTimeout(() => {
          if (this.errors.length === 0) {
            // reset input if no errors occurred
            this.form.products = '';
            this.$router.push({ name: 'report' });
          }
        }, 1000);
      });
    },
    checkProductIdentifiers(inputValue) {
      const idSeparated = inputValue.replace(/^\s+|\s+$/gm, ',').replace(/ /gm, ',');

      this.form.products = idSeparated;

      // filter empty values and use unique values
      this.productIdentifiers = idSeparated.split(',').filter((id, i, arr) => id !== '' && arr.indexOf(id) === i);
    },
    animateProgress(maxPercent, stop = false) {
      let decrement = maxPercent - 1;
      const animationTime = (this.scrappingAverageTime / maxPercent) * 1000;

      if (this.progressTick) {
        clearInterval(this.progressTick);
        this.progressTick = null;
      }

      if (stop) {
        return;
      }

      this.progressTick = setInterval(() => {
        this.progress = this.progress + 1;
        decrement -= 1;
        if (decrement === 0) {
          clearInterval(this.progressTick);
          this.progressTick = null;
        }
      }, animationTime);
    },
    openLink(link) {
      this.$electron.shell.openExternal(link);
    },
  },
  computed: {
    ...mapGetters([
      'sites',
      'showScanLabel',
    ]),
    countryOptions() {
      return this.sites.map(site => site.isoCountry);
    },
    estimatedTime() {
      const seconds = (this.productIdentifiers.length * this.selectedCountries.length)
        * this.scrappingAverageTime;
      return Math.round(seconds / 60);
    },
  },
  components: {
    VueSimpleSpinner,
  },
};
</script>
