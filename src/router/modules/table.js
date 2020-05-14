/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const tableRouter = {
  path: '/table',
  component: Layout,
  redirect: '/table/complex-table',
  name: 'Table',
  meta: {
    title: '基本管理',
    icon: 'table'
  },
  children: [
    // {
    //   path: 'introduction',
    //   component: () => import('@/views/table/introduction'),
    //   name: '首页介绍',
    //   meta: { title: '首页介绍' }
    // },
    {
      path: 'exhibitor',
      component: () => import('@/views/table/exhibitor'),
      name: 'DynamicTable',
      meta: { title: '展商管理' }
    },
    // {
    //   path: 'drag-table',
    //   component: () => import('@/views/table/drag-table'),
    //   name: 'DragTable',
    //   meta: { title: 'Drag Table' }
    // },
    // {
    //   path: 'inline-edit-table',
    //   component: () => import('@/views/table/inline-edit-table'),
    //   name: 'InlineEditTable',
    //   meta: { title: 'Inline Edit' }
    // },
    {
      path: 'complex-table',
      component: () => import('@/views/table/complex-table'),
      name: '展品管理',
      meta: { title: '展品管理' }
    },
    {
      path: 'activities',
      component: () => import('@/views/table/activities'),
      name: '热门活动',
      meta: { title: '热门活动' }
    }
  ]
}
export default tableRouter
