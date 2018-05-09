<template>
  <div>
    <b-btn variant="primary" v-show="this.report.length > 0" @click.prevent="setReport([])">Clear all</b-btn>
    <div class="float-right mb-2" v-show="this.report.length > 0">
      <b-btn variant="primary" @click.prevent="importChooseFile">Import File</b-btn>
      <b-form-checkbox
        class="my-0 mr-0"
        v-b-tooltip.hover title="Check this box to preserve current rows when importing files"
        v-model="appendReport">
        Append rows
      </b-form-checkbox>
      <b-btn variant="primary" @click.prevent="exportReport">Export Results</b-btn>
    </div>

    <div class="drop-zone" id="dropZone" v-show="report.length === 0">
      <h5>Import data</h5>
      <p>
        <span>Drag and drop a file here or</span>
        <b-btn variant="primary" @click.prevent="importChooseFile">choose a file</b-btn>
      </p>
      <p>
        No compatible files? <b-btn variant="success" :to="{name: 'scan'}">Start the scan</b-btn>
      </p>
    </div>

    <b-table
      small
      head-variant="light"
      :items="report"
      :fields="fields"
      :sort-compare="sortCompare"
      v-show="report.length > 0">
      <template slot="title" slot-scope="data">
        <a v-b-tooltip.hover :title="data.item.title" :href="data.item.link" @click.prevent="openLink(data.item.link)" v-text="getShortTitle(data.item.title)"></a>
      </template>
      <template slot="site" slot-scope="data">
        {{ data.item.site }}
      </template>
      <template slot="lostBuyBox" slot-scope="data">
        {{ data.item.lostBuyBox ? 'Yes' : 'No' }}
      </template>
      <template slot="score" slot-scope="data">
        {{ data.item.scores.overall.score }}/{{ data.item.scores.overall.total }}
      </template>
      <template slot="details" slot-scope="data">
        <b-btn size="sm" variant="outline-primary" :to="{name: 'reportDetails', params: {uid: data.item.uid}}">Details</b-btn>
      </template>
      <template slot="table-caption">
        {{ report.length }}
        <span v-show="report.length > 1">products</span>
        <span v-show="report.length <= 1">product</span>
      </template>
    </b-table>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { importRows, exportRows, checkRows } from '@/utils/import-export';
import XLSX from 'xlsx';
import { keys } from 'bootstrap-vue/src/utils/object';
const { dialog } = require('electron').remote;

