export const routes = [
  {
    path: '/',
    component: '../layouts/BlankLayout',
    routes: [
      {
        path: '/user',
        component: '../layouts/UserLayout',
        routes: [
          {
            path: '/user',
            redirect: '/user/login',
          },
          {
            name: 'login',
            path: '/user/login',
            component: './user/login',
          },
          {
            name: 'register',
            path: '/user/register',
            component: './user/register',
          },
          {
            name: 'register-result',
            path: '/user/register-result',
            component: './user/register-result',
          },
          {
            component: '404',
          },
        ],
      },
      {
        path: '/',
        component: '../layouts/BasicLayout',
        // authority: ['admin', 'user'],
        routes: [
          {
            path: '/',
            redirect: '/dataset',
          },
          {
            path: '/dataset',
            name: 'dataset',
            icon: 'smile',
            component: './dataset/datasetList',
          },
          {
            path: '/dataset/add',
            name: 'add-dataset',
            component: './dataset/operation/add',
            hideInMenu: true,
          },
          {
            path: '/dataset/detail',
            name: 'dataset-detail',
            component: './dataset/operation/detail',
            hideInMenu: true
          },
          {
            path: '/dataset/img-list',
            name: 'dataset-img-list',
            component: './dataset/operation/img-list',
            hideInMenu: true
          },
          {
            path: '/dataset/detail-folder/',
            name: 'dataset-detail-folder',
            component: './dataset/operation/detail-folder',
            hideInMenu: true,
          },
          {
            path: '/tag',
            name: 'tag',
            icon: 'smile',
            component: './tag/tagList',
          },
          {
            path: '/tag/add',
            component: './tag/add',
            name: 'add-tag',
            hideInMenu: true,
          },
          {
            path: '/tag/tagDetail',
            component: './tag/tagDetail',
            name: 'tag-detail',
            hideInMenu: true,
            routes: [
              {
                path: '/tag/tagDetail/markedPage',
                component: './tag/tagDetail/markedPage',
              },
              {
                path: '/tag/tagDetail/markedFolderPage',
                component: './tag/tagDetail/markedFolderPage',
              },
              {
                path: '/tag/tagDetail/markedFolderDoublePage',
                component: './tag/tagDetail/markedFolderDoublePage',
              },
              {
                path: '/tag/tagDetail/unmarkedPage',
                component: './tag/tagDetail/unmarkedPage',
              },
              {
                path: '/tag/tagDetail/washedPage',
                component: './tag/tagDetail/washedPage',
              },
              {
                path: '/tag/tagDetail/detailPage/:imgid',
                component: './tag/tagDetail/detailPage',
              }
            ]
          },
          {
            path: '/training',
            name: 'model-training',
            icon: 'smile',
            component: './training/training',
          },
          {
            path: '/training/create-project',
            component: './training/createProject',
            name: 'create-project',
            hideInMenu: true,
          },
          {
            path: '/training/detail',
            component: './training/trainingDetail',
            name: 'project-detail',
            hideInMenu: true
          },
          {
            path: '/mark',
            component: './mark',
          },
          {
            component: './404',
          },
        ],
      },
    ]
  }
];

