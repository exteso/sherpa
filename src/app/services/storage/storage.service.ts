import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
// import { finalize } from 'rxjs/operators';

import { Camera } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx';

import { cameraOptions } from '../../../environments/environment';

import { LoadingService } from '../loading/loading.service';
import { ToastService } from '../toast/toast.service';
import { TranslateProvider } from '../translate/translate.service';

import { Storage } from '@ionic/storage';
import { AngularFireStorage } from '@angular/fire/storage';
// import firebase from 'firebase';s

@Injectable({
  providedIn: 'root'
})

export class StorageService implements OnDestroy {
  profileURL: Promise<any>;

  constructor(
    public file: File,
    public storage: Storage,
    private loading: LoadingService,
    private toast: ToastService,
    private translate: TranslateProvider,
    private camera: Camera,
    private afStorage: AngularFireStorage,
  ) {}

  // Clean up the camera
  ngOnDestroy() {
    this.camera.cleanup();
  }

  public uploadByWeb (userId: string, event: any) {
    this.loading.showLoading('Uploading image...');

    const file = event.target.files[0];
    let fileName = file.name;
    // Append the date string to the file name to make each upload unique.
    fileName = this.appendDateString(fileName);

    const filePath = 'images/' + userId + '/' + fileName;
    const task = this.afStorage.upload(filePath, file);

    return new Promise((resolve, reject) => {
      task.then(snapshot => {
        this.profileURL = snapshot.ref.getDownloadURL();
        resolve(this.profileURL);
      }).catch(err => {
        console.log('Err 1: ', err);
        reject();
        this.toast.showToast(this.translate.get('storage.upload.error'));
      });
    });
  }

  // Upload an image file provided the userId, cameraOptions, and sourceType.
  public upload(userId: string, pictureSourceType: number): Promise<string> {

    return new Promise((resolve, reject) => {
      // Set sourceType
      cameraOptions.sourceType = pictureSourceType;
      // Get the image file from camera or photo gallery.
      this.camera.getPicture(cameraOptions).then(fileUri => {
        this.loading.showLoading('Uploading image...');

          // Convert URI to Blob
          this.uriToBlob(fileUri).then((blob: Blob) => {
            // Set fileName as the current Date so it will always be unique
            const fileName = Date.now() + '.jpg';
            const filePath = 'images/' + userId + '/' + fileName;

              this.afStorage.upload(filePath, blob).then((snapshot: firebase.storage.UploadTaskSnapshot) => {
                const refe = this.afStorage.storage.ref(filePath);

                refe.getDownloadURL().then((url: string) => {
                  this.loading.dismiss();
                  this.profileURL = snapshot.ref.getDownloadURL();
                  resolve(url);
                }).catch(err => {
                  this.loading.dismiss();
                  reject(err);
                  this.toast.showToast(this.translate.get('storage.upload.error'));
                });

              })
              .catch(err => {
                reject(err);
              });
          }).catch(err => {
            reject();
            this.toast.showToast(this.translate.get('storage.upload.error'));
          });
      });
    });
  }

  // Delete the uploaded file by the user, given the userId and URL of the file.
  public delete(userId: string, url: string): void {
    console.log(userId);
    console.log(url);
    // Get the fileName from the URL.
    const fileName = url.substring(url.lastIndexOf('%2F') + 3, url.lastIndexOf('?'));

    const filePath = 'images/' + userId + '/' + fileName;
    const fileRef = this.afStorage.ref(filePath);

    fileRef.delete();
    // // Check if file really exists on Firebase storage.
    // // this.afStorage.ref(filePath).delete();
    // this.afStorage.ref(filePath).child(userId).then(res => {
    //   res.child().delete();
    // });
  };

  // Convert fileURI to Blob
  private uriToBlob(fileURI): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.file
        .resolveLocalFilesystemUrl(fileURI)
        .then(fileEntry => {
          const { name, nativeURL } = fileEntry;
          const path = nativeURL.substring(0, nativeURL.lastIndexOf('/'));
          return this.file.readAsArrayBuffer(path, name);
        })
        .then((buffer: ArrayBuffer) => {
          let blob = new Blob([buffer], {
            type: 'image/jpeg'
          });
          resolve(blob);
        })
        .catch(err => {
          reject(err);
        });
    });
  }


  public set(name: string, value: string | boolean) {
    this.storage.set(name, value);
  }

  public get(name: string): Promise<any> | void {
    return new Promise((resolve, reject) => {
      this.storage.get(name).then((val) => {
        resolve(val);
      }).catch(err => {
        reject();
      });
    });
  }

  public keys(): Promise<any> | void {
    return new Promise((resolve, reject) => {
      this.storage.keys().then((val) => {
        resolve(val);
      }).catch(err => {
        reject();
      });
    });
  }

  public remove(name: string): Promise<any> | void {
    return new Promise((resolve, reject) => {
      this.storage.remove(name).then((val) => {
        resolve(val);
      }).catch(err => {
        reject();
      });
    });
  }

  // Append the current date as string to the file name.
  private appendDateString(fileName: string): string {
    const name = fileName.substr(0, fileName.lastIndexOf('.')) + '_' + Date.now();
    const extension = fileName.substr(fileName.lastIndexOf('.'), fileName.length);
    return name + '' + extension;
  }

}

