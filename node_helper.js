const NodeHelper = require("node_helper");
const request = require("request");

module.exports = NodeHelper.create({
    start: function() {
        console.log("MMM-FieldHockey-FFH helper started...");
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "GET_RANKINGS") {
            this.getRankings(payload);
        }
    },

    getRankings: function(apiUrl) {
        var self = this;
        request(apiUrl, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);
                if (data.Response && data.Response.Classement && data.Response.Classement.ClassmentLignes) {
                    self.sendSocketNotification("RANKINGS_RESULT", data.Response.Classement.ClassmentLignes);
                }
            }
        });
    }
});

