window.app_core_vue_component_map = {};
window.app_core_vue_component_map['YoButton'] = {
  template: `
  <component v-bind="$attrs" ref="btn" :is="tag">
    <slot></slot>
  </component>
  `,
  props: {
    tag: {
      type: String,
      default: 'button',
    },
  },
  mounted() {
    this.customClick(
      this.$refs.btn,
      () => {
        this.$emit('click');
      },
      0
    );
  },
  methods: {
    customClick(element, callback, timeThreshold) {
      let startTime;
      let isValidClick = false;
      let startX,
        startY = 0;

      function handleTouchStart(e) {
        startTime = Date.now();
        isValidClick = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;

        // 在阈值时间后，持续监听是否离开元素区域
        setTimeout(() => {
          element.addEventListener('touchmove', handleTouchMove);
        }, timeThreshold);
      }

      function handleTouchEnd(e) {
        // 清除 touchmove 监听器
        element.removeEventListener('touchmove', handleTouchMove);

        if (isValidClick && Date.now() - startTime >= timeThreshold) {
          callback(e);
        }
      }

      function handleTouchMove(e) {
        // 检查手指是否还在目标元素内
        // const touch = e.touches[0];
        // const rect = element.getBoundingClientRect();
        // if (touch.clientX < rect.left || touch.clientX > rect.right || touch.clientY < rect.top || touch.clientY > rect.bottom) {
        //   isValidClick = false;
        // }

        // 检查手指移动距离是否超过阈值
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const distance = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));

        if (distance > 8) {
          isValidClick = false;
        }
      }

      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchend', handleTouchEnd);
    },
  },
};

window.app_core_vue_component_map['Step'] = {
  template: `
  <div class="toolbar-box" style="padding: 0 15px;margin-top: 15px;">
    <div class="toolbar tabbar tabbar-scrollable" style="height: 60px;background:transparent;">
      <div class="toolbar-inner scene-toolbar-inner">
      <div class="progress display-flex">
        <ul class="display-flex">
          <li class="current">1</li>
          <li>2</li>
          <li>3</li>
          <li>4</li>
          <li>5</li>
        </ul>
      </div>
      </div>
    </div>
  </div>
  `,
  props: {
  },
  mounted() {
  },
  methods: {
  },
  style:/*css*/ `
  `,
};

window.app_core_vue_directive_map = {};
window.app_core_vue_directive_map['loading'] = (() => {
  const createMask = () => {
    const el = document.createElement('div');
    el.innerHTML = `
    <div 
      class="display-flex flex-direction-column align-items-center justify-content-center" 
      style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.2); z-index: 9999;"
    >
      <div class="preloader">
        <span class="preloader-inner">
          <svg viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16"></circle>
          </svg>
        </span>
      </div>
    </div>
    `;
    return el;
  };

  const toggleLoading = (el, binding) => {
    if (binding.value) {
      el.appendChild(el.mask);
    } else {
      el.removeChild(el.mask);
    }
  };

  return {
    bind: function (el, binding) {
      const mask = createMask();
      el.mask = mask;

      binding.value && toggleLoading(el, binding);
    },
    update: function (el, binding) {
      if (binding.oldValue !== binding.value) {
        toggleLoading(el, binding);
      }
    },
    unbind: function (el, binding) {
      el.removeChild(el.mask);
    },
  };
})();