export default {
  name: 'report',
  data() {
    return {
      fields: [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'title', label: 'Title', sortable: true },
        { key: 'site', label: 'Site', sortable: true },
        { key: 'lostBuyBox', label: 'Lost Buy Box', sortable: true },
        { key: 'score', label: 'Score', sortable: true },
        // custom
        'details',
      ],
      appendReport: false,
    };
  },
  mounted() {
    document.addEventListener('drop', this.importDropFile);

    this.$el.querySelector('#dropZone').addEventListener('dragenter', (event) => {
      if (!event.target.classList.contains('drag-enter')) {
        event.target.classList.add('drag-enter');
      }
    });

    document.addEventListener('dragover', (event) => {
      event.preventDefault();

      const dropZone = this.$el.querySelector('#dropZone');
      if (!this.inDropzone(event.target) && dropZone.classList.contains('drag-enter')) {
        dropZone.classList.remove('drag-enter');
      }
    });

    this.$el.querySelector('#dropZone').addEventListener('dragleave', (event) => {
      if (!this.inDropzone(event.target) && event.target.classList.contains('drag-enter')) {
        event.target.classList.remove('drag-enter');
      }
    });
  },
  methods: {
    ...mapActions([
      'setReport',
    ]),
    toString(v) {
      if (!v) {
        return '';
      }
      if (v instanceof Object) {
        return keys(v)
          .map(k => toString(v[k]))
          .join(' ');
      }
      return String(v);
    },
    sortCompare(a, b, sortBy) {
      if (sortBy === 'score') {
        return (a.scores.overall.score < b.scores.overall.score && -1)
          || (a.scores.overall.score > b.scores.overall.score && 1) || 0;
      }

      if (typeof a[sortBy] === 'number' && typeof b[sortBy] === 'number') {
        return (a[sortBy] < b[sortBy] && -1) || (a[sortBy] > b[sortBy] && 1) || 0;
      }

      if (typeof a[sortBy] === 'boolean' && typeof b[sortBy] === 'boolean') {
        return (a[sortBy] < b[sortBy] && -1) || (a[sortBy] > b[sortBy] && 1) || 0;
      }

      return this.toString(a[sortBy]).localeCompare(this.toString(b[sortBy]), undefined, {
        numeric: true,
      });
    },
    inDropzone(target) {
      const dropZone = this.$el.querySelector('#dropZone');
      return target === dropZone || target.parentNode === dropZone
        || target.parentNode.parentNode === dropZone;
    },
    getShortTitle(title, numberWords = 5) {
      const titleArray = title.split(' ');
      const cutLength = titleArray.length >= numberWords ? numberWords : titleArray.length;

      if (cutLength === 0) {
        return title;
      }

      return titleArray.slice(0, cutLength).reduce((str, w) => `${str} ${w} `, '').trim();
    },
    openLink(link) {
      this.$electron.shell.openExternal(link);
    },
    importDropFile(event) {
      event.preventDefault();
      event.stopPropagation();

      if (!this.inDropzone(event.target)) {
        return false;
      }

      const dropZone = this.$el.querySelector('#dropZone');

      if (dropZone.classList.contains('drag-enter')) {
        dropZone.classList.remove('drag-enter');
      }

      const files = [...event.dataTransfer.files];

      const appendReport = files.length > 1;
      files.forEach((file) => {
        this.importReport(file.path, appendReport);
      });

      return false;
    },
    importChooseFile() {
      const files = dialog.showOpenDialog({
        properties: ['openFile'],
        multiSelections: true,
        title: 'Import a file',
        message: 'Select a file', // macOS
        filters: [
          { name: 'Excel', extensions: ['xlsx', 'xls', 'ods'] },
        ],
      });

      // if the dialog has been canceled
      if (!files) {
        return;
      }

      const appendReport = files.length > 1;

      files.forEach((file) => {
        this.importReport(file, appendReport);
      });
    },
    importReport(file, forceAppend = false) {
      const workbook = XLSX.readFile(file);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(worksheet);
      const rows = importRows(Object.values(json));

      // check attrs
      if (!checkRows(rows)) {
        dialog.showMessageBox({
          type: 'error',
          title: 'Error',
          message: `The file ${file} is not valid.`,
          buttons: ['OK'],
        });
        return;
      }

      let report = rows;

      if (this.appendReport || forceAppend) {
        report = this.report.concat(report);
      }

      this.setReport(report);
    },
    exportReport() {
      let path = dialog.showSaveDialog({
        title: 'Choose a path',
        message: 'Choose a path', // macOS
      });

      // if the dialog has been canceled
      if (!path) {
        return;
      }

      if (path.indexOf('.xlsx') === -1) {
        path = path += '.xlsx';
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportRows(this.report));

      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      XLSX.writeFile(wb, path);

      dialog.showMessageBox({
        type: 'info',
        title: 'File saved',
        message: `File path: ${path}`,
        buttons: ['OK'],
      });
    },
  },
  computed: {
    ...mapGetters([
      'report',
    ]),
  },
};
</script>

<style lang="scss">
@import "../../../node_modules/bootstrap/scss/functions.scss";
@import "../../../node_modules/bootstrap/scss/variables.scss";
@import "../assets/scss/variables.scss";

.drop-zone {
  width: 100%;
  border: 2px dashed lighten($blue, 10);
  padding: $spacer;
  transition: border 300ms ease-in-out, background-color 300ms ease-in-out;

  &.drag-enter {
    border: 2px dashed lighten($blue, 20);
    background-color: lighten($blue, 5);
  }
}
</style>
