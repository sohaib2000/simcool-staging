@extends('frontend.layouts.app')

@section('frontent-content')

<!-- Hero Section -->

<section class="hero-section d-flex align-items-center">
    <div class="container">
        <div class="row justify-content-center text-center">
            <div class="col-lg-8" data-aos="fade-up">
                <div class="badge-pill mb-3">
                    <i class="bi bi-geo-alt me-1"></i>Always connected wherever you go
                </div>
                <h1 class="display-5 fw-bold mb-3">
                    Global connection refined for modern <span class="highlight">traveler</span>
                </h1>
                <p class="lead mb-4">Get mobile data anywhere with our prepaid and unlimited eSIM plans for
                    international travel — it’s quick and easy!</p>
                <div class="search-wrapper mx-auto mb-5 position-relative">
                    <input type="text" id="countrySearch" class="form-control" placeholder="Where do you want to travel?">
                    <button class="btn"><i class="bi bi-search"></i></button>

                    <!-- Suggestions dropdown -->
                    <ul id="searchResults" class="list-group position-absolute w-100 shadow-sm mt-1" style="z-index: 1000; display:none;"></ul>
                </div>
                <!-- Plan cards stack -->
                <div class="plan-stack d-flex justify-content-center position-relative mb-4" data-aos="fade-up"
                    data-aos-delay="100">
                    @foreach($esimPackages as $index => $package)
                    <div class="plan-card {{$index == 1 ? 'active' : ''}}">
                        <h5 class="mb-1">{{$package->data}}</h5>
                        <p class="small mb-1">{{$package->day}} days</p>
                        <ul class="list-unstyled small mb-3">
                            <li>{{$package->name}}</li>
                            <li>Use your favourite apps</li>
                        </ul>
                        <button data-bs-toggle="modal" data-bs-target="#downloadAppModal" class="btn btn-outline-primary btn-sm">From ${{$package->net_price}}</button>
                    </div>
                    @endforeach
                </div>
                <!-- Trust rating -->
                <div class="rating-info d-flex align-items-center justify-content-center" data-aos="fade-up"
                    data-aos-delay="200">
                    <div class="me-2">
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-half"></i>
                    </div>
                    <span class="fw-bold">4.8/5</span>
                    <span class="ms-2 small">(47K+ travelers worldwide)</span>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Intro / About Section -->
<section class="intro-section py-5" id="about">
    <div class="container" data-aos="fade-up">
        <p class="text-center intro-text mx-auto">In an age where staying connected is <span
                class="highlight">paramount</span> we stand out as a beacon of <span class="highlight">reliable,
                affordable, and easy</span> connectivity solutions. We ensure that you can travel the world
            without the usual hassle or worrying about exorbitant roaming charges.</p>
    </div>
</section>

<!-- Features Section -->
<section class="features-section py-5" id="plans">
    <div class="container">
        <div class="text-center mb-5" data-aos="fade-up">
            <div class="badge-pill">Think the most benefitted way to connect</div>
            <h2 class="fw-bold mt-2">Enjoy reliable and <span class="highlight">affordable</span> internet in
                your trips</h2>
            <p class="mb-0 lead">Esimtel connects to local networks through your phone’s eSIM, so there’s zero
                hassle with SIM cards or extra phones.</p>
        </div>
        <div class="row g-4">
            <div class="col-md-6" data-aos="fade-up" data-aos-delay="0">
                <div class="feature-box p-4 h-100 bg-feature-1">
                    <div class="feature-icon"><i class="bi bi-infinity"></i></div>
                    <h5 class="fw-semibold mb-2">Unlimited data</h5>
                    <p class="small mb-0">Enjoy unlimited data while travelling to numerous destinations
                        worry‑free.</p>
                </div>
            </div>
            <div class="col-md-6" data-aos="fade-up" data-aos-delay="100">
                <div class="feature-box p-4 h-100 bg-feature-2">
                    <div class="feature-icon"><i class="bi bi-app"></i></div>
                    <h5 class="fw-semibold mb-2">Use your favourite apps</h5>
                    <p class="small mb-0">Get that safe ride home, find that great restaurant and more, all
                        while staying connected.</p>
                </div>
            </div>
            <div class="col-md-6" data-aos="fade-up" data-aos-delay="200">
                <div class="feature-box p-4 h-100 bg-feature-3">
                    <div class="feature-icon"><i class="bi bi-headset"></i></div>
                    <h5 class="fw-semibold mb-2">24/7 Customer support</h5>
                    <p class="small mb-0">Our customer support is just a message away whenever you need help.
                    </p>
                </div>
            </div>
            <div class="col-md-6" data-aos="fade-up" data-aos-delay="300">
                <div class="feature-box p-4 h-100 bg-feature-4">
                    <div class="feature-icon"><i class="bi bi-lightning-charge-fill"></i></div>
                    <h5 class="fw-semibold mb-2">Fast internet connection</h5>
                    <p class="small mb-0">Connect instantly at your destination and get back online with fast
                        mobile data.</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Why Choose Esimtel Section -->
