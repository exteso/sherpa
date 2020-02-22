import { CameraOptions } from '@ionic-native/camera/ngx';

export const environment = {
  production: false,
  config: {
    // iconMode: 'md',
    // mode: 'md'
    // iconMode: 'ios',
    // mode: 'ios'
    // preloadModules: true,
    // scrollPadding: false,
    // scrollAssist: true,
    autoFocusAssist: false,
    menuType: 'overlay'
  },
  // Set language to use.
  language: 'it',
  // Firebase Cloud Messaging Server Key.
  // Get your gcmKey on https://console.firebase.google.com, under Overview -> Project Settings -> Cloud Messaging.
  // This is needed to send push notifications.
  gcmKey: 'AAAAem7bVZo:APA91bFfrNXYY0Dy3dAd9wwQrPkP0JA86i3Jb0zx8GJfRpujvPTmqEHjUODifMw38ubEApgevQC247yTiZjUxS8kzCLzff4sSWK6Rfz1RnrbzBUuMa5gm0gO9gI7s8XEPDfF0_SAAE04',
  // Set to your Firebase app, you can find your credentials on Firebase app console -> Add Web App.
  firebase: {
    apiKey: "AIzaSyCm5U5RRcym0YJBkPgjTDCexMvYc0u6IOM",
    authDomain: "sherpa.firebaseapp.com",
    databaseURL: "https://sherpa.firebaseio.com",
    projectId: "sherpa-30d3a",
    storageBucket: "sherpa-30d3a.appspot.com",
    messagingSenderId: "675870338903",
    //appId: "1:525845878170:web:2d6516700d76414d74d623"
  },
  
  // You can find your googleWebClientId on your Firebase app console -> Authentication -> Sign-in Method -> Google -> Web client ID
  googleWebClientId: '525845878170-4nkapa764tg54c7ub4dqeroj56dumukk.apps.googleusercontent.com',
  // Google Maps JavaScript API Key
  googleMapsKey: 'AIzaSyDAkoBPbA3hIQc0ghhGOBWHVf6hr2oC3tI',
  // Loading Configuration.
  // Please refer to the official Loading documentation here: https://ionicframework.com/docs/api/components/loading/LoadingController/
  loading: {
    spinner: 'circles',
    duration: 3000
  },
  // Toast Configuration.
  // Please refer to the official Toast documentation here: https://ionicframework.com/docs/api/components/toast/ToastController/
  toast: {
    position: 'bottom',
    duration: 3000
  },
  agmStyles: [
    {
      elementType: 'geometry',
      stylers: [
        {
          color: '#1d2c4d'
        }
      ]
    },
    {
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#8ec3b9'
        }
      ]
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [
        {
          color: '#1a3646'
        }
      ]
    },
    {
      featureType: 'administrative.country',
      elementType: 'geometry.stroke',
      stylers: [
        {
          color: '#4b6878'
        }
      ]
    },
    {
      featureType: 'administrative.land_parcel',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#64779e'
        }
      ]
    },
    {
      featureType: 'administrative.province',
      elementType: 'geometry.stroke',
      stylers: [
        {
          color: '#4b6878'
        }
      ]
    },
    {
      featureType: 'landscape.man_made',
      elementType: 'geometry.stroke',
      stylers: [
        {
          color: '#334e87'
        }
      ]
    },
    {
      featureType: 'landscape.natural',
      elementType: 'geometry',
      stylers: [
        {
          color: '#023e58'
        }
      ]
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [
        {
          color: '#283d6a'
        }
      ]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#6f9ba5'
        }
      ]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.stroke',
      stylers: [
        {
          color: '#1d2c4d'
        }
      ]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry.fill',
      stylers: [
        {
          color: '#023e58'
        }
      ]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#3C7680'
        }
      ]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [
        {
          color: '#304a7d'
        }
      ]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#98a5be'
        }
      ]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.stroke',
      stylers: [
        {
          color: '#1d2c4d'
        }
      ]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [
        {
          color: '#2c6675'
        }
      ]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [
        {
          color: '#255763'
        }
      ]
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#b0d5ce'
        }
      ]
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.stroke',
      stylers: [
        {
          color: '#023e58'
        }
      ]
    },
    {
      featureType: 'transit',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#98a5be'
        }
      ]
    },
    {
      featureType: 'transit',
      elementType: 'labels.text.stroke',
      stylers: [
        {
          color: '#1d2c4d'
        }
      ]
    },
    {
      featureType: 'transit.line',
      elementType: 'geometry.fill',
      stylers: [
        {
          color: '#283d6a'
        }
      ]
    },
    {
      featureType: 'transit.station',
      elementType: 'geometry',
      stylers: [
        {
          color: '#3a4762'
        }
      ]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [
        {
          color: '#0e1626'
        }
      ]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#4e6d70'
        }
      ]
    }
  ]
  // //
};

// Camera Configuration
// Please refer to the official Cordova Plugin Camera docs at: https://github.com/apache/cordova-plugin-camera#module_camera.CameraOptions
export const cameraOptions: CameraOptions = {
  allowEdit: true,
  correctOrientation: true,
  // DATA_URL : 0,   Return image as base64-encoded string (DATA_URL can be very memory intensive and cause app crashes or out of memory errors. Use FILE_URI or NATIVE_URI if possible),
  // FILE_URI : 1,   Return image file URI,
  // NATIVE_URI : 2  Return image native URI
  destinationType: 1,
  // JPEG = 0,
  // PNG = 1
  encodingType: 0,
  // PICTURE = 0,
  // VIDEO = 1,
  // ALLMEDIA = 2
  mediaType: 0,
  quality: 25,
  targetHeight: 512,
  targetWidth: 512
};
