def split_bytes_and_convert_to_binary_array(character):
    # 将字符串分割成每两个字符一组
    bytes_list = []
    for i in range(0, len(character), 2):
        byte = character[i:i+2]
        bytes_list.append(byte)
    
    # 将每个字节转换为二进制数组
    binary_array = []
    for byte in bytes_list:
        # 将十六进制转换为整数
        num = 0
        for char in byte:
            if char in '0123456789':
                num = num * 16 + (ord(char) - 48)
            elif char in 'ABCDEF':
                num = num * 16 + (ord(char) - 55)
            elif char in 'abcdef':
                num = num * 16 + (ord(char) - 87)
        
        # 手动转换为8位二进制数组
        for i in range(8):
            bit = (num >> (7 - i)) & 1
            binary_array.append(bit)
    
    return binary_array

data_json = json.loads(doc.details)
    
device_message = ''
gateway_guid = data_json["Info"]["Guid"]
gateway_map = frappe.get_doc("Device",gateway_guid)

#获取设备所在的profile的flat
#获取profile对应的scene，拿到dnd和clean对应的virtual id
#解析获取的rcu的数据，改变flat的door sign status
dnd_virtual_id = None
clean_virtual_id = None
if gateway_map.device_model == 'YO780' or gateway_map.device_mode == 'RCU Controller':     
    # 安全地获取ctrl_data，避免KeyError
    device_data = data_json.get("Device", {})
    ctrl_data = device_data.get("ctrl_data", "")
    
    # 检查ctrl_data是否有效，只有在有效时才继续处理
    if ctrl_data:
        data_list = ctrl_data.split("130510")
        
        # 确保分割后有足够的数据
        if len(data_list) >= 2 and len(data_list[1]) >= 32:
            virtual_data = data_list[1][0:32]
            status_byte_list = split_bytes_and_convert_to_binary_array(virtual_data)
            #下面是解析过程,97000101070202ff000302ffff0402ffff0502ffff110304fe8c8880120401801305100000000000000000000000000000000014060800000000000000001507200000000000000000000000000000000000000000000000000000000000000000
            #获取设备所在的profile
            profile_list = frappe.get_all('Profile',filters=[["device", "=", gateway_guid]],fields=['name','flat'])
            if profile_list is not None:
                for profile in profile_list:
                    if profile.flat is not None:
                        flat_map = frappe.get_doc("Flat",profile.flat)
                        profile_map = frappe.get_doc("Profile",profile.name)
                        profile_subdevices = profile_map.profile_subdevice
                        for subs in profile_subdevices:
                            if subs.device == gateway_guid and 'dnd' in subs.title.lower():
                                dnd_virtual_id = int(subs.config,16)
                            if subs.device == gateway_guid and 'clean' in subs.title.lower():
                                clean_virtual_id = int(subs.config,16)
                        if dnd_virtual_id is not None and clean_virtual_id is not None:
                            dnd_status = status_byte_list[dnd_virtual_id-1]
                            clean_status = status_byte_list[clean_virtual_id-1]
                            print(dnd_status,clean_status)
                            if dnd_status == 1:
                                flat_map.door_sign_status = 'DND'
                            elif clean_status == 1:
                                flat_map.door_sign_status = 'MUR'
                            else:
                                flat_map.door_sign_status = ''
                            flat_map.save()
                    else:
                        continue
            
            
            

