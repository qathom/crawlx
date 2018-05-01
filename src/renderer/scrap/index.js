import { parsePrice, getCurrency, getHostName } from '@/utils';
import { getPreference } from '@/preferences';
import puppeteer from 'puppeteer';
import moment from 'moment';
import browser from '@/browser';

/* eslint import/prefer-default-export: 0 */
/* eslint no-restricted-syntax: 0 */
/* eslint no-await-in-loop: 0 */
/* eslint no-console: 0 */
export default async function (url = '', productSearch = '') {
  return new Promise(async (resolve, reject) => {
    const res = {
      id: productSearch,
      title: '',
      price: -1,
      currency: null,
      rating: -1,
      rankings: [],
      date: moment().toISOString(),
      bestSeller: false,
      reviews: -1,
      replies: -1,
      lostBuyBox: false,
      buyBoxSeller: {
        name: '',
        link: '',
        price: -1,
        details: '',
      },
      site: getHostName(url),
      link: null,
      images: 0,
      videos: 0,
      bulletPoints: [],
      detailPage: false,
    };

    const browserConfig = await browser();

    puppeteer.launch(browserConfig).then(async (browser) => {
      const page = await browser.newPage();
      await page.setViewport({
        width: 1600,
        height: 800,
        deviceScaleFactor: 1,
        isMobile: false,
      });

      /*
        * home page
        */
      await page.goto(url, {
        waitUntil: ['networkidle2'],
      });

      const searchInput = await page.$('input[name="field-keywords"]');

      if (!searchInput) {
        throw new Error('Invalid site: no search input.');
      }

      await page.type('input[name="field-keywords"]', productSearch);

      await Promise.all([
        page.click('input.nav-input'),
        page.waitForNavigation(),
      ]);

      /*
        * results
        */

      // check if product page exists
      const elTitle = await page.$('.s-access-title');

      if (!elTitle) {
        throw new Error('Product not found.');
      }

      const title = await page.evaluate(el => el.innerHTML, await elTitle.asElement());

      res.title = title.trim();

      await Promise.all([
        page.click('#atfResults .s-access-image'),
        page.waitForNavigation(),
      ]);

      // product page
      res.link = page.url();

      const elPrice = await page.$('#priceblock_ourprice');
      const elDealPrice = await page.$('#priceblock_dealprice');
      const elSalePrice = await page.$('#priceblock_saleprice');

      const elRatingTrigger = await page.$('#acrPopover');
      const elRankings = await page.$$('.zg_hrsr .zg_hrsr_item');

      const elBestSeller = await page.$('.badge-wrapper');
      const elBestSellerAmazon = await page.$('.ac-badge-wrapper');

      const elReviews = await page.$('#acrCustomerReviewText');
      const elReviewReplies = await page.$('#askATFLink span');

      const elBulletPoints = await page.$$('#feature-bullets li:not(.aok-hidden) .a-list-item');

      const elAplusPage = await page.$('#aplus');

      let price = -1;

      if (elPrice) {
        price = await page.evaluate(el => el.innerHTML, await elPrice.asElement());
      }

      if (elDealPrice) {
        price = await page.evaluate(el => el.innerHTML, await elDealPrice.asElement());
      }

      if (elSalePrice) {
        price = await page.evaluate(el => el.innerHTML, await elSalePrice.asElement());
      }

      // rating
      let rating = -1;

      if (elRatingTrigger) {
        await page.click('#acrPopover');

        // rating is now computed
        const elRating = await page.$('#acrPopover .a-icon-alt');

        rating = await page.evaluate(el => el.innerHTML, await elRating.asElement());

        if (rating) {
          const matchStars = rating.match(/^([0-9.,]{1,3})/);

          if (matchStars && matchStars[1]) {
            rating = parseFloat(matchStars[1]);
          }
        }
      }

      let bestSeller = false;

      if (elBestSeller || elBestSellerAmazon) {
        bestSeller = true;
      }

      const rankings = [];

      for (const ranking of elRankings) {
        const elScore = await ranking.$('.zg_hrsr_rank');
        const elCategory = await ranking.$('.zg_hrsr_ladder a:last-child');

        const score = await page.evaluate(el => el.innerHTML, await elScore.asElement());
        const category = await page.evaluate(el => el.innerHTML, await elCategory.asElement());
        const scoreInfo = `${score.trim()} in ${category.trim()}`
          .replace('Nr. ', '#') // DE
          .replace('n°', '#') // FR
          .replace('n.° ', '#') // ES
          .replace('n.', '#'); // IT

        rankings.push(scoreInfo);
      }

      // number of reviews
      let reviews = 0;

      if (elReviews) {
        const reviewsText = await page.evaluate(el => el.innerHTML, await elReviews.asElement());
        const matchReviews = reviewsText.trim().match(/^([0-9.,]{1,6})/);

        if (matchReviews && matchReviews[1]) {
          reviews = parseFloat(matchReviews[1].replace(',', '').replace('\'', '').replace('.', '')) || 0;
        }
      }

      let replies = 0;

      if (elReviewReplies) {
        const repliesText = await page
          .evaluate(el => el.innerHTML, await elReviewReplies.asElement());
        const matchReplies = repliesText.trim().match(/^([0-9.,]{1,6})/);

        if (matchReplies && matchReplies[1]) {
          replies = parseFloat(matchReplies[1]) || 0;
        }
      }

      // bullet points
      const bulletPoints = [];

      for (const elBulletPoint of elBulletPoints) {
        const text = await page.evaluate(el => el.innerHTML, await elBulletPoint.asElement());
        bulletPoints.push(text.trim().replace(/&nbsp;/g, ' '));
      }

      // images and videos are in a modal
      await Promise.all([
        page.click('#imgTagWrapperId img'),
      ]);

      // wait on modal
      await page.waitForSelector('.a-modal-scroller');

      // force click on the Images tab
      // warning it does not exist if there is no video!
      await page.waitForSelector('#ivImagesTabHeading a', {
        timeout: 1500,
        visible: true,
      }).then(async () => {
        await Promise.all([
          page.click('#ivImagesTabHeading a'),
          page.waitForSelector('#ivImagesTab'),
        ]);
      }).catch(() => {
        console.log('No image tab');
      });

      const totalImages = await page.$$eval('#ivThumbs .ivRow .ivThumb', imgs => imgs.length);

      // videos
      await page.waitForSelector('#ivVideosTabHeading a', {
        timeout: 500,
        visible: true,
      }).then(async () => {
        await Promise.all([
          page.click('#ivVideosTabHeading a'),
          page.waitForSelector('#ivVideosTab'),
        ]);
      }).catch(() => {
        console.log('No video tab');
      });

      let totalVideos = 0;
      const elVideos = await page.$$('#vse-ib-rv ol li.a-carousel-card');

      if (elVideos) {
        totalVideos = await page.$$eval('#vse-ib-rv ol li.a-carousel-card', videos => videos.length);
      }

      // add data
      res.price = parsePrice(price);
      res.currency = getCurrency(price);
      res.rating = rating;
      res.rankings = rankings;
      res.bestSeller = bestSeller;
      res.reviews = reviews;
      res.replies = replies;
      res.bulletPoints = bulletPoints;
      res.images = totalImages;
      res.videos = totalVideos;
      res.detailPage = elAplusPage !== null;

      await page.reload({ waitUntil: ['networkidle2'] });

      await Promise.all([
        page.click('#olp_feature_div a'),
        page.waitForNavigation(),
      ]);

      // get first seller (owner of the buy box)
      const elSellerPrice = await page.$('#olpOfferList .olpPriceColumn span');
      const elSeller = await page.$('#olpOfferList .olpSellerColumn');
      const elAmazonAsSeller = await elSeller.$('img');

      let lostBuyBox = true;
      const buyBoxSeller = {};
      let sellerName = '';
      let sellerLink = '';
      const sellerPrice = await page.evaluate(el => el.innerHTML, await elSellerPrice.asElement());
      const details = [];

      // if there is an image, it is Amazon
      // no details link
      if (elAmazonAsSeller) {
        sellerName = 'Amazon';
        sellerLink = url;
        details.push(url);
      }

      if (sellerName === getPreference('reseller')) {
        lostBuyBox = false;
      }

      // if there is not an image, it is another reseller
      if (!elAmazonAsSeller) {
        const elSellerLink = await elSeller.$('.olpSellerName a');

        if (elSellerLink) {
          sellerName = await page.evaluate(el => el.innerHTML, await elSellerLink.asElement());
          sellerLink = url + await page.evaluate(el => el.getAttribute('href'), await elSellerLink.asElement());
        }

        // get detailed seller information
        await Promise.all([
          page.click('#olpOfferList .olpSellerColumn .olpSellerName a'),
          page.waitForNavigation(),
        ]);

        // address
        const elSellerFullAddress = await page.$$('#seller-profile-container ul.a-unordered-list ul .a-list-item');

        for (const elInfo of elSellerFullAddress) {
          const info = await page.evaluate(el => el.innerHTML, await elInfo.asElement());
          details.push(info);
        }
      }

      // add lost buy box data
      buyBoxSeller.name = sellerName.trim();
      buyBoxSeller.link = sellerLink;
      buyBoxSeller.price = parsePrice(sellerPrice);
      buyBoxSeller.details = details.toString();

      res.lostBuyBox = lostBuyBox;
      res.buyBoxSeller = buyBoxSeller;

      await browser.close();

      resolve(res);
    }).catch((error) => {
      reject(error);
    });
  });
}
