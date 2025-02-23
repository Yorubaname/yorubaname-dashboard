'use strict';

angular
    .module('domainConfigModule', [])
    .provider("DomainConfig", function () {
        var yorubaSettings = {
            siteDisplayName: "Yoruba Names",
            topBarColor: "yoruba-theme",
            logoUrl: "https://www.yorubaname.com/img/yn-logo-brown-black.png",
            language: "Yoruba"
        };

        var domainSettings = {
            yoruba: yorubaSettings,
            igbo: {
                siteDisplayName: "Igbo Names",
                topBarColor: "igbo-theme",
                logoUrl: "https://testing.igbonames.com/img/igboname-logo.png",
                language: "Igbo"
            },
            default: yorubaSettings
        };

        // The $get method is where the actual service is defined
        this.$get = function () {
            var domain = window.location.hostname; // Use the global window object
            if (domain.includes("yorubaname")) {
                return domainSettings.yoruba;
            } else if (domain.includes("igboname")) {
                return domainSettings.igbo;
            } else {
                return domainSettings.default;
            }
        };
    });

