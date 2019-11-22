import {Component, OnDestroy, OnInit} from '@angular/core';
import {ArtistService} from '../../../services/artist.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {Progress} from '../../../models/progress';
import {HttpEvent, HttpEventType} from '@angular/common/http';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'app-create-artist',
  templateUrl: './create-artist.component.html',
  styleUrls: ['./create-artist.component.scss']
})
export class CreateArtistComponent implements OnInit, OnDestroy {

  constructor(private artistService: ArtistService, private fb: FormBuilder, private router: Router) {
  }

  submitted = false;
  isImageFileChosen = false;
  imageFileName = '';
  message: string;
  artistUploadForm: FormGroup;
  formData = new FormData();
  file: any;
  subscription: Subscription = new Subscription();
  error = false;
  progress: Progress = {value: 0};
  loading: boolean;

  ngOnInit() {
    this.artistUploadForm = this.fb.group({
      name: ['', [Validators.required, Validators.min(4)]],
      birthDate: ['', Validators.required],
      biography: ['', Validators.required]
    });
  }

  selectFile(event) {
    if (event.target.files.length > 0) {
      this.file = event.target.files[0];
      this.isImageFileChosen = true;
      this.imageFileName = event.target.files[0].name;
    }
  }

  displayProgress(event, progress: Progress): boolean {
    switch (event.type) {
      case HttpEventType.Sent:
        console.log('Request has been made!');
        break;
      case HttpEventType.ResponseHeader:
        console.log('Response header has been received!');
        break;
      case HttpEventType.UploadProgress:
        progress.value = Math.round(event.loaded / event.total * 100);
        console.log(`Uploaded! ${progress.value}%`);
        break;
      case HttpEventType.Response:
        console.log('Song successfully created!', event.body);
        const complete = setTimeout(() => {
          progress.value = 0;
          const navigation = setInterval(() => {
            this.navigate();
            clearTimeout(navigation);
            clearTimeout(complete);
          }, 2000);
        }, 500);
        return true;
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.artistUploadForm.valid) {
      this.formData.append('artist', new Blob([JSON.stringify(this.artistUploadForm.value)], {type: 'application/json'}));
      this.formData.append('avatar', this.file);
      this.loading = true;
      this.subscription.add(this.artistService.uploadArtist(this.formData)
        .pipe(finalize(() => {
          this.loading = false;
        }))
        .subscribe(
        (event: HttpEvent<any>) => {
          if (this.displayProgress(event, this.progress)) {
            this.error = false;
            this.message = 'Artist added successfully!';
          }
        }, error => {
          this.error = true;
          this.message = 'Failed to add artist.';
          console.log(error.message);
        }
      ));
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  navigate() {
    location.replace('/admin/artist-management');
  }
}