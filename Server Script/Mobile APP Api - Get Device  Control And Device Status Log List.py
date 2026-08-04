# 性能优化说明：
# 1. 采用 "Top-N" 优化策略：在 UNION 内部先 LIMIT，大幅减少数据库临时表大小
# 2. 消除 N+1 查询：改用批量查询方式获取详细数据
# 3. 索引建议：(device, timestamp DESC)

# 1. 提取参数
device_value = frappe.form_dict.get('device')
start = frappe.utils.cint(frappe.form_dict.get('start', 0))
page_length = frappe.utils.cint(frappe.form_dict.get('page_length', 20))
start_time = frappe.form_dict.get('start_time')
end_time = frappe.form_dict.get('end_time')

# 2. 动态构造 WHERE 
where_parts = ["device = %(device)s"]
params = {"device": device_value, "limit_val": start + page_length}

if start_time:
    where_parts.append("`timestamp` >= %(start_time)s")
    params["start_time"] = start_time
if end_time:
    where_parts.append("`timestamp` <= %(end_time)s")
    params["end_time"] = end_time

where_clause = " WHERE " + " AND ".join(where_parts)

# 3. 核心 SQL 优化：双层 LIMIT 策略 (Top-N Merge)
# 这样数据库只需要从每个表取出前 N 条进行排序，而不需要扫描整个结果集
union_query = f"""
    SELECT * FROM (
        (SELECT name, `timestamp`, 'Device Control Log' as doctype FROM `tabDevice Control Log` {where_clause} ORDER BY `timestamp` DESC LIMIT %(limit_val)s)
        UNION ALL
        (SELECT name, `timestamp`, 'Device Status Log' as doctype FROM `tabDevice Status Log` {where_clause} ORDER BY `timestamp` DESC LIMIT %(limit_val)s)
    ) AS temp_logs
    ORDER BY `timestamp` DESC
    LIMIT {start}, {page_length}
"""

# 执行联合查询获取当前页的索引信息
paged_refs = frappe.db.sql(union_query, params, as_dict=True)

# 4. 消除 N+1 查询：批量获取数据
# 按 Doctype 归类 ID
ref_map = {"Device Control Log": [], "Device Status Log": []}
order_list = [] # 记录原始顺序
for ref in paged_refs:
    ref_map[ref['doctype']].append(ref['name'])
    order_list.append((ref['doctype'], ref['name']))

# 批量拉取两个表的数据
details_data = {}
for doctype, names in ref_map.items():
    if not names: continue
    # 一次查询获取该类型的所有行
    rows = frappe.get_all(doctype, filters={'name': ['in', names]}, fields=['*'])
    for r in rows:
        details_data[f"{doctype}_{r['name']}"] = r

# 按照 order_list 恢复原始排序
combined_list = []
for doctype, name in order_list:
    key = f"{doctype}_{name}"
    if key in details_data:
        combined_list.append(details_data[key])

# 5. 总数统计优化
# 只有在数据极其庞大且索引正确的情况下，COUNT(*) 才比较快
count_query = f"""
    SELECT 
        (SELECT COUNT(*) FROM `tabDevice Control Log` {where_clause}) + 
        (SELECT COUNT(*) FROM `tabDevice Status Log` {where_clause}) as total
"""
total_result = frappe.db.sql(count_query, params)
total_count = total_result[0][0] if total_result else 0

# 6. 构造响应
frappe.response.update({
    "data": {
        "data": combined_list,
        "total": total_count,
        "start": start,
        "page_length": page_length
    },
    "message": "success"
})

# 优化说明：
# - 无论数据库多大，数据库仅扫描索引并返回 20 条结果给 Python。
# - 解决了时间过滤下，原先“只取前100条”可能导致数据不全的问题。
# - 当 combined_list 为空时，前端会自动显示 "No Records Found"。


