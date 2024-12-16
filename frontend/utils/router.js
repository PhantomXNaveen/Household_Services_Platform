
import LoginPage from "../pages/LoginPage.js";
import RegisterPage from "../pages/RegisterPage.js";

import ServiceDisplay from "../pages/ServiceDisplay.js";
import ServiceRequestDisplayPage from "../pages/ServiceRequestDisplayPage.js";
import BookService from "../pages/BookService.js";

import AdminDashboard from "../pages/AdminDashboard.js";
import AdminSearch from "../pages/AdminSearch.js";
import AdminSummary from "../pages/AdminSummary.js";

import CustomerDashBoard from "../pages/CustomerDashBoard.js";
import CustomerSearch from "../pages/CustomerSearch.js";
import CustomerSummary from "../pages/CustomerSummary.js";

import ProfessionalDashboard from "../pages/ProfessionalDashboard.js";
import ProfessionalSearch from "../pages/ProfessionalSearch.js";
import ProfessionalSummary from "../pages/ProfessionalSummary.js";


const Home = {
    template : `
    <div>
    <div class="hero-section text-center">
    <h1 class="display-4">Household Services Application - V2</h1>
    <p class="lead">A multi-user platform for providing comprehensive home services and solutions</p>
    </div>


    <section style="padding:5px 25px;">
            <h2 class="section-header" >Project Information</h2>
            <p>This project aims to develop a household services application that connects customers with service professionals for various home services like plumbing, AC servicing, etc. The platform supports three types of users: Admin, Service Professionals, and Customers.</p>
        </section>

        <section style="padding:5px 25px;">
        <h2 class="section-header">Roles</h2>
        <div class="row">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Admin</h5>
                    </div>
                    <div class="card-body">
                        <p class="card-text">Admin has root access to the platform and can manage all users, create and manage services, approve professionals, and block/unblock users based on fraudulent activity.</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Service Professional</h5>
                    </div>
                    <div class="card-body">
                        <p class="card-text">Service Professionals can log in, accept or reject service requests, complete service tasks, and manage their own profiles. Each professional specializes in one type of service.</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Customer</h5>
                    </div>
                    <div class="card-body">
                        <p class="card-text">Customers can create service requests, search for services, close service requests, and provide feedback and reviews on completed tasks.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>



    </div>

    `
}

import store from './store.js'

const routes = [
    {path : '/', component: Home},
    {path : '/login', component: LoginPage},
    {path : '/register', component: RegisterPage},
    
    {path: '/customer', component: CustomerDashBoard, meta : {requiresLogin : true, role: 'Customer'}},
    {path: '/customerSearch', component: CustomerSearch, meta : {requiresLogin : true, role: 'Customer'}},
    {path: '/customerSummary', component: CustomerSummary, meta : {requiresLogin : true, role: 'Customer'}},

    {path: '/bookService/:service_id', component: BookService, props : true, meta : {requiresLogin : true, role: 'Customer'}},


    {path: '/services/:id', component: ServiceDisplay, props : true, meta : {requiresLogin : true}},
    {path: '/service_request/:id', component: ServiceRequestDisplayPage, props : true, meta : {requiresLogin : true}},

    {path: '/service_request/:id', component: ServiceRequestDisplayPage, props : true, meta : {requiresLogin : true}},

    {path: '/admin', component: AdminDashboard, meta : {requiresLogin : true, role: 'Admin'}},
    {path: '/adminSearch', component: AdminSearch, meta : {requiresLogin : true, role: 'Admin'}},
    {path: '/adminSummary', component: AdminSummary, meta : {requiresLogin : true, role: 'Admin'}},

    {path: '/professional', component: ProfessionalDashboard, meta : {requiresLogin : true, role: 'Service Professional'}},
    {path: '/professionalSearch', component: ProfessionalSearch, meta : {requiresLogin : true, role: 'Service Professional'}},
    {path: '/professionalSummary', component: ProfessionalSummary, meta : {requiresLogin : true, role: 'Service Professional'}},
]

const router = new VueRouter({
    routes
})

// navigation guards
router.beforeEach((to, from, next) => {
    if (to.matched.some((record) => record.meta.requiresLogin)){
        if (!store.state.loggedIn){
            next({path : '/login'})
        } else if (to.meta.role && to.meta.role != store.state.role){
            alert('role not authorized')
             next({path : '/'})
        } else {
            next();
        }
    } else {
        next();
    }
})

export default router;