<section class="why-section py-5" id="why">
    <div class="container">
        <div class="text-center mb-5" data-aos="fade-up">
            <div class="badge-pill">Why choose us</div>
            <h2 class="section-title mt-2">Why choose <span class="highlight">Esimtel</span>?</h2>
            <p class="why-text mb-0">We go beyond just providing data. Discover what makes Esimtel the perfect
                travel companion for your next adventure.</p>
        </div>
        <div class="row g-4">
            <div class="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="0">
                <div class="why-card bg-why-1 h-100">
                    <div class="why-icon" style="background: rgba(0,102,255,0.1);"><i class="bi bi-globe2"></i>
                    </div>
                    <h5 class="fw-semibold mb-2">Global coverage</h5>
                    <p class="small mb-0">Stay connected in over 200 countries and regions with one simple eSIM.
                        Wherever you go, Esimtel goes too.</p>
                </div>
            </div>
            <div class="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="100">
                <div class="why-card bg-why-2 h-100">
                    <div class="why-icon" style="background: rgba(0,102,255,0.1);"><i
                            class="bi bi-cash-coin"></i></div>
                    <h5 class="fw-semibold mb-2">Affordable plans</h5>
                    <p class="small mb-0">Transparent pricing with no hidden fees. Choose a data plan that suits
                        your budget and needs.</p>
                </div>
            </div>
            <div class="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="200">
                <div class="why-card bg-why-3 h-100">
                    <div class="why-icon" style="background: rgba(0,102,255,0.1);"><i
                            class="bi bi-lightning"></i></div>
                    <h5 class="fw-semibold mb-2">Instant activation</h5>
                    <p class="small mb-0">Activate your eSIM instantly via email or the app. Get online in
                        minutes and avoid long queues at physical stores.</p>
                </div>
            </div>
            <div class="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="300">
                <div class="why-card bg-why-4 h-100">
                    <div class="why-icon" style="background: rgba(0,102,255,0.1);"><i
                            class="bi bi-shield-check"></i></div>
                    <h5 class="fw-semibold mb-2">Secure & reliable</h5>
                    <p class="small mb-0">Enjoy secure connections with trusted carriers. Our network ensures
                        your data and privacy stay protected.</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- How it works Section -->
<section class="works-section py-5" id="how-it-works">
    <div class="container">
        <div class="row align-items-center g-5">
            <div class="col-lg-6" data-aos="fade-up">
                <div class="badge-pill mb-2">We kept it simple for you</div>
                <h2 class="fw-bold mb-3">How <span class="highlight">Esimtel</span> eSIM works?</h2>
                <p class="mb-4">This is everything you love about your regular mobile network, connecting you
                    when you travel.</p>
                <div class="step mb-3 d-flex align-items-start">
                    <div class="step-num me-3">1</div>
                    <div>
                        <h6 class="fw-semibold mb-1">Download and install the Esimtel app</h6>
                        <p class="small mb-0">Get our app on your device before you leave. It’s available on the
                            App Store and Google Play.</p>
                    </div>
                </div>
                <div class="step mb-3 d-flex align-items-start">
                    <div class="step-num me-3">2</div>
                    <div>
                        <h6 class="fw-semibold mb-1">Activate your eSIM and purchase data plan that suits you
                        </h6>
                        <p class="small mb-0">Activate instantly by scanning the QR code we send to your email,
                            then choose a plan based on your destination.</p>
                    </div>
                </div>
                <div class="step d-flex align-items-start">
                    <div class="step-num me-3">3</div>
                    <div>
                        <h6 class="fw-semibold mb-1">Use your data plan as soon as you arrive</h6>
                        <p class="small mb-0">Use your data as soon as you arrive at your destination and enjoy
                            your trip.</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-6" data-aos="fade-up" data-aos-delay="200">
                <div class="purchase-card p-4">
                    <h6 class="fw-semibold mb-2">Thank you for your purchase</h6>
                    <p class="small mb-3">Scan the QR code to install the eSIM or you can install later via the
                        app.</p>
                    <div class="row g-3 align-items-center mb-3">
                        <div class="col-auto">
                            <img src="https://www.airalo.com/qr?expires=1842086521&id=54557676&signature=77aa54bdf23e4766e4ae25e6b19cef13f78c471069799e2bebb45da928eafda0" alt="QR code" class="img-fluid" width="80"
                                height="80">
                        </div>
                        <div class="col">
                            <p class="small mb-1 fw-semibold">7 days data plan</p>
                            <p class="small mb-1">1 GB - 7 Days</p>
                            <div class="details small">
                                <div><span>Price:</span> $2.00</div>
                                <div><span>Valid:</span> 7 days</div>
                            </div>
                        </div>
                    </div>
                    <button data-bs-toggle="modal" data-bs-target="#downloadAppModal" class="btn btn-primary w-100">Activate eSIM</button>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Destinations Section -->
