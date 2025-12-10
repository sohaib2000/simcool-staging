<div class="main-header">
    <div class="main-header-logo">
        <div class="logo-header" data-background-color="dark">
            <a href="{{ url('dashboard') }}" class="logo">
                <img
                    src="{{ asset('assets/img/kaiadmin/logo_light.svg') }}"
                    alt="navbar brand"
                    class="navbar-brand"
                    height="20" />
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
    <nav
        class="navbar navbar-header navbar-header-transparent navbar-expand-lg border-bottom">
        <div class="container-fluid">
            {{-- <nav
                class="navbar navbar-header-left navbar-expand-lg navbar-form nav-search p-0 d-none d-lg-flex"
            >
                <div class="input-group">
                    <div class="input-group-prepend">
                        <button type="submit" class="btn btn-search pe-1">
                            <i class="fa fa-search search-icon"></i>
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder="Search ..."
                        class="form-control"
                    />
                </div>
            </nav> --}}

            <ul class="navbar-nav topbar-nav ms-md-auto align-items-center">
                <li class="nav-item topbar-icon dropdown hidden-caret">

                    <ul
                        class="dropdown-menu messages-notif-box animated fadeIn"
                        aria-labelledby="messageDropdown">
                        <li>
                            <div
                                class="dropdown-title d-flex justify-content-between align-items-center">
                                Messages
                                <a href="#" class="small">Mark all as read</a>
                            </div>
                        </li>
                         @php
                                    $userNotifications = App\Models\UserNotification::where('is_admin_read',0)->latest()->take(6)->get();
                                    $notiCount = App\Models\UserNotification::where('is_admin_read',0)->count();
                                    @endphp
                        <li>
                            <div class="message-notif-scroll scrollbar-outer">
                                <div class="notif-center">
                                    <a href="#">
                                        <div class="notif-img">
                                            <img
                                                src="{{ asset('assets/img/jm_denis.jpg') }}"
                                                alt="Img Profile" />
                                        </div>
                                        <div class="notif-content">
                                            <span class="subject">Jimmy Denis</span>
                                            <span class="block"> How are you ? </span>
                                            <span class="time">5 minutes ago</span>
                                        </div>
                                    </a>
                                    <a href="#">
                                        <div class="notif-img">
                                            <img
                                                src="{{ asset('assets/img/chadengle.jpg') }}"
                                                alt="Img Profile" />
                                        </div>
                                        <div class="notif-content">
                                            <span class="subject">Chad</span>
                                            <span class="block"> Ok, Thanks ! </span>
                                            <span class="time">12 minutes ago</span>
                                        </div>
                                    </a>
                                    <a href="#">
                                        <div class="notif-img">
                                            <img
                                                src="{{ asset('assets/img/mlane.jpg') }}"
                                                alt="Img Profile" />
                                        </div>
                                        <div class="notif-content">
                                            <span class="subject">Jhon Doe</span>
                                            <span class="block">
                                                Ready for the meeting today...
                                            </span>
                                            <span class="time">12 minutes ago</span>
                                        </div>
                                    </a>
                                    <a href="#">
                                        <div class="notif-img">
                                            <img
                                                src="{{ asset('assets/img/talha.jpg') }}"
                                                alt="Img Profile" />
                                        </div>
                                        <div class="notif-content">
                                            <span class="subject">Talha</span>
                                            <span class="block"> Hi, Apa Kabar ? </span>
                                            <span class="time">17 minutes ago</span>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </li>
                        <li>
                            <a class="see-all" href="{{route('admin.notification.index')}}">See all messages<i class="fa fa-angle-right"></i>
                            </a>
                        </li>
                    </ul>
                </li>
                <li class="nav-item topbar-icon dropdown hidden-caret">
                    <a
                        class="nav-link dropdown-toggle"
                        href="#"
                        id="notifDropdown"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false">
                        <i class="fa fa-bell"></i>
                        <span class="notification">{{$notiCount}}</span>
                    </a>
                    <ul
                        class="dropdown-menu notif-box animated fadeIn"
                        aria-labelledby="notifDropdown">
                        <li>
                            @if($userNotifications->count() > 0)
                            <div class="dropdown-title">
                                You have {{$userNotifications->count()}} new notification
                            </div>
                            @endif
                        </li>
                        <li>
                            <div class="notif-scroll scrollbar-outer">
                                <div class="notif-center">
                                    <!-- <a href="#">
                                        <div class="notif-icon notif-primary">
                                            <i class="fa fa-user-plus"></i>
                                        </div>
                                        <div class="notif-content">
                                            <span class="block"> New user registered </span>
                                            <span class="time">5 minutes ago</span>
                                        </div>
                                    </a>
                                    <a href="#">
                                        <div class="notif-icon notif-success">
                                            <i class="fa fa-comment"></i>
                                        </div>
                                        <div class="notif-content">
                                            <span class="block">
                                                Rahmad commented on Admin
                                            </span>
                                            <span class="time">12 minutes ago</span>
                                        </div>
                                    </a> -->

                                   @if($userNotifications->count() > 0)
                                    @foreach($userNotifications as $noti)
                                    @php
                                    $redirectUrl = '#';
                                    if($noti->type == 9){
                                        $redirectUrl = route('admin.tickets.index');
                                    }elseif($noti->type == 1){
                                        $redirectUrl = route('admin.orders');
                                    }elseif($noti->type == 10){
                                        $redirectUrl = route('admin.user.details',$noti->user->id);
                                    }else{
                                        $redirectUrl = route('admin.notification.index');
                                    }
                                    @endphp
                                    <a href="{{$redirectUrl}}">
                                        <div class="notif-img">
                                            <img
                                                src="{{ $noti->user->image ? asset($noti->user->image) : asset('assets/defaultProfile.png') }}"
                                                alt="Img Profile" />
                                        </div>
                                        <div class="notif-content">
                                            <span class="block">
                                               {{$noti->user->name ?? $noti->user->email}} {{ $noti->title }}
                                            </span>
                                            <span class="time">
                                                {{ $noti->created_at->diffForHumans() }}
                                            </span>
                                        </div>
                                    </a>
                                    @endforeach
                                    @else
                                    <div class="text-center">
                                        <p>No Notification</p>
                                    </div>
                                    @endif

                                </div>
                            </div>
                        </li>
                        <li>
                            <a class="see-all" href="{{route('admin.notification.index')}}">See all notifications<i class="fa fa-angle-right"></i>
                            </a>
                        </li>
                    </ul>
                </li>
                <li class="nav-item topbar-icon dropdown hidden-caret">
                    <a
                        class="nav-link"
                        data-bs-toggle="dropdown"
                        href="#"
                        aria-expanded="false">
                        <i class="fas fa-layer-group"></i>
                    </a>
                    <div class="dropdown-menu quick-actions animated fadeIn">
                        <div class="quick-actions-header">
                            <span class="title mb-1">Quick Actions</span>
                            <span class="subtitle op-7">Shortcuts</span>
                        </div>
                        <div class="quick-actions-scroll scrollbar-outer">
                            <div class="quick-actions-items">
                                <div class="row m-0">
                                    <a class="col-6 col-md-4 p-0" href="{{ route('admin.settings') }}">
                                        <div class="quick-actions-item">
                                            <div class="avatar-item bg-danger rounded-circle">
                                                <i class="fas fa-cog"></i>
                                            </div>
                                            <span class="text">Settings</span>
                                        </div>
                                    </a>
                                    <a class="col-6 col-md-4 p-0" href="{{ route('admin.user.index') }}">
                                        <div class="quick-actions-item">
                                            <div
                                                class="avatar-item bg-warning rounded-circle">
                                                <i class="fas fa-users"></i>
                                            </div>
                                            <span class="text">Users</span>
                                        </div>
                                    </a>
                                    <a class="col-6 col-md-4 p-0" href="{{route('admin.report.sale')}}">
                                        <div class="quick-actions-item">
                                            <div class="avatar-item bg-info rounded-circle">
                                                <i class="fas fa-book"></i>
                                            </div>
                                            <span class="text">Reports</span>
                                        </div>
                                    </a>
                                    <a class="col-6 col-md-4 p-0" href="{{ route('admin.banners.index') }}">
                                        <div class="quick-actions-item">
                                            <div
                                                class="avatar-item bg-success rounded-circle">
                                                <i class="fas fa-newspaper"></i>
                                            </div>
                                            <span class="text">Banners</span>
                                        </div>
                                    </a>
                                    <a class="col-6 col-md-4 p-0" href="{{ route('admin.orders') }}">
                                        <div class="quick-actions-item">
                                            <div
                                                class="avatar-item bg-primary rounded-circle">
                                                <i class="fas fa-cubes"></i>
                                            </div>
                                            <span class="text">Orders</span>
                                        </div>
                                    </a>
                                    <a class="col-6 col-md-4 p-0" href="{{route('admin.packages')}}">
                                        <div class="quick-actions-item">
                                            <div
                                                class="avatar-item bg-secondary rounded-circle">
                                                <i class="fas fa-boxes"></i>
                                            </div>
                                            <span class="text">Packages</span>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>

                <li class="nav-item topbar-user dropdown hidden-caret">
                    <a
                        class="dropdown-toggle profile-pic"
                        data-bs-toggle="dropdown"
                        href="#"
                        aria-expanded="false">
                        <div class="avatar-sm">
                            <img
                                src="{{auth()->user()->image ? asset(auth()->user()->image) : asset('assets/defaultProfile.png') }}"
                                alt="..."
                                class="avatar-img rounded-circle" />
                        </div>
                        <span class="profile-username">
                            <span class="op-7">Hi,</span>
                            <span class="fw-bold">{{auth()->user()->name}}</span>
                        </span>
                    </a>
                    <ul class="dropdown-menu dropdown-user animated fadeIn">
                        <div class="dropdown-user-scroll scrollbar-outer">
                            <li>
                                <div class="user-box">
                                    <div class="avatar-lg">
                                        <img
                                            src="{{auth()->user()->image ? asset(auth()->user()->image) : asset('assets/defaultProfile.png') }}"
                                            alt="image profile"
                                            class="avatar-img rounded" />
                                    </div>
                                    <div class="u-text">
                                        <h4>{{auth()->user()->name}}</h4>
                                        <p class="text-muted">{{auth()->user()->email}}</p>
                                        <!-- <a
                                            href="{{ url('profile') }}"
                                            class="btn btn-xs btn-secondary btn-sm">View Profile</a> -->
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="dropdown-divider"></div>
                                <a class="dropdown-item" href="{{route('admin.profile')}}">My Profile</a>
                                <div class="dropdown-divider"></div>

                                <a class="dropdown-item" href="{{route('logout')}}">Logout</a>
                            </li>
                        </div>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>
</div>
