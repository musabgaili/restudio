/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */
import './bootstrap';
import { createApp } from 'vue';
import * as bootstrap from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
window.bootstrap = bootstrap;

// Globally register PhotoSphereViewer (optional, component import is preferred)
import PhotoSphereViewer from 'photo-sphere-viewer';
import 'photo-sphere-viewer/dist/photo-sphere-viewer.css';
window.PhotoSphereViewer = PhotoSphereViewer;

/**
 * Next, we will create a fresh Vue application instance. You may then begin
 * registering components with the application instance so they are ready
 * to use in your application's views. An example is included for you.
 */

const app = createApp({});

// Virtual Tours components
import VirtualTourSphere from './components/SphereView/VirtualTourSphere.vue';
app.component('virtual-tour-sphere', VirtualTourSphere);

/**
 * Finally, we will attach the application instance to a HTML element with
 * an "id" attribute of "app". This element is included with the "auth"
 * scaffolding. Otherwise, you will need to add correspondending HTML to
 * the view that renders your application.
 */



// Crm Property components
import PropertiesPage from './components/PropertiesPage.vue'
import PropertiesTable from './components/PropertiesTable.vue'
import PropertyRow from './components/PropertyRow.vue'
import PropertyDetailsPanel from './components/PropertyDetailsPanel.vue'

app.component('properties-page', PropertiesPage)
app.component('properties-table', PropertiesTable)
app.component('property-row', PropertyRow)
app.component('property-details-panel', PropertyDetailsPanel)



/**
 * The following block of code may be used to automatically register your
 * Vue components. It will recursively scan this directory for the Vue
 * components and automatically register them with their "basename".
 *
 * Eg. ./components/ExampleComponent.vue -> <example-component></example-component>
 */

// Object.entries(import.meta.glob('./**/*.vue', { eager: true })).forEach(([path, definition]) => {
//     app.component(path.split('/').pop().replace(/\.\w+$/, ''), definition.default);
// });

/**
 * Finally, we will attach the application instance to a HTML element with
 * an "id" attribute of "app". This element is included with the "auth"
 * scaffolding. Otherwise, you will need to add an element yourself.
 */

app.mount('#app');
