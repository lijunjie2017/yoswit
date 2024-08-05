window.guidToMac = (guid,type)=>{
  let prefix = guid.substring(0, 24);
  let mac = "";
  for (let i = 0; i < prefix.length; i += 2) {
      let hexPair = prefix.substring(i, i + 2);
      mac += String.fromCharCode(parseInt(hexPair, 16));
  }
  mac = mac.toLowerCase();
  if(type){
    mac =   formatMacAddress(mac,true);
  }
  return mac;
}

window.macToGuid = (mac,model)=>{
  if (mac.length % 2 !== 0) {
      return [];
  }
  let modelList = cloneDeep(erp.doctype.device_model);
  if(!modelList){
    return [];
  }
  let hexid = Object.values(modelList).find(e=>e.model_code == model).hexid;
  let pairs = [];
  for (let i = 0; i < mac.length; i += 2) {
      pairs.push(mac.substring(i, i + 2));
  }
  let guid = ``;
  pairs.forEach((item)=>{
    guid += item.toLowerCase().convertToHex();
  })
  guid = `${guid}12${hexid.toLowerCase()}1d`
  return guid;
}

window.formatMacAddress = (mac,type)=>{
  if (mac.length !== 12) {
      return "";
  }
  if(type){
    mac = mac.toLowerCase(); 
  }else{
    mac = mac.toUpperCase();   
  }
  let formattedMac = "";
  for (let i = 0; i < mac.length; i += 2) {
      formattedMac += mac.substring(i, i + 2);
      if (i < mac.length - 2) {
          formattedMac += ":";
      }
  }
  return formattedMac;
}