<section class="destinations-section py-5" id="destinations">
    <div class="container">
        <div class="d-flex justify-content-between align-items-end flex-wrap mb-4" data-aos="fade-up">
            <div>
                <div class="badge-pill mb-2">We’ll see you travel around the world</div>
                <h2 class="fw-bold">Where are you traveling <span class="highlight">next?</span></h2>
                <p class="mb-0">Pick your destination then choose a data plan that fits your needs. Esimtel has
                    regional and global plans for all kinds of travel.</p>
            </div>
            <div class="mt-3 mt-md-0">
                <a href="#" data-bs-toggle="modal" data-bs-target="#downloadAppModal" class="btn btn-dark rounded-pill">View all destinations <i
                        class="bi bi-arrow-right ms-1"></i></a>
            </div>
        </div>
        <div class="row g-4" data-aos="fade-up" data-aos-delay="100">
            <!-- Destination card 1 -->
            @foreach($destinations as $country)
            <div class="col-md-4">
                <div data-bs-toggle="modal" data-bs-target="#downloadAppModal" class="dest-card p-4 h-100">
                    <div class="d-flex align-items-center mb-3">
                        <div class="icon-circle me-3">
                            <img src="{{ $country->image }}" alt="{{ $country->name }}" width="24" height="24">
                        </div>
                        <div>
                            <h6 class="fw-semibold mb-0">{{ $country->name }}</h6>
                            <small class="text-muted">Plans available</small>
                        </div>
                    </div>
                    @php
                    $package = optional($country->operators->first())->esimPackages->first();
                    @endphp

                    <p class="price mb-0">
                        @if ($package)
                        <span class="fw-bold">${{ $package->net_price }}</span> / {{ $package->day }} days
                        @else
                        <span class="text-muted">No packages available</span>
                        @endif
                    </p>
                    <div class="arrow-icon">
                        <i class="bi bi-arrow-right-circle-fill"></i>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
    </div>
</section>

<!-- Testimonials Section -->
<section class="testimonials-section py-5" id="testimonials">
    <div class="container">
        <div class="d-flex justify-content-between align-items-end flex-wrap mb-4" data-aos="fade-up">
            <div>
                <div class="badge-pill mb-2">Happy stories from our customers</div>
                <h2 class="fw-bold">Loved by thousands of <span class="highlight">travelers</span></h2>
                <p class="mb-0">Hear the beautiful stories from our worldwide customers who have been travelling
                    around the world without lost connections.</p>
            </div>
            <div class="mt-3 mt-md-0">
                <a href="#" data-bs-toggle="modal" data-bs-target="#downloadAppModal" class="btn btn-dark rounded-pill">Read more user stories <i
                        class="bi bi-arrow-right ms-1"></i></a>
            </div>
        </div>
        <!-- Testimonials cards -->
        <div class="row g-4 mb-4" data-aos="fade-up" data-aos-delay="100">
            <div class="col-md-4">
                <div class="testimonial-card p-4 h-100">
                    <div class="d-flex align-items-center mb-2">
                        <div class="avatar me-3"><i class="bi bi-person-circle"></i></div>
                        <div>
                            <h6 class="fw-semibold mb-0">Eleanor Jenkins</h6>
                            <small class="text-muted">From United States</small>
                        </div>
                    </div>
                    <p class="small mb-3">“Esimtel has made my trips much easier! I can buy a plan at home and
                        activate it abroad without worry. The data packages are affordable and the support is
                        helpful. Highly recommend it!”</p>
                    <div class="stars mb-1">
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                    </div>
                    <small class="text-muted">South Korea<br>24 December 2024</small>
                </div>
            </div>
            <div class="col-md-4">
                <div class="testimonial-card p-4 h-100">
                    <div class="d-flex align-items-center mb-2">
                        <div class="avatar me-3"><i class="bi bi-person-circle"></i></div>
                        <div>
                            <h6 class="fw-semibold mb-0">David Lopez</h6>
                            <small class="text-muted">From Mexico</small>
                        </div>
                    </div>
                    <p class="small mb-3">“I bought an eSIM to travel to Colombia for one week and I had fast
                        data during my trip. I didn’t have any issue with the activation; it was fast, indeed.”
                    </p>
                    <div class="stars mb-1">
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                    </div>
                    <small class="text-muted">Colombia<br>28 August 2024</small>
                </div>
            </div>
            <div class="col-md-4">
                <div class="testimonial-card p-4 h-100">
                    <div class="d-flex align-items-center mb-2">
                        <div class="avatar me-3"><i class="bi bi-person-circle"></i></div>
                        <div>
                            <h6 class="fw-semibold mb-0">Abraham Dior</h6>
                            <small class="text-muted">From Indonesia</small>
                        </div>
                    </div>
                    <p class="small mb-3">“The app was so easy to use; the services are great and the customer
                        support is top! It’s a great deal for the telephone service.”</p>
                    <div class="stars mb-1">
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                    </div>
                    <small class="text-muted">United States<br>16 July 2024</small>
                </div>
            </div>
        </div>
        <!-- Overall rating -->
        <div class="rating-summary d-flex align-items-center" data-aos="fade-up" data-aos-delay="200">
            <h1 class="mb-0 me-2 fw-bold">4.8</h1>
            <div class="me-2 fw-semibold">/5</div>
            <small class="text-muted">47,000+ happy customers based on compliments and customer reviews on
                Trustpilot</small>
        </div>
    </div>
