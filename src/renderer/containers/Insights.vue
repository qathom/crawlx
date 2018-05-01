<template>
  <div>
    <b-form-group label="Compare:">
      <b-form-radio-group
        v-model="selected"
        :options="options"
        @change="fillData"
        :disabled="report.length === 0"
        name="radioInline">
      </b-form-radio-group>
    </b-form-group>

    <b-alert
      variant="warning"
      :show="report.length === 0">
      No data.
      <b-btn size="sm" variant="primary" :to="{name: 'scan'}">Scan</b-btn>
      or
      <b-btn size="sm" variant="primary" :to="{name: 'report'}">load files</b-btn>
    </b-alert>

    <score-chart v-show="report.length > 0" :chart-data="chartData" :options="selectedChartOptions"></score-chart>
  </div>
</template>

<script>
import ScoreChart from '@/components/ScoreChart';
import { mapGetters } from 'vuex';
import { getISOCountry } from '@/utils';

export default {
  data() {
    return {
      chartData: null,
      selected: 'score',
      options: [
        { text: 'Score', value: 'score' },
        { text: 'Price', value: 'price' },
      ],
      chartOptions: {
        score: {
          maintainAspectRatio: false,
          scales: {
            yAxes: [{
              display: true,
              ticks: {
                suggestedMin: 0,
                beginAtZero: true,
                suggestedMax: 20,
              },
            }],
            xAxes: [{
              ticks: {
                autoSkip: false,
                minRotation: 90,
              },
            }],
          },
        },
        price: {
          maintainAspectRatio: false,
          scales: {
            xAxes: [{
              ticks: {
                autoSkip: false,
                minRotation: 90,
              },
            }],
          },
          tooltips: {
            callbacks: {
              label: (tooltipItem, data) => {
                const label = data.datasets[tooltipItem.datasetIndex].label || '';
                const currency = data.datasets[tooltipItem.datasetIndex].currencies;

                return `${label}: ${tooltipItem.yLabel} ${currency}`;
              },
            },
          },
        },
      },
      selectedChartOptions: null,
    };
  },
  mounted() {
    this.fillData();
  },
  methods: {
    fillData(checked = null) {
      const selected = checked || this.selected;
      const selectedOption = this.options.find(option => option.value === selected);
      const labels = this.report.map(row => `${row.id} ${getISOCountry(row.site, true)}`);

      const data = selected === 'score' ?
        this.report.map(row => row.scores.overall.score) :
        this.report.map(row => row.price);

      const currencies = this.report.map(row => row.currency);

      this.selectedChartOptions = this.chartOptions[selected];

      this.chartData = {
        labels,
        datasets: [
          {
            label: selectedOption.text,
            data,
            currencies,
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
  },
  components: {
    ScoreChart,
  },
};
</script>
