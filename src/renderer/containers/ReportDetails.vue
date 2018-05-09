<template>
  <div>
    <b-btn :to="{name: 'report'}" variant="primary" class="mb-2">
      <icon name="angle-left" />
      Back
    </b-btn>
    <b-list-group v-if="item">
      <b-list-group-item>
        <b-row class="mb-4">
          <b-col sm="3">
            <b>Overall score</b>
          </b-col>
          <b-col>
            {{ item.scores.overall.score }}/{{ item.scores.overall.total }}
          </b-col>
        </b-row>
        <b-row class="mb-4">
          <b-col sm="3">
            <b>Scrapping Date</b>
          </b-col>
          <b-col>
            {{ getDate(item.date) }}
          </b-col>
        </b-row>
        <b-row class="mb-4">
          <b-col sm="3">
            <b>ASIN</b>
          </b-col>
          <b-col>
            {{ item.asin }}
          </b-col>
        </b-row>
        <b-row class="mb-4">
          <b-col sm="3">
            <b>Site</b>
          </b-col>
          <b-col v-if="item">
            <a href="#" @click.prevent="openLink(item.site)" v-text="item.site"></a>
          </b-col>
        </b-row>
        <b-row class="mb-4">
          <b-col sm="3">
            <b>Title</b>
            <icon-check :status="item.scores.title" />
          </b-col>
          <b-col>
            <b-btn variant="primary" class="float-right icon-info" v-b-tooltip.hover title="Amazon sets Product Titles to 256 Characters.">
              <icon class="sm" name="info" />
            </b-btn>
            <div><a :href="item.link" v-text="item.title" @click.prevent="openLink(item.link)"></a></div>
            <b>{{ item.title.length }} chars</b>
            <b>({{ item.title.split(' ').length }} words)</b>
            <span v-show="item.scores.title === 'success'">is good</span>
            <span v-show="item.scores.title === 'warning'">is short</span>
          </b-col>
        </b-row>
        <b-row class="mb-4">
          <b-col sm="3">
            <b>Price</b>
            <icon-check :status="item.scores.lostBuyBox" />
          </b-col>
          <b-col>
            {{ item.price }} {{ item.currency }}

            <div class="clearfix">
              <b-btn variant="primary" class="float-right icon-info" v-b-tooltip.hover title="Your products may be losing the buy box to third-party sellers because your price to Amazon is too high.">
                <icon class="sm" name="info" />
              </b-btn>

              <div v-show="item.lostBuyBox === false">
                <a :href="item.buyBoxSeller.link" @click.prevent="openLink(item.buyBoxSeller.link)" v-text="item.buyBoxSeller.name"></a>
                has the best price suggestion for this product ({{ `${item.buyBoxSeller.price} ${item.currency}` }}).
              </div>
              <div v-show="item.lostBuyBox === true">
                You lost the buy box!
                <a :href="item.buyBoxSeller.link" @click.prevent="openLink(item.buyBoxSeller.link)" v-text="item.buyBoxSeller.name"></a>
                has a better price than {{ reseller }}.
                <div><b>({{ `${item.buyBoxSeller.price} ${item.currency}` }})</b></div>

                <hr />
                <div><b>Address:</b></div>
                <div v-for="(detail, index) in item.buyBoxSeller.details.split(',')" :key="index" v-text="detail"></div>
              </div>
            </div>
          </b-col>
        </b-row>
        <b-row v-for="(bulletPoint, index) in item.bulletPoints" :key="index" class="mb-4">
          <b-col sm="3">
            <b>Bullet point {{ `n°${index + 1}` }}</b>
            <icon-check :status="getScoreForBulletPoint(item.bulletPoints[index])" />
          </b-col>
          <b-col>
            <b-btn variant="primary" class="float-right icon-info" v-b-tooltip.hover title="Amazon sets Product Bullet Points to 250 characters">
              <icon class="sm" name="info" />
            </b-btn>
            <div>
              <div v-text="bulletPoint"></div>
              <b>{{ bulletPoint.length }} chars</b>
              <b>({{ bulletPoint.split(' ').length }} words)</b>
              <span v-show="getScoreForBulletPoint(item.bulletPoints[index]) === 'success'">is good</span>
              <span v-show="getScoreForBulletPoint(item.bulletPoints[index]) === 'warning'">is short</span>
            </div>
          </b-col>
        </b-row>
        <b-row class="mb-4">
          <b-col sm="3">
            <b>Images</b>
            <icon-check :status="item.scores.images" />
          </b-col>
          <b-col>
            {{ item.images }}
          </b-col>
        </b-row>
        <b-row class="mb-4">
          <b-col sm="3">
            <b>Videos</b>
            <icon-check :status="item.scores.videos" />
          </b-col>
          <b-col>
            {{ item.videos }}
          </b-col>
        </b-row>
        <b-row class="mb-4">
          <b-col sm="3">
            <b>Rating</b>
            <icon-check :status="item.scores.rating" />
          </b-col>
          <b-col>
            <div v-show="Math.round(item.rating) === 1 || Math.round(item.rating) === 2">
              {{ item.rating }}/5 is bad.
            </div>
            <div show v-show="Math.round(item.rating) === 3">
              {{ item.rating }}/5 is average.
            </div>
            <div show v-show="Math.round(item.rating) === 4 || Math.round(item.rating) === 5">
              {{ item.rating }}/5 is good.
            </div>
          </b-col>
        </b-row>
        <b-row class="mb-4">
          <b-col sm="3">
            <b>Rankings</b>
            <icon-check :status="item.scores.rankings" />
          </b-col>
          <b-col>
            <div v-show="item.rankings.length === 0">No rankings.</div>
            <div v-for="(ranking, index) in item.rankings" :key="index" v-text="ranking"></div>
          </b-col>
        </b-row>
        <b-row class="mb-4">
          <b-col sm="3">
            <b>A+ Page</b>
            <icon-check :status="item.scores.aPlusPage" />
          </b-col>
          <b-col>
            <div v-show="item.detailPage">
              There is an A+ page.
            </div>
            <div v-show="!item.detailPage">
              There is no A+ page.
            </div>
          </b-col>
        </b-row>
        <b-row class="mb-4">
          <b-col sm="3">
            <b>Best seller</b>
            <icon-check :status="item.scores.bestSeller" />
          </b-col>
          <b-col>
            <div v-show="item.bestSeller">
              This product is a best seller.
            </div>
            <div v-show="!item.bestSeller">
              This product is not a best seller.
            </div>
          </b-col>
        </b-row>
        <b-row class="mb-4">
          <b-col sm="3">
            <b>Reviews</b>
            <icon-check :status="item.scores.reviews" />
          </b-col>
          <b-col>
            {{ item.reviews }} reviews
          </b-col>
        </b-row>
        <b-row class="mb-4">
          <b-col sm="3">
            <b>Replied reviews</b>
            <icon-check :status="item.scores.replies" />
          </b-col>
          <b-col>
            {{ item.replies }} replies
          </b-col>
        </b-row>
        <b-row class="mb-4">
          <b-col sm="3">
            <b>Date First Available</b>
          </b-col>
          <b-col>
            <div v-show="item.dateFirstAvailable === null">Unknown</div>
            {{ item.dateFirstAvailable }}
          </b-col>
        </b-row>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
import IconCheck from '@/components/IconCheck';
import moment from 'moment';
import { mapGetters } from 'vuex';
import { getScoreForBulletPoint } from '@/score';

export default {
  name: 'report-details',
  props: {
    uid: String,
  },
  data() {
    return {
      item: null,
    };
  },
  created() {
    this.item = this.report.find(row => row.uid === this.uid);

    if (!this.item) {
      this.$router.push({ name: 'report' });
    }
  },
  methods: {
    getScoreForBulletPoint(text) {
      return getScoreForBulletPoint(text);
    },
    getDate(isoDate) {
      return moment(isoDate).format('MM.DD.YYYY HH:mm');
    },
    openLink(link) {
      this.$electron.shell.openExternal(link);
    },
  },
  computed: {
    ...mapGetters([
      'reseller',
      'report',
    ]),
  },
  components: {
    IconCheck,
  },
};
</script>

<style lang="scss">
.icon-info {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  padding: 0;
  display: inline-block;
}
</style>