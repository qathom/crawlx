<template>
  <div>
    <div class="clearfix">
      <b-form-group label="Charts by row:" class="float-right">
        <b-form-radio-group
          v-model="compareChartsByRow"
          :options="compareChartsOptions"
          :disabled="report.length === 0"
          name="radioChartsInline">
        </b-form-radio-group>
      </b-form-group>
      <b-form-group class="float-left" label="Compare:">
        <b-form-radio-group
          v-model="compareSelection"
          :options="compareOptions"
          :disabled="report.length === 0"
          name="radioCompareInline">
        </b-form-radio-group>
      </b-form-group>
    </div>

    <b-alert
      variant="warning"
      :show="report.length === 0">
      No data.
      <b-btn size="sm" variant="primary" :to="{name: 'scan'}">Scan</b-btn>
      or
      <b-btn size="sm" variant="primary" :to="{name: 'report'}">load files</b-btn>
    </b-alert>

    <div v-show="report.length > 0">
      <div class="row" v-if="compareChartsByRow !== 0">
        <div :class="`col-${compareChartsByRow} mb-3`" v-for="(group, key) in reportByGroups" :key="key">
          <div class="chart-title font-weight-bold mb-2" v-text="getShortTitle(group[0].title)"></div>
          <score-chart :chart-data="getChartData(group)" :options="selectedChartOptions"></score-chart>
        </div>
      </div>

      <score-chart v-if="compareChartsByRow === 0" :chart-data="getChartData(report)" :options="selectedChartOptions"></score-chart>
    </div>
  </div>
</template>

<script>
import ScoreChart from '@/components/ScoreChart';
import { mapGetters } from 'vuex';
import { getISOCountry } from '@/utils';

export default {
  data() {
    return {
      compareSelection: 'score',
      compareOptions: [
        { text: 'Score', value: 'score' },
        { text: 'Price', value: 'price' },
      ],
      compareChartsByRow: 12,
      compareChartsOptions: [
        { text: '1', value: 12 },
        { text: '2', value: 6 },
        { text: '3', value: 4 },
        { text: '4', value: 3 },
        { text: 'Group All', value: 0 },
      ],
      selectedChartOptions: null,
      chartOptions: {
        score: {
          legend: {
            display: false,
          },
          maintainAspectRatio: false,
          scales: {
            yAxes: [{
              display: true,
              ticks: {
                min: 0,
                max: 24,
                beginAtZero: true,
              },
            }],
            xAxes: [{
              ticks: {
                autoSkip: false,
                minRotation: 0,
              },
            }],
          },
          tooltips: {
            callbacks: {
              title: (tooltipItem, data) => {
                console.log(this.compareChartsByRow);
                if (this.compareChartsByRow !== 0) {
                  return '';
                }

                return data.datasets[tooltipItem[0].datasetIndex].titles[tooltipItem[0].index];
              },
            },
          },
        },
        price: {
          legend: {
            display: false,
          },
          maintainAspectRatio: false,
          scales: {
            yAxes: [{
              display: true,
              ticks: {
                beginAtZero: true,
              },
            }],
            xAxes: [{
              ticks: {
                autoSkip: false,
                minRotation: 0,
              },
            }],
          },
          tooltips: {
            callbacks: {
              title: (tooltipItem, data) => {
                if (this.compareChartsByRow !== 0) {
                  return '';
                }

                return data.datasets[tooltipItem[0].datasetIndex].titles[tooltipItem[0].index];
              },
              label: (tooltipItem, data) => {
                const label = data.datasets[tooltipItem.datasetIndex].label || '';
                const currency = data.datasets[tooltipItem.datasetIndex]
                  .currencies[tooltipItem.index];

                return `${label}: ${tooltipItem.yLabel} ${currency}`;
              },
            },
          },
        },
      },
    };
  },
  created() {
    this.compareChartsByRow = this.reportByGroups > 1 ? 6 : 0;
  },
  methods: {
    getShortTitle(title, numberWords = 4) {
      const titleArray = title.split(' ');
      const cutLength = titleArray.length >= numberWords ? numberWords : titleArray.length;

      if (cutLength === 0) {
        return title;
      }

      return titleArray.slice(0, cutLength).reduce((str, w) => `${str} ${w} `, '').trim();
    },
    getChartData(group) {
      /* eslint-disable */
      const selected = this.compareSelection;
      const selectedOption = this.compareOptions.find(option => option.value === selected);
      const labels = group.map(row => `${getISOCountry(row.site, true)}`);

      const data = selected === 'score' ?
        group.map(row => row.scores.overall.score) :
        group.map(row => row.price);

      const titles = group.map(row => this.getShortTitle(row.title));
      const currencies = group.map(row => row.currency);
      const chartOptions = this.chartOptions[selected];

      if (selected === 'price') {
        chartOptions.scales.yAxes[0].ticks.max = this.highestPrice;
      }

      this.selectedChartOptions = chartOptions;

      return {
        labels,
        datasets: [
          {
            label: selected,
            titles,
            currencies,
            data,
            backgroundColor: '#0984e3',
          },
        ],
      };
    },
  },
  computed: {
    ...mapGetters([
      'report',
    ]),
    reportByGroups() {
      const reportByGroups = {};
      this.report.forEach((row) => {
        if (typeof reportByGroups[row.id] === 'undefined') {
          reportByGroups[row.id] = [];
        }

        reportByGroups[row.id].push(row);
      });

      return reportByGroups;
    },
    highestPrice() {
      return this.report.reduce((curr, row) => {
        if (row.price > curr) {
          return row.price + 10;
        }

        return curr;
      }, 0);
    },
  },
  components: {
    ScoreChart,
  },
};
</script>

<style lang="scss">
.chart-title {
  white-space: nowrap; 
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
