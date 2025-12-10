<div class="sidebar" data-background-color="dark">
    <div class="sidebar-logo">
        <div class="logo-header" data-background-color="dark">
            <a href="{{ url('admin/dashboard') }}" class="logo">
                <img
                    src="{{ systemflag('logo') ? asset(systemflag('logo')) : asset('assets/adminlogo.png') }}"
                    alt="EsimTel"
                    class="navbar-brand"
                    height="50" />
            </a>
            <div class="nav-toggle">
                <button class="btn btn-toggle toggle-sidebar">
                    <i class="gg-menu-right"></i>
                </button>
                <button class="btn btn-toggle sidenav-toggler">
                    <i class="gg-menu-left"></i>
                </button>
            </div>
            <button class="topbar-toggler more">
                <i class="gg-more-vertical-alt"></i>
            </button>
        </div>
    </div>
    <div class="sidebar-wrapper scrollbar scrollbar-inner">
        <div class="sidebar-content">
            <ul class="nav nav-secondary">
                <li class="nav-item {{ request()->is('admin/dashboard') ? 'active' : '' }}">
                    <a href="{{route('admin.dashboard')}}">
                        <i class="fas fa-home"></i>
                        <p>Dashboard</p>
                    </a>

                </li>

                <li class="nav-section">
                    <span class="sidebar-mini-icon">
                        <i class="fa fa-ellipsis-h"></i>
                    </span>
                    <h4 class="text-section">Modules</h4>
                </li>
                <li class="nav-item {{ request()->routeIs('admin.user.*') ? 'active' : '' }}">
                    <a data-bs-toggle="collapse" href="#usertab">
                        <i class="fas fa-users"></i>
                        <p>User Management</p>
                        <span class="caret"></span>
                    </a>
                    <div class="collapse {{ request()->routeIs('admin.user.*') ? 'show' : '' }}" id="usertab">
                        <ul class="nav nav-collapse">
                            <li>
                                <a href="{{ route('admin.user.index') }}">
                                    <span class="sub-item">Manage Users</span>
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('admin.user.kyc.index','pending')}}">
                                    <span class="sub-item">Pending Kyc</span>
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('admin.user.kyc.index','approved')}}">
                                    <span class="sub-item">Approved Kyc</span>
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('admin.user.kyc.index','rejected')}}">
                                    <span class="sub-item">Rejected Kyc</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </li>
                <li class="nav-item {{ request()->is('admin/masters/*') ? 'active' : '' }}">
                    <a data-bs-toggle="collapse" href="#master">
                        <i class="fas fa-pen-square"></i>
                        <p>Masters Data</p>
                        <span class="caret"></span>
                    </a>
                    <div class="collapse {{ request()->is('admin/masters/*') ? 'show' : '' }}" id="master">
                        <ul class="nav nav-collapse">
                            <li class="{{ request()->routeIs('admin.regions') ? 'active' : '' }}">
                                <a href="{{route('admin.regions')}}">
                                    <span class="sub-item">Regions</span>
                                </a>
                            </li>
                            <li class="{{ request()->routeIs('admin.countries') ? 'active' : '' }}">
                                <a href="{{route('admin.countries')}}">
                                    <span class="sub-item">Countries</span>
                                </a>
                            </li>
                            <li class="{{ request()->routeIs('admin.operators') ? 'active' : '' }}">
                                <a href="{{route('admin.operators')}}">
                                    <span class="sub-item">Operators</span>
                                </a>
                            </li>
                            <li class="{{ request()->routeIs('admin.packages') ? 'active' : '' }}">
                                <a href="{{route('admin.packages')}}">
                                    <span class="sub-item">Packages</span>
                                </a>
                            </li>
                            <li class="{{ request()->routeIs('admin.currencies') ? 'active' : '' }}">
                                <a href="{{route('admin.currencies')}}">
                                    <span class="sub-item">Currencies</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </li>
                <li class="nav-item {{ (request()->is('admin/orders') || request()->is('admin/orders/*')) ? 'active' : '' }}">
                    <a data-bs-toggle="collapse" href="#orders">
                        <i class="fas fa-cubes"></i>
                        <p>Order Management</p>
                        <span class="caret"></span>
                    </a>
                    <div class="collapse {{ (request()->is('admin/orders') || request()->is('admin/orders/*')) ? 'show' : '' }}" id="orders">
                        <ul class="nav nav-collapse">
                            <li class="{{ request()->routeIs('admin.orders') ? 'active' : '' }}">
                                <a href="{{ route('admin.orders') }}">
                                    <span class="sub-item">Order List</span>
                                </a>
                            </li>
                            <li class="{{ request()->routeIs('admin.esims') ? 'active' : '' }}">
                                <a href="{{ route('admin.esims') }}">
                                    <span class="sub-item">ESims</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </li>
                <li class="nav-item {{ request()->routeIs('admin.notification.master.*') ? 'active' : '' }}">
                    <a href="{{ route('admin.notification.master.index') }}">
                        <i class="fa fa-bell"></i>
                        <p>Notifications</p>
                    </a>
                </li>
                <li class="nav-item {{ request()->routeIs('admin.email-templates.*') ? 'active' : '' }}">
                    <a href="{{ route('admin.email-templates.index') }}">
                        <i class="fas fa-envelope"></i>
                        <p>Email Templates</p>
                    </a>
                </li>

                <li class="nav-item {{ (request()->is('admin/tickets*') || request()->is('admin/faqs*')) ? 'active' : '' }}">
                    <a data-bs-toggle="collapse" href="#tickets">
                        <i class="fas fa-headset"></i>
                        <p>Support Center</p>
                        <span class="caret"></span>
                    </a>
                    <div class="collapse {{ (request()->is('admin/tickets*') || request()->is('admin/faqs*')) ? 'show' : '' }}" id="tickets">
                        <ul class="nav nav-collapse">
                            <li class="{{ request()->routeIs('admin.faqs.*') ? 'active' : '' }}">
                                <a href="{{ route('admin.faqs.index') }}">
                                    <span class="sub-item">FAQ's</span>
                                </a>
                            </li>
                            <li class="{{ request()->routeIs('admin.tickets.*') ? 'active' : '' }}">
                                <a href="{{ route('admin.tickets.index') }}">
                                    <span class="sub-item">Support Tickets</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </li>

                <li class="nav-item {{ request()->routeIs('admin.iap.*') ? 'active' : '' }}">
                    <a href="{{ route('admin.iap.index') }}">
                        <i class="fas fa-newspaper"></i>
                        <p>In App Products</p>
                    </a>
                </li>

                <li class="nav-item {{ request()->routeIs('admin.pages.*') ? 'active' : '' }}">
                    <a href="{{ route('admin.pages.index') }}">
                        <i class="fas fa-book-reader"></i>
                        <p>Page Management</p>
                    </a>
                </li>
                <li class="nav-item {{ request()->is('admin/masters/*') ? 'active' : '' }}">
                    <a data-bs-toggle="collapse" href="#reports">
                        <i class="fas fa-book"></i>
                        <p>Reports</p>
                        <span class="caret"></span>
                    </a>
                    <div class="collapse {{ request()->is('admin/reports/*') ? 'show' : '' }}" id="reports">
                        <ul class="nav nav-collapse">
                            <li class="{{ request()->routeIs('admin.report.sale') ? 'active' : '' }}">
                                <a href="{{route('admin.report.sale',['filter_location' => 'country'])}}">
                                    <span class="sub-item">Country Wise</span>
                                </a>
                            </li>
                            <li class="{{ request()->routeIs('admin.report.sale') ? 'active' : '' }}">
                                <a href="{{route('admin.report.sale',['filter_location' => 'region'])}}">
                                    <span class="sub-item">Region Wise</span>
                                </a>
                            </li>
                            <li class="{{ request()->routeIs('admin.report.packages') ? 'active' : '' }}">
                                <a href="{{route('admin.report.packages')}}">
                                    <span class="sub-item">Packages Wise</span>
                                </a>
                            </li>
                            <li class="{{ request()->routeIs('admin.report.analytics') ? 'active' : '' }}">
                                <a href="{{route('admin.report.analytics')}}">
                                    <span class="sub-item">Analytics</span>
                                </a>
                            </li>

                        </ul>
                    </div>
                </li>
                <li class="nav-item {{ request()->routeIs('admin.settings') ? 'active' : '' }}">
                    <a href="{{ route('admin.settings') }}">
                        <i class="fas fa-cog"></i>
                        <p>General Setting</p>
                    </a>
                </li>
            </ul>
        </div>

    </div>
</div>
