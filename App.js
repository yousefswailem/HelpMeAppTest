const protoPath = "./protos/maps/routing/v2/routes.proto";
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition).google.maps.routing.v2;
const metadata = new grpc.Metadata();
const host = "routes.googleapis.com:443";
const apiKey = "AIzaSyDiD-XCIDT5P8mrQIankhkm8lC4Ml2aoDM";
const fieldMask = "*";

let ComputeRoutesRequest = {
  origin: {
    location: {
      lat_lng: {
        latitude: -37.816,
        longitude: 144.964,
      },
    },
  },
  destination: {
    location: {
      lat_lng: {
        latitude: -37.815,
        longitude: 144.966,
      },
    },
  },
  routing_preference: "TRAFFIC_AWARE",
  travel_mode: "DRIVE",
};

const ssl_creds = grpc.credentials.createSsl();
const call_creds = grpc.credentials.createFromMetadataGenerator(function (args, callback) {
  metadata.set("X-Goog-Api-Key", apiKey);
  metadata.set("X-Goog-Fieldmask", fieldMask);
  metadata.set("Content-Type", "application/json");
  callback(null, metadata);
});

const credentials = grpc.credentials.combineChannelCredentials(ssl_creds, call_creds);
const client = new protoDescriptor.Routes(host, credentials);

client.ComputeRoutes(ComputeRoutesRequest, (error, response) => {
  if (error) {
    console.error("Error:", error);
  } else if (response) {
    console.log("ComputeRoutes Response:", response);
    response.routes.forEach((route, index) => {
      const distanceMeters = route.distanceMeters;
      const duration = route.duration;
      const encodedPolyline = route.polyline.encodedPolyline;
      
      console.log(`Route ${index + 1}:`);
      console.log(`Distance (meters): ${distanceMeters}`);
      console.log(`Duration: ${duration}`);
      console.log(`Encoded Polyline: ${encodedPolyline}`);
      console.log("-------------------------");
    });
  }
});
