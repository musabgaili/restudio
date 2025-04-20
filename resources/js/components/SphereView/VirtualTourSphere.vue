<template>
    <div class="container-fluid">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-md-3 sidebar">
          <h3 class="mb-4">360° Panorama Tour Creator</h3>

          <div class="mb-4">
            <label for="image-upload" class="form-label">Upload Images</label>
            <input type="file" id="image-upload" class="form-control" accept="image/*" multiple @change="handleImageUpload">
          </div>

          <div class="mb-4">
            <button class="btn btn-primary" @click="enableLinking">Create Link</button>
          </div>

          <h5 class="mt-4 mb-3">Uploaded Images</h5>
          <ul class="mb-4">
            <li
              v-for="(img, name) in uploadedImages"
              :key="name"
              :class="{ 'fw-bold': name === currentImageName }"
              style="cursor: pointer"
              @click="loadImage(name)"
            >
              {{ name }}
            </li>
          </ul>
        </div>

        <!-- Main Content -->
        <div class="col-md-9 p-0">
          <div ref="panoramaContainer" style="width: 100%; height: 500px;"></div>
        </div>
      </div>

      <!-- Modal -->
      <div class="modal fade" id="linkModal" tabindex="-1" aria-labelledby="linkModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="linkModalLabel">Select Target Image</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label for="target-image-select">Choose an image to link to:</label>
                <select id="target-image-select" class="form-select mt-2" v-model="targetImageName">
                  <option value="" disabled selected>-- Select an image --</option>
                  <option v-for="(img, name) in filteredImages" :key="name" :value="name">{{ name }}</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="cancelLink">Cancel</button>
              <button type="button" class="btn btn-primary" @click="confirmLink" :disabled="!targetImageName">Confirm Link</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <script>
  import {Viewer} from 'photo-sphere-viewer';
  import { MarkersPlugin } from 'photo-sphere-viewer/dist/plugins/markers';
  import * as bootstrap from 'bootstrap'; // Import Bootstrap for modal

  export default {
    data() {
      return {
        panoramaContainer: null,
        uploadedImages: {},
        currentImageName: null,
        viewer: null,
        isLinking: false,
        pendingHotspot: null,
        linkModal: null,
        targetImageName: '',
      };
    },
    computed: {
      filteredImages() {
        return Object.keys(this.uploadedImages).filter(name => name !== this.currentImageName);
      },
    },
    mounted() {
      this.panoramaContainer = this.$refs.panoramaContainer;
      this.linkModal = new bootstrap.Modal(document.getElementById('linkModal'));
      if (this.panoramaContainer) {
        this.panoramaContainer.addEventListener('click', this.handlePanoramaClick);
      }
    },
    beforeUnmount() {
      if (this.panoramaContainer) {
        this.panoramaContainer.removeEventListener('click', this.handlePanoramaClick);
      }
      if (this.viewer) {
        this.viewer.destroy();
      }
    },
    methods: {
      loadImage(name) {
        if (!this.uploadedImages[name]) return;
        this.currentImageName = name;

        if (this.viewer) {
          this.viewer.destroy();
          this.viewer = null;
        }

        try {
          this.viewer = new new Viewer({
            container: this.panoramaContainer,
            panorama: this.uploadedImages[name].url,
            navbar: ['zoom', 'fullscreen'],
            loadingTxt: 'Loading...',
            plugins: [
              [MarkersPlugin, {
                markers: this.uploadedImages[name].hotspots || []
              }]
            ]
          });

          this.viewer.once('ready', () => {
            const markersPlugin = this.viewer.getPlugin(MarkersPlugin);
            if (markersPlugin) {
              markersPlugin.on('select-marker', (e, marker) => {
                if (marker && marker.data && marker.data.target) {
                  this.loadImage(marker.data.target);
                }
              });
            }
          });
        } catch (error) {
          console.error("Error initializing PhotoSphereViewer:", error);
        }
      },
      handleImageUpload(event) {
        const files = event.target.files;
        for (const file of files) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageName = file.name;
            this.uploadedImages[imageName] = {
              url: e.target.result,
              hotspots: []
            };
            if (!this.currentImageName) {
              this.loadImage(imageName);
            }
          };
          reader.readAsDataURL(file);
        }
        event.target.value = ''; // Reset the input
      },
      enableLinking() {
        if (!this.currentImageName || !this.viewer) {
          alert("Please upload and select an image first.");
          return;
        }
        this.isLinking = true;
        alert("Click on the panorama to place a hotspot on the current image.");
      },
      handlePanoramaClick(event) {
        if (this.isLinking && this.viewer && this.currentImageName) {
          const markersPlugin = this.viewer.getPlugin(MarkersPlugin);
          if (markersPlugin) {
            const position = this.viewer.getPosition();
            const hotspotId = `hotspot-${Date.now()}`;
            const newHotspot = {
              id: hotspotId,
              longitude: position.longitude,
              latitude: position.latitude,
              html: '<div class="hotspot"></div>',
              tooltip: 'Link',
              data: { target: null }
            };

            if (!this.uploadedImages[this.currentImageName].hotspots) {
              this.uploadedImages[this.currentImageName].hotspots = [];
            }
            this.uploadedImages[this.currentImageName].hotspots.push(newHotspot);
            markersPlugin.addMarker(newHotspot);

            this.isLinking = false;
            this.pendingHotspot = newHotspot;
            this.targetImageName = ''; // Reset target image selection
            this.linkModal.show();
          }
        }
      },
      confirmLink() {
        if (this.pendingHotspot && this.targetImageName && this.uploadedImages[this.targetImageName]) {
          this.pendingHotspot.data.target = this.targetImageName;
          this.pendingHotspot.tooltip = `Go to ${this.targetImageName}`;

          const markersPlugin = this.viewer.getPlugin(MarkersPlugin);
          if (markersPlugin) {
            markersPlugin.updateMarker(this.pendingHotspot);
          }

          this.pendingHotspot = null;
          this.linkModal.hide();
        } else {
          alert("Please select a valid target image.");
        }
      },
      cancelLink() {
        if (this.pendingHotspot) {
          const markersPlugin = this.viewer.getPlugin(MarkersPlugin);
          if (markersPlugin) {
            markersPlugin.removeMarker(this.pendingHotspot.id);
          }
          const index = this.uploadedImages[this.currentImageName].hotspots.findIndex(h => h.id === this.pendingHotspot.id);
          if (index !== -1) {
            this.uploadedImages[this.currentImageName].hotspots.splice(index, 1);
          }
          this.pendingHotspot = null;
        }
        this.linkModal.hide();
        this.targetImageName = '';
      },
    },
  };
  </script>

  <style scoped>
  .hotspot {
    width: 20px;
    height: 20px;
    background-color: red;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid white;
    box-sizing: border-box;
  }
  </style>