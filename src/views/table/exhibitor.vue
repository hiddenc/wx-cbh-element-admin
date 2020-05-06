<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="展商名称" style="width: 200px;" clearable class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.label" placeholder="展商标签" clearable style="width: 120px" class="filter-item">
        <el-option v-for="item in exhibitor_label" :key="item.name" :label="item.name" :value="item.name" />
      </el-select>
      <el-select v-model="listQuery.status" placeholder="展商状态" class="filter-item" style="width: 130px">
        <el-option v-for="item in status" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <!--      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">-->
      <!--        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />-->
      <!--      </el-select>-->
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
      :data="exhibitor"
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
      <!--      <el-table-column label="Date" width="150px" align="center">-->
      <!--        <template slot-scope="{row}">-->
      <!--          <span>{{ row.timestamp | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <el-table-column label="展商名称" width="240px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="简介" min-width="360px" align="center">
        <template slot-scope="{row}">
          <span
            style="overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;"
          >{{ row.intro }}</span>
        </template>
      </el-table-column>
      <!--      <el-table-column v-if="showReviewer" label="Reviewer" width="110px" align="center">-->
      <!--        <template slot-scope="{row}">-->
      <!--          <span style="color:red;">{{ row.reviewer }}</span>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <!--      <el-table-column label="展商" width="240px" align="center">-->
      <!--        <template slot-scope="{row}">-->
      <!--          <span>{{ row.exhibitor }}</span>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <!--      <el-table-column label="Readings" align="center" width="95">-->
      <!--        <template slot-scope="{row}">-->
      <!--          <span v-if="row.pageviews" class="link-type" @click="handleFetchPv(row.pageviews)">{{ row.pageviews }}</span>-->
      <!--          <span v-else>0</span>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <el-table-column label="标签" class-name="status-col" min-width="140">
        <template slot-scope="{row}">
          <el-tag v-for="item in row.label" type="" style="margin-right:6px;" effect="plain">
            {{ item }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="绑定用户" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
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
          <!--          <el-button v-if="row.status==false" size="mini" plain @click="handleModifyStatus(row,'draft')">-->
          <!--            启用-->
          <!--          </el-button>-->
          <!--          <el-button v-if="row.status==true" size="mini" type="danger" plain @click="handleDelete(row,$index)">-->
          <!--            停用-->
          <!--          </el-button>-->
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="排序">
          <el-input v-model="temp.sort" placeholder="值越大越靠前" />
        </el-form-item>
        <el-form-item label="创建日期" prop="create_date">
          <el-date-picker v-model="temp.create_date" type="datetime" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="展商标签" prop="type">
          <el-select v-model="temp.label" multiple class="filter-item" placeholder="可多选">
            <el-option v-for="item in exhibitor_label" :key="item.name" :label="item.name" :value="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="展商名称" prop="title">
          <el-input v-model="temp.name" placeholder="清香型兰花香铁观音" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="temp.status" class="filter-item">
            <el-option v-for="item in status" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="介绍">
          <el-input v-model="temp.intro" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="" />
        </el-form-item>
        <el-form-item label="热度">
          <el-rate
            v-model="temp.hot"
            :colors="colors"
          />
        </el-form-item>
        <el-form-item label="绑定用户">
          <el-select v-model="temp.user_id" class="filter-item" placeholder="请选择">
            <el-option v-for="item in users" :key="item._id" :label="item.nickname" :value="item._id" />
          </el-select>
        </el-form-item>
        <el-upload
          class="avatar-uploader"
          action="#"
          :http-request="uploadImg"
          :show-file-list="false"
          :before-upload="beforeAvatarUpload"
        >
          <img v-if="imageUrl" :src="imageUrl" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon" />
        </el-upload>
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
    width: 600px;
  }
  .avatar-uploader{
    margin-left:70px;
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
  name: 'ComplexTable',
  components: { Pagination },
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
        title: undefined,
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
      exhibits_label: []
    }
  },
  created() {
    this.getLables()
    this.getList()
    this.getUsers()
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
    // 新增展商
    addExhibits: async function() {
      const data = {
        id: Math.floor(Math.random() * 1000) + '_' + this.total,
        hot: this.temp.hot,
        image: this.temp.image,
        intro: this.temp.intro,
        label: this.temp.label,
        name: this.temp.name.trim(),
        status: this.temp.status,
        create_date: this.temp.create_date,
        sort: parseInt(this.temp.sort),
        user_id: this.temp.user_id,
        username: this.temp.user_id ? LD.find(this.users, { '_id': this.temp.user_id }).nickname : this.temp.username
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
    // 更新展商
    updateExhibits: async function() {
      console.log(this.temp.image)
      const data = {
        hot: this.temp.hot,
        image: this.temp.image,
        intro: this.temp.intro,
        label: this.temp.label,
        name: this.temp.name.trim(),
        status: this.temp.status,
        create_date: this.temp.create_date,
        sort: parseInt(this.temp.sort),
        user_id: this.temp.user_id,
        username: this.temp.user_id ? LD.find(this.users, { '_id': this.temp.user_id }).nickname : this.temp.username
      }
      // console.log(data)
      db.collection('exhibitor')
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
              message: '展品编辑成功',
              type: 'success',
              duration: 2000
            })
          } else {
            this.$notify({
              title: '失败',
              message: '展品编辑失败',
              type: 'error',
              duration: 2000
            })
          }
        })
    },
    // 图片上传
    uploadImg(param) {
      console.log(param)
      var fileObj = param.file
      app.uploadFile({
        // 云端路径
        cloudPath: 'images/exhibitor/' + new Date().getTime() + fileObj.type.replace('image/', '.'),
        // 需要上传的文件，File 类型
        filePath: param.file
      }).then(async(res) => {
        // 返回文件 ID
        // console.log(this.imageUrl)
        // console.log
        console.log(this.temp.image)
        const list = await this.getTempUrl([res.fileID])
        this.temp.image = res.fileID
        console.log(this.temp.image)
        // this.$set(this.temp,'image_temp',list[0].tempFileURL)
        this.imageUrl = list[0].tempFileURL
      })
    },
    // 获取标签
    getLables() {
      // 获取展品标签列表
      // db.collection('exhibits_label')
      //   .get()
      //   .then(res => {
      //     this.exhibits_label = res.data
      //   })
      // 获取展商标签列表
      db.collection('exhibitor_label')
        .get()
        .then(res => {
          this.exhibitor_label = res.data
          console.log(this.exhibitor_label)
        })
      // 获取展商清单
      // db.collection('exhibitor').where({
      //   status: true
      // })
      //   .orderBy('sort', 'desc')
      //   .field({
      //     _id: true,
      //     name: true
      //   })
      //   .get()
      //   .then(res => {
      //     console.log(res.data)
      //     this.exhibitors = res.data
      //   })
    },
    // 获取图片临时地址
    getTempUrl: async function(list) {
      return await app.getTempFileURL({
        fileList: list
      }).then((res) => {
        // fileList 是一个有如下结构的对象数组
        // [{
        //    fileID: 'cloud://webtestjimmy-5328c3.7765-webtestjimmy-5328c3-1251059088/腾讯云.png', // 文件 ID
        //    tempFileURL: '', // 临时文件网络链接
        //    maxAge: 120 * 60 * 1000, // 有效期
        // }]
        return res.fileList
      })
    },
    // getList() {
    //   this.listLoading = true
    //   fetchList(this.listQuery).then(response => {
    //     this.list = response.data.items
    //     // this.total = response.data.total
    //
    //     // Just to simulate the time of the request
    //     setTimeout(() => {
    //       this.listLoading = false
    //     }, 1.5 * 1000)
    //   })
    // },
    // handleAvatarSuccess(res, file) {
    //   this.imageUrl = URL.createObjectURL(file.raw)
    // },
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
        name: this.listQuery.name.trim() ? new RegExp(this.listQuery.name.trim(), 'i') : _.neq(null),
        label: this.listQuery.label ? _.elemMatch(_.eq(this.listQuery.label)) : _.neq(null)
      }
      console.log(data)
      console.log('!!!')
      // 获取展商总数
      db.collection('exhibitor').where(data).count()
        .then(res => {
          console.log(res.total)
          this.total = res.total
        })

      // 获取展商列表
      db.collection('exhibitor').where(data).skip(this.listQuery.limit * (this.listQuery.page - 1))
        .limit(this.listQuery.limit)
        .orderBy('sort', 'desc')
        .get()
        .then(res => {
          this.exhibitor = res.data
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
      console.log(this.temp.image)
      const list = await this.getTempUrl([this.temp.image])
      console.log(list)
      this.imageUrl = list[0].tempFileURL
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
