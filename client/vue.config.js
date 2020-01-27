module.exports = {
  "devServer": {
    "port": 8080,
    "proxy": {
      "/api": {
        "target": "http://localhost:5000/firebase-payment-test/us-central1/app"
      }
    }
  },
  "outputDir": "../functions/public",
  "transpileDependencies": [
    "vuetify"
  ]
}