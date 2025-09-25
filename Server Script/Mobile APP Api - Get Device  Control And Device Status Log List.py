# 性能优化说明：
# 对于10万+数据，建议添加以下数据库索引以提升查询性能：
# CREATE INDEX idx_device_control_device_timestamp ON `tabDevice Control Log` (device, timestamp DESC);
# CREATE INDEX idx_device_status_device_timestamp ON `tabDevice Status Log` (device, timestamp DESC);

device_value = frappe.form_dict.device
start = int(frappe.form_dict.start) or 0  # 默认从0开始
page_length = int(frappe.form_dict.page_length) or 20  # 默认返回20条数据

# 查询逻辑：合并Device Control Log + Device Status Log

# 获取两个日志表的总记录数
control_total = frappe.db.count('Device Control Log', filters={"device": device_value})
status_total = frappe.db.count('Device Status Log', filters={"device": device_value})
total_count = control_total + status_total

# 智能分页策略：为确保合并排序的准确性，需要取足够的数据
# 计算合理的查询数量，确保能获取到正确的分页结果
fetch_size = max(start + page_length * 2, 100)  # 取更多数据确保分页准确

# 查询Device Control Log数据（按时间倒序）
control_list = frappe.get_all(
    'Device Control Log',
    filters={"device": device_value},
    fields=['*'],
    start=0,  # 从最新开始取
    page_length=fetch_size,
    order_by='timestamp DESC'
)

# 查询Device Status Log数据（按时间倒序）
status_list = frappe.get_all(
    'Device Status Log',
    filters={"device": device_value},
    fields=['*'],
    start=0,  # 从最新开始取
    page_length=fetch_size,
    order_by='timestamp DESC'
)

# 安全的时间戳获取函数
def get_timestamp_for_sort(log_item):
    """安全获取时间戳用于排序"""
    timestamp = log_item.get('timestamp')
    if timestamp is None:
        timestamp = log_item.get('creation', log_item.get('modified', '1970-01-01'))
    return timestamp

# 合并并排序所有日志
all_logs = sorted(
    control_list + status_list,
    key=get_timestamp_for_sort,
    reverse=True
)

# 正确的分页：从合并排序后的结果中取对应页面的数据
combined_list = all_logs[start:start + page_length]

# 构造分页响应结构（合并版本，返回Control Log + Status Log）
# 添加详细调试信息
def identify_log_type(log_item):
    """识别日志类型"""
    name = log_item.get('name', '')
    doctype = log_item.get('doctype', '')
    if 'control' in str(doctype).lower() or 'control' in name.lower():
        return 'control'
    elif 'status' in str(doctype).lower() or 'status' in name.lower():
        return 'status'
    else:
        return 'unknown'

# 统计合并结果中各类型日志的数量
control_count_in_result = len([log for log in combined_list if identify_log_type(log) == 'control'])
status_count_in_result = len([log for log in combined_list if identify_log_type(log) == 'status'])

# 获取时间戳信息用于调试
combined_timestamps = [log.get('timestamp', 'N/A') for log in combined_list[:10]]

frappe.response.update({
    "data": combined_list,
    "total": total_count,  # Control Log + Status Log 总记录数
    "start": start,
    "page_length": page_length,
    "actual_returned": len(combined_list),  # 实际返回的数据条数
    "debug_info": {
        "control_logs_fetched": len(control_list),
        "status_logs_fetched": len(status_list),
        "control_in_result": control_count_in_result,
        "status_in_result": status_count_in_result,
        "fetch_size_used": fetch_size,
        "combined_timestamps": combined_timestamps,
        "note": "返回Device Control Log + Device Status Log合并后按时间排序的结果"
    }
})

# 优化完成：现在API返回Device Control Log + Device Status Log合并后的数据，按时间排序

