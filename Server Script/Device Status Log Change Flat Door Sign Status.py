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
        # 优先检查 13051e，如果不存在则检查 130510
        if "13051e" in ctrl_data:
            data_list = ctrl_data.split("13051e")
        else:
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
                        # 为每个profile重置virtual_id变量
                        profile_dnd_virtual_id = None
                        profile_clean_virtual_id = None
                        
                        flat_map = frappe.get_doc("Flat",profile.flat)
                        old_door_sign_status = flat_map.door_sign_status
                        profile_map = frappe.get_doc("Profile",profile.name)
                        profile_subdevices = profile_map.profile_subdevice
                        
                        for subs in profile_subdevices:
                            if subs.device == gateway_guid and 'dnd' in subs.title.lower():
                                profile_dnd_virtual_id = int(subs.config,16)
                            if subs.device == gateway_guid and 'clean' in subs.title.lower():
                                profile_clean_virtual_id = int(subs.config,16)
                        
                        # 只要有任意一个virtual_id有效就处理
                        if profile_dnd_virtual_id is not None or profile_clean_virtual_id is not None:
                            dnd_status = 0
                            clean_status = 0
                            
                            # 安全地获取状态，检查数组边界
                            if (profile_dnd_virtual_id is not None and 
                                profile_dnd_virtual_id > 0 and 
                                profile_dnd_virtual_id <= len(status_byte_list)):
                                dnd_status = status_byte_list[profile_dnd_virtual_id-1]
                            
                            if (profile_clean_virtual_id is not None and 
                                profile_clean_virtual_id > 0 and 
                                profile_clean_virtual_id <= len(status_byte_list)):
                                clean_status = status_byte_list[profile_clean_virtual_id-1]
                            
                            print(f"DND状态: {dnd_status}, Clean状态: {clean_status}")
                            
                            # 优先级处理：DND > Clean > 无状态
                            if dnd_status == 1 and clean_status == 1:
                                # 如果两个状态都激活，需要确定优先级，这里假设DND优先
                                flat_map.door_sign_status = 'DND'
                            elif dnd_status == 1:
                                flat_map.door_sign_status = 'DND'
                            elif clean_status == 1:
                                flat_map.door_sign_status = 'MUR'
                            else:
                                flat_map.door_sign_status = ''
                            
                            #对比旧状态是否改变
                            # 将None和空字符串视为等价，避免不必要的更新
                            old_status_normalized = old_door_sign_status if old_door_sign_status is not None else ""
                            new_status_normalized = flat_map.door_sign_status if flat_map.door_sign_status is not None else ""
                            
                            if old_status_normalized != new_status_normalized:
                                flat_map.save()
                    else:
                        continue
            
            
            

