window.BleManager = (function() {
    function BleManager(ble) {
        this.manager = ble;
        this.timer = [];
    }
    
    BleManager.prototype.stopScan = function(){
        const self = this;
    	return new Promise((resolve) => {
    		self.manager.stopScan(resolve, resolve);
    	});
    };
    
    BleManager.prototype.scan = function(success, failure, services=['fff0', 'ff70', 'ffb0', 'ff80','1827','1828']){
        const self = this;
		
    	self.manager.startScanWithOptions(
			services,
			{
				reportDuplicates: true,
				scanMode: 'lowLatency',
			},
			success,
			failure
		)
		
		self.manager.isEnabled(()=>{
    		self.timer.push(setTimeout(async ()=>{
    		    for(let guid in peripheral){
    		        const p = peripheral[guid].getProp();
    		        if(isset(p.lastDiscoverDate) && !p.disappear){
    		            let currentDate = new Date();
                        let timeDifference = (currentDate - new Date(p.lastDiscoverDate)) / 1000;
                        
                        console.log('disappear: '+timeDifference);
                        if (timeDifference >= 18) {
                        	peripheral[guid].update({rssi:1000});
                        }
    		        }
    		    }
    		    
    		    await self.stopScan();
    		    await self.wait(200);
    		    self.scan(success, failure, services);
    		}, 20000));
		});
    };
    
    BleManager.prototype.wait = function(ms){
        const self = this;
    	
    	return new Promise((resolve) => {
    		self.timer.push(setTimeout(resolve, ms));
    	});
    };
    
    
    BleManager.prototype.clear = function(ms){
        const self = this;
        
    	for(let i in self.timer){
    	    clearTimeout(self.timer[i]);
    	}
    };
    
    return BleManager;
})();

if(isset(window.bleManager)){
    bleManager.clear();
    bleManager = null;
}
window.bleManager = new BleManager(ble);


window.bleHelper = {
    getGangId: function(button_group){
        // 0 and 5-7 are not used
        
        if(button_group.startsWith('ONOFF GANG')){ //1 to 4, 0 is not used
            return button_group.replaceAll('ONOFF GANG', '')*1; 
            
        }else if(button_group.startsWith('DIMMING')){ // 8 to 11, 5-7 are not used
            if(button_group=='DIMMING')
                return 8;
            else
                return button_group.replaceAll('DIMMING', '')*1 + 7;
                
        }else if(button_group.startsWith('RCU ONOFF GANG')){ // rcu onoff 1-20, id are from 12 - 31
            return button_group.replaceAll('RCU ONOFF GANG', '')*1 + 11;
            
        }else if(button_group.startsWith('RCU DIMMING')){ // rcu dimming 1-10, id are from 32 - 41
            return button_group.replaceAll('RCU DIMMING', '')*1 + 31;
            
        }else if(button_group.startsWith('OPENCLOSE GANG')){ // OPENCLOSE, no status, but for control, gang 1= 1_2, gang 2= 2_2, gang 3= 3_4, gang 4= 4_3
            return button_group.replaceAll('OPENCLOSE GANG', '');
            
        }else if(button_group.startsWith('RCU OPENCLOSE GANG')){ // OPENCLOSE, no status, but for control, gang 1= 1_2, gang 2= 2_2, gang 3= 3_4, gang 4= 4_3
            return button_group.replaceAll('RCU OPENCLOSE GANG', '');
            
        }else{
            return 1;
        }
    }
}