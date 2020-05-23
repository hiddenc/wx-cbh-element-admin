<template>
  <div class="app-container" style="width: 600px;">
    <el-alert
      title="设置促销截止日期时间，如果已到达，将自动失效"
      type="warning"
    />
    <p>限时促销截止日期：</p>
    <el-date-picker
      v-model="value2"
      type="datetime"
      placeholder="选择日期时间"
      align="right"
      :picker-options="pickerOptions"
    />
    <el-button type="primary" @click="onSubmit">确认修改</el-button>
    <br>
    <br>
    <p style="float:left;line-height:30px;font-size:14px;margin:0;margin-right:6px;">目前状态：</p>
    <el-tag
      v-if="status"
      style="float:left;"
      type="success"
      effect="dark"
    >
      启用
    </el-tag>
    <el-tag
      v-if="!status"
      style="float:left;"
      type="danger"
      effect="dark"
    >
      停用
    </el-tag>
  </div>
</template>
<style>

</style>
<script>
import { fetchList } from '@/api/article'
const tcb = require('tcb-js-sdk')
const app = tcb.init({
  env: 'xianshangchabohui-3hiem'
})

const auth = app.auth()
auth.signInAnonymously()
// 匿名登录成功检测登录状态isAnonymous字段为true
const loginState = auth.getLoginState()
console.log(loginState.isAnonymous) // true
// 数据库查询
const db = app.database()
const _ = db.command
export default {

  data() {
    return {
      pickerOptions: {
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', new Date())
          }
        }, {
          text: '昨天',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }, {
          text: '一周前',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', date)
          }
        }]
      },
      value2: '',
      status: true
    }
  },
  created() {
    this.getTime()
  },
  methods: {
    getTime: function() {
      db.collection('others').where({
        name: 'ms'
      })
        .get()
        .then(res => {
          console.log(res.data[0].value)
          if (res.data[0].value * 1000 > new Date().getTime()) {
            this.status = true
          } else {
            this.status = false
          }
          this.value2 = res.data[0].value * 1000
        })
    },
    onSubmit: function() {
      if (typeof (this.value2) === 'object') {
        this.value2 = this.value2.getTime()
      }

      this.value2 = this.value2 / 1000

      db.collection('others')
        .where({
          name: 'ms'
        })
        .update({
          value: this.value2
        })
        .then(res => {
          this.getTime()
          if (res.updated > 0) {
            this.$notify({
              title: '成功',
              message: '限时促销修改成功',
              type: 'success',
              duration: 3000
            })
          } else {
            this.$notify({
              title: '失败',
              message: '限时促销修改失败',
              type: 'error',
              duration: 3000
            })
          }
        })
    }
  }
}
</script>
