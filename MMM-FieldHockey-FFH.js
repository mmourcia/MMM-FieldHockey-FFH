Module.register("MMM-FieldHockey-FFH", {
    defaults: {
        updateInterval: 3600000, // 1 hour
        rotationInterval: 10000, // 10 seconds
        poules: [
            { SaisonAnnee: 2024, PouleId: 10483, PouleTitle: "Poule 1", PouleLogo: "" }
            // Add more poules here
        ],
        apiUrl: "https://championnats.ffhockey.org/rest2/Championnats/ClassementEquipes"
    },

    start: function() {
        this.rankings = [];
        this.currentPouleIndex = 0;
        this.getRankings();
        this.scheduleUpdate();
        this.scheduleRotation();
    },

    getStyles: function() {
        return ["MMM-FieldHockey-FFH.css"];
    },

    getDom: function() {
        var wrapper = document.createElement("div");
        wrapper.className = "MMM-FieldHockey-FFH-container";

        var poule = this.config.poules[this.currentPouleIndex];
        var pouleTitle = poule.PouleTitle;

        var titleContainer = document.createElement("div");
        titleContainer.className = "title-container";

        var logoContainer = document.createElement("div");
        logoContainer.className = "logo-container";
        var logoImg = document.createElement("img");
        logoImg.src = poule.PouleLogo;
        logoContainer.appendChild(logoImg);
        titleContainer.appendChild(logoContainer);

        var title = document.createElement("div");
        title.className = "poule-title";
        title.innerHTML = pouleTitle;
        titleContainer.appendChild(title);

        wrapper.appendChild(titleContainer);

        var hr = document.createElement("hr");
        wrapper.appendChild(hr);

        var tableContainer = document.createElement("div");
        tableContainer.className = "table-container";
        var table = document.createElement("table");
        table.className = "small";

        if (this.rankings.length === 0) {
            var loading = document.createElement("div");
            loading.innerHTML = "Chargement des classements...";
            wrapper.appendChild(loading);
            return wrapper;
        }

        var headerRow = document.createElement("tr");
        var headers = ["Pos", "Équipe", "Pts", "J", "G", "N", "P", "BP", "BC", "Diff"];
        headers.forEach(header => {
            var th = document.createElement("th");
            th.innerHTML = header;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        this.rankings.forEach(team => {
            var row = document.createElement("tr");

            var cols = [
                team.ClassmPos,
                `<span class="team-name">${team.Equipe.EquipeNom}</span>`,
                team.ClassmPts,
                team.ClassmMatchJ,
                team.ClassmMatchG,
                team.ClassmMatchN,
                team.ClassmMatchP,
                team.ClassmButP,
                team.ClassmButC,
                team.ClassmDiff
            ];

            cols.forEach(col => {
                var td = document.createElement("td");
                td.innerHTML = col;
                row.appendChild(td);
            });

            table.appendChild(row);
        });

        tableContainer.appendChild(table);
        wrapper.appendChild(tableContainer);

        return wrapper;
    },

    getRankings: function() {
        var poule = this.config.poules[this.currentPouleIndex];
        var apiUrl = `${this.config.apiUrl}?SaisonAnnee=${poule.SaisonAnnee}&PouleId=${poule.PouleId}`;
        this.sendSocketNotification("GET_RANKINGS", apiUrl);
    },

    scheduleUpdate: function() {
        var self = this;
        setInterval(function() {
            self.getRankings();
        }, this.config.updateInterval);
    },

    scheduleRotation: function() {
        var self = this;
        setInterval(function() {
            self.currentPouleIndex = (self.currentPouleIndex + 1) % self.config.poules.length;
            self.getRankings();
        }, this.config.rotationInterval);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "RANKINGS_RESULT") {
            this.rankings = payload;
            this.updateDom();
        }
    }
});

