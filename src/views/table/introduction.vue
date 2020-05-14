<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" placeholder="标题" style="width: 200px;" clearable class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" placeholder="状态" class="filter-item" style="width: 130px">
        <el-option v-for="item in status" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="activities"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="Sort" prop="sort" sortable="custom" align="center" width="70" :class-name="getSortClass('sort')">
        <template slot-scope="{row}">
          <span>{{ row.sort }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" width="240px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="内容" min-width="360px" align="center">
        <template slot-scope="{row}">
          <span
            style="overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;"
          >{{ row.content }}</span>
        </template>
      </el-table-column>
      <el-table-column label="活动地址" width="240px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.address }}</span>
        </template>
      </el-table-column>
      <el-table-column label="活动时间" width="240px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="80">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="80" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" plain @click="handleUpdate(row)">
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="70px" style="width: 800px; margin-left:50px;">
        <el-form-item label="排序">
          <el-input v-model="temp.sort" placeholder="值越大越靠前" />
        </el-form-item>
        <el-form-item label="活动名称" prop="title">
          <el-input v-model="temp.title" placeholder="第十二届中国（北京）国际茶业及茶艺博览会" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="temp.status" class="filter-item">
            <el-option v-for="item in status" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动地址">
          <el-input v-model="temp.address" placeholder="梅塞德斯展馆" />
        </el-form-item>
        <el-form-item label="活动日期">
          <el-input v-model="temp.time" placeholder="2020-05-21至2020-05-27" />
        </el-form-item>
        <div style="height: 260px">
          <el-upload
            class="avatar-uploader"
            action="#"
            :http-request="uploadImg"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
          >
            <h4>封面图上传</h4>
            <img v-if="temp.image" :src="temp.image" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
          <el-upload
            class="avatar-uploader"
            action="#"
            :http-request="uploadImg2"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
          >
            <h4>正文图片上传</h4>
            <img v-if="temp.image2" :src="temp.image2" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </div>

        <div class="components-container">
          <div>
            <tinymce v-model="content" :height="400" />
          </div>
        </div>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?submitExhibits():updateExhibits()">
          确认
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <!--        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>-->
        <el-button type="primary" @click="submitExhibits">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<style>
  .el-dialog{
    width: 900px;
  }
  .avatar-uploader{
    margin-left:70px;
    float: left;
  }
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
  .components-container{
    margin:0
  }

</style>
<script>
import { fetchList, fetchPv, createArticle, updateArticle } from '@/api/article'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-
import Tinymce from '@/components/Tinymce'

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

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: '',
  components: { Pagination, Tinymce },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        '正常': true,
        '停用': false
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      colors: ['#99A9BF', '#F7BA2A', '#FF9900'],
      users: [],
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
        title: '',
        type: undefined,
        sort: '+id',

        exhibitor: '',
        label: null,
        name: '',
        status: true
      },
      imageUrl: '',
      imageUrl2: '',

      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: [true, false],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        create_date: new Date(),
        title: '',
        type: '',
        status: true,

        hot: 5,
        image: '',
        intro: '',
        label: [],
        name: '',
        user_id: '',
        username: '',
        sort: this.total + 1
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新增'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        create_date: [{ type: 'date', required: true, message: 'create_date is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false,

      exhibitors: [],
      exhibitor: [],
      exhibitor_label: [],
      exhibits_label: [],

      activities: [],
      content: ''
    }
  },
  created() {
    // this.getLables()
    this.getList()
    // this.getUsers()
  },
  methods: {
    // 提交
    getUsers: function() {
      db.collection('users')
        .get()
        .then(res => {
          this.users = res.data
          console.log(this.users)
        })
    },
    submitExhibits: async function() {
      this.addExhibits()
    },
    // 新增活动
    addExhibits: async function() {
      const data = {
        id: new Date().getTime(),
        title: this.temp.title,
        image: this.temp.image,
        address: this.temp.address,
        time: this.temp.time,
        content: this.temp.content,
        status: true,
        sort: parseInt(this.temp.sort)
      }
      // console.log(data)
      db.collection('exhibitor')
        .add(data)
        .then(res => {
          console.log(res)
          // 弹出窗口隐藏，temp 数据清空
          this.dialogFormVisible = false
          this.resetTemp()
          this.getList()
          this.$notify({
            title: '成功',
            message: '展品创建成功',
            type: 'success',
            duration: 2000
          })
        })
    },
    // 更新活动
    updateExhibits: async function() {
      const data = {
        title: this.temp.title,
        image: this.temp.image,
        address: this.temp.address,
        time: this.temp.time,
        content: this.content,
        status: this.temp.status,
        sort: parseInt(this.temp.sort)
      }
      console.log(data)
      db.collection('activities')
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
              message: '活动编辑成功',
              type: 'success',
              duration: 2000
            })
          } else {
            this.$notify({
              title: '失败',
              message: '活动编辑失败',
              type: 'error',
              duration: 2000
            })
          }
        })
    },
    // 图片上传
    uploadImg(param) {
      console.log(param)
      this.listLoading = true
      const fileObj = param.file
      const website = 'https://7869-xianshangchabohui-3hiem-1301875770.tcb.qcloud.la/'
      const name = 'images/activities/' + new Date().getTime() + fileObj.type.replace('image/', '.')
      app.uploadFile({
        // 云端路径
        cloudPath: name,
        // 需要上传的文件，File 类型
        filePath: param.file
      }).then(async(res) => {
        // 返回文件 ID
        // console.log(this.imageUrl)
        // console.log
        // console.log(this.temp.image)
        // const list = await this.getTempUrl([res.fileID])
        this.listLoading = false
        this.temp.image = website + name
        // console.log(this.temp.image)
        // this.$set(this.temp,'image_temp',list[0].tempFileURL)
        this.imageUrl = website + name
      })
    },
    // 图片上传2
    uploadImg2(param) {
      this.listLoading = true
      const fileObj = param.file
      const website = 'https://7869-xianshangchabohui-3hiem-1301875770.tcb.qcloud.la/'
      const name = 'images/activities/' + new Date().getTime() + fileObj.type.replace('image/', '.')
      app.uploadFile({
        // 云端路径
        cloudPath: name,
        // 需要上传的文件，File 类型
        filePath: param.file
      }).then(async(res) => {
        // 返回文件 ID
        // console.log(this.imageUrl)
        // console.log
        // console.log(this.temp.image)
        // const list = await this.getTempUrl([res.fileID])
        this.listLoading = false
        this.temp.image2 = website + name
        // this.$set(this.temp, 'content', this.temp, 'content' + website + name)
        this.content += '<img width="300" style="display: block; margin-left: auto; margin-right: auto;" src="' + website + name + '" />'
        console.log(this.content)
        // this.$set(this.temp,'image_temp',list[0].tempFileURL)
      })
    },
    // 获取标签
    getLables() {
      // 获取展商标签列表
      db.collection('exhibitor_label')
        .get()
        .then(res => {
          this.exhibitor_label = res.data
          console.log(this.exhibitor_label)
        })
    },
    // 获取图片临时地址
    getTempUrl: async function(list) {
      return await app.getTempFileURL({
        fileList: list
      }).then((res) => {
        return res.fileList
      })
    },
    beforeAvatarUpload(file) {
      // const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2
      //
      // if (!isJPG) {
      //   this.$message.error('上传头像图片只能是 JPG 格式!');
      // }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      // return isJPG && isLt2M
      return isLt2M
    },
    getList: async function() {
      this.listLoading = true
      const data = {
        status: this.listQuery.status,
        title: this.listQuery.title.trim() ? new RegExp(this.listQuery.title.trim(), 'i') : _.neq(null)
      }
      console.log(data)
      // 获取活动总数
      db.collection('activities').where(data).count()
        .then(res => {
          this.total = res.total
        })

      // 获取活动列表
      db.collection('activities').where(data).skip(this.listQuery.limit * (this.listQuery.page - 1))
        .limit(this.listQuery.limit)
        .orderBy('sort', 'desc')
        .get()
        .then(res => {
          this.activities = res.data
          console.log(res.data)
        })

      this.listLoading = false

      // 云函数使用
      // app.callFunction({
      //   // 云函数名称
      //   name: 'test',
      //   // 传给云函数的参数
      //   data: {
      //     skip: 0,
      //     limit: 20
      //   }
      // })
      //   .then(res => {
      //     console.log(res.result)
      //     this.exhibitor = res.result
      //   })
      //   .catch(err => {
      //     console.log(err)
      //   })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.imageUrl = ''
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        create_date: new Date(),
        title: '',
        status: true,
        type: '',

        _id: '',
        exhibitor: '',
        exhibitor_id: '',
        image: '',
        label: [],
        name: '',
        original_price: null,
        sales_price: null,
        wd_link: '',
        sort: this.total + 1
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
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.author = 'vue-element-admin'
          createArticle(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    async handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.create_date = new Date(this.temp.create_date)
      this.content = this.temp.content
      // console.log(this.temp.image)
      // const list = await this.getTempUrl([this.temp.image])
      // console.log(list)
      // this.imageUrl = list[0].tempFileURL
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.create_date = +new Date(tempData.create_date) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
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
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['create_date', 'title', 'type', 'importance', 'status']
        const filterVal = ['create_date', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'create_date') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    },

    getTotal: async function(data) {
      db.collection(data.database).where({
        status: data.status
      }).get()
        .then(res => {
          console.log(res.data)
        })
    }
  }
}
</script>
