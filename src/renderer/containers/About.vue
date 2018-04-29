<template>
  <div>
    <p class="text-center">
      <img src="../assets/icons/icon.svg" width="128" height="128" alt="Icon">
    </p>

    <p>
      <strong>{{ appName }} {{ appVersion }}</strong> Copyright (C) {{ year }}  {{ appAuthor }}
    </p>

    <p>
      This program is free software: you can redistribute it and/or modify
      it under the terms of the GNU General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.
    </p>
    <p>
      This program is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU General Public License for more details.
    </p>
    <p>
      You should have received a copy of the GNU General Public License
      along with this program.  If not, see <http://www.gnu.org/licenses/>.
    </p>
  </div>
</template>

<script>
import config from '@/config';
import moment from 'moment';
export default {
  data() {
    return {
      appName: config.app.name,
      appVersion: config.app.version,
      appAuthor: config.app.author,
      year: moment().format('YYYY'),
    };
  },
};
</script>
