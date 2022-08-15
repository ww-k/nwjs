"use strict";

/**
 * Module dependencies
 */
const fs = require("fs");
const home = require("user-home");
const config = require("./config");

module.exports = function (version) {
    try {
        const current = config.get("current");

        if (current === version) {
            config.set("current", null);
        }

        const dir = `${home}/.nwjs/${version}`;
        fs.rmdirSync(dir, {
            recursive: true,
        });
    } catch (e) {
        console.log(e.stack);
    }
};
