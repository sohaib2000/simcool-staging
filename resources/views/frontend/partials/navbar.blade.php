<!-- Navigation -->
<nav class="navbar navbar-expand-lg navbar-light fixed-top">
    <div class="container">
        <a class="navbar-brand d-flex align-items-center" href="{{url('/')}}">
            <img src="{{asset(systemflag('favicon'))}}" alt="Esimtel logo" height="32" class="me-2">
            <span class="brand-text fw-bold">{{systemflag('appName')}}</span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto align-items-lg-center">
                <li class="nav-item"><a class="nav-link active" href="{{url('/')}}">Home</a></li>
                <li class="nav-item"><a class="nav-link" href="#plans">Plans</a></li>
                <li class="nav-item"><a class="nav-link" href="#destinations">Destinations</a></li>
                <li class="nav-item"><a class="nav-link" href="#about">About</a></li>
                <li class="nav-item"><a class="btn btn-primary ms-lg-3" data-bs-toggle="modal" data-bs-target="#downloadAppModal" href="#download">Download</a></li>
            </ul>
        </div>
    </div>
</nav>
