const db = require('../models');
const Bike = db.bikes;
const axios = require('axios');
const cheerio = require('cheerio');
// const Op = db.Sequelize.Op;

// see link https://www.youtube.com/watch?v=vf6ZcjCBUKo
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const AdBlockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdBlockerPlugin({ blockTrackers: true }));
// const { getData } = require('./getBikeData');

exports.getLinks = async (req, res) => {
  try {
    const { url } = req.body;
    const links = await scrape(url);
    console.log('Links scraped:');
    console.log(links.length);
    const newLinks = links.filter((link, idx) => links.indexOf(link) === idx);

    let count = (await Bike.count()) + 1;
    let bikeObjArr = [];
    for (var idx = 0; idx < newLinks.length; idx++) {
      let bike = await Bike.findOne({ where: { url: newLinks[idx] } });
      if (!bike) {
        console.log('new');
        bikeObjArr.push({
          url: newLinks[idx],
        });
      }
    }

    const bikes = await Bike.bulkCreate(bikeObjArr);

    res.status(200).json({
      statusCode: 200,
      message: `${bikes.length} bikes' links scraped`,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
};

exports.getBikes = async (req, res) => {
  try {
    const leftBikes = await Bike.findAll({
      where: { brand: null },
      order: [['url', 'DESC']],
    });
    console.log(leftBikes.length);

    let errBikeLinks = [];
    for (var idx in leftBikes) {
      console.log(idx);
      console.log(leftBikes[idx].url);
      const bikeData = await getBike(leftBikes[idx].url);
      if (bikeData.err === '') {
        await Bike.update(bikeData.bike, {
          where: { url: leftBikes[idx].url },
        });
      } else {
        errBikeLinks.push(leftBikes[idx].url);
      }
    }

    res.status(200).json({
      statusCode: 200,
      message: 'Finished scraping bike data',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
};

async function grabTotalPages(page) {
  return await page.evaluate(() => {
    // let noNextPage =
    //   document.querySelector('#content > div > div.bikes-filter-data')
    //     .childElementCount < 3;
    let noNextPage =
      document.querySelector('#content > nav > div').childElementCount < 3;
    if (noNextPage) {
      return 1;
    } else {
      // let pageLinks = document.querySelectorAll(
      //   '#content > div > div.bikes-filter-data > nav > div a'
      // );
      let pageLinks = document.querySelectorAll('#content > nav > div a');

      let pageNo = pageLinks[pageLinks.length - 2].innerText;

      if (pageNo.includes(',')) {
        pageNo = pageNo.replace(/,/g, '');
      }
      return parseInt(pageNo);
    }
    // pageNo = pageNo.innerText === null ? 1 : pageNo.innerText;
  });
}

async function getLinksInPage(page) {
  return page.evaluate(() => {
    const links = [];
    document
      .querySelectorAll('#content li.bike-model article div.post-details h2 a')
      .forEach((e) => {
        links.push(e.getAttribute('href'));
      });
    return links;
  });
}

async function scrape(url) {
  console.log('Started scraping...');
  const browser = await puppeteer.launch({
    headless: false,

    executablePath:
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    userDataDir:
      '/Users/ztlab62/Library/Application Support/Google/Chrome/Default',
    args: ['--proxy-server=http://185.134.49.179:3128'],
  });
  let page = await browser.newPage();

  await page.goto(url);
  await page.waitForTimeout(10000);
  console.log(url);
  const totalPages = await grabTotalPages(page);
  console.log('Total pages to scrape: ', totalPages);

  let links = [];
  for (var idx = 1; idx <= totalPages; idx++) {
    links = links.concat(await getLinksInPage(page));
    // console.log(await getData(links));

    if (idx != totalPages) {
      // $eval instead of $ because of Node is detached from document error see link: https://github.com/puppeteer/puppeteer/issues/3496
      // await page.$eval('div.nav-links > span.current + a', (e) => e.click());
      // await page.wait;
      if (
        page.$eval(
          // '#content > div > div.bikes-filter-data',
          '#content > nav > div',
          (e) => e.hasChildNodes().length > 1
        )
      ) {
        await Promise.all([
          await page.$eval(
            // '#content > div > div.bikes-filter-data > nav > div.nav-links > span.current + a',
            '#content > nav > div.nav-links > span.current + a',
            (e) => e.click()
          ),
          // await page.waitForNavigation(),
          await page.waitForTimeout(7000),
        ]);
      }
    }
  }

  await page.close();
  await browser.close();
  return links;
}

async function getBike(link) {
  let pageHtml;
  try {
    const { data } = await axios.get(link);
    pageHtml = data;
  } catch (err) {
    return {
      bike: {},
      err: err.message,
    };
  }

  const $ = cheerio.load(pageHtml);
  let bikeObj = {};
  // url: link,
  // electric: '',
  // brand: '',
  // model: '',
  // year: '',
  // image: '',
  // imageName: `bike${String(count).padStart(TOTAL, '0')}`,
  // price: '',
  // category: '',
  // wheels: '',
  // frame: '',
  // suspensionFork: '',
  // rearShock: '',
  // rearDerailleur: '',
  // frontDerailleur: '',
  // shiftLevers: '',
  // cassette: '',
  // crank: '',
  // bottomBracket: '',
  // chain: '',
  // pedals: '',
  // chainGuide: '',
  // rims: '',
  // tires: '',
  // frontHub: '',
  // rearHub: '',
  // spokes: '',
  // brakes: '',
  // brakeLevers: '',
  // diskRotors: '',
  // stem: '',
  // handlebar: '',
  // grips: '',
  // headset: '',
  // saddle: '',
  // seatpost: '',
  // motor: '',
  // battery: '',
  // remote: '',
  // charger: '',

  // rules
  const brandRule = 'h1.article-title.bike-title > span.brand';
  const modelRule = 'h1.article-title.bike-title > span.model';
  const imageRule = 'div.post-thumb-inner > a.image';
  const categoryRule =
    'div.bike-summary > ul > li > div.text > span.desc > ul.bike-categories > li';
  const priceRule = 'div.bike-info > div.bike-price > span.price';
  const currencyRule = 'div.bike-info > div.bike-price > span.currency';

  bikeObj.brand = $(brandRule).text().trim();
  const model = $(modelRule).text().trim();
  bikeObj.model = model.substring(0, model.length - 5);
  bikeObj.year = model.substring(model.length - 4, model.length);
  bikeObj.image = $(imageRule).attr('href');

  if ($(`${categoryRule}:nth-child(1)`).text().trim() === 'E-bike') {
    bikeObj.electric = true;
    bikeObj.category = $(`${categoryRule}`).text().replace(/\s/g, '');
  } else {
    bikeObj.electric = false;
    bikeObj.category = $(`${categoryRule}`).text().replace(/\s/g, '');
  }

  bikeObj.price = $(priceRule).text().trim() + ' ' + $(currencyRule).text();

  // bike summary side bar info
  const bikeSummaryListLength = $(
    'div.bike-summary > ul > li > div.text'
  ).length;

  for (var i = 1; i <= bikeSummaryListLength; i++) {
    let rule = `div.bike-summary > ul > li:nth-child(${i})`;
    let bikeData = $(`${rule} > div.text > span.desc`).text().trim();

    switch (
      String($(`${rule} > div.text > span.title`).text().trim().toLowerCase())
    ) {
      case 'wheels':
        bikeObj.wheels = bikeData;
        break;

      default:
        //   console.log('affe', String(rule.text().trim().toLowerCase()));
        continue;
    }
  }

  // bike components info
  const bikeComponentsRule =
    'div.bike-additional-data > div.container > div.bike-componentes-wrapper > div.bike-components > div.components-group';

  for (var i = 1; i <= $(bikeComponentsRule).length; i++) {
    let bikeComponentGroupRule = `${bikeComponentsRule}:nth-child(${i + 1})`;
    let bikeComponentGroupHeadingRule = `${bikeComponentGroupRule} > h3`;

    let bikeComponentDivRule = `${bikeComponentGroupRule} > div.component`;
    switch (
      String($(bikeComponentGroupHeadingRule).text().trim().toLowerCase())
    ) {
      case 'frame':
        for (var j = 1; j <= $(bikeComponentDivRule).length; j++) {
          let frameData = $(`${bikeComponentDivRule}:nth-child(${j + 1}) > p`)
            .text()
            .trim();
          switch (
            String(
              $(`${bikeComponentDivRule}:nth-child(${j + 1}) > h4`)
                .text()
                .trim()
                .toLowerCase()
            )
          ) {
            case 'frame':
              bikeObj.frame = frameData;
              break;
            case 'suspension fork':
              bikeObj.suspensionFork = frameData;
              break;
            case 'rear shock':
              bikeObj.rearShock = frameData;
              break;
            default:
              continue;
          }
        }
        break;
      case 'drivetrain':
        for (var j = 1; j <= $(bikeComponentDivRule).length; j++) {
          const drivetrainData = $(
            `${bikeComponentDivRule}:nth-child(${j + 1}) > p`
          )
            .text()
            .trim();
          switch (
            String(
              $(`${bikeComponentDivRule}:nth-child(${j + 1}) > h4`)
                .text()
                .trim()
                .toLowerCase()
            )
          ) {
            case 'rear derailleur':
              bikeObj.rearDerailleur = drivetrainData;
              break;
            case 'front derailleur':
              bikeObj.frontDerailleur = drivetrainData;
              break;
            case 'shift levers':
              bikeObj.shiftLevers = drivetrainData;
              break;
            case 'cassette':
              bikeObj.cassette = drivetrainData;
              break;
            case 'crank':
              bikeObj.crank = drivetrainData;
              break;
            case 'bottom bracket':
              bikeObj.bottomBracket = drivetrainData;
              break;
            case 'chain':
              bikeObj.chain = drivetrainData;
              break;
            case 'pedals':
              bikeObj.pedals = drivetrainData;
              break;
            case 'chain guide':
              bikeObj.chainGuide = drivetrainData;
              break;
            default:
              continue;
          }
        }
        break;
      case 'wheels':
        for (var j = 1; j <= $(bikeComponentDivRule).length; j++) {
          const wheelsData = $(
            `${bikeComponentDivRule}:nth-child(${j + 1}) > p`
          )
            .text()
            .trim();
          switch (
            String(
              $(`${bikeComponentDivRule}:nth-child(${j + 1}) > h4`)
                .text()
                .trim()
                .toLowerCase()
            )
          ) {
            case 'rims':
              bikeObj.rims = wheelsData;
              break;
            case 'tires':
              bikeObj.tires = wheelsData;
              break;
            case 'front hub':
              bikeObj.frontHub = wheelsData;
              break;
            case 'rear hub':
              bikeObj.rearHub = wheelsData;
              break;
            case 'spokes':
              bikeObj.spokes = wheelsData;
              break;
            default:
              continue;
          }
        }
        break;
      case 'brakes':
        for (var j = 1; j <= $(bikeComponentDivRule).length; j++) {
          const brakesData = $(
            `${bikeComponentDivRule}:nth-child(${j + 1}) > p`
          )
            .text()
            .trim();
          switch (
            String(
              $(`${bikeComponentDivRule}:nth-child(${j + 1}) > h4`)
                .text()
                .trim()
                .toLowerCase()
            )
          ) {
            case 'brakes':
              bikeObj.brakes = brakesData;
              break;
            case 'brake levers':
              bikeObj.brakeLevers = brakesData;
              break;
            case 'disk rotors':
              bikeObj.diskRotors = brakesData;
              break;
            default:
              continue;
          }
        }
        break;
      case 'cockpit':
        for (var j = 1; j <= $(bikeComponentDivRule).length; j++) {
          const cockpitData = $(
            `${bikeComponentDivRule}:nth-child(${j + 1}) > p`
          )
            .text()
            .trim();
          switch (
            String(
              $(`${bikeComponentDivRule}:nth-child(${j + 1}) > h4`)
                .text()
                .trim()
                .toLowerCase()
            )
          ) {
            case 'stem':
              bikeObj.stem = cockpitData;
              break;
            case 'handlebar':
              bikeObj.handlebar = cockpitData;
              break;
            case 'grips':
              bikeObj.grips = cockpitData;
              break;
            case 'headset':
              bikeObj.headset = cockpitData;
              break;
            default:
              continue;
          }
        }
        break;
      case 'seat':
        for (var j = 1; j <= $(bikeComponentDivRule).length; j++) {
          const seatData = $(`${bikeComponentDivRule}:nth-child(${j + 1}) > p`)
            .text()
            .trim();
          switch (
            String(
              $(`${bikeComponentDivRule}:nth-child(${j + 1}) > h4`)
                .text()
                .trim()
                .toLowerCase()
            )
          ) {
            case 'saddle':
              bikeObj.saddle = seatData;
              break;
            case 'seatpost':
              bikeObj.seatpost = seatData;
              break;
            default:
              continue;
          }
        }
        break;
      case 'motor & battery':
        for (var j = 1; j <= $(bikeComponentDivRule).length; j++) {
          const motorBatteryData = $(
            `${bikeComponentDivRule}:nth-child(${j + 1}) > p`
          )
            .text()
            .trim();
          switch (
            String(
              $(`${bikeComponentDivRule}:nth-child(${j + 1}) > h4`)
                .text()
                .trim()
                .toLowerCase()
            )
          ) {
            case 'motor':
              bikeObj.motor = motorBatteryData;
              break;
            case 'battery':
              bikeObj.battery = motorBatteryData;
              break;
            case 'remote':
              bikeObj.remote = motorBatteryData;
              break;
            case 'charger':
              bikeObj.charger = motorBatteryData;
              break;
            default:
              continue;
          }
        }
        break;
      default:
        continue;
    }
  }
  //   console.log(bikeObj);
  // count++;
  return {
    bike: bikeObj,
    err: '',
  };
}

const getData = async (links) => {
  let bikes = [];
  let errGettingBikeLinks = [];
  for (var i = 0; i < links.length; i++) {
    let data = await getBike(links[i]);

    if (data.bike !== {}) {
      bikes.push(data.bike);
    } else {
      console.log(`Error in getting data for link: ${links[i]}`);
      console.log(data.err);
      errGettingBikeLinks.push(links[i]);
    }

    console.log(i);
  }

  require('fs').writeFileSync(
    'err.txt',
    errGettingBikeLinks.toString(),
    'utf-8'
  );

  return bikes;
};
