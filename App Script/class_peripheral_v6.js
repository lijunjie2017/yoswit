erp.peripheral_timer_settimeout = [];
erp.init_gangs = [];
for(let i = 0; i < 152; i++){
	erp.init_gangs.push(0);
}
if(!isset(window.peripheral)){
    window.peripheral = {};
}
window.Peripheral = (function() {
    function Peripheral(p) {
    	this.queue = [];
    	this.isExecuting = false;
    	this.refreshKey = "";
    	this.default_connect_used = false;
		this.try = 0;
		this.max_try = 3;
        this.prop = {
            password:'000000',
            gangs:erp.init_gangs, //io0 - io7, pwm1 - pwm4, rcu onoff 1 - 20, rcu dimming 1 - 10, Thermostat 1-6(ref,mode,fan,set_temp,reality_temp,humidity),curtain motor 48 ,Radar 49,RCU output 50-83,Geomagnetic 84,parking lock 85,Door Sensor 86,scene virtual id(64) 87-151
            status:{
                bluetooth:[
									erp.init_gangs, //io0 - io7, pwm1 - pwm4, rcu onoff 1 - 20, rcu dimming 1 - 10, Thermostat 1-6(ref,mode,fan,set_temp,reality_temp,humidity),curtain motor 48,Radar 49,RCU output 50-83,Geomagnetic 84,parking lock 85,Door Sensor 86
                    '1970-01-01 00:00:00'
                ],
                control:[
									erp.init_gangs, //io0 - io7, pwm1 - pwm4, rcu onoff 1 - 20, rcu dimming 1 - 10, Thermostat 1-6(ref,mode,fan,set_temp,reality_temp,humidity),curtain motor 48,Radar 49,RCU output 50-83,Geomagnetic 84,parking lock 85,Door Sensor 86
                    '1970-01-01 00:00:00'
                ],
                mobmob:[
									erp.init_gangs, //io0 - io7, pwm1 - pwm4, rcu onoff 1 - 20, rcu dimming 1 - 10, Thermostat 1-6(ref,mode,fan,set_temp,reality_temp,humidity),curtain motor 48,Radar 49,RCU output 50-83,Geomagnetic 84,parking lock 85,Door Sensor 86
                    '1970-01-01 00:00:00'
                ],
                mesh:[
									erp.init_gangs, //io0 - io7, pwm1 - pwm4, rcu onoff 1 - 20, rcu dimming 1 - 10, Thermostat 1-6(ref,mode,fan,set_temp,reality_temp,humidity),curtain motor 48,Radar 49,RCU output 50-83,Geomagnetic 84,parking lock 85,Door Sensor 86
                    '1970-01-01 00:00:00'
                ],
                mqtt:[
									erp.init_gangs, //io0 - io7, pwm1 - pwm4, rcu onoff 1 - 20, rcu dimming 1 - 10, Thermostat 1-6(ref,mode,fan,set_temp,reality_temp,humidity),curtain motor 48,Radar 49,RCU output 50-83,Geomagnetic 84,parking lock 85,Door Sensor 86
                    '1970-01-01 00:00:00'
                ],
                last:[
									erp.init_gangs, //io0 - io7, pwm1 - pwm4, rcu onoff 1 - 20, rcu dimming 1 - 10, Thermostat 1-6(ref,mode,fan,set_temp,reality_temp,humidity),curtain motor 48,Radar 49,RCU output 50-83,Geomagnetic 84,parking lock 85,Door Sensor 86
                    '1970-01-01 00:00:00'
                ]
            },
			config:{    
			    
			}, // { subdevice_name: { local: ['status', 'date'], mqtt: ['status', 'date'] } }
            connected:false,
            connecting:false,
            lastMqttChechsum:"",
            lastProfileMqttChechsum:"",
            settingMesh:false,
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
						//if(!p.guid){self.prop.guid = self.prop.id}
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
        	if(isset(p.status))  app.utils.extend(self.prop.status, p.status);
        	
        	if(isset(p.characteristics)) self.prop.characteristics = p.characteristics;
        	if(isset(p.services)) self.prop.services = p.services;
        	if(isset(p.firmware)) p.firmware+="";
        	if(isset(p.firmware) && p.firmware != "----"){
        	    self.prop.firmware = p.firmware;
        	    self.prop.firmwareNo = self.getFirmwareNo(p.firmware);
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
					if(isset(p.is_mobile_gateway)) self.prop.is_mobile_gateway = p.is_mobile_gateway;
        	
        	if(isset(p.is_mesh)) self.prop.is_mesh = p.is_mesh;
			if(isset(p) && isset(p.config)){
				self.prop.config = p.config;
			} 
			if(isset(p) && isset(p.virtual)) self.prop.virtual = p.virtual;
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
                    self.prop.bluetooth_count = self.prop.manufactureData.substring(3,4);
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
										//randar sensor
										let sensor_ref = parseInt(self.prop.manufactureData.substring(16, 18), 16);
										self.prop.status.bluetooth[0][49] = sensor_ref
                    //curtain motor
					let curtain_io  = parseInt(self.prop.manufactureData.substring(4, 6),16);
					//if status > 100,means curtain motor can not find the status
					if(curtain_io>100){
						curtain_io = 0;
					}
					//door sensor
					let door_sensor = parseInt(self.prop.manufactureData.substring(4, 6),16);
					if(door_sensor>0){
						self.prop.status.bluetooth[0][86] = 1;
					}else{
						self.prop.status.bluetooth[0][86] = 0;
					}
					//curtain motor
					self.prop.status.bluetooth[0][48] = curtain_io
                    // pwm status
                    let dimmingIo = parseInt(self.prop.manufactureData.substring(4, 6), 16);
					self.prop.status.bluetooth[0][8] = dimmingIo
					//console.log("self.prop.manufactureData="+self.prop.manufactureData);
					//console.log("dimmingIo="+dimmingIo);
					//console.log("self.prop.status="+JSON.stringify(self.prop.status));
					
					//Geomagnetic battery_ref
					let battery_ref  = parseInt(self.prop.manufactureData.substring(15, 16),16);
					self.prop.status.bluetooth[0][83] = battery_ref
					let dc_ref = parseInt(self.prop.manufactureData.substring(14, 16),16) & 0x02;
					self.prop.status.bluetooth[0][84] = dc_ref
                    //thermostat status
					let thermostat = {
						power: parseInt(self.prop.manufactureData.substring(4,6), 16),
						model: parseInt(self.prop.manufactureData.substring(6,8), 16),
						fan: parseInt(self.prop.manufactureData.substring(8, 10), 16),
						temp: parseInt(self.prop.manufactureData.substring(10, 12), 16),
            room_temp: parseInt(self.prop.manufactureData.substring(12,14), 16),
						humidity:parseInt(self.prop.manufactureData.substring(16,18), 16)
					}
					if(thermostat.power){
						//console.log(thermostat);
						//console.log(self.prop.manufactureData)
					}
					if(
					    thermostat.room_temp == 0
					    && thermostat.power == 0
					    && thermostat.model == 0
					    && thermostat.fan == 0
					    && thermostat.temp == 0
					){
					    // const latestStatus = self.getLatestStatus();
              //           self.prop.status.bluetooth[0][42] = latestStatus[0][42];
    					// self.prop.status.bluetooth[0][43] = latestStatus[0][43];
    					// self.prop.status.bluetooth[0][44] = latestStatus[0][44];
    					// self.prop.status.bluetooth[0][45] = latestStatus[0][45];
    					// self.prop.status.bluetooth[0][46] = latestStatus[0][46];
							// self.prop.status.bluetooth[0][47] = latestStatus[0][47];
					}else{
                        self.prop.status.bluetooth[0][42] = thermostat.power;
    					self.prop.status.bluetooth[0][43] = thermostat.model;
    					self.prop.status.bluetooth[0][44] = thermostat.fan;
    					self.prop.status.bluetooth[0][45] = thermostat.temp;
    					self.prop.status.bluetooth[0][46] = thermostat.room_temp;
							self.prop.status.bluetooth[0][47] = thermostat.humidity;
					}
					
					//RCU scan,cancle scan
				// 	let i = 4;
				// 	let RcuData = [];
				// 	let str = self.prop.manufactureData;
				// 	while (i < str.length) {
				// 		let index = str.substring(i, i + 2);
				// 		let type = str.substring(i + 2, i + 4);
				// 		let dataLength = type === '01' ? 2 : type === '02' ? 4 : 0;
				// 		let data = str.substring(i + 4, i + 4 + dataLength);
	
				// 		RcuData.push({ index, type, data });
	
				// 		if (index === '05') break;
	
				// 		i += 4 + dataLength;
				// 	}
				// 	if(RcuData.length == 5){
				// 		console.log("RcuData",RcuData)
				// 		RcuData.forEach(kitem=>{
				// 			if(kitem.index == '01'){
				// 				self.prop.status.bluetooth[0][32] = parseInt(kitem.data.substring(0,2),16);
				// 				self.prop.status.bluetooth[0][33] = parseInt(kitem.data.substring(2,4),16);
				// 			}else if(kitem.index == '02'){
				// 				self.prop.status.bluetooth[0][34] = parseInt(kitem.data.substring(0,2),16);
				// 				self.prop.status.bluetooth[0][35] = parseInt(kitem.data.substring(2,4),16);
				// 			}else if(kitem.index == '03'){
				// 				self.prop.status.bluetooth[0][36] = parseInt(kitem.data.substring(0,2),16);
				// 				self.prop.status.bluetooth[0][37] = parseInt(kitem.data.substring(2,4),16);
				// 			}else if(kitem.index == '04'){
				// 				self.prop.status.bluetooth[0][38] = parseInt(kitem.data.substring(0,2),16);
				// 				self.prop.status.bluetooth[0][39] = parseInt(kitem.data.substring(2,4),16);
				// 			}else if(kitem.index == '05'){
				// 				self.prop.status.bluetooth[0][40] = parseInt(kitem.data.substring(0,2),16);
				// 				self.prop.status.bluetooth[0][41] = parseInt(kitem.data.substring(2,4),16);
				// 			}
				// 		})
				// 	}
				    //rcu can not support the scan data
				    if(self.prop.hexModel.toUpperCase() == '0346' || self.prop.hexModel.toUpperCase() == '0179'){
				        self.prop.status.bluetooth[1] = '1970-01-01 00:00:00';
				    }else{
				        self.prop.status.bluetooth[1] =DateFormatter.format(new Date(), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
				    }
						if(self.prop.status.control[1]=='1970-01-01 00:00:00'){
								self.prop.status.control = JSON.parse(JSON.stringify(self.prop.status.bluetooth))
						}
						if(self.prop.status.bluetooth[1] > self.prop.status.control[1]){
							//console.log("----------------大于----------------------------")
							//self.prop.status.control[0] = self.prop.status.bluetooth[0]
						}
        	    }
        	}
        	
        	//checking if prop except rssi and lastdiscoverdate are changed
        	const prop = JSON.parse(JSON.stringify(self.prop));
        	delete prop.rssi;
					if(self.prop.hexModel != '0346'){
						delete prop.rssilv;
					}
        	delete prop.lastDiscoverDate;
        	delete prop.services;
        	delete prop.characteristics;
					delete prop.status.bluetooth[1];
					delete prop.status.mqtt[1];
					delete prop.manufactureData;
					delete prop.connectedSize;
					delete prop.lastProfileMqttChechsum;
        	const refreshKey = md5(JSON.stringify(prop));
        	if(self.refreshKey != refreshKey || focusRefresh){
							if(prop.guid == '3963396536653033393764361203611d'){
								console.log("refreshKey",prop)
							}
        	    self.refreshKey = refreshKey;
							let date1 = bleHelper.parseTimeString(self.prop.status.bluetooth[1])
							let date2 = bleHelper.parseTimeString(self.prop.status.control[1])
							const totalTime1 = date1.timestamp + date1.microsec / 1000;
							const totalTime2 = date2.timestamp + date2.microsec / 1000;
							//compare the date with function
							if(totalTime1 > totalTime2){
								//if curtain motor is reverse,update the control status
								if(self.prop.device_mode && self.prop.device_mode.includes('Reverse')){
									self.prop.status.control[0][48] = 100 - self.prop.status.bluetooth[0][48];
								}
								setTimeout(function(){
        	        self.onPropChanged();
        	    	}, 10);
							}else if(isset(p.is_mobmob)){
								self.onPropChanged();
							}else if(self.prop.hexModel == '0346' && prop.rssilv){
								self.onPropChanged();
							}
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
						$(`.home-scanned-peripheral[guid="${this.prop.guid}"]`).find('.signal-view-main').attr('bluetooth',2);
            $(`.signal-panel-manual[guid="${this.prop.guid}"]`).attr('bluetooth',2);
            
        }else if(state=='connected'){
            this.prop.connecting = false;
            this.prop.connected = true;
            
            $(`.home-scanned-peripheral[uuid="${this.prop.uuid}"]`).attr('bluetooth',1);
            $(`.home-scanned-peripheral[uuid="${this.prop.uuid}"]`).find('.control-panel-right[type-box="Dimming"]').attr('bluetooth',1);
            $(`.bluetooth-icons[guid="${this.prop.guid}"]`).attr('ref', 1);
            $(`.home-scanned-peripheral[guid="${this.prop.guid}"]`).attr('bluetooth',1);
						$(`.home-scanned-peripheral[guid="${this.prop.guid}"]`).find('.signal-view-main').attr('bluetooth',1);
            $(`.signal-panel-manual[guid="${this.prop.guid}"]`).attr('bluetooth',1);
        }else{
            this.prop.connecting = false;
            this.prop.connected = false;
            this.prop.authed = false;
            this.prop.settingMesh = false;
            
            $(`.home-scanned-peripheral[uuid="${this.prop.uuid}"]`).attr('bluetooth',0);
            $(`.home-scanned-peripheral[uuid="${this.prop.uuid}"]`).find('.control-panel-right[type-box="Dimming"]').attr('bluetooth',0);
            $(`.bluetooth-icons[guid="${this.prop.guid}"]`).attr('ref', 0);
            $(`.home-scanned-peripheral[guid="${this.prop.guid}"]`).attr('bluetooth',0);
						$(`.home-scanned-peripheral[guid="${this.prop.guid}"]`).find('.signal-view-main').attr('bluetooth',0);
            $(`.signal-panel-manual[guid="${this.prop.guid}"]`).attr('bluetooth',0);
        }
        this.onPropChanged();
    };
    Peripheral.prototype.onPropChanged = function(){
        //console.log("onPropChanged");
        const self = this;
        let emitProp = JSON.parse(JSON.stringify(this.prop));
        delete emitProp.rssi;
        delete emitProp.rssilv;
        delete emitProp.lastDiscoverDate;
        delete emitProp.services;
        delete emitProp.characteristics;
        
        let storechecksum = md5(JSON.stringify(emitProp));
        if(!self.lastStorechecksum || self.lastStorechecksum!=storechecksum){
            self.lastStorechecksum = storechecksum;
            
            const timeoutId = setTimeout(function(){
                //console.log("running Class");
                db.get('peripheral').then((data)=>{
                    let storedPeripheral = {};
                    if(data){
                        try{
                            storedPeripheral = JSON.parse(data);
                        }catch(e){
                            
                        }
                    }else{
                    }
                    let storeProp = JSON.parse(JSON.stringify(self.getProp()));
                    delete storeProp.rssi;
                    delete storeProp.rssilv;
                    delete storeProp.lastDiscoverDate;
                    delete storeProp.services;
                    delete storeProp.characteristics;
                    delete storeProp.connecting;
                    delete storeProp.is_mobmob;
										delete storeProp.is_mobile_gateway;
                    delete storeProp.is_mesh;
                    delete storeProp.manufactureData;
                    delete storeProp.connected;
                    
                    
                    storedPeripheral[self.prop.guid] = storeProp;
					if(storeProp.guid == '6430326561623565353434651201791b'){
						//console.log("storedPeripheralRan",storedPeripheral);
					}
                    db.set('peripheral', JSON.stringify(storedPeripheral));
                });
                erp.peripheral_timer_settimeout.push(timeoutId)
            }, 10);
        }
        if(emitProp.hexModel != '0179'){
					delete emitProp.status.control;
				}
        
        let emitchecksum = md5(JSON.stringify(emitProp));
				if(emitProp.guid == '3038623631666565383663361203491d'){
					// console.log('this.lastEmitchecksum',this.lastEmitchecksum);
					// console.log('emitchecksum',emitchecksum);
					// console.log('this.prop',this.prop)
				}
				if(emitProp.guid == '6430326561623565353434651201791b'){
					console.log("comming2")
				}
        if(!this.lastEmitchecksum || this.lastEmitchecksum!=emitchecksum){
            this.lastEmitchecksum = emitchecksum;
						
            emitter.emit('on_peripheral_changed', this.prop);
        }
        
        
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
		
		
		// the above code should not place at this lib, but place it first
// 		clearTimeout(self.timer);
// 		self.timer = setTimeout(function(){
            if(isset(self.prop.gateway) && self.prop.gateway.toLowerCase() == deviceInfo.getDeviceGateway().toLowerCase()){
    			let message = {
    				Info: {
    					'Guid':deviceInfo.deviceId
    				},
    				Device:{}
    			}
    
    			for(let j in erp.info.profile.profile_device){
    			    let d = erp.info.profile.profile_device[j];
    			    if(!isset(d.gateway) && d.gateway.toLowerCase() != deviceInfo.getDeviceGateway().toLowerCase()){
    			        continue;
    			    }
    			    
    			    if(!isset(d.device) || d.device.trim()=="" || !isset(peripheral[d.device])){
    			        continue;
    			    }
    			    
        		    let p = peripheral[d.device];
        		    
        		    message.Device[d.device] = {
        		        mac_address: p.getProp().mac_address?p.getProp().mac_address.toLowerCase():'',
    					manufacturing_data: p.getProp().manufactureData,
    					date: p.getProp().lastDiscoverDate,
        		    }
        		    if(p.getProp().connected){
        		        message.Device[d.device]['rssi'] = p.getProp().rssi;
        		    }else{
        		        if(p.getProp().default_connect){
        		            message.Device[d.device]['rssi'] = 0;
        		        }
        		    }
                }
    
    			if(Object.keys(message.Device).length > 0 && (self.prop.lastMqttChechsum=="" || self.prop.lastMqttChechsum != md5(JSON.stringify(message)))){
    			    self.prop.lastMqttChechsum = md5(JSON.stringify(message));
    			    //core_mqtt_publish("will/"+md5(md5(self.prop.gateway.toLowerCase())), 'Online', 0, true, false, true);
    				//core_mqtt_publish("status/"+md5(md5(self.prop.gateway.toLowerCase())), JSON.stringify(message), 0, true, false, true);
    			}
            }
            
            
            if(isset(erp.info.profile) && (!isset(self.prop.gateway) || self.prop.gateway.trim()=="")){
                // const latestStatus = self.getLatestStatusFromRealSource();
                // if(self.prop.status.mqtt[0] == latestStatus[0]){
                //     return;
                // }
                
    			let message = {
    				Info: {
    					'Profile':erp.info.profile.profile_name,
    					'Guid':erp.info.profile.name
    				},
    				Device:{},
    				Virtual:{},
    			}
    			
    			for(let j in erp.info.profile.profile_device){
    			    let d = erp.info.profile.profile_device[j];
    			    if(isset(d.gateway) && d.gateway.trim() != ""){
    			        continue;
    			    }
    			    
    			    if(!isset(d.device) || d.device.trim()=="" || !isset(peripheral[d.device])){
    			        continue;
    			    }
    			    
        		    let p = peripheral[d.device];
        		    
        		    message.Device[d.device] = {
        		        mac_address: p.getProp().mac_address?p.getProp().mac_address.toLowerCase():'',
    					status: p.getLatestStatusFromRealSource()
        		    }
    			}
    			
    			for(let j in erp.info.profile.profile_subdevice){
    			    let d = erp.info.profile.profile_subdevice[j];
    			    if(!isset(message.Device[d.device])){
    			        continue;
    			    }
    			    
        		    let p = peripheral[d.device];
        		    
        		    if(p.getGangConfig(d.name)!='ir|0|25,1,2,1,0,1'){
        		        message.Virtual[d.name] = {
        		            guid:p.getProp().guid,
        		            config:p.getGangConfigWithDate(d.name)
        		        };
        		    }
    			}
    
                if(!isset(erp.checksum)) erp.checksum = {};
    			if(
    			    Object.keys(message.Device).length > 0 
    			    && (
    			        self.prop.lastProfileMqttChechsum == ""
    			        || self.prop.lastProfileMqttChechsum != md5(JSON.stringify(message))
    			    )
    			    && (
    			        !isset(erp.checksum['profile_mqtt'])
    			        || erp.checksum['profile_mqtt'] != md5(JSON.stringify(message))
    			    )
    		    ){
    			    self.prop.lastProfileMqttChechsum = md5(JSON.stringify(message));
    				core_mqtt_publish("status/"+md5(md5(erp.info.profile.name.toLowerCase())), JSON.stringify(message), 0, true, false, true);
    			}
            }
// 		}, 500);
    };
    Peripheral.prototype.onCharNotified = function(char, data){
        // alert("onCharRead char="+char);
        // alert("onCharRead data="+data);
        const self = this;
        //alert(data)
		console.log("char",char);
		console.log("data",data);
		if(char=="2adc"){
		    if(data=="0308"){
                console.log("identify disconnect 4");
		        self.disconnect().then(()=>{
		            iot_set_mesh_on_provisioning_success(self.prop.guid);
		        }, ()=>{
		            iot_set_mesh_on_provisioning_success(self.prop.guid);
		        });
		    }else if(data.startsWith("030101")){
		        iot_set_mesh_on_identify_success(self.prop.id, self.prop.guid);
		    }else if(data=="030903"){
		        
                console.log("identify disconnect 3");
		        self.disconnect().then(()=>{
		            iot_set_mesh_on_identify_fail(self.prop.id);
		        }, ()=>{
		            iot_set_mesh_on_identify_fail(self.prop.id);
		        });
		        
		    }
		}else if(char=='2ade'){
		    
		}else{
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
                    self.prop.status.bluetooth[0][i+1] = parseInt(value);
                }
    						//if dimming
    						let dimmingIo = parseInt(io, 16);
    						self.prop.status.bluetooth[0][8] = dimmingIo;
                self.prop.status.bluetooth[1] = DateFormatter.format((new Date(new Date().getTime() + 10000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
                self.onPropChanged();
            }else if(data.startsWith("8b")){
    					//update the door sensor
    					if(data.startsWith("8b00") && self.prop.hexModel && self.prop.hexModel == '0205'){
    						self.prop.status.bluetooth[0][86] = 0;
    						$('.manual-door-senser').find('img').attr('src', 'https://my.yoswit.com/files/app/door_close.svg');
    					}else if(self.prop.hexModel && self.prop.hexModel == '0205' && !data.startsWith("8b00")){
    						self.prop.status.bluetooth[0][86] = 1;
    						$('.manual-door-senser').find('img').attr('src', 'https://my.yoswit.com/files/app/door_open.svg');
    					}else{
    						let io_status = parseInt(data.substring(2,4),16);
    						self.prop.status.bluetooth[0][8] = io_status;
    					}
    					//update the curtain status
    					let curtainStatus = parseInt(data.substring(2,4),16);
    					if(self.prop.device_mode && self.prop.device_mode.includes('Reverse')){
    						self.prop.status.control[0][48] = 100 - curtainStatus*1;
    						if(100 - curtainStatus*1 > 1){
    							self.prop.status.last[0][48] = 100 - curtainStatus*1;
    						}
    					}else if(self.prop.device_mode && self.prop.device_mode.includes('Curtain Motor')){
    						self.prop.status.control[0][48] = curtainStatus*1;
    						if(curtainStatus*1 > 1){
    							self.prop.status.last[0][48] = curtainStatus*1;
    						}
    					}
    					
    					self.onPropChanged();
    					//self.prop.status.control[0][48] = curtainStatus;
    					//self.prop.status.bluetooth[1] = DateFormatter.format((new Date(new Date().getTime() + 30000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
    					//self.onPropChanged();
    				}else if(data.startsWith("94110000")){
    					let thermostat = {
    						power: parseInt(data.substring(10,12), 16),
    						model: parseInt(data.substring(12,14), 16),
    						fan: parseInt(data.substring(14, 16), 16),
    						temp: parseInt(data.substring(16, 18), 16),
    										room_temp: parseInt(data.substring(18,20), 16),
    						humidity : parseInt(data.substring(26,28), 16),
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
    					self.prop.status.bluetooth[0][47] = thermostat.humidity;
    			
    			
    					self.prop.status.bluetooth[1] = DateFormatter.format((new Date(new Date().getTime() + 10000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
    					//compare the time
    					console.log("self.prop.status.bluetooth[1] > self.prop.status.control[1]",self.prop.status.bluetooth[1] > self.prop.status.control[1])
    					if(	self.prop.status.bluetooth[1] > self.prop.status.control[1]){
    								//self.onPropChanged();
    					}
            }else if(data.toLowerCase().startsWith("9502000009") || data.toLowerCase().startsWith("95ff")){
    					const byteStrings = data.match(/.{1,2}/g);
              const targetStatus = parseInt(byteStrings[5], 16);
    					self.prop.status.mobmob[0][49] = targetStatus>0?1:0;
    					if(targetStatus > 0){
    					    console.log($('.manual-radar-sensor'))
    					   $('.manual-radar-sensor').find('.material-icons').text('directions_walk')
    					}else{
    					    $('.manual-radar-sensor').find('.material-icons').text('block')
    					}
    					self.onPropChanged();
    				}else if(data.startsWith('9931')){
    				    emitter.emit('key_card_id',{
    				        rs : data
    				    })
    				}else if(data.startsWith("9380")){
    					let rsList = window.iot_ble_iaq_change_list(data);
    					for(let i in rsList){
    						const str = rsList[i].hex;
    						const type = rsList[i].type;
    						const index = rsList[i].index;
    						let value = core_utils_ieee_float_convert(str);
    						const iaqData = iaq_evaluate_rule(type);
    						console.log("value",value);
    						if(isset(iaqData)){
    								$("li.iaq-subdevice[guid='"+self.prop.guid+"']").find(`.${type} .box-btn-img`).css({'background-color':iaqData.bgcolor})
    						}
    						if(type == 'PRESSURE'){
    								value = parseInt(value/1000);
    						}
    						if(type == 'LUX'){
    								console.log("LUX value:"+value);
    								value = parseInt(value*2.5);
    								}
    						if(type == 'CO2'){
    								let str1 = str.substring(0,2);
    								let str2 = str.substring(2,4);
    								let newstr = parseInt(str2,16)*255 + parseInt(str1,16)*1
    								value = newstr
    						}
    						$("li.iaq-subdevice[guid='"+self.prop.guid+"']").find(`.${type} .iaq-title-big`).text(value)
    					}
    					$("li.iaq-subdevice[guid='"+self.prop.guid+"'] .main-btn").forEach((ele)=>{
    						let this_value = $(ele).find(".iaq-title-big").text();
    						if(this_value == '--'){
    								$(ele).hide()
    						}
    						if(this_value != '--'){
    								$(ele).show()
    						}
    					})
    					const score = data.substring(10,12);
    					let score_data = window.iaq_evaluate_rule('score',score);
    					$("li.home-scanned-peripheral[guid='"+self.prop.guid+"']").find(".score .box-btn-img").css({'background-color':score_data.bgcolor})
    					$("li.home-scanned-peripheral[guid='"+self.prop.guid+"']").find(".score").text(parseInt(score,16));
    				}else if(data.startsWith("9329")){
    				    emitter.emit('iot/wifi/info',{"rs" : data})
    				}else if(data.startsWith("8f20") || data.startsWith("8f22") || data.startsWith("8f10") || data.startsWith("8f12") || data.startsWith("972303") || data.startsWith("8f13") ){
    				    emitter.emit('iot/scene/from/ble',{"rs" : data})
    				    emitter.emit('get/device/notification',{"rs" : data})
    				}else if(data.startsWith("87")){
    				// 	console.log("87 data is",data);
    					let temp_p = parseInt(data.substr(8,2)+data.substr(6,2)+data.substr(4,2)+data.substr(2,2), 16);
    					let temp_v = parseInt(data.substr(16,2)+data.substr(14,2)+data.substr(12,2)+data.substr(10,2), 16);
    					let temp_i = parseInt(data.substr(24,2)+data.substr(22,2)+data.substr(20,2)+data.substr(18,2), 16);
    					let pvi_cf = 0.0;
    					if(temp_p>0){
    							pvi_cf = (1.0 / (temp_p /1000000.0));
    					}
    					let pvi_cf1_0 = (1.0 / (temp_v /1000000.0));
    					let pvi_cf1_1 = (1.0 / (temp_i /1000000.0));
    					let p = pvi_cf / 0.1209;
    					let v = (pvi_cf1_0 * 2.43 * 512.0 * 1880.0) / (3579000.0 * 2.0);
    					let i = (pvi_cf1_1 * 2.43 * 512.0) / (3579000.0 * 24.0 * 0.001);
    					if(p<5){
    							i = (p*1.0) / (v*1.0);
    					}
    					
    					let kwh = 0;
    					if(data.length>=34){
    							kwh = parseInt(data.substr(32,2)+data.substr(30,2)+data.substr(28,2)+data.substr(26,2), 16) / 100000.0;
    					}
    
    					//let text = '<div class="pvi" style="font-size:12px">P:'+p.toFixed(2)+' &nbsp; V:'+v.toFixed(2)+' &nbsp; I:'+i.toFixed(2)+' &nbsp; Kwh:'+kwh.toFixed(2)+'</div>';
    					let text = `
    					<div class="pvi list media-list no-margin display-flex justify-content-start align-content-center align-items-center" style="font-size:12px;flex-wrap:wrap;height:auto;width:100%;border-top: 1px dashed #d1d1d1;">
    						<div class="main-btn" style="width: 25%;">
    								<div class="box-btn display-flex justify-content-center align-content-center align-items-center">
    										<div class="Temperature display-flex flex-direction-column justify-content-center align-content-center align-items-center">
    												<div class="display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
    														<img src="https://my.yoswit.com/files/power-icon-02.png" style="width: 45px;height: 45px;" />
    														<span class="unit" style="font-size:16px;margin-left:10px;">${Math.ceil(v)}</span> 
    												</div>
    												<div class="title-btn display-flex justify-content-center align-items-center" style="display:none!important;">
    														<span class="iaq-title-big">V:&nbsp;</span>
    														<span class="unit" style="font-size:14px;">${Math.ceil(v)}</span> 
    												</div>
    										</div>
    								</div>
    						</div>
    						<div class="main-btn" style="width: 25%;">
    								<div class="box-btn display-flex justify-content-center align-content-center align-items-center">
    										<div class="Temperature display-flex flex-direction-column justify-content-center align-content-center align-items-center">
    												<div class="display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
    														<img src="https://my.yoswit.com/files/power-icon-03.png" style="width: 45px;height: 45px;" />
    														<span class="unit" style="font-size:16px;margin-left:10px;">${i.toFixed(1)}</span> 
    												</div>
    												<div class="title-btn display-flex justify-content-center align-items-center" style="display:none!important;">
    														<span class="iaq-title-big">I:&nbsp;</span>
    														<span class="unit" style="font-size:14px;">${i.toFixed(1)}</span> 
    												</div>
    										</div>
    								</div>
    						</div>
    						<div class="main-btn" style="width: 25%;">
    								<div class="box-btn display-flex justify-content-center align-content-center align-items-center">
    										<div class="Temperature display-flex flex-direction-column justify-content-center align-content-center align-items-center">
    												<div class="display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
    														<img src="https://my.yoswit.com/files/power-icon-04.png" style="width: 45px;height: 45px;" />
    														<span class="unit" style="font-size:16px;margin-left:5px;">${Math.ceil(p)}</span> 
    												</div>
    												<div class="title-btn display-flex justify-content-center align-items-center" style="display:none!important;">
    														<span class="iaq-title-big">P:&nbsp;</span>
    														<span class="unit" style="font-size:14px;">${Math.ceil(p)}</span> 
    												</div>
    										</div>
    								</div>
    						</div>
    						<div class="main-btn" style="width: 25%;">
    								<div class="box-btn display-flex justify-content-center align-content-center align-items-center">
    										<div class="Temperature display-flex flex-direction-column justify-content-center align-content-center align-items-center">
    												<div class="display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
    														<img src="https://my.yoswit.com/files/power-icon-01.png" style="width: 45px;height: 45px;" />
    														<span class="unit" style="font-size:16px;margin-left:5px;">${kwh.toFixed(2)}</span> 
    												</div>
    												<div class="title-btn display-flex justify-content-center align-items-center" style="display:none!important;">
    														<span class="iaq-title-big">kWh:&nbsp;</span>
    														<span class="unit" style="font-size:14px;">${kwh.toFixed(2)}</span> 
    												</div>
    										</div>
    								</div>
    						</div>
    					</div>
    					`
    					$("li.home-scanned-peripheral-smart.swipeout-delete-manual[guid='"+self.prop.guid+"'] .pvi").remove();
    					$("li.home-scanned-peripheral-smart.swipeout-delete-manual[guid='"+self.prop.guid+"'] ").append(text);
    					$("li.home-scanned-peripheral-smart.swipeout-delete-manual[guid='"+self.prop.guid+"']").css({'height':140+'px'});
    				}else if(data.startsWith("9700")){
    					//97000101010201000302ff000402000005020000110304000000001204018013051000000000000000000000000000000000
							//means rcu
							let inputDataList = data.split("110304");
							let inputStatus = inputDataList[1].substring(0,8);
							let inputStatusByteList = splitBytesAndConvertToBinaryArray(inputStatus);
							console.log("inputStatusByteList",inputStatusByteList);
							let status = 0;
							for(let i=0;i<inputStatusByteList.length;i++){
								status += inputStatusByteList[i]*Math.pow(2,i);
								if(inputStatusByteList[i] == 1){
									$('.rcu-input-manual').text(i+1);
								}
							}
							if(status == 0){
								$('.rcu-input-manual').text('');
							}
							console.log("status",status);
							if(status == 32){
								//all input is on
								$(`.all-input-on`).text("done_all");
							}else{
								$(`.all-input-on`).text("do_not_disturb_on");
							}
    				}
		}
    };
	Peripheral.prototype.onChangeGateway = function(p){
		const self = this;
		let data = p.manufacturing_data || p.ctrl_data;
		if(isset(p.raw_data) && p.raw_data!='' && p.raw_data.length < data.length){
			data = p.raw_data;
		}
		if(!isset(data) || !data)return;
		if(typeof data != 'string')return;
		if(p.Guid == '3330633932323236333537611203511d'){
			//debugger
		}
		//console.log("data",data);
		let io = 0;
		//Thermostat
		if(data.startsWith("94110000")){
			let thermostat = {
				power: parseInt(data.substring(10,12), 16),
				model: parseInt(data.substring(12,14), 16),
				fan: parseInt(data.substring(14, 16), 16),
				temp: parseInt(data.substring(16, 18), 16),
				room_temp: parseInt(data.substring(18,20), 16)
			}
			self.prop.status.mobmob[0][42] = thermostat.power;
			self.prop.status.mobmob[0][43] = thermostat.model;
			self.prop.status.mobmob[0][44] = thermostat.fan;
			self.prop.status.mobmob[0][45] = thermostat.temp;
			self.prop.status.mobmob[0][46] = thermostat.room_temp;
			self.refreshCtrolStatus();
		}else if(data.startsWith("80")){
			io = parseInt(data.substring(2, 4), 16);
		}else if(data.startsWith("8b")){
			io = parseInt(data.substring(2, 4), 16);
		}else if(data.startsWith("85")){
			if(data.length ==26){
				io = parseInt(data.substring(data.length-8,data.length-6),16);
			}else{
				io = parseInt(data.substring(data.length-4, data.length-2),16);
			}
		}else if(data.startsWith("9380")){
			let rsList = window.iot_ble_iaq_change_list(data);
			for(let i in rsList){
				const str = rsList[i].hex;
				const type = rsList[i].type;
				const index = rsList[i].index;
				let value = core_utils_ieee_float_convert(str);
				const iaqData = iaq_evaluate_rule(type);
				console.log("value",value);
				if(isset(iaqData)){
						$("li.iaq-subdevice[guid='"+p.guid+"']").find(`.${type} .box-btn-img`).css({'background-color':iaqData.bgcolor})
				}
				if(type == 'PRESSURE'){
						value = parseInt(value/1000);
				}
				if(type == 'LUX'){
						console.log("LUX value:"+value);
						value = parseInt(value*2.5);
						}
				if(type == 'CO2'){
						let str1 = str.substring(0,2);
						let str2 = str.substring(2,4);
						let newstr = parseInt(str2,16)*255 + parseInt(str1,16)*1
						value = newstr
				}
				$("li.iaq-subdevice[guid='"+p.guid+"']").find(`.${type} .iaq-title-big`).text(value)
			}
			$("li.iaq-subdevice[guid='"+p.guid+"'] .main-btn").forEach((ele)=>{
				let this_value = $(ele).find(".iaq-title-big").text();
				if(this_value == '--'){
						$(ele).hide()
				}
				if(this_value != '--'){
						$(ele).show()
				}
			})
			const score = data.substring(10,12);
			let score_data = window.iaq_evaluate_rule('score',score);
			$("li.home-scanned-peripheral[guid='"+p.guid+"']").find(".score .box-btn-img").css({'background-color':score_data.bgcolor})
			$("li.home-scanned-peripheral[guid='"+p.guid+"']").find(".score").text(parseInt(score,16));
		}
		let default_connect = p.default_connect;
		let temp = default_connect?1:0;
		//randar status
		let sensor_ref = io & 0x10;
		self.prop.status.mobmob[0][49] = sensor_ref;
		let onoff_io = io;
		for(let i=8; i>=0; i--){
			let key = i.toString();
			let value = "0";
			if(onoff_io >= Math.pow(2, i)){
					value = "1";
					onoff_io -= Math.pow(2, i);
			}
			//self.prop.gangs[i] = parseInt(value);
			self.prop.status.mobmob[0][i+temp] = parseInt(value);
		}
		self.prop.status.mobmob[0][8] = io;
		if(io>0){
			self.prop.status.last[0][8] = io;
		}
		//curtain motor
		self.prop.status.mobmob[0][48] = io;
		//door senser
		if(data.startsWith("8b00") || data.substring(18,20) == '00'){
			self.prop.status.mobmob[0][86] = 0;	
		}else{
			self.prop.status.mobmob[0][86] = 1;	
		}
		
		//iaq
		//if ti curtain motor can not scan the value
		if(self.prop.hexModel == '0179'){
			//change the time
			self.prop.status.bluetooth[1] = '1970-01-01 00:00:00';
			self.prop.status.mobmob[1] = '1970-01-01 00:00:00';
			return;
		}
		//console.log("p.date",p.date)
		self.prop.status.mobmob[1] = isset(p.date)?p.date:'1970-01-01 00:00:00';
		if(!isset(p.date)){
			//less devices can not return the date filed
			//if no ble,update the status
			if((self.prop.rssi >= 0 || !isset(self.prop.rssi)) && (isset(p.retain) && !p.retain)){
				//have ble 
				self.prop.status.mobmob[1] = DateFormatter.format((new Date(new Date().getTime())), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");			
				self.onPropChanged();
			}
			// self.prop.status.mobmob[1] = self.prop.status.bluetooth[1];
		}
		//check if curtain have mqtt data 
		if(self.prop.hexModel == '0361' || self.prop.hexModel == '0351'){
			let curtainStatus = io;
			if(self.prop.device_mode && self.prop.device_mode.includes('Reverse')){
				self.prop.status.last[0][48] = 100 - self.prop.status.last[0][48]*1;
				self.prop.status.control[0][48] = 100 - self.prop.status.control[0][48]*1;
			}else if(self.prop.device_mode && self.prop.device_mode.includes('Curtain Motor')){
				self.prop.status.control[0][48] = curtainStatus*1;
				if(curtainStatus*1 > 1){
					self.prop.status.last[0][48] = curtainStatus*1;
				}
			}
			self.onPropChanged();
		}
		// if(p.date >= self.prop.status.control[1] && p.date >= self.prop.status.bluetooth[1]){
		// 	//upddate the status
		// 	if(self.prop.device_mode && self.prop.device_mode.includes('Reverse')){
		// 		self.prop.status.last[0][48] = 100 - self.prop.status.last[0][48]*1;
		// 		self.prop.status.control[0][48] = 100 - self.prop.status.control[0][48]*1;
		// 	}
		// 	self.onPropChanged();
		// }
	}
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
        console.log("Peripheral disconnect")
        const self = this;
        self.queue = [];
    	self.isExecuting = false;
        
        self.clearCharacteristics();
    	return new Promise((resolve, reject) => {
				ble.disconnect(self.prop.id, (rs)=>{
					self.onConnectionChanged('disconnected');
					resolve();
				}, (error)=>{
					self.onConnectionChanged('disconnected');
					reject(6006); //BLE_PERIPHERAL_DISCONNECT_FAIL
				});
			// ble.refreshDeviceCache(self.prop.id, 0, ()=>{
    	// 		setTimeout(()=>{
    	// 			ble.disconnect(self.prop.id, (rs)=>{
    	// 				self.onConnectionChanged('disconnected');
    	// 				resolve();
    	// 			}, (error)=>{
    	// 				self.onConnectionChanged('disconnected');
    	// 				reject(6006); //BLE_PERIPHERAL_DISCONNECT_FAIL
    	// 			});
    	// 		}, 500);
			// }, ()=>{
    	// 		setTimeout(()=>{
    	// 			ble.disconnect(self.prop.id, (rs)=>{
    	// 				self.onConnectionChanged('disconnected');
    	// 				resolve();
    	// 			}, (error)=>{
    	// 				self.onConnectionChanged('disconnected');
    	// 				reject(6006); //BLE_PERIPHERAL_DISCONNECT_FAIL
    	// 			});
    	// 		}, 500);
			// });
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
				//first can get the last sattus
				let data = JSON.parse(JSON.stringify(self.getLatestStatus()));
				console.log("data",data);
				self.prop.status.control[0] = data[0];
        // set manual control first
		if(!isset(self.prop.firmwareNo) || self.prop.firmwareNo < 6){
		    
		    for(let g of gangs){
				data[0][g.gang] = g.on ? 1 : 0;
		    } 
				
			self.prop.status.control[0] = data[0];
		}else{
		    for(let g of gangs){
		        if(g.gang<1 || g.gang>4) continue;
		        if(g.on){
					self.prop.status.control[0][g.gang] = 1;
				}else{
					self.prop.status.control[0][g.gang] = 0;
				}
		    }
	    }
		self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 5000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
        
        
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
    Peripheral.prototype._onoff = function(gangs,runtime) {
        const self = this;
        let currentRoute = '';

    	const doBLEOnoff = (gangs) => {
    		return new Promise((resolve, reject) => {
				let service = "ff80", characteristic = "ff81";
				let data = [0,0,0,0,0,0,0,0];
    			if(self.prop.firmwareNo < 6){
					let low_data = [1,0,0,0,0,1,1,1];
					let latestStatus = JSON.parse(JSON.stringify(self.getLatestStatus()))[0];
					
					low_data[1] = latestStatus[1];low_data[2] = latestStatus[2];low_data[3] = latestStatus[3];low_data[4] = latestStatus[4];
    			    for(let g of gangs){
								low_data[g.gang] = g.on ? 1 : 0;
								latestStatus[g.gang] = g.on ? 1 : 0;
    			    } 
					self.prop.status.control[0] = JSON.parse(JSON.stringify(latestStatus));
					
    			    data = parseInt(low_data.reverse().join(""), 2).toString(16).toUpperCase().pad("00");
							if(runtime){
								data = `${data}000000ffff0000`
							}
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
					if(runtime){
						data = `${data}000000ffff0000`
					}
    		}
				self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
				self.onPropChanged();
				console.log("service",service);
				console.log("characteristic",characteristic);
				console.log("data",data);
                self.doMultipleWrite([{
					service: service,
					characteristic: characteristic,
					data: data,
				}]).then((rs)=>{
                    resolve(1);
                }).catch((error)=>{
                    reject(error);
                });
    		});
    	};

		const doMESHOnoff = (gangs) => {
    		return new Promise((resolve, reject) => {
				const findGuid = self.findLead();

				let data = [0,0,0,0,0,0,0,0];
				if(self.prop.firmwareNo < 4){
					data = JSON.parse(JSON.stringify(self.getLatestStatus()));
					for(let g of gangs){
						data[g.gang] = g.on ? 1 : 0;
					}
					self.prop.status.control[0] = JSON.parse(JSON.stringify(data));
					
					data = parseInt(data.reverse().join(""), 2).toString(16).toUpperCase().pad("00");
					data = `ff${self.prop.mac_reverse_key}${data}`;
				}else if(self.prop.firmwareNo >= 4 && self.prop.firmwareNo < 6){
					data = JSON.parse(JSON.stringify(self.getLatestStatus()));
					for(let g of gangs){
						data[g.gang] = g.on ? 1 : 0;
					}
					self.prop.status.control[0] = JSON.parse(JSON.stringify(data));
					
					data = parseInt(data.reverse().join(""), 2).toString(16).toUpperCase().pad("00");
					data = `02${self.prop.mac_reverse_key}00${data}`;
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
				self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
				self.onPropChanged();
				
				peripheral[findGuid].write([{
					service: "ff80",
					characteristic: peripheral[findGuid].getProp().firmwareNo < 6 ? "ff83" : "ff81",
					data: data,
				}]).then(()=>{
					resolve(2);
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
				if(self.prop.firmwareNo < 4){
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
				}else if(self.prop.firmwareNo >= 4 && self.prop.firmwareNo < 6){
				// 	data = JSON.parse(JSON.stringify(self.prop.gangs));
					data = JSON.parse(JSON.stringify(self.getLatestStatus()));
					for(let g of gangs){
						data[g.gang] = g.on ? 1 : 0;
					} 
					self.prop.status.control[0] = JSON.parse(JSON.stringify(data));
					
					data = parseInt(data.reverse().join(""), 2).toString(16).toUpperCase().pad("00");
					if(findGuid != self.prop.guid){
						data = `02${self.prop.mac_reverse_key}00${data}`;
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
						data = `02${self.prop.mac_reverse_key}8000${data}00`;
						characteristic = "ff81";
					}
				}
				self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
				self.onPropChanged();
                let strList = self.prop.gateway.split('-');
                let gatewayStr = '';
                if(strList.length <= 2 ){
                    gatewayStr = self.prop.gateway.toLowerCase();
                }else{
                    gatewayStr = self.prop.gateway;
                }
				core_mqtt_publish("cmd/"+md5(md5(gatewayStr)), {
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
					resolve(3);
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
    				    //throw new Error('Device is not here');
								return bleHelper.openBluetooth();
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
								return bleHelper.openBluetooth();
                	    break;
                }
    		})
    		.then((result) => {
				if(!isset(result)){
					reject(6300);
				}else{
					resolve(result);
				}
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
        
	    for(let g of gangs){
	        if(g.gang<12 || g.gang>31) continue;
	        if(g.on){
				self.prop.status.control[0][g.gang] = 1;
			}else{
				self.prop.status.control[0][g.gang] = 0;
			}
	    }
		self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
        
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
					
				self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
				self.onPropChanged();
				
                self.doMultipleWrite(commands).then((rs)=>{
                    resolve(1);
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
					
				self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
				self.onPropChanged();
				
				peripheral[findGuid].write(commands).then((rs)=>{
					resolve(2);
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
					
				self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
				self.onPropChanged();
                let strList = self.prop.gateway.split('-');
                let gatewayStr = '';
                if(strList.length <= 2 ){
                    gatewayStr = self.prop.gateway.toLowerCase();
                }else{
                    gatewayStr = self.prop.gateway;
                }
				core_mqtt_publish("cmd/"+md5(md5(gatewayStr)), {
					command:"Control",
					function:"bleHelper.perform",
					params:commands,
					callback:"",
					raw:""
				}, 0, false, false, false).then(() => {
					resolve(3);
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
										return bleHelper.openBluetooth();
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
										return bleHelper.openBluetooth();
                	    break;
                }
    		})
    		.then((result) => {
				if(!isset(result)){
					reject(6300);
				}else{
					resolve(result);
				}
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
		Peripheral.prototype.doDnd = function(gangs) {
			const self = this;
			debugger
			for(let g of gangs){
				if(g.gang<1 || g.gang>4) continue;
					if(g.on){
					self.prop.status.control[0][g.gang] = 1;
				}else{
					self.prop.status.control[0][g.gang] = 0;
				}
			}	
			self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
			return new Promise((resolve, reject) => {
				const action = {
						func:'doDnd',
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
		Peripheral.prototype._doDnd = function(gangs) {
			const self = this;
			let currentRoute = '';
	
		const doBLE = () => {
			return new Promise((resolve, reject) => {
			let service = "ff80", characteristic = "ff81";
			let commands = [];
			let data = `972101`;
			for(let g of gangs){
				if(g.gang<1 || g.gang>4) continue;
					if(g.on){
					data = `972101${parseInt(g.gang).toString(16).pad("00")}01`;
				}else{
					data = `972101${parseInt(g.gang).toString(16).pad("00")}00`;
				}
			}	
			commands.push({
				service: service,
				characteristic: characteristic,
				data: data,
			});
			
				self.doMultipleWrite(commands).then((rs)=>{
						resolve(1);
				}).catch((error)=>{
						reject(error);
				});
			});
		};
	
	
	const doMOBMOB = () => {
			return new Promise((resolve, reject) => {
			let findGuid = self.findDefaultConnect();
			if(!isset(findGuid)){
				findGuid = self.prop.guid;
			}
			let service = "ff80", characteristic = "ff81";
			let commands = [];
			let data = `972101`;
			for(let g of gangs){
				if(g.gang<1 || g.gang>4) continue;
					if(g.on){
					data = `02${self.prop.mac_reverse_key}972101${parseInt(g.gang).toString(16).pad("00")}01`;
				}else{
					data = `02${self.prop.mac_reverse_key}972101${parseInt(g.gang).toString(16).pad("00")}00`;
				}
			}	
			commands.push({
				action: "write",
				guid: findGuid,
				mac_address: peripheral[findGuid].getProp().mac_address.toLowerCase(),
				service_id: service,
				char_id: characteristic,
				value: data.toLowerCase()
			});
			let strList = self.prop.gateway.split('-');
			let gatewayStr = '';
			if(strList.length <= 2 ){
					gatewayStr = self.prop.gateway.toLowerCase();
			}else{
					gatewayStr = self.prop.gateway;
			}
			core_mqtt_publish("cmd/"+md5(md5(gatewayStr)), {
				command:"Control",
				function:"bleHelper.perform",
				params:commands,
				callback:"",
				raw:""
			}, 0, false, false, false).then(() => {
				resolve(3);
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
							//throw new Error('Device is not here');
							return bleHelper.openBluetooth();
										break;
							}
			})
			.then(() => {
							switch (currentRoute) {
								case self.route.BLUETOOTH:
					return doBLE();
										break;
								case self.route.MOBMOB:
					return doMOBMOB();
										break;
								case self.route.NA:
									return bleHelper.openBluetooth();
										break;
							}
			})
			.then((result) => {
				if(!isset(result)){
					reject(6300);
				}else{
					resolve(result);
				}
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
		Peripheral.prototype.doMusicPlayer = function(gangs) {
			const self = this;
				
			return new Promise((resolve, reject) => {
				const action = {
						func:'doMusicPlayer',
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
		Peripheral.prototype._doMusicPlayer = function(gangs) {
			const self = this;
			let currentRoute = '';
			let commandItem = '';
			for(let g of gangs){
				commandItem = g.command;
			}
		const doBLE = () => {
			return new Promise((resolve, reject) => {
			let service = "ff80", characteristic = "ff81";
			let commands = [];
			let data = commandItem;
			commands.push({
				service: service,
				characteristic: characteristic,
				data: data,
			});
			
				self.doMultipleWrite(commands).then((rs)=>{
						resolve(1);
				}).catch((error)=>{
						reject(error);
				});
			});
		};
	
	
	const doMOBMOB = () => {
			return new Promise((resolve, reject) => {
			let findGuid = self.findDefaultConnect();
			if(!isset(findGuid)){
				findGuid = self.prop.guid;
			}
			let service = "ff80", characteristic = "ff81";
			let commands = [];
			let data = `02${self.prop.mac_reverse_key}${commandItem}`;
			commands.push({
				action: "write",
				guid: findGuid,
				mac_address: peripheral[findGuid].getProp().mac_address.toLowerCase(),
				service_id: service,
				char_id: characteristic,
				value: data.toLowerCase()
			});
			let strList = self.prop.gateway.split('-');
			let gatewayStr = '';
			if(strList.length <= 2 ){
					gatewayStr = self.prop.gateway.toLowerCase();
			}else{
					gatewayStr = self.prop.gateway;
			}
			core_mqtt_publish("cmd/"+md5(md5(gatewayStr)), {
				command:"Control",
				function:"bleHelper.perform",
				params:commands,
				callback:"",
				raw:""
			}, 0, false, false, false).then(() => {
				resolve(3);
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
							//throw new Error('Device is not here');
							return bleHelper.openBluetooth();
										break;
							}
			})
			.then(() => {
							switch (currentRoute) {
								case self.route.BLUETOOTH:
					return doBLE();
										break;
								case self.route.MOBMOB:
					return doMOBMOB();
										break;
								case self.route.NA:
									return bleHelper.openBluetooth();
										break;
							}
			})
			.then((result) => {
				if(!isset(result)){
					reject(6300);
				}else{
					resolve(result);
				}
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
	Peripheral.prototype.doHdmiCec = function(gangs) {
		const self = this;
			
		return new Promise((resolve, reject) => {
			const action = {
					func:'doHdmiCec',
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
	Peripheral.prototype._doHdmiCec = function(gangs) {
		const self = this;
		let currentRoute = '';
	let commandItem = '';
	for(let g of gangs){
		commandItem = g.command;
	}
	const doBLE = () => {
		return new Promise((resolve, reject) => {
		let service = "ff80", characteristic = "ff81";
		let commands = [];
		let data = commandItem;
		commands.push({
			service: service,
			characteristic: characteristic,
			data: data,
		});
		
			self.doMultipleWrite(commands).then((rs)=>{
					resolve(1);
			}).catch((error)=>{
					reject(error);
			});
		});
	};

const doMESH = () => {
	return new Promise((resolve, reject) => {
			const findGuid = self.findLead();

			let service = "ff80", characteristic = "ff81";
			let commands = [];
			data = `02${self.prop.mac_reverse_key}${commandItem}`;
			commands.push({
				service: service,
				characteristic: characteristic,
				data: data,
			});
			
			peripheral[findGuid].write(commands).then((rs)=>{
				resolve(2);
			}).catch((error)=>{
				reject(error);
			});
		});
	};
const doMOBMOB = () => {
		return new Promise((resolve, reject) => {
		let findGuid = self.findDefaultConnect();
		if(!isset(findGuid)){
			findGuid = self.prop.guid;
		}
		let service = "ff80", characteristic = "ff81";
		let commands = [];
		let data = `02${self.prop.mac_reverse_key}${commandItem}`;
		commands.push({
			action: "write",
			guid: findGuid,
			mac_address: peripheral[findGuid].getProp().mac_address.toLowerCase(),
			service_id: service,
			char_id: characteristic,
			value: data.toLowerCase()
		});
		let strList = self.prop.gateway.split('-');
		let gatewayStr = '';
		if(strList.length <= 2 ){
				gatewayStr = self.prop.gateway.toLowerCase();
		}else{
				gatewayStr = self.prop.gateway;
		}
		console.log("commands",commands)
		core_mqtt_publish("cmd/"+md5(md5(gatewayStr)), {
			command:"Control",
			function:"bleHelper.perform",
			params:commands,
			callback:"",
			raw:""
		}, 0, false, false, false).then(() => {
			resolve(3);
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
						//throw new Error('Device is not here');
						return bleHelper.openBluetooth();
									break;
						}
		})
		.then(() => {
						switch (currentRoute) {
							case self.route.BLUETOOTH:
				return doBLE();
									break;
							case self.route.MOBMOB:
				return doMOBMOB();
									break;
							case self.route.MESH:
				return doMESH();
									break;
							case self.route.NA:
								return bleHelper.openBluetooth();
									break;
						}
		})
		.then((result) => {
			if(!isset(result)){
				reject(6300);
			}else{
				resolve(result);
			}
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
Peripheral.prototype.rcuDoScene = function(gangs) {
	const self = this;
	
	for(let g of gangs){
		if(g.gang<49 || g.gang>82) continue;
		self.prop.status.control[0][g.gang] = g.value;
	}
		self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
		
	return new Promise((resolve, reject) => {
		const action = {
				func:'rcuDoScene',
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
Peripheral.prototype._rcuDoScene = function(gangs) {
	const self = this;
	let currentRoute = '';
	let commandItem = '';
	for(let g of gangs){
		commandItem = g.command;
	}

const doBLE = (gangs) => {
	return new Promise((resolve, reject) => {
	let service = "ff80", characteristic = "ff81";
	let commands = [];
	let data = commandItem;
	commands.push({
		service: service,
		characteristic: characteristic,
		data: data,
	});
	self.onPropChanged();
	
	self.doMultipleWrite(commands).then((rs)=>{
			resolve(1);
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
	let data = `02${self.prop.mac_reverse_key}${commandItem}`;
	commands.push({
		action: "write",
		guid: findGuid,
		mac_address: peripheral[findGuid].getProp().mac_address.toLowerCase(),
		service_id: service,
		char_id: characteristic,
		value: data.toLowerCase()
	});
	let strList = self.prop.gateway.split('-');
	let gatewayStr = '';
	if(strList.length <= 2 ){
			gatewayStr = self.prop.gateway.toLowerCase();
	}else{
			gatewayStr = self.prop.gateway;
	}
	core_mqtt_publish("cmd/"+md5(md5(gatewayStr)), {
		command:"Control",
		function:"bleHelper.perform",
		params:commands,
		callback:"",
		raw:""
	}, 0, false, false, false).then(() => {
		resolve(3);
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
							return bleHelper.openBluetooth();
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
							return bleHelper.openBluetooth();
								break;
					}
	})
	.then((result) => {
		if(!isset(result)){
			reject(6300);
		}else{
			resolve(result);
		}
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
		
		for(let g of gangs){
			if(g.gang<49 || g.gang>82) continue;
			self.prop.status.control[0][g.gang] = g.value;
		}
	    self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
	    
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
					if(g.gang<49 || g.gang>82) continue;
					
					self.prop.status.control[0][g.gang] = g.value;
					let output_gang = g.gang-49;
					if(output_gang == 33){
						output_gang = 98;
					}
					data = `02${self.prop.mac_reverse_key.toLowerCase()}972101${output_gang.toString(16).pad("00")}0${g.value}`;
					
				commands.push({
					service: service,
					characteristic: characteristic,
					data: data,
				});
			}
			
		self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
		self.onPropChanged();
		
						self.doMultipleWrite(commands).then((rs)=>{
								resolve(1);
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
				if(g.gang<49 || g.gang>82) continue;
					
				self.prop.status.control[0][g.gang] = g.value;
				let output_gang = g.gang-49;
					if(output_gang == 33){
						output_gang = 98;
					}
				data = `02${self.prop.mac_reverse_key.toLowerCase()}972101${output_gang.toString(16).pad("00")}0${g.value}`;
				commands.push({
					service: service,
					characteristic: characteristic,
					data: data,
				});
			}
			
		self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
		self.onPropChanged();
		
		peripheral[findGuid].write(commands).then((rs)=>{
			resolve(2);
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
				if(g.gang<49 || g.gang>82) continue;
					
				self.prop.status.control[0][g.gang] = g.value;
				let output_gang = g.gang-49;
					if(output_gang == 33){
						output_gang = 98;
					}
				data = `02${self.prop.mac_reverse_key.toLowerCase()}972101${output_gang.toString(16).pad("00")}0${g.value}`;
				commands.push({
				action: "write",
				guid: findGuid,
				mac_address: peripheral[findGuid].getProp().mac_address.toLowerCase(),
				service_id: service,
				char_id: characteristic,
				value: data.toLowerCase()
			});
			}
			
		self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
		self.onPropChanged();
        let strList = self.prop.gateway.split('-');
        let gatewayStr = '';
        if(strList.length <= 2 ){
            gatewayStr = self.prop.gateway.toLowerCase();
        }else{
            gatewayStr = self.prop.gateway;
        }
		core_mqtt_publish("cmd/"+md5(md5(gatewayStr)), {
			command:"Control",
			function:"bleHelper.perform",
			params:commands,
			callback:"",
			raw:""
		}, 0, false, false, false).then(() => {
			resolve(3);
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
								return bleHelper.openBluetooth();
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
								return bleHelper.openBluetooth();
									break;
						}
		})
		.then((result) => {
			if(!isset(result)){
				reject(6300);
			}else{
				resolve(result);
			}
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
Peripheral.prototype.gvDimming = function(gangs) {
	const self = this;
	//first can get the last sattus
	let data = JSON.parse(JSON.stringify(self.getLatestStatus()));
	self.prop.status.control[0] = data[0];
	for(let g of gangs){
			if(g.gang<8 || g.gang>12) continue;
			self.prop.status.control[0][g.gang] = g.value;
	if(g.value > 0){
			self.prop.status.last[0][g.gang] = g.value;
	}
	}
	self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");

	return new Promise((resolve, reject) => {
		const action = {
				func:'gvDimming',
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
Peripheral.prototype._gvDimming = function(gangs) {
	const self = this;
	let currentRoute = '';

const doBLE = (gangs) => {
	return new Promise((resolve, reject) => {
	let service = "ff80", characteristic = "ff81";
	let commands = [];
	
		for(let g of gangs){
				if(g.gang<8 || g.gang>12) continue;
				
				self.prop.status.control[0][g.gang] = g.value;
				data = g.value.toString(16).toUpperCase().pad("00");
				data = `892${(g.gang-8)}${data}`;
				commands.push({
					service: service,
					characteristic: characteristic,
					data: data,
				});
		}
		
	self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
	self.onPropChanged();
	
					self.doMultipleWrite(commands).then((rs)=>{
							resolve(1);
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
				if(g.gang<8 || g.gang>12) continue;
				
				self.prop.status.control[0][g.gang] = g.value;
				data = g.value.toString(16).toUpperCase().pad("00");
				data = `02${self.prop.mac_reverse_key}892${(g.gang-8)}${data}`;
				commands.push({
					service: service,
					characteristic: characteristic,
					data: data,
				});
		}
		
	self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
	self.onPropChanged();
	
	peripheral[findGuid].write(commands).then((rs)=>{
		resolve(2);
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
				if(g.gang<8 || g.gang>12) continue;
				
				self.prop.status.control[0][g.gang] = g.value;
				data = g.value.toString(16).toUpperCase().pad("00");
				data = `02${self.prop.mac_reverse_key}892${(g.gang-8)}${data}`;
				commands.push({
					action: "write",
					guid: findGuid,
					mac_address: peripheral[findGuid].getProp().mac_address.toLowerCase(),
					service_id: service,
					char_id: characteristic,
					value: data.toLowerCase()
				});
		}
		
	self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
	self.onPropChanged();
					let strList = self.prop.gateway.split('-');
					let gatewayStr = '';
					if(strList.length <= 2 ){
							gatewayStr = self.prop.gateway.toLowerCase();
					}else{
							gatewayStr = self.prop.gateway;
					}
	core_mqtt_publish("cmd/"+md5(md5(gatewayStr)), {
		command:"Control",
		function:"bleHelper.perform",
		params:commands,
		callback:"",
		raw:""
	}, 0, false, false, false).then(() => {
		resolve(3);
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
							return bleHelper.openBluetooth();
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
							return bleHelper.openBluetooth();
								break;
					}
	})
	.then((result) => {
		if(!isset(result)){
			reject(6300);
		}else{
			resolve(result);
		}
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
		//first can get the last sattus
		let data = JSON.parse(JSON.stringify(self.getLatestStatus()));
		self.prop.status.control[0] = data[0];
		for(let g of gangs){
			if(g.gang!=8) continue;
			self.prop.status.control[0][g.gang] = g.value;
			if(g.value > 0){
			    self.prop.status.last[0][g.gang] = g.value;
			}
		}
    	self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
		
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
    			
    			self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
    			self.onPropChanged();
    			
    			self.doMultipleWrite([{
    				service: service,
    				characteristic: characteristic,
    				data: data,
    			}]).then((rs)=>{
    				resolve(1);
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
    				}else{
							data = `02${self.prop.mac_reverse_key}${data}`;
						}
    			}
				
				self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
				self.onPropChanged();
				let strList = self.prop.gateway.split('-');
                let gatewayStr = '';
                if(strList.length <= 2 ){
                    gatewayStr = self.prop.gateway.toLowerCase();
                }else{
                    gatewayStr = self.prop.gateway;
                }
				core_mqtt_publish("cmd/"+md5(md5(gatewayStr)), {
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
					resolve(2);
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
				
				self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
				self.onPropChanged();
				
				peripheral[findGuid].write([{
					service: "ff80",
					characteristic: peripheral[findGuid].getProp().firmwareNo < 6 ? "ff83" : "ff81",
					data: data,
				}]).then((rs)=>{
					resolve(3);
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
									return bleHelper.openBluetooth();
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
									return bleHelper.openBluetooth();
										break;
							}
			})
			.then((result) => {
				if(!isset(result)){
					reject(6300);
				}else{
					resolve(result);
				}
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
        //first can get the last sattus
				let data = JSON.parse(JSON.stringify(self.getLatestStatus()));
				self.prop.status.control[0] = data[0];
	    for(let g of gangs){
	        if(g.gang<32 || g.gang>41) continue;
	        self.prop.status.control[0][g.gang] = g.value;
			if(g.value > 0){
			    self.prop.status.last[0][g.gang] = g.value;
			}
	    }
		self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
		
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
			    
				self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
				self.onPropChanged();
				
                self.doMultipleWrite(commands).then((rs)=>{
                    resolve(1);
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
					
				self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
				self.onPropChanged();
				
				peripheral[findGuid].write(commands).then((rs)=>{
					resolve(2);
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
					
				self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
				self.onPropChanged();
                let strList = self.prop.gateway.split('-');
                let gatewayStr = '';
                if(strList.length <= 2 ){
                    gatewayStr = self.prop.gateway.toLowerCase();
                }else{
                    gatewayStr = self.prop.gateway;
                }
				core_mqtt_publish("cmd/"+md5(md5(gatewayStr)), {
					command:"Control",
					function:"bleHelper.perform",
					params:commands,
					callback:"",
					raw:""
				}, 0, false, false, false).then(() => {
					resolve(3);
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
										return bleHelper.openBluetooth();
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
										return bleHelper.openBluetooth();
                	    break;
                }
    		})
    		.then((result) => {
				if(!isset(result)){
					reject(6300);
				}else{
					resolve(result);
				}
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
		
		for(let g of gangs){
			if(g.gang<41 || g.gang>47) continue;
			self.prop.status.control[0][g.gang] = g.value;
		}
		self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
		
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
				
    			self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
    			self.onPropChanged();
    			
    			self.doMultipleWrite(commands).then((rs)=>{
    				resolve(1);
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
    				
    			self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
    			self.onPropChanged();
    			
    			peripheral[findGuid].write(commands).then((rs)=>{
    				resolve(2);
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
    				
    			self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
    			self.onPropChanged();
                let strList = self.prop.gateway.split('-');
                let gatewayStr = '';
                if(strList.length <= 2 ){
                    gatewayStr = self.prop.gateway.toLowerCase();
                }else{
                    gatewayStr = self.prop.gateway;
                }
    			core_mqtt_publish("cmd/"+md5(md5(gatewayStr)), {
    				command:"Control",
    				function:"bleHelper.perform",
    				params:commands,
    				callback:"",
    				raw:""
    			}, 0, false, false, false).then(() => {
    				resolve(3);
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
						return bleHelper.openBluetooth();
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
						return bleHelper.openBluetooth();
						break;
				}
			})
			.then((result) => {
				if(!isset(result)){
					reject(6300);
				}else{
					resolve(result);
				}
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
		
		for(let g of gangs){
			if(g.gang<47) continue;
			self.prop.status.control[0][g.gang] = g.value;
			if(g.value > 0){
				self.prop.status.last[0][g.gang] = g.value;
			}
		}
		if(!isset(gangs[0].type)){
			self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
		}
		
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
				
			self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
			self.onPropChanged();
			
							self.doMultipleWrite(commands).then((rs)=>{
									resolve(1);
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
				
			self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
			self.onPropChanged();
			
			peripheral[findGuid].write(commands).then((rs)=>{
				resolve(2);
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
				
			self.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
			self.onPropChanged();
            let strList = self.prop.gateway.split('-');
            let gatewayStr = '';
            if(strList.length <= 2 ){
                gatewayStr = self.prop.gateway.toLowerCase();
            }else{
                gatewayStr = self.prop.gateway;
            }
			core_mqtt_publish("cmd/"+md5(md5(gatewayStr)), {
				command:"Control",
				function:"bleHelper.perform",
				params:commands,
				callback:"",
				raw:""
			}, 0, false, false, false).then(() => {
				resolve(3);
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
									return bleHelper.openBluetooth();
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
									return bleHelper.openBluetooth();
										break;
							}
			})
			.then((result) => {
				if(!isset(result)){
					reject(6300);
				}else{
					resolve(result);
				}
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
										console.log("command",commands)
    			}
                self.doMultipleWrite(commands).then((rs)=>{
                    resolve(1);
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
					resolve(2);
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
							mac_address: peripheral[findGuid].getProp().mac_address.toLowerCase(),
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
								mac_address: self.prop.mac_address.toLowerCase(),
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
								mac_address: self.prop.mac_address.toLowerCase(),
								service_id: "ff80",
								char_id: "ff81",
								value: `87${(count_batch - 1 - i).toString(16).pad("00")}${data.substring(i * dateSetLen, i * dateSetLen + len)}`
							});
						}
					}
				}
                let strList = self.prop.gateway.split('-');
                let gatewayStr = '';
                if(strList.length <= 2 ){
                    gatewayStr = self.prop.gateway.toLowerCase();
                }else{
                    gatewayStr = self.prop.gateway;
                }
				core_mqtt_publish("cmd/"+md5(md5(gatewayStr)), {
					command:"Control",
					function:"bleHelper.perform",
					params:commands,
					callback:"",
					raw:""
				}, 0, false, false, false).then(() => {
					resolve(3);
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
										return bleHelper.openBluetooth();
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
										return bleHelper.openBluetooth();
                	    break;
                }
    		})
    		.then((result) => {
				if(!isset(result)){
					reject(6300);
				}else{
					resolve(result);
				}
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
    		        gangs,
								true
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

    Peripheral.prototype.identify = function(){
        const self = this;
        
        let found2adc = false;
        let found2ade = false;
	    if(isset(self.prop.characteristics)){
		    for(let c of self.prop.characteristics){
		        console.log("Find c.characteristic = "+c.characteristic);
                if(c.characteristic.toLowerCase() == "2adc"){
                    found2adc = true;
                }else if(c.characteristic.toLowerCase() == "2ade"){
                    found2ade = true;
                }
		    }
	    }else{
	        found2adc = true;
	    }
        
        if(found2adc){
            self.prop.settingMesh = true;
        	return new Promise((resolve, reject) => {
        		const action = {
        		    func:'identify',
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
        }else{
        	return new Promise((resolve, reject) => {
        		if(found2ade){
        		    reject("Found 2ade");
        		}else{
        		    reject("No 2adc");
        		}
        	});
        }
    };
    Peripheral.prototype._identify = function(){
        const self = this;
    	const doIdentify = () => {
    		return new Promise((resolve, reject) => {
                ble.identifyNode(
                    self.prop.id,
                    () => {
                        resolve();
                    },
                    (e) => {
                        reject(e);
                    }
                );
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
                return doIdentify();
    		})
    		.then(() => {
    			resolve();
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

    Peripheral.prototype.bindAppKey = function(){
        const self = this;
        self.prop.settingMesh = true;
    	return new Promise((resolve, reject) => {
    		const action = {
    		    func:'bindAppKey',
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
    Peripheral.prototype._bindAppKey = function(){
        const self = this;
    	
    	return new Promise((resolve, reject) => {
    		Promise.race([
    			self.doConnect(),
    			self.timeout(10000).then(() => {
    			    self.disconnect();
    				throw 7001;
    			})
    		])
    		.then(() => {
    			resolve();
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
    	    this._onoff(action.args[0],action.args[1]).then((rs) => {
    	        action.callback.resolve(rs);
    	        this.execute();
    	    }).catch((error) => {
							//app.dialog.alert(_(erp.get_log_description(error)));
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
							//app.dialog.alert(_(erp.get_log_description(error)));
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
						//app.dialog.alert(_(erp.get_log_description(error)));
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
							//app.dialog.alert(_(erp.get_log_description(error)));
    	        action.callback.reject(error);
    	        this.queue = [];
    	        this.isExecuting = false;
    	    }).then(()=>{
    	        
    	    })
    	}else if(action.func=="gvDimming"){
				this._gvDimming(action.args[0]).then((rs) => {
					action.callback.resolve(rs);
					this.execute();
			}).catch((error) => {
					//app.dialog.alert(_(erp.get_log_description(error)));
					action.callback.reject(error);
					this.queue = [];
					this.isExecuting = false;
			}).then(()=>{
					
			})
			}else if(action.func=="doMusicPlayer"){
				this._doMusicPlayer(action.args[0]).then((rs) => {
						action.callback.resolve(rs);
						this.execute();
				}).catch((error) => {
						//app.dialog.alert(_(erp.get_log_description(error)));
						action.callback.reject(error);
						this.queue = [];
						this.isExecuting = false;
				}).then(()=>{
						
				})
		}else if(action.func=="doHdmiCec"){
			this._doHdmiCec(action.args[0]).then((rs) => {
				action.callback.resolve(rs);
				this.execute();
		}).catch((error) => {
				//app.dialog.alert(_(erp.get_log_description(error)));
				action.callback.reject(error);
				this.queue = [];
				this.isExecuting = false;
		}).then(()=>{
				
		})
		}else if(action.func=="doDnd"){
			debugger
			this._doDnd(action.args[0],action.args[1]).then((rs) => {
					action.callback.resolve(rs);
					this.execute();
			}).catch((error) => {
					//app.dialog.alert(_(erp.get_log_description(error)));
					action.callback.reject(error);
					this.queue = [];
					this.isExecuting = false;
			}).then(()=>{
						
			})
		}else if(action.func=="rcuDoScene"){
			this._rcuDoScene(action.args[0],action.args[1]).then((rs) => {
					action.callback.resolve(rs);
					this.execute();
			}).catch((error) => {
					//app.dialog.alert(_(erp.get_log_description(error)));
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
					//app.dialog.alert(_(erp.get_log_description(error)));
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
					//app.dialog.alert(_(erp.get_log_description(error)));
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
				//app.dialog.alert(_(erp.get_log_description(error)));
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
    	}else if(action.func=="identify"){
    	    this._identify().then((rs) => {
    	        action.callback.resolve(rs);
    	        this.execute();
    	    }).catch((error) => {
    	        action.callback.reject(error);
    	        this.queue = [];
    	        this.isExecuting = false;
    	    }).then(()=>{
    	        
    	    })
    	}else if(action.func=="bindAppKey"){
    	    this._bindAppKey().then((rs) => {
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
	Peripheral.prototype.refreshCtrolStatus = function(){
		let latestDate = '';
    	let latestElement = null;
    
    	for (let key in this.prop.status) {
			let elementDate = this.prop.status[key][1];
			if (elementDate > latestDate) {
				latestDate = elementDate;
				latestElement = this.prop.status[key];
			}
    	}
		for (let key in this.prop.status) {
			this.prop.status[key] = latestElement
    	}
	}
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
    	if(this.prop.guid == '3963396536653033393764361203611d'){
			console.log('latestElement',latestElement)
		}
    	return latestElement;
    };
    Peripheral.prototype.getLatestStatusFromRealSource = function(){
    	let latestDate = '';
    	let latestElement = null;
    
    	for (let key in this.prop.status) {
    	    if(["bluetooth", "control", "mobmob", "mesh", "mqtt"].includes(key)){
    			let elementDate = this.prop.status[key][1];
    			if (elementDate > latestDate) {
    				latestDate = elementDate;
    				latestElement = this.prop.status[key];
    			}
    	    }
    	}
    
    	return latestElement;
    };
    Peripheral.prototype.getLastOnStatus = function(button_group){
        let gang_id = bleHelper.getGangId(button_group);
        if(isset(this.prop.status) && isset(this.prop.status.last) && isset(this.prop.status.last[0][gang_id])){
						//curtain motor 100 not 255
						if([12,13,14,15,48].includes(gang_id)){
							return this.prop.status.last[0][gang_id] == 0 ? 100 : this.prop.status.last[0][gang_id];
						}else{
							return this.prop.status.last[0][gang_id] == 0 ? ([8,9,10,11,32,33,34,35,36,37,38,39,40,41].includes(gang_id) ? 255 : 1) : this.prop.status.last[0][gang_id];
						}
        }else{
					if(gang_id == 48){
						return 100
					}else{
						return [8,9,10,11,32,33,34,35,36,37,38,39,40,41].includes(gang_id) ? 255 : 1;
					}
            
        }
    }
    Peripheral.prototype.getGangStatus = function(button_group){
        let gangs = this.getLatestStatus();
        let gang_id = bleHelper.getGangId(button_group);
        
        if(isset(gangs[0][gang_id])){
            return gangs[0][gang_id];
        }else{
            return 0;
        }
    };
    Peripheral.prototype.setLocalGangConfig = async function(subdevice_name, config){
        const self = this;
        
        if(!isset(self.prop.config[subdevice_name]) || !isset(this.prop.config[subdevice_name]['local'])){
            this.prop.config[subdevice_name] = {};
        }
        app.utils.extend(self.prop.config[subdevice_name], {
            local:[
                config,
                DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000")
            ]
        });
        
        let res = (await db.get('peripheral')) || null;
        if (isset(res)) {
            const storedPeripheral = JSON.parse(res);
            
            let storeProp = JSON.parse(JSON.stringify(self.prop));
            delete storeProp.rssi;
            delete storeProp.rssilv;
            delete storeProp.lastDiscoverDate;
            delete storeProp.services;
            delete storeProp.characteristics;
            delete storeProp.connecting;
            delete storeProp.is_mobmob;
						delete storeProp.is_mobile_gateway;
            delete storeProp.is_mesh;
            delete storeProp.manufactureData;
            delete storeProp.connected;
            
            storedPeripheral[self.prop.guid] = storeProp;
            db.set('peripheral', JSON.stringify(storedPeripheral));
        }
    };
    Peripheral.prototype.setMqttGangConfig = async function(subdevice_name, config){
        const self = this;
        if(!isset(this.prop.config[subdevice_name]) || !isset(this.prop.config[subdevice_name]['mqtt'])){
            this.prop.config[subdevice_name] = {};
        }
        self.prop.config[subdevice_name]['mqtt'] = config
        
        let res = (await db.get('peripheral')) || null;
        if (isset(res)) {
            const storedPeripheral = JSON.parse(res);
            
            let storeProp = JSON.parse(JSON.stringify(self.prop));
            delete storeProp.rssi;
            delete storeProp.rssilv;
            delete storeProp.lastDiscoverDate;
            delete storeProp.services;
            delete storeProp.characteristics;
            delete storeProp.connecting;
            delete storeProp.is_mobmob;
						delete storeProp.is_mobile_gateway;
            delete storeProp.is_mesh;
            delete storeProp.manufactureData;
            delete storeProp.connected;
            
            storedPeripheral[self.prop.guid] = storeProp;
            await db.set('peripheral', JSON.stringify(storedPeripheral));
        }
        self.onPropChanged();
    };
    Peripheral.prototype.getGangConfig = function(subdevice_name){
        // alert(subdevice_name+"="+JSON.stringify(this.prop.config));
        if(isset(this.prop.config[subdevice_name])){
            if(isset(this.prop.config[subdevice_name]['mqtt']) && isset(this.prop.config[subdevice_name]['local'])){
                if(this.prop.config[subdevice_name]['mqtt'][1] > this.prop.config[subdevice_name]['local'][1]){
                    return this.prop.config[subdevice_name]['mqtt'][0];
                }else{
                    return this.prop.config[subdevice_name]['local'][0];
                }
            }else if(isset(this.prop.config[subdevice_name]['mqtt'])){
                return this.prop.config[subdevice_name]['mqtt'][0];
            }else if(isset(this.prop.config[subdevice_name]['local'])){
                return this.prop.config[subdevice_name]['local'][0];
            }else{
                return 'ir|0|25,1,2,1,0,1';
            }
        }else{
            return 'ir|0|25,1,2,1,0,1';
        }
    };
    Peripheral.prototype.getGangConfigWithDate = function(subdevice_name){
        if(isset(this.prop.config[subdevice_name])){
            if(isset(this.prop.config[subdevice_name]['mqtt']) && isset(this.prop.config[subdevice_name]['local'])){
                if(this.prop.config[subdevice_name]['mqtt'][1] > this.prop.config[subdevice_name]['local'][1]){
                    return this.prop.config[subdevice_name]['mqtt'];
                }else{
                    return this.prop.config[subdevice_name]['local'];
                }
            }else if(isset(this.prop.config[subdevice_name]['mqtt'])){
                return this.prop.config[subdevice_name]['mqtt'];
            }else if(isset(this.prop.config[subdevice_name]['local'])){
                return this.prop.config[subdevice_name]['local'];
            }else{
                return [
                        'ir|0|25,1,2,1,0,1',
                        '1970-01-01 00:00:00'
                    ];
            }
        }else{
            return [
                    'ir|0|25,1,2,1,0,1',
                    '1970-01-01 00:00:00'
                ];
        }
    };
	Peripheral.prototype.getAttachmentStatus = function(button_group,type){
	    //if type is true,get the local status
			let gangs;
			if(type){
			    gangs = this.prop.status['control'];
			}else{
			    gangs = this.getLatestStatus();
			}
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
            // if(firmware.trim() == "3.0.0" || firmware.trim() == "1.0.0"){
            //     firmware = `7.0`;
            // }
            //in case the gateway have differ firmware like : 1.1.0, 1.2.x, 1.3.x, 2.x.x
            const versionPattern = /^\d+\.\d+\.\d+$/;
            if(versionPattern.test(firmware)){
                firmware = `7.0`;
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
            this.prop.status.control[1] = DateFormatter.format((new Date(new Date().getTime() + 15000)), "Y-m-d H:i:s")+"."+(new Date().getMilliseconds() % 1000).toString().pad("0000");
        }
        
        this.onPropChanged();
    };


    Peripheral.prototype.doConnect = function() {
        const self = this;
    	const connect = () => {
				console.log("class_peripheral: doConnect");
    		return new Promise((resolve, reject) => {
					checkBLEEnabled().then(()=>{
						if(deviceInfo.operatingSystem === 'ios'){
							return new Promise((resolve,reject)=>{
								resolve()
							})
						}else{
							console.log("class.periperal: checkLocationEnabled");
							return checkLocationEnabled();
						}
					}).then(()=>{
						//alert(self.prop.connected)
						if(self.prop.connected){ //use bluetooth
								self.onConnectionChanged('connected');
								resolve(self.prop);
						}else{
								self.onConnectionChanged('connecting');
								//alert(self.prop.id)
							ble.connect(self.prop.id, (rs)=>{
											self.update(rs);
									resolve(rs);
							}, (err)=>{
									console.log('class_err',err)
							ble.refreshDeviceCache(self.prop.id, 0, (rp)=>{
							    console.log("refreshDeviceCache.p = "+JSON.stringify(rp))
							}, null);
											self.onConnectionChanged('disconnected');
											emitter.emit("disconnected",{
												id : self.prop.id
											})
										reject(6001); //Failed to connect
								});
						}
					})
    		});
    	};
    	const refreshDeviceCache = () => {
    		return new Promise((resolve, reject) => {
    		    if(self.prop.settingMesh){
    				ble.refreshDeviceCache(self.prop.id, 2, (rp) => {
    				    console.log("refreshDeviceCache.p222 = "+JSON.stringify(rp))
    					resolve();
    				}, () => {
    					resolve();
    				});
    		    }else{
    		        resolve();
    		    }
    		});
    	};
    	const readFirmware = () => {
    		return new Promise((resolve, reject) => {
    		    if(parseInt(self.prop.firmwareNo)){
    		        resolve(self.getFirmwareNo(self.prop.firmwareNo));
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
                            resolve(self.getFirmwareNo(firmware));
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
                            //ble.stopNotification(self.prop.id, "ffc0", "ffc2");
                            debugger
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
												// ble.writeWithoutResponse(self.prop.id,"ffc0", "ffc1",data,function(rs){
												// 	console.log("rs",rs)
												// },function(rs){
												// 	reject("Failed to submit password for firmware v3.x to v5.x (Error: "+rs+")");
												// });
                        ble.write(self.prop.id, "ffc0", "ffc1", data, function(rs){
														console.log("rs",rs)
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
                            //ble.stopNotification(self.prop.id, "ff80", "ff82");
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
                            reject("Failed to check password for firmware v7.x");
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
                	console.log("===> executeEnable");
        		    if(self.prop.authed){
                	    console.log("===> executeEnable self.prop.authed = true");
                		console.log("no need to find c.characteristic");
        		        resolve(true);
        		    }else{
                	    console.log("===> executeEnable self.prop.authed = false");
        		        const notifyList = [];
            		    if(isset(self.prop.characteristics)){
                	        console.log("===> executeEnable isset(self.prop.characteristics) = true");
                		    for(let c of self.prop.characteristics){
                		        console.log("Find c.characteristic = "+c.characteristic);
                                if(c.characteristic.toLowerCase() == "fff3"
                                || c.characteristic.toLowerCase() == "ff82"
                                || (c.characteristic.toLowerCase() == "2adc" && self.prop.settingMesh)
                                || (c.characteristic.toLowerCase() == "2ade" && self.prop.settingMesh)){
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
            		    }else{
                	        console.log("===> executeEnable isset(self.prop.characteristics) = false");
            		    }
            		    
            		    if(notifyList.length>0){
                	        console.log("===> executeEnable notifyList.length>0");
            		        console.log(JSON.stringify(notifyList));
                		    for(let i in notifyList){
                		        await new Promise(resolve => setTimeout(resolve, 1000));
                		        console.log("startNotification = "+notifyList[i].characteristic);
            					ble.startNotification(self.prop.id, notifyList[i].service, notifyList[i].characteristic, function(rs){
                                    self.onCharNotified(notifyList[i].characteristic, rs)
                                });
                		    }
                		    await new Promise(resolve => setTimeout(resolve, 1000));
            		    }else{
                	        console.log("===> executeEnable notifyList.length<=0");
            		    }
            		    resolve(true);
        		    }
    		    };
    		    executeEnable();
    		    
    		});
    		    
        }
        const checkBLEEnabled = () => {
            return new Promise((resolve, reject) => {
                ble.isEnabled(function(){
                    resolve();
                }, function(){
                    reject(bleError.BLE_MOBILE_BLUETOOTH_NOT_ENABLED);
                })
            });
        };
        const checkLocationEnabled = () => {
            return new Promise((resolve, reject) => {
                ble.isLocationEnabled(function(){
                    resolve();
                }, function(){
                    reject(bleError.BLE_MOBILE_LOCATION_SERVICE_NOT_ENABLED);
                })
            });
        };

		return new Promise((resolve, reject) => {
    	    if(!isset(self.prop.rssi)){
						console.log("class.periperal: checkBLEEnabled");
						checkBLEEnabled().then(()=>{
							console.log("class.periperal: checkBLEEnabled: success");
							reject(bleError.BLE_PERIPHERAL_NOT_FOUND); //6300
						}).catch((error)=>{
							bleHelper.openBluetooth();
							//reject(error);
						})
    	    }else{
    	       // connect().then((rs)=>{
				let enableTry = false;
				let retryConnect = () => {
					console.log("class.periperal: checkBLEEnabled");
					checkBLEEnabled().then(()=>{
						if(deviceInfo.operatingSystem === 'ios'){
							return new Promise((resolve,reject)=>{
								resolve()
							})
						}else{
							console.log("class.periperal: checkLocationEnabled");
							return checkLocationEnabled();
						}
					}).then(()=>{
						enableTry = true;
						console.log("class.periperal: connect");
						return connect();
					}).then((rs)=>{
						console.log("class.periperal: refreshDeviceCache");
						return refreshDeviceCache();
					}).then((rs)=>{
						console.log("class.periperal: readFirmware");
						return readFirmware();
					}).then((firmware) => {
						console.log("class.periperal: readMacaddress");
						return readMacaddress();
					}).then((mac_address) => {
						console.log("class.periperal: submitPassword");
						return submitPassword();
					}).then((result) => {
						console.log("class.periperal: enableNotify");
						return enableNotify();
					}).then((result) => {
						console.log("class.periperal: connected");
						self.onConnectionChanged('connected');
						self.prop.authed = true;
						resolve(result);
					}).catch((error) => {
						if(error == 7200){
							reject(error);
						}else if(enableTry){
							if(self.try < self.max_try){
								console.log("class.periperal: failed and start retry with try "+self.try);
								self.try++;
								setTimeout(() => {
						            if(deviceInfo.operatingSystem === 'ios'){
						                setTimeout(retryConnect, 600);
						            }else{
    									ble.refreshDeviceCache(self.prop.id, 0, () => {
    										setTimeout(retryConnect, 600); // 0.5 second delay after running ble.refreshDeviceCache
    									}, () => {
    										setTimeout(retryConnect, 600); // 0.5 second delay after running ble.refreshDeviceCache
    									});
						            }
								}, 600);
							}else{
								console.log("class.periperal: failed with tried all");
								ble.refreshDeviceCache(self.prop.id, 0, null, null);
								self.try = 0;
								self.onConnectionChanged('disconnected');
								reject(error);
							}
						}else{
							console.log("class.periperal: failed with no retry is allowed");
							reject(error);
						}
					})
				};

            	retryConnect();
    	    }
    	});
    };
    Peripheral.prototype.clearCharacteristics = function(){
        const self = this;
        self.prop.characteristics = null;
    };
    Peripheral.prototype.doWrite = function(service, characteristic, data) {
        const self = this;
        
        
        const write = (id, service, characteristic, data) => {
            return new Promise((resolve, reject) => {
							console.log("write ble data",data)
        	    ble.write(id, service, characteristic, data.convertToBytes(), function(rs){
                    //nothing to do, instead, need notify
                    resolve(rs);
                }, function(rs){
    				if(data.toLowerCase() == '810e' || data.toLowerCase() == '8110'){
    					resolve();
    				}else{
    					reject(bleError.BLE_PERIPHERAL_WRITE_DATA_FAIL, `Failed to write data ${data} to service ${service} with characteristic ${characteristic} (Error message: ${rs})`);
    				}
                });
            });
        }
        const checkBLEEnabled = () => {
            return new Promise((resolve, reject) => {
                ble.isEnabled(function(){
                    resolve();
                }, function(){
                    reject(bleError.BLE_MOBILE_BLUETOOTH_NOT_ENABLED);
                })
            });
        };
        const checkLocationEnabled = () => {
            return new Promise((resolve, reject) => {
                ble.isLocationEnabled(function(){
                    resolve();
                }, function(){
                    reject(bleError.BLE_MOBILE_LOCATION_SERVICE_NOT_ENABLED);
                })
            });
        };
        
    	return new Promise((resolve, reject) => {
					
    	    if(!isset(self.prop.rssi)){
						//check if have no open the bluetooth
						console.log("class.periperal: checkBLEEnabled");
						checkBLEEnabled().then(()=>{
							console.log("class.periperal: checkBLEEnabled: success");
							reject(bleError.BLE_PERIPHERAL_NOT_FOUND); //6300
						}).catch((error)=>{
							debugger
							bleHelper.openBluetooth();
							//reject(error);
						})
    	    }else{
    	       // connect().then((rs)=>{
				let enableTry = false;
				let retryWrite = () => {
					checkBLEEnabled().then(()=>{
						if(deviceInfo.operatingSystem === 'ios'){
							return new Promise((resolve)=>{
								resolve()
							})
						}else{
							return checkLocationEnabled();
						}
					}).then(()=>{
						enableTry = true;
						return write(self.prop.id, service, characteristic, data);
					}).then((result) => {
						self.try = 0;
						resolve(result);
					}).catch((error) => {
						if(enableTry){
							if(self.try < self.max_try){
								self.try++;
								setTimeout(() => {
						            if(deviceInfo.operatingSystem === 'ios'){
						                setTimeout(retryWrite, 600);
						            }else{
    									ble.refreshDeviceCache(self.prop.id, 0, () => {
    										setTimeout(retryWrite, 600); // 0.5 second delay after running ble.refreshDeviceCache
    									}, () => {
    										setTimeout(retryWrite, 600); // 0.5 second delay after running ble.refreshDeviceCache
    									});
						            }
								}, 600);
							}else{
								ble.refreshDeviceCache(self.prop.id, 0, null, null);
								self.try = 0;
								self.onConnectionChanged('disconnected');
								reject(error);
							}
						}else{
							reject(error);
						}
					})
				};

				retryWrite();
    	    }
        });
    };
    Peripheral.prototype.doMultipleWrite = function(commands) {
        const self = this;
       console.log("commands",commands)
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