</section>

<!-- FAQ Section -->
<section class="faq-section py-5" id="faq">
    <div class="container">
        <div class="text-center mb-5" data-aos="fade-up">
            <div class="badge-pill">Have questions?</div>
            <h2 class="section-title mt-2">Frequently Asked <span class="highlight">Questions</span></h2>
            <p class="why-text mb-0">Here are answers to some common questions about how Esimtel works. If you
                need more help, our support team is just a message away.</p>
        </div>
        <div class="accordion" id="faqAccordion" data-aos="fade-up" data-aos-delay="100">
            @foreach($faqs as $faq)
            <div class="accordion-item">
                <h2 class="accordion-header" id="{{$faq->id}}-heading">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                        data-bs-target="#faqOne{{$faq->id}}" aria-expanded="false" aria-controls="faqOne">
                        {{$faq->question}}
                    </button>
                </h2>
                <div id="faqOne{{$faq->id}}" class="accordion-collapse collapse" aria-labelledby="{{$faq->id}}-heading"
                    data-bs-parent="#faqAccordion">
                    <div class="accordion-body">
                        {{$faq->answer}}
                    </div>
                </div>
            </div>
            @endforeach
        </div>
    </div>
</section>

<!-- Download Section -->
<section class="download-section py-5" id="download">
    <div class="container">
        <div class="row justify-content-center text-center" data-aos="fade-up">
            <div class="col-lg-9">
                <div class="badge-pill mb-3">Always connected wherever you go</div>
                <h2 class="fw-bold mb-3">Download the app and manage your plan <span
                        class="highlight">easily</span></h2>
                <p class="lead mb-4">Get mobile data anywhere with our prepaid and unlimited eSIM plans for
                    international travel — it’s quick and easy!</p>
                <div class="d-flex justify-content-center gap-3">
                    <a href="https://play.google.com/store/apps/details?id={{systemflag('androidPackageName')}}">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                            alt="Get it on Google Play" class="store-badge" height="52">
                    </a>

                </div>
            </div>
        </div>
    </div>
</section>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script>
    $(document).ready(function() {
        $("#countrySearch").on("keyup", function() {
            let query = $(this).val();
            if (query.length >= 2) {
                $.ajax({
                    url: "{{ route('search.countries') }}",
                    type: "GET",
                    data: {
                        q: query
                    },
                    success: function(data) {
                        let results = $("#searchResults");
                        results.empty().show();
                        if (data.length > 0) {
                            data.forEach(function(item) {
                                let iconHtml = "";
                                if (item.image) {
                                    iconHtml = `<img src="${item.image}" class="me-2 rounded" width="20" height="20" alt="${item.name}">`;
                                } else {
                                    iconHtml = `<i class="bi bi-globe me-2"></i>`;
                                }

                                results.append(
                                    `<li class="list-group-item list-group-item-action search-item"
                                    data-id="${item.id}" data-type="${item.type}">
                                    ${iconHtml} ${item.name}
                                </li>`
                                );
                            });
                        } else {
                            results.append(`<li class="list-group-item text-muted">No results found</li>`);
                        }
                    }
                });
            } else {
                $("#searchResults").hide();
            }
        });

        // On click
        $(document).on("click", ".search-item", function() {
            let name = $(this).text().trim();
            $("#countrySearch").val(name);
            $("#searchResults").hide();
            $("#downloadAppModal").modal('show');
        });
    });
</script>



@endsection
