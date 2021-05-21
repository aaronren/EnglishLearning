// components/tipBar/tipBar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    message: {
      type: String,
      value: '---',
    },
    type: {
      type: String,
      value: 'primary',
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false,
    duration: 300,
    animation: null,
    ani_export: null,
    tip_count: 0
  },

  /**
   * 组件生命周期事件
   */
  lifetimes: {
    created() {
      this.data.animation = wx.createAnimation({
        duration: this.data.duration,
        timingFunction: 'ease',
        delay: 0
      });
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    show() {
      this.data.animation.translate(0, 32).step()
      this.setData({
        show: true,
        ani_export: this.data.animation.export()
      })
    },
    hide() {
      this.data.animation.translate(0, 0).step()
      this.setData({
        show: false,
        ani_export: this.data.animation.export()
      })
    },
    showTip() {
      this.data.tip_count = this.data.tip_count+1
      if (this.data.tip_count == 1 || this.data.tip_count == 3) {
        this.show()
        const self = this
        setTimeout(function () {
          self.hide()
        }, 3000)
      }
    },
    onTap(event) {
      // if (!this.data.show) {
      //   this.showTip()
      // }
    }
  }
})