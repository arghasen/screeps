var utils = require("utils");
var roleContinuousHarvester = {
  /** @param {Creep} creep **/
  run: function (creep) {
    utils.harvestEnergy(creep);
  },
};

module.exports = roleContinuousHarvester;
