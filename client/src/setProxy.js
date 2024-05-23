const { createProxyMiddleware } = require("http-proxy-middleware");
const { SERVER_URL } = require("./util/url");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("*", {
      target: SERVER_URL.TARGET_URL(),
      // target: "14.42.124.96:3000",
      changeOrigin: true,
    })
  );
};