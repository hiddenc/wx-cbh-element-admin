<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="展品名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.exhibitor" placeholder="展商名称" style="width: 200px;" clearable class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.label" placeholder="展品标签" clearable style="width: 120px" class="filter-item">
        <el-option v-for="item in exhibits_label" :key="item.name" :label="item.name" :value="item.name" />
      </el-select>
      <el-select v-model="listQuery.status" placeholder="展品状态" class="filter-item" style="width: 130px">
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
      :data="exhibits"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <!--      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">-->
      <!--        <template slot-scope="{row}">-->
      <!--          <span>{{ row.id }}</span>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <!--      <el-table-column label="Date" width="150px" align="center">-->
      <!--        <template slot-scope="{row}">-->
      <!--          <span>{{ row.timestamp | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <el-table-column label="展品名称" min-width="360px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="现价/原价" width="160px" align="center">
        <template slot-scope="{row}">
          <el-tag type="danger">{{ row.sales_price }}</el-tag> <span style="text-decoration:line-through;color:#ccc">{{ row.original_price }}</span>
        </template>
      </el-table-column>
      <!--      <el-table-column v-if="showReviewer" label="Reviewer" width="110px" align="center">-->
      <!--        <template slot-scope="{row}">-->
      <!--          <span style="color:red;">{{ row.reviewer }}</span>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <el-table-column label="展商" width="240px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.exhibitor }}</span>
        </template>
      </el-table-column>
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
      <el-table-column label="状态" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" plain @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status==false" size="mini" plain @click="handleModifyStatus(row,'draft')">
            启用
          </el-button>
          <el-button v-if="row.status==true" size="mini" type="danger" plain @click="handleDelete(row,$index)">
            停用
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="展品标签" prop="type">
          <el-select v-model="temp.label" multiple class="filter-item" placeholder="可多选">
            <el-option v-for="item in exhibits_label" :key="item.name" :label="item.name" :value="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建日期" prop="timestamp">
          <el-date-picker v-model="temp.timestamp" type="datetime" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="展品名称" prop="title">
          <el-input v-model="temp.name" placeholder="清香型兰花香铁观音"/>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="temp.status" class="filter-item">
            <el-option v-for="item in status" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="展商">
          <el-select v-model="temp.exhibitor" style="width:260px;" placeholder="可搜索" clearable class="filter-item" filterable>
            <el-option v-for="item in exhibitors" :key="item._id" :label="item.name" :value="item._id" />
          </el-select>
        </el-form-item>
        <el-form-item label="现价" prop="title">
          <el-input v-model="temp.sales_price" placeholder="141"/>
        </el-form-item>
        <el-form-item label="原价" prop="title">
          <el-input v-model="temp.original_price" placeholder="321" />
        </el-form-item>
<!--        <el-form-item label="Imp">-->
<!--          <el-rate v-model="temp.importance" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" :max="3" style="margin-top:8px;" />-->
<!--        </el-form-item>-->
        <el-form-item label="微店地址">
          <el-input v-model="temp.wd_link" :autosize="{ minRows: 2, maxRows: 2}" type="textarea" placeholder="https://weidian.com/item.html?itemID=3517644784&spider_token=1eca" />
        </el-form-item>
        <el-upload
          class="avatar-uploader"
          action="https://jsonplaceholder.typicode.com/posts/"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload">
          <img v-if="imageUrl" :src="imageUrl" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
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
        '停用': false,
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
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
        limit: 10,

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

      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: [true,false],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: true,

        exhibitor: '',
        exhibitor_id: '',
        image: '',
        label: [],
        name: '',
        original_price: null,
        sales_price: null,
        wd_link: ''
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
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false,

      exhibitors: [],
      exhibits: [],
      exhibitor_label: [],
      exhibits_label: []
    }
  },
  created() {
    this.getLables()
    this.getList()
  },
  methods: {
    getLables() {
      // 获取展品标签列表
      db.collection('exhibits_label')
        .get()
        .then(res => {
          this.exhibits_label = res.data
        })
      // 获取展商标签列表
      db.collection('exhibitor_label')
        .get()
        .then(res => {
          this.exhibitor_label = res.data
        })
      // 获取展商清单
      db.collection('exhibitor').where({
        status: true
      })
        .orderBy('sort','desc')
        .field({
          _id:true,
          name:true
        })
        .get()
        .then(res => {
          console.log(res.data)
          this.exhibitors = res.data
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
    handleAvatarSuccess(res, file) {
      this.imageUrl = URL.createObjectURL(file.raw);
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },
    getList: async function() {
      this.listLoading = true
      const data = {
        status: this.listQuery.status,
        exhibitor: this.listQuery.exhibitor.trim() ? new RegExp(this.listQuery.exhibitor.trim(), 'i') : _.neq(null),
        name: this.listQuery.name.trim() ? new RegExp(this.listQuery.name.trim(), 'i') : _.neq(null),
        label: this.listQuery.label ? _.elemMatch(_.eq(this.listQuery.label)) : _.neq(null)
      }
      console.log(data)
      console.log('!!!')
      db.collection('exhibits').where(data).count()
        .then(res => {
          console.log(res.total)
          this.total = res.total
        })

      db.collection('exhibits').where(data).skip(this.listQuery.limit * (this.listQuery.page - 1))
        .limit(this.listQuery.limit)
        .get()
        .then(res => {
          this.exhibits = res.data
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
      //     this.exhibits = res.result
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
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: true,
        type: '',

        exhibitor: '',
        exhibitor_id: '',
        image: '',
        label: [],
        name: '',
        original_price: null,
        sales_price: null,
        wd_link: ''
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
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
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
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
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
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
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
        if (j === 'timestamp') {
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
