if(!isset(window.peripheral)){
    window.peripheral = {};
}
window.Peripheral = (function() {
    function Peripheral(p) {
    	this.queue = [];
    	this.isExecuting = false;
    	this.refreshKey = "";
    	this.default_connect_used = false;
        this.prop = {
            password:'000000',
            gangs:[0,0,0,0,0,0,0,0, 0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0, 0, 0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0], //io0 - io7, pwm1 - pwm4, rcu onoff 1 - 20, rcu dimming 1 - 10, Thermostat 1-6(ref,mode,fan,set_temp,reality_temp,humidity),curtain motor 48 ,Radar 49,RCU output 50-83
            status:{
                bluetooth:[
                    [0,0,0,0,0,0,0,0, 0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0, 0, 0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0], //io0 - io7, pwm1 - pwm4, rcu onoff 1 - 20, rcu dimming 1 - 10, Thermostat 1-6(ref,mode,fan,set_temp,reality_temp,humidity),curtain motor 48,Radar 49,RCU output 50-83
                    '1970-01-01 00:00:00'
                ],
                control:[
                    [0,0,0,0,0,0,0,0, 0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0, 0, 0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0], //io0 - io7, pwm1 - pwm4, rcu onoff 1 - 20, rcu dimming 1 - 10, Thermostat 1-6(ref,mode,fan,set_temp,reality_temp,humidity),curtain motor 48,Radar 49,RCU output 50-83
                    '1970-01-01 00:00:00'
                ],
                mobmob:[
                    [0,0,0,0,0,0,0,0, 0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0, 0, 0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0], //io0 - io7, pwm1 - pwm4, rcu onoff 1 - 20, rcu dimming 1 - 10, Thermostat 1-6(ref,mode,fan,set_temp,reality_temp,humidity),curtain motor 48,Radar 49,RCU output 50-83
                    '1970-01-01 00:00:00'
                ],
                mesh:[
                    [0,0,0,0,0,0,0,0, 0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0, 0, 0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0], //io0 - io7, pwm1 - pwm4, rcu onoff 1 - 20, rcu dimming 1 - 10, Thermostat 1-6(ref,mode,fan,set_temp,reality_temp,humidity),curtain motor 48,Radar 49,RCU output 50-83
                    '1970-01-01 00:00:00'
                ],
                mqtt:[
                    [0,0,0,0,0,0,0,0, 0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0, 0, 0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0], //io0 - io7, pwm1 - pwm4, rcu onoff 1 - 20, rcu dimming 1 - 10, Thermostat 1-6(ref,mode,fan,set_temp,reality_temp,humidity),curtain motor 48,Radar 49,RCU output 50-83
                    '1970-01-01 00:00:00'
                ]
            },
            connected:false,
            connecting:false
        };
        this.route = {
            BLUETOOTH:'bluetooth',
            MOBMOB:'mobmob',
            MESH:'mesh',
            NA:null
        }
    	if(isset(p.connected)) this.prop.connected = p.connected;
    	if(isset(p.connecting)) this.prop.connecting = p.connecting;
        this.update(p);
    }

    Peripheral.prototype.update = function(p) {
        const self = this;
        setTimeout(function(){
            let focusRefresh = false;
            
            if(isset(p.guid)) self.prop.guid = p.guid;
            if(isset(p.id)) self.prop.id = p.id;
            if(isset(p.name)) self.prop.name = p.name;
            if(isset(p.hexModel)) self.prop.hexModel = p.hexModel.toUpperCase();
            if(isset(p.hexBatch)) self.prop.hexBatch = p.hexBatch.toUpperCase();
        	if(isset(p.lastDiscoverDate)){
        	     if(!isset(self.prop.lastDiscoverDate)){
        	         focusRefresh = true;
        	     }
        	     self.prop.lastDiscoverDate = p.lastDiscoverDate;
        	}
            if(isset(p.rssi)){
                if(!isset(self.prop.rssi)){
                    focusRefresh = true;
                }
                self.prop.rssi = p.rssi;
                if(p.rssi>=1000){
                    self.prop.disappear = true;
                    self.prop.rssilv = 0;
                    self.default_connect_used = false;
                }else{
                    self.prop.disappear = false;
                    if (p.rssi > -60) self.prop.rssilv = 5;
                    else if (p.rssi > -70) self.prop.rssilv = 3;
                    else self.prop.rssilv = 1;
                }
        	}
        	if(isset(p.characteristics)) self.prop.characteristics = p.characteristics;
        	if(isset(p.services)) self.prop.services = p.services;
        	if(isset(p.firmware)) p.firmware+="";
        	if(isset(p.firmware) && p.firmware != "----"){
        	    self.prop.firmware = p.firmware;
        	    self.prop.firmware = self.getFirmwareNo(p.firmware);
        	}
        	if(isset(p.password) && p.password != "000000") self.prop.password = p.password;
        	
        	if(isset(p.network_id)) self.prop.network_id = p.network_id;
        	if(isset(p.network_position)) self.prop.network_position = p.network_position;
        	if(isset(p.default_connect)) self.prop.default_connect = p.default_connect;
    
        	if(isset(p.mac_address) && (!isset(self.prop.mac_address) || self.prop.mac_address != p.mac_address)){
    			if(p.mac_address.includes(":")){
        			self.prop.mac_address = p.mac_address;
        			self.prop.mac_reverse_key = p.mac_address.split(":").reverse().join("");
    			}
    		}
        	if(isset(p.device_model)) self.prop.device_model = p.device_model;
        	if(isset(p.batch)) self.prop.batch = p.batch;
        	if(isset(p.device_mode)) self.prop.device_mode = p.device_mode;
        	
        	if(isset(p.gateway)) self.prop.gateway = p.gateway;
        	if(isset(p.is_mobmob)) self.prop.is_mobmob = p.is_mobmob;
        	
        	if(isset(p.is_mesh)) self.prop.is_mesh = p.is_mesh;
        	if(isset(p.manufactureData) && (!isset(self.prop.manufactureData) || self.prop.manufactureData != p.manufactureData)){
    	        self.prop.manufactureData = p.manufactureData;
        	    if (self.prop.manufactureData.length === 18 || self.prop.manufactureData.length == 44) {
                    self.prop.mnSize = parseInt(self.prop.manufactureData.substring(0, 2), 16);
                    self.prop.connectedSize = parseInt(self.prop.manufactureData.substring(3, 4), 16);
                    self.prop.pvi_flag = parseInt(self.prop.manufactureData.substring(14, 16), 16);
                    
                    let mn_flag = parseInt(self.prop.manufactureData.substring(2, 3), 16);
                    self.prop.mn_head_set = 0;
                    self.prop.mn_tail_set = 0;
                    self.prop.mn_head_connected = 0;
                    self.prop.mn_tail_connected = 0;
                    
                    if (mn_flag > 0) {
                    	if (mn_flag >= 8) {
                    		self.prop.mn_tail_connected = 1;
                    		mn_flag -= 8;
                    	} else {
                    		self.prop.mn_tail_connected = 0;
                    	}
                    	if (mn_flag >= 4) {
                    		self.prop.mn_tail_set = 1;
                    		mn_flag -= 4;
                    	} else {
                    		self.prop.mn_tail_set = 0;
                    	}
                    	if (mn_flag >= 2) {
                    		self.prop.mn_head_connected = 1;
                    		mn_flag -= 2;
                    	} else {
                    		self.prop.mn_head_connected = 0;
                    	}
                    	if (mn_flag >= 1) {
                    		self.prop.mn_head_set = 1;
                    		mn_flag -= 1;
                    	} else {
                    		self.prop.mn_head_set = 0;
                    	}
                    }
                    
                    // io status    
                    let io = parseInt(self.prop.manufactureData.substring(16, 18), 16);
                    for(let i=8; i>=0; i--){
                        let key = i.toString();
                        let value = "0";
                        if(io >= Math.pow(2, i)){
                            value = "1";
                            io -= Math.pow(2, i);
                        }
                        //self.prop.gangs[i] = parseInt(value);
                        self.prop.status.bluetooth[0][i] = parseInt(value);
                    }
                    
                    // pwm status
                    let dimmingIo = parseInt(self.prop.manufactureData.substring(4, 6), 16);
					self.prop.status.bluetooth[0][8] = dimmingIo
					
                    //thermostat status
					let thermostat = {
						power: parseInt(self.prop.manufactureData.substring(4,6), 16),
						model: parseInt(self.prop.manufactureData.substring(6,8), 16),
						fan: parseInt(self.prop.manufactureData.substring(8, 10), 16),
						temp: parseInt(self.prop.manufactureData.substring(10, 12), 16),
                        room_temp: parseInt(self.prop.manufactureData.substring(12,14), 16)
					}
					if(thermostat.power){
						//console.log(thermostat);
						//console.log(self.prop.manufactureData)
					}
                    self.prop.status.bluetooth[0][42] = thermostat.power;
					self.prop.status.bluetooth[0][43] = thermostat.model;
					self.prop.status.bluetooth[0][44] = thermostat.fan;
					self.prop.status.bluetooth[0][45] = thermostat.temp;
					self.prop.status.bluetooth[0][46] = thermostat.room_temp;
					
                    self.prop.status.bluetooth[1] = DateFormatter.format((new Date()), "Y-m-d H:i:s");
                    if(self.prop.status.control[1]=='1970-01-01 00:00:00'){
                        self.prop.status.control = JSON.parse(JSON.stringify(self.prop.status.bluetooth))
                    }
        	    }
        	}
        	
        	//checking if prop except rssi and lastdiscoverdate are changed
        	const prop = JSON.parse(JSON.stringify(self.prop));
        	delete prop.rssi;
        	delete prop.lastDiscoverDate;
        	delete prop.services;
        	delete prop.characteristics;
        	const refreshKey = md5(JSON.stringify(prop));
        	if(self.refreshKey != refreshKey || focusRefresh){
        	    self.refreshKey = refreshKey;
        	    setTimeout(function(){
        	        self.onPropChanged();
        	    }, 10);
        	}
        }, 10);
    };
    Peripheral.prototype.onConnectionChanged = function(state) {
        if(state=='connecting'){
            this.prop.connecting = true;
            this.prop.connected = false;
            
            $(`.home-scanned-peripheral[uuid="${this.prop.id}"]`).attr('bluetooth',2);
            $(`.bluetooth-icons[guid="${this.prop.guid}"]`).attr('ref', 2);
            $(`.home-scanned-peripheral[guid="${this.prop.guid}"]`).attr('bluetooth',2);
        }else if(state=='connected'){
            this.prop.connecting = false;
            this.prop.connected = true;
            
            $(`.home-scanned-peripheral[uuid="${this.prop.uuid}"]`).attr('bluetooth',1);
            $(`.home-scanned-peripheral[uuid="${this.prop.uuid}"]`).find('.control-panel-right[type-box="Dimming"]').attr('bluetooth',1);
            $(`.bluetooth-icons[guid="${this.prop.guid}"]`).attr('ref', 1);
            $(`.home-scanned-peripheral[guid="${this.prop.guid}"]`).attr('bluetooth',1);
        }else{
            this.prop.connecting = false;
            this.prop.connected = false;
            this.prop.authed = false;
            
            $(`.home-scanned-peripheral[uuid="${this.prop.uuid}"]`).attr('bluetooth',0);
            $(`.home-scanned-peripheral[uuid="${this.prop.uuid}"]`).find('.control-panel-right[type-box="Dimming"]').attr('bluetooth',0);
            $(`.bluetooth-icons[guid="${this.prop.guid}"]`).attr('ref', 0);
            $(`.home-scanned-peripheral[guid="${this.prop.guid}"]`).attr('bluetooth',0);
        }
        this.onPropChanged();
    };
    Peripheral.prototype.onPropChanged = function(){
        let emitProp = JSON.parse(JSON.stringify(this.prop));
        delete emitProp.rssi;
        delete emitProp.rssilv;
        delete emitProp.lastDiscoverDate;
        delete emitProp.status.control;
        delete emitProp.services;
        delete emitProp.characteristics;
        
        let emitchecksum = md5(JSON.stringify(emitProp));
        if(!this.lastEmitchecksum || this.lastEmitchecksum!=emitchecksum){
            this.lastEmitchecksum = emitchecksum;
            // console.log("lastEmitProp: ");
            // console.log(this.lastEmitProp);
            // console.log("emitProp: ");
            // console.log(JSON.stringify(emitProp))
            this.lastEmitProp = JSON.stringify(emitProp);
            emitter.emit('on_peripheral_changed', this.prop);
        }
        
        
		const self = this;
		
        if(
            isset(self.prop.default_connect) 
            && self.prop.default_connect==1 
            && !self.prop.connected 
            && !self.prop.connecting 
            && isset(self.prop.rssi) 
            && isset(self.prop.lastDiscoverDate)
            && !self.prop.disappear
            && self.prop.gateway 
            && self.prop.gateway.toLowerCase() == deviceInfo.getDeviceGateway().toLowerCase()
            && !self.default_connect_used
        ){
            setTimeout(function(){
                self.default_connect_used = true;
                Promise.race([
                    self.doConnect(),
        			self.timeout(10000).then(() => {
        				throw new Error(7001);
        			})
                ]);
            }, (Math.floor(Math.random() * (5000 - 500 + 1)) + 500));
        }
		
		clearTimeout(self.timer);
		self.timer = setTimeout(function(){
            if(isset(self.prop.gateway) && self.prop.gateway.toLowerCase() == deviceInfo.getDeviceGateway().toLowerCase()){
    			let message = {
    				Info: {
    					'Guid':deviceInfo.deviceId
    				},
    				Device:{}
    			}
    
        		for(let guid in peripheral){
        		    let p = peripheral[guid];
        		    if(!p.getProp().gateway || p.getProp().gateway.toLowerCase() != deviceInfo.getDeviceGateway().toLowerCase()){
        		        continue;
        		    }
        		    
        		    message.Device[guid] = {
        		        mac_address: p.getProp().mac_address,
    					manufacturing_data: p.getProp().manufactureData,
    					date: p.getProp().lastDiscoverDate,
        		    }
        		    if(p.getProp().connected){
        		        message.Device[guid]['rssi'] = p.getProp().rssi;
        		    }else{
        		        if(p.getProp().default_connect){
        		            message.Device[guid]['rssi'] = 0;
        		        }
        		    }
                }
    
    			if(Object.keys(message.Device).length > 0 && (!self.lastMqttChechsum || self.lastMqttChechsum != md5(JSON.stringify(message)))){
    			    self.lastMqttChechsum = md5(JSON.stringify(message));
    			    core_mqtt_publish("will/"+md5(md5(self.prop.gateway.toLowerCase())), 'Online', 0, true, false, true);
    				core_mqtt_publish("status/"+md5(md5(self.prop.gateway.toLowerCase())), JSON.stringify(message), 0, true, false, true);
    			}
            }
		}, 5000);
    };
    Peripheral.prototype.onCharNotified = function(char, data){
        // alert("onCharRead char="+char);
        // alert("onCharRead data="+data);
        const self = this;
        //alert(data)
        if(data.startsWith("80")){
            // io status    
            let io = parseInt(data.substring(2, 4), 16);
            for(let i=8; i>=0; i--){
                let key = i.toString();
                let value = "0";
                if(io >= Math.pow(2, i)){
                    value = "1";
                    io -= Math.pow(2, i);
                }
                //self.prop.gangs[i] = parseInt(value);
                self.prop.status.bluetooth[0][i] = parseInt(value);
            }
			
            self.prop.status.bluetooth[1] = DateFormatter.format((new Date(new Date().getTime() + 2000)), "Y-m-d H:i:s");
            self.onPropChanged();
        }else if(data.startsWith("94110000")){
			let thermostat = {
				power: parseInt(data.substring(10,12), 16),
				model: parseInt(data.substring(12,14), 16),
				fan: parseInt(data.substring(14, 16), 16),
				temp: parseInt(data.substring(16, 18), 16),
                room_temp: parseInt(data.substring(18,20), 16)
			}
			if(thermostat.power){
				console.log(thermostat);
				console.log(data)
			}
            self.prop.status.bluetooth[0][42] = thermostat.power;
			self.prop.status.bluetooth[0][43] = thermostat.model;
			self.prop.status.bluetooth[0][44] = thermostat.fan;
			self.prop.status.bluetooth[0][45] = thermostat.temp;
			self.prop.status.bluetooth[0][46] = thermostat.room_temp;
			
			self.prop.status.bluetooth[1] = DateFormatter.format((new Date(new Date().getTime() + 2000)), "Y-m-d H:i:s");
			self.onPropChanged();
        }
    };

    Peripheral.prototype.connect = function() {
        const self = this;
        self.queue = [];
        self.isExecuting = false;
        
    	return new Promise((resolve, reject) => {
    		const action = {
    		    func:'connect',
    		    args:[],
    		    callback: {
    		        resolve:resolve,
    		        reject:reject
    		    }
    		}
    		self.queue.push(action);
    		if (!self.isExecuting) {
    			self.isExecuting = true;
    			self.execute();
    		}
    	});
    };
    Peripheral.prototype._connect = function() {
        const self = this;
    	
    	return new Promise((resolve, reject) => {
    		Promise.race([
    			self.doConnect(),
    			self.timeout(10000).then(() => {
    			    self.disconnect();
    				throw 7001;
    			})
    		])
    		.then((result) => {
    			resolve(result);
    		})
    		.catch((error) => { 
    			reject(error);
    		})
    		.then(() => {
    			// Clean up resources
    			clearTimeout(self.timeout_timer);
    		});
    	});
    };
    Peripheral.prototype.disconnect = function() {
        const self = this;
        self.queue = [];
    	self.isExecuting = false;
        
    	return new Promise((resolve, reject) => {
    	    ble.disconnect(self.prop.id, (rs)=>{
    	        self.onConnectionChanged('disconnected');
    	        resolve();
    	    }, (error)=>{
    	        self.onConnectionChanged('disconnected');
    	        reject(6006); //BLE_PERIPHERAL_DISCONNECT_FAIL
    	    });
    	});
    };
    Peripheral.prototype.write = function(commands) {
        const self = this;
    	return new Promise((resolve, reject) => {
    		const action = {
    		    func:'write',
    		    args:[
    		        commands
    		    ],
    		    callback: {
    		        resolve:resolve,
    		        reject:reject
    		    }
    		}
    		self.queue.push(action);
    		if (!self.isExecuting) {
    			self.isExecuting = true;
    			self.execute();
    		}
    	});
    };
    Peripheral.prototype._write = function(commands) {
        const self = this;
        let currentRoute = '';
    	
    	const doWrite = (commands) => {
    		return new Promise((resolve, reject) => {
                self.doMultipleWrite(commands).then((rs)=>{
                    resolve();
                }).catch((error)=>{
                    reject(error);
                });
    		});
    	};
    	
    	return new Promise((resolve, reject) => {
    		Promise.race([
    			self.doConnect(),
    			self.timeout(10000).then(() => {
    			    self.disconnect();
    				throw 7001;
    			})
    		])
    		.then((result) => {
                return doWrite(commands);
    		})
    		.then((result) => {
    			resolve(result);
    		})
    		.catch((error) => {
    			reject(error);
    		})
    		.then(() => {
    			// Clean up resources
    			clearTimeout(self.timeout_timer);
    		});
    	});
    };
    Peripheral.prototype.onoff = function(gangs) {
        const self = this;
    	return new Promise((resolve, reject) => {
    		const action = {
    		    func:'onoff',
    		    args:[
    		        gangs
    		    ],
    		    callback: {
    		        resolve:resolve,
    		        reject:reject
    		    }
    		}
    		self.queue.push(action);
    		if (!self.isExecuting) {
    			self.isExecuting = true;
    			self.execute();
    		}
    	});
    };
    Peripheral.prototype._onoff = function(gangs) {
        const self = this;
        let currentRoute = '';

    	const doBLEOnoff = (gangs) => {
    		return new Promise((resolve, reject) => {
				let service = "ff80", characteristic = "ff81";
				let data = [0,0,0,0,0,0,0,0];
    			if(self.prop.firmwareNo < 6){
					data = JSON.parse(JSON.stringify(self.getLatestStatus()));
    			    for(let g of gangs){
						data[g.gang] = g.on ? 1 : 0;
    			    } 
					self.prop.status.control[0] = JSON.parse(JSON.stringify(data));
					
    			    data = parseInt(data.reverse().join(""), 2).toString(16).toUpperCase().pad("00");
					service = "fff0";
					characteristic = "fff2";
    			}else{
    			    for(let g of gangs){
    			        if(g.gang<1 || g.gang>4) continue;
    			        data[(4-g.gang)] = 1;
    			        if(g.on){
        			        data[(8-g.gang)] = 1;
    						self.prop.status.control[0][g.gang] = 1;
						}else{
							self.prop.status.control[0][g.gang] = 0;
						}
    			    }
    			    data = parseInt(data.join(""), 2).toString(16).toUpperCase().pad("00");
					data = `8000${data}00`;
    		}
				self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s");
				
                self.doMultipleWrite([{
					service: service,
					characteristic: characteristic,
					data: data,
				}]).then((rs)=>{
                    resolve();
                }).catch((error)=>{
                    reject(error);
                });
    		});
    	};

		const doMESHOnoff = (gangs) => {
    		return new Promise((resolve, reject) => {
				const findGuid = self.findLead();

				let data = [0,0,0,0,0,0,0,0];
				if(self.prop.firmwareNo < 6){
					data = JSON.parse(JSON.stringify(self.getLatestStatus()));
					for(let g of gangs){
						data[g.gang] = g.on ? 1 : 0;
					}
					self.prop.status.control[0] = JSON.parse(JSON.stringify(data));
					
					data = parseInt(data.reverse().join(""), 2).toString(16).toUpperCase().pad("00");
					data = `ff${self.prop.mac_reverse_key}${data}`;
				}else{
					for(let g of gangs){
						if(g.gang<1 || g.gang>4) continue;
						data[(4-g.gang)] = 1;
    			        if(g.on){
    			            data[(8-g.gang)] = 1;
							self.prop.status.control[0][g.gang] = 1;
						}else{
							self.prop.status.control[0][g.gang] = 0;
						}
					}
					
					data = parseInt(data.join(""), 2).toString(16).toUpperCase().pad("00");
					data = `02${self.prop.mac_reverse_key}8000${data}00`;
				}
				self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s");
				
				peripheral[findGuid].write([{
					service: "ff80",
					characteristic: peripheral[findGuid].getProp().firmwareNo < 6 ? "ff83" : "ff81",
					data: data,
				}]).then((rs)=>{
					resolve();
				}).catch((error)=>{
					reject(error);
				});
			});
		};


		const doMOBMOBOnoff = (gangs) => {
    		return new Promise((resolve, reject) => {
				let findGuid = self.findDefaultConnect();
				if(!isset(findGuid)){
					findGuid = self.prop.guid;
				}
				let data = [0,0,0,0,0,0,0,0];
				let service = "ff80", characteristic = "ff81";
				if(self.prop.firmwareNo < 6){
				// 	data = JSON.parse(JSON.stringify(self.prop.gangs));
					data = JSON.parse(JSON.stringify(self.getLatestStatus()));
					for(let g of gangs){
						data[g.gang] = g.on ? 1 : 0;
					} 
					self.prop.status.control[0] = JSON.parse(JSON.stringify(data));
					
					data = parseInt(data.reverse().join(""), 2).toString(16).toUpperCase().pad("00");
					if(findGuid != self.prop.guid){
						data = `ff${self.prop.mac_reverse_key}${data}`;
						characteristic = "ff83";
					}else{
						service = "fff0";
						characteristic = "fff2";
					}
				}else{
					for(let g of gangs){
						if(g.gang<1 || g.gang>4) continue;
						data[(4-g.gang)] = 1;
    			        if(g.on){
    			            data[(8-g.gang)] = 1;
							self.prop.status.control[0][g.gang] = 1;
						}else{
							self.prop.status.control[0][g.gang] = 0;
						}
					}
					data = parseInt(data.join(""), 2).toString(16).toUpperCase().pad("00");
					if(findGuid != self.prop.guid){
						data = `02${self.prop.mac_reverse_key}8000${data}00`;
						characteristic = "ff81";
					}else{
						data = `8000${data}00`;
						characteristic = "ff81";
					}
				}
				self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s");

				core_mqtt_publish("cmd/"+md5(md5(self.prop.gateway.toLowerCase())), {
					command:"Control",
					function:"bleHelper.perform",
					params:[{
						action: "write",
						guid: findGuid,
						mac_address: peripheral[findGuid].getProp().mac_address.toLowerCase(),
						service_id: service,
						char_id: characteristic,
						value: data.toLowerCase()
					}],
					callback:"",
					raw:""
				}, 0, false, false, false).then(() => {
					resolve();
				}).catch(reject);
			});
		};
    	
    
    	return new Promise((resolve, reject) => {
    		Promise.race([
    			self.findRoute(),
    			self.timeout(10000).then(() => {
    			    self.disconnect();
    				throw 7001;
    			})
    		])
    		.then((result) => {
    		    currentRoute = result;
                switch (currentRoute) {
                	case self.route.BLUETOOTH:
                	    if(self.prop.connected){
                	        return Promise.resolve();
                	    }else{
                	        return self.doConnect();
                	    }
                	    break;
                	case self.route.MOBMOB:
                	    return Promise.resolve();
                	    break;
                	case self.route.MESH:
                	    return Promise.resolve();
                	    break;
                	case self.route.NA:
    				    throw new Error('Device is not here');
                	    break;
                }
    		})
    		.then(() => {
                switch (currentRoute) {
                	case self.route.BLUETOOTH:
						return doBLEOnoff(gangs);
                	    break;
                	case self.route.MOBMOB:
						return doMOBMOBOnoff(gangs);
                	    break;
                	case self.route.MESH:
						return doMESHOnoff(gangs);
                	    break;
                	case self.route.NA:
    				    throw new Error('Device is not here');
                	    break;
                }
    		})
    		.then((result) => {
    			resolve(result);
    		})
    		.catch((error) => {
    			reject(error);
    		})
    		.then(() => {
    			// Clean up resources
    			clearTimeout(self.timeout_timer);
    		});
    	});
    };
    Peripheral.prototype.rcuOnoff = function(gangs) {
        const self = this;
    	return new Promise((resolve, reject) => {
    		const action = {
    		    func:'rcuOnoff',
    		    args:[
    		        gangs
    		    ],
    		    callback: {
    		        resolve:resolve,
    		        reject:reject
    		    }
    		}
    		self.queue.push(action);
    		if (!self.isExecuting) {
    			self.isExecuting = true;
    			self.execute();
    		}
    	});
    };
    Peripheral.prototype._rcuOnoff = function(gangs) {
        const self = this;
        let currentRoute = '';

    	const doBLE = (gangs) => {
    		return new Promise((resolve, reject) => {
				let service = "ff80", characteristic = "ff81";
				let data = [0,0,0,0,0,0,0,0];
				let controls = {};
				let commands = [];
				
			    for(let g of gangs){
			        if(g.gang<12 || g.gang>31) continue;
			        
			        let targetSlot = Math.ceil((g.gang-11) / 4);
			        if(!isset(controls[targetSlot])){
			            controls[targetSlot] = {
			                slot: targetSlot,
			                data: [0,0,0,0,0,0,0,0]
			            }
			        }
			        data = JSON.parse(JSON.stringify(controls[targetSlot].data));
			        
			        data[(4-((g.gang%4)+1))] = 1;
			        if(g.on){
    			        data[(8-((g.gang%4)+1))] = 1;
						self.prop.status.control[0][g.gang] = 1;
					}else{
						self.prop.status.control[0][g.gang] = 0;
					}
					controls[targetSlot].data = data;
			    }
			    
			    for(let slot in controls){
    			    data = parseInt(controls[slot].data.join(""), 2).toString(16).toUpperCase().pad("00");
    				data = `02${self.prop.mac_reverse_key}971f${slot.pad("00")}8000${data}00`;
    				commands.push({
    					service: service,
    					characteristic: characteristic,
    					data: data,
    				});
			    }
					
				self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s");
				
                self.doMultipleWrite(commands).then((rs)=>{
                    resolve();
                }).catch((error)=>{
                    reject(error);
                });
    		});
    	};

		const doMESH = (gangs) => {
    		return new Promise((resolve, reject) => {
				const findGuid = self.findLead();

				let service = "ff80", characteristic = "ff81";
				let data = [0,0,0,0,0,0,0,0];
				let controls = {};
				let commands = [];
				
			    for(let g of gangs){
			        if(g.gang<12 || g.gang>31) continue;
			        
			        let targetSlot = Math.ceil((g.gang-11) / 4);
			        if(!isset(controls[targetSlot])){
			            controls[targetSlot] = {
			                slot: targetSlot,
			                data: [0,0,0,0,0,0,0,0]
			            }
			        }
			        data = JSON.parse(JSON.stringify(controls[targetSlot].data));
			        
			        data[(4-((g.gang%4)+1))] = 1;
			        if(g.on){
    			        data[(8-((g.gang%4)+1))] = 1;
						self.prop.status.control[0][g.gang] = 1;
					}else{
						self.prop.status.control[0][g.gang] = 0;
					}
					controls[targetSlot].data = data;
			    }
			    
			    for(let slot in controls){
    			    data = parseInt(controls[slot].data.join(""), 2).toString(16).toUpperCase().pad("00");
    				data = `02${self.prop.mac_reverse_key}971f${slot.pad("00")}8000${data}00`;
    				commands.push({
    					service: service,
    					characteristic: characteristic,
    					data: data,
    				});
			    }
					
				self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s");
				
				peripheral[findGuid].write(commands).then((rs)=>{
					resolve();
				}).catch((error)=>{
					reject(error);
				});
			});
		};


		const doMOBMOB = (gangs) => {
    		return new Promise((resolve, reject) => {
				let findGuid = self.findDefaultConnect();
				if(!isset(findGuid)){
					findGuid = self.prop.guid;
				}
				let service = "ff80", characteristic = "ff81";
				let data = [0,0,0,0,0,0,0,0];
				let controls = {};
				let commands = [];
				
			    for(let g of gangs){
			        if(g.gang<12 || g.gang>31) continue;
			        
			        let targetSlot = Math.ceil((g.gang-11) / 4);
			        if(!isset(controls[targetSlot])){
			            controls[targetSlot] = {
			                slot: targetSlot,
			                data: [0,0,0,0,0,0,0,0]
			            }
			        }
			        data = JSON.parse(JSON.stringify(controls[targetSlot].data));
			        
			        data[(4-((g.gang%4)+1))] = 1;
			        if(g.on){
    			        data[(8-((g.gang%4)+1))] = 1;
						self.prop.status.control[0][g.gang] = 1;
					}else{
						self.prop.status.control[0][g.gang] = 0;
					}
					controls[targetSlot].data = data;
			    }
			    
			    for(let slot in controls){
    			    data = parseInt(controls[slot].data.join(""), 2).toString(16).toUpperCase().pad("00");
    				data = `02${self.prop.mac_reverse_key}971f${slot.pad("00")}8000${data}00`;
    				commands.push({
						action: "write",
						guid: findGuid,
						mac_address: peripheral[findGuid].getProp().mac_address.toLowerCase(),
						service_id: service,
						char_id: characteristic,
						value: data.toLowerCase()
					});
			    }
					
				self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s");

				core_mqtt_publish("cmd/"+md5(md5(self.prop.gateway.toLowerCase())), {
					command:"Control",
					function:"bleHelper.perform",
					params:commands,
					callback:"",
					raw:""
				}, 0, false, false, false).then(() => {
					resolve();
				}).catch(reject);
			});
		};
    	
    
    	return new Promise((resolve, reject) => {
    		Promise.race([
    			self.findRoute(),
    			self.timeout(10000).then(() => {
    			    self.disconnect();
    				throw 7001;
    			})
    		])
    		.then((result) => {
    		    currentRoute = result;
                switch (currentRoute) {
                	case self.route.BLUETOOTH:
                	    if(self.prop.connected){
                	        return Promise.resolve();
                	    }else{
                	        return self.doConnect();
                	    }
                	    break;
                	case self.route.MOBMOB:
                	    return Promise.resolve();
                	    break;
                	case self.route.MESH:
                	    return Promise.resolve();
                	    break;
                	case self.route.NA:
    				    throw new Error('Device is not here');
                	    break;
                }
    		})
    		.then(() => {
                switch (currentRoute) {
                	case self.route.BLUETOOTH:
						return doBLE(gangs);
                	    break;
                	case self.route.MOBMOB:
						return doMOBMOB(gangs);
                	    break;
                	case self.route.MESH:
						return doMESH(gangs);
                	    break;
                	case self.route.NA:
    				    throw new Error('Device is not here');
                	    break;
                }
    		})
    		.then((result) => {
    			resolve(result);
    		})
    		.catch((error) => {
    			reject(error);
    		})
    		.then(() => {
    			// Clean up resources
    			clearTimeout(self.timeout_timer);
    		});
    	});
    };
		Peripheral.prototype.rcuOutput = function(gangs) {
			const self = this;
		return new Promise((resolve, reject) => {
			const action = {
					func:'rcuOutput',
					args:[
							gangs
					],
					callback: {
							resolve:resolve,
							reject:reject
					}
			}
			self.queue.push(action);
			if (!self.isExecuting) {
				self.isExecuting = true;
				self.execute();
			}
		});
	};
	Peripheral.prototype._rcuOutput = function(gangs) {
		const self = this;
		let currentRoute = '';

	const doBLE = (gangs) => {
		return new Promise((resolve, reject) => {
		let service = "ff80", characteristic = "ff81";
		let commands = [];
		
			for(let g of gangs){
					if(g.gang<49 || g.gang>85) continue;
					
					self.prop.status.control[0][g.gang] = g.value;
					data = `02${self.prop.mac_reverse_key.toLowerCase()}972101${(g.gang-49).toString(16).pad("00")}0${g.value}`;
				commands.push({
					service: service,
					characteristic: characteristic,
					data: data,
				});
			}
			
		self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s");
		
						self.doMultipleWrite(commands).then((rs)=>{
								resolve();
						}).catch((error)=>{
								reject(error);
						});
		});
	};

const doMESH = (gangs) => {
		return new Promise((resolve, reject) => {
		const findGuid = self.findLead();

		let service = "ff80", characteristic = "ff81";
		let commands = [];
		
			for(let g of gangs){
				if(g.gang<49 || g.gang>85) continue;
					
				self.prop.status.control[0][g.gang] = g.value;
				data = `02${self.prop.mac_reverse_key.toLowerCase()}972101${(g.gang-49).toString(16).pad("00")}0${g.value}`;
				commands.push({
					service: service,
					characteristic: characteristic,
					data: data,
				});
			}
			
		self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s");
		
		peripheral[findGuid].write(commands).then((rs)=>{
			resolve();
		}).catch((error)=>{
			reject(error);
		});
	});
};


const doMOBMOB = (gangs) => {
		return new Promise((resolve, reject) => {
		let findGuid = self.findDefaultConnect();
		if(!isset(findGuid)){
			findGuid = self.prop.guid;
		}
		let service = "ff80", characteristic = "ff81";
		let commands = [];
		
			for(let g of gangs){
				if(g.gang<49 || g.gang>85) continue;
					
				self.prop.status.control[0][g.gang] = g.value;
				data = `02${self.prop.mac_reverse_key.toLowerCase()}972101${(g.gang-49).toString(16).pad("00")}0${g.value}`;
				commands.push({
				action: "write",
				guid: findGuid,
				mac_address: peripheral[findGuid].getProp().mac_address.toLowerCase(),
				service_id: service,
				char_id: characteristic,
				value: data.toLowerCase()
			});
			}
			
		self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s");

		core_mqtt_publish("cmd/"+md5(md5(self.prop.gateway.toLowerCase())), {
			command:"Control",
			function:"bleHelper.perform",
			params:commands,
			callback:"",
			raw:""
		}, 0, false, false, false).then(() => {
			resolve();
		}).catch(reject);
	});
};
	

	return new Promise((resolve, reject) => {
		Promise.race([
			self.findRoute(),
			self.timeout(10000).then(() => {
					self.disconnect();
				throw 7001;
			})
		])
		.then((result) => {
				currentRoute = result;
						switch (currentRoute) {
							case self.route.BLUETOOTH:
									if(self.prop.connected){
											return Promise.resolve();
									}else{
											return self.doConnect();
									}
									break;
							case self.route.MOBMOB:
									return Promise.resolve();
									break;
							case self.route.MESH:
									return Promise.resolve();
									break;
							case self.route.NA:
						throw new Error('Device is not here');
									break;
						}
		})
		.then(() => {
						switch (currentRoute) {
							case self.route.BLUETOOTH:
				return doBLE(gangs);
									break;
							case self.route.MOBMOB:
				return doMOBMOB(gangs);
									break;
							case self.route.MESH:
				return doMESH(gangs);
									break;
							case self.route.NA:
						throw new Error('Device is not here');
									break;
						}
		})
		.then((result) => {
			resolve(result);
		})
		.catch((error) => {
			reject(error);
		})
		.then(() => {
			// Clean up resources
			clearTimeout(self.timeout_timer);
		});
	});
};
	Peripheral.prototype.dimming = function(gangs) {
		const self = this;
		return new Promise((resolve, reject) => {
			const action = {
					func:'dimming',
					args:[
							gangs
					],
					callback: {
							resolve:resolve,
							reject:reject
					}
			}
			self.queue.push(action);
			if (!self.isExecuting) {
				self.isExecuting = true;
				self.execute();
			}
		});
	};
	Peripheral.prototype._dimming = function(gangs) {
		const self = this;
		let currentRoute = '';
		const doBLEDimming = (gangs) => {
			return new Promise((resolve, reject) => {
    			let service = "ff80", characteristic = "ff81";
    			let data = `00`;
    			
    			for(let g of gangs){
    				if(g.gang!=8) continue;
    				data = g.value.toString(16).toUpperCase().pad("00");
    				self.prop.status.control[0][g.gang] = g.value;
    			}
    			if(self.prop.firmwareNo < 6){
    			    data = `${data}000000`;
    			    service = "ffb0";
    			    characteristic = "ffb2";
    			}else{
    			    data = `8900${data}`;
    			}
    			
    			self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s");
    			
    			self.doMultipleWrite([{
    				service: service,
    				characteristic: characteristic,
    				data: data,
    			}]).then((rs)=>{
    				resolve();
    			}).catch((error)=>{
    				reject(error);
    			});
			});
		};
		
		const doMOBMOBDimming = (gangs) => {
			return new Promise((resolve, reject) => {
				let findGuid = self.findDefaultConnect();
				if(!isset(findGuid)){
					findGuid = self.prop.guid;
				}
				let service = "ff80", characteristic = "ff81";
				let data = `00`;
				
				for(let g of gangs){
    				if(g.gang!=8) continue;
    				data = g.value.toString(16).toUpperCase().pad("00");
    				self.prop.status.control[0][g.gang] = g.value;
				}
				
    			if(self.prop.firmwareNo < 6){
    			    data = `${data}000000`;
    			    service = "ffb0";
    			    characteristic = "ffb2";
    			    
    				if(findGuid != self.prop.guid){
    					data = `02${self.prop.mac_reverse_key}61${data}`;
        			    service = "ff80";
        			    characteristic = "ff83";
    				}
    			}else{
    				data = `8900${data}`;
    				if(findGuid != self.prop.guid){
    					data = `02${self.prop.mac_reverse_key}${data}`;
    				}
    			}
				
				self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s");
				
				core_mqtt_publish("cmd/"+md5(md5(self.prop.gateway.toLowerCase())), {
					command:"Control",
					function:"bleHelper.perform",
					params:[{
						action: "write",
						guid: findGuid,
						mac_address: peripheral[findGuid].getProp().mac_address.toLowerCase(),
						service_id: service,
						char_id: characteristic,
						value: data.toLowerCase()
					}],
					callback:"",
					raw:""
				}, 0, false, false, false).then(() => {
					resolve();
				}).catch(reject);
			});
		};

		const doMESHDimming = (gangs) => {
			return new Promise((resolve, reject) => {
				const findGuid = self.findLead();
				
				let service = "ff80", characteristic = "ff81";
				let data = `00`;
				
				for(let g of gangs){
    				if(g.gang!=8) continue;
    				data = g.value.toString(16).toUpperCase().pad("00");
    				self.prop.status.control[0][g.gang] = g.value;
				}
				
    			if(self.prop.firmwareNo < 6){
    			    data = `${data}000000`;
    			    data = `02${self.prop.mac_reverse_key}61${data}`;
    			}else{
    				data = `8900${data}`;
    				data = `02${self.prop.mac_reverse_key}${data}`;
    			}
				
				self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s");
				
				peripheral[findGuid].write([{
					service: "ff80",
					characteristic: peripheral[findGuid].getProp().firmwareNo < 6 ? "ff83" : "ff81",
					data: data,
				}]).then((rs)=>{
					resolve();
				}).catch((error)=>{
					reject(error);
				});
			});
		};

		

		return new Promise((resolve, reject) => {
			Promise.race([
				self.findRoute(),
				self.timeout(10000).then(() => {
						self.disconnect();
					throw 7001;
				})
			])
			.then((result) => {
					currentRoute = result;
							switch (currentRoute) {
								case self.route.BLUETOOTH:
										if(self.prop.connected){
												return Promise.resolve();
										}else{
												return self.doConnect();
										}
										break;
								case self.route.MOBMOB:
										return Promise.resolve();
										break;
								case self.route.MESH:
										return Promise.resolve();
										break;
								case self.route.NA:
							throw new Error('Device is not here');
										break;
							}
			})
			.then(() => {
							switch (currentRoute) {
								case self.route.BLUETOOTH:
					return doBLEDimming(gangs);
										break;
								case self.route.MOBMOB:
					return doMOBMOBDimming(gangs);
										break;
								case self.route.MESH:
					return doMESHDimming(gangs);
										break;
								case self.route.NA:
							throw new Error('Device is not here');
										break;
							}
			})
			.then((result) => {
				resolve(result);
			})
			.catch((error) => {
				reject(error);
			})
			.then(() => {
				// Clean up resources
				clearTimeout(self.timeout_timer);
			});
		});
	};
    Peripheral.prototype.rcuDimming = function(gangs) {
        const self = this;
    	return new Promise((resolve, reject) => {
    		const action = {
    		    func:'rcuDimming',
    		    args:[
    		        gangs
    		    ],
    		    callback: {
    		        resolve:resolve,
    		        reject:reject
    		    }
    		}
    		self.queue.push(action);
    		if (!self.isExecuting) {
    			self.isExecuting = true;
    			self.execute();
    		}
    	});
    };
    Peripheral.prototype._rcuDimming = function(gangs) {
        const self = this;
        let currentRoute = '';

    	const doBLE = (gangs) => {
    		return new Promise((resolve, reject) => {
				let service = "ff80", characteristic = "ff81";
				let commands = [];
				
			    for(let g of gangs){
			        if(g.gang<32 || g.gang>41) continue;
			        
			        let targetSlot = Math.ceil((g.gang-31) / 2);
			        targetSlot = targetSlot.toString();
			        
			        self.prop.status.control[0][g.gang] = g.value;
    			    data = g.value.toString(16).toUpperCase().pad("00");
    				data = `02${self.prop.mac_reverse_key}971f${targetSlot.pad("00")}892${(g.gang%2)}${data}`;
    				commands.push({
    					service: service,
    					characteristic: characteristic,
    					data: data,
    				});
			    }
			    
				self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s");
				
                self.doMultipleWrite(commands).then((rs)=>{
                    resolve();
                }).catch((error)=>{
                    reject(error);
                });
    		});
    	};

		const doMESH = (gangs) => {
    		return new Promise((resolve, reject) => {
				const findGuid = self.findLead();

				let service = "ff80", characteristic = "ff81";
				let commands = [];
				
			    for(let g of gangs){
			        if(g.gang<32 || g.gang>41) continue;
			        
			        let targetSlot = Math.ceil((g.gang-31) / 2);
			        targetSlot = targetSlot.toString();
			        
			        self.prop.status.control[0][g.gang] = g.value;
    			    data = g.value.toString(16).toUpperCase().pad("00");
    				data = `02${self.prop.mac_reverse_key}971f${targetSlot.pad("00")}892${(g.gang%2)}${data}`;
    				commands.push({
    					service: service,
    					characteristic: characteristic,
    					data: data,
    				});
			    }
					
				self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s");
				
				peripheral[findGuid].write(commands).then((rs)=>{
					resolve();
				}).catch((error)=>{
					reject(error);
				});
			});
		};


		const doMOBMOB = (gangs) => {
    		return new Promise((resolve, reject) => {
				let findGuid = self.findDefaultConnect();
				if(!isset(findGuid)){
					findGuid = self.prop.guid;
				}
				let service = "ff80", characteristic = "ff81";
				let commands = [];
				
			    for(let g of gangs){
			        if(g.gang<32 || g.gang>41) continue;
			        
			        let targetSlot = Math.ceil((g.gang-31) / 2);
			        targetSlot = targetSlot.toString();
			        
			        self.prop.status.control[0][g.gang] = g.value;
    			    data = g.value.toString(16).toUpperCase().pad("00");
    				data = `02${self.prop.mac_reverse_key}971f${targetSlot.pad("00")}892${(g.gang%2)}${data}`;
    				commands.push({
						action: "write",
						guid: findGuid,
						mac_address: peripheral[findGuid].getProp().mac_address.toLowerCase(),
						service_id: service,
						char_id: characteristic,
						value: data.toLowerCase()
					});
			    }
					
				self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s");

				core_mqtt_publish("cmd/"+md5(md5(self.prop.gateway.toLowerCase())), {
					command:"Control",
					function:"bleHelper.perform",
					params:commands,
					callback:"",
					raw:""
				}, 0, false, false, false).then(() => {
					resolve();
				}).catch(reject);
			});
		};
    	
    
    	return new Promise((resolve, reject) => {
    		Promise.race([
    			self.findRoute(),
    			self.timeout(10000).then(() => {
    			    self.disconnect();
    				throw 7001;
    			})
    		])
    		.then((result) => {
    		    currentRoute = result;
                switch (currentRoute) {
                	case self.route.BLUETOOTH:
                	    if(self.prop.connected){
                	        return Promise.resolve();
                	    }else{
                	        return self.doConnect();
                	    }
                	    break;
                	case self.route.MOBMOB:
                	    return Promise.resolve();
                	    break;
                	case self.route.MESH:
                	    return Promise.resolve();
                	    break;
                	case self.route.NA:
    				    throw new Error('Device is not here');
                	    break;
                }
    		})
    		.then(() => {
                switch (currentRoute) {
                	case self.route.BLUETOOTH:
						return doBLE(gangs);
                	    break;
                	case self.route.MOBMOB:
						return doMOBMOB(gangs);
                	    break;
                	case self.route.MESH:
						return doMESH(gangs);
                	    break;
                	case self.route.NA:
    				    throw new Error('Device is not here');
                	    break;
                }
    		})
    		.then((result) => {
    			resolve(result);
    		})
    		.catch((error) => {
    			reject(error);
    		})
    		.then(() => {
    			// Clean up resources
    			clearTimeout(self.timeout_timer);
    		});
    	});
    };
		Peripheral.prototype.thermostat = function(gangs) {
			const self = this;
		return new Promise((resolve, reject) => {
			const action = {
					func:'thermostat',
					args:[
							gangs
					],
					callback: {
							resolve:resolve,
							reject:reject
					}
			}
			self.queue.push(action);
			if (!self.isExecuting) {
				self.isExecuting = true;
				self.execute();
			}
		});
	};
	Peripheral.prototype._thermostat = function(gangs) {
			const self = this;
			let currentRoute = '';

		const doBLE = (gangs) => {
			return new Promise((resolve, reject) => {
			let service = "ff80", characteristic = "ff81";
			let commands = [];
			
				for(let g of gangs){
						if(g.gang<41 || g.gang>47) continue;
						
						self.prop.status.control[0][g.gang] = g.value;
						data = g.command;
					commands.push({
						service: service,
						characteristic: characteristic,
						data: data,
					});
				}
				
			self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s");
			
							self.doMultipleWrite(commands).then((rs)=>{
									resolve();
							}).catch((error)=>{
									reject(error);
							});
			});
		};

	const doMESH = (gangs) => {
			return new Promise((resolve, reject) => {
			const findGuid = self.findLead();

			let service = "ff80", characteristic = "ff81";
			let commands = [];
			
				for(let g of gangs){
					if(g.gang<41 || g.gang>47) continue;
						
					self.prop.status.control[0][g.gang] = g.value;
					data = `02${self.prop.mac_reverse_key}${g.command}`;
					commands.push({
						service: service,
						characteristic: characteristic,
						data: data,
					});
				}
				
			self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s");
			
			peripheral[findGuid].write(commands).then((rs)=>{
				resolve();
			}).catch((error)=>{
				reject(error);
			});
		});
	};


	const doMOBMOB = (gangs) => {
			return new Promise((resolve, reject) => {
			let findGuid = self.findDefaultConnect();
			if(!isset(findGuid)){
				findGuid = self.prop.guid;
			}
			let service = "ff80", characteristic = "ff81";
			let commands = [];
			
				for(let g of gangs){
					if(g.gang<41 || g.gang>47) continue;
						
					self.prop.status.control[0][g.gang] = g.value;
					data = `02${self.prop.mac_reverse_key}${g.command}`;
					commands.push({
					action: "write",
					guid: findGuid,
					mac_address: peripheral[findGuid].getProp().mac_address.toLowerCase(),
					service_id: service,
					char_id: characteristic,
					value: data.toLowerCase()
				});
				}
				
			self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s");

			core_mqtt_publish("cmd/"+md5(md5(self.prop.gateway.toLowerCase())), {
				command:"Control",
				function:"bleHelper.perform",
				params:commands,
				callback:"",
				raw:""
			}, 0, false, false, false).then(() => {
				resolve();
			}).catch(reject);
		});
	};
		
	
		return new Promise((resolve, reject) => {
			Promise.race([
				self.findRoute(),
				self.timeout(10000).then(() => {
						self.disconnect();
					throw 7001;
				})
			])
			.then((result) => {
					currentRoute = result;
							switch (currentRoute) {
								case self.route.BLUETOOTH:
										if(self.prop.connected){
												return Promise.resolve();
										}else{
												return self.doConnect();
										}
										break;
								case self.route.MOBMOB:
										return Promise.resolve();
										break;
								case self.route.MESH:
										return Promise.resolve();
										break;
								case self.route.NA:
							throw new Error('Device is not here');
										break;
							}
			})
			.then(() => {
							switch (currentRoute) {
								case self.route.BLUETOOTH:
					return doBLE(gangs);
										break;
								case self.route.MOBMOB:
					return doMOBMOB(gangs);
										break;
								case self.route.MESH:
					return doMESH(gangs);
										break;
								case self.route.NA:
							throw new Error('Device is not here');
										break;
							}
			})
			.then((result) => {
				resolve(result);
			})
			.catch((error) => {
				reject(error);
			})
			.then(() => {
				// Clean up resources
				clearTimeout(self.timeout_timer);
			});
		});
	};
	Peripheral.prototype.curtainmotor = function(gangs) {
		const self = this;
		return new Promise((resolve, reject) => {
			const action = {
					func:'curtainmotor',
					args:[
							gangs
					],
					callback: {
							resolve:resolve,
							reject:reject
					}
			}
			self.queue.push(action);
			if (!self.isExecuting) {
				self.isExecuting = true;
				self.execute();
			}
		});
	};
	Peripheral.prototype._curtainmotor = function(gangs) {
			const self = this;
			let currentRoute = '';

		const doBLE = (gangs) => {
			return new Promise((resolve, reject) => {
			let service = "ff80", characteristic = "ff81";
			let commands = [];
			
				for(let g of gangs){
						if(g.gang<47) continue;
						
						self.prop.status.control[0][g.gang] = g.value;
						data = g.command;
					commands.push({
						service: service,
						characteristic: characteristic,
						data: data,
					});
				}
				
			self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s");
			
							self.doMultipleWrite(commands).then((rs)=>{
									resolve();
							}).catch((error)=>{
									reject(error);
							});
			});
		};

	const doMESH = (gangs) => {
			return new Promise((resolve, reject) => {
			const findGuid = self.findLead();

			let service = "ff80", characteristic = "ff81";
			let commands = [];
			
				for(let g of gangs){
					if(g.gang<47) continue;
						
					self.prop.status.control[0][g.gang] = g.value;
					data = `02${self.prop.mac_reverse_key}${g.command}`;
					commands.push({
						service: service,
						characteristic: characteristic,
						data: data,
					});
				}
				
			self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s");
			
			peripheral[findGuid].write(commands).then((rs)=>{
				resolve();
			}).catch((error)=>{
				reject(error);
			});
		});
	};


	const doMOBMOB = (gangs) => {
			return new Promise((resolve, reject) => {
			let findGuid = self.findDefaultConnect();
			if(!isset(findGuid)){
				findGuid = self.prop.guid;
			}
			let service = "ff80", characteristic = "ff81";
			let commands = [];
			
				for(let g of gangs){
					if(g.gang<47) continue;
						
					self.prop.status.control[0][g.gang] = g.value;
					data = `02${self.prop.mac_reverse_key}${g.command}`;
					commands.push({
					action: "write",
					guid: findGuid,
					mac_address: peripheral[findGuid].getProp().mac_address.toLowerCase(),
					service_id: service,
					char_id: characteristic,
					value: data.toLowerCase()
				});
				}
				
			self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s");

			core_mqtt_publish("cmd/"+md5(md5(self.prop.gateway.toLowerCase())), {
				command:"Control",
				function:"bleHelper.perform",
				params:commands,
				callback:"",
				raw:""
			}, 0, false, false, false).then(() => {
				resolve();
			}).catch(reject);
		});
	};
		

		return new Promise((resolve, reject) => {
			Promise.race([
				self.findRoute(),
				self.timeout(10000).then(() => {
						self.disconnect();
					throw 7001;
				})
			])
			.then((result) => {
					currentRoute = result;
							switch (currentRoute) {
								case self.route.BLUETOOTH:
										if(self.prop.connected){
												return Promise.resolve();
										}else{
												return self.doConnect();
										}
										break;
								case self.route.MOBMOB:
										return Promise.resolve();
										break;
								case self.route.MESH:
										return Promise.resolve();
										break;
								case self.route.NA:
							throw new Error('Device is not here');
										break;
							}
			})
			.then(() => {
							switch (currentRoute) {
								case self.route.BLUETOOTH:
					return doBLE(gangs);
										break;
								case self.route.MOBMOB:
					return doMOBMOB(gangs);
										break;
								case self.route.MESH:
					return doMESH(gangs);
										break;
								case self.route.NA:
							throw new Error('Device is not here');
										break;
							}
			})
			.then((result) => {
				resolve(result);
			})
			.catch((error) => {
				reject(error);
			})
			.then(() => {
				// Clean up resources
				clearTimeout(self.timeout_timer);
			});
		});
	};
    Peripheral.prototype.sendIR = function(data) {
        const self = this;
    	return new Promise((resolve, reject) => {
    		const action = {
    		    func:'sendIR',
    		    args:[
    		        data
    		    ],
    		    callback: {
    		        resolve:resolve,
    		        reject:reject
    		    }
    		}
    		self.queue.push(action);
    		if (!self.isExecuting) {
    			self.isExecuting = true;
    			self.execute();
    		}
    	});
    };
    Peripheral.prototype._sendIR = function(data) {
        const self = this;
    	
    	const doBLESendIR = (data) => {
    		return new Promise((resolve, reject) => {
    			const commands = [];
    			if(self.prop.firmwareNo < 6){
    			    const dateSetLen = 38;
                    const count_batch = Math.ceil(data.length / dateSetLen);
                    let len = 0;
                    for (let i = 0; i < count_batch; i++) {
                    	len = i * dateSetLen + dateSetLen > data.length ? data.length - i * dateSetLen : dateSetLen;
                    
                    	const command = {
                    	    service: "ff70",
                    		characteristic: "ff71",
                    		data: `${(count_batch - 1 - i).toString(16).pad("00")}${data.substring(i * dateSetLen, i * dateSetLen + len)}`,
                    	};
                    	commands.push(command);
                    }
    			}else{
    			    const dateSetLen = 36;
                    const count_batch = Math.ceil(data.length / dateSetLen);
                    let len = 0;
                    for (let i = 0; i < count_batch; i++) {
                    	len = i * dateSetLen + dateSetLen > data.length ? data.length - i * dateSetLen : dateSetLen;
                    
                    	const command = {
                    	    service: "ff80",
                    		characteristic: "ff81",
                    		data: `87${(count_batch - 1 - i).toString(16).pad("00")}${data.substring(i * dateSetLen, i * dateSetLen + len)}`,
                    	};
                    	commands.push(command);
                    }
    			}
                self.doMultipleWrite(commands).then((rs)=>{
                    resolve();
                }).catch((error)=>{
                    reject(error);
                });
    		});
    	};


		const doMESHSendIR = (data) => {
    		return new Promise((resolve, reject) => {
				const findGuid = self.findLead();

    			const commands = [];
				const dateSetLen = 22;
				const count_batch = Math.ceil(data.length / dateSetLen);
				let len = 0;
				for (let i = 0; i < count_batch; i++) {
					len = i * dateSetLen + dateSetLen > data.length ? data.length - i * dateSetLen : dateSetLen;
				
					const command = {
						service: "ff80",
						characteristic: peripheral[findGuid].getProp().firmwareNo < 6 ? "ff83" : "ff81",
						data: `02${self.prop.mac_reverse_key}10${(count_batch - 1 - i).toString(16).pad("00")}${data.substring(i * dateSetLen, i * dateSetLen + len)}`,
					};
					commands.push(command);
				}

				peripheral[findGuid].write(commands).then((rs)=>{
					resolve();
				}).catch((error)=>{
					reject(error);
				});
			});
		};



		const doMOBMOBSendIR = (data) => {
    		return new Promise((resolve, reject) => {
				const findGuid = self.findDefaultConnect();

    			const commands = [];
				if(findGuid != self.prop.guid){
					const dateSetLen = 22;
					const count_batch = Math.ceil(data.length / dateSetLen);
					let len = 0;
					for (let i = 0; i < count_batch; i++) {
						len = i * dateSetLen + dateSetLen > data.length ? data.length - i * dateSetLen : dateSetLen;
					
						commands.push({
							action: "write",
							guid: findGuid,
							mac_address: peripheral[findGuid].getProp().mac_address,
							service_id: "ff80",
							char_id: peripheral[findGuid].getProp().firmwareNo < 6 ? "ff83" : "ff81",
							value: `02${self.prop.mac_reverse_key}10${(count_batch - 1 - i).toString(16).pad("00")}${data.substring(i * dateSetLen, i * dateSetLen + len)}`
						});
					}
				}else{
					if(self.prop.firmwareNo < 6){
						const dateSetLen = 38;
						const count_batch = Math.ceil(data.length / dateSetLen);
						let len = 0;
						for (let i = 0; i < count_batch; i++) {
							len = i * dateSetLen + dateSetLen > data.length ? data.length - i * dateSetLen : dateSetLen;
						
							commands.push({
								action: "write",
								guid: self.prop.guid,
								mac_address: self.prop.mac_address,
								service_id: "ff70",
								char_id: "ff71",
								value: `${(count_batch - 1 - i).toString(16).pad("00")}${data.substring(i * dateSetLen, i * dateSetLen + len)}`
							});
						}
					}else{
						const dateSetLen = 36;
						const count_batch = Math.ceil(data.length / dateSetLen);
						let len = 0;
						for (let i = 0; i < count_batch; i++) {
							len = i * dateSetLen + dateSetLen > data.length ? data.length - i * dateSetLen : dateSetLen;
						
							commands.push({
								action: "write",
								guid: self.prop.guid,
								mac_address: self.prop.mac_address,
								service_id: "ff80",
								char_id: "ff81",
								value: `87${(count_batch - 1 - i).toString(16).pad("00")}${data.substring(i * dateSetLen, i * dateSetLen + len)}`
							});
						}
					}
				}

				core_mqtt_publish("cmd/"+md5(md5(self.prop.gateway.toLowerCase())), {
					command:"Control",
					function:"bleHelper.perform",
					params:commands,
					callback:"",
					raw:""
				}, 0, false, false, false).then(() => {
					resolve();
				}).catch(reject);
			});
		};


    	return new Promise((resolve, reject) => {
    		Promise.race([
    			self.findRoute(),
    			self.timeout(10000).then(() => {
    			    self.disconnect();
    				throw 7001;
    			})
    		])
    		.then((result) => {
    		    currentRoute = result;
                switch (currentRoute) {
                	case self.route.BLUETOOTH:
                	    if(self.prop.connected){
                	        return Promise.resolve();
                	    }else{
                	        return self.doConnect();
                	    }
                	    break;
                	case self.route.MOBMOB:
                	    return Promise.resolve();
                	    break;
                	case self.route.MESH:
                	    return Promise.resolve();
                	    break;
                	case self.route.NA:
    				    throw new Error('Device is not here');
                	    break;
                }
    		})
    		.then(() => {
                switch (currentRoute) {
                	case self.route.BLUETOOTH:
						return doBLESendIR(data);
                	    break;
                	case self.route.MOBMOB:
						return doMOBMOBSendIR(data);
                	    break;
                	case self.route.MESH:
						return doMESHSendIR(data);
                	    break;
                	case self.route.NA:
    				    throw new Error('Device is not here');
                	    break;
                }
    		})
    		.then((result) => {
    			resolve(result);
    		})
    		.catch((error) => {
    			reject(error);
    		})
    		.then(() => {
    			// Clean up resources
    			clearTimeout(self.timeout_timer);
    		});
    	});
    };
    Peripheral.prototype.openClose = function(data, direction, press){
        // data = 1_2, open gang_close gang, 
        // direction = 'open', 'close', 'stop'
        // press = true / false, true = pressed, false = release
        let gangs = [];
        data = data.split("_");
        
        if(press){
            if(direction=='open'){
                gangs.push({gang:(data[0]*1), on:true});
                gangs.push({gang:(data[1]*1), on:false});
            }else if(direction=='close'){
                gangs.push({gang:(data[0]*1), on:false});
                gangs.push({gang:(data[1]*1), on:true});
            }else{
                gangs.push({gang:(data[0]*1), on:false});
                gangs.push({gang:(data[1]*1), on:false});
            }
        }else{
            gangs.push({gang:(data[0]*1), on:false});
            gangs.push({gang:(data[1]*1), on:false});
        }
        
        const self = this;
    	return new Promise((resolve, reject) => {
    		const action = {
    		    func:'onoff',
    		    args:[
    		        gangs
    		    ],
    		    callback: {
    		        resolve:resolve,
    		        reject:reject
    		    }
    		}
    		self.queue.push(action);
    		if (!self.isExecuting) {
    			self.isExecuting = true;
    			self.execute();
    		}
    	});
    }
    Peripheral.prototype.rcuOpenClose = function(data, direction, press){
        // data = 1_2, open gang_close gang, 
        // direction = 'open', 'close', 'stop'
        // press = true / false, true = pressed, false = release
        let gangs = [];
        data = data.split("_");
        
        if(press){
            if(direction=='open'){
                gangs.push({gang:(data[0]*1+11), on:true});
                gangs.push({gang:(data[1]*1+11), on:false});
            }else if(direction=='close'){
                gangs.push({gang:(data[0]*1+11), on:false});
                gangs.push({gang:(data[1]*1+11), on:true});
            }else{
                gangs.push({gang:(data[0]*1+11), on:false});
                gangs.push({gang:(data[1]*1+11), on:false});
            }
        }else{
            gangs.push({gang:(data[0]*1+11), on:false});
            gangs.push({gang:(data[1]*1+11), on:false});
        }
        
        const self = this;
    	return new Promise((resolve, reject) => {
    		const action = {
    		    func:'rcuOnoff',
    		    args:[
    		        gangs
    		    ],
    		    callback: {
    		        resolve:resolve,
    		        reject:reject
    		    }
    		}
    		self.queue.push(action);
    		if (!self.isExecuting) {
    			self.isExecuting = true;
    			self.execute();
    		}
    	});
    }

    Peripheral.prototype.execute = function(){
    	if (this.queue.length === 0) {
    		this.isExecuting = false;
    		return;
    	}
    	const action = this.queue.shift();
    	
    	if(action.func=="sendIR"){
    	    this._sendIR(action.args[0]).then((rs) => {
    	        action.callback.resolve(rs);
    	        this.execute();
    	    }).catch((error) => {
    	        action.callback.reject(error);
    	        this.queue = [];
    	        this.isExecuting = false;
    	    }).then(()=>{
    	        
    	    })
    	}else if(action.func=="onoff"){
    	    this._onoff(action.args[0]).then((rs) => {
    	        action.callback.resolve(rs);
    	        this.execute();
    	    }).catch((error) => {
    	        alert(error);
    	        action.callback.reject(error);
    	        this.queue = [];
    	        this.isExecuting = false;
    	    }).then(()=>{
    	        
    	    })
    	}else if(action.func=="rcuOnoff"){
    	    this._rcuOnoff(action.args[0]).then((rs) => {
    	        action.callback.resolve(rs);
    	        this.execute();
    	    }).catch((error) => {
    	        alert(error);
    	        action.callback.reject(error);
    	        this.queue = [];
    	        this.isExecuting = false;
    	    }).then(()=>{
    	        
    	    })
    	}else if(action.func=="rcuOutput"){
				this._rcuOutput(action.args[0]).then((rs) => {
						action.callback.resolve(rs);
						this.execute();
				}).catch((error) => {
						alert(error);
						action.callback.reject(error);
						this.queue = [];
						this.isExecuting = false;
				}).then(()=>{
						
				})
		}else if(action.func=="rcuDimming"){
    	    this._rcuDimming(action.args[0]).then((rs) => {
    	        action.callback.resolve(rs);
    	        this.execute();
    	    }).catch((error) => {
    	        alert(error);
    	        action.callback.reject(error);
    	        this.queue = [];
    	        this.isExecuting = false;
    	    }).then(()=>{
    	        
    	    })
    	}else if(action.func=="thermostat"){
				this._thermostat(action.args[0]).then((rs) => {
						action.callback.resolve(rs);
						this.execute();
				}).catch((error) => {
						alert(error);
						action.callback.reject(error);
						this.queue = [];
						this.isExecuting = false;
				}).then(()=>{
						
				})
		}else if(action.func=="curtainmotor"){
			this._curtainmotor(action.args[0]).then((rs) => {
					action.callback.resolve(rs);
					this.execute();
			}).catch((error) => {
					alert(error);
					action.callback.reject(error);
					this.queue = [];
					this.isExecuting = false;
			}).then(()=>{
					
			})
	}else if(action.func=="dimming"){
			this._dimming(action.args[0]).then((rs) => {
				action.callback.resolve(rs);
				this.execute();
			}).catch((error) => {
				alert(error);
				action.callback.reject(error);
				this.queue = [];
				this.isExecuting = false;
			}).then(()=>{
					
			})
		}else if(action.func=="write"){
    	    this._write(action.args[0]).then((rs) => {
    	        action.callback.resolve(rs);
    	        this.execute();
    	    }).catch((error) => {
    	        action.callback.reject(error);
    	        this.queue = [];
    	        this.isExecuting = false;
    	    }).then(()=>{
    	        
    	    })
    	}else if(action.func=="connect"){
    	    this._connect().then((rs) => {
    	        action.callback.resolve(rs);
    	        this.execute();
    	    }).catch((error) => {
    	        action.callback.reject(error);
    	        this.queue = [];
    	        this.isExecuting = false;
    	    }).then(()=>{
    	        
    	    })
    	}
    };

    Peripheral.prototype.timeout = function(ms){
        const self = this;
        clearTimeout(self.timeout_timer);
        
        return new Promise((resolve) => {
            self.timeout_timer = setTimeout(resolve, ms)
        });
    }
    Peripheral.prototype.getProp = function(){
        return this.prop;
    };
    Peripheral.prototype.getLatestStatus = function(){
    	let latestDate = '';
    	let latestElement = null;
    
    	for (let key in this.prop.status) {
			let elementDate = this.prop.status[key][1];
			if (elementDate > latestDate) {
				latestDate = elementDate;
				latestElement = this.prop.status[key];
			}
    	}
    
    	return latestElement;
    };
    Peripheral.prototype.getGangStatus = function(button_group){
        let gangs = this.getLatestStatus();
        let gang_id = bleHelper.getGangId(button_group);
        
        if(isset(gangs[0][gang_id])){
            return gangs[0][gang_id];
        }else{
            return 0;
        }
    };
	Peripheral.prototype.getAttachmentStatus = function(button_group){
			let gangs = this.getLatestStatus();
			let gang_id = bleHelper.getGangId(button_group);
			let status_list = [];
			if(gang_id ==42){ //theromasta
				if(isset(gangs[0][gang_id])){
					for(let i=42;i<48;i++){
						status_list.push(gangs[0][i])
					}
					return status_list;
				}else{
					return [0,0,0,0,0,0];
				}
			}else{
			    return [0,0,0,0,0,0];
			}
		};
    Peripheral.prototype.getFirmwareNo = function(firmware){
        try{
            if(firmware.trim() == "3.0.0"){
                firmware = `6.0`;
            }
        }catch(e){}
        
        let firmwareNo = firmware.replace(/[^0-9.]/g, '');
        firmwareNo = firmwareNo.split('.');
        firmwareNo = firmwareNo[0] + '.' + (firmwareNo.length>1 ? firmwareNo.slice(1).join('') : '0');
        return firmwareNo;
    }
    Peripheral.prototype.findRoute = function(){
        const self = this;
        
    	return new Promise((resolve, reject) => {
            if(self.prop.connected){ // bluetooth direct control
                resolve(self.route.BLUETOOTH);
            // }else if(!isset(self.prop.firmware)){ //no firmware, suppose bluetooth connect is required
            //     resolve(self.route.BLUETOOTH);
            }else if(self.prop.gateway != "" && self.prop.is_mobmob){ //use gateway
                resolve(self.route.MOBMOB);
            }else if(self.prop.network_id > 0){ //at leave mesh connected
                if(!self.findLead() || self.findLead() == self.prop.guid){
                    resolve(self.route.BLUETOOTH);
                }else{
                    resolve(self.route.MESH);
                }
            }else if(!isset(self.prop.rssi) || !isset(self.prop.lastDiscoverDate) || (isset(self.prop.disappear) && self.prop.disappear)){ //device is not here
                resolve(self.route.NA);
            }else{ // bluetooth connect and control
                resolve(self.route.BLUETOOTH);
            }
    	});
    };
    Peripheral.prototype.findLead = function(){
        const self = this;

		let findGuid = null;
		for(let guid in peripheral){
		    let p = peripheral[guid];
			// not the same network
			if(p.getProp().network_id == 0 || p.getProp().network_id != self.prop.network_id){
				continue;
			}
			// device is not here
			if(!isset(p.getProp().rssi) || !isset(p.getProp().lastDiscoverDate) || (isset(p.getProp().disappear) && p.getProp().disappear)){
				continue;
			}
			// device is connected or connecting
			if(p.getProp().connected || p.getProp().connecting){
				findGuid = guid;
				break;
			}
			
			
			if(p.getProp().hexModel == '0135') continue; //bg000
			if(p.getProp().rssi < -90) continue;  //far away
			if(p.getProp().connectedSize >= 3) continue;  //too many connection
			if(p.getProp().mnSize <= 1) continue;  //non-connected
			
			
			if(!isset(findGuid)){
				findGuid = guid;
			}else{
				if(p.getProp().mnSize > peripheral[findGuid].getProp().mnSize){
					findGuid = guid;
				}else if(p.getProp().mnSize == peripheral[findGuid].getProp().mnSize){
					if(p.getProp().connectedSize < peripheral[findGuid].getProp().connectedSize){
						findGuid = guid;
					}else if(p.getProp().connectedSize == peripheral[findGuid].getProp().connectedSize){
						if(p.getProp().rssi > peripheral[findGuid].getProp().rssi){
							findGuid = guid;
						}
					}
				}
			}
		}
		return findGuid;
    };
    Peripheral.prototype.findDefaultConnect = function(){
        const self = this;

		let findGuid = null;
		for(let guid in peripheral){
		    let p = peripheral[guid];
			// not the same network
			if(p.getProp().network_id == 0 || p.getProp().network_id != self.prop.network_id){
				continue;
			}
			
			if(p.getProp().default_connect){
			    findGuid = guid;
			    break;
			}
		}
		return findGuid;
    };
    Peripheral.prototype.setControl = function(button_group, on){
        let gang_id = bleHelper.getGangId(button_group);
        
        if(this.prop.status.control[0][gang_id]){
            this.prop.status.control[0][gang_id] = on;
            this.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s");
        }
        
        this.onPropChanged();
    };

    Peripheral.prototype.doConnect = function() {
        const self = this;
        
    	const connect = () => {
    		return new Promise((resolve, reject) => {
    		    if(self.prop.connected){ //use bluetooth
    		        self.onConnectionChanged('connected');
    		        resolve(self.prop);
    		    }else{
    		        self.onConnectionChanged('connecting');
        			ble.connect(self.prop.id, (rs)=>{
    	                self.update(rs);
        			    resolve(rs);
        			}, (err)=>{
    		            self.onConnectionChanged('disconnected');
        			    reject(6001); //Failed to connect
        			});
    		    }
    		});
    	};
    	const readFirmware = () => {
    		return new Promise((resolve, reject) => {
    		    if(self.prop.firmwareNo){
    		        resolve(self.prop.firmwareNo);
    		    }else{
        		    let service="180a", characteristic="2a26";
        		    if(isset(self.prop.characteristics)){
            		    for(let c of self.prop.characteristics){
                            if(c.characteristic.toLowerCase() == "2a26" || c.characteristic.toLowerCase() == "2a28"){
                                service = c.service;
                                characteristic = c.characteristic;
                            }
            		    }
        		    }
        			ble.read(self.prop.id, service, characteristic,
                        function(data){
                            let firmware = data.convertToAscii().toLowerCase();
        	                self.prop.firmware = firmware;
                            self.prop.firmwareNo = self.getFirmwareNo(firmware);
                            resolve(self.prop.firmwareNo);
                        },
                        function(failure){
                            reject("Failed to read Firmware");
                        }
                    );
    		    }
    		});
    	};
    	const readMacaddress = () => {
    		return new Promise((resolve, reject) => {
    		    if(self.prop.mac_address){
    		        resolve(self.prop.mac_address);
    		    }else{
        		    let service="180a", characteristic="2a23";
        			ble.read(self.prop.id, service, characteristic,
                        function(data){
                            let macaddress = data.toLowerCase();
                            while (macaddress.length < 16) macaddress = macaddress + "0";
                            
                            self.prop.mac_address = '';
                            if (macaddress.substring(6, 10) === "0000") {
                            	let i = macaddress.length - 2;
                            	while (i >= 0) {
                            		if ((i >= 10 || i <= 4) && i > 0) {
                            			self.prop.mac_address += macaddress.substring(i, i + 2) + ":";
                            		}
                            		if (i === 0) {
                            			self.prop.mac_address += macaddress.substring(i, i + 2);
                            		}
                            		i = i - 2;
                            	}
                            } else {
                            	let i = macaddress.length - 6;
                            	while (i >= 0) {
                            		if (i > 0) {
                            			self.prop.mac_address += macaddress.substring(i, i + 2) + ":";
                            		}
                            		if (i === 0) {
                            			self.prop.mac_address += macaddress.substring(i, i + 2);
                            		}
                            		i = i - 2;
                            	}
                            }
                            
                            self.prop.mac_reverse_key = self.prop.mac_address.split(":").reverse().join("");
                            resolve(self.prop.mac_address);
                        },
                        function(failure){
                            reject("Failed to read Mac Address");
                        }
                    );
    		    }
    		});
    	};
    	const submitPassword = () => {
    		return new Promise((resolve, reject) => {
    		    if(self.prop.authed){
    		        resolve("Password is correct");
    		    }else{
        		    if(self.prop.firmwareNo < 3){
            			ble.read(self.prop.id, "ffb0", "ffb2",
                            function(data){
                                if(data.substring(2,2+4).toLowerCase()==self.prop.password.toLowerCase()){
                                    resolve("Password is correct");
                                }else{
                                    reject(7200); //Password is not correct
                                }
                            },
                            function(failure){
                                reject("Failed to check password for firmware v2.x");
                            }
                        );
                    }else if(self.prop.firmwareNo >= 3 && self.prop.firmwareNo < 6){
                        ble.startNotification(self.prop.id, "ffc0", "ffc2", function(rs){
                            ble.stopNotification(self.prop.id, "ffc0", "ffc2");
                            
                            if(rs.startsWith("00")){
                                resolve("Password is correct");
                            }else if(rs.startsWith("01")){
                                reject(7200); //Password is not correct
                            }else if(rs.startsWith("02")){
                                reject("Password is correct");
                            }
                        },function(error){
                            ble.stopNotification(self.prop.id, "ffc0", "ffc2");
                            reject("Failed to check password for firmware v3.x to v5.x");
                        });
                        
                        let data = ((self.prop.password+self.prop.password).convertToHex()).convertToBytes();
                        ble.write(self.prop.id, "ffc0", "ffc1", data, function(rs){
                            //nothing to do, instead, need notify
                        }, function(rs){
                            reject("Failed to submit password for firmware v3.x to v5.x (Error: "+rs+")");
                        });
        		    }else if(self.prop.firmwareNo >= 6 && self.prop.firmwareNo < 7){
                        ble.startNotification(self.prop.id, "ff80", "ff82", function(rs){
                            ble.stopNotification(self.prop.id, "ff80", "ff82");
                            
                            if(rs.startsWith("8200")){
                                resolve("Password is correct");
                            }else if(rs.startsWith("8201")){
                                reject(7200); //Password is not correct
                            }else if(rs.startsWith("8202")){
                                resolve("Password is correct");
                            }
                        },function(error){
                            ble.stopNotification(self.prop.id, "ff80", "ff82");
                            reject("Failed to check password for firmware v6.x");
                        });
                        
                        let data = ("82"+(self.prop.password+self.prop.password).convertToHex()).convertToBytes();
                        ble.write(self.prop.id, "ff80", "ff81", data, function(rs){
                            //nothing to do, instead, need notify
                        }, function(rs){
                            reject("Failed to submit password for firmware v6.x (Error: "+rs+")");
                        });
        		    }else if(self.prop.firmwareNo >= 7){
                        ble.startNotification(self.prop.id, "ff80", "ff82", function(rs){
                            if(rs.startsWith("8e")){
                                let pwd = "";
                                if(rs.substr(2,2)=="01"){
                                    let securityKey = rs.substr(4);
                                    let hexPassword = (self.prop.password+self.prop.password).convertToHex();
                                    
                                    pwd = "82";
                                    let key = 0,
                                        val = 0,
                                        newval = 0;
                                    
                                    for(i=0; i<hexPassword.length; i+=2){
                                        key = parseInt(securityKey.substr(10-(i%12), 2), 16)
                                        val = parseInt(hexPassword.substr(i, 2), 16);
                                        newval = ~val ^ ~key;
                                        pwd += newval.toString(16).pad("00");
                                    }
                                    console.log("encrypted password="+pwd);
                                    pwd = pwd.convertToBytes();
                                }else{
                                    pwd = ("82"+(self.prop.password+self.prop.password).convertToHex()).convertToBytes();
                                }
                                
                                ble.write(self.prop.id, "ff80", "ff81", pwd, function(rs){
                                }, function(rs){
                                    reject(7200); //Password is not correct
                                });
                            }else if(rs.startsWith("82")){
                                ble.stopNotification(self.prop.id, "ff80", "ff82");
                                
                                if(rs.startsWith("8200")){
                                    resolve("Password is correct");
                                }else if(rs.startsWith("8201")){
                                    reject(7200); //Password is not correct
                                }else if(rs.startsWith("8202")){
                                    resolve("Password is correct");
                                }
                            }
                        },function(error){
                            ble.stopNotification(self.prop.id, "ff80", "ff82");
                            reject("Failed to check password for firmware v6.x");
                        });
                        
                        //check if it is in secure mode
                        let data = "88FF00AA77".convertToBytes();
                        ble.write(self.prop.id, "ff80", "ff81", data, function(rs){
                            //nothing to do, instead, need notify
                        }, function(rs){
                            reject("Failed to submit password for firmware v7.x (Error: "+rs+")");
                        });
        		    }else{
                        reject("Failed to submit password (The firmware v"+self.prop.firmwareNo+" ("+self.prop.firmware+") is not supported yet)");
        		    }
    		    }
    		});
    	};
    	
        const enableNotify = () => {
    		return new Promise((resolve, reject) => {
    		    const executeEnable = async () => {
        		    if(self.prop.authed){
        		        resolve(true);
        		    }else{
        		        const notifyList = [];
            		    if(isset(self.prop.characteristics)){
                		    for(let c of self.prop.characteristics){
                                if(c.characteristic.toLowerCase() == "fff3" || c.characteristic.toLowerCase() == "ff82"){
                                    notifyList.push({
                                        service: c.service,
                                        characteristic: c.characteristic
                                    })
                                }else if(c.characteristic.toLowerCase() == "ff85" && self.prop.firmwareNo >= 3 && self.prop.firmwareNo < 6){
                                    notifyList.push({
                                        service: c.service,
                                        characteristic: c.characteristic
                                    })
                                }
                		    }
            		    }
            		    
            		    if(notifyList.length>0){
                		    for(let i in notifyList){
                		        await new Promise(resolve => setTimeout(resolve, 200));
            					ble.startNotification(self.prop.id, notifyList[i].service, notifyList[i].characteristic, function(rs){
                                    self.onCharNotified(notifyList[i].characteristic, rs)
                                });
                		    }
            		    }
            		    resolve(true);
        		    }
    		    };
    		    executeEnable();
    		    
    		});
    		    
        }
    	return new Promise((resolve, reject) => {
    	    if(!isset(self.prop.rssi)){
    	        reject(6300); //BLE_PERIPHERAL_NOT_FOUND
    	    }else{
    	        connect().then((rs)=>{
        	        return readFirmware();
        	    }).then((firmware) => {
        	        return readMacaddress();
        	    }).then((mac_address) => {
        			return submitPassword();
        	    }).then((result) => {
        			return enableNotify();
        	    }).then((result) => {
    		        self.onConnectionChanged('connected');
        	        self.prop.authed = true;
        	        resolve(result);
        		}).catch((error) => {
        	        self.onConnectionChanged('disconnected');
        			reject(error);
        		})
    	    }
    	});
    };
    Peripheral.prototype.doWrite = function(service, characteristic, data) {
        const self = this;
        
    	return new Promise((resolve, reject) => {
    	    ble.write(self.prop.id, service, characteristic, data.convertToBytes(), function(rs){
                //nothing to do, instead, need notify
                resolve(rs);
            }, function(rs){
                reject(`Failed to write data ${data} to service ${service} with characteristic ${characteristic} (Error message: ${rs})`);
            });
        });
    };
    Peripheral.prototype.doMultipleWrite = function(commands) {
        const self = this;
        
    	return new Promise((resolve, reject) => {
    		const executeCommands = async () => {
    			try {
    				for (const command of commands) {
    					if(command.minFirmwareNo){
    					    if(self.prop.firmwareNo < command.minFirmwareNo) continue;
    					}
    					
    					if(command.maxFirmwareNo){
    					    if(self.prop.firmwareNo > command.maxFirmwareNo) continue;
    					}
    					
    					await new Promise(resolve => setTimeout(resolve, 100));
    					await self.doWrite(command.service, command.characteristic, command.data);
    				}
    				resolve('All commands written successfully');
    			} catch (error) {
    				reject(error);
    			}
    		};
    
    		executeCommands();
    	});
    };
    return Peripheral; 
})();

