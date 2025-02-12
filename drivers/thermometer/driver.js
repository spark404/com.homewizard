'use strict';

const Homey = require('homey');
//const request = require('request');


//const { ManagerDrivers } = require('homey');
//const driver = ManagerDrivers.getDriver('homewizard');

var devices = {};
var homewizard = require('./../../includes/homewizard.js');
var homewizard_devices;

class HomeWizardThermometer extends Homey.Driver {

    onInit() {
        console.log('HomeWizard Thermometer has been inited');
    }

    async onPair(socket) {
        // Show a specific view by ID
        socket.showView('start');

        // Show the next view
        await socket.nextView();

        // Show the previous view
        await socket.prevView();

        // Close the pair session
        await socket.done();

        // Received when a view has changed
        socket.setHandler('showView', async function (viewId) {
          if (errorMsg) {
                     Homey.app.log(`[Driver] - Show errorMsg:`, errorMsg);
                     socket.emit('error_msg', errorMsg);
                     errorMsg = false;
          }
        });


        //socket.on('get_homewizards', function () {
        socket.setHandler('get_homewizards', () => {

            //homewizard_devices = driver.getDevices();
            homewizard_devices = this.homey.drivers.getDriver('homewizard').getDevices();

            homewizard.getDevices(function ( homewizard_devices)  {
                var hw_devices = {};

                Object.keys(homewizard_devices).forEach(function (key) {
                    var thermometers = JSON.stringify(homewizard_devices[key].polldata.thermometers);

                    hw_devices[key] = homewizard_devices[key];
                    hw_devices[key].polldata = {}
                    hw_devices[key].thermometers = thermometers;
                });

                console.log(hw_devices);
                socket.emit('hw_devices', hw_devices);

            });
        });

        socket.setHandler('manual_add', async function (device) {
            if (typeof device.settings.homewizard_id == "string" && device.settings.homewizard_id.indexOf('HW_') === -1 && device.settings.homewizard_id.indexOf('HW') === 0) {
                //true
                console.log('Thermometer added ' + device.data.id);
                devices[device.data.id] = {
                  id: device.data.id,
                  name: device.name,
                  settings: device.settings,
                };
                socket.emit("success", device);
                return devices;

            } else {
                socket.emit("error", "No valid HomeWizard found, re-pair if problem persists");
            }
        });

        socket.setHandler('disconnect', () => {
            console.log("User aborted pairing, or pairing is finished");
        });
    };

    onPairListDevices( data, callback ) {
        const devices = [

        ]

        callback(null, devices);
    };

}

module.exports = HomeWizardThermometer;
