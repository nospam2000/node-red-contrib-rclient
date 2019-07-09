/**
 * Copyright 2015 Natural Intelligence Solutions
 * Copyright 2017 Siemens AG
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Author: Michael Angelo Ruta (2015)
 * Author: Michael Dreher (2017): use asynchronous execution via Promise; 
 *
 **/

module.exports = function(RED) {
	"use strict";
	var rio = require("rio");

	function RClientNode(config) {
		RED.nodes.createNode(this,config);

		var node = this;

		if(config.enabled) {

			this.on('input', function (msg) {
				if(msg.topic=='start') {
				} else if(msg.topic=='stop') {
					if(rio) {
						rio.shutdown();
					}
				} else {
					let riocmd = {
						data: msg.payload,
						host: config.host,
						port: config.port,
						user: config.user,
						password: config.password
					};

					if(msg.cmd !== undefined && msg.cmd != "") {
						riocmd.command = msg.cmd;
					} else {
						riocmd.command = config.cmd;
					}

					if(msg.entrypoint !== undefined && msg.entrypoint != "") {
						riocmd.entrypoint = msg.entrypoint;
					} else {
						riocmd.entrypoint = config.entrypoint;
					}

					rio.$e(riocmd).then(
						function(res) {
							msg.result = res;
							node.send(msg);
						}, 
						function(err) {
							node.error(err);
						}
					);
				}
			});

			this.on('close', function () {
				if(rio) {
					rio.shutdown();
				}
			});
		}
	}

	RED.nodes.registerType("R client",RClientNode);
}
