try:
    # 1. 参数校验
    required_params = ['profile_name', 'device', 'gateway']
    for param in required_params:
        if not frappe.form_dict.get(param):
            frappe.throw(f"Missing required parameter: {param}", frappe.ValidationError)

    # 2. 获取文档并验证存在性
    profile_detail = frappe.get_doc('Profile', frappe.form_dict.profile_name)
    if not profile_detail.has_permission("write"):
        frappe.throw("Insufficient permissions", frappe.PermissionError)

    # 3. 查找目标设备
    target_device = None
    for pd in profile_detail.profile_device:
        if pd.device == frappe.form_dict.device:
            target_device = pd
            break
    
    if not target_device:
        frappe.throw(f"Device '{frappe.form_dict.device}' not found in profile", frappe.DoesNotExistError)

    # 4. 更新并保存
    target_device.gateway = frappe.form_dict.gateway
    
    # 5. 更新 Device 的 email 设置（如果提供）
    email = frappe.form_dict.get('email')
    if email:
        device_doc = frappe.get_doc('Device', frappe.form_dict.device)
        updated = False
        for s in device_doc.settings:
            if s.setting_type == "Email Address":
                s.setting = email
                updated = True
        
        if updated:
            device_doc.save(ignore_permissions=True)

    profile_detail.save(ignore_permissions=False)  # 尊重权限设置
    frappe.db.commit()

    frappe.response['message'] = 'Gateway updated successfully'

except Exception as e:
    frappe.db.rollback()
    frappe.log_error(f"Profile update failed: {str(e)}")
    frappe.response['message'] = f"Error: {str(e)}"
    frappe.response['http_status_code'] = 500
