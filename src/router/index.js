import Vue from "vue"
import VueRouter from "vue-router"

Vue.use(VueRouter)

// the .vue file extension is required for Vite

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: () => import(/* webpackChunkName: "home" */ "../views/Home.vue")
  },
  {
    path: "/login",
    name: "Login",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/Login.vue")
  },
  {
    path: "/activity/:id",
    redirect: "/activity/instance/:id/dashboard"
  },
  {
    path: "/activity/:type/:id",
    name: "Activity",
    redirect: "/activity/:type/:id/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Activity Dashboard",
        component: () =>
          import(
            /* webpackChunkName: "activityDashboard" */ "../views/Activity/ActivityDashboard.vue"
          )
      },
      {
        path: "roll",
        name: "Activity Roll",
        component: () =>
          import(
            /* webpackChunkName: "activityRoll" */ "../views/Activity/ActivityRoll.vue"
          )
      },
      {
        path: "discussions",
        name: "Activity Discussions",
        component: () =>
          import(
            /* webpackChunkName: "activityDiscussions" */ "../views/Activity/ActivityDiscussions.vue"
          )
      },
      {
        path: "schedule",
        name: "Activity Schedule",
        component: () =>
          import(
            /* webpackChunkName: "activitySchedule" */ "../views/Activity/ActivitySchedule.vue"
          )
      },
      {
        path: "sessions",
        name: "Activity Sessions",
        component: () =>
          import(
            /* webpackChunkName: "activitySessions" */ "../views/Activity/ActivitySessions.vue"
          )
      },
      {
        path: "settings",
        name: "Activity Settings",
        component: () =>
          import(
            /* webpackChunkName: "activitySettings" */ "../views/Activity/ActivitySettings.vue"
          )
      },
      {
        path: "tasks",
        name: "Activity Tasks",
        component: () =>
          import(
            /* webpackChunkName: "activityTasks" */ "../views/Activity/ActivityTasks.vue"
          )
      },
      {
        path: "resources",
        name: "Resources",
        component: () =>
          import(
            /* webpackChunkName: "activityTasks" */ "../views/Activity/ActivityResources.vue"
          )
      }
    ],
    component: () =>
      import(
        /* webpackChunkName: "activity" */ "../views/Activity/Activity.vue"
      )
  },
  {
    path: "/user/",
    name: "User",
    redirect: "/user/dashboard",
    children: [
      {
        path: "dashboard",
        name: "User Dashboard",
        component: () =>
          import(
            /* webpackChunkName: "userDashboard" */ "../views/User/UserDashboard.vue"
          )
      },
      {
        path: "analytics",
        name: "User Analytics",
        component: () =>
          import(
            /* webpackChunkName: "userAnalytics" */ "../views/User/UserAnalytics.vue"
          )
      },
      {
        path: "attendance",
        name: "User Attendance",
        component: () =>
          import(
            /* webpackChunkName: "userAttendance" */ "../views/User/UserAttendance.vue"
          )
      },
      {
        path: "reports",
        name: "User Reports",
        component: () =>
          import(
            /* webpackChunkName: "userReports" */ "../views/User/UserReports.vue"
          )
      },
      {
        path: "tasks",
        name: "User Tasks",
        component: () =>
          import(
            /* webpackChunkName: "userTasks" */ "../views/User/UserTasks.vue"
          )
      },
      {
        path: "events",
        name: "User Events",
        component: () =>
          import(
            /* webpackChunkName: "userEvents" */ "../views/User/UserEvents.vue"
          )
      },
      {
        path: "settings",
        name: "BetterCompass Settings",
        component: () =>
          import(
            /* webpackChunkName: "userSettings" */ "../views/User/UserSettings.vue"
          )
      },
      {
        path: "score",
        name: "CompassScore",
        component: () =>
          import(
            /* webpackChunkName: "userScore" */ "../views/User/UserCompassScore.vue"
          )
      }
    ],
    component: () =>
      import(/* webpackChunkName: "user" */ "../views/User/User.vue")
  },
  {
    path: "/user/:id",
    name: "User",
    redirect: "/user/:id/dashboard",
    children: [
      {
        path: "dashboard",
        name: "User Dashboard",
        component: () =>
          import(
            /* webpackChunkName: "userDashboard" */ "../views/User/UserDashboard.vue"
          )
      },
      {
        path: "analytics",
        name: "User Analytics",
        component: () =>
          import(
            /* webpackChunkName: "userAnalytics" */ "../views/User/UserAnalytics.vue"
          )
      },
      {
        path: "attendance",
        name: "User Attendance",
        component: () =>
          import(
            /* webpackChunkName: "userAttendance" */ "../views/User/UserAttendance.vue"
          )
      },
      {
        path: "reports",
        name: "User Reports",
        component: () =>
          import(
            /* webpackChunkName: "userReports" */ "../views/User/UserReports.vue"
          )
      },
      {
        path: "tasks",
        name: "User Tasks",
        component: () =>
          import(
            /* webpackChunkName: "userTasks" */ "../views/User/UserTasks.vue"
          )
      },
      {
        path: "events",
        name: "User Events",
        component: () =>
          import(
            /* webpackChunkName: "userEvents" */ "../views/User/UserEvents.vue"
          )
      },
      {
        path: "settings",
        name: "BetterCompass Settings",
        component: () =>
          import(
            /* webpackChunkName: "userSettings" */ "../views/User/UserSettings.vue"
          )
      },
      {
        path: "score",
        name: "CompassScore",
        component: () =>
          import(
            /* webpackChunkName: "userScore" */ "../views/User/UserCompassScore.vue"
          )
      }
    ],
    component: () =>
      import(/* webpackChunkName: "user" */ "../views/User/User.vue")
  },
  {
    path: "/school",
    name: "School",
    redirect: "/school/resources",
    children: [
      {
        path: "resources",
        name: "School Resources",
        component: () =>
          import(
            /* webpackChunkName: "schoolResources" */ "../views/School/SchoolResources.vue"
          )
      },
      {
        path: "staff",
        name: "School Staff",
        component: () =>
          import(
            /* webpackChunkName: "schoolStaff" */ "../views/School/SchoolStaff.vue"
          )
      },
      {
        path: "subjects",
        name: "School Subjects",
        component: () =>
          import(
            /* webpackChunkName: "schoolSubjects" */ "../views/School/SchoolSubjects.vue"
          )
      },
      {
        path: "classes",
        name: "School Classes",
        component: () =>
          import(
            /* webpackChunkName: "schoolClasses" */ "../views/School/SchoolClasses.vue"
          )
      }
    ],
    component: () =>
      import(/* webpackChunkName: "school" */ "../views/School/School.vue")
  },
  {
    path: "/communications",
    name: "Communications",
    redirect: "/communications/home",
    children: [
      {
        path: ":id",
        name: "Communications",
        component: () =>
          import(
            /* webpackChunkName: "communicationsChat" */ "../views/Communications/CommunicationsChat.vue"
          )
      }
    ],
    component: () =>
      import(
        /* webpackChunkName: "communications" */ "../views/Communications/Communications.vue"
      )
  },
  {
    path: "/changelog",
    name: "Changelog",
    component: () =>
      import(/* webpackChunkName: "changelog" */ "../views/Changelog.vue")
  },
  {
    path: "/about",
    name: "About",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue")
  },
  {
    path: "/everything",
    name: "Everything",
    component: () =>
      import(/* webpackChunkName: "everything" */ "../views/Everything.vue")
  },
  {
    path: "*",
    name: "Not Found",
    component: () =>
      import(/* webpackChunkName: "notFound" */ "../views/NotFound.vue")
  }
]

const router = new VueRouter({
  mode: "history",
  base: import.meta.env.BASE_URL,
  routes
})

export default router
