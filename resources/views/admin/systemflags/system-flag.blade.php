@extends('layouts.app')

@section('content')
<div class="row">
    <div class="col-md-12">
        <form method="POST" enctype="multipart/form-data" id="edit-form">
            @csrf
            <div class="card shadow-sm border-0">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h4 class="card-title mb-0">General Settings</h4>
                    <button type="submit" class="btn btn-primary shadow-sm">
                        <i class="fa fa-save me-1"></i> Save Settings
                    </button>
                </div>

                <div class="card-body">
                    {{-- Tabs --}}
                    <ul class="nav nav-pills mb-4" role="tablist">
                        @foreach ($flagGroup as $group)

                        <li class="nav-item">
                            <button class="nav-link {{ $loop->first ? 'active' : '' }}"
                                data-bs-toggle="pill"
                                data-bs-target="#group{{ $group->id }}"
                                type="button" role="tab">
                                <i class="fa fa-cog me-1"></i> {{ $group->flagGroupName }}
                            </button>
                        </li>

                        @endforeach
                    </ul>

                    {{-- Tab Content --}}
                    <div class="tab-content">
                        @foreach ($flagGroup as $gIndex => $group)
                        <div id="group{{ $group->id }}" class="tab-pane fade {{ $loop->first ? 'show active' : '' }}">

                            {{-- Main Group Flags --}}

                            @foreach ($group->systemFlag->where('valueType', 'PaymentRadio') as $sIndex => $flag)
                            <div class="mb-4 p-3 border rounded shadow-sm bg-light">
                                <label class="form-label fw-bold">
                                    {{ $flag->displayName }}
                                    @if ($flag->description)
                                    <i class="fa fa-info-circle text-muted ms-1" data-bs-toggle="tooltip" title="{{ $flag->description }}"></i>
                                    @endif
                                </label>

                                <input type="hidden" name="group[{{ $gIndex }}][systemFlag][{{ $sIndex }}][name]" value="{{ $flag->name }}">
                                <input type="hidden" name="group[{{ $gIndex }}][systemFlag][{{ $sIndex }}][valueType]" value="{{ $flag->valueType }}">

                                <div class="d-flex gap-4 mt-2">
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio"
                                            name="group[{{ $gIndex }}][systemFlag][{{ $sIndex }}][value]"
                                            value="1" {{ $flag->value == '1' ? 'checked' : '' }}>
                                        <label class="form-check-label">Enable</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio"
                                            name="group[{{ $gIndex }}][systemFlag][{{ $sIndex }}][value]"
                                            value="0" {{ $flag->value == '0' ? 'checked' : '' }}>
                                        <label class="form-check-label">Disabled</label>
                                    </div>
                                </div>
                            </div>
                            @endforeach

                            @foreach ($group->systemFlag->where('valueType', 'EsimProviderRadio') as $sIndex => $flag)
                            <div class="mb-4 p-3 border rounded shadow-sm bg-light">
                                <label class="form-label fw-bold">
                                    {{ $flag->displayName }}
                                    @if ($flag->description)
                                    <i class="fa fa-info-circle text-muted ms-1" data-bs-toggle="tooltip" title="{{ $flag->description }}"></i>
                                    @endif
                                </label>

                                <input type="hidden" name="group[{{ $gIndex }}][systemFlag][{{ $sIndex }}][name]" value="{{ $flag->name }}">
                                <input type="hidden" name="group[{{ $gIndex }}][systemFlag][{{ $sIndex }}][valueType]" value="{{ $flag->valueType }}">

                                <div class="d-flex gap-4 mt-2">
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio"
                                            name="group[{{ $gIndex }}][systemFlag][{{ $sIndex }}][value]"
                                            value="airalo" {{ $flag->value == 'airalo' ? 'checked' : '' }}>
                                        <label class="form-check-label">Airalo</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio"
                                            name="group[{{ $gIndex }}][systemFlag][{{ $sIndex }}][value]"
                                            value="esimaccess" {{ $flag->value == 'esimaccess' ? 'checked' : '' }}>
                                        <label class="form-check-label">Esim Access</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio"
                                            name="group[{{ $gIndex }}][systemFlag][{{ $sIndex }}][value]"
                                            value="esimgo" {{ $flag->value == 'esimgo' ? 'checked' : '' }}>
                                        <label class="form-check-label">Esim Go</label>
                                    </div>
                                </div>
                            </div>
                            @endforeach

                            {{-- Then render all others --}}
                            @foreach ($group->systemFlag->whereNotIn('valueType',['PaymentRadio','GatewayRadio','PaymentModeSelect','EsimProviderRadio']) as $sIndex => $flag)
                            @if($flag->displayName != 'App Language')
                            <div class="mb-4 p-3 border rounded shadow-sm bg-light">
                                <label class="form-label fw-bold">
                                    {{ $flag->displayName }} @if($flag->displayName == 'Referral Points') (This feature is coming soon) @endif
                                    @if ($flag->description)
                                    <i class="fa fa-info-circle text-muted ms-1" data-bs-toggle="tooltip" title="{{ $flag->description }}"></i>
                                    @endif
                                </label>

                                <input type="hidden" name="group[{{ $gIndex }}][systemFlag][{{ $sIndex }}][name]" value="{{ $flag->name }}">
                                <input type="hidden" name="group[{{ $gIndex }}][systemFlag][{{ $sIndex }}][valueType]" value="{{ $flag->valueType }}">
                                @if($flag->valueType == 'timezoneSelect')
                                <select name="group[{{ $gIndex }}][systemFlag][{{ $sIndex }}][value]" class="form-control select2">
                                    @foreach (DateTimeZone::listIdentifiers() as $tz)
                                    <option value="{{ $tz }}" {{ $flag->value == $tz ? 'selected' : '' }}>
                                        {{ $tz }}
                                    </option>
                                    @endforeach
                                </select>
                                @endif
                                @if($flag->valueType == 'defaultCurrencySelect')
                                <select name="group[{{ $gIndex }}][systemFlag][{{ $sIndex }}][value]" {{!empty($flag->value) ? 'disabled' : ''}} class="form-control select2">
                                    <option value="">Select Currency</option>
                                    @foreach ($currencies as $currency)
                                    <option value="{{ $currency->name }}" {{ $flag->value == $currency->name ? 'selected' : '' }}>
                                        {{ $currency->name }}
                                    </option>
                                    @endforeach
                                </select>
                                @if(!empty($flag->value))
                                <input type="hidden"
                                    name="group[{{ $gIndex }}][systemFlag][{{ $sIndex }}][value]"
                                    value="{{ $flag->value }}">
                                @endif
                                @endif
                                @if($flag->valueType == 'AiraloSyncDataButton')
                                <a href="{{route('admin.syncAiralo')}}" class="btn btn-primary">Sync</a>
                                @endif
                                @if(systemflag('paymentMode'))
                                @if($flag->valueType == 'SyncToGoogleDataButton')
                                <a href="{{route('admin.syncGoogle')}}" class="btn btn-success">Sync</a>
                                @endif
                                @if($flag->valueType == 'SyncToAppleDataButton')
                                <a href="{{route('admin.syncApple')}}" class="btn btn-warning">Sync</a>
                                @endif
                                @endif
                                @if($flag->valueType == 'EsimaccessSyncDataButton')
                                <a href="{{route('admin.syncEsimaccess')}}" class="btn btn-danger">Sync</a>
                                @endif
                                @if($flag->valueType == 'EsimgoSyncDataButton')
                                <a href="{{route('admin.syncEsimgo')}}" class="btn btn-info">Sync</a>
                                @endif
                                @if($flag->valueType == 'Text')
                                <input type="text" class="form-control mt-1"
                                    name="group[{{ $gIndex }}][systemFlag][{{ $sIndex }}][value]"
                                    value="{{ $flag->value}}">
                                @elseif($flag->valueType == 'Number')
                                <input type="number" class="form-control mt-1"
                                    name="group[{{ $gIndex }}][systemFlag][{{ $sIndex }}][value]"
                                    value="{{ $flag->value }}">
                                @elseif($flag->valueType == 'File')
                                <div class="mb-3">
                                    <div class="mt-2">
                                        @if($flag->value)
                                        <div class="current-image mb-3">
                                            <p class="small text-muted mb-1">Current image:</p>
                                            <img src="/{{ $flag->value }}" class="img-thumbnail" style="max-width: 200px; max-height: 140px;">
                                        </div>
                                        @endif

                                        <div class="file-upload">
                                            <label class="form-label small">Upload new image:</label>
                                            <input type="file"
                                                class="form-control"
                                                name="group[{{ $gIndex }}][systemFlag][{{ $sIndex }}][value]"
                                                accept="image/*"
                                                onchange="previewImage(this, 'preview_{{ $gIndex }}_{{ $sIndex }}')">
                                            <small class="form-text text-muted">Leave empty to keep current image</small>

                                            <!-- Preview area -->
                                            <div id="preview_{{ $gIndex }}_{{ $sIndex }}" class="mt-2" style="display: none;">
                                                <p class="small text-success mb-1">New image preview:</p>
                                                <img class="img-thumbnail" style="max-width: 200px; max-height: 140px;">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                @elseif($flag->valueType == 'MultiSelect')

                                @php $selected = explode(',', $flag->value); @endphp
                                {{-- <select name="group[{{ $gIndex }}][systemFlag][{{ $sIndex }}][value][]"
                                class="form-control select2" multiple>
                                @foreach($language as $lan)
                                <option value="{{ $lan->id }}" {{ in_array($lan->id, $selected) ? 'selected' : '' }}>
                                    {{ $lan->languageName }}
                                </option>
                                @endforeach
                                </select> --}}
                                @endif
                            </div>
                            @endif
                            @endforeach

                            {{-- Sub Groups --}}
                            @if($group->subGroup->count())
                            <div class="mt-4">
                                @foreach ($group->subGroup as $sgIndex => $sub)
                                <h5 class="fw-bold text-primary mt-3">{{ $sub->flagGroupName }}
                                    @if ($flag->description)
                                    <i class="fa fa-info-circle text-muted ms-1" data-bs-toggle="tooltip" title="{{ $sub->description }}"></i>
                                    @endif
                                </h5>
                                <hr>
                                @foreach ($sub->systemFlag as $ssIndex => $flag)
                                <input type="hidden"
                                    name="group[{{ $gIndex }}][subGroup][{{ $sgIndex }}][systemFlag][{{ $ssIndex }}][name]"
                                    value="{{ $flag->name }}">
                                @if($flag->valueType == 'GatewayRadio')
                                <div class="d-flex gap-4 mt-2">
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio"
                                            name="group[{{ $gIndex }}][subGroup][{{ $sgIndex }}][systemFlag][{{ $ssIndex }}][value]"
                                            value="1" {{ $flag->value == 1 ? 'checked' : '' }}>
                                        <label class="form-check-label">Active</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio"
                                            name="group[{{ $gIndex }}][subGroup][{{ $sgIndex }}][systemFlag][{{ $ssIndex }}][value]"
                                            value="0" {{ $flag->value == 0 ? 'checked' : '' }}>
                                        <label class="form-check-label">InActive</label>
                                    </div>
                                </div>
                                @elseif($flag->valueType == 'PaymentModeSelect')
                                <div class="mb-3">
                                    <label class="form-label">{{ $flag->displayName }}
                                        @if ($flag->description)
                                        <i class="fa fa-info-circle text-muted ms-1" data-bs-toggle="tooltip" title="{{ $flag->description }}"></i>
                                        @endif
                                    </label>
                                    <select class="form-control" name="group[{{ $gIndex }}][subGroup][{{ $sgIndex }}][systemFlag][{{ $ssIndex }}][value]" id="">
                                        <option value="0" {{$flag->value == 0 ? 'selected' : ''}}>TEST</option>
                                        <option value="1" {{$flag->value == 1 ? 'selected' : ''}}>PRODUCTION</option>
                                    </select>
                                </div>
                                @else
                                <div class="mb-3">
                                    <label class="form-label">{{ $flag->displayName }}
                                        @if ($flag->description)
                                        <i class="fa fa-info-circle text-muted ms-1" data-bs-toggle="tooltip" title="{{ $flag->description }}"></i>
                                        @endif
                                    </label>

                                    <input type="{{ strtolower($flag->valueType) == 'number' ? 'number' : 'text' }}"
                                        class="form-control"
                                        name="group[{{ $gIndex }}][subGroup][{{ $sgIndex }}][systemFlag][{{ $ssIndex }}][value]"
                                        value="{{ $flag->value }}">
                                </div>
                                @endif
                                @endforeach
                                @endforeach
                            </div>
                            @endif
                        </div>
                        @endforeach
                    </div>
                </div>
            </div>
        </form>
    </div>
</div>
@endsection

@push('scripts')
<script>
    $(function() {
        $('[data-bs-toggle="tooltip"]').tooltip();

        $('#edit-form').submit(function(e) {
            e.preventDefault();
            let formData = new FormData(this);

            $.ajax({
                type: 'POST',
                url: "{{ route('admin.updateSystemflag') }}",
                data: formData,
                processData: false,
                contentType: false,
                success: function(res) {
                    toastr.success('Settings updated successfully!');
                },
                error: function(xhr) {
                    toastr.error('Something went wrong.');
                    console.error(xhr.responseText);
                }
            });
        });
    });
</script>
<script>
    function previewImage(input, previewId) {
        const preview = document.getElementById(previewId);
        const img = preview.querySelector('img');

        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                img.src = e.target.result;
                preview.style.display = 'block';
            }
            reader.readAsDataURL(input.files[0]);
        } else {
            preview.style.display = 'none';
        }
    }
</script>
@endpush
