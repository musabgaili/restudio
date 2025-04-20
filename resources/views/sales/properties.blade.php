@extends('layouts.sales')

@section('content')
    <div id="app">
        <properties-page></properties-page>
    </div>
@endsection

{{-- @push('scripts')
<script>
    const app = createApp({})
    app.component('property-details-panel', PropertyDetailsPanel)
    app.mount('#app')
</script>
@endpush --}}
