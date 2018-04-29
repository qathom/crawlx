import { getScores } from '@/score';

const state = {
  report: [],
};

const getters = {
  report: state => state.report,
};

const mutations = {
  SET_REPORT(state, report) {
    state.report = report.map((row) => {
      row.uid = Math.random().toString(36).substr(2, 9);
      row.scores = getScores(row);
      return row;
    });
  },
  UNSET_REPORT(state) {
    state.report = [];
  },
};

const actions = {
  setReport({ commit }, report = []) {
    commit('SET_REPORT', report);
  },
  unsetReport({ commit }) {
    commit('UNSET_REPORT');
  },
};

export default {
  state,
  getters,
  mutations,
  actions,
};
