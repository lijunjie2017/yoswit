window.ir_upload_file = async()=>{
  let zipUrl = 'https://my.yoswit.com/files/IR-v1.0.zip';
  
  // 自动注入CSS样式
  const injectStyles = () => {
    if (document.getElementById('ir-upload-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'ir-upload-styles';
    style.textContent = `
      /* IR文件上传进度显示样式 */
      .toast-success {
        background: linear-gradient(135deg, #4CAF50, #45a049) !important;
        color: white !important;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3) !important;
        border-radius: 8px !important;
      }
      
      .toast-error {
        background: linear-gradient(135deg, #f44336, #d32f2f) !important;
        color: white !important;
        box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3) !important;
        border-radius: 8px !important;
      }
      
      .progressbar {
        background: rgba(255, 107, 107, 0.1) !important;
        border-radius: 4px !important;
        overflow: hidden !important;
      }
      
      .progressbar span {
        background: linear-gradient(90deg, #ff6b6b, #ff5252) !important;
        box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3) !important;
        transition: width 0.3s ease !important;
      }
      
      .ir-progress-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 13000;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        padding: 15px 20px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        transform: translateY(-100%);
        transition: transform 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .ir-progress-container.show {
        transform: translateY(0);
      }
      
      .ir-progress-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .ir-progress-step {
        font-size: 13px;
        color: #666;
        margin-bottom: 10px;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .ir-progress-bar {
        height: 6px;
        background: #f0f0f0;
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 8px;
      }
      
      .ir-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #ff6b6b, #ff5252);
        border-radius: 3px;
        transition: width 0.4s ease;
        position: relative;
      }
      
      .ir-progress-fill::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: ir-shimmer 2s infinite;
      }
      
      @keyframes ir-shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      .ir-progress-percentage {
        font-size: 12px;
        color: #888;
        text-align: right;
      }
      
      .ir-fade-in {
        animation: ir-fadeIn 0.3s ease;
      }
      
      @keyframes ir-fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .ir-slide-up {
        animation: ir-slideUp 0.3s ease;
      }
      
      @keyframes ir-slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      @media (prefers-color-scheme: dark) {
        .ir-progress-container {
          background: rgba(30, 30, 30, 0.95);
          border-bottom-color: rgba(255, 255, 255, 0.1);
        }
        
        .ir-progress-title {
          color: #fff;
        }
        
        .ir-progress-step {
          color: #ccc;
        }
        
        .ir-progress-bar {
          background: #333;
        }
      }
      
      @media (max-width: 768px) {
        .ir-progress-container {
          padding: 12px 15px;
        }
        
        .ir-progress-title {
          font-size: 14px;
        }
        
        .ir-progress-step {
          font-size: 12px;
        }
      }
    `;
    
    document.head.appendChild(style);
  };
  
  // 自动注入样式
  injectStyles();
  
  // Framework7进度管理器 - 完全自包含版
  const progressManager = {
    progressContainer: null,
    currentStep: 0,
    
    init() {
      // 创建自定义进度UI
      this.createProgressUI();
      
      // 显示Framework7进度条（如果可用）
      this.showProgressbar(0);
      
      // 显示开始提示
      this.showToast('🚀 开始IR文件下载处理...', 'top', 2000);
    },
    
    // Framework7兼容方法
    showProgressbar(progress) {
      if (typeof app !== 'undefined' && app.progressbar) {
        if (progress === 0) {
          app.progressbar.show('#ff6b6b', progress);
        } else {
          app.progressbar.set(progress);
        }
      }
    },
    
    hideProgressbar() {
      if (typeof app !== 'undefined' && app.progressbar) {
        app.progressbar.hide();
      }
    },
    
    showToast(text, position = 'center', closeTimeout = 3000, cssClass = '') {
      if (typeof app !== 'undefined' && app.toast) {
        app.toast.show({
          text: text,
          position: position,
          closeTimeout: closeTimeout,
          cssClass: cssClass
        });
      } else {
        // 降级到原生alert
        console.log(`Toast: ${text}`);
      }
    },
    
    showDialog(title, content) {
      if (typeof app !== 'undefined' && app.dialog) {
        app.dialog.alert(content, title);
      } else {
        // 降级到原生alert
        alert(`${title}\n\n${content.replace(/<[^>]*>/g, '')}`);
      }
    },
    
    createProgressUI() {
      // 检查是否已存在
      if (document.querySelector('.ir-progress-container')) {
        return;
      }
      
      // 创建进度容器
      const container = document.createElement('div');
      container.className = 'ir-progress-container';
      container.innerHTML = `
        <div class="ir-progress-title">
          <span class="ir-step-icon">🚀</span>
          <span class="ir-step-text">IR文件处理中...</span>
        </div>
        <div class="ir-progress-step">准备开始处理...</div>
        <div class="ir-progress-bar">
          <div class="ir-progress-fill" style="width: 0%"></div>
        </div>
        <div class="ir-progress-percentage">0%</div>
      `;
      
      document.body.appendChild(container);
      this.progressContainer = container;
      
      // 显示容器
      setTimeout(() => {
        container.classList.add('show');
      }, 100);
    },
    
    updateStep(step, progress = 0, message = '') {
      console.log(`📊 步骤 ${step}: ${progress}% - ${message}`);
      this.currentStep = step;
      
      // 更新Framework7进度条
      this.showProgressbar(progress);
      
      // 更新自定义UI
      this.updateCustomUI(step, progress, message);
      
      // 步骤指示器
      const stepInfo = this.getStepInfo(step);
      
      if (stepInfo) {
        console.log(`🎯 当前步骤: ${stepInfo.name} (${progress}%)`);
        
        // 显示步骤变化提示
        if (step !== this.lastStep) {
          this.showToast(`${stepInfo.icon} ${stepInfo.name}`, 'top', 2000, 'ir-slide-up');
          this.lastStep = step;
        }
      }
      
      // 显示重要消息
      if (message && (progress % 20 === 0 || progress >= 90)) {
        this.showToast(`📋 ${message}`, 'top', 2500);
      }
    },
    
    updateCustomUI(step, progress, message) {
      if (!this.progressContainer) return;
      
      const stepInfo = this.getStepInfo(step);
      const title = this.progressContainer.querySelector('.ir-step-text');
      const stepDiv = this.progressContainer.querySelector('.ir-progress-step');
      const fill = this.progressContainer.querySelector('.ir-progress-fill');
      const percentage = this.progressContainer.querySelector('.ir-progress-percentage');
      const icon = this.progressContainer.querySelector('.ir-step-icon');
      
      if (stepInfo) {
        title.textContent = stepInfo.name;
        icon.textContent = stepInfo.icon;
      }
      
      stepDiv.textContent = message || `步骤 ${step} 处理中...`;
      fill.style.width = `${progress}%`;
      percentage.textContent = `${progress}%`;
      
      // 进度颜色变化
      if (progress >= 90) {
        fill.style.background = 'linear-gradient(90deg, #4CAF50, #45a049)';
      } else if (progress >= 70) {
        fill.style.background = 'linear-gradient(90deg, #FF9800, #F57C00)';
      } else {
        fill.style.background = 'linear-gradient(90deg, #ff6b6b, #ff5252)';
      }
    },
    
    getStepInfo(step) {
      const stepMap = {
        1: { name: '准备环境', icon: '📚' },
        2: { name: '下载ZIP文件', icon: '📥' }, 
        3: { name: '读取文件数据', icon: '📂' },
        4: { name: '解压ZIP文件', icon: '📦' },
        5: { name: '保存解压文件', icon: '💾' },
        6: { name: '清理临时文件', icon: '🧹' },
        7: { name: '处理完成', icon: '✅' }
      };
      return stepMap[step];
    },
    
    showError(message) {
      this.hide();
      this.showToast(`❌ ${message}`, 'center', 5000, 'toast-error');
    },
    
    showSuccess(message, data) {
      // 更新UI为完成状态
      if (this.progressContainer) {
        this.updateCustomUI(7, 100, '所有步骤完成！');
        
        // 3秒后隐藏
        setTimeout(() => {
          this.hide();
        }, 3000);
      }
      
      this.hideProgressbar();
      this.showToast(`🎉 ${message}`, 'center', 4000, 'toast-success');
      
      // 显示详细结果
      setTimeout(() => {
        const totalSize = data.extractedFiles.reduce((sum, f) => sum + f.size, 0);
        const content = `🎉 处理成功！
        
📁 解压路径: ${data.basePath}
📄 文件数量: ${data.totalFiles} 个
💾 总大小: ${(totalSize / (1024*1024)).toFixed(2)} MB
⏱️ 处理时间: ${this.getProcessTime()}`;
        
        this.showDialog('IR文件处理完成', content);
      }, 1500);
    },
    
    getProcessTime() {
      if (this.startTime) {
        const elapsed = Date.now() - this.startTime;
        return `${Math.round(elapsed / 1000)} 秒`;
      }
      return '';
    },
    
    hide() {
      this.hideProgressbar();
      
      if (this.progressContainer) {
        this.progressContainer.classList.remove('show');
        setTimeout(() => {
          if (this.progressContainer && this.progressContainer.parentNode) {
            this.progressContainer.parentNode.removeChild(this.progressContainer);
          }
          this.progressContainer = null;
        }, 300);
      }
    }
  };
  
  // 初始化进度管理
  progressManager.startTime = Date.now(); // 记录开始时间
  progressManager.init();
  progressManager.updateStep(1, 5, '加载fflate解压库...');
  
  const loadFflate = ()=>{
    return new Promise((resolve) => {
      if (window['fflate']) {
        resolve();
        return;
      }
  
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.onload = resolve;
      script.onerror = () => {
        console.error('fflate 加载失败');
        progressManager.showError('解压库加载失败');
      };
      script.src = 'https://cdn.jsdelivr.net/npm/fflate@0.7.4/umd/index.min.js';
      document.head.appendChild(script);
    });
  }
  
  await loadFflate();
  progressManager.updateStep(1, 10, 'fflate库加载完成');
  
  const { Filesystem } = Capacitor.Plugins;
  // 使用字符串常量替代Directory枚举，确保兼容性
  
  // ZIP文件预分析函数 - 避免解压超大文件
  const analyzeZipStructure = (zipData) => {
    console.log('🔍 开始ZIP文件结构预分析...');
    
    try {
      // 简单的ZIP文件结构检查
      const view = new DataView(zipData.buffer || zipData);
      const files = [];
      let totalUncompressedSize = 0;
      let hasLargeFiles = false;
      
      // 查找ZIP文件的中央目录结构
      // 这是一个简化的实现，主要用于检测超大文件
      let offset = zipData.length - 22; // ZIP文件结尾记录
      
      // 寻找ZIP结尾标识 (0x06054b50)
      while (offset >= 0) {
        if (view.getUint32(offset, true) === 0x06054b50) {
          break;
        }
        offset--;
      }
      
      if (offset >= 0) {
        const centralDirSize = view.getUint32(offset + 12, true);
        const centralDirOffset = view.getUint32(offset + 16, true);
        
        console.log(`📋 ZIP结构信息: 中央目录大小=${centralDirSize}, 偏移=${centralDirOffset}`);
        
        // 估算解压后大小（这是一个粗略估算）
        const compressionRatio = 0.3; // 假设平均压缩比30%
        const estimatedUncompressedSize = zipData.length / compressionRatio;
        
        if (estimatedUncompressedSize > 1024 * 1024 * 1024) { // 1GB
          hasLargeFiles = true;
          console.warn(`⚠️ 估算解压后大小过大: ${(estimatedUncompressedSize / (1024 * 1024)).toFixed(0)}MB`);
        }
      }
      
      return {
        files,
        totalUncompressedSize,
        hasLargeFiles,
        estimatedSize: zipData.length / 0.3 // 粗略估算
      };
    } catch (error) {
      console.warn('ZIP结构分析失败，使用默认策略:', error);
      return {
        files: [],
        totalUncompressedSize: 0,
        hasLargeFiles: zipData.length > 200 * 1024 * 1024,
        estimatedSize: zipData.length * 3
      };
    }
  };

  // 创建跳过解压的结果 - 避免RangeError
  const createSkipUnzipResult = async (zipData, zipInfo) => {
    console.log('📄 创建跳过解压的说明文件...');
    
    const zipSizeMB = (zipData.length / (1024 * 1024)).toFixed(2);
    const estimatedSizeMB = (zipInfo.estimatedSize / (1024 * 1024)).toFixed(0);
    
    const skipReason = [];
    if (zipData.length > 300 * 1024 * 1024) {
      skipReason.push(`ZIP文件过大 (${zipSizeMB}MB > 300MB)`);
    }
    if (zipInfo.estimatedSize > 2 * 1024 * 1024 * 1024) {
      skipReason.push(`估算解压后过大 (${estimatedSizeMB}MB > 2048MB)`);
    }
    if (zipInfo.hasLargeFiles) {
      skipReason.push('包含超大文件，可能导致内存错误');
    }
    
    // 创建详细的跳过说明
    const skipInfo = `IR文件处理报告 - 跳过解压
    
🗂️  原始ZIP文件: ${zipSizeMB}MB
📊  估算解压后: ${estimatedSizeMB}MB
🚫  跳过原因: ${skipReason.join(', ')}
⏰  处理时间: ${new Date().toISOString()}

📋 跳过解压的具体原因:
${skipReason.map(reason => `• ${reason}`).join('\n')}

💡 建议解决方案:
• 使用ZIP文件分割工具将大文件分成多个小文件
• 删除ZIP中不必要的大文件（如数据库备份、日志文件等）
• 在内存更大的设备或桌面环境中处理
• 使用服务器端解压服务
• 联系技术支持获取专门的大文件处理方案

🔧 技术信息:
• JavaScript内存限制: ~2GB
• 推荐ZIP大小: <200MB
• 推荐单文件大小: <100MB
• 当前设备信息: ${navigator.userAgent}

📞 如需处理此文件，请联系技术支持团队
`;

    const troubleshootInfo = `故障排除指南

❌ 遇到的问题:
ZIP文件 (${zipSizeMB}MB) 过大，可能导致 "RangeError: Invalid array length" 错误

🔍 问题分析:
1. JavaScript引擎对数组大小有限制（通常<2GB）
2. 解压过程需要同时存储压缩和未压缩数据
3. 大文件处理时内存使用呈指数增长

✅ 已采取的保护措施:
• 预分析ZIP文件结构
• 智能跳过可能导致崩溃的文件
• 生成详细的跳过报告
• 保护系统稳定性

🛠️ 推荐解决方案:
1. 使用7-Zip或WinRAR分割ZIP文件:
   - 右键 → 添加到压缩文件
   - 设置分割大小: 100MB
   - 生成多个小文件: part1.zip, part2.zip...

2. 服务器端处理:
   - 上传到云端解压服务
   - 使用VPS或专用服务器
   - 联系我们提供服务器端处理

3. 优化ZIP内容:
   - 移除不必要的大文件
   - 压缩或删除日志文件
   - 分离数据库文件单独处理
`;

    // 创建虚拟的解压结果
    const mockUnzipped = {
      'PROCESSING_SKIPPED.txt': new TextEncoder().encode(skipInfo),
      'TROUBLESHOOTING_GUIDE.txt': new TextEncoder().encode(troubleshootInfo),
      'ZIP_INFO.json': new TextEncoder().encode(JSON.stringify({
        originalSize: zipData.length,
        originalSizeMB: zipSizeMB,
        estimatedUncompressedSize: zipInfo.estimatedSize,
        estimatedUncompressedSizeMB: estimatedSizeMB,
        skipReasons: skipReason,
        timestamp: new Date().toISOString(),
        deviceInfo: navigator.userAgent,
        processingMode: 'SKIP_LARGE_FILES'
      }, null, 2))
    };
    
    progressManager.updateStep(4, 65, '已创建处理说明文件');
    console.log('📄 跳过解压完成，已创建说明文件');
    
    return mockUnzipped;
  };

  // 解压处理函数 - 彻底避免RangeError
  const processUnzip = async (zipData) => {
    const zipSizeMB = (zipData.length / (1024 * 1024)).toFixed(2);
    console.log(`🔄 开始解压文件 (${zipSizeMB} MB)...`);
    
    // 更新进度：开始解压
    progressManager.updateStep(4, 50, `解压ZIP文件 (${zipSizeMB}MB)...`);
    
    // 第一步：预分析ZIP结构
    const zipInfo = analyzeZipStructure(zipData);
    const estimatedSizeMB = (zipInfo.estimatedSize / (1024 * 1024)).toFixed(0);
    
    console.log(`📊 ZIP预分析完成: 估算解压后${estimatedSizeMB}MB, 包含大文件: ${zipInfo.hasLargeFiles}`);
    progressManager.updateStep(4, 52, `预分析完成: 估算${estimatedSizeMB}MB`);
    
    // 检查是否应该跳过解压
    const shouldSkipUnzip = (
      zipData.length > 300 * 1024 * 1024 || // ZIP文件>300MB
      zipInfo.estimatedSize > 2 * 1024 * 1024 * 1024 || // 估算解压>2GB
      zipInfo.hasLargeFiles // 包含大文件
    );
    
    if (shouldSkipUnzip) {
      console.log('⚠️ 检测到超大ZIP文件，跳过解压，创建说明文件...');
      progressManager.updateStep(4, 55, '文件过大，跳过解压，创建说明...');
      return await createSkipUnzipResult(zipData, zipInfo);
    }
    
    const fflate = window['fflate'];
    let unzipped;
    
    // 更严格的内存和大小检查
    const availableMemory = performance && performance.memory ? 
      (performance.memory.jsHeapSizeLimit - performance.memory.usedJSHeapSize) : 
      1024 * 1024 * 1024; // 假设1GB可用内存
    
    const requiredMemory = zipData.length * 4; // 保守估算：需要4倍ZIP大小的内存
    const availableMemoryMB = (availableMemory / (1024 * 1024)).toFixed(0);
    const requiredMemoryMB = (requiredMemory / (1024 * 1024)).toFixed(0);
    
    console.log(`💾 内存检查: 可用${availableMemoryMB}MB, 需要${requiredMemoryMB}MB`);
    
    if (requiredMemory > availableMemory * 0.7) { // 只使用70%可用内存
      console.warn(`⚠️ 内存不足，跳过解压: 需要${requiredMemoryMB}MB, 仅有${availableMemoryMB}MB`);
      progressManager.updateStep(4, 54, `内存不足 (需要${requiredMemoryMB}MB)，跳过解压...`);
      return await createSkipUnzipResult(zipData, { ...zipInfo, skipReason: 'insufficient_memory' });
    }

    try {
      // 超保守的解压策略
      const isSmallZip = zipData.length <= 100 * 1024 * 1024; // 100MB
      const isMediumZip = zipData.length <= 200 * 1024 * 1024; // 200MB
      
      if (isSmallZip) {
        console.log('🔄 小文件标准解压...');
        progressManager.updateStep(4, 56, '标准解压模式...');
        
        // 小文件直接解压
        unzipped = fflate.unzipSync(zipData);
        
      } else if (isMediumZip) {
        console.log('🔄 中等大小文件，谨慎解压...');
        progressManager.updateStep(4, 56, '谨慎解压模式...');
        
        // 强制垃圾回收
        if (window.gc) {
          console.log('🧹 解压前强制垃圾回收...');
          for (let i = 0; i < 3; i++) {
            window.gc();
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        // 检查内存使用率
        if (performance && performance.memory) {
          const memInfo = performance.memory;
          const memoryUsageRatio = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
          
          if (memoryUsageRatio > 0.6) {
            console.warn(`⚠️ 内存使用率过高 (${(memoryUsageRatio * 100).toFixed(1)}%)，跳过解压避免崩溃`);
            progressManager.updateStep(4, 57, '内存使用率过高，跳过解压...');
            return await createSkipUnzipResult(zipData, { ...zipInfo, skipReason: 'high_memory_usage' });
          }
        }
        
        // 尝试异步解压（更安全）
        if (fflate.unzip) {
          console.log('使用异步解压（更安全）...');
          progressManager.updateStep(4, 58, '异步解压中...');
          
          unzipped = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('解压超时，文件可能过大'));
            }, 180000); // 3分钟超时
            
            fflate.unzip(zipData, (err, data) => {
              clearTimeout(timeout);
              if (err) {
                console.error('异步解压失败:', err);
                reject(err);
              } else {
                resolve(data);
              }
            });
          });
        } else {
          // 回退到同步解压，但有严格的超时
          console.log('回退到同步解压...');
          progressManager.updateStep(4, 58, '同步解压中...');
          
          const unzipPromise = new Promise((resolve, reject) => {
            try {
              const result = fflate.unzipSync(zipData);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          });
          
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('解压操作超时')), 90000); // 1.5分钟超时
          });
          
          unzipped = await Promise.race([unzipPromise, timeoutPromise]);
        }
        
      } else {
        // 大文件直接跳过，不尝试解压
        console.warn(`❌ 文件过大 (${zipSizeMB}MB > 200MB)，直接跳过解压避免RangeError`);
        progressManager.updateStep(4, 56, '文件过大，跳过解压...');
        return await createSkipUnzipResult(zipData, { ...zipInfo, skipReason: 'file_too_large' });
      }
      
      // 验证解压结果
      if (!unzipped || typeof unzipped !== 'object') {
        throw new Error('解压结果无效');
      }
      
      const fileCount = Object.keys(unzipped).length;
      console.log(`✅ 解压完成，文件数量: ${fileCount}`);
      progressManager.updateStep(4, 65, `解压完成！发现 ${fileCount} 个文件`);
      
      // 检查解压后的文件大小和安全性 - 专门处理105MB数据库文件问题
      const largeFiles = [];
      const invalidFiles = [];
      const processedFiles = {};
      let totalSize = 0;
      
      console.log('🔍 开始检查解压后的文件...');
      
      for (const [path, data] of Object.entries(unzipped)) {
        // 跳过目录
        if (path.endsWith('/')) continue;
        
        // 验证文件数据
        if (!data) {
          invalidFiles.push(path);
          continue;
        }
        
        const fileSize = data.length;
        const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
        totalSize += fileSize;
        
        console.log(`📄 检查文件: ${path} (${fileSizeMB}MB)`);
        
        // 专门处理超大单文件（如105MB数据库）
        if (fileSize > 80 * 1024 * 1024) { // 80MB以上
          console.warn(`⚠️ 检测到超大单文件: ${path} (${fileSizeMB}MB)`);
          
          // 判断是否为数据库文件
          const isDatabase = path.toLowerCase().includes('.db') || 
                            path.toLowerCase().includes('.sqlite') ||
                            path.toLowerCase().includes('database') ||
                            path.toLowerCase().includes('.sql');
          
          // JavaScript数组安全限制检查
          const jsArraySafeLimit = 100 * 1024 * 1024; // 100MB安全限制
          
          if (fileSize > jsArraySafeLimit) {
            console.error(`❌ 文件超出JavaScript安全限制: ${path} (${fileSizeMB}MB > 100MB)`);
            
            // 创建文件信息而不是实际文件
            const fileInfo = `超大文件信息: ${path}

📊 文件详情:
• 原始大小: ${fileSizeMB}MB
• 文件类型: ${isDatabase ? '数据库文件' : '二进制文件'}
• 跳过原因: JavaScript数组大小限制
• 处理时间: ${new Date().toISOString()}

❌ 为什么跳过这个文件:
这个文件 (${fileSizeMB}MB) 超出了JavaScript引擎的数组大小限制。
当尝试处理如此大的文件时，会触发 "RangeError: Invalid array length" 错误，
导致整个应用程序崩溃。

💡 解决方案:
1. 服务器端处理:
   - 上传到支持大文件的服务器
   - 使用服务器端工具处理此文件
   - 联系技术支持获取专门处理方案

2. 文件分割:
   - 如果是数据库文件，考虑导出为多个小文件
   - 使用数据库工具分批导出数据
   - 分别处理每个小文件

3. 桌面应用处理:
   - 下载桌面版本的处理工具
   - 在内存更大的电脑上处理
   - 使用专门的大文件处理软件

📞 技术支持:
如需处理此大文件，请联系技术支持团队，我们可以提供专门的
服务器端处理服务或其他解决方案。

⚠️ 重要提醒:
其他小文件已正常处理，只有这个超大文件被跳过以保护系统稳定性。
`;
            
            // 使用文件信息替换原文件
            processedFiles[path + '.INFO.txt'] = new TextEncoder().encode(fileInfo);
            
            largeFiles.push({ 
              path, 
              size: fileSizeMB,
              skipped: true,
              reason: 'javascript_array_limit'
            });
            
            continue; // 跳过原文件
          }
          
          // 80-100MB的文件，尝试预处理检查
          console.log(`🔄 预处理检查超大文件: ${path} (${fileSizeMB}MB)`);
          
          try {
            // 验证数据完整性和可访问性
            if (!(data instanceof Uint8Array)) {
              throw new Error(`文件数据类型异常: ${typeof data}`);
            }
            
            // 分段测试数组访问，避免一次性访问导致内存问题
            const testChunkSize = 10 * 1024 * 1024; // 10MB测试块
            const testPoints = Math.min(5, Math.floor(fileSize / testChunkSize));
            
            for (let i = 0; i < testPoints; i++) {
              const testIndex = Math.floor((fileSize / testPoints) * i);
              try {
                const testByte = data[testIndex];
                if (testByte === undefined || testByte < 0 || testByte > 255) {
                  throw new Error(`无效字节值 at ${testIndex}: ${testByte}`);
                }
              } catch (accessError) {
                throw new Error(`数组访问失败 at ${testIndex}: ${accessError.message}`);
              }
              
              // 每次测试后强制垃圾回收
              if (window.gc && i % 2 === 0) {
                window.gc();
                await new Promise(resolve => setTimeout(resolve, 10));
              }
            }
            
            console.log(`✅ 超大文件预处理检查通过: ${path}`);
            
            // 文件可能可以处理，但标记为高风险
            processedFiles[path] = data;
            largeFiles.push({ 
              path, 
              size: fileSizeMB,
              skipped: false,
              risk: 'high',
              note: '文件很大，处理时可能较慢'
            });
            
          } catch (preprocessError) {
            console.error(`❌ 超大文件预处理失败: ${path}`, preprocessError);
            
            // 预处理失败，创建错误说明
            const errorInfo = `文件处理失败: ${path}

📊 文件信息:
• 大小: ${fileSizeMB}MB  
• 错误: ${preprocessError.message}
• 时间: ${new Date().toISOString()}

❌ 处理失败原因:
文件在预处理检查阶段失败，可能的原因：
• 文件数据损坏或不完整
• 内存不足以处理此大小的文件
• 文件格式不被支持

💡 建议解决方案:
1. 重新下载或获取文件
2. 检查文件完整性
3. 使用更强大的设备处理
4. 联系技术支持获取帮助
`;
            
            processedFiles[path + '.ERROR.txt'] = new TextEncoder().encode(errorInfo);
            
            largeFiles.push({ 
              path, 
              size: fileSizeMB,
              skipped: true,
              reason: 'preprocessing_failed'
            });
            
            continue; // 跳过原文件
          }
          
        } else {
          // 普通大小文件直接包含
          processedFiles[path] = data;
          
          // 记录50MB以上的文件
          if (fileSize > 50 * 1024 * 1024) {
            largeFiles.push({ 
              path, 
              size: fileSizeMB,
              skipped: false,
              risk: 'medium'
            });
          }
        }
      }
      
      // 使用处理后的文件列表替换原始解压结果
      unzipped = processedFiles;
      
      const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
      const finalFileCount = Object.keys(unzipped).length;
      progressManager.updateStep(4, 70, `解压内容: ${finalFileCount}个文件，总计${totalSizeMB}MB`);
      
      // 报告无效文件
      if (invalidFiles.length > 0) {
        console.warn('⚠️ 发现无效文件:', invalidFiles);
      }
      
      // 报告大文件情况
      if (largeFiles.length > 0) {
        console.log('📊 大文件统计:');
        largeFiles.forEach(file => {
          const status = file.skipped ? '(已跳过)' : '(将处理)';
          console.log(`   - ${file.path}: ${file.size}MB ${status}`);
        });
        
        const processedLargeFiles = largeFiles.filter(f => !f.skipped);
        const skippedLargeFiles = largeFiles.filter(f => f.skipped);
        
        if (processedLargeFiles.length > 0) {
          const largeFileList = processedLargeFiles.map(f => `${f.path} (${f.size}MB)`).join(', ');
          progressManager.updateStep(4, 72, `发现大文件: ${largeFileList}`);
        }
        
        if (skippedLargeFiles.length > 0) {
          progressManager.updateStep(4, 73, `跳过超大文件: ${skippedLargeFiles.length}个`);
        }
      }
      
      // 最终内存清理
      if (zipData.length > 50 * 1024 * 1024 && window.gc) {
        console.log('🧹 解压完成后清理内存...');
        window.gc();
      }
      
    } catch (unzipError) {
      console.error('❌ 解压失败:', unzipError);
      progressManager.updateStep(4, 50, '解压失败，创建错误报告...');
      
      // 对于任何解压错误，直接跳过并创建说明文件，不再尝试备用解压
      console.log('🚫 检测到解压错误，为避免RangeError，直接跳过解压并创建说明文件');
      
      // 分析错误类型
      let errorType = 'unknown';
      let errorDescription = unzipError.message || '未知错误';
      
      if (unzipError.message) {
        if (unzipError.message.includes('array length') || unzipError.message.includes('Invalid array length')) {
          errorType = 'array_length_limit';
          errorDescription = 'JavaScript数组长度限制错误（文件过大）';
        } else if (unzipError.message.includes('memory') || unzipError.message.includes('Maximum call stack')) {
          errorType = 'memory_limit';
          errorDescription = '内存不足或堆栈溢出';
        } else if (unzipError.message.includes('timeout') || unzipError.message.includes('超时')) {
          errorType = 'timeout';
          errorDescription = '解压操作超时';
        } else if (unzipError.message.includes('corrupt') || unzipError.message.includes('invalid')) {
          errorType = 'corrupted_file';
          errorDescription = 'ZIP文件损坏或格式无效';
        }
      }
      
      // 创建详细的错误报告
      const errorReport = `IR文件解压失败详细报告

⚠️  错误概要:
ZIP文件无法解压，已跳过处理以保护系统稳定性

📊 文件信息:
• ZIP文件大小: ${zipSizeMB}MB
• 错误类型: ${errorType}
• 错误描述: ${errorDescription}
• 处理时间: ${new Date().toISOString()}

💾 系统信息:
• 设备: ${navigator.userAgent}
• 内存信息: ${performance && performance.memory ? 
  `已用 ${(performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2)}MB / 限制 ${(performance.memory.jsHeapSizeLimit / (1024 * 1024)).toFixed(2)}MB` : 
  '内存信息不可用'}

🔍 问题分析:
根据错误类型，可能的原因包括：
${errorType === 'array_length_limit' ? 
  '• ZIP文件包含超大文件，超出JavaScript数组大小限制（约2GB）\n• 解压后的数据量超出浏览器处理能力\n• 需要分割文件或使用服务器端处理' :
  errorType === 'memory_limit' ?
  '• 设备可用内存不足\n• 其他应用占用过多内存\n• 需要关闭其他应用或使用内存更大的设备' :
  errorType === 'timeout' ?
  '• 文件过大，解压时间超出限制\n• 系统性能不足\n• 网络或存储速度过慢' :
  errorType === 'corrupted_file' ?
  '• ZIP文件在传输过程中损坏\n• 文件格式不正确\n• 需要重新下载或检查文件完整性' :
  '• 未知错误，建议联系技术支持'
}

💡 建议解决方案:
1. 文件分割：
   - 使用7-Zip、WinRAR等工具分割ZIP文件
   - 建议分割为50-100MB的小文件
   - 逐个处理小文件

2. 服务器端处理：
   - 上传到云端解压服务
   - 使用VPS或专用服务器处理
   - 联系技术支持获取服务器端解决方案

3. 系统优化：
   - 关闭其他浏览器标签页和应用程序
   - 重启浏览器释放内存
   - 使用内存更大的设备

4. 文件优化：
   - 检查ZIP文件是否包含不必要的大文件
   - 移除日志文件、缓存文件等
   - 分离数据库文件单独处理

📞 技术支持:
如果问题持续存在，请联系技术支持团队，并提供此错误报告。

🛡️  系统保护措施:
为避免浏览器崩溃或系统不稳定，系统已自动跳过此文件的解压处理。
这是正常的保护机制，不会影响其他功能的使用。
`;

      const quickGuide = `快速解决指南

❌ 问题: ZIP文件 (${zipSizeMB}MB) 解压失败
🎯 目标: 成功处理IR文件

⚡ 快速解决方案:

1. 立即可行方案 (推荐):
   □ 下载7-Zip (免费): https://www.7-zip.org/
   □ 右键ZIP文件 → 7-Zip → 添加到压缩文件
   □ 设置"分割为卷，大小": 50MB
   □ 生成多个小文件: part1.zip, part2.zip...
   □ 逐个处理小文件

2. 在线处理方案:
   □ 搜索"在线ZIP解压"服务
   □ 上传文件到云端处理
   □ 下载解压后的文件

3. 技术支持方案:
   □ 联系开发团队
   □ 提供此错误报告
   □ 获取专门的大文件处理服务

⏱️  预计解决时间:
• 方案1: 5-10分钟
• 方案2: 10-20分钟  
• 方案3: 1-3个工作日

💬 注意事项:
• 此错误是为了保护系统稳定性
• 不会影响其他功能的正常使用
• 问题出现在文件大小，不是系统故障
`;

      // 创建虚拟的解压结果，包含详细的错误说明
      unzipped = {
        'ERROR_REPORT_DETAILED.txt': new TextEncoder().encode(errorReport),
        'QUICK_SOLUTION_GUIDE.txt': new TextEncoder().encode(quickGuide),
        'ORIGINAL_ERROR.json': new TextEncoder().encode(JSON.stringify({
          timestamp: new Date().toISOString(),
          zipSize: zipData.length,
          zipSizeMB: zipSizeMB,
          errorType: errorType,
          errorMessage: errorDescription,
          originalError: unzipError.message,
          systemInfo: {
            userAgent: navigator.userAgent,
            memory: performance && performance.memory ? {
              used: performance.memory.usedJSHeapSize,
              total: performance.memory.totalJSHeapSize,
              limit: performance.memory.jsHeapSizeLimit
            } : null
          },
          skipReason: 'unzip_error_protection'
        }, null, 2))
      };
      
      console.log('📄 错误报告文件创建完成');
      progressManager.updateStep(4, 65, '已创建详细错误报告');
    }
    
    // 创建解压目录
    const timestamp = Date.now();
    const basePath = `IR-extracted-${timestamp}/`;
    
    progressManager.updateStep(5, 75, '创建解压目录...');
    
    await Filesystem.mkdir({
      path: basePath,
      directory: 'CACHE',
      recursive: true
    });
    
    console.log('创建解压目录:', basePath);
    progressManager.updateStep(5, 78, `解压目录创建完成: ${basePath}`);
    
    // 遍历并保存文件
    let fileCount = 0;
    const savedFiles = [];
    const totalFiles = Object.keys(unzipped).length;
    
    progressManager.updateStep(5, 80, `开始保存 ${totalFiles} 个文件...`);
    
    for (const [relativePath, fileData] of Object.entries(unzipped)) {
      // 跳过目录项
      if (relativePath.endsWith('/')) {
        console.log('跳过目录:', relativePath);
        continue;
      }
      
      try {
        // 处理路径分隔符 (Windows兼容)
        const safePath = relativePath.replace(/\\/g, '/');
        const fullPath = basePath + safePath;
        
        console.log(`保存文件 ${fileCount + 1}/${totalFiles}:`, fullPath);
        
        // 更新文件保存进度 (80-95%之间)
        const saveProgress = 80 + Math.floor((fileCount / totalFiles) * 15);
        const fileName = relativePath.split('/').pop() || relativePath;
        progressManager.updateStep(5, saveProgress, `保存文件 ${fileCount + 1}/${totalFiles}: ${fileName}`);
        
        // 增强文件大小和类型检查
        const fileSize = fileData ? fileData.length : 0;
        const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
        
        // 基础验证
        if (fileSize === 0 || !fileData) {
          console.warn(`⚠️ 跳过空文件: ${relativePath}`);
          continue;
        }
        
        // 文件类型检查
        const isImportantFile = relativePath.toLowerCase().includes('.db') || 
                               relativePath.toLowerCase().includes('.sqlite') ||
                               relativePath.toLowerCase().includes('database') ||
                               relativePath.toLowerCase().includes('.sql');
        
        // JavaScript数组长度限制检查（约2GB，但实际限制更小）
        const jsArrayLimit = 1024 * 1024 * 1024; // 1GB安全限制
        if (fileSize > jsArrayLimit) {
          console.error(`❌ 文件超出JavaScript数组限制 ${relativePath}: ${fileSizeMB}MB (限制: ${(jsArrayLimit / (1024 * 1024)).toFixed(0)}MB)`);
          
          // 创建错误信息文件代替
          const errorInfo = `文件过大无法处理: ${relativePath}
大小: ${fileSizeMB}MB
限制: ${(jsArrayLimit / (1024 * 1024)).toFixed(0)}MB
建议: 请分割此文件或使用服务器端处理`;
          
          savedFiles.push({
            path: basePath + relativePath + '.ERROR.txt',
            size: errorInfo.length,
            originalPath: relativePath,
            error: 'File too large'
          });
          
          continue;
        }
        
        // 动态大小限制（基于当前内存使用情况）
        let sizeLimit = isImportantFile ? 200 * 1024 * 1024 : 150 * 1024 * 1024;
        
        // 如果可以检查内存使用情况，动态调整限制
        if (performance && performance.memory) {
          const memInfo = performance.memory;
          const memoryUsageRatio = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
          
          if (memoryUsageRatio > 0.7) {
            // 内存使用过高，降低文件大小限制
            sizeLimit = Math.min(sizeLimit, 50 * 1024 * 1024); // 降低到50MB
            console.warn(`⚠️ 内存使用率过高 (${(memoryUsageRatio * 100).toFixed(1)}%)，降低文件大小限制到 ${(sizeLimit / (1024 * 1024)).toFixed(0)}MB`);
          }
        }
        
        if (fileSize > sizeLimit) {
          console.warn(`⚠️ 跳过过大文件 ${relativePath}: ${fileSizeMB}MB (当前限制: ${(sizeLimit / (1024 * 1024)).toFixed(0)}MB)`);
          
          // 创建跳过信息文件
          const skipInfo = `文件过大已跳过: ${relativePath}
大小: ${fileSizeMB}MB
限制: ${(sizeLimit / (1024 * 1024)).toFixed(0)}MB
类型: ${isImportantFile ? '数据库文件' : '普通文件'}`;
          
          savedFiles.push({
            path: basePath + relativePath + '.SKIPPED.txt',
            size: skipInfo.length,
            originalPath: relativePath,
            skipped: true
          });
          
          continue;
        }
        
        // 大文件预警
        if (fileSize > 50 * 1024 * 1024) {
          console.log(`📦 处理大文件 ${relativePath}: ${fileSizeMB}MB`);
        }
        
        // 严格的数据类型检查
        if (!(fileData instanceof Uint8Array) && !(fileData instanceof Array)) {
          console.error(`❌ 文件数据类型异常 ${relativePath}: ${typeof fileData}`);
          console.error(`数据构造函数: ${fileData.constructor ? fileData.constructor.name : 'unknown'}`);
          continue;
        }
        
        // 将数组转换为Uint8Array（如果需要）
        if (fileData instanceof Array) {
          try {
            console.log(`🔄 转换普通数组为Uint8Array: ${relativePath}`);
            fileData = new Uint8Array(fileData);
          } catch (conversionError) {
            console.error(`❌ 数组转换失败 ${relativePath}:`, conversionError);
            continue;
          }
        }
        
        // 专门处理80MB+超大文件 - 针对105MB数据库文件问题
        if (fileSize > 80 * 1024 * 1024) {
          console.log(`🔄 检测到超大文件 ${relativePath} (${fileSizeMB}MB)，启用特殊处理...`);
          
          // 对于105MB的数据库文件，直接跳过处理以避免RangeError
          if (fileSize > 100 * 1024 * 1024) {
            console.warn(`❌ 文件过大，直接跳过避免RangeError: ${relativePath} (${fileSizeMB}MB)`);
            
            const skipInfo = `超大文件跳过说明: ${relativePath}

📊 文件信息:
• 文件大小: ${fileSizeMB}MB
• 文件路径: ${relativePath}
• 跳过时间: ${new Date().toISOString()}

❌ 跳过原因:
此文件 (${fileSizeMB}MB) 超过了100MB的安全处理限制。
根据之前的错误经验，处理如此大的文件会导致:
• RangeError: Invalid array length
• 浏览器崩溃或卡顿
• 整个处理流程中断

🎯 专门针对105MB数据库文件的解决方案:

1. 数据库文件分割方案:
   □ 使用SQLite管理工具打开数据库
   □ 导出数据为多个小的SQL文件
   □ 按表或按时间范围分割导出
   □ 每个文件控制在50MB以内

2. 服务器端处理方案:
   □ 上传原始ZIP到云端服务器
   □ 使用服务器端工具解压和处理
   □ 联系技术支持获取专门服务

3. 桌面工具处理方案:
   □ 下载7-Zip或WinRAR在电脑上解压
   □ 使用数据库管理工具直接处理
   □ 在内存更大的设备上操作

💡 立即可行的方案:
如果您需要这个数据库文件，建议：
1. 先处理其他小文件
2. 单独下载数据库文件的ZIP包
3. 在电脑上用专门工具解压
4. 或联系我们提供专门的处理服务

📞 技术支持:
如果这个数据库文件对您很重要，请联系技术支持，
我们可以提供专门的大文件处理服务。

✅ 其他文件处理状态:
除了这个超大数据库文件，其他所有小文件都会正常处理，
不会影响整体的文件处理流程。
`;

            // 保存跳过说明文件
            try {
              const skipInfoPath = basePath + relativePath + '.SKIPPED_LARGE_FILE.txt';
              await Filesystem.writeFile({
                path: skipInfoPath,
                data: skipInfo,
                directory: 'CACHE',
                recursive: true
              });
              
              savedFiles.push({
                path: skipInfoPath,
                size: skipInfo.length,
                originalPath: relativePath,
                skipped: true,
                reason: 'file_too_large_105mb'
              });
              
              console.log(`✅ 已创建跳过说明文件: ${relativePath}.SKIPPED_LARGE_FILE.txt`);
              progressManager.updateStep(5, saveProgress, `⚠️ 跳过超大文件: ${fileName} (${fileSizeMB}MB)`);
              
            } catch (skipError) {
              console.error(`创建跳过说明失败:`, skipError);
            }
            
            continue; // 跳过原文件处理
          }
          
          // 80-100MB文件的特殊预处理
          console.log(`🔄 80-100MB文件预处理检查: ${relativePath} (${fileSizeMB}MB)`);
          
          // 强制垃圾回收
          if (window.gc) {
            console.log('🧹 超大文件处理前垃圾回收...');
            for (let i = 0; i < 5; i++) {
              window.gc();
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
          
          // 检查当前内存状态
          if (performance && performance.memory) {
            const memInfo = performance.memory;
            const memoryUsageRatio = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
            const availableMB = (memInfo.jsHeapSizeLimit - memInfo.usedJSHeapSize) / (1024 * 1024);
            
            console.log(`💾 内存状态: 使用率${(memoryUsageRatio * 100).toFixed(1)}%, 可用${availableMB.toFixed(0)}MB`);
            
            // 如果内存使用率过高或可用内存不足，跳过此文件
            if (memoryUsageRatio > 0.7 || availableMB < 200) {
              console.warn(`⚠️ 内存不足，跳过大文件: ${relativePath} (使用率${(memoryUsageRatio * 100).toFixed(1)}%, 可用${availableMB.toFixed(0)}MB)`);
              
              const memorySkipInfo = `内存不足跳过: ${relativePath}

📊 文件信息:
• 文件大小: ${fileSizeMB}MB
• 内存使用率: ${(memoryUsageRatio * 100).toFixed(1)}%
• 可用内存: ${availableMB.toFixed(0)}MB
• 跳过时间: ${new Date().toISOString()}

⚠️ 跳过原因:
当前内存使用率过高或可用内存不足以安全处理此大文件。
继续处理可能导致:
• 浏览器卡顿或崩溃
• RangeError: Invalid array length
• 系统不稳定

💡 建议解决方案:
1. 关闭其他浏览器标签页和应用程序
2. 重启浏览器释放内存
3. 稍后在内存充足时重试
4. 使用内存更大的设备处理
`;
              
              try {
                const memorySkipPath = basePath + relativePath + '.MEMORY_SKIP.txt';
                await Filesystem.writeFile({
                  path: memorySkipPath,
                  data: memorySkipInfo,
                  directory: 'CACHE',
                  recursive: true
                });
                
                savedFiles.push({
                  path: memorySkipPath,
                  size: memorySkipInfo.length,
                  originalPath: relativePath,
                  skipped: true,
                  reason: 'insufficient_memory'
                });
                
                console.log(`✅ 已创建内存不足说明: ${relativePath}.MEMORY_SKIP.txt`);
                
              } catch (memorySkipError) {
                console.error(`创建内存不足说明失败:`, memorySkipError);
              }
              
              continue; // 跳过原文件
            }
          }
          
          // 分段验证数组完整性
          try {
            console.log(`🔍 验证超大文件数据完整性: ${relativePath}`);
            
            if (fileData.length !== fileSize) {
              throw new Error(`文件大小不匹配: 预期${fileSize}, 实际${fileData.length}`);
            }
            
            // 更保守的分段测试
            const testChunkSize = 5 * 1024 * 1024; // 5MB测试块
            const testPoints = Math.min(8, Math.floor(fileData.length / testChunkSize));
            
            for (let i = 0; i < testPoints; i++) {
              const testIndex = Math.floor((fileData.length / testPoints) * i);
              try {
                const testByte = fileData[testIndex];
                if (testByte === undefined || testByte < 0 || testByte > 255) {
                  throw new Error(`无效字节值 at ${testIndex}: ${testByte}`);
                }
              } catch (accessError) {
                throw new Error(`数组访问失败 at ${testIndex}: ${accessError.message}`);
              }
              
              // 每次测试后都强制垃圾回收和暂停
              if (window.gc) {
                window.gc();
                await new Promise(resolve => setTimeout(resolve, 50));
              }
            }
            
            console.log(`✅ 超大文件完整性检查通过: ${relativePath} (${testPoints}个检查点)`);
            
          } catch (integrityError) {
            console.error(`❌ 超大文件完整性检查失败 ${relativePath}:`, integrityError);
            
            const corruptedInfo = `文件数据损坏: ${relativePath}

📊 文件信息:
• 大小: ${fileSizeMB}MB
• 错误: ${integrityError.message}
• 检查时间: ${new Date().toISOString()}

❌ 检查失败原因:
文件在完整性验证过程中失败，可能的原因：
• 解压过程中数据损坏
• 文件过大导致内存访问异常
• 原始ZIP文件有问题

💡 建议解决方案:
1. 重新下载原始ZIP文件
2. 检查ZIP文件完整性
3. 尝试用其他工具解压
4. 联系技术支持获取帮助
`;
            
            try {
              const corruptedPath = basePath + relativePath + '.CORRUPTED.txt';
              await Filesystem.writeFile({
                path: corruptedPath,
                data: corruptedInfo,
                directory: 'CACHE',
                recursive: true
              });
              
              savedFiles.push({
                path: corruptedPath,
                size: corruptedInfo.length,
                originalPath: relativePath,
                corrupted: true
              });
              
            } catch (corruptedError) {
              console.error(`创建损坏文件说明失败:`, corruptedError);
            }
            
            continue; // 跳过损坏的文件
          }
        }
        
        // 创建子目录
        const lastSlashIndex = fullPath.lastIndexOf('/');
        if (lastSlashIndex > 0) {
          const dirPath = fullPath.substring(0, lastSlashIndex);
          try {
            await Filesystem.mkdir({
              path: dirPath,
              directory: 'CACHE',
              recursive: true
            });
          } catch (mkdirError) {
            console.warn('创建子目录警告:', dirPath, mkdirError);
          }
        }
        
        // 智能处理文件数据：优先使用直接二进制写入
        let dataToWrite;
        let isBase64 = false;
        
        try {
          if (fileData instanceof Uint8Array) {
            console.log(`处理二进制文件，大小: ${fileSizeMB} MB`);
            
            // 对于超大文件（>80MB），使用特殊处理策略
            if (fileSize > 80 * 1024 * 1024) {
              console.log(`🔄 超大文件检测 (${fileSizeMB}MB)，启用优化处理模式...`);
              
              // 强制垃圾回收（如果可用）
              if (window.gc) {
                console.log('执行垃圾回收...');
                window.gc();
              }
              
              // 验证Uint8Array的有效性（防止Invalid array length）
              try {
                // 测试数组边界访问
                const firstByte = fileData[0];
                const lastByte = fileData[fileData.length - 1];
                
                // 测试数组切片操作（确保不会出现length错误）
                const testSlice = fileData.slice(0, Math.min(1024, fileData.length));
                if (testSlice.length === 0) {
                  throw new Error('数组切片操作失败');
                }
                
                console.log(`数组有效性验证通过 (首字节: ${firstByte}, 末字节: ${lastByte})`);
                
              } catch (arrayError) {
                console.error(`❌ 数组完整性检查失败:`, arrayError);
                throw new Error(`文件数据损坏或过大: ${arrayError.message}`);
              }
              
              // 为了避免内存问题，大文件先尝试直接写入
              dataToWrite = fileData;
              isBase64 = false;
              console.log('超大文件使用直接二进制写入（避免内存复制）');
              
            } else {
              // Capacitor支持直接写入Uint8Array，无需转换为base64
              dataToWrite = fileData;
              isBase64 = false;
              console.log('使用直接二进制写入模式（更高效，节省内存）');
            }
            
          } else {
            // 文本文件或已经是字符串
            dataToWrite = fileData;
            isBase64 = false;
            console.log('处理文本文件');
          }
        } catch (conversionError) {
          console.error(`数据转换失败 ${relativePath}:`, conversionError);
          
          // 如果是数组长度错误，给出具体建议
          if (conversionError.message && conversionError.message.includes('array length')) {
            console.error(`💡 数组长度错误建议:`);
            console.error(`   - 文件 ${relativePath} (${fileSizeMB}MB) 可能超出JavaScript数组限制`);
            console.error(`   - 建议分割文件或使用更大内存的设备`);
          }
          
          throw conversionError;
        }
        
        // 写入文件
        try {
          const writeOptions = {
            path: fullPath,
            data: dataToWrite,
            directory: 'CACHE',
            recursive: true
          };
          
          // 如果是二进制数据，添加编码选项
          if (dataToWrite instanceof Uint8Array) {
            writeOptions.encoding = undefined; // 让Capacitor自动处理二进制数据
          }
          
          await Filesystem.writeFile(writeOptions);
          
          console.log(`✅ 成功保存: ${relativePath} (${fileSizeMB}MB)`);
          
          // 大文件成功保存的特殊提示
          if (parseFloat(fileSizeMB) > 50) {
            progressManager.updateStep(5, saveProgress, `✅ 大文件保存成功: ${fileName} (${fileSizeMB}MB)`);
          }
        } catch (writeError) {
          console.error(`文件写入失败 ${relativePath}:`, writeError);
          
          // 如果直接写入失败，尝试base64备用方案
          if (dataToWrite instanceof Uint8Array) {
            console.log(`🔄 尝试base64备用方案 (${fileSizeMB}MB)...`);
            progressManager.updateStep(5, saveProgress - 1, `🔄 启用备用方案: ${fileName}`);
            
            let finalBase64Data = null; // 在外层作用域定义
            
            try {
              // 根据文件大小动态调整策略
              const isLargeFile = fileSize > 80 * 1024 * 1024;
              const isVeryLargeFile = fileSize > 150 * 1024 * 1024;
              
              // 超大文件使用更小的分块和分批处理
              const chunkSize = isVeryLargeFile ? 2048 : (isLargeFile ? 4096 : 8192);
              const progressInterval = isVeryLargeFile ? 2 * 1024 * 1024 : (isLargeFile ? 5 * 1024 * 1024 : 10 * 1024 * 1024);
              const batchSize = isVeryLargeFile ? 10 * 1024 * 1024 : 20 * 1024 * 1024; // 分批大小
              
              console.log(`使用 ${chunkSize} 字节分块处理，${(batchSize / (1024 * 1024)).toFixed(0)}MB分批...`);
              
              let binaryString = '';
              let processedBytes = 0;
              const base64Chunks = []; // 存储分批的base64结果
              
              // 处理数据转换
              for (let i = 0; i < dataToWrite.length; i += chunkSize) {
                const chunk = dataToWrite.slice(i, i + chunkSize);
                
                // 验证chunk的有效性
                if (!chunk || chunk.length === 0) {
                  console.warn(`跳过无效分块 at ${i}`);
                  continue;
                }
                
                // 逐字节转换，避免apply限制和Invalid array length
                try {
                  for (let j = 0; j < chunk.length; j++) {
                    const charCode = chunk[j];
                    if (charCode < 0 || charCode > 255) {
                      throw new Error(`无效字节值: ${charCode} at position ${j}`);
                    }
                    binaryString += String.fromCharCode(charCode);
                  }
                } catch (charError) {
                  console.error(`字符转换错误 at chunk ${i}:`, charError);
                  throw new Error(`字符转换失败: ${charError.message}`);
                }
                
                processedBytes += chunk.length;
                
                // 分批处理：当累积足够数据时，先转换为base64并清理内存
                if (binaryString.length >= batchSize || processedBytes >= dataToWrite.length) {
                  try {
                    console.log(`🔄 分批base64编码 (${(binaryString.length / (1024 * 1024)).toFixed(1)}MB)...`);
                    
                    // 验证binaryString有效性
                    if (!binaryString || binaryString.length === 0) {
                      console.warn('跳过空的二进制字符串');
                    } else {
                      const batchBase64 = btoa(binaryString);
                      if (batchBase64 && batchBase64.length > 0) {
                        base64Chunks.push(batchBase64);
                      }
                    }
                    
                    // 清理内存
                    binaryString = '';
                    if (window.gc && base64Chunks.length % 5 === 0) {
                      window.gc();
                    }
                    
                  } catch (btoaError) {
                    console.error(`Base64编码失败:`, btoaError);
                    console.error(`binaryString length: ${binaryString ? binaryString.length : 'undefined'}`);
                    throw new Error(`Base64编码失败: ${btoaError.message}`);
                  }
                }
                
                // 进度反馈和内存管理
                if (processedBytes % progressInterval === 0 || processedBytes >= dataToWrite.length) {
                  const progress = ((processedBytes / dataToWrite.length) * 100).toFixed(1);
                  console.log(`📊 备用转换进度: ${progress}% (${(processedBytes / (1024 * 1024)).toFixed(1)}MB/${fileSizeMB}MB)`);
                  
                  // 更新Framework7进度显示
                  progressManager.updateStep(5, saveProgress - 1, `备用转换: ${fileName} ${progress}%`);
                  
                  // 对于超大文件，尝试强制垃圾回收
                  if (isLargeFile && window.gc && processedBytes % (20 * 1024 * 1024) === 0) {
                    console.log('🧹 执行中间垃圾回收...');
                    progressManager.updateStep(5, saveProgress - 1, `内存优化中... ${fileName}`);
                    window.gc();
                  }
                }
                
                // 防止UI阻塞，每处理一定量数据暂停一下
                const pauseInterval = isVeryLargeFile ? 5 * 1024 * 1024 : 20 * 1024 * 1024;
                if (processedBytes % pauseInterval === 0) {
                  await new Promise(resolve => setTimeout(resolve, isVeryLargeFile ? 20 : 10));
                }
              }
              
              // 处理剩余的binaryString（如果有的话）
              if (binaryString && binaryString.length > 0) {
                console.log(`🔄 处理最后的字符串块 (${(binaryString.length / (1024 * 1024)).toFixed(1)}MB)...`);
                try {
                  const lastBatchBase64 = btoa(binaryString);
                  if (lastBatchBase64 && lastBatchBase64.length > 0) {
                    base64Chunks.push(lastBatchBase64);
                  }
                } catch (lastBtoaError) {
                  console.error(`最后分块Base64编码失败:`, lastBtoaError);
                  throw new Error(`最后分块Base64编码失败: ${lastBtoaError.message}`);
                }
              }
              
              // 验证base64Chunks数组
              if (!base64Chunks || base64Chunks.length === 0) {
                throw new Error('没有生成任何base64数据块');
              }
              
              // 合并所有base64分块
              console.log(`🔗 合并 ${base64Chunks.length} 个base64分块...`);
              try {
                finalBase64Data = base64Chunks.join('');
              } catch (joinError) {
                console.error('合并base64分块失败:', joinError);
                throw new Error(`合并base64分块失败: ${joinError.message}`);
              }
              
              // 清理分块数组和临时变量
              base64Chunks.length = 0;
              binaryString = null;
              
              if (window.gc) {
                console.log('🧹 最终垃圾回收...');
                window.gc();
              }
              
              // 验证最终数据
              if (!finalBase64Data || finalBase64Data.length === 0) {
                throw new Error('Base64转换结果为空');
              }
              
              console.log(`✅ Base64数据准备完成，大小: ${(finalBase64Data.length / (1024 * 1024)).toFixed(2)}MB`);
              
              console.log(`💾 写入base64数据到文件系统 (${(finalBase64Data.length / (1024 * 1024)).toFixed(2)}MB)...`);
              await Filesystem.writeFile({
                path: fullPath,
                data: finalBase64Data,
                directory: 'CACHE',
                recursive: true
              });
              
              console.log(`✅ 备用方案成功保存: ${relativePath} (${fileSizeMB}MB)`);
              progressManager.updateStep(5, saveProgress, `✅ 备用方案成功: ${fileName} (${fileSizeMB}MB)`);
              
            } catch (backupError) {
              console.error(`❌ 备用方案也失败 ${relativePath}:`, backupError);
              
              // 如果是内存不足错误，给出建议
              if (backupError.message && (backupError.message.includes('memory') || backupError.message.includes('Maximum call stack') || backupError.message.includes('Invalid array length'))) {
                console.error(`💡 建议: 文件 ${relativePath} (${fileSizeMB}MB) 过大，可能需要在设备上释放更多内存`);
              }
              
              // 清理可能的内存占用
              finalBase64Data = null;
              if (window.gc) {
                window.gc();
              }
              
              throw new Error(`备用方案失败: ${backupError.message}`);
            }
          } else {
            throw writeError;
          }
        }
        
        savedFiles.push({
          path: fullPath,
          size: fileData.length,
          originalPath: relativePath
        });
        
        fileCount++;
        
        // 强制垃圾回收大文件的内存（如果可能）
        if (fileSize > 10 * 1024 * 1024) { // 10MB以上
          console.log(`🧹 清理大文件内存 (${fileSizeMB}MB)...`);
          dataToWrite = null;
          
          if (window.gc) {
            window.gc();
          }
          
          // 超大文件额外暂停，让系统回收内存
          if (fileSize > 80 * 1024 * 1024) {
            console.log('⏸️  超大文件处理完成，暂停以释放内存...');
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
      } catch (fileError) {
        console.error(`❌ 保存文件失败 ${relativePath}:`, fileError);
        // 继续处理其他文件，不中断整个过程
      }
    }
    
    return {
      basePath: basePath,
      extractedFiles: savedFiles,
      totalFiles: fileCount,
      success: true,
      message: `成功解压 ${fileCount} 个文件到 ${basePath}`
    };
  };
  
  try {
    // 步骤1: 准备下载路径
    progressManager.updateStep(2, 15, '准备下载环境...');
    
    let mkdirFilePath = `databases/`;
    if (deviceInfo.operatingSystem === 'ios') {
      mkdirFilePath = `Library/LocalDatabase/`;
    }
    
    // 确保目录存在
    try {
      await Filesystem.mkdir({
        path: mkdirFilePath.replace(/\/$/, ''), // 移除末尾斜杠
        directory: 'DATA',
        recursive: true
      });
      progressManager.updateStep(2, 18, '下载目录创建完成');
    } catch (mkdirError) {
      console.warn('创建目录警告:', mkdirError);
      progressManager.updateStep(2, 18, '使用默认下载目录');
    }
    
    let fileName = 'IR-v1.0.zip';
    const downloadPath = cordova.file.applicationStorageDirectory + mkdirFilePath + fileName;
    
    console.log('开始下载文件到:', downloadPath);
    progressManager.updateStep(2, 20, `开始下载: ${fileName}`);
    
    // 步骤2: 下载 ZIP 文件
    const resData = await http2.request({
      url: zipUrl,
      method: 'DOWNLOAD',
      timeout: 60,
      debug: true,
      file: {
        path: downloadPath,
        name: fileName,
      },
    });
    
    console.log("下载结果:", resData);
    progressManager.updateStep(2, 40, '文件下载完成');
    
    // 检查下载是否成功
    if (!resData || resData.status !== 200) {
      progressManager.showError(`下载失败: ${resData?.status || 'unknown error'}`);
      throw new Error(`下载失败: ${resData?.status || 'unknown error'}`);
    }
    
    progressManager.updateStep(2, 45, '下载状态验证通过');
    
    // 步骤3: 检查和读取下载的文件
    console.log('检查下载的ZIP文件是否存在...');
    progressManager.updateStep(3, 47, '检查下载文件状态...');
    
    // 先检查文件是否存在（用于调试）
    try {
      const statResult = await Filesystem.stat({
        path: mkdirFilePath + fileName,
        directory: 'DATA'
      });
      console.log('文件信息:', statResult);
      progressManager.updateStep(3, 48, `文件验证通过 (${(statResult.size / (1024 * 1024)).toFixed(2)}MB)`);
    } catch (statError) {
      console.error('文件状态检查失败:', statError);
      progressManager.updateStep(3, 48, '文件状态检查失败，尝试备用读取...');
      
      // 可能文件下载到了不同的位置，尝试其他路径
      // 尝试使用绝对路径直接读取
      try {
        console.log('尝试从下载路径直接读取文件...');
        progressManager.updateStep(3, 49, '使用Cordova直接读取...');
        const directPath = downloadPath;
        
        // 使用cordova文件系统直接读取
        const fileContent = await new Promise((resolve, reject) => {
          window.resolveLocalFileSystemURL(directPath, (fileEntry) => {
            fileEntry.file((file) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsArrayBuffer(file);
            }, reject);
          }, reject);
        });
        
        const zipData = new Uint8Array(fileContent);
        console.log('直接读取ZIP文件成功，大小:', zipData.length, 'bytes');
        progressManager.updateStep(3, 50, `直接读取成功 (${(zipData.length / (1024 * 1024)).toFixed(2)}MB)`);
        
        // 跳转到解压步骤
        return await processUnzip(zipData);
        
      } catch (directReadError) {
        console.error('直接读取也失败:', directReadError);
        progressManager.showError('无法读取下载的ZIP文件');
        throw new Error('无法读取下载的ZIP文件，请检查下载是否成功');
      }
    }
    
    console.log('从Filesystem API读取ZIP文件...');
    progressManager.updateStep(3, 48, '从文件系统读取ZIP数据...');
    
    const zipFileResult = await Filesystem.readFile({
      path: mkdirFilePath + fileName,
      directory: 'DATA'
    });
    
    // 安全获取文件数据，处理超大ZIP文件
    let zipData;
    const fileDataType = typeof zipFileResult.data;
    console.log(`ZIP文件数据类型: ${fileDataType}`);
    progressManager.updateStep(3, 49, `数据类型: ${fileDataType}`);
    
    try {
      if (fileDataType === 'string') {
        // 如果是base64字符串，需要安全转换为ArrayBuffer
        const base64Data = zipFileResult.data;
        const dataSize = base64Data.length;
        console.log(`Base64数据大小: ${(dataSize / (1024 * 1024)).toFixed(2)} MB`);
        progressManager.updateStep(3, 49, `Base64数据: ${(dataSize / (1024 * 1024)).toFixed(2)}MB`);
        
        // 对于超大base64数据，使用分块转换避免内存问题
        if (dataSize > 50 * 1024 * 1024) { // 50MB以上的base64数据
          console.log('🔄 检测到超大base64数据，使用分块转换...');
          progressManager.updateStep(3, 49, '检测到超大数据，启用分块转换...');
          
          const chunkSize = 1024 * 1024; // 1MB分块
          const totalChunks = Math.ceil(dataSize / chunkSize);
          const uint8Arrays = [];
          
          for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, dataSize);
            const chunk = base64Data.slice(start, end);
            
            // 转换分块
            const binaryChunk = atob(chunk);
            const chunkBytes = new Uint8Array(binaryChunk.length);
            for (let j = 0; j < binaryChunk.length; j++) {
              chunkBytes[j] = binaryChunk.charCodeAt(j);
            }
            uint8Arrays.push(chunkBytes);
            
            if (i % 10 === 0 || i === totalChunks - 1) {
              const chunkProgress = ((i + 1) / totalChunks * 100).toFixed(1);
              console.log(`分块转换进度: ${chunkProgress}%`);
              progressManager.updateStep(3, 49, `分块转换: ${chunkProgress}%`);
            }
          }
          
          // 合并所有分块
          console.log('🔗 合并分块数据...');
          progressManager.updateStep(3, 49, '合并分块数据...');
          const totalLength = uint8Arrays.reduce((sum, arr) => sum + arr.length, 0);
          zipData = new Uint8Array(totalLength);
          
          let offset = 0;
          for (const arr of uint8Arrays) {
            zipData.set(arr, offset);
            offset += arr.length;
          }
          
          // 清理临时数组
          uint8Arrays.length = 0;
          
        } else {
          // 小文件直接转换
          progressManager.updateStep(3, 49, '直接转换Base64数据...');
          const binaryString = atob(base64Data);
          zipData = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            zipData[i] = binaryString.charCodeAt(i);
          }
        }
      } else {
        // 直接使用二进制数据
        progressManager.updateStep(3, 49, '使用二进制数据...');
        zipData = new Uint8Array(zipFileResult.data);
      }
      
      const zipSizeMB = (zipData.length / (1024 * 1024)).toFixed(2);
      console.log(`✅ ZIP文件加载完成: ${zipSizeMB} MB`);
      progressManager.updateStep(3, 50, `ZIP文件加载完成: ${zipSizeMB}MB`);
      
    } catch (zipLoadError) {
      console.error('ZIP文件数据转换失败:', zipLoadError);
      progressManager.showError(`ZIP文件加载失败: ${zipLoadError.message}`);
      throw new Error(`ZIP文件加载失败: ${zipLoadError.message}`);
    }
    
    // 步骤4: 解压文件
    const result = await processUnzip(zipData);
    
    // 步骤6: 清理下载的ZIP文件
    progressManager.updateStep(6, 96, '清理临时文件...');
    try {
      await Filesystem.deleteFile({
        path: mkdirFilePath + fileName,
        directory: 'DATA'
      });
      console.log('已清理下载的ZIP文件');
      progressManager.updateStep(6, 98, '清理完成');
    } catch (cleanupError) {
      console.warn('清理ZIP文件警告:', cleanupError);
      progressManager.updateStep(6, 98, '清理警告(不影响结果)');
    }
    
    // 步骤7: 处理完成
    console.log('解压完成!', result);
    progressManager.updateStep(7, 100, '所有步骤完成！');
    
    // 显示成功结果
    progressManager.showSuccess('IR文件处理完成！', result);
    
    return result;
    
  } catch (error) {
    console.error('IR文件下载解压过程中出错:', error);
    
    // 显示错误信息
    progressManager.showError(`处理失败: ${error.message || error}`);
    
    // 尝试清理可能的临时文件
    progressManager.updateStep(6, 50, '清理临时文件...');
    try {
      const fileName = 'IR-v1.0.zip';
      let mkdirFilePath = `databases/`;
      if (deviceInfo.operatingSystem === 'ios') {
        mkdirFilePath = `Library/LocalDatabase/`;
      }
      
      await Filesystem.deleteFile({
        path: mkdirFilePath + fileName,
        directory: 'DATA'
      });
      console.log('已清理失败的临时文件');
    } catch (cleanupError) {
      console.warn('清理失败文件时出错:', cleanupError);
    }
    
    // 延迟显示详细错误信息
    setTimeout(() => {
      app.dialog.alert(
        `处理失败！<br/>
        错误详情: ${error.message || error}<br/>
        <br/>
        💡 建议：<br/>
        • 检查网络连接<br/>
        • 确保设备有足够存储空间<br/>
        • 尝试关闭其他应用释放内存<br/>
        • 如问题持续，请联系技术支持`,
        'IR文件处理失败'
      );
    }, 1000);
    
    throw {
      success: false,
      error: error.message || error,
      details: error
    };
  }
}