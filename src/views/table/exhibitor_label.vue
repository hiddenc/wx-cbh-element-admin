<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
    </div>

    <el-alert
      title="如果分类已设置了展商，请不要修改或删除"
      :closable="false"
      style="width: 561px;margin-bottom:20px"
      type="warning"
    />

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="exhibitor_label"
      border
      fit
      highlight-current-row
      style="width: 571px"
    >
      <el-table-column label="Sort" width="100px" align="center">
        <template slot-scope="{row,$index}">
          <span>{{ $index }}</span>
        </template>
      </el-table-column>
      <el-table-column label="展商分类名" width="300px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="170" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" plain @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-popconfirm
            confirm-button-text="确认"
            cancel-button-text="取消"
            icon="el-icon-info"
            icon-color="red"
            title="确认删除吗？"
            @onConfirm="deleteLabel(row)"
          >
            <el-button slot="reference" type="danger" size="mini">删除</el-button>
          </el-popconfirm>
        </template>

      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-alert
        title="如果此分类已设置了展商，请不要修改或删除"
        :closable="false"
        style=""
        type="warning"
      />
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="100px" style="width: 400px;margin-top:30px;">
        <el-form-item label="展商分类名" prop="title">
          <el-input v-model="temp.name" placeholder="" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?submitLabel():updateLabel()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<style>
  .el-dialog{
    width: 600px;
  }
  .el-dialog__body{
    padding-top:10px;
  }

</style>
<script>
import { fetchList, fetchPv, createArticle, updateArticle } from '@/api/article'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
const tcb = require('tcb-js-sdk')
const app = tcb.init({
  env: 'xianshangchabohui-3hiem'
})
const LD = require('lodash')
const auth = app.auth()
auth.signInAnonymously()
// 匿名登录成功检测登录状态isAnonymous字段为true
const loginState = auth.getLoginState()
console.log(loginState.isAnonymous) // true
// 数据库查询
const db = app.database()
const _ = db.command

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      status: [{
        label: '正常',
        value: true
      }, {
        label: '停用',
        value: false
      }],
      listQuery: {
        page: 1,
        limit: 20,

        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id',

        exhibitor: '',
        label: null,
        name: '',
        status: true
      },

      statusOptions: [true, false],
      showReviewer: false,
      temp: {
        _id: '',
        name: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新增'
      },
      dialogPvVisible: false,
      pvData: [],

      exhibitors: [],
      exhibits: [],
      exhibitor_label: [],
      exhibits_label: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    deleteLabel: function(row) {
      const that = this
      db.collection('exhibitor_label')
        .doc(row._id)
        .remove(function(res, err) {
          that.$notify({
            title: '成功',
            message: '分类标签删除成功',
            type: 'success',
            duration: 2000
          })
          that.resetTemp()
          that.getList()
        })
    },
    // 提交
    submitLabel: async function() {
      this.addLabel()
    },
    // 新增分类标签
    addLabel: async function() {
      const data = {
        name: this.temp.name
      }
      // console.log(data)
      db.collection('exhibitor_label')
        .add(data)
        .then(res => {
          // console.log(res)
          // 弹出窗口隐藏，temp 数据清空
          this.dialogFormVisible = false
          this.resetTemp()
          this.getList()
          this.$notify({
            title: '成功',
            message: '分类标签创建成功',
            type: 'success',
            duration: 2000
          })
        })
    },
    // 更新展品
    updateLabel: async function() {
      const data = {
        name: this.temp.name
      }
      // console.log(data)
      db.collection('exhibitor_label')
        .doc(this.temp._id)
        .update(data)
        .then(res => {
          console.log(res)
          // 弹出窗口隐藏，temp 数据清空
          this.dialogFormVisible = false
          this.resetTemp()
          this.getList()
          if (res.updated > 0) {
            this.$notify({
              title: '成功',
              message: '分类标签编辑成功',
              type: 'success',
              duration: 2000
            })
          } else {
            this.$notify({
              title: '失败',
              message: '分类标签编辑失败',
              type: 'error',
              duration: 2000
            })
          }
        })
    },
    getList: async function() {
      this.listLoading = true
      // 获取展商标签列表
      db.collection('exhibitor_label')
        .get()
        .then(res => {
          this.exhibitor_label = res.data
          console.log(this.exhibitor_label)
        })
      this.listLoading = false
    },
    resetTemp() {
      this.temp = {
        _id: '',
        name: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    async handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete(row, index) {
      this.$notify({
        title: 'Success',
        message: 'Delete Successfully',
        type: 'success',
        duration: 2000
      })
      this.list.splice(index, 1)
    }
  }
}
</script>
