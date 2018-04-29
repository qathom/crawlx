import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'scan',
      component: require('@/containers/Scan').default,
    },
    {
      path: '/report',
      name: 'report',
      component: require('@/containers/Report').default,
    },
    {
      path: '/report/:uid',
      name: 'reportDetails',
      component: require('@/containers/ReportDetails').default,
      props: true,
    },
    {
      path: '/insights',
      name: 'insights',
      component: require('@/containers/Insights').default,
    },
    {
      path: '/settings',
      name: 'settings',
      component: require('@/containers/Settings').default,
    },
    {
      path: '/about',
      name: 'about',
      component: require('@/containers/About').default,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});
