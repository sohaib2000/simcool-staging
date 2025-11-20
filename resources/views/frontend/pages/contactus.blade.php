@extends('frontend.layouts.app')

@section('frontent-content')

<section class="privacy-policy-section py-5">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-10">
                <div class="text-center mb-5" data-aos="fade-up">
                    <h1 class="fw-bold mt-2">
                        Get In touch
                    </h1>
                </div>

                <div class="privacy-content">
                    <p class="lead text-center mb-5" data-aos="fade-up" data-aos-delay="100">
                        We're here to help! Whether you have questions, feedback, or need support, our team is ready to assist you. Fill out the form below or use our contact details.
                    </p>

                    <div class="long-description">
                        <div class="row g-5">
                            <div class="col-md-7" data-aos="fade-right" data-aos-delay="200">
                                <h2 class="fw-bold mb-4">Send Us a Message</h2>
                                @if(session('success'))
                                <p class="text-success">{{session('success')}}</p>
                                @endif
                                <form action="{{route('contactUs')}}" method="post">
                                    @csrf
                                    <div class="mb-3">
                                        <label for="name" class="form-label">Your Name</label>
                                        <input type="text" class="form-control" id="name" name="name" placeholder="Name.." required="" fdprocessedid="b0k5m">
                                    </div>

                                    <div class="mb-3">
                                        <label for="email" class="form-label">Email Address</label>
                                        <input type="email" class="form-control" id="email" name="email" placeholder="you@example.com" required="" fdprocessedid="8z7lyn">
                                    </div>

                                    <div class="mb-3">
                                        <label for="subject" class="form-label">Subject</label>
                                        <input type="text" class="form-control" id="subject" name="subject" placeholder="" required="" fdprocessedid="o34gro">
                                    </div>

                                    <div class="mb-4">
                                        <label for="message" class="form-label">Your Message</label>
                                        <textarea class="form-control" id="message" name="message" rows="5" placeholder="Enter your detailed message here..." required=""></textarea>
                                    </div>

                                    <button type="submit" class="btn btn-primary btn-lg w-100" fdprocessedid="pj9p4k">Submit</button>
                                </form>
                            </div>

                            <div class="col-md-5" data-aos="fade-left" data-aos-delay="300">
                                <h2 class="fw-bold mb-4">Our Details</h2>

                                <!-- Address Block -->
                                <div class="d-flex align-items-start mb-4">
                                    <!-- Assuming Font Awesome icons are available -->
                                    <i class="fas fa-map-marker-alt fa-2x text-primary me-3 mt-1"></i>
                                    <div>
                                        <h5 class="fw-bold">Office Address</h5>
                                        <p class="mb-0">123 Corporate Tower, Suite 456<br>San Francisco, CA 90210, USA</p>
                                    </div>
                                </div>

                                <!-- Phone Block -->
                                <div class="d-flex align-items-start mb-4">
                                    <i class="fas fa-phone-alt fa-2x text-primary me-3 mt-1"></i>
                                    <div>
                                        <h5 class="fw-bold">Call Us</h5>
                                        <p class="mb-0"><a href="tel:+15551234567" class="text-decoration-none text-dark">(+1) 555-123-4567</a></p>
                                    </div>
                                </div>

                                <!-- Email Block -->
                                <div class="d-flex align-items-start mb-4">
                                    <i class="fas fa-envelope fa-2x text-primary me-3 mt-1"></i>
                                    <div>
                                        <h5 class="fw-bold">Email Us</h5>
                                        <p class="mb-0"><a href="mailto:support@example.com" class="text-decoration-none text-dark">support@example.com</a></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

@endsection