const express = require("express");
const { Client } = require("@googlemaps/google-maps-services-js");
const app = express();
require("dotenv").config();

const port = 8080;

const client = new Client({});
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

async function getDistances(driverLocations, shopLocations) {
  const origins = driverLocations.map((driver) => ({
    lat: driver.lat,
    lng: driver.lng,
  }));
  const destinations = shopLocations.map((shop) => ({
    lat: shop.lat,
    lng: shop.lng,
  }));

  try {
    const response = await client.distancematrix({
      params: {
        origins,
        destinations,
        key: API_KEY,
      },
    });

    console.log(
      "Google Maps API response:",
      JSON.stringify(response.data, null, 2)
    );

    const distanceData = response.data.rows.map((row, i) => {
      return row.elements
        .map((element, j) => {
          if (element.status === "OK") {
            console.log(
              `Distance from ${driverLocations[i].name} to ${shopLocations[j].name}: ${element.duration.text} (${element.distance.value} meters)`
            );
            return {
              driverId: driverLocations[i].id,
              driverName: driverLocations[i].name,
              shopId: shopLocations[j].id,
              shopName: shopLocations[j].name,
              distance: element.duration.text,
              distanceValue: element.duration.value,
            };
          } else {
            console.error(
              `Error for driver ${driverLocations[i].name} and shop ${shopLocations[j].name}: ${element.status}`
            );
            return null;
          }
        })
        .filter((item) => item !== null);
    });

    return distanceData.flat();
  } catch (error) {
    console.error("Error fetching distances from Google Maps API:", error);
    return [];
  }
}async function findClosestDrivers(driverLocations, shopLocations) {
  const distanceData = await getDistances(driverLocations, shopLocations);
  const assignedShops = new Map(); // Map to store shops assigned to each driver
  const closestDrivers = [];

  shopLocations.forEach((shop) => {
    const shopDistances = distanceData
      .filter((data) => data.shopId === shop.id)
      .sort((a, b) => a.distanceValue - b.distanceValue);

    for (const data of shopDistances) {
      const driverId = data.driverId;
      if (!assignedShops.has(driverId)) {
        // If this is the first shop assigned to the driver, initialize the driver's data
        assignedShops.set(driverId, {
          shops: [shop],
          totalDuration: data.distanceValue,
          lastShopIndex: 0,
        });
        break;
      } else {
        const driverData = assignedShops.get(driverId);
        const lastShop = driverData.shops[driverData.lastShopIndex];
        const timeDifference = data.distanceValue - driverData.totalDuration;

        if (timeDifference >= 420) { // 7 minutes in seconds
          // If the time difference is 7 minutes or more, assign the shop to the driver
          driverData.shops.push(shop);
          driverData.totalDuration += timeDifference;
          driverData.lastShopIndex++;
          break;
        }
      }
    }
  });

  // Format the result
  assignedShops.forEach((driverData, driverId) => {
    driverData.shops.forEach((shop, index) => {
      closestDrivers.push({
        driver: driverLocations.find(driver => driver.id === driverId).name,
        shop: shop.name,
        distance: distanceData.find(data => data.shopId === shop.id && data.driverId === driverId).distance,
      });
    });
  });

  return closestDrivers;
}


app.get("/", async (req, res) => {
  const driverLocations = [
    {
      id: 1,
      name: "Driver A",
      lat: 31.93378709580865,
      lng: 35.163401564799564,
    },
    {
      id: 2,
      name: "Driver B",
      lat: 31.93378709580865,
      lng: 35.163401564799564,
    },
    {
      id: 3,
      name: "Driver C",
      lat: 31.93378709580865,
      lng: 35.163401564799564,
    },
  ];

  const shopLocations = [
    { id: 8, name: "Shop A", lat: 31.9197688227728, lng: 35.21693786802346 },
    { id: 1, name: "Shop X", lat: 31.940026621132002, lng: 35.16957950739496 },
    { id: 2, name: "Shop Y", lat: 31.973111981350307, lng: 35.19838318838608 },
    { id: 3, name: "Shop Z", lat: 31.93378709580865, lng: 35.163401564799564 },
    { id: 4, name: "Shop M", lat: 37.409, lng: -122.008 },
    { id: 5, name: "Shop P", lat:31.961913303201417, lng: 35.184893159482165 },
    { id: 6, name: "Shop O", lat:31.96477248335715, lng: 35.189401264394895},
    { id: 7, name: "Shop E", lat:31.949236930568297, lng: 35.18153640703892},
  ];

  const closestDrivers = await findClosestDrivers(
    driverLocations,
    shopLocations
  );
  console.log("Closest drivers for each shop:", closestDrivers);

  res.send("Check the console for the closest driver for each shop.");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
