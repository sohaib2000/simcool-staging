  <!-- Footer -->
  <footer class="footer-section pt-5 pb-3">
      <div class="container">
          <div class="row g-4 mb-4" data-aos="fade-up">
              <div class="col-lg-4">
                  <div class="d-flex align-items-center mb-3">
                      <img src="{{asset(systemflag('favicon'))}}" alt="logo" height="32" class="me-2">
                      <span class="brand-text fw-bold fs-5">{{systemflag('appName')}}</span>
                  </div>
                  <p class="small">Get mobile data anywhere with our prepaid and unlimited eSIM plans for
                      international travel — it’s quick and easy!</p>
                  <form class="subscribe-form d-flex mt-3">
                      <input type="email" class="form-control me-2" placeholder="Enter your email address...">
                      <button class="btn btn-primary" type="submit"><i class="bi bi-arrow-right"></i></button>
                  </form>
                  <div class="social-icons d-flex mt-3 gap-3">
                      <a href="#" class="text-reset"><i class="bi bi-facebook"></i></a>
                      <a href="#" class="text-reset"><i class="bi bi-instagram"></i></a>
                      <a href="#" class="text-reset"><i class="bi bi-twitter"></i></a>
                      <a href="#" class="text-reset"><i class="bi bi-linkedin"></i></a>
                  </div>
              </div>
              <div class="col-lg-8">
                  <div class="row g-4">
                      <div class="col-6 col-md-3">
                          <h6 class="fw-semibold mb-3">Navigation</h6>
                          <ul class="list-unstyled">
                              <li><a href="{{url('/')}}">Home</a></li>
                              <li><a href="#plans">Plans</a></li>
                              <li><a href="#destinations">Destinations</a></li>
                              <li><a href="#about">About us</a></li>
                              <li><a href="#download">Downloads</a></li>
                          </ul>
                      </div>
                      <div class="col-6 col-md-3">
                          <h6 class="fw-semibold mb-3">Top destinations</h6>
                          <ul class="list-unstyled">
                              <li><a href="#">Europe</a></li>
                              <li><a href="#">USA</a></li>
                              <li><a href="#">Japan</a></li>
                              <li><a href="#">Indonesia</a></li>
                              <li><a href="#">Korea</a></li>
                              <li><a href="#">Netherlands</a></li>
                          </ul>
                      </div>
                      <div class="col-6 col-md-3">
                          <h6 class="fw-semibold mb-3">Help & services</h6>
                          <ul class="list-unstyled">
                              <li><a href="#">Customer services</a></li>
                              <li><a href="#">Supported Devices</a></li>
                              <li><a href="#">FAQ</a></li>
                              <li><a href="#">Refund Policy</a></li>
                              <li><a href="#">Website Terms of Use</a></li>
                          </ul>
                      </div>
                      <div class="col-6 col-md-3">
                          <h6 class="fw-semibold mb-3">Interest</h6>
                          <ul class="list-unstyled">
                              <li><a href="#">What is an eSIM</a></li>
                              <li><a href="#">How to activate your eSIM</a></li>
                              <li><a href="#">Data calculator</a></li>
                          </ul>
                      </div>
                  </div>
              </div>
          </div>
          <div class="d-flex justify-content-between align-items-center border-top pt-3 small">
              <div>© {{date('Y')}} {{systemflag('appName')}}. All rights reserved.</div>
              <div>
                  <a href="{{route('pages','terms-and-conditions')}}" class="me-3">Terms and conditions</a>
                  <a href="{{route('pages','privacy-policy')}}">Privacy Policy</a>
              </div>
          </div>
      </div>
  </footer>
  <!-- Download App Modal -->
  <div class="modal fade" id="downloadAppModal" tabindex="-1" aria-labelledby="downloadAppLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 shadow-lg rounded-4">
              <div class="modal-body p-5 text-center">
                  <button type="button" class="btn-close position-absolute top-0 end-0 m-3"
                      data-bs-dismiss="modal" aria-label="Close"></button>

                  <!-- App Icon / Illustration -->
                  <div class="mb-4">
                      <img src="https://cdn-icons-png.flaticon.com/512/888/888857.png"
                          alt="App Icon" class="rounded-3 shadow" width="80">
                  </div>

                  <h3 class="fw-bold mb-2">Get the Esimtel App</h3>
                  <p class="text-muted mb-4">Manage your eSIM plans anytime, anywhere. Stay connected globally with just a tap!</p>

                  <!-- Store Buttons -->
                  <div class="d-flex justify-content-center gap-3 flex-wrap">
                      <a href="https://play.google.com/store/apps/details?id={{systemflag('androidPackageName')}}"
                          target="_blank">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                              alt="Get it on Google Play" height="55">
                      </a>
                  </div>

                  <!-- QR Code Option -->
                  <div class="mt-4">
                      <p class="small text-muted mb-2">Or scan the QR code:</p>
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://play.google.com/store/apps/details?id={{systemflag('androidPackageName')}}"
                          alt="QR Code" class="img-fluid rounded shadow-sm">
                  </div>
              </div>
          </div>
      </div>
  </div>
